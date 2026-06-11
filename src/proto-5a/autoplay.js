import { isMobile } from './proto-setup.js';

/* ══════════════════════════════════════════════════════════════
   autoplay.js — single-scene preview sequencer (Scene 5A).
   The live Scene-5 sequencer chains 5a→5b→5c with smooth scrolls; here
   there's only ONE beat, so we simply play its paused timeline at a
   cinematic timeScale and re-fire on Replay. The sideways grammar lives
   INSIDE the scene (the stage pans left toward the "Service Network →"
   teaser as its final beat) — no cross-scene scroll needed.
══════════════════════════════════════════════════════════════ */
(function () {
  var SPEED_5A = 0.085;   /* timeScale — smaller = slower, more cinematic */
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
    var tl = (window.__s5Timelines || {}).s5a;
    /* Mobile plays a touch faster so the beat doesn't drag on a small screen. */
    playWith(tl, isMobile() ? 0.11 : SPEED_5A).then(function () { running = false; });
  };

  /* Auto-start once everything has painted + pins are measured. */
  window.addEventListener('load', function () {
    setTimeout(function () {
      try { ScrollTrigger.refresh(); } catch (e) {}
      window.startProtoAutoplay();
    }, 450);
  });
})();
