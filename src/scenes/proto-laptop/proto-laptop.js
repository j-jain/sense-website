/* ════════════════════════════════════════════════════════════
   PROTO — Phone → Laptop morph (standalone prototype)
   Scroll-driven. The phone turns, widens into a laptop screen,
   the keyboard deck unfolds, and the dashboard boots inside the
   screen. The laptop settles at ~70vw — it does NOT fill the
   viewport, leaving room for the captions to narrate around it.
════════════════════════════════════════════════════════════ */
gsap.registerPlugin(ScrollTrigger);

/* Smooth scroll (same feel as the main site) */
const lenis = new Lenis({ duration: 1.1, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
window.__lenis = lenis; /* dev aid: lets tooling drive scroll precisely */

const device     = document.getElementById('device');
const screenEl   = document.getElementById('screen');
const notch      = document.getElementById('notch');
const boot       = document.getElementById('boot');
const bootBar    = document.getElementById('bootBar');
const dash       = document.getElementById('dash');
const base       = document.getElementById('base');
const scrollHint = document.getElementById('scrollHint');

const capTop    = document.getElementById('capTop');
const capLeft   = document.getElementById('capLeft');
const capRight  = document.getElementById('capRight');
const capBottom = document.getElementById('capBottom');

/* ── helpers ── */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut   = t => 1 - Math.pow(1 - t, 3);

/* Trapezoidal visibility band with soft 0.04 ramps */
function band(p, a, b){
  const f = 0.04;
  if(p < a - f || p > b + f) return 0;
  if(p < a) return (p - (a - f)) / f;
  if(p > b) return 1 - (p - b) / f;
  return 1;
}

const PHONE = { w: 260, h: 540, r: 34 };
function laptopDims(){
  const w = Math.min(window.innerWidth * 0.70, 1000);
  return { w: w, h: Math.round(w * 0.60), r: 14 };
}

function render(p){
  /* Sub-progress windows */
  const m = clamp((p - 0.12) / (0.50 - 0.12), 0, 1);  /* morph: phone → laptop screen */
  const u = clamp((p - 0.42) / (0.60 - 0.42), 0, 1);  /* keyboard deck unfold */
  const boot01 = clamp((p - 0.48) / (0.56 - 0.48), 0, 1); /* boot appears */
  const d = clamp((p - 0.54) / (0.76 - 0.54), 0, 1);  /* dashboard loads */

  const lap = laptopDims();
  const me  = easeInOut(m);

  /* Screen reshapes from phone portrait → laptop landscape */
  screenEl.style.width        = lerp(PHONE.w, lap.w, me) + 'px';
  screenEl.style.height       = lerp(PHONE.h, lap.h, me) + 'px';
  screenEl.style.borderRadius = lerp(PHONE.r, lap.r, me) + 'px';

  /* The "turn": a Y-axis swing that peaks mid-morph then settles flat,
     plus a slight downward tilt as it becomes a laptop. */
  const turnY = Math.sin(m * Math.PI) * -40;
  const tiltX = lerp(0, -5, easeOut(m));
  device.style.transform = 'rotateX(' + tiltX + 'deg) rotateY(' + turnY + 'deg)';

  /* Phone notch fades out in the first half of the turn */
  notch.style.opacity = String(1 - clamp(m / 0.5, 0, 1));

  /* Keyboard deck unfolds downward from the hinge */
  const ue = easeOut(u);
  base.style.opacity   = String(u > 0 ? clamp(u * 1.4, 0, 1) : 0);
  base.style.transform = 'translateX(-50%) rotateX(80deg) scaleY(' + ue + ')';

  /* Boot shimmer, then dashboard fades in inside the screen */
  boot.style.opacity = String(clamp(boot01 * (1 - d), 0, 1));
  bootBar.style.width = (clamp(d, 0, 1) * 100) + '%';
  dash.style.opacity = String(d);

  /* Captions narrate around the device */
  capTop.style.opacity    = String(band(p, 0.00, 0.11));
  capLeft.style.opacity   = String(band(p, 0.17, 0.45));
  capRight.style.opacity  = String(band(p, 0.56, 0.84));
  capBottom.style.opacity = String(band(p, 0.85, 1.00));

  /* Hide the scroll hint once they start */
  scrollHint.style.opacity = p > 0.03 ? '0' : '';
}

ScrollTrigger.create({
  trigger: '#proto-wrapper',
  start: 'top top',
  end: 'bottom bottom',
  pin: '#proto-stage',
  scrub: true,
  onUpdate: self => render(self.progress)
});

/* Initial frame */
render(0);
window.addEventListener('resize', () => render(ScrollTrigger.getAll()[0] ? ScrollTrigger.getAll()[0].progress : 0));
