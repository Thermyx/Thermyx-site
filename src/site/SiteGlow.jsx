import GlowCursor from "../components/GlowCursor.jsx";
import { useMediaQuery } from "../lib/useMediaQuery.js";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import { usePageTheme } from "./theme.js";

// React Bits' GlowCursor over the whole site: a fixed, pointer-transparent layer that follows the
// mouse anywhere on any page (patched to track the window, since nothing can sit on top of the
// page to receive the pointer for it). On dark pages it is screen-blended, so it only ever adds
// light; on cream it is drawn as color (signal blue into ember), with a smaller white core. Mouse
// and pen only, and off under reduced motion.
export default function SiteGlow() {
  const finePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = useReducedMotion();
  const cream = usePageTheme() === "cream";
  if (!finePointer || reducedMotion) return null;
  return (
    <GlowCursor
      trackWindow
      className="site-glow"
      aria-hidden="true"
      color={cream ? "#eee9e0" : "#5BD2FF"}
      secondaryColor="#FF6A13"
      trailLength={34}
      trailWidth={5}
      glowIntensity={cream ? 1.1 : 1.5}
      glowSpread={1.1}
      hotspot={cream ? 0.15 : 0.65}
      brightness={1.15}
      blendMode={cream ? "normal" : "screen"}
      maxDevicePixelRatio={1}
    />
  );
}
