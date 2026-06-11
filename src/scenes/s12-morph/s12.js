import { lenis, isMobile } from '../../shared/setup.js';

/* ════════════════════════════════════════════════════════════════════════
   S12 — forma→phone morph opening (scroll-scrubbed). Ported from the
   standalone morph-prototype. Replaces old S1 + S2. Uses the global
   window.gsap / window.ScrollTrigger and the shared Lenis from setup.js.
   Ends with the phone centered at Screen D (280×580) so proto-laptop's
   identical #phone occludes it seamlessly into the laptop morph.
═══════════════════════════════════════════════════════════════════════════ */
(function () {
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !document.getElementById('proto')) return;   /* scene not on the page */

  var GREEN = '#3DA84A';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ── letter-reveal split ── */
  function splitText(el) {
    if (!el || el.dataset.trSplit === '1') return el ? $$('.tr-ch', el) : [];
    var lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = '';
    lines.forEach(function (line, li) {
      if (li > 0) el.appendChild(document.createElement('br'));
      var text = line.replace(/<[^>]*>/g, '');
      text.split(/(\s+)/).forEach(function (word) {
        if (/^\s+$/.test(word)) { el.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span'); w.className = 'tr-word';
        for (var i = 0; i < word.length; i++) {
          var m = document.createElement('span'); m.className = 'tr-mask';
          var c = document.createElement('span'); c.className = 'tr-ch'; c.textContent = word[i];
          m.appendChild(c); w.appendChild(m);
        }
        el.appendChild(w);
      });
    });
    el.dataset.trSplit = '1';
    return $$('.tr-ch', el);
  }
  function revealText(el, o) {
    o = o || {}; var c = splitText(el); el.style.opacity = '1';
    gsap.set(c, { yPercent: 110, opacity: 0 });
    return gsap.to(c, { yPercent: 0, opacity: 1, duration: o.duration || 0.7, ease: o.ease || 'power3.out', delay: o.delay || 0, stagger: o.stagger || 0.018 });
  }
  function prepText(el) { var c = splitText(el); gsap.set(c, { yPercent: 110, opacity: 0 }); el.style.opacity = '1'; return c; }

  /* ── refs ── */
  var boot = $('#proto-boot'), intro = $('#proto-intro'), eyebrow = $('#proto-eyebrow'),
      headline = $('#proto-headline'), morph = $('#proto-morph'),
      frame = $('#proto-frame'), cuboid = $('#proto-cuboid'), bgVideo = $('#proto-bg-video'),
      frameVideo = $('#proto-video'), statusbar = $('#proto-statusbar'), screens = $('#proto-screens'),
      sceneHeading = $('#proto-scene-heading'), headlineLeft = $('#proto-headline-left'),
      statusItems = $$('#proto-status li');

  /* Forma footprint stays responsive; the END phone is FIXED 280×580 so it
     lines up exactly with proto-laptop's #phone for the hand-off occlusion. */
  function sizes() {
    var vw = window.innerWidth || document.documentElement.clientWidth || 1280;
    var vh = window.innerHeight || document.documentElement.clientHeight || 720;
    var FW = Math.min(0.97 * vw, 0.96 * vh * (1440 / 675));   /* matches live Scene 1 .s1-cinema */
    var FH = FW * 675 / 1440;
    var PW = 280, PH = 580;                                    /* fixed → matches proto-laptop PHONE */
    return { FW: FW, FH: FH, PW: PW, PH: PH };
  }

  /* ── true shape morph (per-frame SVG path interpolation; no MorphSVG) ── */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, x) { var t = (x - a) / (b - a); return t < 0 ? 0 : t > 1 ? 1 : t; }

  var formaSvg = $('.proto-forma-svg'), formaFO = $('#protoFO'),
      clipPathEl = $('#formaClipPath'), strokeEl = $('#formaStrokePath'),
      frameWash = $('#proto-frame-wash');
  var lastMorphP = 0;

  function buildFormaPath(W, H, p) {
    var ix = 16 * (W / 1440);
    var iy = 16 * (H / 675);
    var r = lerp(40 * (W / 1440), 44, p);
    r = Math.min(r, W / 2 - ix - 1, H / 2 - iy - 1);

    var cx = W / 2;
    var halfSpan = 150 * (W / 1440);
    var halfCtrl = 100 * (W / 1440);
    var sX = cx - halfSpan, c1X = cx - halfCtrl, c2X = cx + halfCtrl, eX = cx + halfSpan;
    var dip = lerp(86 * (H / 675), 0, p);

    var L = ix, R = W - ix, T = iy, B = H - iy;
    var dT = T + dip, dB = B - dip;

    return 'M ' + (L + r) + ' ' + T +
           ' L ' + sX + ' ' + T +
           ' C ' + c1X + ' ' + T + ' ' + c1X + ' ' + dT + ' ' + cx + ' ' + dT +
           ' C ' + c2X + ' ' + dT + ' ' + c2X + ' ' + T + ' ' + eX + ' ' + T +
           ' L ' + (R - r) + ' ' + T +
           ' A ' + r + ' ' + r + ' 0 0 1 ' + R + ' ' + (T + r) +
           ' L ' + R + ' ' + (B - r) +
           ' A ' + r + ' ' + r + ' 0 0 1 ' + (R - r) + ' ' + B +
           ' L ' + eX + ' ' + B +
           ' C ' + c2X + ' ' + B + ' ' + c2X + ' ' + dB + ' ' + cx + ' ' + dB +
           ' C ' + c1X + ' ' + dB + ' ' + c1X + ' ' + B + ' ' + sX + ' ' + B +
           ' L ' + (L + r) + ' ' + B +
           ' A ' + r + ' ' + r + ' 0 0 1 ' + L + ' ' + (B - r) +
           ' L ' + L + ' ' + (T + r) +
           ' A ' + r + ' ' + r + ' 0 0 1 ' + (L + r) + ' ' + T +
           ' Z';
  }

  function applyMorph(p) {
    lastMorphP = p;
    var s = sizes();
    var W = lerp(s.FW, s.PW, p), H = lerp(s.FH, s.PH, p);
    morph.style.width = W + 'px';
    morph.style.height = H + 'px';
    if (formaSvg) formaSvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    if (formaFO) { formaFO.setAttribute('width', W); formaFO.setAttribute('height', H); }
    var d = buildFormaPath(W, H, p);
    if (clipPathEl) clipPathEl.setAttribute('d', d);
    if (strokeEl) { strokeEl.setAttribute('d', d); strokeEl.style.opacity = String(1 - smooth(0.6, 1, p)); }
    if (frameWash) frameWash.style.opacity = String(smooth(0.5, 1, p));
  }

  /* extruded brushed-metal rail between the front glass screen and black-glass back */
  function buildPhoneSlices() {
    if (!cuboid || cuboid.querySelector('.cz-slice')) return;
    var thick = parseFloat(getComputedStyle(cuboid).getPropertyValue('--thick')) || 26;
    var N = 20, frag = document.createDocumentFragment();
    for (var i = 0; i < N; i++) {
      var z = thick / 2 - (i + 1) * (thick / (N + 1));
      var s = document.createElement('div');
      s.className = 'cz-slice';
      s.style.transform = 'translateZ(' + z.toFixed(2) + 'px) scale(0.985)';
      frag.appendChild(s);
    }
    cuboid.appendChild(frag);
  }

  /* ── scroll lock via the shared Lenis (mirrors the old s1.js handoff) ── */
  function lockScroll() { window.__scrollLocked = true; try { lenis.stop(); } catch (e) {} }
  function unlockScroll() { window.__scrollLocked = false; try { lenis.start(); } catch (e) {} }

  /* ── reveal the hero copy (eyebrow + headline). instant=true skips the drop-in. ── */
  function revealHeroText(instant) {
    eyebrow.style.opacity = '1';
    headline.style.opacity = '1';
    if (instant) {
      var ec = splitText(eyebrow), hc = splitText(headline);
      gsap.set(ec.concat(hc), { yPercent: 0, opacity: 1 });
    } else {
      revealText(eyebrow, { stagger: 0.022, duration: 0.7 });
      revealText(headline, { stagger: 0.03, duration: 0.95, delay: 0.15 });
    }
  }
  function enableScroll() {
    unlockScroll();
    if (isMobile()) master.play();   /* mobile: no scrub → auto-play the sequence */
  }

  /* ── master timeline (scrubbed by ScrollTrigger on desktop) ── */
  var headlineChars = prepText(headlineLeft);

  function applyFrameSize() {
    var s = sizes();
    if (cuboid) { cuboid.style.setProperty('--pw', s.PW + 'px'); cuboid.style.setProperty('--ph', s.PH + 'px'); }
  }
  morph.style.aspectRatio = 'auto';
  /* start collapsed to a center sliver so the frame opens & expands sideways (scaleX 0→1) */
  gsap.set(morph, { rotateY: 0, scaleX: 0, transformOrigin: '50% 50%' });
  applyFrameSize();
  applyMorph(0);                                   /* forma shape at rest */
  gsap.set('#proto-bg', { opacity: 0 });
  gsap.set('#proto-frost', { scale: 0.6, opacity: 0 });
  gsap.set('#proto-glow', { scale: 0.5, opacity: 0 });
  buildPhoneSlices();
  gsap.set(cuboid, { opacity: 0 });
  gsap.set(screens, { xPercent: 0 });
  gsap.set(statusItems, { opacity: 0, x: 18 });
  gsap.set('#proto-status .ps-tick', { opacity: 0, scale: 0.4 });
  gsap.set('#proto-status .ps-green', { clipPath: 'inset(100% 0 0 0)' });
  gsap.set('#s2a-wash', { opacity: 1 });

  var master = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
  window.__master = master;

  /* ── A. RESHAPE — forma outline → phone screen, NO tilt ── */
  master.to({}, { duration: 0.4 });                                                         // brief hold
  master.to(intro, { opacity: 0, duration: 0.6, ease: 'power1.in' }, 0.4);
  master.to('#proto-bg', { opacity: 1, duration: 1.8, ease: 'power1.out' }, 0.4);
  var morphP = { p: 0 };
  master.to(morphP, { p: 1, duration: 2.0, ease: 'power2.inOut',
    onUpdate: function () { applyMorph(morphP.p); } }, 0.5);
  master.to('#proto-glow', { scale: 1.05, opacity: 1, duration: 1.9, ease: 'power2.out' }, 0.6);
  master.to('#proto-frost', { scale: 1, opacity: 0.6, duration: 1.7, ease: 'power2.out' }, 1.0);
  /* seamless hand-off: morphed forma → the 3D phone cuboid (same footprint) */
  master.to(cuboid, { opacity: 1, duration: 0.35, ease: 'power1.inOut' }, 2.3);
  master.to(frame, { opacity: 0, duration: 0.4, ease: 'power1.inOut' }, 2.35);
  /* white+red wash crossfades to the live dark splash mid-spin (hidden by the turn) */
  master.to('#s2a-wash', { opacity: 0, duration: 0.8, ease: 'power1.inOut' }, 3.0);
  master.add(function () { statusbar.classList.add('on-dark'); }, 3.4);

  /* ── B. ONE slow 360° roll — shows black-glass back + metal rail ── */
  master.to(morph, { rotateY: 360, duration: 1.9, ease: 'power1.inOut' }, 2.7);
  master.to('#proto-glow', { scale: 1.12, duration: 1.0, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 2.9);
  master.to(sceneHeading, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 3.0);
  master.to(headlineChars, { yPercent: 0, opacity: 1, stagger: 0.026, duration: 0.9, ease: 'power3.out' }, 3.2);
  master.to(statusItems, { opacity: 1, x: 0, stagger: 0.09, duration: 0.45, ease: 'power3.out' }, 3.6);

  /* ── C. Welcome (screen 0) ── */
  master.to('.s2a-logo', { opacity: 1, scale: 1, duration: 0.5 }, 4.6);
  master.to('.s2a-greeting', { opacity: 1, y: 0, duration: 0.4 }, 4.8);
  master.to('.s2a-tagline', { opacity: 0.7, y: 0, duration: 0.4 }, 5.0);
  master.to('.s2a-loader', { opacity: 1, duration: 0.3 }, 5.2);
  master.to('#s2a-loader-bar', { width: '100%', duration: 0.7 }, 5.2);

  /* ── D. Trip (screen 1) ── */
  master.to(screens, { xPercent: -25, duration: 0.55 }, 5.7);
  master.add(function () { statusbar.classList.remove('on-dark'); }, 5.9);
  master.to('#s2-screenB .s2b-vehicle-text', { opacity: 1, y: 0, duration: 0.32 }, 5.9);
  master.fromTo('#s2-screenB .s2b-time-badge', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.32 }, 6.0);
  master.to('#s2-screenB .s2b-route-label', { opacity: 1, y: 0, stagger: 0.08, duration: 0.3 }, 6.1);
  master.fromTo('#s2-screenB .s2b-stat-chip', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, stagger: 0.06, duration: 0.3 }, 6.25);
  master.to('#s2-screenB .s2b-startbtn', { opacity: 1, scale: 1, duration: 0.35 }, 6.4);

  /* ── E. DVIR (screen 2) — long beat: donut + checklist fill green ── */
  master.to(screens, { xPercent: -50, duration: 0.6 }, 6.9);
  master.fromTo('.s2c-donut-fill', { strokeDashoffset: 251 }, { strokeDashoffset: 0, duration: 4.8, ease: 'power1.inOut' }, 7.3);
  var ctr = { v: 0 };
  master.to(ctr, { v: 6, duration: 4.8, ease: 'power1.inOut', onUpdate: function () { var n = $('.s2c-donut-num'); if (n) n.textContent = Math.round(ctr.v) + '/6'; } }, 7.3);
  master.fromTo('#s2-screenC .s2c-check-item', { opacity: 0, y: 6 }, { opacity: 1, y: 0, stagger: 0.22, duration: 0.45 }, 7.4);
  /* right-side checklist: green fills UP inside each word, TOP→BOTTOM; tick pops per word */
  [0, 1, 2, 3, 4].forEach(function (i) {
    var li = statusItems[i];
    var t0 = 7.5 + i * 0.9;
    master.fromTo($('.ps-green', li), { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.55, ease: 'power1.inOut' }, t0);
    master.to($('.ps-tick', li), { opacity: 1, scale: 1, duration: 0.32, ease: 'back.out(2)' }, t0 + 0.45);
  });
  master.to('#s2-screenC .s2c-submit', { opacity: 1, scale: 1, duration: 0.4 }, 12.2);

  /* ── F. Live (screen 3) — ends centered at Screen D for the proto-laptop hand-off ── */
  master.to(screens, { xPercent: -75, duration: 0.55 }, 12.8);
  master.add(function () { statusbar.classList.add('on-dark'); }, 13.0);
  master.to('#s2-screenD .s2d-anim-item', { opacity: 1, y: 0, stagger: 0.06, duration: 0.26 }, 13.0);
  master.fromTo('#s2d-trip-badge', { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.4 }, 13.4);
  master.to({}, { duration: 0.6 }, 13.8);

  if (!isMobile()) {
    ScrollTrigger.create({
      trigger: '#proto-scroll', start: 'top top', end: 'bottom bottom',
      pin: '#proto', scrub: 1, anticipatePin: 1, animation: master, invalidateOnRefresh: true,
      onRefreshInit: function () { applyFrameSize(); applyMorph(lastMorphP); }
    });
    window.addEventListener('resize', function () { applyFrameSize(); applyMorph(lastMorphP); ScrollTrigger.refresh(); });
    window.addEventListener('load', function () { applyFrameSize(); applyMorph(lastMorphP); ScrollTrigger.refresh(); });
  }

  /* ════ INTRO — terminal boot → frame opens & expands sideways → hero text ════
     A separate autoplay timeline that runs while scroll is locked, then hands off to
     the scrubbed master from the exact state master expects at t=0 (morph opacity 1,
     scaleX 1, forma full size, videos playing, hero text shown). master is untouched. */
  var bootLines  = ['#bl-1', '#bl-2', '#bl-3', '#bl-4', '#bl-5', '#bl-6'];
  var lineDelays = [0.30, 0.35, 0.40, 0.30, 0.25, 0.45];   /* original s1 boot cadence */
  var EXPAND = 1.0;                                          /* frame open/expand duration */

  function playVideos() {
    if (frameVideo) frameVideo.play().catch(function () {});
    if (bgVideo) bgVideo.play().catch(function () {});
  }

  /* reduced-motion / hidden-tab fast path: jump straight to master's t=0 state */
  function showHeroInstant() {
    if (boot) boot.style.display = 'none';
    playVideos();
    gsap.set(morph, { opacity: 1, scaleX: 1 });
    revealHeroText(true);
  }

  function buildIntro() {
    var tl = gsap.timeline({ paused: true, onComplete: enableScroll });
    /* Phase A — terminal boot, line by line */
    if (boot) gsap.set(boot, { display: 'flex', opacity: 1 });
    gsap.set(bootLines, { opacity: 0 });
    bootLines.forEach(function (sel, i) {
      tl.to(sel, { opacity: 1, duration: 0, delay: lineDelays[i] });
    });
    tl.to({}, { duration: 0.6 });                            /* hold on SYSTEM READY */
    /* Phase B — boot fades out while the frame opens from a center sliver and
       expands sideways (scaleX 0→1); both begin together for a crossfade */
    var openAt = tl.duration();
    if (boot) tl.to(boot, { opacity: 0, duration: 0.5, ease: 'power2.in',
      onComplete: function () { boot.style.display = 'none'; } }, openAt);
    tl.set(morph, { opacity: 1 }, openAt);
    /* video kicks in once the frame is ~30% expanded (by width, not by time) */
    var videoFired = false;
    tl.to(morph, { scaleX: 1, duration: EXPAND, ease: 'power3.out',
      onUpdate: function () {
        if (!videoFired && gsap.getProperty(morph, 'scaleX') >= 0.30) { videoFired = true; playVideos(); }
      } }, openAt);
    /* Phase C — hero text drops in after full expansion */
    tl.add(function () { revealHeroText(false); }, openAt + EXPAND);
    tl.to({}, { duration: 1.0 }, openAt + EXPAND);           /* let the reveal breathe before unlock */
    return tl;
  }

  /* kick off: desktop locks scroll through the intro, then releases to scrub.
     A timer-based (rAF-independent) fallback longer than the whole intro guarantees the
     page can NEVER stay scroll-locked — and can't unlock mid-intro and fight the scrub. */
  if (!isMobile()) lockScroll();
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(enableScroll, 7000);
  if (document.hidden || REDUCED) {
    /* GSAP timelines stall on a hidden tab — skip the intro, show the hero immediately */
    try { showHeroInstant(); } catch (e) {}
    enableScroll();
  } else {
    try { buildIntro().play(); }
    catch (e) { try { showHeroInstant(); } catch (e2) {} enableScroll(); }
  }
})();
