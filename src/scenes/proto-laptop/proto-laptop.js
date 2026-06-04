/* ════════════════════════════════════════════════════════════
   PROTO — Real phone → laptop morph + explorer + Scene-4 signal
   1. Scroll reshapes the REAL Scene-2 phone into a laptop and boots
      the REAL Scene-3 dashboard inside (scaled to fit, legible).
   2. Settle → explorer reveals; clicking a feature opens that metric's
      detailed screen inside the laptop.
   3. Scroll on → Scene 4 "the signal": the dashboard goes dark and the
      coolant card alone stays lit, climbs 94→101°C, then a 3-2-1
      countdown plays and the Scene-5 loading beat starts (running
      timer 00:00). Standalone — it stops there.
════════════════════════════════════════════════════════════ */
/* Integrated into the main site: reuse the ONE Lenis + GSAP/ScrollTrigger that
   shared/setup.js already created and registered — never build a second scroll
   system (it would fight the rest of the page). */
import { lenis, isMobile } from '../../shared/setup.js';

/* ── Device / morph elements ── */
const device      = document.getElementById('device');
const phone       = document.getElementById('phone');
const phoneBody   = document.getElementById('phoneBody');
const phoneNotch  = document.getElementById('phoneNotch');
const phoneStatus = document.getElementById('phoneStatus');
const phoneScreens= document.getElementById('phoneScreens');
const volBtns     = Array.from(document.querySelectorAll('#phone .s2-phone-vol, #phone .s2-phone-vol2'));
const screenEl    = document.getElementById('screen');
const boot        = document.getElementById('boot');
const bootBar     = document.getElementById('bootBar');
const dash        = document.getElementById('dash');
const dashScale   = document.getElementById('dashScale');
const base        = document.getElementById('base');
const scrollHint  = document.getElementById('scrollHint');
const stage       = document.getElementById('proto-stage');
const capTop      = document.getElementById('capTop');
const lpHinge     = document.getElementById('lpHinge');
const lpWebcam    = document.getElementById('lpWebcam');
const lpShadow    = document.getElementById('lpShadow');
const lpGlare     = document.getElementById('lpGlare');

/* The phone arrived from Scene 2 already — the "It begins in your hand" intro
   caption is redundant inside the main site. */
if(capTop) capTop.style.display = 'none';

/* Full-viewport black curtain — rises over the iPad after "Initiating platform
   response…" so the hand-off into Scene 5 is full-screen (see runCountdown). */
const fsBlack = document.createElement('div');
fsBlack.id = 'proto-fs-black';
fsBlack.style.cssText = 'position:fixed;inset:0;background:#000;opacity:0;z-index:100000;pointer-events:none;';
document.body.appendChild(fsBlack);

/* ── Explorer ── */
const explorer = document.getElementById('lp-explorer');
const features = Array.from(document.querySelectorAll('.lp-feature'));
const details  = Array.from(document.querySelectorAll('.lp-detail'));

/* ── Scene-3 overlay elements ── */
const ov1 = document.getElementById('ov1');
const ov2 = document.getElementById('ov2');
const ov3 = document.getElementById('ov3');
const ov4 = document.getElementById('ov4');
const ov5 = document.getElementById('ov5');
const gaugeArc = document.getElementById('gauge-arc');
const gaugePct = document.getElementById('gauge-pct');
const fuelBar  = document.getElementById('fuel-bar');
const etaPath  = document.getElementById('eta-path');

/* ── Scene-4 elements (from the included s23.html) ── */
const s23Trans     = document.getElementById('s23-trans');
const s4DarkOverlay= document.getElementById('s4-dark-overlay');
const s4RedOverlay = document.getElementById('s4-red-overlay');
const s4Textbox    = document.getElementById('s4-textbox');
const coolantCard  = document.getElementById('coolant-card');
const coolantVal   = document.getElementById('coolant-val');
const coolantSub   = document.getElementById('coolant-sub');
const edgeFill     = document.getElementById('edge-fill');
const targetTruckDot = document.querySelector('.lp-screen .map-marker.running');

