import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { PlaneGeometry, ShaderMaterial, Vector2, Vector3, Vector4 } from "three";
import { pointer } from "../lib/pointer.js";
import { useReducedMotion } from "../lib/useReducedMotion.js";

// React Bits' Topography (src/components/Topography.jsx), drawn inside the 3D scene as its
// background instead of on a canvas of its own: the glass shells refract what is behind them,
// and that needs an opaque scene background (§3.3), so the lines have to be in the scene for the
// glass to bend them. Same field, banding, glow, grain, and mouse bump as the component, at the
// component's defaults except colors and opacity. The quad is drawn first, with no depth, so it
// is the background every time, including in the transmission pass.
const TOPOGRAPHY = {
  low: "#2c9cf0", // --signal
  mid: "#ff6a13", // --ember
  high: "#ff9b3d", // --amber
  opacity: 0.25,
  speed: 0.35,
  morphAmount: 3,
  morphSpeed: 0.05,
  bands: 2,
  thickness: 0.01,
  scale: 1,
  glow: 0.5,
  contrast: 3,
  brightness: 1,
  grainIntensity: 0.05,
  mouseRadius: 0.3,
  mouseStrength: 0.4,
  stillTime: 12, // reduced motion: the field holds this frame
};

const CTRL_INDICES = [
  [1, -2, 3, -4],
  [9, -8, 7, -6],
  [5, 2, 5, -5],
  [-1, -3, 8, 9],
];

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Written GLSL1-style; three compiles ShaderMaterial as GLSL ES 3.0 on WebGL2 (fwidth is core).
// Like the component, colors and opacity are mixed in sRGB (so 0.15 looks like the component's
// 0.15), then handed to three as linear: colorspace_fragment encodes that back to the same sRGB
// on screen, and leaves it linear in the transmission pass's float target.
const fragmentShader = /* glsl */ `
uniform vec2 uResolution;
uniform float uTime;
uniform float uMorphAmount;
uniform float uBands;
uniform float uThickness;
uniform float uScale;
uniform float uGlow;
uniform float uContrast;
uniform float uBrightness;
uniform float uOpacity;
uniform vec3 uLow;
uniform vec3 uMid;
uniform vec3 uHigh;
uniform vec2 uMouse;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uMouseActive;
uniform float uGrainIntensity;
uniform vec4 uCtrlA;
uniform vec4 uCtrlB;
uniform vec4 uCtrlC;
uniform vec4 uCtrlD;
varying vec2 vUv;

float bez(float t, vec4 c) {
  float w = 6.2831853 * t;
  return 0.5 * (c.x * sin(w) + c.y * cos(w) + c.z * sin(2.0 * w) + c.w * cos(2.0 * w));
}

float field(vec2 uv) {
  vec2 a = vec2(bez(uv.x, uCtrlA), bez(uv.x, uCtrlB));
  vec2 b = vec2(bez(uv.y, uCtrlC), bez(uv.y, uCtrlD));
  return distance(a, b);
}

vec3 toLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}

vec3 elevationColor(float e) {
  vec3 c = mix(uLow, uMid, smoothstep(0.0, 0.5, e));
  return mix(c, uHigh, smoothstep(0.5, 1.0, e));
}

void main() {
  vec2 uv = vUv;
  vec2 suv = (uv - 0.5) / max(uScale, 0.001) + 0.5;
  float fv = field(suv);

  vec2 d = uv - uMouse;
  d.x *= uResolution.x / max(uResolution.y, 1.0);
  float r = max(uMouseRadius, 0.001);
  fv += exp(-dot(d, d) / (r * r)) * uMouseStrength * uMouseActive;

  float f = fv * uBands;
  float frac = fract(f);
  float lineDist = min(frac, 1.0 - frac);
  float aa = fwidth(f) + 0.0001;
  float mask = 1.0 - smoothstep(uThickness - aa, uThickness + aa, lineDist);
  float glowR = uThickness + uGlow * 0.5 + aa;
  float glow = (1.0 - smoothstep(uThickness, glowR, lineDist)) * step(0.0001, uGlow);
  float elev = clamp(fv / (uMorphAmount * 2.5 + 0.001), 0.0, 1.0);

  float coverage = pow(clamp(mask + glow * 0.55, 0.0, 1.0), max(uContrast, 0.001));
  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + uTime) * 43758.5453);
  float alpha = clamp(coverage + (g - 0.5) * uGrainIntensity, 0.0, 1.0) * uOpacity;
  vec3 color = clamp(elevationColor(elev) * uBrightness, 0.0, 1.0);

  // Over the black page: premultiplied color, opaque.
  gl_FragColor = vec4(toLinear(color * alpha), 1.0);
  #include <colorspace_fragment>
}
`;

