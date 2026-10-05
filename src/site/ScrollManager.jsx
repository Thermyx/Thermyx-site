import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Scroll on navigation: a new page starts at the top, and a link with a hash (Join waitlist)
// scrolls to its section, waiting a few frames for it to mount. Back/forward is left to the
// browser's own scroll restoration.
export default function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP") return;
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    let frame = 0;
    let tries = 0;
    const seek = () => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      else if (tries++ < 30) frame = requestAnimationFrame(seek);
    };
    seek();
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, key, navigationType]);

  return null;
}
