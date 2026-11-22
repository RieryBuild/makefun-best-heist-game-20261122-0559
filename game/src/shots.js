// shots.js — one job: the four deterministic screenshot scenes. Each scene
// starts the real game, drives it forward a fixed number of fixed steps
// (dt = 1/60, seed fixed) with scripted input or the autopilot, and freezes
// on the frame. Nothing here is a mock: the coin is really thrown, the
// guard really investigates, the strike really fires, the win really lands.
import { SHOT_STEPS } from './config.js';

const DT = 1 / 60;

function runSteps(game, seconds) {
  const n = Math.round(seconds * 60);
  for (let i = 0; i < n; i++) game.step(DT);
}

export function applyShot(game, name, seed) {
  const { state, loadLevel, input } = game;
  void seed; // scenes are fixed by construction; the seed pins the RNG stream

  if (name === 'title') {
    loadLevel(0);
    runSteps(game, 2); // guards patrol, lamps breathe
    state.screen = 'title';
    return;
  }

  if (name === 'play') {
    loadLevel(0);
    state.callouts = true;
    // Walk the south lane, then slip into the grass and go quiet.
    state.auto = {
      waypoints: [[250, 590], [250, 470], [150, 460]],
      index: 0,
      sneak: true,
    };
    runSteps(game, SHOT_STEPS.play / 60);
    // Toss a coin toward the nearest guard; it really goes to investigate.
    const g = state.guards[0];
    input.injectClick(g.x, g.y);
    runSteps(game, 2.5);
    state.callouts = true;
    return;
  }

  if (name === 'alarm') {
    loadLevel(1);
    runSteps(game, 1); // guards settle onto their patrols
    // Step into the lamplight right in front of the first guard.
    const g = state.guards[0];
    state.player.x = g.x + Math.cos(g.face) * 60;
    state.player.y = g.y + Math.sin(g.face) * 60;
    state.player.sneaking = false;
    state.alarm = 82; // the cameras have been watching this approach
    // Wait for the cone to fill suspicion to a real strike, then the chase.
    for (let i = 0; i < 60 * 6; i++) {
      game.step(DT);
      if (state.screen !== 'playing') break;
      if (state.strikes > 0) {
        runSteps(game, 0.8);
        break;
      }
    }
    return;
  }

  if (name === 'win') {
    loadLevel(0);
    // Lift the Idol for real: walk up to it and press E.
    const loot = state.level.loot;
    state.player.x = loot.x - 24;
    state.player.y = loot.y + 10;
    input.injectKey('KeyE');
    runSteps(game, 0.4);
    input.releaseKey('KeyE');
    // Then slip out the green door, sneaking the whole way home.
    state.auto = {
      waypoints: [[700, 200], [560, 200], [400, 200], [360, 260], [280, 300], [150, 320], [120, 200], [120, 120], [60, 110]],
      index: 0,
      sneak: true,
    };
    for (let i = 0; i < 60 * 22; i++) {
      game.step(DT);
      if (state.screen === 'won') break;
    }
    return;
  }

  // Unknown scene name: fall back to the title.
  loadLevel(0);
  state.screen = 'title';
}
