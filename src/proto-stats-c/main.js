/* ══════════════════════════════════════════════════════════════
   main.js — Prototype C · Intelligence Dashboard preview entry.
   setup first (window.gsap/ScrollTrigger + Lenis), then section CSS,
   then behaviour.
══════════════════════════════════════════════════════════════ */
import { showSI } from './proto-setup.js';
import './main.css';
import './stats-c.js';

window.addEventListener('load', () => showSI && showSI());
