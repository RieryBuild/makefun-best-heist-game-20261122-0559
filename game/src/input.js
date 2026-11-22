// input.js — one job: read the keyboard and mouse and hand the game a
// clean snapshot each tick. Keys are tracked by code (layout-proof); the
// mouse is converted into canvas pixels; clicks queue a throw request.
export function makeInput(canvas) {
  const keys = new Set();
  const mouse = { x: 0, y: 0, down: false, clicked: false, clickX: 0, clickY: 0 };
  const pressed = new Set(); // edge-triggered keys, consumed by the game

  function toCanvas(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * 1280,
      y: ((clientY - r.top) / r.height) * 720,
    };
  }

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    if (!e.repeat) pressed.add(e.code);
    keys.add(e.code);
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => keys.clear());

  canvas.addEventListener('mousemove', (e) => {
    const p = toCanvas(e.clientX, e.clientY);
    mouse.x = p.x;
    mouse.y = p.y;
  });
  canvas.addEventListener('mousedown', (e) => {
    const p = toCanvas(e.clientX, e.clientY);
    mouse.x = p.x;
    mouse.y = p.y;
    mouse.down = true;
    mouse.clicked = true;
    mouse.clickX = p.x;
    mouse.clickY = p.y;
  });
  window.addEventListener('mouseup', () => {
    mouse.down = false;
  });

  function axis(neg, pos) {
    return (keys.has(pos) ? 1 : 0) - (keys.has(neg) ? 1 : 0);
  }

  return {
    // Movement vector for this tick, normalised.
    move() {
      const x = axis('KeyA', 'KeyD') + axis('ArrowLeft', 'ArrowRight');
      const y = axis('KeyW', 'KeyS') + axis('ArrowUp', 'ArrowDown');
      const len = Math.hypot(x, y);
      if (len === 0) return { x: 0, y: 0 };
      return { x: x / len, y: y / len };
    },
    sneaking() {
      return keys.has('ShiftLeft') || keys.has('ShiftRight');
    },
    // True once per physical press; the game consumes it.
    wasPressed(code) {
      if (pressed.has(code)) {
        pressed.delete(code);
        return true;
      }
      return false;
    },
    // True once per click; the game consumes it.
    takeClick() {
      if (mouse.clicked) {
        mouse.clicked = false;
        return { x: mouse.clickX, y: mouse.clickY };
      }
      return null;
    },
    mousePos() {
      return { x: mouse.x, y: mouse.y };
    },
    // Test / autopilot hooks: drive the game without a real keyboard.
    injectKey(code) {
      keys.add(code);
      pressed.add(code);
    },
    releaseKey(code) {
      keys.delete(code);
    },
    injectClick(x, y) {
      mouse.x = x;
      mouse.y = y;
      mouse.clicked = true;
      mouse.clickX = x;
      mouse.clickY = y;
    },
    clear() {
      keys.clear();
      pressed.clear();
      mouse.clicked = false;
    },
  };
}
