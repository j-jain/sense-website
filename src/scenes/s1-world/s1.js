import { lenis, showSI, hideSI } from '../../shared/setup.js';

/* ════════════════════════════════════════════
   S1 — THE WORLD (Game Start Sequence)
════════════════════════════════════════════ */

const s1Video  = document.getElementById('s1-video');
const s1Cinema = document.getElementById('s1-cinema');
const s1Boot   = document.getElementById('s1-boot');

// ── Phase 1: Boot sequence ────────────────────
const bootTL = gsap.timeline({delay: 0.4});
bootTL
  .to('#bl-1', {opacity:1, duration:0, delay:0.3})
  .to('#bl-2', {opacity:1, duration:0, delay:0.35})
  .to('#bl-3', {opacity:1, duration:0, delay:0.40})
  .to('#bl-4', {opacity:1, duration:0, delay:0.30})
  .to('#bl-5', {opacity:1, duration:0, delay:0.25})
  .to('#bl-6', {opacity:1, duration:0, delay:0.45})
  // Hold for a beat
  .to({}, {duration: 0.6})
  // Fade out boot
  .to(s1Boot, {opacity:0, duration:0.6, ease:'power2.in', onComplete:() => {
    s1Boot.style.display = 'none';
    // Start Phase 2
    startCinema();
  }});

// ── Phase 2: Cinema reveal + video play ───────
function startCinema(){
  s1Video.play().catch(()=>{});

  const revealTL = gsap.timeline();
  revealTL
    // Fade in cinema frame
    .to(s1Cinema, {opacity:1, duration:1.2, ease:'power2.out'})
    // Scene bleed washes in from sides
    .to('#s1-bleed', {opacity:1, duration:1.5, ease:'power2.out'}, 0.6)
    // Side data panels fade in
    .to('#s1-data-l', {opacity:1, duration:1.0, ease:'power2.out'}, 1.2)
    .to('#s1-data-r', {opacity:1, duration:1.0, ease:'power2.out'}, 1.4)
    // Scan line sweep across cinema frame
    .fromTo('#hud-scanline',
      {opacity:0.6, top:'20%'},
      {top:'80%', duration:1.5, ease:'power1.inOut',
       onComplete:() => gsap.to('#hud-scanline',{opacity:0, duration:0.3})
      }, 0.8)
    // Headline + button — appear early while video still plays
    .to('#s1-headline', {opacity:1, y:0, duration:1.2, ease:'power3.out'}, 1.0)
    .to('#start-btn',   {opacity:1, y:0, duration:0.8, ease:'power2.out'}, 4.0)
    .to('#s1-key-hint',  {opacity:1, duration:0.5, ease:'power2.out'}, 4.6)
    .add(() => {
      showSI();
      s1Ready = true;
    });
}

// ── Phase 3: Side data subtle animations ─────
// Slow coordinate drift (simulates GPS jitter)
setInterval(() => {
  const lat = (28.6139 + (Math.random()-.5)*0.0004).toFixed(4);
  const lng = (77.2090 + (Math.random()-.5)*0.0004).toFixed(4);
  const el = document.getElementById('sd-coords');
  if(el) el.innerHTML = lat+'° N<br>'+lng+'° E';
}, 3000);

// Time tick
setInterval(() => {
  const el = document.getElementById('sd-time');
  if(!el) return;
  const secs = ['05:45','05:45','05:46','05:46'][Math.floor(Date.now()/15000)%4];
  el.innerHTML = secs+' IST<br><span class="dim">BLUE HOUR</span>';
}, 15000);

// ── Side data parallax on mouse move ──────────
document.getElementById('s1').addEventListener('mousemove', e => {
  const rect = e.currentTarget.getBoundingClientRect();
  const nx = (e.clientX - rect.left) / rect.width - 0.5;
  const ny = (e.clientY - rect.top) / rect.height - 0.5;
  gsap.to('.s1-side-data', {x: nx*8, y: ny*5, duration:1.0, ease:'power2.out'});
  gsap.to('.s1-bleed-line', {y: ny*3, duration:1.0, ease:'power2.out'});
});

// ── Keyboard: ENTER to start ──────────────────
let s1Ready = false;
document.addEventListener('keydown', e => {
  if(e.key === 'Enter' && s1Ready){
    document.getElementById('start-btn').click();
  }
});

// ── Fallback if video never loads ─────────────
setTimeout(() => {
  if(s1Cinema.style.opacity === '0' || s1Cinema.style.opacity === ''){
    s1Boot.style.display = 'none';
    startCinema();
  }
}, 12000);

document.getElementById('start-btn').addEventListener('click', e => {
  // Always preventDefault — stops the href="#s2" anchor from hard-jumping
  // (which used to read like a page reload if user clicked before s1Ready)
  e.preventDefault();
  if(!s1Ready) return;
  s1Ready = false;
  hideSI();

  const trans    = document.getElementById('s1-transition');
  const cinema   = document.getElementById('s1-cinema');
  const headWrap = document.getElementById('s1-headline-wrap');
  const ctaWrap  = document.getElementById('s1-cta-wrap');
  const bleed    = document.getElementById('s1-bleed');
  const dataL    = document.getElementById('s1-data-l');
  const dataR    = document.getElementById('s1-data-r');

  trans.classList.add('active');

  const jumpTL = gsap.timeline();
  jumpTL
    // ── Phase A: Pure camera push (0.0–1.4s) ──
    // Scale only. No blur, no brightness change — the user sees the truck coming closer first.
    .to(cinema, {
      scale:2.4,
      duration:1.4,
      ease:'power2.in',
    }, 0)

    // ── Phase B: Motion blur kicks in (1.0–2.0s) ──
    // Camera is now lunging — blur sells the speed.
    .to(cinema, {
      filter:'blur(18px) brightness(1)',
      duration:1.0,
      ease:'power1.in',
    }, 1.0)

    // ── Phase C: Brightness drops to black (1.6–2.4s) ──
    // Blends with phase B's blur into the same `filter` property.
    .to(cinema, {
      filter:'blur(18px) brightness(0)',
      duration:0.8,
      ease:'power2.in',
    }, 1.6)

    // ── Phase C2: UI melts into the darkness alongside brightness drop (1.6–2.4s) ──
    .to([headWrap, ctaWrap, dataL, dataR, bleed], {
      opacity:0, duration:0.8, ease:'power2.in'
    }, 1.6)

    // ── Phase D: Black overlay seals it (2.2–2.6s) ──
    .to(trans, {opacity:1, duration:0.4, ease:'power2.inOut'}, 2.2)

    // ── Phase E: Hold + scroll to S2 (2.6–2.9s) ──
    .to({}, {duration:0.3})
    .add(() => {
      lenis.scrollTo('#s2', {immediate:true});
    })

    // ── Phase F: Fade in S2 (2.9–3.9s) ──
    .to(trans, {opacity:0, duration:1.0, ease:'power2.out'}, '+=0.1')

    // ── Cleanup ──
    .add(() => {
      trans.classList.remove('active');
      gsap.set(cinema, {scale:1, filter:'none'});
      gsap.set([headWrap, ctaWrap, bleed, dataL, dataR], {opacity:1});
    });
});