/* ── helpers ── */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut   = t => 1 - Math.pow(1 - t, 3);
function band(p, a, b){
  const f = 0.04;
  if(p < a - f || p > b + f) return 0;
  if(p < a) return (p - (a - f)) / f;
  if(p > b) return 1 - (p - b) / f;
  return 1;
}
function getScale(){ const w = screenEl.clientWidth; return w > 0 ? w / 1080 : 0.78; }

const PHONE = { w: 280, h: 580, r: 40, pad: 8, border: 2, screenR: 32 };
function laptopDims(){
  /* iPad slab. `pad` is the bezel thickness; the frame is grown by the same
     amount (2*(pad-4)) so the screen (dashboard inside) keeps its size while the
     bezel gets larger. Corner radius is rounded up so it reads as a tablet. */
  const pad = 10;                                          /* iPad bezel (was 4) */
  const w = Math.min(window.innerWidth * 0.60, 1080) + 2 * (pad - 4);
  return { w: w, h: Math.round(w * 0.625), r: 24, pad: pad, border: 2, screenR: 18 };
}

/* ── Scene-3 overlay reveal (ported from s23.js) ── */
gsap.set(ov5, { xPercent: -50, y: 12 });
function revealS3Overlays(){
  gsap.killTweensOf([ov1, ov2, ov3, ov4, ov5, gaugeArc, fuelBar, etaPath]);
  gsap.to(ov1, { opacity: 1, y: 0, duration: .35, ease: 'power2.out' });
  gsap.to(gaugeArc, { strokeDashoffset: 125.7 * 0.04, duration: .8, delay: .08, ease: 'power2.out' });
  const ctr = { val: 0 };
  gsap.to(ctr, { val: 96, duration: .8, delay: .08, ease: 'power2.out',
    onUpdate: function(){ if(gaugePct) gaugePct.textContent = Math.round(ctr.val) + '%'; } });
  gsap.to(ov2, { opacity: 1, y: 0, duration: .35, delay: .08, ease: 'power2.out' });
  gsap.to(fuelBar, { width: '84%', duration: .7, delay: .16, ease: 'power2.out' });
  gsap.to(ov3, { opacity: 1, y: 0, duration: .35, delay: .16, ease: 'power2.out' });
  gsap.to(ov4, { opacity: 1, y: 0, duration: .35, delay: .24, ease: 'power2.out' });
  gsap.to(etaPath, { scaleX: 1, duration: .7, delay: .32, ease: 'power2.out' });
  gsap.to(ov5, { opacity: 1, y: 0, xPercent: -50, duration: .35, delay: .32, ease: 'power2.out' });
}
function resetS3Overlays(){
  gsap.killTweensOf([ov1, ov2, ov3, ov4, ov5, gaugeArc, fuelBar, etaPath]);
  gsap.set([ov1, ov2, ov3, ov4], { opacity: 0, y: 12 });
  gsap.set(ov5, { opacity: 0, y: 12, xPercent: -50 });
  gsap.set(gaugeArc, { strokeDashoffset: 125.7 });
  gsap.set(fuelBar, { width: '0%' });
  gsap.set(etaPath, { scaleX: 0 });
  if(gaugePct) gaugePct.textContent = '0%';
}
resetS3Overlays();

