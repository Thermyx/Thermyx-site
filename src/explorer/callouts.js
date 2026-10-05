import { create } from "zustand";

// Part callouts: hovering a part (fully exploded) shows its card; clicking pins it, and any number
// can be pinned. Clicking a pinned part again unpins it; Esc unpins all. Ids are manifest `match`
// prefixes. React re-renders only when the set of cards changes.
export const useCallouts = create((set, get) => ({
  hovered: null,
  pinned: [],

  hover: (id) => {
    if (get().hovered !== id) set({ hovered: id });
  },
  toggle: (id) => {
    const { pinned } = get();
    if (pinned.includes(id)) {
      calloutPositions.delete(id); // a re-pinned card is placed fresh
      set({ pinned: pinned.filter((p) => p !== id) });
    } else {
      set({ pinned: [...pinned, id] });
    }
  },
  clear: () => {
    const { pinned, hovered } = get();
    if (!pinned.length && hovered === null) return;
    calloutPositions.clear();
    set({ pinned: [], hovered: null });
  },
}));

// Cards on screen: every pinned part, plus the hovered one if it isn't pinned.
export const selectVisible = (s) => (s.hovered !== null && !s.pinned.includes(s.hovered) ? [...s.pinned, s.hovered] : s.pinned);

// Card positions (top-left, stage px), kept outside React so dragging never re-renders.
// Missing until the tracker first places a card next to its part.
export const calloutPositions = new Map();

// Live DOM nodes for each card, registered by the overlay and moved by the in-canvas tracker
// every frame (the leader line follows the part as the model turns).
export const calloutElements = new Map();

const MARGIN = 14; // cards stay this far inside the stage
const TOP_CLEARANCE = 96; // and clear of the fixed header

// Keeps a card position (with its w/h) inside the stage.
export function clampInto(pos, size) {
  pos.x = Math.min(Math.max(pos.x, MARGIN), Math.max(MARGIN, size.width - pos.w - MARGIN));
  pos.y = Math.min(Math.max(pos.y, TOP_CLEARANCE), Math.max(TOP_CLEARANCE, size.height - pos.h - MARGIN));
  return pos;
}
