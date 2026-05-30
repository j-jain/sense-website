import { lenis, showSI, hideSI } from '../../shared/setup.js';

/* ════════════════════════════════════════════
   S2 — BEFORE THE FIRST KILOMETER
   Realistic 3D phone · button-driven flow
   Interior-designer walkthrough feel
════════════════════════════════════════════ */
(function(){
  var wrapper = document.getElementById('s2-wrapper');
  wrapper.style.height = '100vh'; /* Base — extended to 450vh once Screen D completes */

  var imgPanel     = document.getElementById('s2-img-panel');
  var cabImg       = document.getElementById('s2-cab-img');
  var darkOverlay  = document.getElementById('s2-dark-overlay');
  var phonePanel   = document.getElementById('s2-phone-panel');
  var phoneFrame   = document.getElementById('s2-phone-frame');
  var glow         = document.getElementById('s2-glow');
  var screens      = document.getElementById('s2-screens');
  var headline     = document.querySelector('.s2-headline');
  var featureList  = document.getElementById('s2-feature-list');
  var featItems    = document.querySelectorAll('.s2-feat');
  var sceneHeading = document.getElementById('s2-scene-heading');
  var startTripBtn = document.getElementById('s2-start-trip-btn');
  var statusBar    = document.getElementById('s2-statusbar');

  var s2Activated = false;
  var currentScreen = 0;
  var totalScreens = 4;
  var screenAnimated = [false, false, false, false];

  /* ── Mouse parallax — cab image + phone tilt ── */
  var s2El = document.getElementById('s2');
  var parallaxActive = false;

  s2El.addEventListener('mousemove', function(e){
    var rect = s2El.getBoundingClientRect();
    var mx = (e.clientX - rect.left) / rect.width;
    var my = (e.clientY - rect.top) / rect.height;
    var cx = mx - 0.5;
    var cy = my - 0.5;

    // Cab image parallax — only before phone enters
    if(!s2Activated){
      cabImg.style.transform = 'translate(' + (-cx * 20) + 'px,' + (-cy * 12) + 'px)';
    }

    // Phone tilt on mouse (only after activated)
    if(parallaxActive){
      var rotY = cx * 10;
      var rotX = -cy * 6;
      var tx = cx * 8;
      var ty = cy * 5;
      phoneFrame.style.transform = 'translateX(' + tx + 'px) translateY(' + ty + 'px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
    }
  });

  s2El.addEventListener('mouseleave', function(){
    if(!s2Activated) cabImg.style.transform = 'translate(0,0)';
    if(parallaxActive){
      phoneFrame.style.transform = 'translateX(0) translateY(0) rotateX(0) rotateY(0)';
    }
  });

  /* ── Auto-activate phone when S2 enters viewport (replaces glow click) ── */
  function activatePhone(){
    if(s2Activated) return;
    s2Activated = true;

    /* Lock scroll until Screen D completes — the phone walkthrough is the story.
       Without this, a single scroll wheel skips past everything. */
    try{ lenis.stop(); }catch(e){}
    hideSI();

    // Hide glow immediately
    gsap.to(glow, {opacity:0, duration:.3, onComplete:function(){ glow.style.display='none'; }});
    cabImg.style.transform = 'translate(0,0)';

    // Headline is revealed independently via its own ScrollTrigger below

    // Fade in dark overlay on image (heavier)
    gsap.to(darkOverlay, {opacity:1, duration:.8, ease:'power2.inOut'});

    // Show scene heading
    setTimeout(function(){ sceneHeading.classList.add('visible'); }, 800);

    // Timeline: phone slides in from left, image squeezes to 75%
    var tl = gsap.timeline({defaults:{ease:'power3.inOut',duration:1}});

    tl.to(phonePanel, {x:'0%', duration:1}, 0);
    tl.to(imgPanel, {left:'25%', width:'75%', duration:1}, 0);

    // Phone frame fades in — 3D entrance
    tl.to(phoneFrame, {opacity:1, x:0, rotateY:0, duration:.8, ease:'power2.out'}, .4);

    // Status bar color — starts on-dark (welcome splash is red)
    statusBar.classList.add('on-dark');

    // Activate phone parallax
    tl.call(function(){ parallaxActive = true; }, null, .8);

    // Trigger welcome splash
    tl.call(function(){ animateScreen(0); }, null, 1);

    // Show scroll indicator
    tl.call(function(){ showSI(); }, null, 1.4);
  }

  /* Trigger on glow click (fallback) */
  glow.addEventListener('click', activatePhone);

  /* Reveal headline the moment S2 enters viewport */
  ScrollTrigger.create({
    trigger: '#s2',
    start: 'top 90%',
    once: true,
    onEnter: function(){
      gsap.to(headline, {opacity:1, duration:1.2, ease:'power2.out'});
    }
  });

  /* Auto-trigger phone when S2 scrolls into viewport */
  ScrollTrigger.create({
    trigger: '#s2',
    start: 'top 80%',
    once: true,
    onEnter: activatePhone
  });

  /* ── Start Trip button → go to DVIR ── */
  startTripBtn.addEventListener('click', function(e){
    e.stopPropagation();
    startTripBtn.classList.remove('s2-press-indicator');
    goToScreen(2);
  });

  /* ── Submit DVIR → go to Live Trip (Screen D) ── */
  var submitDvirBtn = document.getElementById('s2-submit-dvir');
  if(submitDvirBtn){
    submitDvirBtn.addEventListener('click', function(e){
      e.stopPropagation();
      submitDvirBtn.classList.remove('s2-press-indicator');
      goToScreen(3);
    });
  }

  /* ── Screen entry animations ── */
  function animateScreen(idx){
    if(screenAnimated[idx]) return;
    screenAnimated[idx] = true;

    // Show feature list on screens 1 & 2
    showFeatureList(idx);

    if(idx === 0){
      // Welcome splash — logo pops, greeting fades in, auto-advance
      var el = document.getElementById('s2-screenA');
      var logo = el.querySelector('.s2a-logo');
      var greeting = el.querySelector('.s2a-greeting');
      var tagline = el.querySelector('.s2a-tagline');
      var loader = el.querySelector('.s2a-loader');
      var loaderBar = document.getElementById('s2a-loader-bar');

      gsap.to(logo, {opacity:1, scale:1, duration:.6, delay:.1, ease:'back.out(1.7)'});
      gsap.to(greeting, {opacity:1, y:0, duration:.5, delay:.4, ease:'power2.out'});
      gsap.to(tagline, {opacity:.7, y:0, duration:.5, delay:.6, ease:'power2.out'});
      gsap.to(loader, {opacity:1, duration:.3, delay:.8});

      // Loader bar fills then auto-advance to Trip screen
      setTimeout(function(){ loaderBar.style.width = '100%'; }, 900);
      setTimeout(function(){ goToScreen(1); }, 2800);
    }

    if(idx === 1){
      // Switch status bar to dark text (white bg screen)
      statusBar.classList.remove('on-dark');

      var el = document.getElementById('s2-screenB');
      var vText = el.querySelector('.s2b-vehicle-text');
      var rLabels = el.querySelectorAll('.s2b-route-label');
      var stats = el.querySelectorAll('.s2b-stat-chip');
      var btn = el.querySelector('.s2b-startbtn');
      var badge = el.querySelector('.s2b-time-badge');

      gsap.to(vText, {opacity:1, y:0, duration:.4, delay:.1, ease:'power2.out'});
      gsap.fromTo(badge, {opacity:0, scale:.8}, {opacity:1, scale:1, duration:.4, delay:.2, ease:'back.out(1.5)'});
      rLabels.forEach(function(l, i){
        gsap.to(l, {opacity:1, y:0, duration:.4, delay:.4 + i * .2, ease:'power2.out'});
      });
      stats.forEach(function(s, i){
        gsap.fromTo(s, {opacity:0, scale:.9}, {opacity:1, scale:1, duration:.4, delay:.7 + i * .15, ease:'back.out(1.5)'});
      });
      gsap.to(btn, {opacity:1, scale:1, duration:.5, delay:1, ease:'back.out(1.7)',
        onComplete:function(){
          gsap.to(btn, {scale:1.03, duration:.8, yoyo:true, repeat:-1, ease:'sine.inOut'});
          /* Show "TAP" press indicator on Start Trip button */
          btn.classList.add('s2-press-indicator');
        }
      });
    }

    if(idx === 2){
      var el = document.getElementById('s2-screenC');
      var donutFill = el.querySelector('.s2c-donut-fill');
      var donutNum = el.querySelector('.s2c-donut-num');
      var items = el.querySelectorAll('.s2c-check-item');
      var btn = el.querySelector('.s2c-submit');

      // All 6 pass — full green donut (dashoffset 0 = full circle)
      gsap.fromTo(donutFill,
        {strokeDashoffset:251},
        {strokeDashoffset:0, duration:1.5, delay:.2, ease:'power2.inOut'}
      );
      var counter = {val:0};
      gsap.to(counter, {val:6, duration:1.5, delay:.2, ease:'power2.inOut',
        onUpdate:function(){ donutNum.textContent = Math.round(counter.val) + '/6'; }
      });
      items.forEach(function(item, i){
        gsap.fromTo(item, {opacity:0, y:8}, {opacity:1, y:0, duration:.35, delay:.5 + i * .1, ease:'power2.out'});
      });
      gsap.to(btn, {opacity:1, scale:1, duration:.5, delay:1.4, ease:'back.out(1.5)',
        onComplete:function(){
          /* Show "TAP" press indicator on Submit DVIR button */
          btn.classList.add('s2-press-indicator');
        }
      });
    }

    if(idx === 3){
      // Live Trip screen — stagger all sections in
      statusBar.classList.add('on-dark');
      var dItems = document.querySelectorAll('#s2-screenD .s2d-anim-item');
      dItems.forEach(function(item, i){
        gsap.to(item, {opacity:1, y:0, duration:.35, delay:.1 + i * .12, ease:'power2.out'});
      });
      var tripBadge = document.getElementById('s2d-trip-badge');
      if(tripBadge){
        gsap.fromTo(tripBadge, {opacity:0, scale:.7}, {opacity:1, scale:1, duration:.5, delay:.6, ease:'back.out(1.7)'});
      }
      // Signal that Screen D is complete — unlocks scroll animation
      setTimeout(function(){
        if(window.__onScreenDComplete) window.__onScreenDComplete();
      }, 1500);
    }
  }

  /* ── Feature list — stagger reveal on image side ── */
  function showFeatureList(idx){
    if(idx === 0){
      featureList.classList.remove('active');
      return;
    }
    featureList.classList.add('active');
    featItems.forEach(function(f, i){
      gsap.to(f, {opacity:1, x:0, duration:.4, delay:.1 + i * .08, ease:'power2.out'});
    });
  }

  /* ── Screen navigation (button-driven only) ── */
  function goToScreen(idx){
    if(idx < 0 || idx >= totalScreens) return;
    currentScreen = idx;
    screens.style.transform = 'translateX(-' + (idx * (100/totalScreens)) + '%)';
    setTimeout(function(){ animateScreen(idx); }, 300);
  }

  /* ── ScrollTrigger: pin S2 ──
     Simple job: scroll pins S2. After Screen D completes + user scrolls,
     the entire phone slides from the left panel to viewport center.
     Then expansion begins (UI fade → scale up → chrome dissolve).
     Nothing resets, nothing clears, nothing fades during the slide.

     Layout: 50vh slide-to-center | 300vh expansion = 350vh scroll distance.
     The wrapper starts at 100vh (no scroll room). Once Screen D completes,
     JS extends it to 450vh (100vh base + 350vh animation).
  ── */
  var s2Section = document.getElementById('s2');
  var phoneBody    = phoneFrame.querySelector('.s2-phone-body');
  var notch        = phoneFrame.querySelector('.s2-phone-notch');
  var screenWrapS2 = phoneFrame.querySelector('.s2-phone-screen-wrap');
  var volBtns      = phoneFrame.querySelectorAll('.s2-phone-vol, .s2-phone-vol2');
  var uiOverlay    = document.getElementById('s2d-ui-overlay');
  var mapMorph     = document.getElementById('s2-map-morph');
  var mapBgEl      = document.querySelector('#s2-screenD .s2d-map-bg');
  var mapMorphSrc  = null; /* cached source rect — set on first transition frame */

  /* Track whether Screen D carousel is done */
  var screenDComplete = false;

  /* Called from animateScreen(3) when Screen D finishes animating */
  function onScreenDComplete(){
    screenDComplete = true;
    /* Extend wrapper so there's scroll room for the animation */
    wrapper.style.height = '280vh';
    ScrollTrigger.refresh();
  }

  /* Expose so animateScreen can call it */
  window.__onScreenDComplete = onScreenDComplete;

  ScrollTrigger.create({
    trigger: wrapper,
    start: 'top top',
    end: 'bottom bottom',
    pin: '#s2',
    onUpdate: function(self){
      var p = self.progress;

      /* Don't animate until Screen D is done */
      if(!screenDComplete) return;

      /* The first 100vh is the base section (p=0 when section fills viewport).
         Animation scroll = 180vh (wrapper 280 - base 100). Map p into animation progress: */
      var BASE = 100 / 280;          /* 0.357 */
      if(p <= BASE){
        /* Reset S23 if it was forced into viewport during transition */
        var _s23 = document.getElementById('s23-trans');
        var _dash = document.getElementById('s23-dash');
        if(_s23 && _s23.style.position === 'fixed'){
          _s23.style.position = '';
          _s23.style.top = '';
          _s23.style.left = '';
          _s23.style.width = '';
          _s23.style.height = '';
          _s23.style.zIndex = '';
          _s23.style.overflow = '';
          _s23.style.background = '#0d0d0f';
        }
        if(_dash && _dash.style.opacity === '1'){
          _dash.style.opacity = '0';
          _dash.style.clipPath = '';
          _dash.style.pointerEvents = 'none';
        }
        if(mapMorph) mapMorph.style.opacity = '0';

        /* ── HARD RESET: restore phone to post-entry walkthrough state ──
           Critical: do NOT clear opacity or transform to empty strings — the
           CSS defaults are the pre-entry state (opacity:0, translateX(-40px)
           rotateY(15deg)), which makes the phone vanish. Instead, explicitly
           set the post-entry values so the phone stays visible at its panel
           position throughout the walkthrough. */
        phoneFrame.classList.remove('phone-fixed');
        phoneFrame.style.position = '';
        phoneFrame.style.left = '';
        phoneFrame.style.top = '';
        phoneFrame.style.zIndex = '';
        phoneFrame.style.transition = '';
        phoneFrame.style.opacity = '1';                              /* visible */
        phoneFrame.style.transform = 'translateX(0px) translateY(0px) rotateX(0deg) rotateY(0deg)';
        mapMorphSrc = null;
        /* Re-enable mouse parallax for the walkthrough */
        parallaxActive = true;
        if(s2Section){ s2Section.style.background = ''; s2Section.style.pointerEvents = ''; }
        if(imgPanel) imgPanel.style.opacity = '';
        if(headline) headline.style.opacity = '';
        if(featureList) featureList.style.opacity = '';
        if(sceneHeading) sceneHeading.style.opacity = '';
        if(mapBgEl) mapBgEl.style.opacity = '';
        /* Reset phone chrome to defaults (the expand phase strips them) */
        if(phoneBody){
          phoneBody.style.borderRadius = '';
          phoneBody.style.borderWidth = '';
          phoneBody.style.padding = '';
          phoneBody.style.background = '';
          phoneBody.style.boxShadow = '';
        }
        if(notch) notch.style.opacity = '';
        if(uiOverlay) uiOverlay.style.opacity = '';
        if(statusBar) statusBar.style.opacity = '';
        if(screenWrapS2) screenWrapS2.style.borderRadius = '';
        volBtns.forEach(function(v){ v.style.opacity = ''; });
        return;
      }

      var ap = (p - BASE) / (1 - BASE);  /* 0→1 across 180vh */

      var SLIDE_END = 30 / 180;      /* 0.167 — slide occupies first 30vh */

      /* ═══ SLIDE (ap 0 → 0.167): Phone glides from panel-center to viewport-center ═══
         TRANSFORM-ONLY — no position-mode switch. Phone stays in-flow inside the
         panel; we just translateX it horizontally. This avoids the position:static
         → position:fixed reflow that was causing the disappear/reappear glitch.
         Position-fixed is only adopted later when the expansion phase begins. */
      if(ap <= SLIDE_END){
        var t = ap / SLIDE_END; /* 0→1 */

        /* Suspend mouse parallax — otherwise its writes to transform race with ours. */
        parallaxActive = false;

        /* If we're returning to the slide phase from expansion, strip the
           position:fixed inline styles first so we go back to in-flow cleanly. */
        if(phoneFrame.classList.contains('phone-fixed')){
          phoneFrame.classList.remove('phone-fixed');
          phoneFrame.style.position = '';
          phoneFrame.style.top = '';
          phoneFrame.style.left = '';
          phoneFrame.style.zIndex = '';
        }

        /* Distance from current panel-center to viewport-center, in viewport pixels.
           Phone is flex-centered in the panel, so its in-flow center sits at
           (panelLeft + panelWidth/2). Target is viewport center. */
        var panelCenter = phonePanel.offsetLeft + phonePanel.offsetWidth / 2;
        var distance = (window.innerWidth / 2) - panelCenter;

        phoneFrame.style.transition = 'none';
        phoneFrame.style.opacity = '1';
        phoneFrame.style.transform = 'translateX(' + (distance * t) + 'px)';

        /* Reset morph element + map bg when scrolled back to slide phase */
        if(mapMorph) mapMorph.style.opacity = '0';
        if(mapBgEl) mapBgEl.style.opacity = '1';

        /* Reset S23 if scrolled back to slide phase */
        var _s23s = document.getElementById('s23-trans');
        var _dashs = document.getElementById('s23-dash');
        if(_s23s && _s23s.style.position === 'fixed'){
          _s23s.style.position = ''; _s23s.style.top = ''; _s23s.style.left = '';
          _s23s.style.width = ''; _s23s.style.height = ''; _s23s.style.zIndex = '';
          _s23s.style.overflow = ''; _s23s.style.background = '#0d0d0f';
        }
        if(_dashs){ _dashs.style.opacity = '0'; _dashs.style.clipPath = ''; _dashs.style.pointerEvents = 'none'; }
        mapMorphSrc = null; /* re-cache on next expansion */
      }

      /* ═══ EXPANSION (ap 0.143 → 1.0): Phone centered, now expand ═══
         EXACT prototype phases — same boundaries, same math.
         Adapted: translate(-50%,-50%) added since phone is centered via fixed pos.
         Phases 3+4 (haze/scene swap) → dashboard cross-fade (no haze). */
      if(ap > SLIDE_END){
        var ep = (ap - SLIDE_END) / (1 - SLIDE_END); /* 0→1 across 300vh */

        parallaxActive = false;

        /* ── First entry to expansion: switch from transform-only slide to
           position:fixed mode. The phone's CURRENT visual center IS already at
           viewport center (slide ended with translateX(distance)), so adopting
           .phone-fixed with left:viewport-center + translate(-50%,-50%) lands
           the phone at exactly the same pixel — no visible jump.
           CRUCIAL: set left + transform IN THE SAME synchronous block so the
           position-mode flip doesn't paint with a stale translateX. */
        if(!phoneFrame.classList.contains('phone-fixed')){
          phoneFrame.style.transition = 'none';
          phoneFrame.classList.add('phone-fixed');
          phoneFrame.style.zIndex = '9999';
          phoneFrame.style.left = (window.innerWidth / 2) + 'px';
          phoneFrame.style.transform = 'translate(-50%,-50%) scale(1)';
        }

        /* Keep phone centered */
        phoneFrame.style.left = (window.innerWidth / 2) + 'px';

        /* Also fade cab/features as expansion starts */
        if(ep < 0.05){
          var ft = ep / 0.05;
          imgPanel.style.opacity = String(1 - ft);
          if(headline) headline.style.opacity = String(1 - ft);
          featureList.style.opacity = String((1 - ft) * (featureList.classList.contains('active') ? 1 : 0));
          sceneHeading.style.opacity = String(1 - ft);
          s2Section.style.background = 'rgba(0,0,0,' + (ft * 0.85) + ')';
        } else {
          imgPanel.style.opacity = '0';
          if(headline) headline.style.opacity = '0';
          featureList.style.opacity = '0';
          sceneHeading.style.opacity = '0';
          s2Section.style.background = 'rgba(0,0,0,0.85)';
        }

        /* ── Target: dashboard map area position + size ──
           Measured RELATIVE to #s23-trans since it will be pinned at (0,0). */
        var s23Section = document.getElementById('s23-trans');
        var mapArea = s23Section ? s23Section.querySelector('.dash-map-area') : null;
        var mapW, mapH, mapFinalLeft, mapFinalTop;
        if(mapArea && s23Section){
          var s23R = s23Section.getBoundingClientRect();
          var mapR = mapArea.getBoundingClientRect();
          mapW = mapR.width;
          mapH = mapR.height;
          mapFinalLeft = mapR.left - s23R.left;
          mapFinalTop = mapR.top - s23R.top;
        } else {
          mapW = window.innerWidth - 500;
          mapH = window.innerHeight * 0.6;
          mapFinalLeft = 220;
          mapFinalTop = 200;
        }

        /* ── Source: phone's map bg position (cached on first frame) ── */
        if(!mapMorphSrc && mapBgEl){
          var bgR = mapBgEl.getBoundingClientRect();
          mapMorphSrc = { left: bgR.left, top: bgR.top, width: bgR.width, height: bgR.height };
        }
        var src = mapMorphSrc || { left: window.innerWidth/2 - 130, top: window.innerHeight/2 - 280, width: 260, height: 560 };
        var tgt = { left: mapFinalLeft, top: mapFinalTop, width: mapW, height: mapH };

        /* ── Phase 1+2 combined (ep 0–0.40): Everything simultaneous ──
           Map morph flies from phone to dashboard. Phone fades out in place.
           UI, chrome, phone body all dissolve at the same time. */
        if(ep < 0.40){
          var t = ep / 0.40;
          /* easeInOutCubic for smooth motion */
          var eased = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;

          /* Map morph: show and animate from phone to dashboard */
          if(mapMorph){
            mapMorph.style.opacity = '1';
            mapMorph.style.left   = (src.left + (tgt.left - src.left) * eased) + 'px';
            mapMorph.style.top    = (src.top  + (tgt.top  - src.top)  * eased) + 'px';
            mapMorph.style.width  = (src.width  + (tgt.width  - src.width)  * eased) + 'px';
            mapMorph.style.height = (src.height + (tgt.height - src.height) * eased) + 'px';
            mapMorph.style.borderRadius = (32 - eased * 22) + 'px'; /* 32px phone → 10px dashboard */
          }

          /* Hide original map bg inside phone (morph replaces it) */
          if(mapBgEl) mapBgEl.style.opacity = '0';

          /* Phone fades out in place — stays 280x580, no scaling, no moving */
          phoneFrame.style.transition = 'none';
          phoneFrame.style.transform = 'translate(-50%,-50%) scale(1)';
          phoneFrame.style.top = '50%';
          phoneFrame.style.opacity = String(1 - t);

          /* Screen D UI overlay fades */
          if(uiOverlay) uiOverlay.style.opacity = String(1 - t);
          if(statusBar) statusBar.style.opacity = String(1 - t);

          /* Chrome dissolves (twice as fast — done by t=0.5) */
          var chromeT = Math.min(1, t * 2);
          if(notch) notch.style.opacity = String(1 - chromeT);
          volBtns.forEach(function(v){ v.style.opacity = String(1 - chromeT); });
          if(phoneBody){
            phoneBody.style.borderRadius = (40 * (1 - chromeT)) + 'px';
            phoneBody.style.borderWidth = (2 * (1 - chromeT)) + 'px';
            phoneBody.style.padding = (8 * (1 - chromeT)) + 'px';
            var bgO = 1 - chromeT;
            phoneBody.style.background = 'linear-gradient(145deg,rgba(42,45,62,' + bgO + '),rgba(29,36,56,' + bgO + '),rgba(13,15,26,' + bgO + '))';
            phoneBody.style.boxShadow = '0 ' + (30 * bgO) + 'px ' + (80 * bgO) + 'px rgba(0,0,0,' + (.7 * bgO) + ')';
          }
          if(screenWrapS2) screenWrapS2.style.borderRadius = (32 * (1 - chromeT)) + 'px';
        }

        /* ── Phase 3 (ep >= 0.40): Lock morph at target, phone gone ── */
        if(ep >= 0.40){
          phoneFrame.style.opacity = '0';
          phoneFrame.style.transition = 'none';
          if(uiOverlay) uiOverlay.style.opacity = '0';
          if(statusBar) statusBar.style.opacity = '0';
          if(mapMorph){
            mapMorph.style.opacity = '1';
            mapMorph.style.left   = tgt.left + 'px';
            mapMorph.style.top    = tgt.top + 'px';
            mapMorph.style.width  = tgt.width + 'px';
            mapMorph.style.height = tgt.height + 'px';
            mapMorph.style.borderRadius = '10px';
          }
          if(mapBgEl) mapBgEl.style.opacity = '0';
        }

        /* ── Dashboard expand (ep 0.15→0.55): Runs SIMULTANEOUSLY with morph ──
           Dark curtain lifts while morph is flying. Dashboard clip-path
           expands outward from the map area. By ep 0.40 (morph done),
           dashboard is mostly visible. By ep 0.55, fully revealed. */
        var dashEl = document.getElementById('s23-dash');
        var s23El  = document.getElementById('s23-trans');
        var s23Left  = document.getElementById('s23-left');
        var s23Right = document.getElementById('s23-right');

        if(ep >= 0.15){
          /* Dashboard expand progress: ep 0.15→0.55 maps to exT 0→1 */
          var exT = Math.min(1, Math.max(0, (ep - 0.15) / 0.40));
          /* easeOutCubic */
          var exE = 1 - Math.pow(1 - exT, 3);

          /* ── KEY FIX: Force S23 into viewport ──
             S23-trans is below S2-wrapper in the DOM and hasn't scrolled
             into view yet. We force it to position:fixed so it overlays
             the viewport, sitting ABOVE S2 but BELOW the morph (z:9998). */
          if(s23El){
            s23El.style.position = 'fixed';
            s23El.style.top = '0';
            s23El.style.left = '0';
            s23El.style.width = '100vw';
            s23El.style.height = '100dvh';
            s23El.style.zIndex = '100';
            s23El.style.overflow = 'hidden';
          }

          /* Lift the dark curtain — S2 bg fades to transparent */
          var curtainT = Math.min(1, exT / 0.4); /* done by 40% of expand = ep ~0.31 */
          s2Section.style.background = 'rgba(0,0,0,' + (0.85 * (1 - curtainT)) + ')';
          if(curtainT > 0.5) s2Section.style.pointerEvents = 'none';

          /* Dashboard is visible — opacity 1, clip-path controls reveal */
          if(dashEl){
            dashEl.style.opacity = '1';
            dashEl.style.pointerEvents = exE > 0.5 ? 'auto' : 'none';
          }

          /* Clip-path: starts at map-area rectangle, expands to full viewport */
          if(dashEl && s23El){
            var sR = s23El.getBoundingClientRect();
            var iTop    = tgt.top;
            var iLeft   = tgt.left;
            var iBottom = sR.height - (tgt.top + tgt.height);
            var iRight  = sR.width  - (tgt.left + tgt.width);

            var cTop    = iTop    * (1 - exE);
            var cRight  = iRight  * (1 - exE);
            var cBottom = iBottom * (1 - exE);
            var cLeft   = iLeft   * (1 - exE);
            var cRadius = 10 * (1 - exE);

            dashEl.style.clipPath = 'inset(' + cTop + 'px ' + cRight + 'px ' + cBottom + 'px ' + cLeft + 'px round ' + cRadius + 'px)';
          }

          /* S23 background: dark → light */
          if(s23El){
            var r = Math.round(13 + exE * (244 - 13));
            var g = Math.round(13 + exE * (245 - 13));
            var b = Math.round(15 + exE * (247 - 15));
            s23El.style.background = 'rgb(' + r + ',' + g + ',' + b + ')';
          }

          /* Panels at final positions — clip-path reveals them */
          if(s23Left){
            s23Left.style.transform = 'translateX(0%)';
            if(!s23Left.classList.contains('scroll-driven')) s23Left.classList.add('scroll-driven');
            if(exE >= 1) s23Left.classList.add('in');
            else s23Left.classList.remove('in');
          }
          if(s23Right){
            s23Right.style.transform = 'translateX(0%)';
            if(!s23Right.classList.contains('scroll-driven')) s23Right.classList.add('scroll-driven');
            if(exE >= 1) s23Right.classList.add('in');
            else s23Right.classList.remove('in');
          }

          /* Once dashboard is fully revealed, hide morph — dashboard's own
             map image is identical and now visible beneath it */
          if(exE >= 1 && mapMorph){
            mapMorph.style.opacity = '0';
          }

        } else {
          /* ── REVERSE: ep < 0.15 — reset everything ── */
          phoneFrame.style.zIndex = '9999';
          if(dashEl){
            dashEl.style.opacity = '0';
            dashEl.style.clipPath = '';
            dashEl.style.pointerEvents = 'none';
          }
          /* Reset S23 back to normal flow */
          if(s23El){
            s23El.style.position = '';
            s23El.style.top = '';
            s23El.style.left = '';
            s23El.style.width = '';
            s23El.style.height = '';
            s23El.style.zIndex = '';
            s23El.style.overflow = '';
            s23El.style.background = '#0d0d0f';
          }
          if(s23Left){ s23Left.classList.remove('in'); s23Left.classList.remove('scroll-driven'); }
          if(s23Right){ s23Right.classList.remove('in'); s23Right.classList.remove('scroll-driven'); }
          s2Section.style.background = 'rgba(0,0,0,0.85)';
          s2Section.style.pointerEvents = '';
        }
      }
    }
  });
})();
