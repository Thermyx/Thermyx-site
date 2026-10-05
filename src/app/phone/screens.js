// Placeholder screens for the phone until the demo recording exists: the real app's layouts,
// colors (ThermyxApp/DesignSystem/ThermyxTheme.swift), and labels (the Swift views), with skeleton
// bars wherever a live value would go. No numbers: the app never shows a reading it didn't
// measure, and neither do these. Skeleton bars use one exact color, SKELETON, which the screen
// shader detects to run its shimmer over them only.
export const SCREEN_SIZE = { width: 600, height: 1300 }; // the phone screen's aspect (PHONE.screen)

const INK = {
  midnight: "#06101e",
  deck: "#0d1a2b",
  bar: "#0a1524",
  selected: "#1b3a5c",
  signal: "#2c9cf0",
  ice: "#5bd2ff",
  ember: "#ff6a13",
  amber: "#ff9b3d",
  text: "#eaf2fa",
  muted: "#9fb6ce",
  faint: "#7d93ab",
  onEmber: "#1a0800",
  hairline: "rgba(120,170,220,0.16)",
};
export const SKELETON = "#16304c";

const FONT = '"Archivo Variable", "Archivo", system-ui, sans-serif';

// The sole outline from the home page's pair diagram (left foot, 100 × 260 units).
const SOLE =
  "M50 256C31 256 22 241 22 216C22 188 18 160 14 128C10 98 7 74 10 52C14 24 34 4 60 4C82 4 95 22 94 48C93 74 84 96 78 118C72 140 71 162 75 186C79 210 75 256 50 256Z";

// The screens, in the order the page tours them. Each draws into a 600 × 1300 canvas.
export const SCREENS = {
  welcome: drawWelcome,
  home: drawHome,
  insights: drawInsights,
  safety: drawSafety,
  watch: drawWatch,
};

export async function drawScreens() {
  await Promise.all(["400", "600", "700", "800"].map((w) => document.fonts.load(`${w} 24px "Archivo Variable"`)));
  const out = {};
  for (const [name, draw] of Object.entries(SCREENS)) {
    const canvas = document.createElement("canvas");
    canvas.width = SCREEN_SIZE.width;
    canvas.height = SCREEN_SIZE.height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = INK.midnight;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    draw(ctx);
    statusBar(ctx);
    homeIndicator(ctx);
    out[name] = canvas;
  }
  return out;
}

// ── Screens ─────────────────────────────────────────────────────────────────