/* ════════════════════════════════════════════════════════════
   MORPH render — phone reshapes into the laptop; chrome dissolves;
   dashboard boots. Fully settled by ~p 0.34 (leaves room for Scene 4).
════════════════════════════════════════════════════════════ */
function render(p){
  const m      = clamp((p - 0.04) / (0.26 - 0.04), 0, 1);  /* phone → laptop */
  const u      = clamp((p - 0.20) / (0.28 - 0.20), 0, 1);  /* keyboard unfold */
  const boot01 = clamp((p - 0.18) / (0.26 - 0.18), 0, 1);  /* boot appears, overlaps reshape tail */
  const d      = clamp((p - 0.26) / (0.36 - 0.26), 0, 1);  /* dashboard crossfade (wider, gentler) */

  const lap = laptopDims();
  const me  = easeInOut(m);
  const chromeT = clamp(m / 0.6, 0, 1);

  phone.style.width  = lerp(PHONE.w, lap.w, me) + 'px';
  phone.style.height = lerp(PHONE.h, lap.h, me) + 'px';

  phoneBody.style.borderRadius = lerp(PHONE.r, lap.r, chromeT) + 'px';
  phoneBody.style.padding      = lerp(PHONE.pad, lap.pad, chromeT) + 'px';
  screenEl.style.borderRadius  = lerp(PHONE.screenR, lap.screenR, chromeT) + 'px';
  phoneBody.classList.toggle('bare', chromeT > 0.55);
  phoneNotch.style.opacity  = String(1 - chromeT);
  phoneStatus.style.opacity = String(1 - chromeT);
  volBtns.forEach(v => v.style.opacity = String(1 - chromeT));
  /* Hold the full Screen D up through the reshape and only dissolve it as the boot
     shimmer rises — driving the fade off chromeT made the screen blank ~p0.15, well
     before the boot appeared (~p0.24), which read as an abrupt cut to dark. */
  phoneScreens.style.opacity = String(1 - boot01);

  const turnY = Math.sin(m * Math.PI) * -40;
  const tiltX = lerp(0, -5, easeOut(m));
  device.style.transform = 'rotateX(' + tiltX + 'deg) rotateY(' + turnY + 'deg)';

  const ue = easeOut(u);
  const baseOp = u > 0 ? clamp(u * 1.4, 0, 1) : 0;
  base.style.opacity   = String(baseOp);
  base.style.transform = 'translateX(-50%) rotateX(80deg) scaleY(' + ue + ')';

  /* Laptop detail nodes fade in as it becomes a laptop */
  lpHinge.style.opacity  = String(baseOp);
  lpShadow.style.opacity = String(baseOp * 0.9);
  lpWebcam.style.opacity = String(chromeT);
  lpGlare.style.opacity  = String(chromeT * 0.7);
  phone.classList.toggle('lp-laptop', chromeT > 0.9);  /* matte laptop bezel */

  boot.style.opacity = String(clamp(boot01 * (1 - d), 0, 1));
  bootBar.style.width = (clamp(d, 0, 1) * 100) + '%';
  dash.style.opacity = String(d);

  if(d > 0.01){
    const sw = screenEl.clientWidth;
    if(sw > 0) dashScale.style.transform = 'scale(' + (sw / 1080) + ')';
  }

  capTop.style.opacity = String(band(p, 0.00, 0.08));
  scrollHint.style.opacity = p > 0.03 ? '0' : '';
}

/* ── Settle: reveal explorer + Scene-3 overlays (hold band only) ── */
let settled = false;
function settle(){
  if(settled) return;
  settled = true;
  stage.classList.add('explorer-on');
  explorer.classList.add('on');
  resetS3Overlays();
  revealS3Overlays();
}
function unsettle(){
  if(!settled) return;
  settled = false;
  stage.classList.remove('explorer-on');
  explorer.classList.remove('on');
  closeDetail();
}

/* ════════════════════════════════════════════════════════════
   SCENE 4 — coolant becomes the focus as the screen goes dark
   (ported from s23.js, scale-corrected for the proto's scaled host).
════════════════════════════════════════════════════════════ */
const S4_MSG1 = 'Small signals before major failures.';
const S4_MSG2 = 'Anomaly Detected — Engine Thermal System';
let inScene4 = false;
let s4TextStage = 0;
let coolantPromoted = false, coolantHome = null;
let coolantHomeLeft = 0, coolantHomeTop = 0;   /* card's home pos in #s23-trans local px */

