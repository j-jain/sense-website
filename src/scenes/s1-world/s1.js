import { lenis, showSI, hideSI } from '../../shared/setup.js';

/* ════════════════════════════════════════════
   S1 — THE WORLD (Game Start Sequence)
════════════════════════════════════════════ */

const s1Video  = document.getElementById('s1-video');
const s1Cinema = document.getElementById('s1-cinema');
const s1Boot   = document.getElementById('s1-boot');

/* ── Shared scene flags ───────────────────────── */
let s1Ready     = false;  /* button is interactive (Start button + Enter key) */
let s1Advanced  = false;  /* the S1→S2 jump has fired (run once) */

/* ════════════════════════════════════════════
   INSTANT-SCROLL ADVANCE
   ────────────────────────────────────────────
   The FIRST scroll / touch / arrow-key gesture fires the cinematic S1→S2 jump
   immediately, from page load — no waiting on the hero video. The page itself
   never drifts: we keep the global hard-lock (honored by the blocker in s23.js)
   and Lenis stopped, and our own interceptor turns that first gesture into the
   transition. preventDefault stops any native/Lenis scroll from sneaking in. */
window.__scrollLocked = true;
try{ lenis.stop(); }catch(e){}

const S1_SCROLL_KEYS = {' ':1,'Spacebar':1,'ArrowUp':1,'ArrowDown':1,'PageUp':1,'PageDown':1,'Home':1,'End':1};
function onFirstGesture(e){ e.preventDefault(); fireAdvance(); }
function onFirstKey(e){ if(S1_SCROLL_KEYS[e.key]){ e.preventDefault(); fireAdvance(); } }
function detachAdvance(){
  window.removeEventListener('wheel', onFirstGesture, {passive:false});
  window.removeEventListener('touchmove', onFirstGesture, {passive:false});
  window.removeEventListener('keydown', onFirstKey, {passive:false});
}
function fireAdvance(){ detachAdvance(); startTransition(); }

/* Arm immediately at load — the very first gesture fires the jump. */
window.addEventListener('wheel', onFirstGesture, {passive:false});
window.addEventListener('touchmove', onFirstGesture, {passive:false});
window.addEventListener('keydown', onFirstKey, {passive:false});

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
      s1Ready = true;
      /* Tap affordance on the button (mirrors the phone's TAP indicator in S2).
         No scroll-indicator here — the button is the cue now. */
      const b = document.getElementById('start-btn');
      if(b) b.classList.add('s1-press-indicator');
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

// Both the button and the first scroll gesture call this — guarded to run once.
function startTransition(){
  if(s1Advanced) return;
  s1Advanced = true;
  s1Ready = false;
  detachAdvance();
  hideSI();
  /* If the user scrolled during the boot terminal, make sure it's gone so it
     can't linger underneath after the jump. */
  if(s1Boot) s1Boot.style.display = 'none';

  // Block user input through the cinematic jump (programmatic lenis.scrollTo
  // still works). S2's activatePhone keeps the lock and onScreenDComplete
  // releases it.
  window.__scrollLocked = true;

  const startBtn = document.getElementById('start-btn');
  if(startBtn) startBtn.classList.remove('s1-press-indicator');

  const trans    = document.getElementById('s1-transition');
  const cinema   = document.getElementById('s1-cinema');
  const headWrap = document.getElementById('s1-headline-wrap');
  const ctaWrap  = document.getElementById('s1-cta-wrap');
  const bleed    = document.getElementById('s1-bleed');
  const dataL    = document.getElementById('s1-data-l');
  const dataR    = document.getElementById('s1-data-r');

  trans.classList.add('active');

  // Guaranteed jump to Scene 2 — uses the ABSOLUTE document position (Lenis +
  // native fallback) so the Start button ALWAYS lands on Scene 2.
  function goToScene2(){
    const s2 = document.getElementById('s2');
    if(!s2) return;
    const top = s2.getBoundingClientRect().top + window.scrollY;
    try{ lenis.scrollTo(top, {immediate:true, force:true}); }catch(e){}
    window.scrollTo(0, top);
  }
  // Hard safety net (real-time): fire the scroll even if the GSAP callback
  // misbehaves. Fires while the screen is fully black (~3.3s after click).
  const scrollSafety = setTimeout(goToScene2, 3300);

  const jumpTL = gsap.timeline();
  jumpTL
    // ── Phase A: Text/UI gone FIRST (0.0–0.6s) ──
    .to([headWrap, ctaWrap, dataL, dataR, bleed], {
      opacity:0, duration:0.6, ease:'power2.in'
    }, 0)

    // ── Phase B: PAN — camera pushes toward the truck (0.55–1.9s) ──
    .to(cinema, {
      scale:2.4, duration:1.35, ease:'power2.in',
    }, 0.55)

    // ── Phase C: BLUR — the truck blurs while still bright (1.5–2.5s) ──
    // fromTo with explicit blur(0) avoids GSAP's "none"→filter flash.
    .fromTo(cinema,
      {filter:'blur(0px)'},
      {filter:'blur(22px)', duration:1.0, ease:'power2.in'},
    1.5)

    // ── Phase D: BLACK — one single fade to black over the blurred truck (2.5–3.2s) ──
    .to(trans, {opacity:1, duration:0.7, ease:'power2.inOut'}, 2.5)

    // ── Phase E: Jump to S2 while fully black (.call is the correct API for callbacks) ──
    .call(function(){ clearTimeout(scrollSafety); goToScene2(); }, null, 3.25)

    // ── Phase F: Reveal S2 from black (soft) ──
    .to(trans, {opacity:0, duration:1.2, ease:'power2.out'}, 3.5)

    // ── Cleanup ──
    .call(function(){
      trans.classList.remove('active');
      gsap.set(cinema, {scale:1, filter:'none'});
      gsap.set([headWrap, ctaWrap, bleed, dataL, dataR], {opacity:1});
    }, null, 4.8);
}

document.getElementById('start-btn').addEventListener('click', e => {
  // Always preventDefault — stops the href="#s2" anchor from hard-jumping
  // (which used to read like a page reload if user clicked before s1Ready)
  e.preventDefault();
  if(!s1Ready) return;
  startTransition();
});

