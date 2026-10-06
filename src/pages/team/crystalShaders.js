import {
  AddEquation,
  AdditiveBlending,
  Color,
  CustomBlending,
  DoubleSide,
  ShaderMaterial,
  SrcColorFactor,
  Vector2,
  ZeroFactor,
} from "three";

// Shaders for the Team star. All three are drawn as ordinary (not transparent) objects where they
// sit inside or behind the glass, so the crystal's transmission pass sees them and bends them.

const ICE = new Color("#5bd2ff");
const EMBER = new Color("#ff6a13");

// The pentagram's five lines, drawn over the whole screen behind the cards (like the Topography
// backdrop, it's a full-screen quad, drawn early and added on top of it). Each line is a fine core
// with a soft halo; two pulses of light chase round the star; a line warms toward ember while a
// card travels it (uGlow) and near a card that's hovered (uHotA/B, at each end).
const linesFragment = /* glsl */ `
uniform vec2 uA[5];
uniform vec2 uB[5];
uniform float uGlow[5];
uniform float uHotA[5];
uniform float uHotB[5];
uniform float uAlpha;
uniform float uTime;
uniform float uPx;
uniform vec3 uIce;
uniform vec3 uEmber;

float segment(vec2 p, vec2 a, vec2 b, out float t) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  t = clamp(dot(pa, ba) / max(dot(ba, ba), 1.0), 0.0, 1.0);
  return length(pa - ba * t);
}

void main() {
  vec2 p = gl_FragCoord.xy;
  vec3 color = vec3(0.0);
  for (int i = 0; i < 5; i++) {
    float t;
    float d = segment(p, uA[i], uB[i], t) / uPx;
    float core = smoothstep(1.3, 0.15, d);
    float halo = exp(-d / 11.0);
    float g = (float(i) + t) / 5.0;
    float pulse = pow(0.5 + 0.5 * cos(6.2831853 * (g * 2.0 - uTime * 0.06)), 26.0);
    float hot = max(uHotA[i] * (1.0 - t), uHotB[i] * t);
    float heat = max(uGlow[i], hot * 0.7);
    vec3 tint = mix(uIce, uEmber, heat);
    color += tint * (core * (0.3 + 0.55 * pulse + 0.7 * heat) + halo * (0.035 + 0.08 * pulse + 0.3 * heat));
  }
  gl_FragColor = vec4(color * uAlpha, 1.0);
  #include <colorspace_fragment>
}
`;

