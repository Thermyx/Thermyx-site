import { ContactShadows } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { CanvasTexture, MathUtils, NeutralToneMapping, PMREMGenerator, ShaderMaterial, SRGBColorSpace, VideoTexture } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { pointer } from "../../lib/pointer.js";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import { DEMO_VIDEO_SRC } from "../demo.js";
import { createPhone, PHONE } from "./phoneModel.js";
import { drawScreens } from "./screens.js";

const GL = { antialias: true, alpha: true, toneMapping: NeutralToneMapping, outputColorSpace: SRGBColorSpace };
const DPR = [1, 2];
const CAMERA = { fov: 24, near: 0.1, far: 50, position: [0, 0, 8] };

// Each screen's resting angle [yaw, pitch]: turned a little toward the copy on the left, a little
// differently per screen so a change of screen reads as a change of view.
const REST = {
  welcome: [-0.4, 0.06],
  home: [-0.24, 0.04],
  insights: [-0.48, 0.07],
  safety: [-0.3, 0.03],
  watch: [-0.44, 0.05],
};
const MOTION = {
  follow: 5, // 1/s, how quickly the phone settles on its target angle
  sway: { yaw: 0.06, pitch: 0.02, lift: 0.03 },
  parallax: { yaw: 0.36, pitch: 0.16 },
  drag: { speed: 0.012, pitchSpeed: 0.006, maxPitch: 0.5, release: 4 },
  // The phone never turns its back: yaw stops at a side view either way, easing into the limit.
  yawLimit: Math.PI / 2 - 0.02,
  yawKnee: 1.05,
  intro: { rate: 1.8, lift: 0.28, yaw: 0.85 }, // arrives turning in from the side
  fade: 4.5, // 1/s, screen crossfade
};

// The phone, in its own small transparent canvas over the page's Prism. Shows `screen` (a key of
// SCREENS, or the demo recording once there is one). Drag turns it (it springs back to face you),
// and it renders only while on screen.
export default function PhoneCanvas({ screen, label }) {
  const containerRef = useRef(null);
  const inView = useInView(containerRef);
  return (
    <div ref={containerRef} className="phone-canvas" role="img" aria-label={label}>
      <Canvas gl={GL} dpr={DPR} camera={CAMERA} frameloop={inView ? "always" : "never"}>
        <Environment />
        <hemisphereLight args={["#ffffff", "#d9cdb8", 0.7]} />
        <directionalLight position={[-3, 4, 5]} intensity={1.6} />
        <directionalLight position={[4, -1, -3]} intensity={0.6} color="#ffd9bd" />
        <Phone screen={screen} />
        <ContactShadows position={[0, -0.98, 0]} opacity={0.32} scale={3.4} blur={2.8} far={1.6} resolution={512} color="#0a2e58" />
      </Canvas>
    </div>
  );
}

function Phone({ screen }) {
  const reducedMotion = useReducedMotion();
  const get = useThree((state) => state.get);
  const screens = useScreenTextures();
  const material = useMemo(() => createScreenMaterial(), []);
  const phone = useMemo(() => createPhone(material), [material]);
  const rig = useRef(null);

  useEffect(
    () => () => {
      phone.dispose();
      material.dispose();
    },
    [phone, material],
  );

  useDrag(get, rig);

  useFrame((state, delta) => {
    rig.current ??= createRig(reducedMotion);
    if (!screens) return;
    stepPhone(state, Math.min(delta, 0.1), rig.current, phone.group, material, screens, screen, reducedMotion);
  });

  return <primitive object={phone.group} visible={Boolean(screens)} />;
}

// ── Per-frame motion (module functions: they mutate three objects, never React state) ──

function createRig(reducedMotion) {
  return {
    yaw: reducedMotion ? REST.welcome[0] : REST.welcome[0] - MOTION.intro.yaw,
    pitch: 0,
    intro: reducedMotion ? 0 : 1,
    dragYaw: 0,
    dragPitch: 0,
    dragging: false,
    shown: null,
    kick: 0,
  };
}

