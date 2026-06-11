/* ══════════════════════════════════════════════════════════════
   main.js — Prototype A (Fleet Console) preview entry.
   Import order matters: setup first (exposes window.gsap/ScrollTrigger
   + Lenis), then the three scenes (each registers its paused timeline on
   window.__s5Timelines), then the autoplay sequencer (plays them).
══════════════════════════════════════════════════════════════ */
import './proto-setup.js';
import './main.css';

import './s5a/s5a.js';
import './s5b/s5b.js';
import './s5c/s5c.js';

import './autoplay.js';

/* Replay button (preview chrome only). */
const replay = document.getElementById('proto-replay');
if (replay) replay.addEventListener('click', () => window.startProtoAutoplay && window.startProtoAutoplay());
