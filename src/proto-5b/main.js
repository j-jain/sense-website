/* ══════════════════════════════════════════════════════════════
   main.js — Prototype · Scene 5B (Service Network) preview entry.
   setup first (exposes window.gsap/ScrollTrigger + Lenis), then the
   scene (registers its paused timeline on window.__s5Timelines.s5b),
   then the autoplay sequencer.
══════════════════════════════════════════════════════════════ */
import './proto-setup.js';
import './main.css';

import './s5b/s5b.js';

import './autoplay.js';

/* Replay button (preview chrome only). */
const replay = document.getElementById('proto-replay');
if (replay) replay.addEventListener('click', () => window.startProtoAutoplay && window.startProtoAutoplay());
