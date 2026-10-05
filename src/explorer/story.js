import { create } from "zustand";

// Live state of the home stage, written by the stage's scroll tracking and read by the scene every
// frame (never React state). All lengths are in "units", screen heights of scroll (see STAGE).
//   units      how far the stage has scrolled
//   heroBlend  0 → 1 as the hero copy hands over to the chapters
//   progress   0 → 1 across the turn-and-explode scrub
//   explode    the explode amount it implies
//   center     0 → 1 as the fully exploded model slides to the middle for exploring
//   shift      px the pinned stage has scrolled up once its section ends (the fixed canvas
//              moves the model up by the same amount, so it leaves with the page)
//   visible    whether the stage is mounted and any of it is on screen
//   session    bumps each time the stage mounts (the model makes its entrance again)
//   insets     per copy group ("hero", "chapters", "play"), how much of the screen it covers, per
//              edge (CSS px); the model is framed in the rest
const none = () => ({ left: 0, right: 0, top: 0, bottom: 0 });
export const stageScroll = {
  units: 0,
  heroBlend: 0,
  progress: 0,
  explode: 0,
  center: 0,
  shift: 0,
  visible: false,
  session: 0,
  insets: { hero: none(), chapters: none(), play: none() },
};

// The discrete stage state the DOM cares about; changes a handful of times per scroll-through.
//   mode:    "hero" at the top, "scrub" while turning and coming apart, "play" fully exploded
//   chapter: index into CHAPTERS from the end of the hero on, -1 before
export const useStage = create(() => ({ mode: "hero", chapter: -1 }));

// Model loading, reported by the scene for the stage's loading and error states.
//   status: "loading" | "ready" | "error" (retryable) | "unsupported" (no WebGL)
//   attempt: bumps on retry, remounting the scene's model boundary
export const useModel = create(() => ({ status: "loading", attempt: 0 }));