function stepPhone({ clock, camera, size }, dt, rig, group, material, screens, screen, reducedMotion) {
  const t = clock.elapsedTime;
  const u = material.uniforms;

  // Screen: crossfade to the requested one.
  const next = screens[screen] ?? screens.welcome;
  if (rig.shown !== next) {
    u.uFrom.value = rig.shown ? u.uTo.value : next;
    u.uTo.value = next;
    u.uMix.value = rig.shown && !reducedMotion ? 0 : 1;
    if (rig.shown) rig.kick = 1;
    rig.shown = next;
  }
  u.uMix.value = reducedMotion ? 1 : MathUtils.damp(u.uMix.value, 1, MOTION.fade, dt);
  u.uTime.value = reducedMotion ? 0 : t;

  // Angles: rest pose, sway, pointer parallax, the drag, the intro turn, and a nudge on change.
  const [restYaw, restPitch] = REST[screen] ?? REST.welcome;
  let yaw = restYaw;
  let pitch = restPitch;
  if (!reducedMotion) {
    yaw += Math.sin(t * 0.45) * MOTION.sway.yaw + (pointer.x - 0.5) * MOTION.parallax.yaw;
    pitch += Math.sin(t * 0.6) * MOTION.sway.pitch - (pointer.y - 0.5) * MOTION.parallax.pitch;
  }
  if (!rig.dragging) {
    // Let go: spring back to face the viewer.
    rig.dragYaw = MathUtils.damp(rig.dragYaw, 0, MOTION.drag.release, dt);
    rig.dragPitch = MathUtils.damp(rig.dragPitch, 0, MOTION.drag.release, dt);
  }
  rig.intro = MathUtils.damp(rig.intro, 0, MOTION.intro.rate, dt);
  rig.kick = MathUtils.damp(rig.kick, 0, 3, dt);
  yaw = softLimit(yaw + rig.dragYaw - rig.intro * MOTION.intro.yaw + rig.kick * 0.22, MOTION.yawKnee, MOTION.yawLimit);
  pitch += rig.dragPitch;

  const follow = reducedMotion || rig.dragging ? 1 : 1 - Math.exp(-MOTION.follow * dt);
  rig.yaw += (yaw - rig.yaw) * follow;
  rig.pitch += (pitch - rig.pitch) * follow;
  group.rotation.set(rig.pitch, rig.yaw, 0);
  group.position.y = reducedMotion ? 0 : Math.sin(t * 0.9) * MOTION.sway.lift - rig.intro * MOTION.intro.lift;

  // Frame the phone: its height (plus the float and shadow) or its width, whichever is tighter.
  const tan = Math.tan(MathUtils.degToRad(camera.fov / 2));
  const height = PHONE.height * PHONE.scale * 1.32;
  const width = PHONE.width * PHONE.scale * 1.75;
  camera.position.set(0, 0.02, Math.max(height / (2 * tan), width / (2 * tan * (size.width / size.height))));
  camera.lookAt(0, 0, 0);
}

// Passes values up to `knee` through unchanged, then eases them toward `limit` without ever
// reaching it (a rubber band), keeping the sign.
function softLimit(value, knee, limit) {
  const size = Math.abs(value);
  if (size <= knee) return value;
  const room = limit - knee;
  return Math.sign(value) * (knee + room * Math.tanh((size - knee) / room));
}

