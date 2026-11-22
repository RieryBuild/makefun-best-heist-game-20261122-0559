// render.js — one job: draw everything. The room and its dressing, the
// guards and their cones, the cameras, the thief, the HUD top bar, the
// FIELD NOTES side panel, the controls bar, and the title / win / fail /
// pause screens. It never moves anything and never reads input; it only
// paints the state main.js hands it.
import { VIEW, HUD, ROOM, PANEL, BAR, PALETTE, GUARD, CAMERA } from './config.js';
import { guardConePath } from './guards.js';
import { cameraArcPath } from './cameras.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, weight = '600', align = 'left', font = 'Georgia') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${font}, serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}

function mono(ctx, s, x, y, size, color, weight = '600', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Courier New", monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}

function wedge(ctx, x, y, range, half, face, fill, edge) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, face - half, face + half);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawFloor(ctx) {
  ctx.fillStyle = PALETTE.floorA;
  ctx.fillRect(ROOM.x, ROOM.y, ROOM.w, ROOM.h);
  // wood planks: alternating shades, staggered joints
  for (let y = ROOM.y; y < ROOM.y + ROOM.h; y += 46) {
    const row = Math.floor((y - ROOM.y) / 46);
    ctx.fillStyle = row % 2 ? PALETTE.floorB : PALETTE.floorA;
    ctx.fillRect(ROOM.x, y, ROOM.w, 46);
    ctx.strokeStyle = PALETTE.floorLine;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ROOM.x, y);
    ctx.lineTo(ROOM.x + ROOM.w, y);
    ctx.stroke();
    const off = row % 2 ? 120 : 0;
    for (let x = ROOM.x + off; x < ROOM.x + ROOM.w; x += 240) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 46);
      ctx.stroke();
    }
  }
}

function drawRugs(ctx, level) {
  for (const r of level.rugs) {
    ctx.fillStyle = PALETTE.rug;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = PALETTE.rugTrim;
    ctx.lineWidth = 3;
    ctx.strokeRect(r.x + 6, r.y + 6, r.w - 12, r.h - 12);
    ctx.fillStyle = 'rgba(201,162,39,0.5)';
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 16);
    ctx.lineTo(cx + 16, cy);
    ctx.lineTo(cx, cy + 16);
    ctx.lineTo(cx - 16, cy);
    ctx.closePath();
    ctx.fill();
  }
}

function drawGrass(ctx, level) {
  for (const g of level.grass) {
    ctx.fillStyle = PALETTE.grass;
    rr(ctx, g.x, g.y, g.w, g.h, 8);
    ctx.fill();
    ctx.strokeStyle = PALETTE.grassBlade;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 26; i++) {
      const bx = g.x + 8 + ((i * 37) % (g.w - 16));
      const by = g.y + 8 + ((i * 53) % (g.h - 16));
      const lean = Math.sin(i * 2.7) * 5;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + lean, by - 9);
      ctx.stroke();
    }
  }
}

function drawWalls(ctx, level) {
  // room border with amber trim
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(ROOM.x - 6, ROOM.y - 6, ROOM.w + 12, 10);
  ctx.fillRect(ROOM.x - 6, ROOM.y + ROOM.h - 4, ROOM.w + 12, 10);
  ctx.fillRect(ROOM.x - 6, ROOM.y - 6, 10, ROOM.h + 12);
  ctx.fillRect(ROOM.x + ROOM.w - 4, ROOM.y - 6, 10, ROOM.h + 12);
  ctx.strokeStyle = PALETTE.wallTrim;
  ctx.lineWidth = 2;
  ctx.strokeRect(ROOM.x - 6, ROOM.y - 6, ROOM.w + 12, ROOM.h + 12);
  // wall panels along the border
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let x = ROOM.x + 30; x < ROOM.x + ROOM.w - 40; x += 90) {
    ctx.fillRect(x, ROOM.y - 4, 54, 6);
    ctx.fillRect(x, ROOM.y + ROOM.h - 2, 54, 6);
  }
  for (const w of level.walls) {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = PALETTE.wallTop;
    ctx.fillRect(w.x, w.y, w.w, 4);
    ctx.strokeStyle = PALETTE.wallTrim;
    ctx.lineWidth = 1;
    ctx.strokeRect(w.x + 0.5, w.y + 0.5, w.w - 1, w.h - 1);
  }
}

