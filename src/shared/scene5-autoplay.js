import { lenis, lockScroll, unlockScroll, disarmAnchor } from './setup.js';

/* ════════════════════════════════════════════
   SCENE 5 SEQUENCER  (sideways — no blackouts)
   Plays 5A → 5B → 5C as ONE flow. The three scenes sit side-by-side on a
   horizontal track (#s5-track) inside a pinned-feel stage (#s5-stage). Each
   beat's timeline plays, then the camera PANS the track horizontally to the
   next scene (a GSAP transform — no scroll engine needed; the timelines are
   time-based). Scroll stays locked across the sequence; after 5C it releases
   into Scene 8 with a normal vertical scroll.
   Mobile: the track is a vertical column — unlocked, each beat plays on enter.
════════════════════════════════════════════ */
(function(){
  /* Speed dials — keep total runtime ~36s. timeScale dilates time. */
  var SPEED_5A = 0.085;
  var SPEED_5B = 0.075;
  var SPEED_5C = 0.08;   /* was 0.045 — 5c loaded too slowly; ~halves the load time */
  var HOLD_5C_MS = 3500;
  var PAN_DUR = 0.9;   /* seconds for each sideways camera move */

  function playWith(tl, speed){
    return new Promise(function(resolve){
      if(!tl){ resolve(); return; }
      tl.timeScale(speed);
      tl.eventCallback('onComplete', resolve);
      tl.restart(true);
    });
  }

  /* Smooth vertical scroll to a beat (entry to the stage / exit to Scene 8).
     force:true lets it animate even while scroll is locked. */
  function smoothTo(id){
    return new Promise(function(resolve){
      var w = document.getElementById(id);
      if(!w){ resolve(); return; }
      var done = false;
      var finish = function(){ if(done) return; done = true; try{ ScrollTrigger.refresh(); }catch(e){} resolve(); };
      try{
        lenis.scrollTo(w, { duration: 1.15, force: true, lock: true, onComplete: finish });
      }catch(e){
        try{ window.scrollTo(0, w.getBoundingClientRect().top + window.scrollY); }catch(e2){}
        finish();
      }
      setTimeout(finish, 1500); /* safety net */
    });
  }

  /* Sideways camera pan: slide the track so panel `i` (0,1,2) fills the stage. */
  function panTo(i){
    return new Promise(function(resolve){
      var track = document.getElementById('s5-track');
      if(!track || !window.gsap){ resolve(); return; }
      var done = false;
      var finish = function(){ if(done) return; done = true; resolve(); };
      window.gsap.to(track, { xPercent: -33.3333 * i, duration: PAN_DUR, ease: 'power2.inOut', onComplete: finish });
      setTimeout(finish, (PAN_DUR * 1000) + 400); /* safety net */
    });
  }

  /* End-of-cinematic: unfold the horizontal track into a vertical column so the
     user can scroll back UP through 5A/5B/5C. Done synchronously while the view
     is on 5C — add the class, drop the pan transform, then snap scroll to the
     5C panel in the SAME frame so the layout grows beneath us without flashing
     5A. (Stage 100vh→~300vh; 5C is the bottom panel, flush above Scene 8.) */
  function unfoldStack(){
    var stage = document.getElementById('s5-stage');
    var track = document.getElementById('s5-track');
    var last  = document.getElementById('s5c-wrapper');
    if(!stage || !track) return;
    if(window.gsap) window.gsap.set(track, { clearProps: 'transform' }); /* remove xPercent */
    stage.classList.add('s5-stacked');                                   /* reflow to column */
    if(last){
      /* forced reflow: rect now reflects the stacked geometry */
      var y = last.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, y);                                  /* native snap — paints on 5C */
      try{ lenis.scrollTo(last, { immediate: true, force: true }); }catch(e){} /* sync Lenis */
    }
    try{ ScrollTrigger.refresh(); }catch(e){}
  }

  window.startScene5Autoplay = function(){
    var tls = window.__s5Timelines || {};

    /* ── MOBILE: vertical column, no locked autoplay — play each beat on enter ── */
    if(window.matchMedia('(max-width:768px)').matches){
      unlockScroll();
      [['s5a-wrapper', tls.s5a, 0.12],
       ['s5b-wrapper', tls.s5b, 0.11],
       ['s5c-wrapper', tls.s5c, 0.09]].forEach(function(cfg){
        var el = document.getElementById(cfg[0]);
        if(!el || !cfg[1]) return;
        ScrollTrigger.create({
          trigger: el, start: 'top 78%', once: true,
          onEnter: (function(tl, ts){ return function(){ tl.timeScale(ts).play(0); }; })(cfg[1], cfg[2])
        });
      });
      ScrollTrigger.refresh();
      return;
    }

    /* ── DESKTOP: scroll-locked; beat-to-beat moves are sideways camera pans ── */
    /* lockScroll() raises __scrollLocked AND arms the anchor at the current Y
       (proto-laptop has already jumped us to #s5-stage). The mid-sequence camera
       pans are xPercent transforms on #s5-track — scroll never legitimately moves,
       so a fixed anchor pins the page for the whole sequence (incl. scrollbar-drag). */
    lockScroll();
    if(window.gsap){ var t = document.getElementById('s5-track'); if(t) window.gsap.set(t, { xPercent: 0 }); }

    smoothTo('s5-stage')
      .then(function(){ return playWith(tls.s5a, SPEED_5A); })
      .then(function(){ return panTo(1); })
      .then(function(){ return playWith(tls.s5b, SPEED_5B); })
      .then(function(){ return panTo(2); })
      .then(function(){ return playWith(tls.s5c, SPEED_5C); })
      .then(function(){ return new Promise(function(r){ setTimeout(r, HOLD_5C_MS); }); })
      .then(function(){
        /* unfoldStack + smoothTo move scroll on purpose — disarm the anchor so they
           aren't snapped back, but keep __scrollLocked so wheel/key stay blocked. */
        disarmAnchor();
        unfoldStack();   /* horizontal track → vertical column, view held on 5C */
      })
      .then(function(){ return smoothTo('sc8-root'); })
      .then(function(){
        /* Release the user into Scene 8 */
        unlockScroll();
      });
  };
})();
