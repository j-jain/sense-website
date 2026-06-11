/* ══════════════════════════════════════════════════════════════
   main.js — Prototype · Scene 5C (Driver & Fleet) preview entry.
   setup first, then the scene (registers window.__s5Timelines.s5c),
   then the autoplay sequencer.
══════════════════════════════════════════════════════════════ */
import './proto-setup.js';
import './main.css';

import './s5c/s5c.js';

import './autoplay.js';

/* Replay button (preview chrome only). */
const replay = document.getElementById('proto-replay');
if (replay) replay.addEventListener('click', () => window.startProtoAutoplay && window.startProtoAutoplay());