function drawShelves(ctx, level) {
  for (const s of level.shelves) {
    ctx.fillStyle = PALETTE.shelf;
    ctx.fillRect(s.x, s.y, s.w, s.h);
    for (let i = 0; i < Math.floor(s.w / 12); i++) {
      ctx.fillStyle = PALETTE.book[i % PALETTE.book.length];
      const bx = s.x + 4 + i * 12;
      ctx.fillRect(bx, s.y + 4, 8, s.h - 8);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(s.x, s.y + s.h - 4, s.w, 4);
  }
}

function drawCrates(ctx, level) {
  for (const c of level.crates) {
    ctx.fillStyle = PALETTE.crate;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = PALETTE.crateEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(c.x + c.w, c.y + c.h);
    ctx.moveTo(c.x + c.w, c.y);
    ctx.lineTo(c.x, c.y + c.h);
    ctx.stroke();
  }
}

function drawPlants(ctx, level) {
  for (const p of level.plants) {
    ctx.fillStyle = '#7a4a26';
    ctx.beginPath();
    ctx.moveTo(p.x - 10, p.y);
    ctx.lineTo(p.x + 10, p.y);
    ctx.lineTo(p.x + 7, p.y + 14);
    ctx.lineTo(p.x - 7, p.y + 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = PALETTE.plant;
    ctx.beginPath();
    ctx.arc(p.x - 7, p.y - 8, 9, 0, Math.PI * 2);
    ctx.arc(p.x + 7, p.y - 8, 9, 0, Math.PI * 2);
    ctx.arc(p.x, p.y - 16, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3f8f4f';
    ctx.beginPath();
    ctx.arc(p.x - 4, p.y - 12, 4, 0, Math.PI * 2);
    ctx.arc(p.x + 5, p.y - 15, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLamps(ctx, level, t) {
  for (const l of level.lamps) {
    const pulse = 0.16 + Math.sin(t * 1.6 + l.x) * 0.03;
    const g = ctx.createRadialGradient(l.x, l.y, 8, l.x, l.y, l.r);
    g.addColorStop(0, `rgba(255, 190, 90, ${pulse + 0.10})`);
    g.addColorStop(1, 'rgba(255, 190, 90, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5a4632';
    ctx.fillRect(l.x - 2, l.y - 4, 4, 8);
    ctx.fillStyle = PALETTE.lampCore;
    ctx.beginPath();
    ctx.arc(l.x, l.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(l.x - 2, l.y - 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLoot(ctx, level, state) {
  const l = level.loot;
  const pulse = 0.5 + Math.sin(state.time * 3) * 0.2;
  if (!state.lootTaken) {
    const g = ctx.createRadialGradient(l.x, l.y, 4, l.x, l.y, 54);
    g.addColorStop(0, `rgba(245, 197, 66, ${0.45 * pulse + 0.25})`);
    g.addColorStop(1, 'rgba(245, 197, 66, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(l.x, l.y, 54, 0, Math.PI * 2);
    ctx.fill();
    // pedestal
    ctx.fillStyle = '#3a3f4a';
    ctx.fillRect(l.x - 16, l.y + 8, 32, 14);
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(l.x, l.y - 2, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.arc(l.x - 3, l.y - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    // sparkle rays
    ctx.strokeStyle = `rgba(245, 197, 66, ${0.8 * pulse})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + state.time * 0.6;
      ctx.beginPath();
      ctx.moveTo(l.x + Math.cos(a) * 16, l.y - 2 + Math.sin(a) * 16);
      ctx.lineTo(l.x + Math.cos(a) * 22, l.y - 2 + Math.sin(a) * 22);
      ctx.stroke();
    }
    text(ctx, '◆ LOOT', l.x, l.y - 26, 11, PALETTE.gold, '700', 'center', '"Courier New", monospace');
  } else {
    ctx.fillStyle = '#3a3f4a';
    ctx.fillRect(l.x - 16, l.y + 8, 32, 14);
    mono(ctx, 'TAKEN', l.x, l.y - 26, 11, PALETTE.teal, '700', 'center');
  }
}

function drawExit(ctx, level, state) {
  const e = level.exit;
  const open = state.lootTaken;
  const glow = open ? 0.5 + Math.sin(state.time * 4) * 0.15 : 0.12;
  const g = ctx.createRadialGradient(e.x + e.w / 2, e.y + e.h / 2, 4, e.x + e.w / 2, e.y + e.h / 2, 70);
  g.addColorStop(0, `rgba(46, 196, 166, ${glow})`);
  g.addColorStop(1, 'rgba(46, 196, 166, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(e.x + e.w / 2, e.y + e.h / 2, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = open ? PALETTE.teal : '#23403a';
  rr(ctx, e.x, e.y, e.w, e.h, 4);
  ctx.fill();
  ctx.strokeStyle = open ? '#a7f3e0' : PALETTE.tealDim;
  ctx.lineWidth = 2;
  rr(ctx, e.x, e.y, e.w, e.h, 4);
  ctx.stroke();
  text(ctx, 'EXIT', e.x + e.w / 2, e.y + e.h / 2 + 4, 12, open ? '#06281f' : '#7dd8c3', '700', 'center', '"Courier New", monospace');
  if (!open) {
    mono(ctx, 'LOCKED', e.x + e.w / 2, e.y + e.h + 14, 10, PALETTE.inkDim, '700', 'center');
  }
}

function drawCoins(ctx, state) {
  for (const c of state.coins) {
    const age = state.time - c.born;
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 197, 66, 0.7)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 2; i++) {
      const r = 8 + ((age * 40 + i * 22) % 44);
      ctx.globalAlpha = Math.max(0, 0.8 - (r - 8) / 44);
      ctx.beginPath();
      ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (!c.landed) mono(ctx, '♪', c.x + 8, c.y - 8, 12, PALETTE.gold, '700', 'left');
  }
}

function drawSmoke(ctx, state) {
  for (const s of state.smokes) {
    const fade = Math.min(1, s.left / 1.2);
    ctx.fillStyle = `rgba(180, 190, 200, ${0.5 * fade})`;
    ctx.beginPath();
    ctx.arc(s.x - 18, s.y - 6, 34, 0, Math.PI * 2);
    ctx.arc(s.x + 20, s.y + 8, 38, 0, Math.PI * 2);
    ctx.arc(s.x, s.y - 18, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(220, 230, 240, ${0.35 * fade})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 92, 0, Math.PI * 2);
    ctx.stroke();
    mono(ctx, 'SMOKE', s.x, s.y - 96, 10, 'rgba(220,230,240,0.8)', '700', 'center');
  }
}

function drawCones(ctx, state) {
  for (const g of state.guards) {
    const c = guardConePath(g);
    const fill = c.alerted ? PALETTE.coneAlert : PALETTE.cone;
    const edge = c.alerted ? 'rgba(229,72,77,0.7)' : PALETTE.coneEdge;
    wedge(ctx, c.x, c.y, c.range, c.half, c.face, fill, edge);
  }
  for (const cam of state.cameras) {
    const a = cameraArcPath(cam);
    wedge(ctx, a.x, a.y, a.range, a.half, a.angle, PALETTE.cameraArc, 'rgba(46,196,166,0.45)');
  }
}

function drawGuards(ctx, state) {
  for (const g of state.guards) {
    // body
    ctx.fillStyle = PALETTE.guard;
    ctx.beginPath();
    ctx.arc(g.x, g.y, GUARD.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = g.state === 'chase' ? PALETTE.red : PALETTE.guardTrim;
    ctx.lineWidth = 2;
    ctx.stroke();
    // facing tick
    ctx.strokeStyle = '#e8e4d8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + Math.cos(g.face) * 16, g.y + Math.sin(g.face) * 16);
    ctx.stroke();
    // eyes
    ctx.fillStyle = '#e8e4d8';
    ctx.beginPath();
    ctx.arc(g.x + Math.cos(g.face - 0.5) * 6, g.y + Math.sin(g.face - 0.5) * 6, 2, 0, Math.PI * 2);
    ctx.arc(g.x + Math.cos(g.face + 0.5) * 6, g.y + Math.sin(g.face + 0.5) * 6, 2, 0, Math.PI * 2);
    ctx.fill();
    // state mark
    if (g.state === 'chase') {
      text(ctx, '!', g.x, g.y - 20, 20, PALETTE.red, '700', 'center');
    } else if (g.state === 'suspicious') {
      text(ctx, '?', g.x, g.y - 20, 18, PALETTE.amber, '700', 'center');
    } else if (g.state === 'investigate' || g.state === 'look') {
      text(ctx, '?', g.x, g.y - 20, 15, '#9aa3b2', '700', 'center');
    }
    // suspicion arc
    if (g.suspicion > 5) {
      ctx.strokeStyle = g.suspicion > 70 ? PALETTE.red : PALETTE.amber;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(g.x, g.y, GUARD.radius + 6, -Math.PI / 2, -Math.PI / 2 + (g.suspicion / 100) * Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawCameras(ctx, state) {
  for (const cam of state.cameras) {
    ctx.fillStyle = '#22262e';
    ctx.fillRect(cam.x - 9, cam.y - 7, 18, 14);
    ctx.strokeStyle = PALETTE.teal;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cam.x - 9, cam.y - 7, 18, 14);
    ctx.fillStyle = PALETTE.red;
    ctx.beginPath();
    ctx.arc(cam.x + Math.cos(cam.angle) * 10, cam.y + Math.sin(cam.angle) * 10, 3, 0, Math.PI * 2);
    ctx.fill();
    mono(ctx, 'CAM', cam.x, cam.y - 12, 9, PALETTE.teal, '700', 'center');
  }
}

function drawPlayer(ctx, state) {
  const p = state.player;
  const glow = p.sneaking ? 0.12 : 0.22;
  const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 26);
  g.addColorStop(0, `rgba(232, 228, 216, ${glow})`);
  g.addColorStop(1, 'rgba(232, 228, 216, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.playerCloak;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.amber;
  ctx.lineWidth = 2;
  ctx.stroke();
  // mask + eyes
  ctx.fillStyle = PALETTE.player;
  ctx.beginPath();
  ctx.arc(p.x + Math.cos(p.face - 0.45) * 5, p.y + Math.sin(p.face - 0.45) * 5, 1.8, 0, Math.PI * 2);
  ctx.arc(p.x + Math.cos(p.face + 0.45) * 5, p.y + Math.sin(p.face + 0.45) * 5, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.player;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + Math.cos(p.face) * 14, p.y + Math.sin(p.face) * 14);
  ctx.stroke();
  mono(ctx, 'YOU', p.x, p.y - 20, 10, PALETTE.ink, '700', 'center');
  if (p.sneaking) mono(ctx, 'SNEAK', p.x, p.y + 26, 9, PALETTE.teal, '700', 'center');
}

// ---- HUD, panels, bars, screens (appended to render.js) ----

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function meter(ctx, x, y, w, h, frac, fill, label) {
  ctx.fillStyle = '#0a0d12';
  rr(ctx, x, y, w, h, 4);
  ctx.fill();
  ctx.fillStyle = fill;
  const fw = Math.max(0, Math.min(1, frac)) * w;
  if (fw > 0) {
    rr(ctx, x, y, fw, h, 4);
    ctx.fill();
  }
  ctx.strokeStyle = '#39415a';
  ctx.lineWidth = 1;
  rr(ctx, x, y, w, h, 4);
  ctx.stroke();
  if (label) mono(ctx, label, x + w / 2, y + h - 4, 10, '#0d1117', '700', 'center');
}

function drawHud(ctx, state) {
  const level = state.level;
  ctx.fillStyle = '#0a0d12';
  ctx.fillRect(0, 0, VIEW.w, HUD.h);
  ctx.fillStyle = PALETTE.wallTrim;
  ctx.fillRect(0, HUD.h - 2, VIEW.w, 2);
  text(ctx, 'THE GILDED HOUR', 16, 26, 20, PALETTE.amber, '700');
  mono(ctx, '☆ FIVE HEISTS · ONE NIGHT', 16, 46, 10, PALETTE.inkDim, '600');
  text(ctx, level.name, 330, 24, 15, PALETTE.ink, '700');
  mono(ctx, state.lootTaken ? 'OBJECTIVE: REACH THE GREEN EXIT' : `OBJECTIVE: LIFT ${level.loot.name.toUpperCase()}`, 330, 44, 10, state.lootTaken ? PALETTE.teal : PALETTE.inkDim, '600');
  // visibility pill
  const vis = state.visibility;
  const visColor = vis === 'SPOTTED' ? PALETTE.red : vis === 'IN LIGHT' ? PALETTE.amber : PALETTE.teal;
  ctx.fillStyle = vis === 'SPOTTED' ? PALETTE.redDim : '#1a2230';
  rr(ctx, 640, 12, 118, 30, 15);
  ctx.fill();
  ctx.strokeStyle = visColor;
  ctx.lineWidth = 1.5;
  rr(ctx, 640, 12, 118, 30, 15);
  ctx.stroke();
  mono(ctx, vis === 'HIDDEN' ? '◉ HIDDEN' : vis === 'IN LIGHT' ? '☀ IN LIGHT' : '⚠ SPOTTED', 699, 32, 11, visColor, '700', 'center');
  // loot + timer
  mono(ctx, `LOOT ${state.lootTaken ? 1 : 0}/1`, 790, 26, 12, PALETTE.gold, '700');
  mono(ctx, `◷ ${fmtTime(state.levelTime)}`, 790, 46, 11, PALETTE.inkDim, '600');
  // alarm meter + strikes
  mono(ctx, 'ALARM', 880, 20, 10, PALETTE.red, '700');
  meter(ctx, 880, 26, 150, 14, state.alarm / 100, PALETTE.red);
  mono(ctx, '✦'.repeat(state.strikes) + '◇'.repeat(3 - state.strikes), 1040, 38, 13, PALETTE.red, '700');
  mono(ctx, 'STRIKES', 1040, 20, 9, PALETTE.inkDim, '600');
  mono(ctx, `SCORE ${state.totalScore}`, 1130, 26, 12, PALETTE.ink, '700');
  mono(ctx, state.muted ? '♪ MUTED (M)' : '♪ SOUND ON (M)', 1130, 46, 10, PALETTE.inkDim, '600');
}

function legendRow(ctx, x, y, drawIcon, label) {
  drawIcon(x + 10, y - 4);
  mono(ctx, label, x + 26, y, 11, PALETTE.ink, '600');
}

function drawPanel(ctx, state) {
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h);
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 1;
  ctx.strokeRect(PANEL.x + 0.5, PANEL.y + 0.5, PANEL.w - 1, PANEL.h - 1);
  const x = PANEL.x + 16;
  let y = PANEL.y + 20;
  text(ctx, 'FIELD NOTES', x, y, 15, PALETTE.amber, '700');
  mono(ctx, 'READ THE ROOM BEFORE YOU MOVE', x, y + 15, 9, PALETTE.inkDim, '600');
  y += 30;
  ctx.fillStyle = PALETTE.wallTrim;
  ctx.fillRect(x, y, PANEL.w - 32, 1);
  y += 18;
  // legend — one row per thing the room can do to you
  const rows = [
    ['GUARD CONE — SEEN = SUSPICION', (cx, cy) => {
      wedge(ctx, cx, cy, 12, 0.56, 0, PALETTE.cone, PALETTE.coneEdge);
      ctx.fillStyle = PALETTE.guard;
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    }],
    ['CAMERA ARC — FEEDS THE ALARM', (cx, cy) => {
      wedge(ctx, cx, cy, 12, 0.44, 0, PALETTE.cameraArc, 'rgba(46,196,166,0.6)');
      ctx.fillStyle = PALETTE.red;
      ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill();
    }],
    ['LOOT — GRAB WITH E, THEN RUN', (cx, cy) => {
      ctx.fillStyle = PALETTE.gold;
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    }],
    ['EXIT — OPENS AFTER THE LOOT', (cx, cy) => {
      ctx.fillStyle = PALETTE.teal;
      ctx.fillRect(cx - 6, cy - 6, 12, 12);
    }],
    ['GRASS — SNEAK HERE, VANISH', (cx, cy) => {
      ctx.fillStyle = PALETTE.grass;
      ctx.fillRect(cx - 8, cy - 6, 16, 12);
      ctx.strokeStyle = PALETTE.grassBlade;
      ctx.beginPath(); ctx.moveTo(cx - 3, cy + 4); ctx.lineTo(cx - 3, cy - 4); ctx.moveTo(cx + 3, cy + 4); ctx.lineTo(cx + 3, cy - 4); ctx.stroke();
    }],
    ['LAMPLIGHT — SEEN FROM FAR AWAY', (cx, cy) => {
      const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, 9);
      g.addColorStop(0, 'rgba(255,190,90,0.6)'); g.addColorStop(1, 'rgba(255,190,90,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = PALETTE.lampCore; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
    }],
    ['CRATES — COVER THAT BLOCKS SIGHT', (cx, cy) => {
      ctx.fillStyle = PALETTE.crate; ctx.fillRect(cx - 7, cy - 7, 14, 14);
      ctx.strokeStyle = PALETTE.crateEdge; ctx.strokeRect(cx - 7, cy - 7, 14, 14);
    }],
  ];
  for (const [label, icon] of rows) {
    legendRow(ctx, x, y, icon, label);
    y += 19;
  }
  y += 2;
  ctx.fillStyle = PALETTE.wallTrim;
  ctx.fillRect(x, y, PANEL.w - 32, 1);
  y += 18;
  // detection panel
  text(ctx, 'DETECTION', x, y, 13, PALETTE.ink, '700'); y += 18;
  const hottest = state.guards.reduce((m, g) => Math.max(m, g.suspicion), 0);
  mono(ctx, 'NEAREST GUARD SUSPICION', x, y, 10, PALETTE.inkDim, '600'); y += 7;
  meter(ctx, x, y, PANEL.w - 32, 12, hottest / 100, hottest > 70 ? PALETTE.red : PALETTE.amber);
  y += 24;
  mono(ctx, 'ALARM METER — 100 = ONE STRIKE', x, y, 10, PALETTE.inkDim, '600'); y += 7;
  meter(ctx, x, y, PANEL.w - 32, 12, state.alarm / 100, PALETTE.red);
  y += 24;
  ctx.fillStyle = PALETTE.wallTrim;
  ctx.fillRect(x, y, PANEL.w - 32, 1);
  y += 18;
  // tools
  text(ctx, 'TOOLS', x, y, 13, PALETTE.ink, '700'); y += 18;
  mono(ctx, `◉ COINS ×${state.coinsLeft}  — CLICK TO THROW, LURES A GUARD`, x, y, 10, PALETTE.ink, '600'); y += 16;
  mono(ctx, `◍ SMOKE ×${state.smokeLeft}  — Q TO BLIND CONES`, x, y, 10, PALETTE.ink, '600'); y += 16;
  mono(ctx, 'SHIFT SNEAK — SLOW, QUIET, HIDDEN', x, y, 10, PALETTE.ink, '600'); y += 20;
  ctx.fillStyle = PALETTE.wallTrim;
  ctx.fillRect(x, y, PANEL.w - 32, 1);
  y += 18;
  // heist list
  text(ctx, 'THE NIGHT', x, y, 13, PALETTE.ink, '700'); y += 18;
  state.heistList.forEach((h, i) => {
    const done = i < state.levelIndex;
    const cur = i === state.levelIndex;
    mono(ctx, `${done ? '✓' : cur ? '►' : '·'} ${i + 1}. ${h}`, x, y, 11, cur ? PALETTE.amber : done ? PALETTE.teal : PALETTE.inkDim, cur ? '700' : '600');
    y += 15;
  });
  y += 2;
  // tip — wrapped to the box, never spilling past its edge
  ctx.fillStyle = '#1a2230';
  rr(ctx, x, y, PANEL.w - 32, 54, 6);
  ctx.fill();
  const tipWords = ('TIP: ' + state.level.hint).split(' ');
  const tipLines = [''];
  for (const w of tipWords) {
    const last = tipLines[tipLines.length - 1];
    if ((last + ' ' + w).trim().length > 44) tipLines.push(w);
    else tipLines[tipLines.length - 1] = (last + ' ' + w).trim();
  }
  mono(ctx, tipLines[0] || '', x + 10, y + 15, 9, PALETTE.inkDim, '600');
  mono(ctx, tipLines[1] || '', x + 10, y + 29, 9, PALETTE.inkDim, '600');
  mono(ctx, 'GHOST BONUS +500 IF NEVER SPOTTED.', x + 10, y + 43, 9, PALETTE.teal, '600');
}

function drawBar(ctx) {
  ctx.fillStyle = '#0a0d12';
  ctx.fillRect(0, BAR.y, VIEW.w, BAR.h);
  ctx.fillStyle = PALETTE.wallTrim;
  ctx.fillRect(0, BAR.y, VIEW.w, 2);
  mono(ctx, 'WASD MOVE', 16, BAR.y + 26, 12, PALETTE.ink, '700');
  mono(ctx, 'SHIFT SNEAK', 150, BAR.y + 26, 12, PALETTE.ink, '700');
  mono(ctx, 'MOUSE AIM · CLICK THROW COIN', 300, BAR.y + 26, 12, PALETTE.amber, '700');
  mono(ctx, 'Q SMOKE', 570, BAR.y + 26, 12, PALETTE.ink, '700');
  mono(ctx, 'E GRAB', 660, BAR.y + 26, 12, PALETTE.gold, '700');
  mono(ctx, 'R RETRY', 760, BAR.y + 26, 12, PALETTE.ink, '700');
  mono(ctx, 'ESC PAUSE', 860, BAR.y + 26, 12, PALETTE.ink, '700');
  mono(ctx, 'H NOTES', 970, BAR.y + 26, 12, PALETTE.ink, '700');
  mono(ctx, 'M MUTE', 1070, BAR.y + 26, 12, PALETTE.ink, '700');
  mono(ctx, 'HOLD SHIFT IN GRASS OR SHADOW TO VANISH FROM CONES', 16, BAR.y + 50, 10, PALETTE.inkDim, '600');
}

function drawCallouts(ctx, state) {
  // Annotated teaching labels, drawn only on the judged play frame.
  const lamp = state.level.lamps[0];
  const inv = state.guards.find((g) => g.state === 'investigate' || g.state === 'look')
    || state.guards[0];
  const p = state.player;
  const notes = [
    { x: lamp.x, y: lamp.y, bx: lamp.x + 60, by: lamp.y - 70, lines: ['LAMPLIGHT: SEEN FROM', 'ACROSS THE ROOM'] },
    { x: inv.x, y: inv.y, bx: inv.x + 40, by: inv.y + 90, lines: ['? HEARD THE COIN:', 'OFF TO LOOK'] },
    { x: p.x, y: p.y, bx: p.x - 190, by: p.y + 60, lines: ['YOU: SNEAKING IN THE GRASS —', 'UNSEEN WHILE THE CONE PASSES'] },
  ];
  for (const n of notes) {
    const w = 190;
    const h = 40;
    // Keep every annotation box inside the frame.
    const bx = Math.max(16, Math.min(1264 - w, n.bx));
    const by = Math.max(70, Math.min(636 - h, n.by));
    ctx.strokeStyle = PALETTE.amber;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(n.x, n.y);
    ctx.lineTo(bx + w / 2, by + h / 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(10, 13, 18, 0.92)';
    rr(ctx, bx, by, w, h, 5);
    ctx.fill();
    ctx.strokeStyle = PALETTE.amber;
    rr(ctx, bx, by, w, h, 5);
    ctx.stroke();
    mono(ctx, n.lines[0], bx + 10, by + 16, 10, PALETTE.amber, '700');
    mono(ctx, n.lines[1], bx + 10, by + 32, 10, PALETTE.ink, '700');
  }
}

function overlay(ctx, title, titleColor, lines, foot) {
  ctx.fillStyle = 'rgba(8, 10, 14, 0.72)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  ctx.fillStyle = '#12161f';
  rr(ctx, 340, 150, 600, 400, 10);
  ctx.fill();
  ctx.strokeStyle = PALETTE.wallTrim;
  ctx.lineWidth = 2;
  rr(ctx, 340, 150, 600, 400, 10);
  ctx.stroke();
  text(ctx, title, 640, 230, 40, titleColor, '700', 'center');
  let y = 290;
  for (const l of lines) {
    mono(ctx, l.text, 640, y, l.size || 14, l.color || PALETTE.ink, l.bold ? '700' : '600', 'center');
    y += 34;
  }
  mono(ctx, foot, 640, 510, 12, PALETTE.inkDim, '600', 'center');
}

function drawTitle(ctx, state) {
  // dimmed room behind the title, one guard cone sweeping
  drawRoomOnly(ctx, state, 0.45);
  ctx.fillStyle = 'rgba(8, 10, 14, 0.55)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  text(ctx, 'THE GILDED HOUR', 640, 190, 64, PALETTE.amber, '700', 'center');
  mono(ctx, 'FIVE HEISTS · ONE NIGHT · NO ALARMS', 640, 228, 15, PALETTE.ink, '600', 'center');
  ctx.fillStyle = PALETTE.wallTrim;
  ctx.fillRect(440, 252, 400, 1);
  let y = 300;
  state.heistList.forEach((h, i) => {
    mono(ctx, `${i + 1}. ${h}`, 640, y, 14, i === 0 ? PALETTE.amber : PALETTE.inkDim, '600', 'center');
    y += 28;
  });
  mono(ctx, 'CROSS EACH ROOM UNSEEN · LIFT THE LOOT · SLIP OUT THE GREEN DOOR', 640, 470, 12, PALETTE.teal, '700', 'center');
  mono(ctx, 'WASD MOVE · SHIFT SNEAK · CLICK THROW COIN · Q SMOKE · E GRAB', 640, 500, 12, PALETTE.ink, '600', 'center');
  const blink = Math.floor(state.time * 2) % 2 === 0;
  if (blink) mono(ctx, '— PRESS ENTER OR CLICK TO BEGIN —', 640, 560, 15, PALETTE.gold, '700', 'center');
  mono(ctx, 'AN ORIGINAL GAME · VANILLA CANVAS · NO LIBRARIES · NO NETWORK', 640, 620, 10, PALETTE.inkDim, '600', 'center');
}

function drawRoomOnly(ctx, state, alpha = 1) {
  ctx.save();
  if (alpha < 1) ctx.globalAlpha = alpha;
  drawFloor(ctx);
  drawRugs(ctx, state.level);
  drawGrass(ctx, state.level);
  drawWalls(ctx, state.level);
  drawShelves(ctx, state.level);
  drawCrates(ctx, state.level);
  drawPlants(ctx, state.level);
  drawLamps(ctx, state.level, state.time);
  drawExit(ctx, state.level, state);
  drawLoot(ctx, state.level, state);
  drawCones(ctx, state);
  drawCameras(ctx, state);
  drawGuards(ctx, state);
  drawPlayer(ctx, state);
  drawCoins(ctx, state);
  drawSmoke(ctx, state);
  ctx.restore();
}

export function drawGame(ctx, state) {
  ctx.clearRect(0, 0, VIEW.w, VIEW.h);
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  if (state.screen === 'title') {
    drawTitle(ctx, state);
    return;
  }
  drawRoomOnly(ctx, state);
  drawHud(ctx, state);
  if (state.showNotes) drawPanel(ctx, state);
  drawBar(ctx);
  if (state.callouts) drawCallouts(ctx, state);
  // banner
  if (state.banner && state.bannerT > 0) {
    const a = Math.min(1, state.bannerT);
    ctx.globalAlpha = a;
    text(ctx, state.banner, 470, 110, 30, state.bannerColor || PALETTE.red, '700', 'center');
    ctx.globalAlpha = 1;
  }
  // red flash on a strike
  if (state.flash > 0) {
    ctx.fillStyle = `rgba(229, 72, 77, ${state.flash * 0.22})`;
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  }
  if (state.paused) {
    overlay(ctx, 'PAUSED', PALETTE.ink, [
      { text: 'THE HEIST WAITS. THE GUARDS DO NOT.', size: 14 },
      { text: 'ESC RESUME · R RETRY THE HEIST · M MUTE', size: 12, color: PALETTE.inkDim },
    ], 'THE GILDED HOUR');
    return;
  }
  if (state.screen === 'won') {
    const last = state.heistList[state.levelIndex];
    const lines = [
      { text: `${state.lootTakenName.toUpperCase()} — SECURED`, size: 16, color: PALETTE.gold, bold: true },
      { text: `LOOT ${state.lastScore.loot}  +  TIME ${state.lastScore.time}  +  TOOLS ${state.lastScore.tools}`, size: 14 },
    ];
    if (state.lastScore.ghost > 0) lines.push({ text: `GHOST BONUS +${state.lastScore.ghost} — NEVER SPOTTED`, size: 14, color: PALETTE.teal, bold: true });
    lines.push({ text: `HEIST SCORE ${state.lastScore.total}  ·  NIGHT TOTAL ${state.totalScore}`, size: 15, bold: true });
    if (state.levelIndex >= 4) {
      overlay(ctx, 'THE GRAND GETAWAY', PALETTE.teal, [
        { text: 'ALL FIVE HEISTS COMPLETE. THE NIGHT IS YOURS.', size: 15, color: PALETTE.gold, bold: true },
        ...lines,
        { text: 'ENTER — PLAY THE NIGHT AGAIN', size: 12, color: PALETTE.inkDim },
      ], 'THE GILDED HOUR');
    } else {
      overlay(ctx, 'CLEAN GETAWAY', PALETTE.teal, [
        ...lines,
        { text: `NEXT: ${state.heistList[state.levelIndex + 1]}`, size: 14, color: PALETTE.amber },
        { text: 'ENTER — NEXT HEIST', size: 12, color: PALETTE.inkDim },
      ], 'THE GILDED HOUR');
    }
    return;
  }
  if (state.screen === 'failed') {
    overlay(ctx, 'CAUGHT', PALETTE.red, [
      { text: 'THREE STRIKES. THE ALARM WON THE NIGHT.', size: 15, bold: true },
      { text: `${state.level.name} — THE LOOT STAYS PUT.`, size: 13, color: PALETTE.inkDim },
      { text: 'R — TRY THE HEIST AGAIN', size: 13, color: PALETTE.amber },
    ], 'THE GILDED HOUR');
    return;
  }
}
