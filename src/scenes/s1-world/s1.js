import { lenis } from '../../shared/setup.js';
import { prepText, revealText } from '../../shared/text-reveal.js';

/* ════════════════════════════════════════════
   S1 — THE WORLD (forma-frame hero · game start)
════════════════════════════════════════════ */
const s1Video  = document.getElementById('s1-video');
const s1Cinema = document.getElementById('s1-cinema');
const s1Frame  = document.getElementById('s1-frame-svg');
const s1Boot   = document.getElementById('s1-boot');

let s1Ready    = false;  /* Start button + Enter armed */
let s1Advanced = false;  /* the S1→S2 jump has fired (run once) */

/* Pre-split the hero headline so it can rise in letter-by-letter on cinema reveal. */
prepText(document.getElementById('s1-headline'));

/* ── First gesture fires the cinematic S1→S2 jump (scroll stays hard-locked) ── */
window.__scrollLocked = true;
try{ lenis.stop(); }catch(e){}

const S1_KEYS = {' ':1,'Spacebar':1,'ArrowUp':1,'ArrowDown':1,'PageUp':1,'PageDown':1,'Home':1,'End':1};
function onFirstGesture(e){ e.preventDefault(); fireAdvance(); }
function onFirstKey(e){ if(S1_KEYS[e.key]){ e.preventDefault(); fireAdvance(); } }
function detachAdvance(){
  window.removeEventListener('wheel', onFirstGesture, {passive:false});
  window.removeEventListener('touchmove', onFirstGesture, {passive:false});
  window.removeEventListener('keydown', onFirstKey, {passive:false});
}
function fireAdvance(){ detachAdvance(); startTransition(); }
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
  .to({}, {duration: 0.6})
  .to(s1Boot, {opacity:0, duration:0.6, ease:'power2.in', onComplete:() => {
    s1Boot.style.display = 'none';
    startCinema();
  }});

// ── Phase 2: Frame reveal + video play ────────
function startCinema(){
  s1Video.play().catch(()=>{});
  const tl = gsap.timeline();
  tl.to(s1Cinema,  {opacity:1, duration:1.1, ease:'power3.out'})
    .call(() => revealText(document.getElementById('s1-headline'), {duration:1.0}), null, 0.6)
    .to('#start-btn',   {opacity:1, y:0, duration:0.6, ease:'power3.out'}, 1.0)
    .add(() => {
      s1Ready = true;
      const b = document.getElementById('start-btn');
      if(b) b.classList.add('s1-press-indicator');
    });
}

// ── Keyboard: ENTER to start ──────────────────
document.addEventListener('keydown', e => {
  if(e.key === 'Enter' && s1Ready){ document.getElementById('start-btn').click(); }
});

// ── Fallback if the video never loads ─────────
setTimeout(() => {
  if(s1Cinema.style.opacity === '0' || s1Cinema.style.opacity === ''){
    s1Boot.style.display = 'none';
    startCinema();
  }
}, 12000);

// ── S1 → S2 cinematic jump (button or first gesture; runs once) ──
function startTransition(){
  if(s1Advanced) return;
  s1Advanced = true;
  s1Ready = false;
  detachAdvance();
  if(s1Boot) s1Boot.style.display = 'none';
  window.__scrollLocked = true;

  const startBtn = document.getElementById('start-btn');
  if(startBtn) startBtn.classList.remove('s1-press-indicator');

  const trans = document.getElementById('s1-transition');
  const ov    = document.querySelector('.s1-ov');
  trans.classList.add('active');

  function goToScene2(){
    const s2 = document.getElementById('s2');
    if(!s2) return;
    const top = s2.getBoundingClientRect().top + window.scrollY;
    try{ lenis.scrollTo(top, {immediate:true, force:true}); }catch(e){}
    window.scrollTo(0, top);
  }
  const scrollSafety = setTimeout(goToScene2, 3300);

  const jumpTL = gsap.timeline();
  jumpTL
    // text/UI out first
    .to(ov, {opacity:0, duration:0.5, ease:'power2.in'}, 0)
    // camera pushes into the truck (scale the framed video, not the overlay)
    .to(s1Frame, {scale:2.4, transformOrigin:'58% 60%', duration:1.35, ease:'power3.in'}, 0.45)
    .fromTo(s1Frame, {filter:'blur(0px)'}, {filter:'blur(22px)', duration:1.0, ease:'power2.in'}, 1.4)
    // single fade to black over the blurred truck
    .to(trans, {opacity:1, duration:0.7, ease:'power2.inOut'}, 2.4)
    // jump while fully black
    .call(function(){ clearTimeout(scrollSafety); goToScene2(); }, null, 3.15)
    // reveal S2 from black
    .to(trans, {opacity:0, duration:1.2, ease:'power3.out'}, 3.4)
    // cleanup
    .call(function(){
      trans.classList.remove('active');
      gsap.set(s1Frame, {scale:1, filter:'none'});
      gsap.set(ov, {opacity:1});
    }, null, 4.7);
}

document.getElementById('start-btn').addEventListener('click', e => {
  e.preventDefault();
  if(!s1Ready) return;
  startTransition();
});
