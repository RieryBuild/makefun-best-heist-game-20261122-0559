// main.js — one job: run the heist. Owns the game state, the update loop,
// the rules (alarm, strikes, loot, exit, score, ghost) and the wiring
// between input, guards, cameras, audio and render. It never draws a pixel
// itself and never defines a room — those live in render.js and levels.js.
import { VIEW, PLAYER, RULES, TOOLS, ROOM } from './config.js';
import { LEVELS } from './levels.js';
import { makeGuard, updateGuard, sendGuardToCoin, sightBlockers } from './guards.js';
import { makeCamera, updateCameraAlarm } from './cameras.js';
import { makeAudio } from './audio.js';
import { makeInput } from './input.js';
import { drawGame } from './render.js';
import { applyShot } from './shots.js';
import { makeRng } from './random.js';

export function createGame(canvas) {
  const ctx = canvas.getContext('2d');
  const input = makeInput(canvas);
  const audio = makeAudio();
  const rng = makeRng(20261122);

  const state = {
    screen: 'title', // title | playing | won | failed
    paused: false,
    time: 0,
    levelIndex: 0,
    level: LEVELS[0],
    heistList: LEVELS.map((l) => l.name),
    player: { x: 66, y: 592, face: -Math.PI / 2, sneaking: false, moving: false },
    guards: [],
    cameras: [],
    coins: [],
    smokes: [],
    lootTaken: false,
    lootTakenName: '',
    alarm: 0,
    strikes: 0,
    spotted: false,
    coinsLeft: TOOLS.coins,
    smokeLeft: TOOLS.smoke,
    levelTime: 0,
    totalScore: 0,
    lastScore: { loot: 0, time: 0, tools: 0, ghost: 0, total: 0 },
    visibility: 'HIDDEN',
    banner: '',
    bannerT: 0,
    bannerColor: '#e5484d',
    flash: 0,
    showNotes: true,
    callouts: false,
    muted: false,
    throwCooldown: 0,
    auto: null, // { waypoints: [[x,y]...], index } — autopilot for screenshots
    stepCount: 0,
  };

  function solids() {
    const l = state.level;
    return [...l.walls, ...l.crates, ...l.shelves];
  }

  function blockers() {
    return sightBlockers(state.level);
  }

  function loadLevel(index) {
    state.levelIndex = index;
    state.level = LEVELS[index];
    const l = state.level;
    state.player = { x: l.start.x, y: l.start.y, face: -Math.PI / 2, sneaking: false, moving: false };
    state.guards = l.guards.map(makeGuard);
    state.cameras = l.cameras.map(makeCamera);
    state.coins = [];
    state.smokes = [];
    state.lootTaken = false;
    state.alarm = 0;
    state.strikes = 0;
    state.spotted = false;
    state.coinsLeft = TOOLS.coins;
    state.smokeLeft = TOOLS.smoke;
    state.levelTime = 0;
    state.banner = '';
    state.bannerT = 0;
    state.flash = 0;
    state.throwCooldown = 0;
    state.auto = null;
    state.screen = 'playing';
    state.paused = false;
  }

  function inLamp(p) {
    return state.level.lamps.some((l) => Math.hypot(p.x - l.x, p.y - l.y) < l.r);
  }

  function inGrass(p) {
    return state.level.grass.some((g) => p.x >= g.x && p.x <= g.x + g.w && p.y >= g.y && p.y <= g.y + g.h);
  }

  function inSmoke(p) {
    return state.smokes.some((s) => Math.hypot(p.x - s.x, p.y - s.y) < 92);
  }

  function isHidden(p) {
    if (inSmoke(p)) return true;
    if (!p.sneaking) return false;
    return inGrass(p) || !inLamp(p); // sneak + grass, or sneak + shadow
  }

  function lightFactor(p) {
    return inLamp(p) ? 1.6 : 0.7;
  }

  function collideCircle(p, r) {
    for (const s of solids()) {
      const cx = Math.max(s.x, Math.min(p.x, s.x + s.w));
      const cy = Math.max(s.y, Math.min(p.y, s.y + s.h));
      const dx = p.x - cx;
      const dy = p.y - cy;
      const d = Math.hypot(dx, dy);
      if (d < r && d > 0.0001) {
        p.x = cx + (dx / d) * r;
        p.y = cy + (dy / d) * r;
      } else if (d <= 0.0001) {
        p.y = s.y - r;
      }
    }
    p.x = Math.max(ROOM.x + r, Math.min(ROOM.x + ROOM.w - r, p.x));
    p.y = Math.max(ROOM.y + r, Math.min(ROOM.y + ROOM.h - r, p.y));
  }

  function showBanner(text, color, seconds = 2.2) {
    state.banner = text;
    state.bannerColor = color || '#e5484d';
    state.bannerT = seconds;
  }

  function onStrike(guard) {
    state.strikes += 1;
    state.spotted = true;
    state.flash = 1;
    state.alarm = Math.min(100, state.alarm + 30);
    audio.alarm();
    audio.caught();
    showBanner(state.strikes >= RULES.strikesToFail ? 'CAUGHT!' : 'SPOTTED!', '#e5484d', 2.4);
    if (guard) {
      guard.state = 'chase';
      guard.chaseTimer = 4;
      guard.suspicion = 100;
    }
    // Fair caught moment: the thief is thrown back to the door, the guard
    // loses the trail after the chase, the night goes on — until strike 3.
    state.player.x = state.level.start.x;
    state.player.y = state.level.start.y;
    for (const g of state.guards) {
      if (g !== guard) g.suspicion = Math.max(0, g.suspicion - 50);
    }
    if (state.strikes >= RULES.strikesToFail) {
      state.screen = 'failed';
      audio.lose();
    }
  }

  function finishHeist() {
    const l = state.level;
    const timeBonus = Math.max(0, RULES.maxTimeBonus - Math.floor(state.levelTime * RULES.timeBonusPerSecond));
    const toolsBonus = (state.coinsLeft + state.smokeLeft) * RULES.toolBonusEach;
    const ghostBonus = state.spotted ? 0 : RULES.ghostBonus;
    const total = l.loot.value + timeBonus + toolsBonus + ghostBonus;
    state.lastScore = { loot: l.loot.value, time: timeBonus, tools: toolsBonus, ghost: ghostBonus, total };
    state.totalScore += total;
    state.lootTakenName = l.loot.name;
    state.screen = 'won';
    audio.win();
    if (state.levelIndex >= LEVELS.length - 1) {
      showBanner('THE GRAND GETAWAY', '#2ec4a6', 3);
    }
  }

  function throwCoin(tx, ty) {
    if (state.coinsLeft <= 0 || state.throwCooldown > 0) return false;
    const p = state.player;
    const dx = tx - p.x;
    const dy = ty - p.y;
    const d = Math.hypot(dx, dy);
    const range = Math.min(d, PLAYER.throwRange);
    const ux = d > 0 ? dx / d : 1;
    const uy = d > 0 ? dy / d : 0;
    state.coins.push({
      sx: p.x, sy: p.y,
      x: p.x + ux * range, y: p.y + uy * range,
      t: 0, landed: false, born: state.time,
    });
    state.coinsLeft -= 1;
    state.throwCooldown = PLAYER.throwCooldown;
    audio.coin();
    return true;
  }

  function dropSmoke() {
    if (state.smokeLeft <= 0) return false;
    state.smokes.push({ x: state.player.x, y: state.player.y, left: RULES.smokeSeconds });
    state.smokeLeft -= 1;
    audio.smoke();
    return true;
  }

  function step(dt) {
    state.time += dt;
    state.stepCount += 1;
    if (state.bannerT > 0) state.bannerT -= dt;
    if (state.flash > 0) state.flash = Math.max(0, state.flash - dt * 0.8);
    if (state.throwCooldown > 0) state.throwCooldown -= dt;
    if (state.screen === 'title') return;
    if (state.screen !== 'playing' || state.paused) return;

    state.levelTime += dt;
    const p = state.player;

    // --- movement (player input, or the screenshot autopilot) ---
    let mv = input.move();
    if (state.auto) {
      const wp = state.auto.waypoints[state.auto.index];
      if (wp) {
        const dx = wp[0] - p.x;
        const dy = wp[1] - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 10) {
          state.auto.index += 1;
        } else {
          mv = { x: dx / d, y: dy / d };
        }
      } else {
        state.auto = null;
      }
    }
    const sneaking = input.sneaking() || (state.auto && state.auto.sneak);
    p.sneaking = sneaking;
    const speed = sneaking ? PLAYER.sneak : PLAYER.walk;
    p.moving = mv.x !== 0 || mv.y !== 0;
    if (p.moving) {
      p.x += mv.x * speed * dt;
      p.y += mv.y * speed * dt;
      p.face = Math.atan2(mv.y, mv.x);
      collideCircle(p, PLAYER.radius);
      if (state.stepCount % 24 === 0) audio.step();
    }

    // --- throw / smoke / grab ---
    const click = input.takeClick();
    if (click && !state.auto) throwCoin(click.x, click.y);
    if (input.wasPressed('KeyQ')) dropSmoke();
    if (input.wasPressed('KeyE')) {
      const l = state.level.loot;
      if (!state.lootTaken && Math.hypot(p.x - l.x, p.y - l.y) < PLAYER.grabRange + 14) {
        state.lootTaken = true;
        audio.grab();
        showBanner('LOOT SECURED — TO THE EXIT', '#f5c542', 2.4);
      }
    }

    // --- coins in flight, then noise ---
    for (const c of state.coins) {
      if (!c.landed) {
        c.t += dt * 3.2;
        if (c.t >= 1) {
          c.landed = true;
          c.born = state.time;
          audio.coinLand();
          const g = sendGuardToCoin(state.guards, c.x, c.y, RULES.coinNoiseRadius);
          if (g) audio.suspicious();
        }
      }
    }
    state.coins = state.coins.filter((c) => state.time - c.born < 6);

    // --- smoke ---
    for (const s of state.smokes) s.left -= dt;
    state.smokes = state.smokes.filter((s) => s.left > 0);

    // --- guards ---
    const ctx = {
      player: p,
      blockers: blockers(),
      solids: solids(),
      isHidden,
      lightFactor,
    };
    for (const g of state.guards) {
      const result = updateGuard(g, dt, ctx);
      if (result === 'strike') onStrike(g);
      if (state.screen !== 'playing') return;
    }

    // --- cameras feed the alarm ---
    let alarmGain = 0;
    for (const cam of state.cameras) {
      alarmGain += updateCameraAlarm(cam, dt, p, blockers(), isHidden);
    }
    if (alarmGain > 0) {
      state.alarm = Math.min(100, state.alarm + alarmGain);
      if (state.alarm >= RULES.alarmStrikeAt) {
        state.alarm = 45;
        onStrike(null);
        if (state.screen !== 'playing') return;
      }
    } else {
      state.alarm = Math.max(0, state.alarm - 10 * dt);
    }

    // --- visibility readout ---
    const anyHot = state.guards.some((g) => g.state === 'chase' || g.suspicion > 70);
    state.visibility = anyHot ? 'SPOTTED' : inLamp(p) ? 'IN LIGHT' : 'HIDDEN';

    // --- exit ---
    if (state.lootTaken) {
      const e = state.level.exit;
      if (p.x > e.x - 6 && p.x < e.x + e.w + 6 && p.y > e.y - 6 && p.y < e.y + e.h + 6) {
        finishHeist();
      }
    }
  }

  function handleKeys() {
    if (input.wasPressed('Enter')) {
      audio.unlock();
      if (state.screen === 'title') {
        audio.click();
        loadLevel(0);
        state.totalScore = 0;
      } else if (state.screen === 'won') {
        if (state.levelIndex >= LEVELS.length - 1) {
          state.totalScore = 0;
          loadLevel(0);
        } else {
          loadLevel(state.levelIndex + 1);
        }
      } else if (state.screen === 'failed') {
        loadLevel(state.levelIndex);
      }
    }
    if (input.wasPressed('KeyR')) {
      if (state.screen === 'playing' || state.screen === 'failed') {
        loadLevel(state.levelIndex);
      }
    }
    if (input.wasPressed('Escape') || input.wasPressed('KeyP')) {
      if (state.screen === 'playing') {
        state.paused = !state.paused;
        audio.click();
      }
    }
    if (input.wasPressed('KeyH')) {
      state.showNotes = !state.showNotes;
    }
    if (input.wasPressed('KeyM')) {
      state.muted = !state.muted;
      audio.setMuted(state.muted);
    }
  }

  function frame(now) {
    const dt = Math.min(1 / 30, (now - frame.last) / 1000 || 1 / 60);
    frame.last = now;
    handleKeys();
    // click to start from the title screen
    if (state.screen === 'title') {
      const click = input.takeClick();
      if (click) {
        audio.unlock();
        audio.click();
        loadLevel(0);
        state.totalScore = 0;
      }
    }
    step(dt);
    drawGame(ctx, state);
    requestAnimationFrame(frame);
  }
  frame.last = performance.now();

  // Screenshot scenes (?shot=title|play|alarm|win&seed=1) run the real game
  // forward a fixed number of fixed steps — no wall-clock, no randomness
  // beyond the seed — then freeze on the frame the camera takes.
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot) {
    const seed = Number(params.get('seed') || 1);
    state.rngSeed = seed;
    applyShot({ state, step, loadLevel, input, throwCoin, audio }, shot, seed);
    drawGame(ctx, state);
    window.__heistShot = shot;
  } else {
    requestAnimationFrame(frame);
  }

  // Debug / play-test hook: read-only snapshot plus the live state.
  window.__heist = {
    state,
    loadLevel,
    step,
    throwCoin,
    snapshot() {
      return {
        screen: state.screen,
        paused: state.paused,
        level: state.levelIndex + 1,
        levelName: state.level.name,
        player: { x: Math.round(state.player.x), y: Math.round(state.player.y) },
        lootTaken: state.lootTaken,
        alarm: Math.round(state.alarm),
        strikes: state.strikes,
        coinsLeft: state.coinsLeft,
        smokeLeft: state.smokeLeft,
        score: state.totalScore,
        visibility: state.visibility,
        guards: state.guards.map((g) => ({ state: g.state, suspicion: Math.round(g.suspicion) })),
        time: Math.round(state.levelTime * 10) / 10,
      };
    },
  };

  return { state, step, loadLevel, input };
}

// Boot: the canvas is a fixed 1280x720 stage, scaled by CSS to fit.
const canvas = document.getElementById('game');
canvas.width = VIEW.w;
canvas.height = VIEW.h;
createGame(canvas);
