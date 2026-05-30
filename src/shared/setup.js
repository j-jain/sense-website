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

export { lenis, showSI, hideSI };

