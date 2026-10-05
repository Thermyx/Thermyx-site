import { useFrame } from "@react-three/fiber";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import { EXPLODE_SPRING } from "./constants.js";
import { stageScroll } from "./story.js";

// Springs the explode amount toward the scroll position and lifts every part by its §5 offset ×
// amount. Never goes below 0, so explode = 0 is exactly the CAD and parts never dip into each
// other. The camera rig reads the applied amount to keep the stacks framed.
export default function ExplodeMotion({ assembly }) {
  const reducedMotion = useReducedMotion();

  useFrame((_, delta) => {
    const target = stageScroll.explode;
    const spring = assembly.explode;
    if (spring.value === target && spring.velocity === 0) return;
    stepExplode(assembly, target, reducedMotion ? Infinity : Math.min(delta, 1 / 30));
  });

  return null;
}

// Advances the spring one frame (dt = Infinity snaps, for reduced motion) and moves the parts.
function stepExplode(assembly, target, dt) {
  const spring = assembly.explode;
  if (dt === Infinity) {
    spring.value = target;
    spring.velocity = 0;
  } else {
    const accel = EXPLODE_SPRING.stiffness * (target - spring.value) - EXPLODE_SPRING.damping * spring.velocity;
    spring.velocity += accel * dt;
    spring.value += spring.velocity * dt;
    if (Math.abs(target - spring.value) < 1e-4 && Math.abs(spring.velocity) < 1e-3) {
      spring.value = target;
      spring.velocity = 0;
    }
  }

  const applied = Math.max(0, spring.value);
  if (applied !== spring.applied) {
    for (const part of assembly.parts) part.mesh.position.z = part.liftLocal * applied;
    spring.applied = applied;
  }
}