function promoteCoolant(){
  if(coolantPromoted || !coolantCard || !s23Trans) return;
  coolantPromoted = true;
  coolantHome = coolantCard.parentNode;
  const scale = getScale();
  const r  = coolantCard.getBoundingClientRect();
  const tr = s23Trans.getBoundingClientRect();
  coolantHomeLeft = (r.left - tr.left) / scale;
  coolantHomeTop  = (r.top  - tr.top)  / scale;
  coolantCard.style.position  = 'absolute';
  coolantCard.style.left      = coolantHomeLeft + 'px';
  coolantCard.style.top       = coolantHomeTop  + 'px';
  coolantCard.style.width     = (r.width / scale) + 'px';
  coolantCard.style.margin    = '0';
  coolantCard.style.zIndex    = '45';
  coolantCard.style.transformOrigin = 'center center';
  coolantCard.style.transition = 'none';
  coolantCard.classList.add('coolant-focus');
  s23Trans.appendChild(coolantCard);
}
function demoteCoolant(){
  if(!coolantPromoted || !coolantCard) return;
  coolantPromoted = false;
  coolantCard.classList.remove('coolant-focus');
  ['position','left','top','width','margin','zIndex','transformOrigin',
   'transition','transform','boxShadow','background','border','borderColor']
    .forEach(pp => coolantCard.style[pp] = '');
  if(coolantHome) coolantHome.appendChild(coolantCard);
  coolantHome = null;
}
function setS4Text(msg){
  gsap.to(s4Textbox, { opacity: 0, duration: .25, ease: 'power2.in', onComplete: function(){
    s4Textbox.textContent = msg;
    gsap.to(s4Textbox, { opacity: 1, duration: .35, ease: 'power2.out' });
  }});
}
function enterScene4(){
  if(inScene4) return;
  inScene4 = true;
  stage.classList.remove('explorer-on');   /* laptop recentres for the drama */
  explorer.classList.remove('on');
  closeDetail();
  settled = false;
  /* anomaly textbox removed (R4) — the coolant spotlight tells the story */
}
function exitScene4(){
  if(!inScene4) return;
  inScene4 = false;
  s4TextStage = 0;
  demoteCoolant();
  if(coolantVal){ coolantVal.textContent = '94°C'; coolantVal.style.color = ''; }
  if(coolantSub) coolantSub.textContent = 'Normal operating range: 88–95°C';
  if(coolantCard){ coolantCard.classList.remove('alert'); coolantCard.style.borderColor = ''; coolantCard.style.boxShadow = ''; }
  if(edgeFill) edgeFill.style.height = '0%';
  if(targetTruckDot) targetTruckDot.style.background = '';
  if(s4RedOverlay) s4RedOverlay.style.opacity = 0;
  if(s4DarkOverlay) s4DarkOverlay.style.opacity = 0;
  gsap.to(s4Textbox, { opacity: 0, duration: .3 });
  s4Textbox.classList.remove('alert');
  resetCountdown();
}
function scene4Climb(p){
  if(!inScene4) return;
  const tempP = clamp((p - 0.55) / (0.86 - 0.55), 0, 1);
  const temp = 94 + tempP * 7;

  if(coolantVal) coolantVal.textContent = Math.round(temp) + '°C';
  let color;
  if(temp < 97){
    color = '#43A047';
    coolantCard && coolantCard.classList.remove('alert');
    coolantSub && (coolantSub.textContent = 'Normal operating range: 88–95°C');
  } else if(temp < 100){
    color = '#F5A623';
    if(coolantCard){ coolantCard.style.borderColor = 'var(--amber)'; }
    coolantSub && (coolantSub.textContent = '⚠ Above normal — monitoring');
    targetTruckDot && (targetTruckDot.style.background = '#F5A623');
  } else {
    color = '#D73030';
    coolantCard && coolantCard.classList.add('alert');
    coolantSub && (coolantSub.textContent = '⚠ CRITICAL — Anomaly detected');
    targetTruckDot && (targetTruckDot.style.background = '#F5A623');
  }
  if(coolantVal) coolantVal.style.color = color;
  if(edgeFill) edgeFill.style.height = (tempP * 100) + '%';

  /* Red wash */
  let redIntensity = temp >= 97 ? Math.min((temp - 97) / 4, 1) : 0;
  const a = redIntensity * 0.18;
  if(s4RedOverlay){
    s4RedOverlay.style.background = 'radial-gradient(ellipse at center, rgba(215,48,48,' + (a * 0.6) + ') 0%, rgba(140,20,20,' + a + ') 100%)';
    s4RedOverlay.style.opacity = redIntensity > 0 ? 1 : 0;
  }

  /* Dark veil + coolant spotlight */
  const focusP = clamp((temp - 96) / 5, 0, 1);
  if(focusP > 0){
    promoteCoolant();
    /* Glide the card from its home spot to the center of the iPad screen as it
       climbs, while growing. All math is in #s23-trans local px (same scale the
       card now lives under), so its center lands dead-center at focusP === 1. */
    const cx = s23Trans.clientWidth  / 2;
    const cy = s23Trans.clientHeight / 2;
    const dx = cx - (coolantHomeLeft + coolantCard.offsetWidth  / 2);
    const dy = cy - (coolantHomeTop  + coolantCard.offsetHeight / 2);
    const sc = 1 + focusP * 0.5;
    coolantCard.style.transform =
      'translate(' + (dx * focusP) + 'px,' + (dy * focusP) + 'px) scale(' + sc + ')';
    coolantCard.style.boxShadow =
      '0 0 ' + (focusP * 48) + 'px rgba(215,48,48,' + (focusP * 0.85) + '),' +
      '0 0 ' + (focusP * 120) + 'px rgba(215,48,48,' + (focusP * 0.45) + ')';
  } else if(coolantPromoted){
    demoteCoolant();
  }
  if(s4DarkOverlay) s4DarkOverlay.style.opacity = String(focusP * 0.82);
}