export default function TopographyBackdrop() {
  const reducedMotion = useReducedMotion();
  const { geometry, material, ctrl, mouse } = useMemo(() => {
    const t = TOPOGRAPHY;
    const ctrl = [new Vector4(), new Vector4(), new Vector4(), new Vector4()];
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uResolution: { value: new Vector2(1, 1) },
        uTime: { value: 0 },
        uMorphAmount: { value: t.morphAmount },
        uBands: { value: t.bands },
        uThickness: { value: t.thickness },
        uScale: { value: t.scale },
        uGlow: { value: t.glow },
        uContrast: { value: t.contrast },
        uBrightness: { value: t.brightness },
        uOpacity: { value: t.opacity },
        uLow: { value: srgb(t.low) },
        uMid: { value: srgb(t.mid) },
        uHigh: { value: srgb(t.high) },
        uMouse: { value: new Vector2(0.5, 0.5) },
        uMouseRadius: { value: t.mouseRadius },
        uMouseStrength: { value: t.mouseStrength },
        uMouseActive: { value: 0 },
        uGrainIntensity: { value: t.grainIntensity },
        uCtrlA: { value: ctrl[0] },
        uCtrlB: { value: ctrl[1] },
        uCtrlC: { value: ctrl[2] },
        uCtrlD: { value: ctrl[3] },
      },
    });
    return { geometry: new PlaneGeometry(2, 2), material, ctrl, mouse: { x: 0.5, y: 0.5, active: 0 } };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(({ clock, size }) => {
    advance(material, ctrl, mouse, reducedMotion ? TOPOGRAPHY.stillTime : clock.elapsedTime, size, reducedMotion ? 0 : 0.05);
  });

  return <mesh geometry={geometry} material={material} renderOrder={-1000} frustumCulled={false} />;
}

// One frame of the field: time, size, the morphing control vectors, and the mouse bump, which
// follows the pointer (tracked over the whole page) by `follow` of the way per frame, as the
// component does (0.05).
function advance(material, ctrl, mouse, time, size, follow) {
  const u = material.uniforms;
  u.uTime.value = time;
  u.uResolution.value.set(size.width, size.height);
  for (let g = 0; g < 4; g++) {
    const [a, b, c, d] = CTRL_INDICES[g];
    ctrl[g].set(control(a, time), control(b, time), control(c, time), control(d, time));
  }
  mouse.x += follow * (pointer.x - mouse.x);
  mouse.y += follow * (pointer.y - mouse.y);
  mouse.active += follow * ((pointer.inside ? 1 : 0) - mouse.active);
  u.uMouse.value.set(mouse.x, mouse.y);
  u.uMouseActive.value = mouse.active;
}

// One control coefficient of the field at `time` (the component's morph).
function control(i, time) {
  const { morphAmount, speed, morphSpeed } = TOPOGRAPHY;
  return morphAmount * Math.sin(time * speed * Math.sin(i * morphSpeed) + i);
}

// "#rrggbb" as sRGB components (deliberately not converted to linear; see the shader).
function srgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}
