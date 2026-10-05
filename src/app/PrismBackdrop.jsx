import { useEffect, useState } from "react";
import Prism from "../components/Prism.jsx";
import { useReducedMotion } from "../lib/useReducedMotion.js";

// React Bits' Prism as the app page's background: fixed behind the page, drawn in its light mode
// (light on white) and multiplied onto the cream, so white becomes cream and the light becomes
// tinted glass. Patched to keep to the brand's blue and orange and to render at reduced
// resolution (it is a soft glow, and it raymarches every pixel). On wide screens it sits behind
// the phone; under reduced motion it holds still.
const PALETTE = ["#2C9CF0", "#FF6A13"];

export default function PrismBackdrop() {
  const reducedMotion = useReducedMotion();
  const offsetX = usePrismOffset();
  return (
    <div className="app-prism" aria-hidden="true">
      <Prism
        lightMode
        palette={PALETTE}
        animationType="rotate"
        timeScale={reducedMotion ? 0 : 0.22}
        height={3.4}
        baseWidth={5.4}
        scale={3.1}
        glow={0.85}
        bloom={1}
        noise={0}
        offset={{ x: offsetX, y: 0 }}
        maxDpr={0.6}
        suspendWhenOffscreen
      />
    </div>
  );
}

// Behind the phone column on wide screens (a quarter of the window right of center), centered on
// narrow ones. Changes only across the breakpoint or a resize, which rebuilds the prism.
function usePrismOffset() {
  const read = () => (typeof window === "undefined" || window.innerWidth < 900 ? 0 : Math.round(window.innerWidth * 0.24));
  const [offset, setOffset] = useState(read);
  useEffect(() => {
    let timer = 0;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setOffset(read()), 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return offset;
}
