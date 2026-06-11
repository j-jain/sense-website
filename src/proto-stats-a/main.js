/* ══════════════════════════════════════════════════════════════
   main.js — Prototype A · Editorial Ledger preview entry.
   setup first (exposes window.gsap/ScrollTrigger + Lenis), then the
   section's CSS, then its behaviour.
══════════════════════════════════════════════════════════════ */
import { showSI } from './proto-setup.js';
import './main.css';
import './stats-a.js';

window.addEventListener('load', () => showSI && showSI());
