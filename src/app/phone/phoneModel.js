import {
  AdditiveBlending,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  TextureLoader,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

// A generic modern phone, built in code rather than loaded: no download, no third-party license,
// no one else's trademark, the Thermyx mark on the back, and a screen that is one clean rectangle
// with 0-1 UVs (for the demo recording). Dimensions in millimetres, roughly a 6.9" phone; the
// whole thing is scaled to scene units at the end (1 unit = 100 mm).
export const PHONE = {
  width: 77.6,
  height: 163,
  depth: 8.4,
  corner: 12.4,
  edge: 1.25, // radius of the rounded frame edge
  screen: { width: 71.6, height: 155.2, corner: 10.6 }, // aspect 0.4613, as the screen textures
  scale: 0.01,
};

const COLORS = {
  frame: "#2a4473", // navy titanium
  back: "#13294d", // frosted navy glass
  glass: "#030508",
};

// Builds the phone. `screenMaterial` is supplied by the caller (it is animated). Returns the group
// and a dispose function for everything created here.
export function createPhone(screenMaterial) {
  const { width: W, height: H, depth: D, corner: R, edge: B, screen: S } = PHONE;
  const owned = [];
  const own = (thing) => (owned.push(thing), thing);
  const group = new Group();
  group.name = "Phone";

  const titanium = own(
    new MeshPhysicalMaterial({ color: COLORS.frame, metalness: 0.9, roughness: 0.3, clearcoat: 0.35, clearcoatRoughness: 0.2 }),
  );
  const frosted = own(
    new MeshPhysicalMaterial({ color: COLORS.back, metalness: 0.12, roughness: 0.58, clearcoat: 0.55, clearcoatRoughness: 0.35 }),
  );
  const blackGlass = own(new MeshPhysicalMaterial({ color: COLORS.glass, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.03 }));
  const matteBlack = own(new MeshStandardMaterial({ color: "#050608", roughness: 0.7 }));
  // Reflections only, added over the screen: a black surface contributes nothing but its sheen.
  const sheen = own(
    new MeshPhysicalMaterial({
      color: "#000000",
      roughness: 0.06,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  const lensGlass = own(
    new MeshPhysicalMaterial({ color: "#06080f", roughness: 0.04, metalness: 0.2, clearcoat: 1, iridescence: 0.9, iridescenceIOR: 1.6 }),
  );
  const flash = own(new MeshStandardMaterial({ color: "#efe6cf", emissive: "#2b2416", roughness: 0.35 }));

  const add = (geometry, material, setup) => {
    const mesh = new Mesh(own(geometry), material);
    setup?.(mesh);
    group.add(mesh);
    return mesh;
  };

  // ── Body: a rounded-rectangle slab whose edge is rounded by the extrusion bevel ──
  const body = new ExtrudeGeometry(roundedRect(W - 2 * B, H - 2 * B, R - B), {
    depth: D - 2 * B,
    bevelEnabled: true,
    bevelThickness: B,
    bevelSize: B,
    bevelSegments: 10,
    curveSegments: 40,
  });
  body.translate(0, 0, -(D - 2 * B) / 2);
  add(body, titanium);

  // ── Front: black glass, the screen, the camera island, and a reflective sheen over it all ──
  const front = D / 2;
  const glassShape = () => roundedRect(W - 2 * B - 0.3, H - 2 * B - 0.3, R - B - 0.15);
  add(new ShapeGeometry(glassShape(), 40), blackGlass, (m) => (m.position.z = front + 0.01));
  add(normalizedUVs(new ShapeGeometry(roundedRect(S.width, S.height, S.corner), 40), S.width, S.height), screenMaterial, (m) => {
    m.position.z = front + 0.02;
    m.name = "Screen";
  });
  const island = { width: 19.6, height: 5.8 };
  const islandY = S.height / 2 - 3.6 - island.height / 2;
  add(new ShapeGeometry(roundedRect(island.width, island.height, island.height / 2), 24), blackGlass, (m) => {
    m.position.set(0, islandY, front + 0.03);
  });
  add(new CylinderGeometry(1.15, 1.15, 0.05, 24).rotateX(Math.PI / 2), lensGlass, (m) => {
    m.position.set(island.width / 2 - 3.1, islandY, front + 0.05);
  });
  add(new ShapeGeometry(glassShape(), 40), sheen, (m) => {
    m.position.z = front + 0.06;
    m.renderOrder = 2;
  });

  // ── Back: frosted glass, the mark, and the camera plateau ──
  const back = -D / 2;
  add(new ShapeGeometry(glassShape(), 40), frosted, (m) => {
    m.position.z = back - 0.01;
    m.rotation.y = Math.PI;
  });

  const markTexture = own(new TextureLoader().load("/app/phone-back-mark.png"));
  markTexture.colorSpace = SRGBColorSpace;
  markTexture.anisotropy = 4;
  const markMaterial = own(
    new MeshPhysicalMaterial({ map: markTexture, transparent: true, alphaTest: 0.3, roughness: 0.32, clearcoat: 1, side: DoubleSide }),
  );
  add(new ShapeGeometry(roundedRect(27, 27, 0), 1), markMaterial, (m) => {
    normalizedUVs(m.geometry, 27, 27);
    m.position.set(0, 2, back - 0.03);
    m.rotation.y = Math.PI;
  });

  // Plateau, top-left when you look at the back (local +x is the viewer's left from behind).
  const plateau = { size: 34, corner: 9.5, height: 1.1, inset: 3.4 };
  const px = W / 2 - plateau.inset - plateau.size / 2;
  const py = H / 2 - plateau.inset - plateau.size / 2;
  const plateauGeometry = new ExtrudeGeometry(roundedRect(plateau.size - 0.8, plateau.size - 0.8, plateau.corner - 0.4), {
    depth: plateau.height - 0.4,
    bevelEnabled: true,
    bevelThickness: 0.2,
    bevelSize: 0.4,
    bevelSegments: 4,
    curveSegments: 24,
  });
  add(plateauGeometry, frosted, (m) => {
    m.position.set(px, py, back - 0.2);
    m.rotation.y = Math.PI;
  });
  const plateauFace = back - plateau.height;
  for (const [dx, dy] of [
    [7.8, 7.8],
    [7.8, -7.8],
    [-7.8, 0],
  ]) {
    add(new CylinderGeometry(6.3, 6.5, 1.5, 48).rotateX(Math.PI / 2), titanium, (m) => {
      m.position.set(px + dx, py + dy, plateauFace - 0.6);
    });
    add(new CylinderGeometry(4.8, 4.8, 0.2, 48).rotateX(Math.PI / 2), lensGlass, (m) => {
      m.position.set(px + dx, py + dy, plateauFace - 1.4);
    });
    add(new CylinderGeometry(1.7, 1.7, 0.2, 32).rotateX(Math.PI / 2), matteBlack, (m) => {
      m.position.set(px + dx, py + dy, plateauFace - 1.45);
    });
  }
  add(new CylinderGeometry(2.4, 2.4, 0.3, 32).rotateX(Math.PI / 2), flash, (m) => {
    m.position.set(px - 7.8, py + 8.8, plateauFace - 0.15);
  });
  add(new CylinderGeometry(1.2, 1.2, 0.3, 24).rotateX(Math.PI / 2), matteBlack, (m) => {
    m.position.set(px - 7.8, py - 8.8, plateauFace - 0.15);
  });

  // ── Buttons and the bottom edge ──
  const button = (length, x, y) =>
    add(new RoundedBoxGeometry(1.1, length, 3.4, 3, 0.45), titanium, (m) => m.position.set(x, y, 0));
  button(7, -W / 2 - 0.15, 44); // action
  button(11, -W / 2 - 0.15, 30); // volume up
  button(11, -W / 2 - 0.15, 16.5); // volume down
  button(17, W / 2 + 0.15, 28); // side
  add(new ShapeGeometry(roundedRect(9.4, 3.2, 1.6), 16), matteBlack, (m) => {
    m.position.set(0, -H / 2 - 0.02, 0);
    m.rotation.x = Math.PI / 2;
  });
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      add(new CylinderGeometry(0.5, 0.5, 0.2, 12), matteBlack, (m) => {
        m.position.set(side * (9 + i * 1.7), -H / 2 - 0.05, 0);
      });
    }
  }

  group.scale.setScalar(PHONE.scale);
  return {
    group,
    dispose() {
      for (const thing of owned) thing.dispose();
    },
  };
}

// A rounded rectangle centered on the origin.
function roundedRect(width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  const shape = new Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  if (r) shape.absarc(x + width - r, y + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(x + width, y + height - r);
  if (r) shape.absarc(x + width - r, y + height - r, r, 0, Math.PI / 2, false);
  shape.lineTo(x + r, y + height);
  if (r) shape.absarc(x + r, y + height - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + r);
  if (r) shape.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return shape;
}

// ShapeGeometry's UVs are its x/y coordinates; remap them to 0-1 across the given size.
function normalizedUVs(geometry, width, height) {
  const uv = geometry.attributes.uv;
  const position = geometry.attributes.position;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, position.getX(i) / width + 0.5, position.getY(i) / height + 0.5);
  }
  uv.needsUpdate = true;
  return geometry;
}
