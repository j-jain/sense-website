import { lenis } from '../../shared/setup.js';

/* ════════════════════════════════════════════
   S23 — PIN + HOLD + S4 TEMPERATURE CLIMB
   Dashboard expand-from-map is handled by S2's scroll handler.
   Pins S23 and drives Scene 3 overlays + Scene 4 temperature logic.
════════════════════════════════════════════ */
(function(){
  var wrapper = document.getElementById('s23-wrapper');
  wrapper.style.height = '280vh'; /* S3 overlays + S4 temperature climb; trimmed from 400vh */

  /* S4 elements */
  var s4RedOverlay = document.getElementById('s4-red-overlay');
  var s4Textbox    = document.getElementById('s4-textbox');
  var coolantCard  = document.getElementById('coolant-card');
  var coolantVal   = document.getElementById('coolant-val');
  var coolantSub   = document.getElementById('coolant-sub');
  var edgeFill     = document.getElementById('edge-fill');

  /* Find the truck dot in the vehicle list (first running marker) */
  var truckDots = document.querySelectorAll('#s23-trans .map-marker.running');
  var targetTruckDot = truckDots.length > 0 ? truckDots[0] : null;

  /* S3 overlay elements */
  var ov1 = document.getElementById('ov1');
  var ov2 = document.getElementById('ov2');
  var ov3 = document.getElementById('ov3');
  var ov4 = document.getElementById('ov4');
  var ov5 = document.getElementById('ov5');
  var gaugeArc = document.getElementById('gauge-arc');
  var gaugePct = document.getElementById('gauge-pct');
  var fuelBar  = document.getElementById('fuel-bar');
  var etaPath  = document.getElementById('eta-path');
  var s3Headline = document.getElementById('s3-headline');

  var s3OvsRevealed = false;
  var s4TextboxShown = false;
  /* Track which text stage is active: 0=none, 1="Small signals…", 2="Anomaly…", 3="The truck…" */
  var s4TextStage = 0;

  /* ── Headquarters View Point header — scroll-driven shrink ── */
  var hqHeader   = document.getElementById('s3-hq-header');
  var dashHeader = document.querySelector('#s23-trans .dash-header');
  /* Compute the small target position once dashboard is visible.
     Target = top-left of .dash-header h1, scaled down to a small label. */
  function getHqTarget(){
    var s23R = document.getElementById('s23-trans').getBoundingClientRect();
    var h1 = document.querySelector('#s23-trans .dash-view.active .dash-header h1');
    if(!h1) return {x: s23R.width * 0.5, y: 36, scale: 0.22};
    var hR = h1.getBoundingClientRect();
    return {x: hR.left - s23R.left + 80, y: hR.top - s23R.top + 12, scale: 0.22};
  }

  /* ── Map cursor parallax — small GSAP motion on dashboard map ── */
  var mapImgWrap = document.querySelector('#s23-trans .india-map-wrap');
  var mapArea    = document.querySelector('#s23-trans .dash-map-area');
  if(mapArea){
    mapArea.addEventListener('mousemove', function(e){
      if(s4TextboxShown) return; /* freeze during S4 drama */
      var r = mapArea.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top)  / r.height - 0.5;
      if(mapImgWrap){
        gsap.to(mapImgWrap, {x: nx * -10, y: ny * -6, duration: 1.0, ease: 'power2.out'});
      }
      gsap.to('#s23-trans .map-marker, #s23-trans .map-cluster',
        {x: nx * -14, y: ny * -8, duration: 1.0, ease: 'power2.out'});
    });
    mapArea.addEventListener('mouseleave', function(){
      if(mapImgWrap) gsap.to(mapImgWrap, {x:0, y:0, duration:.6, ease:'power2.out'});
      gsap.to('#s23-trans .map-marker, #s23-trans .map-cluster', {x:0, y:0, duration:.6, ease:'power2.out'});
    });
  }

  /* ── Left-nav click handlers — swap centre view ── */
  function setActiveView(viewName){
    var navItems = document.querySelectorAll('#s23-left .dl-nav-item');
    var views    = document.querySelectorAll('#s23-trans .dash-view');
    navItems.forEach(function(it){
      it.classList.toggle('active', it.getAttribute('data-view') === viewName);
    });
    var matched = false;
    views.forEach(function(v){
      var match = v.getAttribute('data-view') === viewName;
      v.classList.toggle('active', match);
      if(match) matched = true;
    });
    /* Fallback: if a sub-item view has no dedicated panel, show its parent's panel */
    if(!matched){
      var fallback = viewName.split('-')[0];
      views.forEach(function(v){
        v.classList.toggle('active', v.getAttribute('data-view') === fallback);
      });
    }
  }
  document.querySelectorAll('#s23-left .dl-nav-item').forEach(function(item){
    item.addEventListener('click', function(e){
      e.stopPropagation();
      var view = item.getAttribute('data-view');
      if(!view) return;
      if(s4TextboxShown && view !== 'dashboard') return;
      setActiveView(view);
      /* If this is a parent of a submenu, also toggle the submenu */
      if(item.classList.contains('dl-nav-parent')){
        var group = item.closest('.dl-nav-group');
        if(group) group.classList.toggle('expanded');
      }
    });
  });
  /* Arrow click expands without changing view */
  document.querySelectorAll('#s23-left .dl-nav-parent .dl-nav-arrow').forEach(function(arrow){
    arrow.addEventListener('click', function(e){
      e.stopPropagation();
      var group = arrow.closest('.dl-nav-group');
      if(group) group.classList.toggle('expanded');
    });
  });

  /* ── Dashboard view: silent interactivity for map controls ── */
  /* Map filter chips — toggle dim on matching markers */
  document.querySelectorAll('#s23-trans .map-filter-chip').forEach(function(chip){
    chip.addEventListener('click', function(e){
      e.stopPropagation();
      var status = ['running','idle','stopped','offline'].find(function(s){
        return chip.classList.contains(s);
      });
      if(!status) return;
      chip.classList.toggle('dim');
      var dimmed = chip.classList.contains('dim');
      document.querySelectorAll('#s23-trans .map-marker.' + status).forEach(function(m){
        m.style.opacity = dimmed ? '0.15' : '';
      });
    });
  });
  /* Map / Satellite toggle */
  document.querySelectorAll('#s23-trans .map-toggle-btn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      document.querySelectorAll('#s23-trans .map-toggle-btn').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });
  /* "Track" button — briefly pulse running markers */
  var trackBtn = document.querySelector('#s23-trans .fleet-track-btn');
  if(trackBtn){
    trackBtn.addEventListener('click', function(e){
      e.stopPropagation();
      var markers = document.querySelectorAll('#s23-trans .map-marker.running');
      markers.forEach(function(m){
        m.style.transition = 'transform .25s ease';
        m.style.transform = (m.style.transform || '') + ' scale(1.8)';
      });
      setTimeout(function(){
        markers.forEach(function(m){
          m.style.transform = m.style.transform.replace(' scale(1.8)', '');
        });
      }, 700);
    });
  }

  /* ── Build the activity heatmap inside Tracking view ── */
  (function buildHeatmap(){
    var grid = document.getElementById('dv-heatmap-tracking');
    var hours = document.getElementById('dv-heatmap-hours-tracking');
    if(!grid || !hours) return;
    var days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    /* Each row: label cell + 24 hour cells. Activity peaks 9-11 + 14-16. */
    var peakHours = function(h){
      var base = 0;
      if(h >= 9 && h <= 11) base = 4;
      else if(h >= 14 && h <= 16) base = 3;
      else if(h >= 6 && h <= 18) base = 2;
      else if(h >= 19 && h <= 21) base = 1;
      return base;
    };
    days.forEach(function(d, di){
      var label = document.createElement('span');
      label.className = 'dv-hm-day';
      label.textContent = d;
      grid.appendChild(label);
      for(var h = 0; h < 24; h++){
        var cell = document.createElement('span');
        var lvl = Math.max(0, peakHours(h) + (di < 5 ? 0 : -1) + (Math.random() < 0.3 ? 1 : 0));
        if(lvl > 5) lvl = 5;
        cell.className = 'dv-hm-cell' + (lvl > 0 ? ' l' + lvl : '');
        grid.appendChild(cell);
      }
    });
    /* Hour labels row */
    var blank = document.createElement('span'); hours.appendChild(blank);
    for(var h = 0; h < 24; h++){
      var hl = document.createElement('span');
      hl.textContent = (h % 6 === 0) ? (h === 0 ? '12a' : (h === 12 ? '12p' : (h > 12 ? (h-12)+'p' : h+'a'))) : '';
      hours.appendChild(hl);
    }
  })();

  /* S4 text messages */
  var S4_MSG1 = 'Small signals before major failures.';
  var S4_MSG2 = 'Anomaly Detected — Engine Thermal System';
  /* S4_MSG3 removed — replaced by countdown sequence at p≥0.88 */

  /* Helper: crossfade text in the S4 textbox */
  function setS4Text(msg){
    gsap.to(s4Textbox, {opacity:0, duration:.25, ease:'power2.in', onComplete:function(){
      s4Textbox.textContent = msg;
      gsap.to(s4Textbox, {opacity:1, duration:.35, ease:'power2.out'});
    }});
  }

  /* Set initial state for ov5 centering via GSAP (replaces inline style) */
  gsap.set(ov5, {xPercent:-50, y:12});

  ScrollTrigger.create({
    trigger: wrapper,
    start: 'top top',
    end: 'bottom bottom',
    pin: '#s23-trans',
    onUpdate: function(self){
      var p = self.progress;

      /* ═══ Headquarters View Point — centered → top-left shrink (p 0 → 0.12) ═══ */
      if(hqHeader){
        if(p < 0.50){
          /* Active phase */
          var tgt = getHqTarget();
          var s23R = document.getElementById('s23-trans').getBoundingClientRect();
          var startX = s23R.width  * 0.5;
          var startY = s23R.height * 0.5;
          var startScale = 1;
          var t = Math.min(1, p / 0.12); /* 0→1 across first 12% */
          var e = 1 - Math.pow(1 - t, 3); /* easeOutCubic */
          var x = startX + (tgt.x - startX) * e;
          var y = startY + (tgt.y - startY) * e;
          var s = startScale + (tgt.scale - startScale) * e;
          /* Fade color from off-white headline → muted dashboard label */
          var alpha = 1 - e * 0.4;        /* 1 → 0.6 */
          var muted = e;                  /* 0 → 1 — interpolate to grey */
          var r = Math.round(242 + (29  - 242) * muted);
          var g = Math.round(240 + (36  - 240) * muted);
          var b = Math.round(235 + (56  - 235) * muted);
          hqHeader.style.opacity = '1';
          hqHeader.style.color = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
          hqHeader.style.transform = 'translate(-50%,-50%) translate(' + (x - startX) + 'px,' + (y - startY) + 'px) scale(' + s + ')';
          hqHeader.style.textShadow = e > 0.5 ? 'none' : ('0 4px 32px rgba(0,0,0,' + (0.6 * (1 - e)) + ')');
          /* Hide native dash-header h1 once HQ header docks in its place */
          if(dashHeader){
            var h1 = dashHeader.querySelector('h1');
            if(h1) h1.style.opacity = String(1 - Math.min(1, t * 1.5));
          }
        } else {
          /* S4 phase — fade out HQ header (would conflict with red overlay) */
          hqHeader.style.opacity = String(Math.max(0, 1 - (p - 0.50) / 0.05));
        }
      }

      /* ═══ Helper: reveal all S3 overlays with stagger ═══ */
      function revealS3Overlays(){
        s3OvsRevealed = true;
        gsap.killTweensOf([ov1,ov2,ov3,ov4,ov5,gaugeArc,fuelBar,etaPath,s3Headline]);

        gsap.to(ov1, {opacity:1, y:0, duration:.35, ease:'power2.out'});
        gsap.to(gaugeArc, {strokeDashoffset:125.7 * 0.04, duration:.8, delay:.08, ease:'power2.out'});
        var ctr = {val:0};
        gsap.to(ctr, {val:96, duration:.8, delay:.08, ease:'power2.out',
          onUpdate:function(){ gaugePct.textContent = Math.round(ctr.val) + '%'; }});

        gsap.to(ov2, {opacity:1, y:0, duration:.35, delay:.08, ease:'power2.out'});
        gsap.to(fuelBar, {width:'84%', duration:.7, delay:.16, ease:'power2.out'});
        gsap.to(ov3, {opacity:1, y:0, duration:.35, delay:.16, ease:'power2.out'});
        gsap.to(ov4, {opacity:1, y:0, duration:.35, delay:.24, ease:'power2.out'});
        gsap.to(etaPath, {scaleX:1, duration:.7, delay:.32, ease:'power2.out'});
        gsap.to(ov5, {opacity:1, y:0, xPercent:-50, duration:.35, delay:.32, ease:'power2.out'});
        gsap.to(s3Headline, {opacity:1, duration:.35, delay:.4, ease:'power2.out'});
      }

      /* ═══ Helper: reset all S3 overlays to hidden state ═══ */
      function resetS3Overlays(){
        s3OvsRevealed = false;
        gsap.killTweensOf([ov1,ov2,ov3,ov4,ov5,gaugeArc,fuelBar,etaPath,s3Headline]);
        gsap.set([ov1,ov2,ov3,ov4], {opacity:0, y:12});
        gsap.set(ov5, {opacity:0, y:12, xPercent:-50});
        gsap.set(s3Headline, {opacity:0});
        gsap.set(gaugeArc, {strokeDashoffset:125.7});
        gsap.set(fuelBar, {width:'0%'});
        gsap.set(etaPath, {scaleX:0});
        if(gaugePct) gaugePct.textContent = '0%';
      }

      /* ═══ Progress 0–0.5: Scene 3 overlays ═══ */
      if(p < 0.5){
        if(p > 0.01 && !s3OvsRevealed){
          revealS3Overlays();
        }
        if(p <= 0.01 && s3OvsRevealed){
          resetS3Overlays();
        }
      }

      /* ═══ Progress 0.50: Transition from S3 → S4 ═══ */
      if(p >= 0.50 && !s4TextboxShown){
        s4TextboxShown = true;
        /* Fade out S3 headline and overlays */
        gsap.killTweensOf([ov1,ov2,ov3,ov4,ov5,s3Headline]);
        gsap.to(s3Headline, {opacity:0, duration:.4});
        gsap.to([ov1,ov2,ov3,ov4,ov5], {opacity:0, duration:.4});
        /* Show S4 textbox with first message */
        s4Textbox.textContent = S4_MSG1;
        s4TextStage = 1;
        gsap.to(s4Textbox, {opacity:1, duration:.6, delay:.2, ease:'power2.out'});
      }
      if(p < 0.48 && s4TextboxShown){
        s4TextboxShown = false;
        s4TextStage = 0;
        gsap.to(s4Textbox, {opacity:0, duration:.3});
        /* Reset red overlay */
        gsap.set(s4RedOverlay, {opacity:0});
        /* Re-reveal S3 overlays when scrolling back */
        s3OvsRevealed = false;
        revealS3Overlays();
      }

      /* ═══ Progress 0.55–0.85: Coolant temperature climb + red tint ═══ */
      if(p >= 0.55 && p <= 0.85){
        var tempP = (p - 0.55) / 0.30; /* 0→1 */
        var temp = 94 + tempP * 7; /* 94→101 */

        /* Update coolant display */
        if(coolantVal) coolantVal.textContent = Math.round(temp) + '°C';

        /* Color transitions: green → amber at 97 → red at 100 */
        var color;
        if(temp < 97){
          color = '#43A047';
          if(coolantCard) coolantCard.classList.remove('alert');
          if(coolantSub) coolantSub.textContent = 'Normal operating range: 88–95°C';
        } else if(temp < 100){
          color = '#F5A623';
          if(coolantCard){
            coolantCard.style.borderColor = 'var(--amber)';
            coolantCard.style.boxShadow = '0 0 8px rgba(245,166,35,.15)';
          }
          if(coolantSub) coolantSub.textContent = '⚠ Above normal — monitoring';
          if(targetTruckDot) targetTruckDot.style.background = '#F5A623';
        } else {
          color = '#D73030';
          if(coolantCard) coolantCard.classList.add('alert');
          if(coolantSub) coolantSub.textContent = '⚠ CRITICAL — Anomaly detected';
          if(targetTruckDot) targetTruckDot.style.background = '#F5A623';
        }
        if(coolantVal) coolantVal.style.color = color;

        /* Edge bar fill */
        if(edgeFill) edgeFill.style.height = (tempP * 100) + '%';

        /* ═══ Red screen overlay — ramps with temperature ═══ */
        /* Starts subtle at 97°C, intensifies to ~0.18 opacity at 101°C */
        var redIntensity = 0;
        if(temp >= 97){
          redIntensity = (temp - 97) / 4; /* 0→1 over 97→101 range */
          redIntensity = Math.min(redIntensity, 1);
        }
        var overlayAlpha = redIntensity * 0.18; /* max 18% red wash */
        s4RedOverlay.style.background = 'radial-gradient(ellipse at center, rgba(215,48,48,' + (overlayAlpha * 0.6) + ') 0%, rgba(140,20,20,' + overlayAlpha + ') 100%)';
        s4RedOverlay.style.opacity = redIntensity > 0 ? 1 : 0;

        /* ═══ Text stage 2: "Anomaly Detected" at 101°C ═══ */
        if(Math.round(temp) >= 101 && s4TextStage < 2){
          s4TextStage = 2;
          setS4Text(S4_MSG2);
          s4Textbox.classList.add('alert');
        }
        /* Scroll back: revert to stage 1 */
        if(Math.round(temp) < 101 && s4TextStage === 2){
          s4TextStage = 1;
          setS4Text(S4_MSG1);
          s4Textbox.classList.remove('alert');
        }
      }

      /* ═══ Progress 0.88: COUNTDOWN TRIGGER — locks scroll, auto-plays ═══ */
      if(p >= 0.88 && !window._countdownFired){
        window._countdownFired = true;
        runCountdownSequence();
      }

      /* ═══ Progress 0.95–1.0: Hold, scene ends ═══ */
    }
  });
})();

