/* ══════════════════════════════════════════════════════════════
   main.js — Prototype · Scene 5A (X-ray Scan) preview entry.
   Import order matters: setup first (exposes window.gsap/ScrollTrigger
   + Lenis), then the scene (registers its paused timeline on
   window.__s5Timelines), then the autoplay sequencer (plays it).
══════════════════════════════════════════════════════════════ */
import './proto-setup.js';
import './main.css';

import './s5a/s5a.js';

import './autoplay.js';

/* Replay button (preview chrome only). */
const replay = document.getElementById('proto-replay');
if (replay) replay.addEventListener('click', () => window.startProtoAutoplay && window.startProtoAutoplay());
