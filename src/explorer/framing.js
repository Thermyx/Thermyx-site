import { Vector3 } from "three";

const WORLD_UP = new Vector3(0, 1, 0);
const NEAR_VERTICAL_UP = new Vector3(0, 0, -1);

// Scratch space: the camera rig frames several boxes every frame, so nothing here allocates.
const _corners = Array.from({ length: 8 }, () => new Vector3());
const _back = new Vector3();
const _right = new Vector3();
const _up = new Vector3();
const _q = new Vector3();

// Camera placement that fits `box` (world space) in view from the direction given by [yaw, pitch],
// for a perspective camera. `margin` is the share of the half-viewport the box may fill (0 to 1).
// Exact for the box corners, and re-centers the target so the projected box sits mid-frame
// (a perspective view of a deep box is otherwise off-center). Writes into `out`.
export function frameBox(box, angles, fov, aspect, margin, out = createFrame()) {
  directionFromAngles(angles, _back);
  _right.crossVectors(Math.abs(_back.y) > 0.999 ? NEAR_VERTICAL_UP : WORLD_UP, _back).normalize();
  _up.crossVectors(_back, _right);
  const tanV = Math.tan((fov * Math.PI) / 360) * margin;
  const tanH = tanV * aspect;

  for (let i = 0; i < 8; i++) {
    _corners[i].set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
  }

  const target = box.getCenter(out.target);
  for (let pass = 0; pass < 3; pass++) {
    const d = fitDistance(target, tanH, tanV);
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const c of _corners) {
      _q.subVectors(c, target);
      const depth = d - _q.dot(_back);
      const x = _q.dot(_right) / (depth * tanH);
      const y = _q.dot(_up) / (depth * tanV);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    // Move the target toward the middle of the projected extents.
    target.addScaledVector(_right, ((minX + maxX) / 2) * d * tanH);
    target.addScaledVector(_up, ((minY + maxY) / 2) * d * tanV);
  }

  out.distance = fitDistance(target, tanH, tanV);
  out.position.copy(target).addScaledVector(_back, out.distance);
  return out;
}

export function createFrame() {
  return { position: new Vector3(), target: new Vector3(), distance: 0 };
}

// Smallest distance at which every corner fits: its depth must cover its lateral offset.
function fitDistance(target, tanH, tanV) {
  let d = 0;
  for (const c of _corners) {
    _q.subVectors(c, target);
    d = Math.max(d, _q.dot(_back) + Math.max(Math.abs(_q.dot(_right)) / tanH, Math.abs(_q.dot(_up)) / tanV));
  }
  return d;
}

// Frames `box` within the part of the canvas that overlay panels leave free (insets in CSS px),
// using the full-canvas camera. Pair with applyViewInsets so the free area's center is the
// projection center.
export function frameInView(box, angles, camera, size, insets, margin, out) {
  const freeWidth = Math.max(size.width - insets.left - insets.right, size.width * 0.3);
  const freeHeight = Math.max(size.height - insets.top - insets.bottom, size.height * 0.3);
  const halfTan = Math.tan((camera.fov * Math.PI) / 360) * (freeHeight / size.height);
  const fov = (Math.atan(halfTan) * 360) / Math.PI;
  return frameBox(box, angles, fov, freeWidth / freeHeight, margin, out);
}

// Shifts the projection center to the middle of the free area, and moves the whole render up by
// `shift` px (the stage scrolling away with the page).
export function applyViewInsets(camera, size, { left, right, top, bottom }, shift = 0) {
  if (left || right || top || bottom || shift) {
    camera.setViewOffset(size.width, size.height, (right - left) / 2, (bottom - top) / 2 + shift, size.width, size.height);
  } else {
    camera.clearViewOffset();
  }
}

// Overview angles at a given explode amount (linear between assembled and exploded).
export function overviewAngles({ assembled, exploded }, amount, out = [0, 0]) {
  out[0] = assembled[0] + (exploded[0] - assembled[0]) * amount;
  out[1] = assembled[1] + (exploded[1] - assembled[1]) * amount;
  return out;
}

// Unit vector from the target toward the camera for [yaw, pitch].
export function directionFromAngles([yaw, pitch], target = new Vector3()) {
  return target.set(Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch), Math.cos(pitch) * Math.cos(yaw));
}