/* ════════════════════════════════════════════
   BLACKOUT BEAT — now auto-played, wrapper collapsed
════════════════════════════════════════════ */
(function(){
  var wrapper = document.getElementById('blackout-wrapper');
  wrapper.style.height = '0vh';
  wrapper.style.overflow = 'hidden';
})();

/* ════════════════════════════════════════════
   COUNTDOWN SEQUENCE (real-time, scroll-locked)
   Fires once when temp hits 101°C at p≥0.88
════════════════════════════════════════════ */
function runCountdownSequence(){
  var overlay    = document.getElementById('countdown-overlay');
  var cdProgress = document.getElementById('cd-progress');
  var cdNumeral  = document.getElementById('cd-numeral');
  var cdLog      = document.getElementById('cd-log');
  var cdScanline = document.getElementById('cd-scanline');
  var timerEl    = document.getElementById('running-timer');
  var s4Textbox  = document.getElementById('s4-textbox');

  /* Circumference of r=72 circle */
  var circumference = 2 * Math.PI * 72; /* ≈ 452.4 */

  /* 1. Lock scroll */
  lenis.stop();

  /* 2. Build the GSAP timeline — all real-time, not scroll-driven */
  var tl = gsap.timeline({
    onComplete: function(){
      /* When done: scroll to Scene 5A and kick off autoplay (lenis stays stopped) */
      var s5aWrapper = document.getElementById('s5a-wrapper');
      var s5aTop = s5aWrapper.getBoundingClientRect().top + window.scrollY;

      /* Use raw scrollTo while Lenis is stopped */
      window.scrollTo(0, s5aTop);

      /* Brief delay to let the browser settle, then start the Scene 5 autoplay chain */
      setTimeout(function(){
        ScrollTrigger.refresh();
        /* Fade out the overlay (it's now covering 5A which is just appearing) */
        gsap.to(overlay, {opacity:0, duration:0.3, onComplete: function(){
          overlay.style.display = 'none';
        }});
        if(typeof window.startScene5Autoplay === 'function'){
          window.startScene5Autoplay();
        } else {
          /* Fallback if sequencer didn't load — restore scroll so user isn't trapped */
          try{ lenis.start(); }catch(e){}
        }
      }, 300);
    }
  });

  /* ── Phase 1: Dim dashboard + show overlay (0.4s) ── */
  tl.to(overlay, {opacity:1, background:'rgba(0,0,0,0.94)', duration:0.4, ease:'power2.out'}, 0);
  tl.to(s4Textbox, {opacity:0, duration:0.3}, 0);
  /* Lift cd-log out of the flex flow so it lands at viewport-centre once the ring fades */
  tl.set(cdLog, {position:'absolute', top:'50%', left:'50%', xPercent:-50, yPercent:-50, margin:0, fontSize:'18px'}, 0);

  /* ── Phase 2: Countdown 3→2→1 with circle drawing in (3s) ── */
  /* Show numeral "3" */
  tl.set(cdNumeral, {textContent:'3', opacity:0, scale:1.3}, 0.5);
  tl.to(cdNumeral, {opacity:1, scale:1, duration:0.25, ease:'back.out(1.7)'}, 0.5);

  /* Circle draws from 0→33% over first second */
  tl.to(cdProgress, {strokeDashoffset: circumference * 0.667, duration:0.85, ease:'power1.inOut'}, 0.5);

  /* Numeral "2" */
  tl.to(cdNumeral, {opacity:0, scale:0.8, duration:0.15}, 1.35);
  tl.set(cdNumeral, {textContent:'2', scale:1.3}, 1.5);
  tl.to(cdNumeral, {opacity:1, scale:1, duration:0.25, ease:'back.out(1.7)'}, 1.5);

  /* Circle draws from 33→67% */
  tl.to(cdProgress, {strokeDashoffset: circumference * 0.333, duration:0.85, ease:'power1.inOut'}, 1.5);

  /* Numeral "1" */
  tl.to(cdNumeral, {opacity:0, scale:0.8, duration:0.15}, 2.35);
  tl.set(cdNumeral, {textContent:'1', scale:1.3}, 2.5);
  tl.to(cdNumeral, {opacity:1, scale:1, duration:0.25, ease:'back.out(1.7)'}, 2.5);

  /* Circle draws from 67→100% */
  tl.to(cdProgress, {strokeDashoffset: 0, duration:0.85, ease:'power1.inOut'}, 2.5);

  /* ── Phase 3: Circle + numeral flash and fade (0.3s) ── */
  tl.to(cdNumeral, {opacity:0, duration:0.2}, 3.4);
  tl.to('#countdown-ring', {opacity:0, scale:1.1, duration:0.3, ease:'power2.in'}, 3.4);

  /* ── Phase 4: "Initiating platform response..." (1s) ── */
  tl.to(cdLog, {opacity:1, duration:1, ease:'power2.out'}, 3.6);

  /* ── Phase 5: Full blackout — darken to 100% black (0.3s) ── */
  tl.to(overlay, {background:'rgba(0,0,0,1)', duration:0.3, ease:'power2.in'}, 4.8);
  tl.to(cdLog, {opacity:0, duration:0.2}, 4.8);

  /* ── Phase 6: Scanline sweep (1.5s) ── */
  tl.to(cdScanline, {opacity:1, duration:0.2}, 5.2);
  tl.fromTo(cdScanline, {top:'30%'}, {top:'70%', duration:1.2, ease:'power1.inOut'}, 5.2);
  tl.to(cdScanline, {opacity:0, duration:0.2}, 6.2);

  /* ── Phase 7: Running timer appears (0.4s) ── */
  tl.call(function(){ if(timerEl) timerEl.textContent = '00:00'; }, null, 5.9);
  tl.to(timerEl, {opacity:1, duration:0.4}, 6.0);

  /* ── Phase 8: Brief hold before releasing scroll (0.5s) ── */
  tl.to({}, {duration:0.5}, 6.5);
}
