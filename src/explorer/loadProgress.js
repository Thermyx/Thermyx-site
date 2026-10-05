// Byte-level download progress for the model, readable from DOM components outside the Canvas
// via useSyncExternalStore. Updates only on XHR progress events, never per frame.
let snapshot = { loaded: 0, total: 0 };
const listeners = new Set();

export const loadProgress = {
  report(event) {
    snapshot = { loaded: event.loaded, total: event.lengthComputable ? event.total : 0 };
    listeners.forEach((notify) => notify());
  },
  reset() {
    snapshot = { loaded: 0, total: 0 };
    listeners.forEach((notify) => notify());
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
};
