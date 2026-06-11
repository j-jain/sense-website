import { isMobile } from './proto-setup.js';

/* ══════════════════════════════════════════════════════════════
   autoplay.js — single-scene preview sequencer (Scene 5B).
   Plays the paused timeline at a cinematic timeScale and re-fires on
   Replay. The route reroute + truck glide live inside the scene.
══════════════════════════════════════════════════════════════ */
(function () {
  var SPEED_5B = 0.08;    /* timeScale — smaller = slower, more cinematic */
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
    var tl = (window.__s5Timelines || {}).s5b;
    playWith(tl, isMobile() ? 0.1 : SPEED_5B).then(function () { running = false; });
  };

  window.addEventListener('load', function () {
    setTimeout(function () {
      try { ScrollTrigger.refresh(); } catch (e) {}
      window.startProtoAutoplay();
    }, 450);
  });
})();
