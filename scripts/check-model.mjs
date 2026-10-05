// Validates the explorer's model after a re-export from Fusion: `npm run check:model`.
// Fails if a body is missing, a body no longer matches the component manifest or the explode
// offsets (names are keys; keep them stable), or the glass lost real transmission (an older
// ExportGLB.py exported it as alpha blend with sRGB colors, which breaks CLAUDE.md §3.1–3.2).
import { readFileSync } from "node:fs";
import { PropertyBinding } from "three";
import { COMPONENTS, findComponent } from "../src/data/components.js";
import { findExplodeOffsetMm } from "../src/data/explode.js";

const FILE = "public/hardware-model.glb";
const EXPECTED_BODIES = 20;
const EXPECTED_GLASS = 3;

const glb = readFileSync(FILE);
const jsonLength = glb.readUInt32LE(12);
const gltf = JSON.parse(glb.subarray(20, 20 + jsonLength).toString("utf8"));

const errors = [];
const bodies = gltf.nodes.filter((n) => n.mesh !== undefined);
if (bodies.length !== EXPECTED_BODIES) errors.push(`expected ${EXPECTED_BODIES} bodies, got ${bodies.length}`);

const used = new Set();
for (const { name } of bodies) {
  const sanitized = PropertyBinding.sanitizeNodeName(name);
  const component = findComponent(sanitized);
  if (component) used.add(component.match);
  else errors.push(`no manifest entry matches "${name}"`);
  if (findExplodeOffsetMm(sanitized) === null) errors.push(`no explode offset (src/data/explode.js) for "${name}"`);
}
for (const { match } of COMPONENTS) if (!used.has(match)) errors.push(`manifest entry "${match}" matches no body`);

const glass = (gltf.materials ?? []).filter((m) => m.extensions?.KHR_materials_transmission);
if (glass.length !== EXPECTED_GLASS) {
  errors.push(`expected ${EXPECTED_GLASS} transmissive glass materials, got ${glass.length} (re-export with the current ExportGLB.py)`);
}

if (errors.length) {
  console.error(`✗ ${FILE}\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
console.log(`✓ ${FILE}: ${bodies.length} bodies, all matched to the manifest and given explode offsets; ${glass.length} glass materials with transmission`);
