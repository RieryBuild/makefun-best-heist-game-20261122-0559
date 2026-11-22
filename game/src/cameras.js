// cameras.js — one job: the wall cameras. Each sweeps its arc back and
// forth on a sine; a thief caught inside the arc, in sight, feeds the alarm
// meter. Cameras never move and never hear coins — they only watch.
import { CAMERA, ROOM } from './config.js';
import { hasLineOfSight } from './guards.js';

export function makeCamera(def) {
  return {
    x: def.x,
    y: def.y,
    base: def.base,
    sweep: def.sweep,
    phase: def.phase,
    angle: def.base,
    t: def.phase,
  };
}

export function updateCamera(cam, dt) {
  cam.t += dt * CAMERA.sweepSpeed;
  cam.angle = cam.base + Math.sin(cam.t) * cam.sweep;
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Is the thief inside this camera's sweeping arc right now?
export function inCameraArc(cam, px, py, blockers) {
  const dx = px - cam.x;
  const dy = py - cam.y;
  const dist = Math.hypot(dx, dy);
  if (dist > CAMERA.range) return false;
  const ang = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(ang, cam.angle)) > CAMERA.halfAngle) return false;
  return hasLineOfSight(cam.x, cam.y, px, py, blockers);
}

// One camera, one tick. Returns the alarm gained this tick (0 when unseen).
export function updateCameraAlarm(cam, dt, player, blockers, isHidden) {
  updateCamera(cam, dt);
  if (isHidden(player)) return 0;
  if (inCameraArc(cam, player.x, player.y, blockers)) return CAMERA.alarmRate * dt;
  return 0;
}

export function cameraArcPath(cam) {
  return {
    x: cam.x,
    y: cam.y,
    range: CAMERA.range,
    half: CAMERA.halfAngle,
    angle: cam.angle,
  };
}
