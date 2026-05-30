import { lenis } from './setup.js';

/* ════════════════════════════════════════════
   SCENE 5 AUTOPLAY SEQUENCER
   Plays 5A → 5B → 5C with brief blackouts between.
   Scroll stays locked the whole time so the user can't
   skip a beat. After 5C finishes, lenis resumes and
   the user is released into Scene 8.
════════════════════════════════════════════ */
(function(){
  /* Speed dials — keep total runtime ~36s.
     The native timelines are densely-packed; timeScale dilates time.
     Lower number = slower playback. */
  var SPEED_5A = 0.085;  /* native ~1s → real ~12s */
  var SPEED_5B = 0.075;  /* native ~1.05s → real ~14s */
  var SPEED_5C = 0.045;  /* native ~1.05s → real ~23s — clearly the longest beat */
  var HOLD_5C_MS = 3500; /* extra dwell on 5c's final frame before moving on */
  var BLACKOUT_MS = 500;

  function ensureBlackout(){
    var el = document.getElementById('s5-blackout');
    if(el) return el;
    el = document.createElement('div');
    el.id = 's5-blackout';
    el.style.cssText = 'position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:9500;transition:opacity .35s ease;';
    document.body.appendChild(el);
    return el;
  }

  function playWith(tl, speed){
    return new Promise(function(resolve){
      if(!tl){ resolve(); return; }
      tl.timeScale(speed);
      tl.eventCallback('onComplete', resolve);
      tl.restart(true);
    });
  }

  function scrollToWrapper(id){
    var w = document.getElementById(id);
    if(!w) return;
    var top = w.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top);
    ScrollTrigger.refresh();
  }

  function blackout(on){
    return new Promise(function(resolve){
      var el = ensureBlackout();
      el.style.opacity = on ? '1' : '0';
      setTimeout(resolve, BLACKOUT_MS);
    });
  }

  window.startScene5Autoplay = function(){
    /* Make sure scroll stays locked through the whole sequence */
    try{ lenis.stop(); }catch(e){}

    var tls = window.__s5Timelines || {};

    scrollToWrapper('s5a-wrapper');
    playWith(tls.s5a, SPEED_5A)
      .then(function(){ return blackout(true); })
      .then(function(){ scrollToWrapper('s5b-wrapper'); return blackout(false); })
      .then(function(){ return playWith(tls.s5b, SPEED_5B); })
      .then(function(){ return blackout(true); })
      .then(function(){ scrollToWrapper('s5c-wrapper'); return blackout(false); })
      .then(function(){ return playWith(tls.s5c, SPEED_5C); })
      .then(function(){ return new Promise(function(r){ setTimeout(r, HOLD_5C_MS); }); })
      .then(function(){ return blackout(true); })
      .then(function(){ scrollToWrapper('sc8-root'); return blackout(false); })
      .then(function(){
        /* User is now sitting at S8 — release scroll so they can read it */
        window.__scrollLocked = false;
        try{ lenis.start(); }catch(e){}
      });
  };
})();