// Mouse, pen, or a sideways touch drag turns the phone (vertical swipes still scroll the page).
function useDrag(get, rig) {
  useEffect(() => {
    const element = get().gl.domElement;
    let last = null;
    const onDown = (event) => {
      if (event.button !== 0 || !rig.current) return;
      last = { x: event.clientX, y: event.clientY };
      rig.current.dragging = true;
      element.setPointerCapture(event.pointerId);
      element.dataset.dragging = "";
    };
    const onMove = (event) => {
      if (!last || !rig.current) return;
      const r = rig.current;
      // Held within the limit (plus a little, for the rubber band), so it never winds up.
      r.dragYaw = MathUtils.clamp(r.dragYaw + (event.clientX - last.x) * MOTION.drag.speed, -2.2, 2.2);
      r.dragPitch = MathUtils.clamp(r.dragPitch + (event.clientY - last.y) * MOTION.drag.pitchSpeed, -MOTION.drag.maxPitch, MOTION.drag.maxPitch);
      last = { x: event.clientX, y: event.clientY };
    };
    const onUp = () => {
      last = null;
      if (rig.current) rig.current.dragging = false;
      delete element.dataset.dragging;
    };
    element.addEventListener("pointerdown", onDown);
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerup", onUp);
    element.addEventListener("pointercancel", onUp);
    return () => {
      element.removeEventListener("pointerdown", onDown);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerup", onUp);
      element.removeEventListener("pointercancel", onUp);
    };
  }, [get, rig]);
}

// ── Screen ──────────────────────────────────────────────────────────────────

// The screen: a crossfade between two textures, shown as-is (unlit, untoned), with a shimmer that
// sweeps only over skeleton bars (the canvases draw them in one exact color, SKELETON).
function createScreenMaterial() {
  return new ShaderMaterial({
    uniforms: { uFrom: { value: null }, uTo: { value: null }, uMix: { value: 1 }, uTime: { value: 0 }, uShimmer: { value: DEMO_VIDEO_SRC ? 0 : 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uFrom;
      uniform sampler2D uTo;
      uniform float uMix;
      uniform float uTime;
      uniform float uShimmer;
      varying vec2 vUv;
      const vec3 SKELETON = vec3(0.0863, 0.1882, 0.2980); // #16304c

      void main() {
        vec3 c = mix(texture2D(uFrom, vUv).rgb, texture2D(uTo, vUv).rgb, uMix);
        float skeleton = 1.0 - smoothstep(0.012, 0.045, distance(c, SKELETON));
        float d = fract(vUv.y * 0.85 - vUv.x * 0.3 + uTime * 0.32);
        float band = smoothstep(0.0, 0.09, d) * (1.0 - smoothstep(0.09, 0.18, d));
        c += skeleton * band * 0.1 * uShimmer;
        gl_FragColor = vec4(c, 1.0);
      }
    `,
  });
}

// The screens as textures: the demo recording for every screen once DEMO_VIDEO_SRC is set,
// otherwise the drawn placeholders. Null until ready.
function useScreenTextures() {
  const [textures, setTextures] = useState(null);
  useEffect(() => {
    let alive = true;
    let made = [];
    let video = null;
    if (DEMO_VIDEO_SRC) {
      video = Object.assign(document.createElement("video"), { src: DEMO_VIDEO_SRC, muted: true, loop: true, playsInline: true });
      const texture = new VideoTexture(video);
      made = [texture];
      // Every screen is the recording; shown once its first frame has decoded.
      video.addEventListener("loadeddata", () => alive && setTextures(new Proxy({}, { get: () => texture })), { once: true });
      video.play().catch(() => {});
    } else {
      drawScreens().then((canvases) => {
        if (!alive) return;
        const out = {};
        for (const [name, canvas] of Object.entries(canvases)) {
          const texture = new CanvasTexture(canvas);
          texture.anisotropy = 8;
          out[name] = texture;
          made.push(texture);
        }
        setTextures(out);
      });
    }
    return () => {
      alive = false;
      made.forEach((texture) => texture.dispose());
      video?.pause();
    };
  }, []);
  return textures;
}

// A PMREM-filtered room for reflections on the titanium and glass (as the insole scene).
function Environment() {
  const get = useThree((state) => state.get);
  useEffect(() => {
    const { gl, scene } = get();
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const envMap = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    scene.environment = envMap;
    return () => {
      if (scene.environment === envMap) scene.environment = null;
      envMap.dispose();
      pmrem.dispose();
    };
  }, [get]);
  return null;
}

function useInView(ref) {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}
