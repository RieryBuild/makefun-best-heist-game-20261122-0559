// config.js — one job: every tunable number and colour of THE GILDED HOUR.
// Nothing here moves, draws or listens; it only names the constants the
// other files share, so a balance tweak is a one-line edit in one place.
export const VIEW = { w: 1280, h: 720 };
export const HUD = { h: 54 };
export const ROOM = { x: 12, y: 62, w: 916, h: 578 };
export const PANEL = { x: 936, y: 62, w: 332, h: 578 };
export const BAR = { y: 648, h: 64 };

export const PALETTE = {
  bg: '#0d1117',
  floorA: '#1b2230',
  floorB: '#171e2a',
  floorLine: '#232c3d',
  wall: '#2a3140',
  wallTop: '#39415a',
  wallTrim: '#c9a227',
  rug: '#5a1f24',
  rugTrim: '#c9a227',
  crate: '#6b4a2b',
  crateEdge: '#8a6238',
  shelf: '#3d2b1f',
  book: ['#b3402e', '#2e7d6b', '#c9a227', '#4a6fa5', '#8a4a7a', '#d97b29'],
  plant: '#2e6b34',
  grass: '#1e4d2a',
  grassBlade: '#3f8f4f',
  lampGlow: 'rgba(255, 190, 90, 0.20)',
  lampCore: '#ffd27a',
  amber: '#e8a93c',
  gold: '#f5c542',
  teal: '#2ec4a6',
  tealDim: '#1d7a68',
  red: '#e5484d',
  redDim: '#7a1f22',
  cone: 'rgba(232, 169, 60, 0.28)',
  coneEdge: 'rgba(232, 169, 60, 0.55)',
  coneAlert: 'rgba(229, 72, 77, 0.34)',
  cameraArc: 'rgba(46, 196, 166, 0.20)',
  smoke: 'rgba(180, 190, 200, 0.55)',
  ink: '#e8e4d8',
  inkDim: '#9aa3b2',
  panel: '#12161f',
  panelEdge: '#2a3242',
  player: '#e8e4d8',
  playerCloak: '#232838',
  guard: '#3a3f4a',
  guardTrim: '#e5484d',
};

// Player and guard movement, in pixels per second.
export const PLAYER = {
  radius: 11,
  walk: 175,
  sneak: 88,
  grabRange: 36,
  throwRange: 270,
  throwCooldown: 0.45,
};

export const GUARD = {
  radius: 12,
  patrolSpeed: 58,
  chaseSpeed: 132,
  investigateSpeed: 88,
  coneRange: 178,
  coneHalfAngle: 0.56, // ~32 degrees each side
  waypointPause: 1.15,
  suspicionDecay: 14, // per second while unseen
  // suspicion gained per second at point-blank, scaled by distance/light/stance
  suspicionRate: 95,
};

export const CAMERA = {
  range: 205,
  halfAngle: 0.44,
  sweepSpeed: 0.55, // radians per second, sinusoidal
  alarmRate: 55, // alarm meter per second while in arc
  alarmDecay: 10,
};

export const RULES = {
  strikesToFail: 3,
  alarmStrikeAt: 100, // alarm meter reaching this costs a strike
  smokeRadius: 92,
  smokeSeconds: 5,
  coinNoiseRadius: 250,
  ghostBonus: 500,
  toolBonusEach: 40,
  lootBase: 1000,
  timeBonusPerSecond: 6, // up to this much, decays with elapsed time
  maxTimeBonus: 600,
};

export const TOOLS = { coins: 5, smoke: 2 };

// Seconds of scripted autopilot per screenshot scene (fixed dt = 1/60).
export const SHOT_STEPS = { play: 60 * 14, alarm: 60 * 11, win: 60 * 9 };
