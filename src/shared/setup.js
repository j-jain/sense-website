/* ── Self-hosted libs (no CDN) ──────────────────
   GSAP, ScrollTrigger and Lenis ship from npm and are re-exposed on
   window so every scene's JS can keep using them as bare globals
   (gsap.*, ScrollTrigger.*, new Lenis()) exactly as before. setup.js is
   imported first in main.js, so these globals exist before any scene
   module evaluates. Versions pinned to the previous CDN build. */
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
window.Lenis = Lenis;

/* ── Refresh resets to top of Scene 1 ─────────── */
if('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('load', function(){ window.scrollTo(0, 0); });
window.addEventListener('beforeunload', function(){ window.scrollTo(0, 0); });

gsap.registerPlugin(ScrollTrigger);

/* ── Lenis init ─────────────────────────────── */
const lenis = new Lenis({
  duration: 1.1,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
window.__lenis = lenis; /* dev aid: lets tooling drive scroll precisely */

/* ── Nav scroll ─────────────────────────────── */
const nav = document.getElementById('nav');
lenis.on('scroll', ({scroll}) => {
  nav.classList.toggle('scrolled', scroll > 60);
});

/* ── Scroll indicator helpers ───────────────── */
const si = document.getElementById('scroll-ind');
function showSI(){si.classList.add('show')}
function hideSI(){si.classList.remove('show')}
lenis.on('scroll', () => hideSI());

/* ── Mobile detection ───────────────────────────
   Single source of truth for the ≤768px breakpoint.
   - isMobile(): live boolean for JS branching
   - MOBILE_QUERY: reuse as a gsap.matchMedia() key so scene pins
     can be gated without ever touching the desktop code path
   - body.is-mobile: lets CSS hook mobile state if a selector ever
     needs it (additive; desktop body never gets the class) */
const MOBILE_QUERY = '(max-width:768px)';
const mqlMobile = window.matchMedia(MOBILE_QUERY);
const isMobile = () => mqlMobile.matches;
const syncMobileClass = () => document.body.classList.toggle('is-mobile', mqlMobile.matches);
syncMobileClass();
mqlMobile.addEventListener('change', syncMobileClass);

export { lenis, showSI, hideSI, isMobile, MOBILE_QUERY };

