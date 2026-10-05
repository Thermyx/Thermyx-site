import { useEffect } from "react";
import { stageScroll } from "./story.js";

const SIDES = ["left", "right", "top", "bottom"];

// How much of the stage each copy group covers, per edge, in CSS px; the camera frames the model
// in the space left free (stageScroll.insets, read per frame; no React state). CSS stays the single
// source of layout: elements opt in with data-view-inset, a space-separated list of
// "<group>" or "<group>:<edge>" (hero, chapters, play), and are measured even while hidden.
// Without an edge, an element wider than 60% of the stage counts as a top or bottom band, and a
// narrower one as a left or right column, so one element can be a column on desktop and a band
// on a phone.
export function useViewInsets(stageRef) {
  useEffect(() => {
    const stage = stageRef.current;
    const elements = [...stage.querySelectorAll("[data-view-inset]")];

    const measure = () => {
      const s = stage.getBoundingClientRect();
      const groups = stageScroll.insets;
      for (const group of Object.values(groups)) for (const side of SIDES) group[side] = 0;

      for (const element of elements) {
        const r = element.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        for (const token of element.dataset.viewInset.split(/\s+/)) {
          const [name, edge] = token.split(":");
          const group = groups[name];
          if (!group) continue;
          const reach = { top: r.bottom - s.top, bottom: s.bottom - r.top, left: r.right - s.left, right: s.right - r.left };
          const side =
            edge ??
            (r.width > s.width * 0.6
              ? r.top + r.height / 2 > s.top + s.height / 2
                ? "bottom"
                : "top"
              : r.left + r.width / 2 < s.left + s.width / 2
                ? "left"
                : "right");
          group[side] = Math.max(group[side], Math.round(reach[side]));
        }
      }
    };

    // Fires once on observe, then on every size change of the stage or a copy element.
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [stageRef]);
}
