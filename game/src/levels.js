// levels.js — one job: the five heists. Each level is a hand-drawn room:
// walls and shelves block movement and sight, crates block sight, grass and
// shadow hide a sneaking thief, lamps light pools where you are seen faster.
// Every room has more than one route from the door to the loot and back.
import { ROOM } from './config.js';

// A wall stub is {x, y, w, h}. All coordinates are canvas pixels inside ROOM.
export const LEVELS = [
  {
    id: 1,
    name: 'THE AMBER MUSEUM',
    place: 'Heist 1 of 5 · Old Town',
    loot: { name: 'The Sunburst Idol', x: 862, y: 116, value: 1000 },
    exit: { x: 26, y: 76, w: 46, h: 60 },
    start: { x: 66, y: 592 },
    hint: 'Cross the hall, lift the Idol, slip out the green door.',
    walls: [
      { x: 300, y: 62, w: 14, h: 150 },
      { x: 300, y: 330, w: 14, h: 140 },
      { x: 620, y: 250, w: 14, h: 190 },
      { x: 620, y: 62, w: 14, h: 90 },
    ],
    crates: [
      { x: 150, y: 180, w: 52, h: 52 },
      { x: 210, y: 180, w: 52, h: 52 },
      { x: 150, y: 238, w: 52, h: 52 },
      { x: 470, y: 470, w: 52, h: 52 },
      { x: 530, y: 470, w: 52, h: 52 },
      { x: 740, y: 300, w: 52, h: 52 },
    ],
    shelves: [
      { x: 380, y: 70, w: 150, h: 26 },
      { x: 700, y: 596, w: 150, h: 26 },
    ],
    rugs: [
      { x: 380, y: 300, w: 180, h: 110 },
      { x: 700, y: 130, w: 150, h: 90 },
    ],
    lamps: [
      { x: 240, y: 130, r: 105 },
      { x: 480, y: 360, r: 115 },
      { x: 800, y: 200, r: 100 },
    ],
    grass: [
      { x: 700, y: 480, w: 130, h: 90 },
      { x: 90, y: 420, w: 110, h: 80 },
    ],
    plants: [
      { x: 880, y: 560 },
      { x: 40, y: 300 },
      { x: 660, y: 100 },
    ],
    guards: [
      { waypoints: [[400, 200], [560, 200], [560, 430], [400, 430]], face: 0 },
      { waypoints: [[700, 480], [860, 480], [860, 300]], face: -Math.PI / 2 },
    ],
    cameras: [
      { x: 470, y: 66, base: Math.PI / 2, sweep: 0.9, phase: 0 },
    ],
  },
  {
    id: 2,
    name: 'MERIDIAN BANK',
    place: 'Heist 2 of 5 · The Vault Floor',
    loot: { name: 'The Meridian Ledger', x: 868, y: 580, value: 1200 },
    exit: { x: 26, y: 76, w: 46, h: 60 },
    start: { x: 66, y: 592 },
    hint: 'The Ledger sits in the far vault. Mind the twin cameras.',
    walls: [
      { x: 250, y: 250, w: 180, h: 14 },
      { x: 560, y: 62, w: 14, h: 130 },
      { x: 560, y: 400, w: 14, h: 240 },
      { x: 760, y: 250, w: 14, h: 160 },
    ],
    crates: [
      { x: 120, y: 120, w: 52, h: 52 },
      { x: 180, y: 120, w: 52, h: 52 },
      { x: 340, y: 480, w: 52, h: 52 },
      { x: 400, y: 480, w: 52, h: 52 },
      { x: 660, y: 520, w: 52, h: 52 },
    ],
    shelves: [
      { x: 620, y: 70, w: 170, h: 26 },
      { x: 90, y: 596, w: 170, h: 26 },
    ],
    rugs: [
      { x: 300, y: 120, w: 170, h: 100 },
      { x: 620, y: 300, w: 120, h: 80 },
    ],
    lamps: [
      { x: 200, y: 330, r: 110 },
      { x: 480, y: 150, r: 105 },
      { x: 760, y: 470, r: 110 },
    ],
    grass: [
      { x: 430, y: 540, w: 120, h: 70 },
      { x: 120, y: 300, w: 110, h: 80 },
    ],
    plants: [
      { x: 890, y: 120 },
      { x: 40, y: 480 },
      { x: 520, y: 600 },
    ],
    guards: [
      { waypoints: [[330, 330], [500, 330], [500, 540], [330, 540]], face: 0 },
      { waypoints: [[680, 150], [680, 400], [850, 400]], face: Math.PI },
      { waypoints: [[150, 420], [150, 200]], face: Math.PI / 2 },
    ],
    cameras: [
      { x: 470, y: 66, base: Math.PI / 2, sweep: 1.0, phase: 1.2 },
      { x: 928, y: 330, base: Math.PI, sweep: 0.8, phase: 0 },
    ],
  },
  {
    id: 3,
    name: 'THE GILDED GALLERY',
    place: 'Heist 3 of 5 · Portrait Wing',
    loot: { name: 'Portrait of the Duchess', x: 470, y: 110, value: 1400 },
    exit: { x: 862, y: 566, w: 46, h: 60 },
    start: { x: 66, y: 592 },
    hint: 'The Duchess hangs dead centre. Two patrols cross her light.',
    walls: [
      { x: 200, y: 62, w: 14, h: 120 },
      { x: 700, y: 62, w: 14, h: 120 },
      { x: 430, y: 300, w: 90, h: 14 },
      { x: 430, y: 470, w: 90, h: 14 },
    ],
    crates: [
      { x: 260, y: 240, w: 52, h: 52 },
      { x: 320, y: 240, w: 52, h: 52 },
      { x: 580, y: 380, w: 52, h: 52 },
      { x: 640, y: 380, w: 52, h: 52 },
      { x: 800, y: 200, w: 52, h: 52 },
    ],
    shelves: [
      { x: 240, y: 596, w: 170, h: 26 },
      { x: 520, y: 596, w: 170, h: 26 },
    ],
    rugs: [
      { x: 360, y: 130, w: 220, h: 130 },
      { x: 120, y: 380, w: 150, h: 100 },
    ],
    lamps: [
      { x: 470, y: 200, r: 120 },
      { x: 200, y: 470, r: 105 },
      { x: 760, y: 470, r: 105 },
    ],
    grass: [
      { x: 90, y: 120, w: 110, h: 90 },
      { x: 780, y: 500, w: 120, h: 80 },
    ],
    plants: [
      { x: 890, y: 90 },
      { x: 40, y: 200 },
      { x: 660, y: 600 },
    ],
    guards: [
      { waypoints: [[200, 300], [700, 300], [700, 540], [200, 540]], face: 0 },
      { waypoints: [[830, 300], [830, 520], [600, 520]], face: Math.PI },
    ],
    cameras: [
      { x: 470, y: 66, base: Math.PI / 2, sweep: 1.1, phase: 0.6 },
    ],
  },
  {
    id: 4,
    name: 'THE VELVET CASINO',
    place: 'Heist 4 of 5 · High-Roller Floor',
    loot: { name: 'The Ivory Chip', x: 120, y: 120, value: 1600 },
    exit: { x: 862, y: 566, w: 46, h: 60 },
    start: { x: 66, y: 592 },
    hint: 'The Chip is behind the far tables. The floor is all lamplight.',
    walls: [
      { x: 330, y: 200, w: 14, h: 200 },
      { x: 600, y: 62, w: 14, h: 170 },
      { x: 600, y: 400, w: 14, h: 160 },
      { x: 760, y: 330, w: 140, h: 14 },
    ],
    crates: [
      { x: 420, y: 130, w: 52, h: 52 },
      { x: 480, y: 130, w: 52, h: 52 },
      { x: 200, y: 420, w: 52, h: 52 },
      { x: 700, y: 500, w: 52, h: 52 },
      { x: 760, y: 500, w: 52, h: 52 },
    ],
    shelves: [
      { x: 90, y: 70, w: 170, h: 26 },
      { x: 700, y: 596, w: 150, h: 26 },
    ],
    rugs: [
      { x: 360, y: 420, w: 200, h: 120 },
      { x: 620, y: 120, w: 170, h: 100 },
    ],
    lamps: [
      { x: 250, y: 250, r: 115 },
      { x: 470, y: 320, r: 115 },
      { x: 700, y: 250, r: 110 },
      { x: 830, y: 420, r: 100 },
    ],
    grass: [
      { x: 90, y: 480, w: 120, h: 90 },
      { x: 520, y: 540, w: 120, h: 70 },
    ],
    plants: [
      { x: 890, y: 120 },
      { x: 40, y: 300 },
      { x: 340, y: 600 },
    ],
    guards: [
      { waypoints: [[200, 300], [520, 300], [520, 180], [200, 180]], face: 0 },
      { waypoints: [[680, 480], [860, 480], [860, 200]], face: -Math.PI / 2 },
      { waypoints: [[400, 560], [560, 560], [560, 440]], face: -Math.PI / 2 },
    ],
    cameras: [
      { x: 470, y: 66, base: Math.PI / 2, sweep: 0.9, phase: 0 },
      { x: 928, y: 480, base: Math.PI, sweep: 0.9, phase: 2.0 },
    ],
  },
  {
    id: 5,
    name: 'THE IRON VAULT',
    place: 'Heist 5 of 5 · The Last Door',
    loot: { name: 'The Crown of Hours', x: 470, y: 116, value: 2000 },
    exit: { x: 26, y: 566, w: 46, h: 60 },
    start: { x: 860, y: 592 },
    hint: 'The Crown waits under the heaviest watch of the night.',
    walls: [
      { x: 250, y: 62, w: 14, h: 140 },
      { x: 660, y: 62, w: 14, h: 140 },
      { x: 250, y: 420, w: 14, h: 220 },
      { x: 660, y: 420, w: 14, h: 220 },
      { x: 430, y: 300, w: 90, h: 14 },
    ],
    crates: [
      { x: 150, y: 300, w: 52, h: 52 },
      { x: 210, y: 300, w: 52, h: 52 },
      { x: 700, y: 300, w: 52, h: 52 },
      { x: 760, y: 300, w: 52, h: 52 },
      { x: 470, y: 470, w: 52, h: 52 },
      { x: 530, y: 470, w: 52, h: 52 },
    ],
    shelves: [
      { x: 300, y: 70, w: 140, h: 26 },
      { x: 600, y: 70, w: 140, h: 26 },
    ],
    rugs: [
      { x: 360, y: 130, w: 220, h: 120 },
      { x: 360, y: 500, w: 220, h: 90 },
    ],
    lamps: [
      { x: 470, y: 200, r: 125 },
      { x: 180, y: 480, r: 105 },
      { x: 760, y: 480, r: 105 },
    ],
    grass: [
      { x: 90, y: 120, w: 110, h: 90 },
      { x: 800, y: 120, w: 110, h: 90 },
    ],
    plants: [
      { x: 890, y: 560 },
      { x: 40, y: 200 },
      { x: 470, y: 600 },
    ],
    guards: [
      { waypoints: [[300, 250], [620, 250], [620, 400], [300, 400]], face: 0 },
      { waypoints: [[150, 520], [150, 180], [350, 180]], face: Math.PI / 2 },
      { waypoints: [[780, 520], [780, 180], [580, 180]], face: Math.PI / 2 },
    ],
    cameras: [
      { x: 470, y: 66, base: Math.PI / 2, sweep: 1.0, phase: 0 },
      { x: 12, y: 350, base: 0, sweep: 0.8, phase: 1.5 },
    ],
  },
];

export function roomBounds() {
  return ROOM;
}
