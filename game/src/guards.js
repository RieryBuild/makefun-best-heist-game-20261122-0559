// guards.js — one job: the guards. Patrol waypoints, watch a vision cone,
// grow suspicious when the thief is inside it, investigate a thrown coin,
// and chase when the alarm breaks. Also owns line-of-sight: walls, crates
// and shelves block a guard's eyes, grass and shadow do not.
import { GUARD, ROOM } from './config.js';

export function makeGuard(def) {
  const start = def.waypoints[0];
  return {
    x: start[0],
    y: start[1],
    waypoints: def.waypoints,
    wpIndex: 1 % def.waypoints.length,
    face: def.face ?? 0,
    state: 'patrol', // patrol | suspicious | investigate | chase | look
    suspicion: 0,
    pause: 0,
    target: null, // {x, y} for investigate / chase
    lookTimer: 0,
    speed: GUARD.patrolSpeed,
  };
}

// True when the segment (x1,y1)-(x2,y2) touches rect r.
export function segmentHitsRect(x1, y1, x2, y2, r) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  if (maxX < r.x || minX > r.x + r.w || maxY < r.y || minY > r.y + r.h) return false;
  if (x1 >= r.x && x1 <= r.x + r.w && y1 >= r.y && y1 <= r.y + r.h) return true;
  if (x2 >= r.x && x2 <= r.x + r.w && y2 >= r.y && y2 <= r.y + r.h) return true;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const edges = [
    [r.x, r.y, r.x + r.w, r.y],
    [r.x + r.w, r.y, r.x + r.w, r.y + r.h],
    [r.x + r.w, r.y + r.h, r.x, r.y + r.h],
    [r.x, r.y + r.h, r.x, r.y],
  ];
  for (const [ax, ay, bx, by] of edges) {
    const den = dx * (by - ay) - dy * (bx - ax);
    if (Math.abs(den) < 1e-9) continue;
    const t = ((ax - x1) * (by - ay) - (ay - y1) * (bx - ax)) / den;
    const u = ((ax - x1) * dy - (ay - y1) * dx) / den;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return true;
  }
  return false;
}

// Everything that blocks sight: walls, crates and shelves.
export function sightBlockers(level) {
  return [...level.walls, ...level.crates, ...level.shelves];
}

export function hasLineOfSight(x1, y1, x2, y2, blockers) {
  for (const b of blockers) {
    if (segmentHitsRect(x1, y1, x2, y2, b)) return false;
  }
  return true;
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Is the thief inside this guard's cone right now (range + angle + sight)?
export function inCone(guard, px, py, blockers) {
  const dx = px - guard.x;
  const dy = py - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist > GUARD.coneRange) return { seen: false, dist };
  const ang = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(ang, guard.face)) > GUARD.coneHalfAngle) return { seen: false, dist };
  if (!hasLineOfSight(guard.x, guard.y, px, py, blockers)) return { seen: false, dist };
  return { seen: true, dist };
}

function moveToward(g, tx, ty, speed, dt, solids) {
  const dx = tx - g.x;
  const dy = ty - g.y;
  const d = Math.hypot(dx, dy);
  if (d < 1) return true;
  const step = Math.min(d, speed * dt);
  g.x += (dx / d) * step;
  g.y += (dy / d) * step;
  g.face = Math.atan2(dy, dx);
  g.x = Math.max(ROOM.x + 14, Math.min(ROOM.x + ROOM.w - 14, g.x));
  g.y = Math.max(ROOM.y + 14, Math.min(ROOM.y + ROOM.h - 14, g.y));
  return d - step < 2;
}

// One guard, one tick. Returns 'strike' the moment suspicion tops out.
export function updateGuard(g, dt, ctx) {
  const { player, blockers, solids, onCoinHeard } = ctx;
  const seen = inCone(g, player.x, player.y, blockers);
  const hidden = ctx.isHidden(player);
  if (g.state === 'chase') {
    moveToward(g, player.x, player.y, GUARD.chaseSpeed, dt, solids);
    g.chaseTimer -= dt;
    if (g.chaseTimer <= 0) {
      g.state = 'patrol';
      g.suspicion = 40;
    }
    return null;
  }
  if (g.state === 'investigate' && g.target) {
    if (moveToward(g, g.target.x, g.target.y, GUARD.investigateSpeed, dt, solids)) {
      g.state = 'look';
      g.lookTimer = 2.2;
    }
    if (seen.seen && !hidden) g.suspicion += GUARD.suspicionRate * 0.5 * dt;
    return null;
  }
  if (g.state === 'look') {
    g.lookTimer -= dt;
    g.face += dt * 1.4;
    if (seen.seen && !hidden) {
      g.state = 'suspicious';
      g.suspicion = Math.max(g.suspicion, 55);
    } else if (g.lookTimer <= 0) {
      g.state = 'patrol';
      g.suspicion = Math.max(0, g.suspicion - 30);
    }
    return null;
  }
  // patrol / suspicious share the watch logic
  if (seen.seen && !hidden) {
    const closeness = 1 - (seen.dist / GUARD.coneRange) * 0.6;
    const light = ctx.lightFactor(player);
    const stance = player.sneaking ? 0.55 : 1;
    g.suspicion += GUARD.suspicionRate * closeness * light * stance * dt;
    g.state = g.suspicion > 35 ? 'suspicious' : 'patrol';
    g.face = Math.atan2(player.y - g.y, player.x - g.x);
    if (g.suspicion >= 100) {
      g.suspicion = 100;
      return 'strike';
    }
  } else {
    g.suspicion = Math.max(0, g.suspicion - GUARD.suspicionDecay * dt);
    if (g.suspicion <= 35 && g.state === 'suspicious') g.state = 'patrol';
  }
  if (g.state === 'suspicious') {
    // Creep toward the last place the thief was glimpsed.
    moveToward(g, player.x, player.y, GUARD.patrolSpeed * 0.7, dt, solids);
    return null;
  }
  // patrol: walk the waypoints, pausing at each.
  if (g.pause > 0) {
    g.pause -= dt;
    return null;
  }
  const wp = g.waypoints[g.wpIndex];
  if (moveToward(g, wp[0], wp[1], GUARD.patrolSpeed, dt, solids)) {
    g.wpIndex = (g.wpIndex + 1) % g.waypoints.length;
    g.pause = GUARD.waypointPause;
  }
  return null;
}

// A coin lands: the nearest guard in earshot turns to investigate it.
export function sendGuardToCoin(guards, x, y, radius) {
  let best = null;
  let bestDist = Infinity;
  for (const g of guards) {
    const d = Math.hypot(g.x - x, g.y - y);
    if (d < radius && d < bestDist && g.state !== 'chase') {
      best = g;
      bestDist = d;
    }
  }
  if (best) {
    best.state = 'investigate';
    best.target = { x, y };
    best.suspicion = Math.max(best.suspicion, 20);
    return best;
  }
  return null;
}

export function guardConePath(g) {
  return {
    x: g.x,
    y: g.y,
    range: GUARD.coneRange,
    half: GUARD.coneHalfAngle,
    face: g.face,
    alerted: g.state === 'chase' || g.suspicion > 70,
  };
}
