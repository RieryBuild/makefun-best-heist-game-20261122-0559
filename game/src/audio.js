// audio.js — one job: every sound, synthesized live with WebAudio.
// No audio files, no network: short oscillator blips with envelopes.
// The context is created on the first user gesture; muted stays silent.
export function makeAudio() {
  let ctx = null;
  let muted = false;
  let stepFlip = false;

  function ensure() {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, dur, type, gain, when = 0, slideTo = null) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(amp).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  return {
    unlock() {
      ensure();
    },
    setMuted(m) {
      muted = m;
    },
    isMuted() {
      return muted;
    },
    step() {
      // soft footfall, alternating pitch so it never sounds mechanical
      stepFlip = !stepFlip;
      tone(stepFlip ? 190 : 160, 0.06, 'sine', 0.05);
    },
    coin() {
      tone(1320, 0.09, 'sine', 0.12);
      tone(1760, 0.14, 'sine', 0.10, 0.07);
    },
    coinLand() {
      tone(980, 0.07, 'triangle', 0.09);
      tone(720, 0.10, 'triangle', 0.07, 0.06);
    },
    smoke() {
      tone(320, 0.35, 'sine', 0.08, 0, 90);
    },
    grab() {
      tone(523, 0.12, 'triangle', 0.14);
      tone(659, 0.12, 'triangle', 0.14, 0.09);
      tone(784, 0.22, 'triangle', 0.16, 0.18);
    },
    suspicious() {
      tone(440, 0.16, 'square', 0.05);
      tone(466, 0.16, 'square', 0.05, 0.14);
    },
    alarm() {
      tone(880, 0.22, 'sawtooth', 0.09, 0, 660);
      tone(880, 0.22, 'sawtooth', 0.09, 0.26, 660);
    },
    caught() {
      tone(220, 0.5, 'sawtooth', 0.12, 0, 110);
      tone(110, 0.7, 'sawtooth', 0.10, 0.15, 55);
    },
    win() {
      const notes = [523, 659, 784, 1047];
      notes.forEach((n, i) => tone(n, 0.22, 'triangle', 0.14, i * 0.11));
      tone(1319, 0.5, 'triangle', 0.14, 0.48);
    },
    lose() {
      const notes = [392, 330, 262, 196];
      notes.forEach((n, i) => tone(n, 0.3, 'triangle', 0.11, i * 0.16));
    },
    click() {
      tone(700, 0.05, 'square', 0.05);
    },
  };
}
