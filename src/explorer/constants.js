import { ACESFilmicToneMapping, Color, SRGBColorSpace } from "three";

// Exported from Fusion by ExportGLB.py; validate with `npm run check:model`.
export const MODEL_URL = "/hardware-model.glb";

// Scene background (--bg, black). Transmission samples the scene background, so it must be
// opaque (§3.3); the Topography lines are drawn over it inside the scene, so the glass refracts them.
export const BG = "#000000";

// The whole assembly (both products) is scaled so its bounding-box diagonal is this many units (§3.7).
export const NORMALIZED_SIZE = 1.5;

// Opaque housings that hide internals; they go ghosted in x-ray mode (§3.5). Prefixes of sanitized names.
export const ENCLOSURE_PREFIXES = ["Enclosure_Base", "Enclosure_Lid", "External_Compartment_Shell", "Battery_Bay_Lid"];

// Heat-path parts glow ember (--ember); everything else glows ice (--ice).
export const HEAT_PATH_PREFIXES = ["Temperature_Sensor_-_Peltier_Hot_Side", "Heat_Sink_", "Cooling_Fan_"];
export const ACCENT = { cool: new Color("#5bd2ff"), hot: new Color("#ff6a13") };
export const ACCENT_CSS = { cool: "var(--ice)", hot: "var(--ember)" };

// X-ray and highlight look. Opacities are for the ghosted shells (§3.4) and dimmed internals.
export const XRAY = {
  glassOpacity: 0.12,
  enclosureOpacity: 0.2,
  activeShellOpacity: 0.36,
  enterOpacity: 0.5, // shells start here when x-ray turns on, then settle (reads as glass "clearing")
  dimOpacity: 0.22,
  chapterDimOpacity: 0.42, // the parts a chapter isn't about, while it is on screen
};
// The active part's base color is pulled `tint` of the way toward its accent (so a red sensor
// reads blue, not magenta), plus an emissive glow and accent edges.
export const HIGHLIGHT = { tint: 0.7, emissiveIntensity: 0.45, edgeWidth: 1.75 };

// Damping rates (1/s) for highlight and x-ray transitions: enter settles in ~210 ms, exit in
// ~140 ms, so exits run faster than entries.
export const DAMPING = { enter: 14, exit: 22 };

// The home stage's scroll path, in screen heights of scroll ("units"). The hero holds the copy on
// the left for `heroLength`; then the chapters play on the left, each over an equal share of the
// rest of `scrubLength`, while the model turns on the right and comes apart (fully apart by
// `explodeShare` of the scrub). Fully exploded, the model slides to the middle over
// `centerLength` and holds for `playLength` to be explored, then scrolls away with the page.
export const STAGE = { heroLength: 0.5, scrubLength: 5, explodeShare: 0.7, centerLength: 0.4, playLength: 1.6 };

// Camera along that path: [yaw, pitch] in radians. The hero is a low three-quarter view; the
// camera sweeps `turns` full turns plus the difference to `exploded`, the heel-side view where
// the two exploded stacks stand side by side. The model is framed in the space the stage copy
// leaves free (data-view-inset). Margins are the share of the half-viewport the model may fill.
// Rates are exponential damping (1/s).
export const CAMERA_PATH = {
  hero: { angles: [0.55, 0.3], margin: 0.9 },
  exploded: { angles: [1.15, 0.5], margin: 0.86 },
  turns: 1,
  scrollRate: 9, // follows the scrollbar closely (~330 ms to settle)
  playRate: 6, // drag-orbit eases in ~500 ms
  introRate: 2.4, // the first arrival: a slow dolly-in over ~1.5 s
  intro: { yaw: -1.1, distance: 1.7 }, // where the arrival starts, relative to the hero view
  idle: { yaw: 0.09, rate: 0.32 }, // the hero's slow sway (rad, rad/s)
  parallax: { yaw: 0.22, pitch: 0.1 }, // pointer parallax before exploring (rad at the window edge)
  dragSpeed: 0.006, // rad per px
  pitchMin: 0.05,
  pitchMax: 1.4,
};

// Explode motion: a slightly underdamped spring (damping ratio ≈ 0.77) that settles in ~400 ms.
// Unit mass; stiffness in 1/s², damping in 1/s.
export const EXPLODE_SPRING = { stiffness: 170, damping: 20 };

// Faint outlines so the clear glass shells keep their silhouette against the dark background.
export const GLASS_EDGES = { thresholdAngle: 35, color: 0x9fb0d0, opacity: 0.18 };

// Renderer and camera settings are module-level constants so R3F never sees a new object per render (§3.10).
export const GL = {
  antialias: true,
  powerPreference: "high-performance",
  outputColorSpace: SRGBColorSpace,
  toneMapping: ACESFilmicToneMapping,
  toneMappingExposure: 0.9,
};
export const DPR = [1, 2];
export const CAMERA = { fov: 35, near: 0.01, far: 100, position: [0, 0, 3] };
