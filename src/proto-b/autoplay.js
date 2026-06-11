import { lenis, isMobile } from './proto-setup.js';

/* ══════════════════════════════════════════════════════════════
   autoplay.js — Scene-5 preview sequencer (Prototype B).
   Identical orchestration to Prototype A: auto-plays s5a→s5b→s5c with
   smooth scroll-locked transitions, holds on 5c, then releases. Exposes
   window.startProtoAutoplay() for the Replay button. Mobile = free scroll,
   each beat plays on enter.
══════════════════════════════════════════════════════════════ */
(function () {
  var SPEED_5A = 0.085, SPEED_5B = 0.075, SPEED_5C = 0.045, HOLD_5C_MS = 3800;
  var running = false, mobileArmed = false;

  function playWith(tl, speed) {
    return new Promise(function (resolve) {
      if (!tl) { resolve(); return; }
      tl.timeScale(speed);
      tl.eventCallback('onComplete', resolve);
      tl.restart(true);
    });
  }

  function smoothTo(id) {
    return new Promise(function (resolve) {
      var w = document.getElementById(id);
      if (!w) { resolve(); return; }
      var done = false;
      var finish = function () { if (done) return; done = true; try { ScrollTrigger.refresh(); } catch (e) {} resolve(); };
      try { lenis.scrollTo(w, { duration: 1.15, force: true, lock: true, onComplete: finish }); }
      catch (e) { try { window.scrollTo(0, w.getBoundingClientRect().top + window.scrollY); } catch (e2) {} finish(); }
      setTimeout(finish, 1500);
    });
  }

  function resetTimelines() {
    var tls = window.__s5Timelines || {};
    ['s5a', 's5b', 's5c'].forEach(function (k) { if (tls[k]) tls[k].pause(0); });
  }

  function armMobile() {
    if (mobileArmed) return; mobileArmed = true;
    var tls = window.__s5Timelines || {};
    window.__scrollLocked = false;
    try { lenis.start(); } catch (e) {}
    [['s5a-wrapper', tls.s5a, 0.12], ['s5b-wrapper', tls.s5b, 0.11], ['s5c-wrapper', tls.s5c, 0.09]].forEach(function (cfg) {
      var el = document.getElementById(cfg[0]);
      if (!el || !cfg[1]) return;
      ScrollTrigger.create({ trigger: el, start: 'top 78%', onEnter: (function (tl, ts) { return function () { tl.timeScale(ts).play(0); }; })(cfg[1], cfg[2]) });
    });
    try { ScrollTrigger.refresh(); } catch (e) {}
  }

  window.startProtoAutoplay = function () {
    if (running) return;
    if (isMobile()) {
      try { lenis.scrollTo(0, { immediate: true }); } catch (e) { window.scrollTo(0, 0); }
      resetTimelines(); armMobile(); return;
    }
    running = true; window.__scrollLocked = true;
    resetTimelines();
    try { lenis.stop(); } catch (e) {}
    try { ScrollTrigger.refresh(); } catch (e) {}
    smoothTo('s5a-wrapper')
      .then(function () { return playWith(window.__s5Timelines.s5a, SPEED_5A); })
      .then(function () { return smoothTo('s5b-wrapper'); })
      .then(function () { return playWith(window.__s5Timelines.s5b, SPEED_5B); })
      .then(function () { return smoothTo('s5c-wrapper'); })
      .then(function () { return playWith(window.__s5Timelines.s5c, SPEED_5C); })
      .then(function () { return new Promise(function (r) { setTimeout(r, HOLD_5C_MS); }); })
      .then(function () { window.__scrollLocked = false; try { lenis.start(); } catch (e) {} running = false; });
  };

  window.addEventListener('load', function () {
    setTimeout(function () { try { ScrollTrigger.refresh(); } catch (e) {} window.startProtoAutoplay(); }, 450);
  });
})();
