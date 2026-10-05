import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Box3, MathUtils, Vector3 } from "three";
import { pointer } from "../lib/pointer.js";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import { CAMERA_PATH } from "./constants.js";
import { applyViewInsets, createFrame, directionFromAngles, frameInView } from "./framing.js";
import { explodedBounds, useAssembly } from "./model.js";
import { stageScroll, useStage } from "./story.js";

const { hero: HERO, exploded: EXPLODED } = CAMERA_PATH;
// Total yaw travelled from the hero to the exploded view: the difference plus whole turns.
const SWEEP = EXPLODED.angles[0] - HERO.angles[0] + CAMERA_PATH.turns * Math.PI * 2;

// The home stage's one camera. Each frame it builds the view the scroll position asks for and
// eases the real camera toward it:
//   hero:  a low three-quarter view beside the hero copy, swaying slowly, leaning toward the pointer
//   scrub: beside the chapters, turning (a full turn and then some) while the parts lift;
//          distance comes from a fixed reference angle so the model doesn't breathe as it turns
//   play:  fully exploded, it slides to the middle; mouse drag orbits, and the view refits from
//          wherever it is dragged
// The first time the model appears it dollies in. Off the home page, or once the stage has
// scrolled away, the model is hidden. Reduced motion: no sway, parallax, or dolly, and the view
// cuts between the hero, the exploded view, and the centered view.
export default function CameraRig() {
  const assembly = useAssembly();
  const reducedMotion = useReducedMotion();
  const get = useThree((state) => state.get);
  const rigRef = useRef(null);

  useOrbitDrag(get, rigRef);

  useFrame((state, delta) => {
    rigRef.current ??= createRig();
    const rig = rigRef.current;
    showModel(assembly, stageScroll.visible);
    if (!stageScroll.visible) {
      rig.snap = true; // coming back into view lands at once rather than easing from stale
      return;
    }
    if (rig.session !== stageScroll.session) {
      rig.session = stageScroll.session;
      rig.started = false;
      rig.orbit.yaw = rig.orbit.pitch = 0;
    }

    const play = useStage.getState().mode === "play";
    if (!play) rig.orbit.yaw = rig.orbit.pitch = 0; // orbiting belongs to play
    const time = state.clock.elapsedTime;
    desiredView(state, assembly, rig, play, reducedMotion ? null : time);

    if (!rig.started) {
      copyView(rig.current, rig.desired);
      if (!reducedMotion) {
        rig.current.yaw += CAMERA_PATH.intro.yaw;
        rig.current.distance *= CAMERA_PATH.intro.distance;
        rig.introUntil = time + 1.6;
      }
      rig.started = true;
    } else if (reducedMotion || rig.snap) {
      copyView(rig.current, rig.desired);
    } else {
      const rate = time < rig.introUntil ? CAMERA_PATH.introRate : play ? CAMERA_PATH.playRate : CAMERA_PATH.scrollRate;
      lerpView(rig.current, rig.current, rig.desired, 1 - Math.exp(-rate * Math.min(delta, 0.1)));
      if (viewsMatch(rig.current, rig.desired)) copyView(rig.current, rig.desired); // land exactly
    }
    rig.snap = false;
    applyView(state.camera, state.size, rig);
  });

  return null;
}

// The model is drawn only while the home stage is on screen.
function showModel(assembly, visible) {
  assembly.root.visible = visible;
}

function createRig() {
  const view = () => ({ target: new Vector3(), yaw: 0, pitch: 0, distance: 1, insets: noInsets() });
  return {
    started: false,
    snap: false,
    session: -1,
    introUntil: 0,
    current: view(),
    desired: view(),
    orbit: { yaw: 0, pitch: 0 },
    insets: noInsets(),
    box: new Box3(),
    center: new Vector3(),
    heroFrame: createFrame(),
    refFrame: createFrame(),
    playFrame: createFrame(),
    angles: [0, 0],
    direction: new Vector3(),
    applied: { width: 0, height: 0, left: NaN, right: NaN, top: NaN, bottom: NaN, shift: NaN },
  };
}

function noInsets() {
  return { left: 0, right: 0, top: 0, bottom: 0 };
}