export function createLinesMaterial() {
  const points = () => Array.from({ length: 5 }, () => new Vector2());
  return new ShaderMaterial({
    vertexShader: /* glsl */ `void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: linesFragment,
    depthTest: false,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uA: { value: points() },
      uB: { value: points() },
      uGlow: { value: [0, 0, 0, 0, 0] },
      uHotA: { value: [0, 0, 0, 0, 0] },
      uHotB: { value: [0, 0, 0, 0, 0] },
      uAlpha: { value: 0 },
      uTime: { value: 0 },
      uPx: { value: 1 },
      uIce: { value: ICE.clone() },
      uEmber: { value: EMBER.clone() },
    },
  });
}

// While a card is open, this dims everything drawn before it (the backdrop and the star's lines):
// it multiplies the frame by (1 − uAmount). It's an opaque object, so the glass's transmission pass
// sees the dimmed scene too, and the open crystal bends the same darkness it sits on.
export function createVeilMaterial() {
  return new ShaderMaterial({
    vertexShader: /* glsl */ `void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount;
      void main() { gl_FragColor = vec4(vec3(1.0 - uAmount), 1.0); }
    `,
    depthTest: false,
    depthWrite: false,
    blending: CustomBlending,
    blendEquation: AddEquation,
    blendSrc: ZeroFactor,
    blendDst: SrcColorFactor,
    uniforms: { uAmount: { value: 0 } },
  });
}

// The etched bust: round points, brighter where the surface faces the light.
export function createBustMaterial() {
  return new ShaderMaterial({
    vertexShader: /* glsl */ `
      attribute float aShade;
      uniform float uSize;
      uniform float uDim;
      varying float vShade;
      void main() {
        vShade = aShade * uDim;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * (0.65 + 0.55 * aShade);
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vShade;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        if (dot(c, c) > 0.25) discard;
        vec3 color = mix(vec3(0.16, 0.42, 0.66), vec3(0.95, 0.99, 1.0), vShade) * (0.25 + 0.95 * vShade);
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }
    `,
    uniforms: { uSize: { value: 2 }, uDim: { value: 1 } },
  });
}

// The holographic seal on the card's face, and its peel. The flat sticker lies in its plane; from
// its upper-right edge, everything nearer than the fold line (uPeel × its width) wraps round a
// small cylinder and lies back over itself, the way a sticker lifts when you work a nail under it.
// The face is foil: a rainbow that shifts with the angle you see it at, under the printed ink. The
// back is the white backing paper.
const stickerVertex = /* glsl */ `
uniform float uPeel;
uniform float uSize;
uniform float uCurl;
varying vec2 vUv;
varying vec3 vNormalV;
varying vec3 vViewPos;
varying float vLift;
const float PI = 3.14159265;

void main() {
  vUv = uv;
  vec3 p = position;
  float r = uSize * 0.5;
  vec2 dir = vec2(-0.70710678);
  vec2 origin = -dir * r;
  float u = dot(p.xy - origin, dir);
  float fold = uPeel * 2.0 * r;
  vec3 n = vec3(0.0, 0.0, 1.0);
  vLift = 0.0;
  if (u < fold) {
    float a = fold - u;
    vec2 across = p.xy - origin - dir * u;
    float along;
    float z;
    if (a < PI * uCurl) {
      float angle = a / uCurl;
      along = fold - uCurl * sin(angle);
      z = uCurl * (1.0 - cos(angle));
      n = vec3(dir * sin(angle), cos(angle));
    } else {
      along = fold + (a - PI * uCurl);
      z = 2.0 * uCurl;
      n = vec3(0.0, 0.0, -1.0);
    }
    p.xy = origin + dir * along + across;
    p.z += z;
    vLift = z / (2.0 * uCurl);
  }
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vViewPos = mv.xyz;
  vNormalV = normalize(normalMatrix * n);
  gl_Position = projectionMatrix * mv;
}
`;

const stickerFragment = /* glsl */ `
uniform sampler2D uMap;
uniform float uShift;
uniform float uDim;
varying vec2 vUv;
varying vec3 vNormalV;
varying vec3 vViewPos;
varying float vLift;

vec3 rainbow(float t) {
  return 0.5 + 0.5 * cos(6.2831853 * (t + vec3(0.0, 0.33, 0.67)));
}

void main() {
  float r = length(vUv - 0.5);
  float aa = fwidth(r) * 1.5;
  float alpha = 1.0 - smoothstep(0.5 - aa, 0.5, r);
  if (alpha <= 0.001) discard;

  vec3 n = normalize(vNormalV) * (gl_FrontFacing ? 1.0 : -1.0);
  vec3 v = normalize(-vViewPos);
  vec3 l = normalize(vec3(-0.45, 0.65, 0.6));
  float diffuse = 0.6 + 0.4 * max(dot(n, l), 0.0);
  float spec = pow(max(dot(reflect(-l, n), v), 0.0), 30.0);
  vec4 print = texture2D(uMap, vUv);
  vec3 color;
  if (gl_FrontFacing) {
    float facing = dot(n, v);
    float t = vUv.x * 0.85 + vUv.y * 0.4 + facing * 1.6 + uShift;
    vec3 foil = mix(vec3(0.62, 0.66, 0.72), rainbow(t), 0.62);
    foil *= 0.84 + 0.16 * sin((vUv.x - vUv.y) * 240.0 + uShift * 18.0);
    color = mix(foil * diffuse + spec * 0.85, print.rgb, print.a * 0.92);
  } else {
    float ghost = texture2D(uMap, vec2(1.0 - vUv.x, vUv.y)).a * 0.07;
    color = vec3(0.86, 0.84, 0.8) * diffuse * (1.0 - ghost) + spec * 0.2;
    color *= 0.8 + 0.2 * vLift;
  }
  gl_FragColor = vec4(color * uDim, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export function createStickerMaterial(size, curl) {
  return new ShaderMaterial({
    vertexShader: stickerVertex,
    fragmentShader: stickerFragment,
    transparent: true,
    side: DoubleSide,
    uniforms: {
      uMap: { value: null },
      uPeel: { value: 0 },
      uShift: { value: 0 },
      uDim: { value: 1 },
      uSize: { value: size },
      uCurl: { value: curl },
    },
  });
}
