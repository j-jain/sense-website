/* ══════════════════════════════════════════════════════════════
   main.js — Prototype B (Holographic HUD) preview entry.
   setup → scenes (register window.__s5Timelines) → autoplay.
══════════════════════════════════════════════════════════════ */
import './proto-setup.js';
import './main.css';

import './s5a/s5a.js';
import './s5b/s5b.js';
import './s5c/s5c.js';

import './autoplay.js';

const replay = document.getElementById('proto-replay');
if (replay) replay.addEventListener('click', () => window.startProtoAutoplay && window.startProtoAutoplay());