/* ════════════════════════════════════════════════════════════
   COUNTDOWN — standalone: 3-2-1 → blackout → "Initiating platform
   response…" → running timer 00:00 (Scene-5 loading started). Stops.
════════════════════════════════════════════════════════════ */
function resetCountdown(){
  window._cdFired = false;
  const overlay = document.getElementById('countdown-overlay');
  const cdProgress = document.getElementById('cd-progress');
  const cdNumeral = document.getElementById('cd-numeral');
  const cdLog = document.getElementById('cd-log');
  const cdScanline = document.getElementById('cd-scanline');
  const timerEl = document.getElementById('running-timer');
  const ring = document.getElementById('countdown-ring');
  if(!overlay) return;
  gsap.killTweensOf([overlay, cdProgress, cdNumeral, cdLog, cdScanline, ring, timerEl]);
  gsap.set(overlay, { opacity: 0, background: 'rgba(0,0,0,0)', display: 'flex' });
  if(cdProgress) gsap.set(cdProgress, { strokeDashoffset: 2 * Math.PI * 72 });
  if(cdNumeral) gsap.set(cdNumeral, { opacity: 0 });
  if(ring) gsap.set(ring, { opacity: 1, scale: 1 });
  if(cdLog) gsap.set(cdLog, { opacity: 0 });
  if(cdScanline) gsap.set(cdScanline, { opacity: 0 });
  if(timerEl) gsap.set(timerEl, { opacity: 0 });
}