// `time` is null under reduced motion (no sway or parallax).
function desiredView({ camera, size }, assembly, rig, play, time) {
  const out = rig.desired;
  const { progress, heroBlend, center, insets: groups } = stageScroll;
  const box = explodedBounds(assembly.parts, assembly.explode.applied, rig.box);

  // The free area: hero copy → chapters as the hero hands over, → the centered view for exploring.
  const insets = rig.insets;
  for (const side in insets) {
    const beside = groups.hero[side] + (groups.chapters[side] - groups.hero[side]) * heroBlend;
    insets[side] = beside + (groups.play[side] - beside) * center;
  }

  let yaw = HERO.angles[0] + SWEEP * progress + rig.orbit.yaw;
  let pitch = HERO.angles[1] + (EXPLODED.angles[1] - HERO.angles[1]) * progress + rig.orbit.pitch;
  if (time !== null) {
    const live = 1 - center; // exploring hands the angles to the drag orbit
    yaw += Math.sin(time * CAMERA_PATH.idle.rate) * CAMERA_PATH.idle.yaw * (1 - heroBlend);
    yaw += (pointer.x - 0.5) * 2 * CAMERA_PATH.parallax.yaw * live;
    pitch += (pointer.y - 0.5) * 2 * CAMERA_PATH.parallax.pitch * live;
  }
  rig.angles[0] = yaw;
  rig.angles[1] = MathUtils.clamp(pitch, CAMERA_PATH.pitchMin, CAMERA_PATH.pitchMax);

  if (play) {
    const fit = frameInView(box, rig.angles, camera, size, insets, EXPLODED.margin, rig.playFrame);
    out.target.copy(fit.target);
    out.distance = fit.distance;
  } else {
    const hero = frameInView(box, HERO.angles, camera, size, insets, HERO.margin, rig.heroFrame);
    const reference = frameInView(box, EXPLODED.angles, camera, size, insets, EXPLODED.margin, rig.refFrame);
    out.target.lerpVectors(hero.target, box.getCenter(rig.center), progress);
    out.distance = hero.distance + (reference.distance - hero.distance) * progress;
  }
  out.yaw = rig.angles[0];
  out.pitch = rig.angles[1];
  Object.assign(out.insets, insets);
}

function lerpView(out, a, b, t) {
  out.target.lerpVectors(a.target, b.target, t);
  out.yaw = a.yaw + (b.yaw - a.yaw) * t;
  out.pitch = a.pitch + (b.pitch - a.pitch) * t;
  out.distance = a.distance + (b.distance - a.distance) * t;
  for (const side in out.insets) out.insets[side] = a.insets[side] + (b.insets[side] - a.insets[side]) * t;
  return out;
}

function copyView(out, view) {
  return lerpView(out, view, view, 0);
}

// Within 1e-4 (world units, radians, CSS px): land on the target exactly, so the exponential ease
// ends instead of approaching forever.
function viewsMatch(a, b, epsilon = 1e-4) {
  if (a.target.distanceToSquared(b.target) > epsilon * epsilon) return false;
  if (Math.abs(a.yaw - b.yaw) > epsilon || Math.abs(a.pitch - b.pitch) > epsilon || Math.abs(a.distance - b.distance) > epsilon) return false;
  for (const side in a.insets) if (Math.abs(a.insets[side] - b.insets[side]) > epsilon) return false;
  return true;
}

// Places the camera on its orbit around the target, and shifts the projection center to the
// middle of the free area and up by the stage's scroll-away (only when that changes: it rebuilds
// the projection matrix).
function applyView(camera, size, rig) {
  const { current: view, applied } = rig;
  camera.position.copy(view.target).addScaledVector(directionFromAngles([view.yaw, view.pitch], rig.direction), view.distance);
  camera.lookAt(view.target);

  const { insets } = view;
  const shift = stageScroll.shift;
  const changed =
    applied.width !== size.width ||
    applied.height !== size.height ||
    Math.abs(applied.shift - shift) > 0.25 ||
    Math.abs(applied.left - insets.left) > 0.25 ||
    Math.abs(applied.right - insets.right) > 0.25 ||
    Math.abs(applied.top - insets.top) > 0.25 ||
    Math.abs(applied.bottom - insets.bottom) > 0.25;
  if (changed) {
    applyViewInsets(camera, size, insets, shift);
    Object.assign(applied, insets, { width: size.width, height: size.height, shift });
  }
}

// Mouse/pen drag on the canvas orbits the exploded model in play. Touch is left to page
// scrolling (taps still pin). The wheel always scrolls the page; there is no wheel zoom.
function useOrbitDrag(get, rigRef) {
  useEffect(() => {
    const element = get().gl.domElement;
    let drag = null;
    const onDown = (event) => {
      if (event.pointerType === "touch" || event.button !== 0 || useStage.getState().mode !== "play") return;
      drag = { x: event.clientX, y: event.clientY };
    };
    const onMove = (event) => {
      const orbit = rigRef.current?.orbit;
      if (!drag || !orbit) return;
      orbit.yaw -= (event.clientX - drag.x) * CAMERA_PATH.dragSpeed;
      orbit.pitch = MathUtils.clamp(orbit.pitch + (event.clientY - drag.y) * CAMERA_PATH.dragSpeed, -1, 1);
      drag.x = event.clientX;
      drag.y = event.clientY;
    };
    const onUp = () => {
      drag = null;
    };
    element.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      element.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [get, rigRef]);
}
