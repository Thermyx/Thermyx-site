import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  EdgesGeometry,
  ExtrudeGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Points,
  Scene,
  Shape,
  SRGBColorSpace,
} from "three";
import { TEAM } from "../../data/team.js";
import { pointer } from "../../lib/pointer.js";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import { bustPoints, cardArt } from "./crystalArt.js";
import { createBustMaterial, createLinesMaterial, createStickerMaterial, createVeilMaterial } from "./crystalShaders.js";
import { DRAW_TIME, POINT_ANGLES, STAR, STROKE, starDom, starLayout, useStar } from "./star.js";

// Card geometry, in card widths.
const THICK = 0.16; // the slab's depth
const BEVEL = 0.03;
const CARD_H = 1 / STAR.cardAspect;
const INSET = 0.06; // the clear rim round the art inside
const STICKER = 0.27; // the seal's diameter
const BUST_DEPTH = 0.1;
// The star is laid out in CSS px and placed this far in front of the camera, where one px is
// `unit` world units: the cards land exactly on the page's buttons, whatever the camera does.
const DEPTH = 4;

// The Team star in the shared scene: five crystal cards at the points of a turning pentagram (see
// star.js). Each card is a slab of real glass (transmission, dispersion, faceted bevels) with its
// art inside: the photo (or a dark backing and an etched bust) at the back, the name and numbers
// etched mid-glass, and a holographic seal on the face that peels when the card is hovered. Picked,
// the crystal itself flies out of the star (with a turn) to the dialog's card spot and back.
export default function TeamStar() {
  const active = useStar((s) => s.active);
  return active ? <Star /> : null;
}

function Star() {
  const reducedMotion = useReducedMotion();
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const kit = useMemo(() => createKit(), []);

  useEffect(() => () => disposeKit(kit), [kit]);
  useEffect(() => lightCrystals(kit, gl), [kit, gl]);

  // Draw each person's art (after the fonts load), then bring their card in.
  useEffect(() => {
    let cancelled = false;
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    TEAM.forEach((person, index) => {
      cardArt(person, index + 1).then((art) => {
        if (cancelled) return;
        dressCard(kit.cards[index], art, anisotropy);
        invalidate();
      });
    });
    return () => {
      cancelled = true;
    };
  }, [kit, gl, invalidate]);

  // With reduced motion the scene draws on demand: redraw whenever the star's state changes, and
  // on any scroll (the open dialog scrolls on its own on small screens, carrying its card spot).
  useEffect(() => {
    const render = () => invalidate();
    const options = { capture: true, passive: true };
    invalidate();
    window.addEventListener("scroll", render, options);
    const unsubscribe = useStar.subscribe(render);
    return () => {
      window.removeEventListener("scroll", render, options);
      unsubscribe();
    };
  }, [invalidate]);

  useFrame((state, delta) => step(kit, state, delta, reducedMotion));

  return <primitive object={kit.root} />;
}