function runCountdown(){
  const overlay    = document.getElementById('countdown-overlay');
  const cdProgress = document.getElementById('cd-progress');
  const cdNumeral  = document.getElementById('cd-numeral');
  const cdLog      = document.getElementById('cd-log');
  const cdScanline = document.getElementById('cd-scanline');
  const ring       = document.getElementById('countdown-ring');
  const circumference = 2 * Math.PI * 72;

  lenis.stop();
  window.__scrollLocked = true;
  if(cdLog) cdLog.textContent = '> Initiating platform response...';

  const tl = gsap.timeline({
    onComplete: function(){
      /* Hand off to the REAL Scene 5 (unchanged). Mirror s23.js's handoff:
         jump to the s5a wrapper under full-screen black, refresh, then let the
         Scene-5 autoplay sequencer own scroll + its own blackouts. */
      const s5a = document.getElementById('s5a-wrapper');
      if(s5a) window.scrollTo(0, s5a.getBoundingClientRect().top + window.scrollY);
      ScrollTrigger.refresh();
      if(typeof window.startScene5Autoplay === 'function'){
        window.startScene5Autoplay();
      } else {
        /* Fallback so the user isn't trapped if the sequencer didn't load */
        window.__scrollLocked = false;
        try{ lenis.start(); }catch(e){}
      }
      /* Lift our curtain so Scene 5 (which manages its own blackouts) shows. */
      gsap.to(fsBlack, { opacity: 0, duration: 0.5, delay: 0.15,
        onComplete: function(){ fsBlack.style.opacity = '0'; } });
    }
  });

  tl.to(overlay, { opacity: 1, background: 'rgba(0,0,0,1)', duration: 0.4, ease: 'power2.out' }, 0);
  tl.to(s4Textbox, { opacity: 0, duration: 0.3 }, 0);
  tl.set(cdLog, { position: 'absolute', top: '50%', left: '50%', xPercent: -50, yPercent: -50, margin: 0, fontSize: '18px' }, 0);

  tl.set(cdNumeral, { textContent: '3', opacity: 0, scale: 1.3 }, 0.5);
  tl.to(cdNumeral, { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(1.7)' }, 0.5);
  tl.to(cdProgress, { strokeDashoffset: circumference * 0.667, duration: 0.85, ease: 'power1.inOut' }, 0.5);
  tl.to(cdNumeral, { opacity: 0, scale: 0.8, duration: 0.15 }, 1.35);
  tl.set(cdNumeral, { textContent: '2', scale: 1.3 }, 1.5);
  tl.to(cdNumeral, { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(1.7)' }, 1.5);
  tl.to(cdProgress, { strokeDashoffset: circumference * 0.333, duration: 0.85, ease: 'power1.inOut' }, 1.5);
  tl.to(cdNumeral, { opacity: 0, scale: 0.8, duration: 0.15 }, 2.35);
  tl.set(cdNumeral, { textContent: '1', scale: 1.3 }, 2.5);
  tl.to(cdNumeral, { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(1.7)' }, 2.5);
  tl.to(cdProgress, { strokeDashoffset: 0, duration: 0.85, ease: 'power1.inOut' }, 2.5);

  tl.to(cdNumeral, { opacity: 0, duration: 0.2 }, 3.4);
  tl.to(ring, { opacity: 0, scale: 1.1, duration: 0.3, ease: 'power2.in' }, 3.4);

  tl.to(cdLog, { opacity: 1, duration: 1, ease: 'power2.out' }, 3.6);
  tl.to(overlay, { background: 'rgba(0,0,0,1)', duration: 0.3, ease: 'power2.in' }, 4.8);

  /* Go FULL-SCREEN after "Initiating platform response…": a viewport-filling
     black curtain rises over the iPad, then onComplete hands off to Scene 5.
     (Scene 5 owns the running timer from here — no timer beat in the proto.) */
  tl.to(fsBlack, { opacity: 1, duration: 0.6, ease: 'power2.inOut' }, 5.0);
  tl.to({}, { duration: 0.5 }, 5.6);   /* hold full black before the jump */
}

/* ════════════════════════════════════════════════════════════
   Scroll driver
════════════════════════════════════════════════════════════ */
ScrollTrigger.create({
  trigger: '#proto-wrapper',
  start: 'top top',
  end: 'bottom bottom',
  pin: '#proto-stage',
  scrub: true,
  /* Desktop: the morph wrapper is pulled up 100vh (proto-laptop.css) so this pin
     starts the instant Scene 2 unpins — a seamless phone hand-off. Keep the opaque
     stage HIDDEN until its pin is actually active, else it creeps up over Scene 2's
     hold. On activating, also clear any stale inline opacity Scene 2 left on the
     dashboard shell (#s23-dash) so the dashboard is visible inside the iPad. */
  onToggle: self => {
    if(isMobile()) return;
    stage.style.visibility = self.isActive ? 'visible' : 'hidden';
    /* The wrapper is pulled up 100vh and overlaps Scene 2; keep it click-through
       until the morph pin is active, otherwise its (transparent) pin-spacer steals
       Scene 2's walkthrough button clicks. */
    document.getElementById('proto-wrapper').style.pointerEvents = self.isActive ? 'auto' : 'none';
    if(self.isActive){
      const sh = document.getElementById('s23-dash');
      if(sh) sh.style.opacity = '';
    }
  },
  onUpdate: self => {
    const p = self.progress;
    render(p);

    if(p >= 0.55) enterScene4();
    else {
      exitScene4();
      if(p >= 0.36) settle();
      else if(p < 0.33) unsettle();
    }

    scene4Climb(p);

    if(p >= 0.88 && !window._cdFired){
      window._cdFired = true;
      runCountdown();
    }
  }
});

/* Desktop: until the morph pin engages (see the onToggle above), hide the stage so
   it can't paint over Scene 2, and make the wrapper click-through so its 100vh
   overlap can't steal Scene 2's walkthrough button clicks. */
if(!isMobile()){
  stage.style.visibility = 'hidden';
  document.getElementById('proto-wrapper').style.pointerEvents = 'none';
}
render(0);
window.addEventListener('resize', () => {
  const st = ScrollTrigger.getAll()[0];
  render(st ? st.progress : 0);
});

/* ── Global scroll-lock blocker (countdown can't be scrolled through) ── */
const SCROLL_KEYS = {' ':1,'Spacebar':1,'ArrowUp':1,'ArrowDown':1,'ArrowLeft':1,'ArrowRight':1,'PageUp':1,'PageDown':1,'Home':1,'End':1};
window.addEventListener('wheel',     e => { if(window.__scrollLocked) e.preventDefault(); }, { passive:false });
window.addEventListener('touchmove', e => { if(window.__scrollLocked) e.preventDefault(); }, { passive:false });
window.addEventListener('keydown',   e => { if(window.__scrollLocked && SCROLL_KEYS[e.key]) e.preventDefault(); }, { passive:false });

/* ════════════════════════════════════════════════════════════
   EXPLORER — click a feature to open its detail screen
════════════════════════════════════════════════════════════ */
let openDetail = null;

/* Which dashboard nav item the red marker should jump to per feature */
const DETAIL_NAV = {
  'vehicle-health': 'vehicle-availability',
  'route':          'tracking-live',
  'fuel':           'fuel',
  'driving':        'tracking',
  'eta':            'tracking-history',
  'trip':           'tracking-history'
};

/* Move the dashboard's red active marker + expand the relevant nav group */
function setActiveNav(view){
  const items = document.querySelectorAll('.lp-screen #s23-left .dl-nav-item');
  items.forEach(it => it.classList.toggle('active', it.getAttribute('data-view') === view));
  const active = document.querySelector('.lp-screen #s23-left .dl-nav-item.active');
  const grp = active ? active.closest('.dl-nav-group') : null;
  /* Deterministic reveal: set the open group's sub-menu height directly so the
     sub-items are never clipped (don't depend on the CSS max-height transition). */
  document.querySelectorAll('.lp-screen #s23-left .dl-nav-group').forEach(g => {
    const on = g === grp;
    g.classList.toggle('expanded', on);
    const sub = g.querySelector('.dl-nav-sub');
    if(sub) sub.style.maxHeight = on ? '320px' : '';
  });
}

function showDetail(key){
  details.forEach(dd => dd.classList.toggle('active', dd.getAttribute('data-detail') === key));
  features.forEach(f => f.classList.toggle('active', f.getAttribute('data-detail') === key));
  setActiveNav(DETAIL_NAV[key] || 'dashboard');
  openDetail = key;
}
function closeDetail(){
  details.forEach(dd => dd.classList.remove('active'));
  features.forEach(f => f.classList.remove('active'));
  setActiveNav('dashboard');
  openDetail = null;
}
features.forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.getAttribute('data-detail');
    if(openDetail === key) closeDetail();
    else showDetail(key);
  });
});
document.querySelectorAll('.lp-detail-close').forEach(b => b.addEventListener('click', closeDetail));
