/* ══════════════════════════════════════════════════════════════
   proto-setup.js — standalone setup for the Scene-5 preview page
   (Prototype B). Identical to Prototype A's: registers GSAP +
   ScrollTrigger on window, boots Lenis, exports the scroll helpers, and
   drops the nav / demo-form side effects the preview doesn't need.
══════════════════════════════════════════════════════════════ */
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
window.Lenis = Lenis;

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('load', () => window.scrollTo(0, 0));
window.addEventListener('beforeunload', () => window.scrollTo(0, 0));

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'power3.out' });

const lenis = new Lenis({
  duration: 1.25,
  easing: t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
window.__lenis = lenis;

const si = document.getElementById('scroll-ind');
function showSI() { if (si) si.classList.add('show'); }
function hideSI() { if (si) si.classList.remove('show'); }
lenis.on('scroll', () => hideSI());

const MOBILE_QUERY = '(max-width:768px)';
const mqlMobile = window.matchMedia(MOBILE_QUERY);
const isMobile = () => mqlMobile.matches;
const syncMobileClass = () => document.body.classList.toggle('is-mobile', mqlMobile.matches);
syncMobileClass();
mqlMobile.addEventListener('change', syncMobileClass);

export { lenis, showSI, hideSI, isMobile, MOBILE_QUERY };
