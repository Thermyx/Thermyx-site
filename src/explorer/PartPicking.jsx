import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Raycaster, Vector2 } from "three";
import { useCallouts } from "./callouts.js";
import { stageScroll, useStage } from "./story.js";

const CLICK_SLOP_PX = 4; // a press that moves further than this is an orbit drag, not a click

// Raycast hover and click/tap on the canvas, live once the model is fully exploded (before that
// the canvas is scenery). Hovering a part shows its card; a click or tap pins it, and clicking a
// pinned part again unpins it. Touch has no hover, and hover is ignored mid-drag so orbiting
// doesn't flicker the cards.
export default function PartPicking({ parts }) {
  const get = useThree((state) => state.get);

  useEffect(() => {
    const element = get().gl.domElement;
    const meshes = parts.map((p) => p.mesh);
    const raycaster = new Raycaster();
    const ndc = new Vector2();

    // Prefer what's inside: under the pointer, take the nearest internal part, else the nearest
    // enclosure, else the nearest glass layer (glass wraps everything, enclosures sit inside it).
    // Hovering a shell turns x-ray on and ghosts it, so the inner part is what the user sees
    // next. The rule doesn't depend on x-ray state, so the pick can't flip-flop as x-ray toggles.
    const pick = (clientX, clientY) => {
      const rect = element.getBoundingClientRect();
      ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, get().camera);
      let best = null;
      for (const { object } of raycaster.intersectObjects(meshes, false)) {
        const part = object.userData.part;
        const depth = part.glass ? 2 : part.enclosure ? 1 : 0;
        if (depth === 0) return part.id;
        if (!best || depth < best.depth) best = { id: part.id, depth };
      }
      return best?.id ?? null;
    };

    const setHover = (id) => {
      useCallouts.getState().hover(id);
      element.style.cursor = id ? "pointer" : "";
    };
    const exploring = () => stageScroll.visible && useStage.getState().mode === "play";

    let frame = 0;
    let lastMove = null;
    let press = null;

    const onPointerMove = (event) => {
      if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > CLICK_SLOP_PX) press.dragged = true;
      if (event.pointerType !== "mouse" || event.buttons !== 0 || !exploring()) {
        if (press?.dragged || !exploring()) setHover(null);
        return;
      }
      lastMove = event;
      frame ||= requestAnimationFrame(() => {
        frame = 0;
        setHover(pick(lastMove.clientX, lastMove.clientY));
      });
    };
    const onPointerLeave = () => setHover(null);
    const onPointerDown = (event) => {
      if (event.isPrimary && event.button === 0) press = { x: event.clientX, y: event.clientY, dragged: false };
    };
    const onPointerUp = (event) => {
      const wasClick = press && !press.dragged && event.isPrimary;
      press = null;
      if (!wasClick || !exploring()) return;
      const id = pick(event.clientX, event.clientY);
      if (id) useCallouts.getState().toggle(id); // empty space does nothing: pins are deliberate
    };

    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerleave", onPointerLeave);
    element.addEventListener("pointerdown", onPointerDown);
    element.addEventListener("pointerup", onPointerUp);
    // A touch that turns into a page scroll is cancelled by the browser: not a tap.
    const onPointerCancel = () => {
      press = null;
    };
    element.addEventListener("pointercancel", onPointerCancel);
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerleave", onPointerLeave);
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointerup", onPointerUp);
      element.removeEventListener("pointercancel", onPointerCancel);
      element.style.cursor = "";
    };
  }, [get, parts]);

  return null;
}
