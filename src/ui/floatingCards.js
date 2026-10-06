import { create } from "zustand";

export const WIDTH = 380;
export const MARGIN = 16;
export const TOP = 92; // clear of the header

// Draggable cards that float over the page, like the part cards on the home page: open one per
// item beside what was clicked, any number at once; clicking a card brings it to the front, Esc
// closes the front one. Positions are fixed to the window.
export const useFloatingCards = create((set, get) => ({
  cards: [], // { key, item, x, y, z, from }
  top: 1,
  // `from`: the element that opened it (placed beside it; focus returns to it on close).
  open(item, from) {
    const existing = get().cards.find((card) => card.key === item.id);
    if (existing) return get().raise(item.id);
    const { x, y } = placeBeside(from?.getBoundingClientRect(), get().cards.length);
    const z = get().top + 1;
    set({ cards: [...get().cards, { key: item.id, item, x, y, z, from }], top: z });
  },
  raise(key) {
    const z = get().top + 1;
    set({ cards: get().cards.map((card) => (card.key === key ? { ...card, z } : card)), top: z });
  },
  move(key, x, y) {
    set({ cards: get().cards.map((card) => (card.key === key ? { ...card, x, y } : card)) });
  },
  close(key) {
    const card = get().cards.find((c) => c.key === key);
    set({ cards: get().cards.filter((c) => c.key !== key) });
    if (card?.from?.isConnected) card.from.focus({ preventScroll: true });
  },
  closeAll() {
    set({ cards: [] });
  },
}));

// Beside the anchor (right, else left), at its top, nudged down for each card already open.
function placeBeside(anchor, openCount) {
  const width = Math.min(WIDTH, window.innerWidth - MARGIN * 2);
  const nudge = (openCount % 5) * 22;
  if (!anchor) return { x: (window.innerWidth - width) / 2, y: TOP + 40 + nudge };
  let x = anchor.right + 14;
  if (x + width > window.innerWidth - MARGIN) x = anchor.left - 14 - width;
  if (x < MARGIN) x = (window.innerWidth - width) / 2;
  const y = clamp(anchor.top + nudge, TOP, window.innerHeight - 320);
  return { x: clamp(x, MARGIN, window.innerWidth - width - MARGIN), y: Math.max(TOP, y) };
}

export function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}
