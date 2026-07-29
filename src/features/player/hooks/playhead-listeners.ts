/**
 * The playhead listener registry.
 *
 * This lives apart from `use-playhead` so the player store can push a position
 * (after a seek) without importing the hook module — the hook imports the
 * store, so the reverse import would be a cycle.
 *
 * Subscribers update the DOM imperatively, which is why this is a plain Set
 * rather than React state: playback notifies at ~60fps and must never cause a
 * re-render.
 */

export type TimeListener = (currentTime: number) => void;

const listeners = new Set<TimeListener>();

/** Subscribe to playhead time updates. Returns an unsubscribe function. */
export function subscribeToPlayhead(listener: TimeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Push a position to every subscriber. */
export function emitPlayhead(currentTime: number): void {
  for (const listener of listeners) listener(currentTime);
}