function drawWelcome(ctx) {
  // The onboarding's aurora (Views/Onboarding/AuroraBackground.swift), in the app's accents.
  glow(ctx, 110, 300, 460, "rgba(44,156,240,0.55)");
  glow(ctx, 540, 520, 420, "rgba(255,106,19,0.38)");
  glow(ctx, 160, 860, 420, "rgba(91,210,255,0.22)");
  const fade = ctx.createLinearGradient(0, 600, 0, 1300);
  fade.addColorStop(0, "rgba(6,16,30,0)");
  fade.addColorStop(1, "rgba(6,16,30,0.92)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, 600, 1300);

  text(ctx, "THERMYX", 300, 176, { size: 24, weight: 700, color: INK.text, align: "center", spacing: 7 });
  text(ctx, "Climate control", 48, 742, { size: 62, weight: 800, color: INK.text, spacing: -1 });
  text(ctx, "for every step", 48, 812, { size: 62, weight: 800, color: INK.text, spacing: -1 });
  paragraph(
    ctx,
    "A smart insole that senses your foot temperature, pressure, and movement — then heats or cools in real time.",
    48,
    880,
    500,
    { size: 25, color: INK.muted, lineHeight: 37 },
  );
  // Page dots and the primary button (its label left as a skeleton).
  pill(ctx, 48, 1112, 34, 9, INK.ice);
  pill(ctx, 92, 1112, 9, 9, "rgba(234,242,250,0.3)");
  pill(ctx, 111, 1112, 9, 9, "rgba(234,242,250,0.3)");
  pill(ctx, 48, 1160, 504, 76, INK.signal);
  pill(ctx, 230, 1191, 140, 14, "rgba(3,18,31,0.35)");
}

function drawHome(ctx) {
  header(ctx, "Home");
  // Risk band.
  card(ctx, 30, 196, 540, 96);
  circle(ctx, 76, 244, 14, SKELETON);
  bar(ctx, 104, 226, 150, 16);
  bar(ctx, 104, 252, 250, 13);
  // The pair: two soles, medial edges facing, each with its three zones.
  card(ctx, 30, 308, 540, 404);
  sole(ctx, 92, 334, 1.36, false);
  sole(ctx, 508, 334, 1.36, true);
  text(ctx, "L", 160, 690, { size: 20, weight: 600, color: INK.faint, align: "center" });
  text(ctx, "R", 440, 690, { size: 20, weight: 600, color: INK.faint, align: "center" });
  // Zone readouts (HomeView labels).
  tiles(ctx, 728, ["Ambient", "Forefoot load", "L–R gap", "Steadiness"]);
  controlBar(ctx, 1004, 1);
  tabBar(ctx, ["Home", "Insights", "Safety"], 0, [house, chart, shield]);
}

function drawInsights(ctx) {
  header(ctx, "Insights");
  segmented(ctx, 30, 192, 540, ["Day", "Week", "Month"], 0);
  // Not enough history: the app's own empty state (charts wait for three buckets).
  card(ctx, 30, 270, 540, 330);
  bar(ctx, 58, 298, 170, 16);
  dashedRect(ctx, 58, 336, 484, 226, 18);
  text(ctx, "Not enough history yet", 300, 440, { size: 26, weight: 600, color: INK.muted, align: "center" });
  bar(ctx, 190, 466, 220, 12);
  tiles(ctx, 618, ["Steps today", "Steadiness", "Foot", "Ambient"]);
  card(ctx, 30, 860, 540, 84);
  text(ctx, "Learning center", 58, 912, { size: 26, weight: 600, color: INK.text });
  chevron(ctx, 536, 902);
  controlBar(ctx, 1004, 1);
  tabBar(ctx, ["Home", "Insights", "Safety"], 1, [house, chart, shield]);
}

function drawSafety(ctx) {
  header(ctx, "Safety");
  // The escalation ladder (Models/ThermyxRisk.swift: names and ladder details).
  card(ctx, 30, 192, 540, 452);
  const rungs = [
    ["Normal", "Monitoring quietly.", INK.ice],
    ["Caution", "Notify you on the phone.", INK.amber],
    ["High risk", "Stop, hydrate, cool down. Trusted circle notified.", INK.ember],
    ["Critical", "Full-screen alert and emergency actions.", INK.ember],
  ];
  ctx.strokeStyle = INK.hairline;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(72, 248);
  ctx.lineTo(72, 584);
  ctx.stroke();
  rungs.forEach(([name, detail, color], i) => {
    const y = 236 + i * 108;
    circle(ctx, 72, y + 12, 11, color);
    text(ctx, name, 102, y + 22, { size: 27, weight: 700, color: INK.text });
    paragraph(ctx, detail, 102, y + 54, 430, { size: 21, color: INK.muted, lineHeight: 28 });
  });
  pill(ctx, 30, 662, 540, 78, INK.ember);
  text(ctx, "SOS", 300, 712, { size: 30, weight: 800, color: INK.onEmber, align: "center", spacing: 2 });
  text(ctx, "TRUSTED CIRCLE", 34, 782, { size: 18, weight: 700, color: INK.faint, spacing: 3 });
  card(ctx, 30, 798, 540, 92);
  text(ctx, "No trusted contacts", 58, 853, { size: 25, weight: 600, color: INK.text });
  pill(ctx, 452, 822, 92, 44, "rgba(44,156,240,0.16)");
  text(ctx, "+ Add", 498, 852, { size: 21, weight: 700, color: INK.ice, align: "center" });
  card(ctx, 30, 906, 540, 80);
  text(ctx, "Advanced", 58, 955, { size: 25, weight: 600, color: INK.text });
  chevron(ctx, 536, 946);
  controlBar(ctx, 1004, 1);
  tabBar(ctx, ["Home", "Insights", "Safety"], 2, [house, chart, shield]);
}

function drawWatch(ctx) {
  // The trusted member's view: the wearer's status and a way to call; no control bar.
  text(ctx, "TRUSTED CIRCLE", 34, 128, { size: 18, weight: 700, color: INK.faint, spacing: 3 });
  bar(ctx, 34, 146, 230, 34);
  card(ctx, 30, 204, 540, 176);
  pill(ctx, 58, 232, 150, 40, SKELETON);
  bar(ctx, 58, 292, 400, 15);
  bar(ctx, 58, 318, 300, 15);
  text(ctx, "Updated", 58, 360, { size: 19, weight: 600, color: INK.faint });
  bar(ctx, 146, 346, 70, 15);
  tiles(ctx, 398, ["Foot temperature", "Ambient", "L–R gap", "Movement"]);
  card(ctx, 30, 642, 540, 104);
  text(ctx, "Insole battery", 58, 684, { size: 21, weight: 600, color: INK.muted });
  bar(ctx, 58, 702, 120, 22);
  pill(ctx, 30, 772, 540, 78, INK.signal);
  phoneGlyph(ctx, 300, 811);
  tabBar(ctx, ["Watch", "Insights", "Settings"], 0, [people, chart, gear]);
}

// ── Pieces ──────────────────────────────────────────────────────────────────

function statusBar(ctx) {
  text(ctx, "9:41", 74, 66, { size: 25, weight: 700, color: INK.text, align: "center" });
  // Signal, Wi-Fi, battery.
  ctx.fillStyle = INK.text;
  [8, 12, 16, 20].forEach((h, i) => roundRect(ctx, 452 + i * 8, 64 - h, 5, h, 1.5, true));
  ctx.strokeStyle = INK.text;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  for (const r of [6, 12]) {
    ctx.beginPath();
    ctx.arc(505, 64, r, -Math.PI * 0.78, -Math.PI * 0.22);
    ctx.stroke();
  }
  circle(ctx, 505, 62, 2.5, INK.text);
  ctx.lineWidth = 2;
  roundRect(ctx, 524, 48, 40, 18, 5, false);
  roundRect(ctx, 527, 51, 30, 12, 3, true);
  roundRect(ctx, 566, 53, 3, 8, 1.5, true);
}

function homeIndicator(ctx) {
  ctx.fillStyle = "rgba(234,242,250,0.85)";
  roundRect(ctx, 233, 1276, 134, 6, 3, true);
}

function header(ctx, title) {
  text(ctx, title, 34, 158, { size: 46, weight: 800, color: INK.text, spacing: -0.5 });
  circle(ctx, 538, 142, 26, INK.deck);
  circle(ctx, 538, 142, 12, SKELETON);
}

function tiles(ctx, y, labels) {
  labels.forEach((label, i) => {
    const x = 30 + (i % 2) * 278;
    const ty = y + Math.floor(i / 2) * 118;
    card(ctx, x, ty, 262, 104);
    text(ctx, label, x + 24, ty + 40, { size: 20, weight: 600, color: INK.muted });
    bar(ctx, x + 24, ty + 58, 110, 24);
  });
}

function controlBar(ctx, y, selected) {
  ctx.fillStyle = INK.bar;
  roundRect(ctx, 30, y, 540, 76, 22, true);
  ctx.strokeStyle = INK.hairline;
  ctx.lineWidth = 1.5;
  roundRect(ctx, 30, y, 540, 76, 22, false);
  ["Cool", "Auto", "Heat"].forEach((label, i) => {
    const x = 36 + i * 176;
    if (i === selected) {
      ctx.fillStyle = INK.selected;
      roundRect(ctx, x, y + 6, 176, 64, 18, true);
    }
    const color = i === selected ? INK.text : INK.muted;
    text(ctx, label, x + 88, y + 47, { size: 24, weight: 700, color, align: "center" });
  });
}

function segmented(ctx, x, y, width, labels, selected) {
  ctx.fillStyle = INK.deck;
  roundRect(ctx, x, y, width, 60, 18, true);
  const w = (width - 12) / labels.length;
  labels.forEach((label, i) => {
    if (i === selected) {
      ctx.fillStyle = INK.selected;
      roundRect(ctx, x + 6 + i * w, y + 6, w, 48, 14, true);
    }
    text(ctx, label, x + 6 + i * w + w / 2, y + 39, { size: 22, weight: 700, color: i === selected ? INK.text : INK.muted, align: "center" });
  });
}

function tabBar(ctx, labels, active, icons) {
  ctx.fillStyle = INK.bar;
  ctx.fillRect(0, 1112, 600, 188);
  ctx.fillStyle = INK.hairline;
  ctx.fillRect(0, 1112, 600, 1.5);
  labels.forEach((label, i) => {
    const cx = 100 + i * 200;
    const color = i === active ? INK.ice : INK.faint;
    icons[i](ctx, cx, 1160, color);
    text(ctx, label, cx, 1214, { size: 19, weight: 600, color, align: "center" });
  });
}

function sole(ctx, x, y, scale, mirrored) {
  ctx.save();
  ctx.translate(x, y);
  if (mirrored) ctx.scale(-scale, scale);
  else ctx.scale(scale, scale);
  const path = new Path2D(SOLE);
  ctx.fillStyle = "#11243a";
  ctx.fill(path);
  ctx.strokeStyle = "rgba(159,182,206,0.45)";
  ctx.lineWidth = 1.6 / scale;
  ctx.stroke(path);
  // Heel, arch, forefoot zones: skeletons until a reading exists.
  for (const [zx, zy, r] of [
    [60, 64, 17],
    [37, 148, 14],
    [49, 218, 17],
  ]) {
    ctx.beginPath();
    ctx.arc(zx, zy, r, 0, Math.PI * 2);
    ctx.fillStyle = SKELETON;
    ctx.fill();
  }
  ctx.restore();
}

function card(ctx, x, y, w, h) {
  ctx.fillStyle = INK.deck;
  roundRect(ctx, x, y, w, h, 24, true);
  ctx.strokeStyle = INK.hairline;
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, h, 24, false);
}

