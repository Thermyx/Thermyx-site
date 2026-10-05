import GlowCursor from "../components/GlowCursor.jsx";
import { useMediaQuery } from "../lib/useMediaQuery.js";
import { useReducedMotion } from "../lib/useReducedMotion.js";

// React Bits' GlowCursor over the whole site: a fixed, pointer-transparent layer that follows the
// mouse anywhere on any page (patched to track the window, since nothing can sit on top of the
// page to receive the pointer for it). Screen-blended, so it only ever adds light. Mouse and pen
// only, and off under reduced motion.
export default function SiteGlow() {
  const finePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = useReducedMotion();
  if (!finePointer || reducedMotion) return null;
  return (
    <GlowCursor
      trackWindow
      className="site-glow"
      aria-hidden="true"
      color="#5BD2FF"
      secondaryColor="#FF6A13"
      trailLength={34}
      trailWidth={5}
      glowIntensity={1.5}
      glowSpread={1.1}
      brightness={1.15}
      maxDevicePixelRatio={1}
    />
  );
}
