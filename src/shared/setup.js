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

/* Calm default easing for any tween that doesn't set its own — matches the
   site's signature cubic-bezier(0.32,0.72,0,1). Explicit bounce eases
   (back.out…) are replaced per-scene. */
gsap.defaults({ ease: 'power3.out' });

/* ── Lenis init ─────────────────────────────── */
const lenis = new Lenis({
  duration: 1.25,
  easing: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
window.__lenis = lenis; /* dev aid: lets tooling drive scroll precisely */

/* ── Bulletproof scroll lock (single source of truth) ───────────
   A "locked" section must be immovable to EVERY input vector. Lenis.stop()
   only halts Lenis's own smooth engine; native wheel / trackpad-momentum /
   keyboard / touch / SCROLLBAR-DRAG all still scroll the page natively. So:
     1. wheel/touchmove/keydown guards preventDefault() while __scrollLocked.
     2. a scroll-position ANCHOR snaps the page back on any native drift —
        this is what defeats scrollbar-drag, momentum and overscroll (the
        vectors the guards above can't catch, since they fire raw `scroll`).
   The anchor is OPT-IN (armed only via lockScroll/setLockAnchor) so a scene
   that legitimately moves scroll while locked can disarm it without losing
   the wheel/key guards. Helpers are exported AND mirrored on window for the
   scene modules that talk through globals. */
const SCROLL_KEYS = {' ':1,'Spacebar':1,'ArrowUp':1,'ArrowDown':1,'ArrowLeft':1,'ArrowRight':1,'PageUp':1,'PageDown':1,'Home':1,'End':1};
let __anchorArmed = false;
let __anchorY = 0;
window.addEventListener('wheel',     e => { if(window.__scrollLocked) e.preventDefault(); }, { passive:false });
window.addEventListener('touchmove', e => { if(window.__scrollLocked) e.preventDefault(); }, { passive:false });
window.addEventListener('keydown',   e => { if(window.__scrollLocked && SCROLL_KEYS[e.key]) e.preventDefault(); }, { passive:false });
/* The anchor snap-back: if the page drifts off __anchorY while locked+armed, pull
   it straight back. This is what defeats the vectors the guards above can't catch —
   scrollbar-drag, trackpad momentum, overscroll — which move scroll without a
   cancellable wheel/key event. Self-stabilizing: once scrollY === __anchorY it's a
   no-op (no loop). Driven from TWO sources for resilience:
     • a `scroll` listener — instant response to real user input (a visible page
       always emits `scroll` on scrollbar-drag/momentum);
     • the gsap ticker (already pumping Lenis) — a per-frame safety net.
   (Both pause when the tab is hidden, but a hidden tab can't be scrolled either.) */
function __correctDrift(){
  if(window.__scrollLocked && __anchorArmed && Math.abs(window.scrollY - __anchorY) > 1){
    window.scrollTo(0, __anchorY);
  }
}
window.addEventListener('scroll', __correctDrift, { passive:true });
gsap.ticker.add(__correctDrift);

function lockScroll(opts){
  window.__scrollLocked = true;
  try{ lenis.stop(); }catch(e){}
  if(!opts || opts.anchor !== false){
    __anchorArmed = true;
    __anchorY = (opts && opts.y != null) ? opts.y : window.scrollY;
  }
}
function unlockScroll(){
  window.__scrollLocked = false;
  __anchorArmed = false;
  try{ lenis.start(); }catch(e){}
}
function setLockAnchor(y){ __anchorY = (y != null) ? y : window.scrollY; __anchorArmed = true; }
function disarmAnchor(){ __anchorArmed = false; }
window.lockScroll = lockScroll;
window.unlockScroll = unlockScroll;
window.setLockAnchor = setLockAnchor;
window.disarmAnchor = disarmAnchor;

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

export { lenis, showSI, hideSI, isMobile, MOBILE_QUERY, lockScroll, unlockScroll, setLockAnchor, disarmAnchor };

/* ── Request-a-Demo modal ───────────────────────
   Self-contained feature: builds its own DOM, ships its own CSS, and
   wires itself to the .nav-demo + #closingCta CTAs. Uses window.__lenis
   (set above) for scroll-lock at runtime. */
import './demo-form.js';