function createKit() {
  const root = new Group();
  const slab = crystalSlab();
  const edgeGeometry = new EdgesGeometry(slab, 24);
  const innerGeometry = new PlaneGeometry(1 - 2 * INSET, CARD_H - 2 * INSET);
  const stickerGeometry = new PlaneGeometry(STICKER, STICKER, 48, 48);
  const crystal = new MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.03,
    metalness: 0,
    transmission: 1,
    thickness: THICK * 1.4,
    ior: 1.62,
    dispersion: 5,
    attenuationColor: new Color("#bfe7ff"),
    attenuationDistance: 0.6,
    specularIntensity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    iridescence: 0.25,
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [180, 520],
    envMapIntensity: 1.2,
  });
  const edgeMaterial = new LineBasicMaterial({ color: "#c8ecff", transparent: true, opacity: 0.3, depthWrite: false });

  const lines = new Mesh(new PlaneGeometry(2, 2), createLinesMaterial());
  lines.frustumCulled = false;
  lines.renderOrder = -999; // just after the Topography backdrop (-1000)
  const veil = new Mesh(lines.geometry, createVeilMaterial());
  veil.frustumCulled = false;
  veil.renderOrder = -998;
  veil.visible = false;
  root.add(lines, veil);

  const cards = TEAM.map((person, index) => {
    const group = new Group();
    group.visible = false;
    const back = new Mesh(innerGeometry, new MeshBasicMaterial({ toneMapped: false }));
    back.position.z = -THICK / 2 + 0.012;
    const { positions, shades } = bustPoints(index * 7919 + 17, BUST_DEPTH);
    const bustGeometry = new BufferGeometry();
    bustGeometry.setAttribute("position", new BufferAttribute(positions, 3));
    bustGeometry.setAttribute("aShade", new BufferAttribute(shades, 1));
    const bust = new Points(bustGeometry, createBustMaterial());
    bust.position.z = -0.012;
    const etch = new Mesh(
      innerGeometry,
      new MeshBasicMaterial({ alphaTest: 0.5, alphaToCoverage: true, toneMapped: false }),
    );
    etch.position.z = 0.03;
    const glass = new Mesh(slab, crystal);
    const edges = new LineSegments(edgeGeometry, edgeMaterial);
    const sticker = new Mesh(stickerGeometry, createStickerMaterial(STICKER, 0.028));
    sticker.position.set(0.5 - INSET - STICKER / 2 + 0.015, CARD_H / 2 - INSET - STICKER / 2 + 0.015, THICK / 2 + 0.002);
    sticker.rotation.z = [-0.14, 0.1, -0.06, 0.13, -0.1][index % 5]; // stuck on by hand
    group.add(back, bust, etch, glass, edges, sticker);
    root.add(group);
    return {
      id: person.id,
      group,
      back,
      bust,
      etch,
      sticker,
      ready: false,
      shown: 0,
      hover: 0,
      peel: 0,
      peelVelocity: 0,
      tiltX: 0,
      tiltY: 0,
      drawn: 0, // 0 on the star → 1 in the dialog's card spot
      screen: { x: 0, y: 0, width: 0 },
      domWidth: 0,
    };
  });

  return {
    root,
    lines,
    veil,
    crystal,
    cards,
    shared: [slab, edgeGeometry, innerGeometry, stickerGeometry, lines.geometry, crystal, edgeMaterial, lines.material, veil.material],
    points: new Float32Array(10),
    hot: new Float32Array(5),
    glow: [0, 0, 0, 0, 0],
    idle: 0,
    scroll: 0,
    omega: STAR.spin,
    started: false,
    alpha: 0,
    spot: null, // the dialog's card spot (last seen), where an open card flies
    hole: { x: 0, y: 0, width: 0, height: 0 },
  };
}

// The crystals' own lighting, instead of the scene's room: a black studio with thin strip lights
// off to the sides, above, and below, so the bevels catch white, ice, and ember light as the cards
// lean, while the flat faces (which mirror what's behind the camera) stay clear. It's kept fixed to
// the camera (see step), so it looks the same whatever the camera did on the home page.
function lightCrystals(kit, gl) {
  const scene = new Scene();
  scene.background = new Color(0x000000);
  const plane = new PlaneGeometry(1, 1);
  const materials = [];
  const strip = (color, strength, position, width, height) => {
    const material = new MeshBasicMaterial({ color: new Color(color).multiplyScalar(strength), side: DoubleSide });
    const mesh = new Mesh(plane, material);
    mesh.position.set(...position);
    mesh.scale.set(width, height, 1);
    mesh.lookAt(0, 0, 0);
    materials.push(material);
    scene.add(mesh);
  };
  strip("#ffffff", 7, [-4.2, 2.4, 1.4], 0.4, 7);
  strip("#5bd2ff", 6, [4.3, 0.6, 0.9], 0.4, 7);
  strip("#ff6a13", 5, [0.4, -4.3, 1.1], 7, 0.4);
  strip("#cfeeff", 3, [-0.8, 4.3, -0.6], 7, 0.5);
  strip("#9fb6ce", 0.18, [0, 0, 5], 8, 6); // a faint wash behind the camera
  const pmrem = new PMREMGenerator(gl);
  const environment = pmrem.fromScene(scene, 0.02).texture;
  pmrem.dispose();
  plane.dispose();
  materials.forEach((material) => material.dispose());
  kit.crystal.envMap = environment;
  kit.crystal.needsUpdate = true;
  return () => {
    kit.crystal.envMap = null;
    environment.dispose();
  };
}

// A card-shaped slab with faceted bevels, like cut glass. Centered; 1 wide.
function crystalSlab() {
  const w = 1 - 2 * BEVEL;
  const h = CARD_H - 2 * BEVEL;
  const r = 0.07;
  const x = -w / 2;
  const y = -h / 2;
  const shape = new Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(x + w, y + h - r);
  shape.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  shape.lineTo(x + r, y + h);
  shape.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + r);
  shape.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  const depth = THICK - 2 * BEVEL;
  const geometry = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 3,
    curveSegments: 8,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

