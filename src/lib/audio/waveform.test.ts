import { describe, expect, it } from "vitest";
import {
  computePeaks,
  mixToMono,
  normalizePeaks,
  WAVEFORM_BUCKETS,
} from "./waveform";

describe("computePeaks", () => {
  it("reduces samples to the requested bucket count", () => {
    const samples = new Float32Array(1000).fill(0.5);
    expect(computePeaks(samples, 10)).toHaveLength(10);
  });

  it("defaults to WAVEFORM_BUCKETS", () => {
    expect(computePeaks(new Float32Array(10_000))).toHaveLength(
      WAVEFORM_BUCKETS,
    );
  });

  it("keeps the peak of each bucket, not the mean", () => {
    // One loud sample among quiet ones must survive — transients are the
    // landmarks a musician navigates by.
    const samples = new Float32Array(100).fill(0.01);
    samples[50] = 0.9;
    const peaks = computePeaks(samples, 10);
    expect(peaks[5]).toBeCloseTo(0.9);
    expect(peaks[0]).toBeCloseTo(0.01);
  });

  it("treats negative swings as equal in magnitude", () => {
    const samples = new Float32Array(10).fill(-0.7);
    expect(computePeaks(samples, 2)[0]).toBeCloseTo(0.7);
  });

  it("returns zeros for empty input rather than throwing", () => {
    const peaks = computePeaks(new Float32Array(0), 5);
    expect(peaks).toHaveLength(5);
    expect(Array.from(peaks)).toEqual([0, 0, 0, 0, 0]);
  });

  it("handles fewer samples than buckets", () => {
    const peaks = computePeaks(new Float32Array([1, 1]), 8);
    expect(peaks).toHaveLength(8);
    expect(Number.isFinite(peaks[7])).toBe(true);
  });

  it("returns an empty array for a non-positive bucket count", () => {
    expect(computePeaks(new Float32Array([1]), 0)).toHaveLength(0);
  });
});

describe("normalizePeaks", () => {
  it("scales the loudest peak to 1", () => {
    const out = normalizePeaks(new Float32Array([0.1, 0.25, 0.05]));
    expect(out[1]).toBeCloseTo(1);
    expect(out[0]).toBeCloseTo(0.4);
  });

  it("leaves near-silence flat instead of amplifying noise", () => {
    const quiet = new Float32Array([0.00001, 0.00002]);
    expect(Array.from(normalizePeaks(quiet))).toEqual(Array.from(quiet));
  });

  it("is a no-op on already-normalized input", () => {
    const out = normalizePeaks(new Float32Array([1, 0.5]));
    expect(out[0]).toBeCloseTo(1);
    expect(out[1]).toBeCloseTo(0.5);
  });
});

describe("mixToMono", () => {
  const bufferOf = (channels: number[][]) => ({
    numberOfChannels: channels.length,
    length: channels[0]?.length ?? 0,
    getChannelData: (c: number) => new Float32Array(channels[c] ?? []),
  });

  it("returns the single channel unchanged for mono", () => {
    expect(Array.from(mixToMono(bufferOf([[0.5, -0.5]])))).toEqual([0.5, -0.5]);
  });

  it("averages stereo channels", () => {
    const mono = mixToMono(bufferOf([[1, 0], [0, 1]]));
    expect(mono[0]).toBeCloseTo(0.5);
    expect(mono[1]).toBeCloseTo(0.5);
  });

  it("keeps a hard-panned instrument visible", () => {
    // Taking only channel 0 would render this as silence.
    const mono = mixToMono(bufferOf([[0, 0], [0.8, 0.8]]));
    expect(mono[0]).toBeGreaterThan(0);
  });

  it("returns empty for a buffer with no channels", () => {
    expect(mixToMono(bufferOf([]))).toHaveLength(0);
  });
});
