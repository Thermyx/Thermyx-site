// The art inside each crystal card, drawn once per person on 2D canvases:
//   back     the layer at the back of the glass: the photo, filling the card, frosted and
//            darkened toward the bottom; until there's a photo, a dark backing with a glow
//   etch     the layer etched mid-glass: the corner numbers and mark, the role, and the name,
//            whose letters are filled with the photo itself (brightened), so the type is cut
//            from the person; until there's a photo, the brand's cool-to-warm gradient
//   sticker  the holographic seal's print (ink only; the foil is a shader)
// plus, until there's a photo, the points of a laser-etched bust floating in the glass.

export const ART = { width: 640, height: 923 }; // the inner plane, 0.88 × 1.269 card widths
const PAD = 34;
const INK = "#eaf2fa";
const AMBER = "#ff9b3d";
const FONT = '"Archivo Variable", "Archivo", system-ui, sans-serif';
const MONO = '"JetBrains Mono Variable", ui-monospace, monospace';

let shared = null;
function sharedAssets() {
  shared ??= Promise.all([
    document.fonts.load(`800 74px ${FONT}`),
    document.fonts.load(`700 38px ${FONT}`),
    document.fonts.load(`700 44px ${MONO}`),
    loadImage("/team/mark.png"),
  ]).then(([, , , mark]) => ({ mark }));
  return shared;
}

