/* ══════════════════════════════════════════════════════════════
   proto-setup.js — standalone setup for the Uptime-Stats preview pages.
   A trimmed copy of src/shared/setup.js: registers GSAP + ScrollTrigger
   on window (so the section JS keeps using bare globals), boots Lenis,
   and exports the scroll-indicator helpers. Intentionally DROPS the nav
   + request-a-demo side effects of the real setup.js — the preview page
   doesn't ship that chrome, and pulling them in would throw on missing
   DOM. Self-contained so the prototype can be reviewed in isolation.
══════════════════════════════════════════════════════════════ */
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
window.Lenis = Lenis;

/* Refresh resets to top so the scroll story always starts at the header. */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('load', () => window.scrollTo(0, 0));
window.addEventListener('beforeunload', () => window.scrollTo(0, 0));

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'power3.out' });

/* ── Lenis (same feel as the live site) ── */
const lenis = new Lenis({
  duration: 1.25,
  easing: t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
window.__lenis = lenis;

/* The DENSO web-fonts load async and grow the page AFTER Lenis has cached
   its scroll dimensions — leaving Lenis with limit:0 (it would then clamp
   every scroll back to the top). Recompute Lenis + ScrollTrigger once the
   page and fonts have settled so the scroll story actually scrolls. */
function __recalc() {
  try { lenis.resize(); } catch (e) {}
  ScrollTrigger.refresh();
}
window.addEventListener('load', __recalc);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(__recalc);

/* ── Scroll-indicator helpers (guarded — the el is optional here) ── */
const si = document.getElementById('scroll-ind');
function showSI() { if (si) si.classList.add('show'); }
function hideSI() { if (si) si.classList.remove('show'); }
lenis.on('scroll', () => hideSI());

/* ── Mobile detection (single source of truth, ≤768px) ── */
const MOBILE_QUERY = '(max-width:768px)';
const mqlMobile = window.matchMedia(MOBILE_QUERY);
const isMobile = () => mqlMobile.matches;
const syncMobileClass = () => document.body.classList.toggle('is-mobile', mqlMobile.matches);
syncMobileClass();
mqlMobile.addEventListener('change', syncMobileClass);

export { lenis, showSI, hideSI, isMobile, MOBILE_QUERY };
