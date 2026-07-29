/**
 * Waveform peak extraction for audio-only sources.
 *
 * An audio file has no picture, so the practice surface draws the shape of the
 * whole recording instead. Seeing the shape is not decoration: a phrase's
 * attack and decay are visible, which makes placing the A and B markers a
 * visual act rather than a guessing game.
 *
 * The expensive part (decoding) happens once per file. We keep only a small
 * fixed-size array of peaks, never the decoded PCM — a five-minute stereo track
 * decodes to ~100 MB of Float32 samples, which is far too much to hold just to
 * draw a few hundred bars.
 */

/**
 * How many buckets the waveform is reduced to.
 *
 * Kept deliberately low: at ~900px wide this gives a ~4px bar with a visible
 * gap. Denser bars merge into a solid block and stop reading as a waveform at
 * all, which defeats the purpose of drawing one.
 */
export const WAVEFORM_BUCKETS = 180;

/**
 * Reduce raw mono samples to `bucketCount` peak values in 0..1.
 *
 * Each bucket keeps the maximum absolute amplitude in its slice rather than the
 * mean: means wash out transients, and for a practice tool the transients (a
 * pick attack, a consonant) are exactly the landmarks a musician navigates by.
 *
 * Pure and synchronous so it can be unit-tested without an AudioContext.
 */
export function computePeaks(
  samples: Float32Array,
  bucketCount: number = WAVEFORM_BUCKETS,
): Float32Array {
  const peaks = new Float32Array(bucketCount);
  if (samples.length === 0 || bucketCount <= 0) return peaks;

  const bucketSize = samples.length / bucketCount;

  for (let i = 0; i < bucketCount; i += 1) {
    const start = Math.floor(i * bucketSize);
    const end = Math.min(Math.floor((i + 1) * bucketSize), samples.length);
    let max = 0;
    // A bucket can be empty when there are fewer samples than buckets; leaving
    // it at 0 is correct and keeps the loop branch-free.
    for (let j = start; j < end; j += 1) {
      const value = samples[j] ?? 0;
      const abs = value < 0 ? -value : value;
      if (abs > max) max = abs;
    }
    peaks[i] = max;
  }

  return peaks;
}

/**
 * Scale peaks so the loudest point reaches 1.
 *
 * Quiet recordings would otherwise render as a nearly flat line. Normalizing
 * costs nothing and makes a quietly-recorded practice take as legible as a
 * mastered track.
 */
export function normalizePeaks(peaks: Float32Array): Float32Array {
  let max = 0;
  for (let i = 0; i < peaks.length; i += 1) {
    const value = peaks[i] ?? 0;
    if (value > max) max = value;
  }
  // Silence, or near-silence: leave it flat rather than amplifying noise to
  // full scale, which would be a lie about the content.
  if (max <= 0.0001) return peaks;

  const scaled = new Float32Array(peaks.length);
  for (let i = 0; i < peaks.length; i += 1) {
    scaled[i] = (peaks[i] ?? 0) / max;
  }
  return scaled;
}

/**
 * Mix an AudioBuffer's channels down to mono.
 *
 * Averaging rather than taking channel 0 matters for recordings where an
 * instrument is panned hard — taking only the left channel can make a
 * hard-right guitar look like silence.
 */
export function mixToMono(buffer: {
  numberOfChannels: number;
  length: number;
  getChannelData(channel: number): Float32Array;
}): Float32Array {
  const channels = buffer.numberOfChannels;
  if (channels === 0) return new Float32Array(0);
  if (channels === 1) return buffer.getChannelData(0);

  const mono = new Float32Array(buffer.length);
  for (let c = 0; c < channels; c += 1) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < mono.length; i += 1) {
      mono[i] = (mono[i] ?? 0) + (data[i] ?? 0) / channels;
    }
  }
  return mono;
}

/**
 * Decode a file and return its normalized peaks.
 *
 * Returns `null` rather than throwing when decoding fails — an unsupported
 * codec should degrade to "no waveform", never break playback, since the
 * `<audio>` element may still play a format `decodeAudioData` refuses.
 */
export async function extractPeaks(
  file: File,
  bucketCount: number = WAVEFORM_BUCKETS,
): Promise<Float32Array | null> {
  const Ctor =
    typeof window !== "undefined"
      ? (window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext)
      : undefined;
  if (!Ctor) return null;

  let context: AudioContext | null = null;
  try {
    const bytes = await file.arrayBuffer();
    context = new Ctor();
    const buffer = await context.decodeAudioData(bytes);
    return normalizePeaks(computePeaks(mixToMono(buffer), bucketCount));
  } catch {
    return null;
  } finally {
    // Chrome caps concurrent AudioContexts; leaking one per file would break
    // the visualizer after a handful of uploads in a single session.
    void context?.close().catch(() => undefined);
  }
}