export async function cardArt(person, number) {
  const [{ mark }, photo] = await Promise.all([
    sharedAssets(),
    person.photo ? loadImage(person.photo).catch(() => null) : null,
  ]);
  return {
    back: photo ? photoBack(photo) : plainBack(),
    etch: etch(person, number, photo, mark),
    sticker: stickerPrint(number),
    photo: Boolean(photo),
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function canvas(width = ART.width, height = ART.height) {
  const element = document.createElement("canvas");
  element.width = width;
  element.height = height;
  return [element, element.getContext("2d")];
}

// Draw an image to cover the whole canvas, centered (the photo, wherever it's drawn, lines up).
function cover(ctx, image) {
  const { width, height } = ctx.canvas;
  const scale = Math.max(width / image.width, height / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
}

function plainBack() {
  const [element, ctx] = canvas();
  const { width, height } = element;
  const base = ctx.createLinearGradient(0, 0, 0, height);
  base.addColorStop(0, "#0d2038");
  base.addColorStop(0.55, "#07111f");
  base.addColorStop(1, "#04070c");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);
  glow(ctx, width / 2, height * 0.33, width * 0.55, "91, 210, 255", 0.26);
  glow(ctx, width / 2, height * 1.02, width * 0.75, "255, 106, 19", 0.2);
  // A faint dot grid, like the back of a printed plate: something for the glass to bend.
  ctx.fillStyle = "rgba(234, 242, 250, 0.07)";
  for (let y = 22; y < height; y += 26) {
    for (let x = 22; x < width; x += 26) ctx.fillRect(x, y, 2, 2);
  }
  ctx.strokeStyle = "rgba(234, 242, 250, 0.1)";
  ctx.lineWidth = 2;
  roundRect(ctx, 14, 14, width - 28, height - 28, 22);
  ctx.stroke();
  return element;
}

function photoBack(photo) {
  const [element, ctx] = canvas();
  const { width, height } = element;
  cover(ctx, photo);
  // Frost: the same photo, blurred (drawn tiny, then scaled up), fading in toward the bottom.
  const [small, smallCtx] = canvas(40, 58);
  cover(smallCtx, photo);
  const [frost, frostCtx] = canvas();
  frostCtx.imageSmoothingQuality = "high";
  frostCtx.drawImage(small, 0, 0, width, height);
  frostCtx.fillStyle = "rgba(3, 7, 14, 0.5)";
  frostCtx.fillRect(0, 0, width, height);
  const fade = frostCtx.createLinearGradient(0, height * 0.56, 0, height * 0.74);
  fade.addColorStop(0, "rgba(0, 0, 0, 0)");
  fade.addColorStop(1, "rgba(0, 0, 0, 1)");
  frostCtx.globalCompositeOperation = "destination-in";
  frostCtx.fillStyle = fade;
  frostCtx.fillRect(0, 0, width, height);
  ctx.drawImage(frost, 0, 0);
  // Shade the corner the number sits in.
  glow(ctx, 0, 0, width * 0.45, "3, 7, 14", 0.55);
  return element;
}

function glow(ctx, x, y, radius, rgb, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, `rgba(${rgb}, ${alpha})`);
  g.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function etch(person, number, photo, mark) {
  const [element, ctx] = canvas();
  const { width, height } = element;
  const label = String(number).padStart(2, "0");

  corner(ctx, label, mark, PAD, PAD);
  ctx.save();
  ctx.translate(width, height);
  ctx.rotate(Math.PI);
  corner(ctx, label, mark, PAD, PAD);
  ctx.restore();

  // The name: as large as fits on one line (down to 52 px), else two lines.
  const maxWidth = width - PAD * 2 - 40;
  let size = 74;
  setFont(ctx, 800, size, "semi-expanded");
  while (size > 52 && ctx.measureText(person.name).width > maxWidth) setFont(ctx, 800, --size, "semi-expanded");
  const lines = ctx.measureText(person.name).width > maxWidth ? wrap(ctx, person.name, maxWidth) : [person.name];
  const lineHeight = size * 0.98;
  const roleY = height - 100;
  const lastBaseline = roleY - 50;

  // Letters filled with the photo (lined up with the back layer, brightened) or the gradient.
  const [type, typeCtx] = canvas();
  if (photo) {
    cover(typeCtx, photo);
    typeCtx.globalCompositeOperation = "lighter";
    typeCtx.globalAlpha = 0.5;
    cover(typeCtx, photo);
    typeCtx.globalAlpha = 1;
  } else {
    const g = typeCtx.createLinearGradient(PAD, 0, width - PAD, 0);
    g.addColorStop(0, "#7fe0ff");
    g.addColorStop(0.5, "#f4fbff");
    g.addColorStop(1, "#ffb27a");
    typeCtx.fillStyle = g;
    typeCtx.fillRect(0, 0, width, height);
  }
  typeCtx.globalCompositeOperation = "destination-in";
  setFont(typeCtx, 800, size, "semi-expanded");
  typeCtx.fillStyle = "#000";
  lines.forEach((line, i) => {
    typeCtx.fillText(line, PAD, lastBaseline - (lines.length - 1 - i) * lineHeight);
  });
  ctx.drawImage(type, 0, 0);
  if (photo) {
    // A hairline of light round each letter, so dark parts of the photo still read.
    ctx.strokeStyle = "rgba(234, 242, 250, 0.6)";
    ctx.lineWidth = 2;
    setFont(ctx, 800, size, "semi-expanded");
    lines.forEach((line, i) => ctx.strokeText(line, PAD, lastBaseline - (lines.length - 1 - i) * lineHeight));
  }

  setFont(ctx, 700, 38, "condensed");
  ctx.fillStyle = AMBER;
  spaced(ctx, person.role.toUpperCase(), PAD + 2, roleY, 0.12);
  return element;
}

function corner(ctx, label, mark, x, y) {
  setFont(ctx, 700, 48, "normal", MONO);
  ctx.fillStyle = INK;
  ctx.textBaseline = "top";
  ctx.fillText(label, x, y);
  ctx.textBaseline = "alphabetic";
  ctx.drawImage(mark, x + 6, y + 58, 44, 44);
}

function setFont(ctx, weight, size, stretch, family = FONT) {
  ctx.font = `${weight} ${size}px ${family}`;
  if ("fontStretch" in ctx) ctx.fontStretch = stretch;
}

function wrap(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

// Letter-spaced text, drawn a character at a time (canvas letterSpacing isn't everywhere yet).
function spaced(ctx, text, x, y, em) {
  const size = parseFloat(ctx.font.match(/(\d+(?:\.\d+)?)px/)[1]);
  let cursor = x;
  for (const char of text) {
    ctx.fillText(char, cursor, y);
    cursor += ctx.measureText(char).width + size * em;
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// The seal: two rings, THERMYX · TEAM set round between them, the number, and a small star.
function stickerPrint(number) {
  const size = 256;
  const [element, ctx] = canvas(size, size);
  const c = size / 2;
  ctx.strokeStyle = ctx.fillStyle = "#0b1f3a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(c, c, 116, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(c, c, 82, 0, Math.PI * 2);
  ctx.stroke();

  setFont(ctx, 700, 19, "condensed");
  const text = "THERMYX · TEAM · THERMYX · TEAM · ";
  const chars = [...text];
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  chars.forEach((char, i) => {
    const angle = (i / chars.length) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.translate(c + Math.cos(angle) * 99, c + Math.sin(angle) * 99);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });

  setFont(ctx, 700, 66, "normal", MONO);
  ctx.fillText(String(number).padStart(2, "0"), c, c - 8);
  starGlyph(ctx, c, c + 44, 13);
  return element;
}

function starGlyph(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI * 2) / 5;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.lineWidth = 2;
  ctx.stroke();
}

// A head-and-shoulders bust etched in the glass as contour rings: the figure sliced into levels,
// each slice's outline traced in fine points, like the topography lines behind the star (and the
// way a 3D scan is drawn). Tilting the card shows the rings as the ellipses they are. Lit from the
// upper left; the back of each ring dimmer; squeezed to fit the glass's depth. In card widths,
// centered on the card. Returns positions and a brightness per point.
export function bustPoints(seed, depth) {
  const random = mulberry(seed);
  const positions = [];
  const shades = [];
  const light = normalize([-0.55, 0.35, 0.75]);
  const zs = depth / 0.36; // modelled 0.36 card widths deep, then squeezed into the glass
  const ring = (y, rx, rz, weight) => {
    if (rx <= 0.004) return;
    const count = Math.max(10, Math.round((Math.PI * (rx + rz / zs)) / 0.0055));
    const offset = random() * Math.PI * 2;
    for (let i = 0; i < count; i++) {
      const a = offset + (i / count) * Math.PI * 2;
      const nx = Math.cos(a);
      const nz = Math.sin(a);
      const back = nz < 0;
      if (back && random() < 0.55) continue;
      const lit = Math.max(0, nx * light[0] + nz * light[2] + 0.25 * light[1]);
      positions.push(nx * rx + (random() - 0.5) * 0.002, y, nz * rz);
      shades.push(Math.min(1, (0.2 + 0.85 * lit) * weight * (back ? 0.45 : 1) * (0.85 + 0.15 * random())));
    }
  };

  const step = 0.0215;
  for (let y = 0.37; y > -0.27; y -= step) {
    // Head: an egg, narrowing to the chin.
    const hy = (y - 0.2) / 0.165;
    if (Math.abs(hy) < 1) {
      const taper = hy < 0 ? 1 - 0.3 * -hy : 1 - 0.05 * hy;
      const r = Math.sqrt(1 - hy * hy);
      ring(y, 0.122 * taper * r, 0.15 * zs * taper * r, 1);
    }
    // Neck.
    if (y < 0.075 && y > -0.06) ring(y, 0.064, 0.06 * zs, 0.85);
    // Shoulders and chest: the neck flares slowly, then the shoulders spread out to the arms and
    // round over them; the chest fades toward the cut at the bottom.
    if (y < -0.035) {
      const drop = -0.035 - y;
      const spread = Math.min(1, drop / 0.1);
      let half = 0.066 + 0.3 * Math.pow(spread, 1.6);
      if (drop > 0.1) half = 0.366 + 0.05 * Math.sin(Math.min(1, (drop - 0.1) / 0.08) * (Math.PI / 2));
      const fade = 1 - 0.65 * Math.min(1, Math.max(0, (-0.1 - y) / 0.17));
      ring(y, half, 0.15 * zs * Math.min(1, 0.5 + drop * 4), fade);
    }
  }
  // A light haze through the volume, like real etched glass.
  for (let i = 0; i < 240; i++) {
    positions.push((random() - 0.5) * 0.74, -0.24 + random() * 0.66, (random() - 0.5) * depth);
    shades.push(0.18 + 0.12 * random());
  }
  return { positions: new Float32Array(positions), shades: new Float32Array(shades) };
}

function normalize(v) {
  const l = Math.hypot(...v);
  return v.map((x) => x / l);
}

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
