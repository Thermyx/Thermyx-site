import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Box3, Vector3 } from "three";
import { calloutElements, calloutPositions, clampInto } from "./callouts.js";
import { stageScroll } from "./story.js";

const GAP = 64; // horizontal gap between a part and its new card

const _box = new Box3();
const _part = new Box3();
const _v = new Vector3();

// Every frame, ties each visible card to its part: projects the part's anchor (the top-center of
// its bounds, wherever the explode has lifted it) to the stage, places new cards beside their part,
// and moves the leader line and dot. Writes the DOM directly; React is not involved per frame.
// The canvas is fixed to the window and the stage scrolls away over it once its section ends, so
// stage coordinates are window coordinates plus that scroll-away (the shift).
export default function CalloutTracker({ assembly }) {
  const partsById = useMemo(() => {
    const map = new Map();
    for (const part of assembly.parts) map.set(part.id, [...(map.get(part.id) ?? []), part]);
    return map;
  }, [assembly]);

  useFrame(({ camera, size }) => {
    if (!calloutElements.size) return;
    const amount = assembly.explode.applied;

    // Read every card's size first, then write: no layout thrash between cards.
    const entries = [];
    for (const [id, el] of calloutElements) {
      const parts = partsById.get(id);
      if (!parts || !el.box || !el.line) continue;
      entries.push({ id, el, parts, w: el.box.offsetWidth, h: el.box.offsetHeight });
    }

    for (const { id, el, parts, w, h } of entries) {
      _box.makeEmpty();
      for (const { restBox, liftWorld } of parts) _box.union(_part.copy(restBox).translate(_v.copy(liftWorld).multiplyScalar(amount)));
      _v.set((_box.min.x + _box.max.x) / 2, _box.max.y, (_box.min.z + _box.max.z) / 2).project(camera);
      const onScreen = _v.z > -1 && _v.z < 1;
      const ax = ((_v.x + 1) / 2) * size.width;
      const ay = ((1 - _v.y) / 2) * size.height + stageScroll.shift;

      let pos = calloutPositions.get(id);
      if (!pos) {
        pos = place(id, ax, ay, w, h, size);
        calloutPositions.set(id, pos);
      }
      pos.w = w;
      pos.h = h;
      clampInto(pos, size);
      el.box.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

      // The leader runs from the part to the nearest point on the card's edge.
      const ex = Math.min(Math.max(ax, pos.x), pos.x + w);
      const ey = Math.min(Math.max(ay, pos.y), pos.y + h);
      el.line.setAttribute("x1", ax);
      el.line.setAttribute("y1", ay);
      el.line.setAttribute("x2", ex);
      el.line.setAttribute("y2", ey);
      el.dot?.setAttribute("transform", `translate(${ax} ${ay})`);
      el.end?.setAttribute("transform", `translate(${ex} ${ey})`);
      el.group.style.opacity = onScreen ? "" : "0";
    }
  });

  return null;
}

// A new card goes beside its part, on the side away from the stage center, and steps down (then
// up) past any card already there.
function place(id, ax, ay, w, h, size) {
  const left = ax < size.width / 2;
  const pos = { x: left ? ax - GAP - w : ax + GAP, y: ay - h / 2 - 32, w, h };
  clampInto(pos, size);
  const startY = pos.y;
  for (let step = 1; step < 12 && overlapsAnother(id, pos); step++) {
    const offset = Math.ceil(step / 2) * (h + 12) * (step % 2 ? 1 : -1);
    pos.y = startY + offset;
    clampInto(pos, size);
  }
  return pos;
}

function overlapsAnother(id, pos) {
  for (const [other, p] of calloutPositions) {
    if (other === id || !p.w) continue;
    if (pos.x < p.x + p.w + 8 && p.x < pos.x + pos.w + 8 && pos.y < p.y + p.h + 8 && p.y < pos.y + pos.h + 8) return true;
  }
  return false;
}