function dressCard(card, art, anisotropy) {
  const texture = (canvas) => {
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = anisotropy;
    return t;
  };
  card.back.material.map?.dispose();
  card.etch.material.map?.dispose();
  card.sticker.material.uniforms.uMap.value?.dispose();
  card.back.material.map = texture(art.back);
  card.etch.material.map = texture(art.etch);
  card.sticker.material.uniforms.uMap.value = texture(art.sticker);
  card.back.material.needsUpdate = true;
  card.etch.material.needsUpdate = true;
  card.bust.visible = !art.photo;
  card.ready = true;
}

function disposeKit(kit) {
  kit.shared.forEach((item) => item.dispose());
  for (const card of kit.cards) {
    card.back.material.map?.dispose();
    card.etch.material.map?.dispose();
    card.sticker.material.uniforms.uMap.value?.dispose();
    card.back.material.dispose();
    card.etch.material.dispose();
    card.sticker.material.dispose();
    card.bust.geometry.dispose();
    card.bust.material.dispose();
  }
}

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);
const approach = (value, target, amount) => (value < target ? Math.min(target, value + amount) : Math.max(target, value - amount));

// One frame: turn the star, place every card (on its point, or partway along a line while a
// shuffle plays), fly the open card to the dialog, lean the cards toward the pointer, peel the
// hovered card's seal, move the page's buttons onto the cards (and the dialog's window onto the
// open one), and light the lines.
function step(kit, state, delta, still) {
  const field = starDom.field;
  const { camera, size } = state;
  if (!field) {
    kit.root.visible = false;
    return;
  }
  const rect = field.getBoundingClientRect();
  kit.root.visible = rect.width > 0 && rect.bottom > -60 && rect.top < size.height + 60;
  const store = useStar.getState();
  const now = performance.now() / 1000;
  const dt = Math.min(delta, 0.05);

  // The turn: slow on its own (easing to a stop while a card is hovered or open), plus the scroll.
  const engaged = store.hover !== null || store.drawn !== null;
  kit.omega = still ? 0 : MathUtils.damp(kit.omega, engaged ? 0 : STAR.spin, 2.2, dt);
  kit.idle += kit.omega * dt;
  const scrolled = still ? 0 : window.scrollY * STAR.scrollTurn;
  kit.scroll = still || !kit.started ? scrolled : MathUtils.damp(kit.scroll, scrolled, 5, dt);
  kit.started = true;
  const theta = kit.idle + kit.scroll;

  const { radius, cardW, cardH } = starLayout(rect.width, rect.height);
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const P = kit.points;
  for (let k = 0; k < 5; k++) {
    const a = theta + POINT_ANGLES[k];
    P[2 * k] = cx + radius * Math.cos(a);
    P[2 * k + 1] = cy + radius * Math.sin(a);
  }

  // The home page's camera frames its model off-center with a view offset; the star needs the
  // plain projection for its px layout (home sets its offset again each frame when it's back).
  if (camera.view?.enabled) camera.clearViewOffset();
  kit.root.position.copy(camera.position);
  kit.root.quaternion.copy(camera.quaternion);
  // Hold the crystals' lighting fixed to the camera. (three negates these angles to build the
  // lookup rotation, so ZYX order with the camera's XYZ angles gives the camera's inverse.)
  const { x: rx, y: ry, z: rz } = camera.rotation;
  kit.crystal.envMapRotation.set(rx, ry, rz, "ZYX");
  const unit = (2 * DEPTH * Math.tan(MathUtils.degToRad(camera.fov) / 2)) / size.height;
  const dpr = state.viewport.dpr;
  const px = pointer.x * size.width;
  const py = (1 - pointer.y) * size.height;

  for (let i = 0; i < 5; i++) kit.glow[i] = still ? 0 : Math.max(0, kit.glow[i] - dt * 1.3);
  kit.hot.fill(0);
  let anyHover = 0;
  for (const card of kit.cards) anyHover = Math.max(anyHover, card.hover);
  let moving = false;

  // The open card: where the dialog wants it, and how far out of the star each card is.
  if (starDom.spot) kit.spot = starDom.spot.getBoundingClientRect();
  const spot = kit.spot;
  for (const card of kit.cards) {
    const target = store.drawn === card.id && spot ? 1 : 0;
    card.drawn = still ? target : approach(card.drawn, target, dt / DRAW_TIME);
  }
  const outOf = (card) => kit.cards.reduce((most, other) => (other === card ? most : Math.max(most, other.drawn)), 0);
  const open = Math.max(...kit.cards.map((card) => card.drawn));

  kit.cards.forEach((card, index) => {
    const slot = store.slots.indexOf(card.id);
    const move = store.moves?.[card.id];
    let x = P[2 * slot];
    let y = P[2 * slot + 1];
    let lift = 0;
    let bankX = 0;
    let bankY = 0;
    if (move && !still) {
      const t = MathUtils.clamp((now - move.start) / move.duration, 0, 1);
      if (t < 1) moving = true;
      const e = easeInOut(t);
      const steps = move.path.length - 1;
      const s = Math.min(e * steps, steps - 1e-4);
      const seg = Math.floor(s);
      const f = s - seg;
      const a = move.path[seg];
      const b = move.path[seg + 1];
      const dx = P[2 * b] - P[2 * a];
      const dy = P[2 * b + 1] - P[2 * a + 1];
      x = P[2 * a] + dx * f;
      y = P[2 * a + 1] + dy * f;
      // Cards going one way round lift toward you, the other way sink back, so they pass.
      const arc = Math.sin(Math.PI * e);
      lift = move.dir * (0.34 + 0.14 * (move.lane % 3)) * cardW * arc;
      if (t > 0 && t < 1) kit.glow[move.edges[seg]] = 1;
      const length = Math.hypot(dx, dy) || 1;
      bankY = (dx / length) * 0.38 * arc;
      bankX = (dy / length) * 0.38 * arc;
    } else {
      kit.hot[slot] = card.hover;
    }

    const hovered = store.hover === card.id;
    card.hover = still ? Number(hovered) : MathUtils.damp(card.hover, hovered ? 1 : 0, 9, dt);
    let peelTarget = hovered ? 0.42 : 0;

    // In when its art is ready, staggered.
    if (!card.ready) card.shown = 0;
    else if (still) card.shown = 1;
    else if (now > (card.readyAt ??= now + index * 0.09)) card.shown = Math.min(1, card.shown + dt / 0.6);
    card.group.visible = card.ready && card.shown > 0;
    const pop = easeOutBack(card.shown);

    // Lean toward the pointer: a little for every card, fully for the hovered one; and sway.
    let tx = 0;
    let ty = 0;
    if (pointer.inside && !still) {
      tx = MathUtils.clamp((py - y) / size.height, -0.6, 0.6) * 0.3;
      ty = MathUtils.clamp((px - x) / size.width, -0.6, 0.6) * 0.42;
      if (card.hover > 0.01) {
        const lx = MathUtils.clamp((px - x) / (cardW / 2), -1, 1);
        const ly = MathUtils.clamp((py - y) / (cardH / 2), -1, 1);
        tx = MathUtils.lerp(tx, ly * 0.3, card.hover);
        ty = MathUtils.lerp(ty, lx * 0.36, card.hover);
      }
    }
    if (!still) {
      tx += Math.sin(now * 0.6 + index * 1.7) * 0.05;
      ty += Math.cos(now * 0.45 + index * 2.3) * 0.08;
    }

    // Its place on the star (where its button goes), in px; while another card is open, it sinks
    // back. `near` is how much nearer the camera it is than the star (it looks that much bigger).
    const scale = (0.8 + 0.2 * pop) * (1 + 0.05 * card.hover);
    const sink = outOf(card) * 0.6 * cardW;
    const starZ = lift + card.hover * 0.22 * cardW - sink;
    const starNear = DEPTH / (DEPTH - starZ * unit);
    const starX = x;
    const starY = y;
    let width = cardW * scale * starNear;
    let zPx = starZ;
    let spin = 0;

    // Open: fly to the dialog's card spot, nearer than everything, turning once on the way; there,
    // lean toward the pointer over it (and peel its seal), or sway gently.
    const out = easeInOut(card.drawn);
    if (card.drawn > 0 && spot) {
      const arc = Math.sin(Math.PI * out);
      x = MathUtils.lerp(x, spot.left + spot.width / 2, out);
      y = MathUtils.lerp(y, spot.top + spot.height / 2, out);
      width = MathUtils.lerp(width, spot.width, out);
      zPx = MathUtils.lerp(starZ, 0.5 * spot.width, out) + arc * 0.4 * spot.width;
      spin = still ? 0 : Math.PI * 2 * out;
      const lx = (px - x) / (width / 2);
      const ly = (py - y) / (width / STAR.cardAspect / 2);
      const over = pointer.inside && Math.abs(lx) < 1 && Math.abs(ly) < 1;
      const dtx = still ? 0 : over ? ly * 0.24 : Math.sin(now * 0.5) * 0.06;
      const dty = still ? 0 : over ? lx * 0.32 : Math.cos(now * 0.4) * 0.16;
      tx = MathUtils.lerp(tx, dtx, out);
      ty = MathUtils.lerp(ty, dty, out);
      if (over && card.drawn > 0.95) peelTarget = 0.42;
    }
    card.tiltX = still ? tx : MathUtils.damp(card.tiltX, tx, 6, dt);
    card.tiltY = still ? ty : MathUtils.damp(card.tiltY, ty, 6, dt);
    if (still) {
      card.peel = peelTarget;
      card.peelVelocity = 0;
    } else {
      card.peelVelocity += ((peelTarget - card.peel) * 170 - card.peelVelocity * 15) * dt;
      card.peel += card.peelVelocity * dt;
    }

    // Place it: px → world, keeping its screen position and size as it moves toward the camera.
    const zWorld = zPx * unit;
    const near = DEPTH / (DEPTH - zWorld);
    card.group.position.set(((x - size.width / 2) * unit) / near, ((size.height / 2 - y) * unit) / near, -DEPTH + zWorld);
    card.group.scale.setScalar((width * unit) / near);
    card.group.rotation.set(card.tiltX + bankX, card.tiltY + bankY + spin, 0);
    card.screen.x = x;
    card.screen.y = y;
    card.screen.width = width;

    // The other cards dim while one is hovered, and further while one is open.
    const dim = (1 - 0.4 * anyHover * (1 - card.hover)) * (1 - 0.55 * outOf(card));
    card.back.material.color.setScalar(dim);
    card.etch.material.color.setScalar(0.7 + 0.3 * dim);
    card.bust.material.uniforms.uDim.value = dim;
    card.bust.material.uniforms.uSize.value = MathUtils.clamp(width / 115, 1.1, 2.6) * dpr;
    const seal = card.sticker.material.uniforms;
    seal.uPeel.value = Math.max(0, card.peel);
    seal.uShift.value = card.tiltY * 1.3 - card.tiltX * 0.9 + theta * 0.12;
    seal.uDim.value = 0.75 + 0.25 * dim;

    const button = starDom.cards.get(card.id);
    if (button) {
      if (card.domWidth !== cardW) {
        button.style.width = `${cardW}px`;
        button.style.height = `${cardH}px`;
        card.domWidth = cardW;
      }
      const left = starX - rect.left - cardW / 2;
      const top = starY - rect.top - cardH / 2;
      button.style.transform = `translate3d(${left.toFixed(2)}px, ${top.toFixed(2)}px, 0) scale(${(scale * starNear).toFixed(4)})`;
    }
  });

  if (!moving && store.moves) useStar.setState({ moves: null });

  // While a card is out, the scene dims behind it, and the dialog's backdrop keeps a soft window
  // open over it (following it there and back), so the crystal shows through the blur.
  kit.veil.visible = open > 0.001 || !kit.veilReady; // drawn (at no strength) on the first frame, to compile it early
  kit.veilReady = true;
  kit.veil.material.uniforms.uAmount.value = 0.5 * easeInOut(open);
  const backdrop = starDom.backdrop;
  if (backdrop) {
    const card = kit.cards.reduce((best, c) => (c.drawn > (best?.drawn ?? 0) ? c : best), null);
    const hole = kit.hole;
    const width = card ? card.screen.width * 1.3 : 0;
    const height = card ? (card.screen.width / STAR.cardAspect) * 1.22 : 0;
    const left = card ? card.screen.x - width / 2 : 0;
    const top = card ? card.screen.y - height / 2 : 0;
    if (Math.abs(width - hole.width) + Math.abs(height - hole.height) + Math.abs(left - hole.x) + Math.abs(top - hole.y) > 0.5) {
      Object.assign(hole, { x: left, y: top, width, height });
      backdrop.style.setProperty("--hole-x", `${left.toFixed(1)}px`);
      backdrop.style.setProperty("--hole-y", `${top.toFixed(1)}px`);
      backdrop.style.setProperty("--hole-w", `${width.toFixed(1)}px`);
      backdrop.style.setProperty("--hole-h", `${height.toFixed(1)}px`);
    }
  } else {
    kit.hole.width = -1; // write afresh when the next backdrop appears
  }

  const lines = kit.lines.material.uniforms;
  for (let i = 0; i < 5; i++) {
    const a = STROKE[i];
    const b = STROKE[(i + 1) % 5];
    lines.uA.value[i].set(P[2 * a] * dpr, (size.height - P[2 * a + 1]) * dpr);
    lines.uB.value[i].set(P[2 * b] * dpr, (size.height - P[2 * b + 1]) * dpr);
    lines.uGlow.value[i] = kit.glow[i];
    lines.uHotA.value[i] = kit.hot[a];
    lines.uHotB.value[i] = kit.hot[b];
  }
  kit.alpha = still ? 1 : Math.min(1, kit.alpha + dt * 0.7);
  lines.uAlpha.value = kit.alpha;
  lines.uTime.value = still ? 0 : now;
  lines.uPx.value = dpr;
}
