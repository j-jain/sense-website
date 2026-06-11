import { isMobile } from './proto-setup.js';

/* ══════════════════════════════════════════════════════════════
   autoplay.js — single-scene preview sequencer (Scene 5C).
   Slower timeScale so the text-first reveal reads before the UI loads.
══════════════════════════════════════════════════════════════ */
(function () {
  var SPEED_5C = 0.06;
  var running = false;

  function playWith(tl, speed) {
    return new Promise(function (resolve) {
      if (!tl) { resolve(); return; }
      tl.timeScale(speed);
      tl.eventCallback('onComplete', resolve);
      tl.restart(true);
    });
  }

  window.startProtoAutoplay = function () {
    if (running) return;
    running = true;
    var tl = (window.__s5Timelines || {}).s5c;
    playWith(tl, isMobile() ? 0.08 : SPEED_5C).then(function () { running = false; });
  };

  window.addEventListener('load', function () {
    setTimeout(function () {
      try { ScrollTrigger.refresh(); } catch (e) {}
      window.startProtoAutoplay();
    }, 450);
  });
})();
