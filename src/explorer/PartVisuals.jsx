import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils } from "three";
import { CHAPTERS } from "../data/chapters.js";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import { DAMPING, HIGHLIGHT, XRAY } from "./constants.js";
import { useCallouts } from "./callouts.js";
import { useStage } from "./story.js";

// Drives every part's look: the parts in focus glow, shells go to x-ray, and everything else dims.
// In focus: while a chapter is beside the model, the parts it is about (dimming the rest lightly);
// while exploring the fully exploded model, the parts with a card (pinned, or hovered).
// Reads the stores imperatively and eases values in the frame loop; it never re-renders React,
// and it stops doing work once everything has settled.
export default function PartVisuals({ parts }) {
  const reducedMotion = useReducedMotion();
  const settled = useRef(false);

  useEffect(() => {
    settled.current = false;
    const wake = () => {
      settled.current = false;
    };
    const unsubscribeCallouts = useCallouts.subscribe(wake);
    const unsubscribeStage = useStage.subscribe(wake);
    return () => {
      unsubscribeCallouts();
      unsubscribeStage();
    };
  }, [parts]);

  useFrame((_, delta) => {
    if (settled.current) return;
    const { mode, chapter } = useStage.getState();
    let active;
    let dim = XRAY.dimOpacity;
    if (mode === "play") {
      const { hovered, pinned } = useCallouts.getState();
      active = new Set([...pinned, hovered].filter(Boolean));
    } else {
      active = new Set(CHAPTERS[chapter]?.highlight);
      dim = XRAY.chapterDimOpacity;
    }
    const xray = active.size > 0;
    const dt = reducedMotion ? Infinity : Math.min(delta, 0.1); // reduced motion: snap
    let moving = false;
    for (const part of parts) moving = updatePart(part, active, xray, dim, dt) || moving;
    settled.current = !moving;
  });

  return null;
}

function updatePart(part, active, xray, dim, dt) {
  const c = part.current;
  const isActive = active.has(part.id);

  let targetOpacity;
  if (part.shell) {
    if (xray && !c.xray) c.opacity = XRAY.enterOpacity; // the glass "clears" into x-ray
    c.xray = xray;
    targetOpacity = isActive ? XRAY.activeShellOpacity : part.glass ? XRAY.glassOpacity : XRAY.enclosureOpacity;
  } else {
    targetOpacity = active.size > 0 && !isActive ? dim : 1;
  }
  const targetGlow = isActive ? 1 : 0;

  // Entering a state eases slower than leaving it, so exits feel faster than entries.
  const opacityRate = part.shell || targetOpacity < c.opacity ? DAMPING.enter : DAMPING.exit;
  c.opacity = approach(c.opacity, targetOpacity, opacityRate, dt);
  c.glow = approach(c.glow, targetGlow, targetGlow > c.glow ? DAMPING.enter : DAMPING.exit, dt);

  // Shells swap to their ghost for the whole x-ray; internals use the translucent copy only
  // while their opacity is below 1, then return to the opaque CAD material.
  const useAlt = part.shell ? c.xray : c.opacity < 1;
  part.mesh.material = useAlt ? part.alt : part.real;
  part.alt.opacity = c.opacity;
  part.real.color.lerpColors(part.realColor, part.accent, c.glow * HIGHLIGHT.tint);
  part.alt.color.lerpColors(part.altColor, part.accent, c.glow * HIGHLIGHT.tint);
  part.real.emissiveIntensity = part.alt.emissiveIntensity = c.glow * HIGHLIGHT.emissiveIntensity;
  if (part.outline) part.outline.visible = part.glass || c.xray;
  part.highlight.visible = c.glow > 0;
  part.highlight.material.opacity = c.glow;

  return c.opacity !== targetOpacity || c.glow !== targetGlow;
}

function approach(value, target, rate, dt) {
  const next = MathUtils.damp(value, target, rate, dt);
  return Math.abs(next - target) < 0.002 ? target : next;
}
