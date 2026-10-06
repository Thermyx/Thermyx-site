import { create } from "zustand";
import { TEAM } from "../../data/team.js";

// The Team page's star: five crystal cards at the points of a pentagram that turns slowly, and
// turns further as the page scrolls. The cards are drawn in the shared 3D scene (TeamStar.jsx);
// the page lays an invisible button over each one (TeamPage.jsx) for the pointer, the keyboard,
// and screen readers. A shuffle sends every card along the star's lines to a new point.

export const STAR = {
  cardWidth: 0.52, // card width as a share of the star's radius (never over 0.69, or turning cards touch)
  narrowCardWidth: 0.66, // the same on narrow screens, where the star is as wide as the screen allows
  cardAspect: 0.72, // width / height, a playing card's
  maxRadius: 440, // px
  narrowStretch: 1.16, // on narrow screens the star may run this much wider than the screen
  spin: (Math.PI * 2) / 150, // the idle turn, rad/s (once around in two and a half minutes)
  scrollTurn: 0.0018, // rad of turn per px scrolled
  moveBase: 0.45, // s, plus `stepTime` per line travelled, for a card's trip on a shuffle
  stepTime: 0.5,
  stagger: 0.07, // s between cards setting off
};

// Seconds for a picked card to fly from the star to the dialog, or back.
export const DRAW_TIME = 0.8;

// A pentagram is drawn point to point, skipping one: 0 → 2 → 4 → 1 → 3 → 0, with the points
// numbered clockwise from the top. Line i joins STROKE[i] and STROKE[i + 1].
export const STROKE = [0, 2, 4, 1, 3];
export const POINT_ANGLES = [0, 1, 2, 3, 4].map((k) => -Math.PI / 2 + (k * Math.PI * 2) / 5);

// The star for a field of this size (px): its radius, and the cards' size. The turning star,
// cards included, fits the field (on narrow screens, it may run a little past the sides).
export function starLayout(width, height) {
  const narrow = width < 600;
  const share = narrow ? STAR.narrowCardWidth : STAR.cardWidth;
  const stretch = narrow ? STAR.narrowStretch : 1;
  const tall = share / STAR.cardAspect;
  const radius = Math.max(0, Math.min(STAR.maxRadius, height / (2 + tall), (width * stretch) / (2 + share)));
  const cardW = radius * share;
  return { radius, cardW, cardH: cardW / STAR.cardAspect };
}

// Shared state, outside React render:
//   active  the Team page is mounted (the scene draws the star only then)
//   slots   the person at each point, clockwise from the top
//   hover   the card under the pointer or focus
//   drawn   the card open in the dialog (hidden from the star meanwhile)
//   moves   while a shuffle plays, each card's trip: { path, edges, dir, start, duration, lane }
export const useStar = create(() => ({
  active: false,
  slots: TEAM.map((person) => person.id),
  hover: null,
  drawn: null,
  moves: null,
}));

// The page's DOM nodes the scene reads or moves every frame: the star's field and the cards'
// buttons, and while a card is open, the dialog's card spot and its backdrop (whose window the
// scene keeps over the crystal).
export const starDom = { field: null, cards: new Map(), spot: null, backdrop: null };

// Deal the cards to new points, every one of them somewhere new. Each travels along the star's
// lines the shorter way round (one line or two), starting at `now` (seconds, performance.now()).
// `instant` skips the trip (reduced motion, or no 3D).
export function shuffleStar(now, instant) {
  const { slots } = useStar.getState();
  const next = derange(slots);
  if (instant) {
    useStar.setState({ slots: next, moves: null });
    return;
  }
  const moves = {};
  slots.forEach((id, lane) => {
    const from = STROKE.indexOf(lane);
    const to = STROKE.indexOf(next.indexOf(id));
    const ahead = (to - from + 5) % 5;
    const dir = ahead <= 2 ? 1 : -1;
    const steps = dir === 1 ? ahead : 5 - ahead;
    const path = [];
    const edges = [];
    for (let s = 0; s <= steps; s++) path.push(STROKE[(from + dir * s + 5) % 5]);
    for (let s = 0; s < steps; s++) edges.push(dir === 1 ? (from + s) % 5 : (from - s - 1 + 5) % 5);
    moves[id] = {
      path,
      edges,
      dir,
      lane,
      start: now + lane * STAR.stagger,
      duration: STAR.moveBase + steps * STAR.stepTime,
    };
  });
  useStar.setState({ slots: next, moves });
}

// A random order in which nothing stays where it was.
function derange(list) {
  let next;
  do {
    next = [...list];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
  } while (next.some((id, i) => id === list[i]));
  return next;
}
