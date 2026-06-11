/* ══════════════════════════════════════════════════════════════
   main.js — Prototype B · Living Network preview entry.
   setup first (window.gsap/ScrollTrigger + Lenis), then section CSS,
   then behaviour.
══════════════════════════════════════════════════════════════ */
import { showSI } from './proto-setup.js';
import './main.css';
import './stats-b.js';

window.addEventListener('load', () => showSI && showSI());
