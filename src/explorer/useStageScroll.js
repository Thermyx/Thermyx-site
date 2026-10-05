import { useEffect } from "react";
import { CHAPTERS } from "../data/chapters.js";
import { useCallouts } from "./callouts.js";
import { STAGE } from "./constants.js";
import { stageScroll, useStage } from "./story.js";

const CHAPTER_SPAN = (STAGE.scrubLength - STAGE.heroLength) / CHAPTERS.length;
const clamp01 = (x) => Math.min(Math.max(x, 0), 1);
const smooth = (x) => x * x * (3 - 2 * x);

// Tracks how far the home stage has scrolled and publishes it: live values to the scene
// (stageScroll) and to CSS (--units on the stage; no React), and mode/chapter changes to React.
// Runs at most once per frame. Reduced motion cuts instead of scrubbing: the model is apart from
// the first chapter on, and slides to the middle in one step.
export function useStageScroll(sectionRef, stageRef, reducedMotion) {
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    let frame = 0;
    stageScroll.session += 1;

    const update = () => {
      frame = 0;
      const unit = stage.clientHeight || window.innerHeight;
      const rect = section.getBoundingClientRect();
      const units = Math.max(-rect.top / unit, 0);
      const progress = clamp01(units / STAGE.scrubLength);
      const centerRaw = (units - STAGE.scrubLength) / STAGE.centerLength;

      stageScroll.units = units;
      stageScroll.heroBlend = reducedMotion ? +(units >= STAGE.heroLength) : clamp01(units / STAGE.heroLength);
      stageScroll.progress = reducedMotion ? +(units >= STAGE.heroLength) : progress;
      stageScroll.explode = reducedMotion ? +(units >= STAGE.heroLength) : clamp01(progress / STAGE.explodeShare);
      stageScroll.center = reducedMotion ? +(centerRaw >= 0) : smooth(clamp01(centerRaw));
      stageScroll.shift = Math.max(0, unit - rect.bottom);
      stageScroll.visible = rect.bottom > 0 && rect.top < window.innerHeight;
      stage.style.setProperty("--units", units.toFixed(4));

      const mode = progress >= 1 ? "play" : units > 0.002 ? "scrub" : "hero";
      const chapter =
        units < STAGE.heroLength ? -1 : Math.min(CHAPTERS.length - 1, Math.floor((units - STAGE.heroLength) / CHAPTER_SPAN));
      const current = useStage.getState();
      if (mode !== current.mode || chapter !== current.chapter) {
        // Leaving play drops the transient hover; pinned cards persist for the next visit.
        if (mode !== "play") useCallouts.getState().hover(null);
        useStage.setState({ mode, chapter });
      }
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      stageScroll.visible = false;
      useCallouts.getState().hover(null);
      useStage.setState({ mode: "hero", chapter: -1 });
    };
  }, [sectionRef, stageRef, reducedMotion]);
}

// Where chapter `index` starts, in units (for CSS and the chapter rail).
export const chapterStart = (index) => STAGE.heroLength + index * CHAPTER_SPAN;
export { CHAPTER_SPAN };