function bar(ctx, x, y, w, h) {
  ctx.fillStyle = SKELETON;
  roundRect(ctx, x, y, w, h, h / 2, true);
}

function pill(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  roundRect(ctx, x, y, w, h, h / 2, true);
}

function circle(ctx, x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function glow(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(6,16,30,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 600, 1300);
}

function dashedRect(ctx, x, y, w, h, r) {
  ctx.save();
  ctx.setLineDash([10, 9]);
  ctx.strokeStyle = "rgba(159,182,206,0.35)";
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, r, false);
  ctx.restore();
}

function chevron(ctx, x, y) {
  ctx.strokeStyle = INK.faint;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - 5, y - 10);
  ctx.lineTo(x + 5, y);
  ctx.lineTo(x - 5, y + 10);
  ctx.stroke();
}

function text(ctx, value, x, y, { size, weight = 400, color, align = "left", spacing = 0 }) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.letterSpacing = `${spacing}px`;
  ctx.fillText(value, x, y);
  ctx.letterSpacing = "0px";
}

function paragraph(ctx, value, x, y, width, { size, color, lineHeight }) {
  ctx.font = `400 ${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  let line = "";
  let ly = y;
  for (const word of value.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > width && line) {
      ctx.fillText(line, x, ly);
      line = word;
      ly += lineHeight;
    } else {
      line = next;
    }
  }
  if (line) ctx.fillText(line, x, ly);
}

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) ctx.fill();
  else ctx.stroke();
}

// ── Tab glyphs (simplified SF Symbols: house, chart, shield, people, gear, phone) ──

function stroke(ctx, color, width = 3.2) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

function house(ctx, x, y, color) {
  stroke(ctx, color);
  ctx.beginPath();
  ctx.moveTo(x - 17, y - 1);
  ctx.lineTo(x, y - 16);
  ctx.lineTo(x + 17, y - 1);
  ctx.moveTo(x - 12, y - 5);
  ctx.lineTo(x - 12, y + 15);
  ctx.lineTo(x + 12, y + 15);
  ctx.lineTo(x + 12, y - 5);
  ctx.stroke();
}

function chart(ctx, x, y, color) {
  stroke(ctx, color);
  ctx.beginPath();
  ctx.moveTo(x - 16, y - 15);
  ctx.lineTo(x - 16, y + 15);
  ctx.lineTo(x + 17, y + 15);
  ctx.moveTo(x - 10, y + 6);
  ctx.lineTo(x - 2, y - 3);
  ctx.lineTo(x + 5, y + 3);
  ctx.lineTo(x + 15, y - 9);
  ctx.stroke();
}

function shield(ctx, x, y, color) {
  stroke(ctx, color);
  ctx.beginPath();
  ctx.moveTo(x, y - 17);
  ctx.lineTo(x + 14, y - 11);
  ctx.quadraticCurveTo(x + 14, y + 10, x, y + 17);
  ctx.quadraticCurveTo(x - 14, y + 10, x - 14, y - 11);
  ctx.closePath();
  ctx.stroke();
}

function people(ctx, x, y, color) {
  stroke(ctx, color);
  circle(ctx, x - 7, y - 7, 6.5, color);
  circle(ctx, x + 10, y - 5, 5, color);
  ctx.beginPath();
  ctx.arc(x - 7, y + 15, 12, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 11, y + 15, 9, Math.PI, 0);
  ctx.fill();
}

function gear(ctx, x, y, color) {
  stroke(ctx, color, 3);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * 11, y + Math.sin(a) * 11);
    ctx.lineTo(x + Math.cos(a) * 17, y + Math.sin(a) * 17);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(x, y, 11, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, 4.5, 0, Math.PI * 2);
  ctx.stroke();
}

function phoneGlyph(ctx, x, y) {
  // Lucide's "phone" (ISC), filled.
  const handset = new Path2D(
    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
  );
  ctx.save();
  ctx.translate(x - 18, y - 18);
  ctx.scale(1.5, 1.5);
  ctx.fillStyle = "#03121f";
  ctx.fill(handset);
  ctx.restore();
}
