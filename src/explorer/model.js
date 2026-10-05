import { useLoader } from "@react-three/fiber";
import {
  Box3,
  DoubleSide,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Matrix3,
  MeshPhysicalMaterial,
  Vector3,
} from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { findComponent } from "../data/components.js";
import { findExplodeOffsetMm } from "../data/explode.js";
import {
  ACCENT,
  ENCLOSURE_PREFIXES,
  GLASS_EDGES,
  HEAT_PATH_PREFIXES,
  HIGHLIGHT,
  MODEL_URL,
  NORMALIZED_SIZE,
  XRAY,
} from "./constants.js";
import { loadProgress } from "./loadProgress.js";

const prepared = new WeakMap();
const noRaycast = () => {}; // overlays are decoration; picking hits the part mesh

// Suspends until the model is loaded. The loader caches the parsed glTF and preparation runs
// once per glTF, so any number of components (and StrictMode's double mount) can call this.
export function useAssembly() {
  const gltf = useLoader(GLTFLoader, MODEL_URL, undefined, loadProgress.report);
  return getAssembly(gltf);
}

function getAssembly(gltf) {
  let assembly = prepared.get(gltf);
  if (!assembly) {
    assembly = prepareAssembly(gltf.scene);
    prepared.set(gltf, assembly);
  }
  return assembly;
}

function prepareAssembly(scene) {
  // One normalization for the whole assembly, measured at explode = 0 (§3.7). Offsets added
  // later in the model's local space scale with it.
  scene.updateMatrixWorld(true);
  const box = new Box3().setFromObject(scene);
  const center = box.getCenter(new Vector3());
  const scale = NORMALIZED_SIZE / box.getSize(new Vector3()).length();
  scene.position.copy(center).negate();

  const root = new Group();
  root.name = "Assembly";
  root.scale.setScalar(scale);
  root.add(scene);

  // World-space bounds at explode = 0, for camera framing.
  root.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(root);

  const outlineMaterial = new LineBasicMaterial({
    color: GLASS_EDGES.color,
    transparent: true,
    opacity: GLASS_EDGES.opacity,
    depthWrite: false,
  });

  const meshes = [];
  scene.traverse((obj) => obj.isMesh && meshes.push(obj));
  const parts = meshes.map((mesh) => preparePart(mesh, scale, outlineMaterial));

  // Explode state, animated by ExplodeMotion. `applied` is what the meshes currently show.
  const explode = { value: 0, velocity: 0, applied: 0 };

  return { root, scale, center, bounds, parts, outlineMaterial, explode };
}

// World-space bounds of the assembly at a given explode amount (for camera framing).
const _box = new Box3();
const _v = new Vector3();
export function explodedBounds(parts, amount, target = new Box3()) {
  target.makeEmpty();
  for (const { restBox, liftWorld } of parts) {
    target.union(_box.copy(restBox).translate(_v.copy(liftWorld).multiplyScalar(amount)));
  }
  return target;
}

