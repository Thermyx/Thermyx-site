// The pointer's last position over the window, normalized: x 0 (left) to 1 (right), y 0 (bottom)
// to 1 (top), plus whether a mouse or pen is over the page. One passive listener feeds every
// per-frame reader (the Topography backdrop, the hero parallax); nothing re-renders.
export const pointer = { x: 0.5, y: 0.5, inside: false };

if (typeof window !== "undefined") {
  const onMove = (event) => {
    if (event.pointerType === "touch") return;
    pointer.x = event.clientX / window.innerWidth;
    pointer.y = 1 - event.clientY / window.innerHeight;
    pointer.inside = true;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => {
    pointer.inside = false;
  });
  window.addEventListener("blur", () => {
    pointer.inside = false;
  });
}