// Every look a part can take is built here, once, and swapped by reference at runtime (§3.4):
//   real:  the CAD material (per-mesh copy: seven bodies share Plastic Matte Black, and
//            highlighting one must never tint another)
//   alt:   shells (glass + enclosures): the ghosted x-ray material
//            internals: a translucent copy of `real`, used while dimmed
//   outline:   faint edges that keep a ghosted shell's form readable (glass shows them always)
//   highlight: accent-colored edges for the active part
function preparePart(mesh, scale, outlineMaterial) {
  const component = findComponent(mesh.name);
  const real = mesh.material.clone();
  const glass = real.transmission > 0; // detect glass by transmission, not by name (§3.2)
  const enclosure = ENCLOSURE_PREFIXES.some((p) => mesh.name.startsWith(p));
  const shell = glass || enclosure;
  const accent = HEAT_PATH_PREFIXES.some((p) => mesh.name.startsWith(p)) ? ACCENT.hot : ACCENT.cool;

  if (glass) {
    // KHR_materials_volume: thickness is local (three multiplies it by the model scale), while
    // attenuationDistance is world space. Scale it too so the tint matches the CAD.
    real.attenuationDistance *= scale;
    real.envMapIntensity = 1.2;
  }

  const alt = shell ? ghostOf(real, glass) : translucentCopyOf(real);
  for (const material of [real, alt]) {
    material.emissive.copy(accent);
    material.emissiveIntensity = 0;
    // Push faces back a hair so edge overlays drawn on them never z-fight.
    material.polygonOffset = true;
    material.polygonOffsetFactor = 1;
    material.polygonOffsetUnits = 1;
  }
  mesh.material = real;
  mesh.renderOrder = shell ? 1 : 0; // shells draw after internals in the transparent pass

  // Explode: the body's lift at explode = 1. The mesh sits directly under the Z-up "Fusion"
  // node with no transform of its own, so lifting it is position.z = liftLocal × explode,
  // in the model's own (pre-normalization) meters, so the offset scales with the model (§5).
  // liftWorld is the same lift in world space, and restBox the body's world bounds at rest.
  const liftLocal = findExplodeOffsetMm(mesh.name) / 1000;
  const liftWorld = new Vector3(0, 0, liftLocal).applyMatrix3(new Matrix3().setFromMatrix4(mesh.matrixWorld));
  mesh.geometry.computeBoundingBox();
  const restBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);

  const edges = new EdgesGeometry(mesh.geometry, GLASS_EDGES.thresholdAngle);

  let outline = null;
  if (shell) {
    outline = new LineSegments(edges, outlineMaterial);
    outline.visible = glass;
    outline.raycast = noRaycast;
    mesh.add(outline);
  }

  const highlight = new LineSegments2(
    new LineSegmentsGeometry().fromEdgesGeometry(edges),
    new LineMaterial({ color: accent, linewidth: HIGHLIGHT.edgeWidth, transparent: true, opacity: 0, depthWrite: false }),
  );
  highlight.visible = false;
  highlight.renderOrder = 2;
  highlight.raycast = noRaycast;
  mesh.add(highlight);
  if (!shell) edges.dispose(); // only needed to build the highlight geometry

  const part = {
    id: component?.match ?? null,
    product: component?.product ?? null,
    glass,
    enclosure,
    shell,
    mesh,
    real,
    alt,
    accent,
    realColor: real.color.clone(), // rest colors, so the highlight tint can ease back exactly
    altColor: alt.color.clone(),
    liftLocal,
    liftWorld,
    restBox,
    outline,
    highlight,
    // Animated values, eased toward their targets in PartVisuals.
    current: { opacity: 1, glow: 0, xray: false },
  };
  mesh.userData.part = part;
  return part;
}

function ghostOf(real, glass) {
  return new MeshPhysicalMaterial({
    name: `${real.name} (x-ray)`,
    color: glass ? real.attenuationColor.clone() : real.color.clone(), // glass keeps its tint
    metalness: 0,
    roughness: 0.25,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.3,
    transparent: true,
    opacity: glass ? XRAY.glassOpacity : XRAY.enclosureOpacity,
    depthWrite: false,
    side: DoubleSide,
  });
}

function translucentCopyOf(real) {
  const copy = real.clone();
  copy.name = `${real.name} (dimmed)`;
  copy.transparent = true;
  copy.depthWrite = false;
  return copy;
}

// Frees GPU memory. Safe to call while the glTF stays cached: three re-uploads disposed
// geometry and recompiles disposed materials if the assembly renders again.
export function disposeAssembly({ parts, outlineMaterial }) {
  for (const { mesh, real, alt, outline, highlight } of parts) {
    mesh.geometry.dispose();
    real.dispose();
    alt.dispose();
    outline?.geometry.dispose();
    highlight.geometry.dispose();
    highlight.material.dispose();
  }
  outlineMaterial.dispose();
}

// Drops a failed (or stale) load from the loader cache so the next mount fetches again.
export function reloadAssembly() {
  useLoader.clear(GLTFLoader, MODEL_URL);
  loadProgress.reset();
}
