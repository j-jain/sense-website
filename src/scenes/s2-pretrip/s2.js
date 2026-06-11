import { lenis, showSI, hideSI, isMobile } from '../../shared/setup.js';
import { prepText, revealText } from '../../shared/text-reveal.js';

/* ════════════════════════════════════════════
   S2 — BEFORE THE FIRST KILOMETER
   Realistic 3D phone · button-driven flow
   Interior-designer walkthrough feel
════════════════════════════════════════════ */
(function(){
  var wrapper = document.getElementById('s2-wrapper');
  /* Desktop: pre-set to 160vh so proto-wrapper (margin-top:-100vh) starts 60vh
     below s2's pin end — preventing the proto pin from firing at the same scroll
     position as s2 and covering the phone walkthrough. The extra 60vh is inert
     until Screen D completes (onUpdate returns early via !screenDComplete) and
     scroll is locked during the walkthrough so the user can't reach it early.
     Mobile: stays 100vh since proto-wrapper has no -100vh margin there. */
  wrapper.style.height = isMobile() ? '100vh' : '160vh';

  var imgPanel     = document.getElementById('s2-img-panel');
  var cabImg       = document.getElementById('s2-cab-img');
  var darkOverlay  = document.getElementById('s2-dark-overlay');
  var phonePanel   = document.getElementById('s2-phone-panel');
  var phoneFrame   = document.getElementById('s2-phone-frame');
  var glow         = document.getElementById('s2-glow');
  var screens      = document.getElementById('s2-screens');
  var headline     = document.querySelector('.s2-headline');
  prepText(headline);  /* pre-split so the headline rises in letter-by-letter on enter */
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
       lenis.stop() alone doesn't block native key/trackpad scroll, so also raise
       the global hard-lock flag (blocker lives in s23.js). */
    try{ lenis.stop(); }catch(e){}
    window.__scrollLocked = true;
    hideSI();

    // Hide glow immediately
    gsap.to(glow, {opacity:0, duration:.3, onComplete:function(){ glow.style.display='none'; }});
    cabImg.style.transform = 'translate(0,0)';

    // Headline is revealed independently via its own ScrollTrigger below

    // Fade in dark overlay on image (heavier)
    gsap.to(darkOverlay, {opacity:1, duration:.6, ease:'power3.out'});

    // Show scene heading
    setTimeout(function(){ sceneHeading.classList.add('visible'); }, 800);

    // Timeline: phone slides in from left, image squeezes to 75%
    var tl = gsap.timeline({defaults:{ease:'power4.out',duration:0.85}});

    /* Phone slides in from the left to CENTRE (panel is full-width now). The cab
       stays full-bleed as a dim backdrop on every viewport — no squeeze. */
    tl.to(phonePanel, {x:'0%', duration:0.85}, 0);

    // Phone frame fades in — 3D entrance
    tl.to(phoneFrame, {opacity:1, x:0, rotateY:0, duration:.65, ease:'expo.out'}, .35);

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
      revealText(headline, {duration:1.0});
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

      gsap.to(logo, {opacity:1, scale:1, duration:.5, delay:.08, ease:'expo.out'});
      gsap.to(greeting, {opacity:1, y:0, duration:.38, delay:.28, ease:'expo.out'});
      gsap.to(tagline, {opacity:.7, y:0, duration:.38, delay:.44, ease:'expo.out'});
      gsap.to(loader, {opacity:1, duration:.25, delay:.62});

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

      gsap.to(vText, {opacity:1, y:0, duration:.32, delay:.08, ease:'expo.out'});
      gsap.fromTo(badge, {opacity:0, scale:.9}, {opacity:1, scale:1, duration:.32, delay:.16, ease:'expo.out'});
      rLabels.forEach(function(l, i){
        gsap.to(l, {opacity:1, y:0, duration:.32, delay:.30 + i * .09, ease:'expo.out'});
      });
      stats.forEach(function(s, i){
        gsap.fromTo(s, {opacity:0, scale:.92}, {opacity:1, scale:1, duration:.32, delay:.54 + i * .06, ease:'expo.out'});
      });
      gsap.to(btn, {opacity:1, scale:1, duration:.42, delay:.80, ease:'expo.out',
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
        {strokeDashoffset:0, duration:1.4, delay:.2, ease:'power3.inOut'}
      );
      var counter = {val:0};
      gsap.to(counter, {val:6, duration:1.4, delay:.2, ease:'power3.inOut',
        onUpdate:function(){ donutNum.textContent = Math.round(counter.val) + '/6'; }
      });
      items.forEach(function(item, i){
        gsap.fromTo(item, {opacity:0, y:6}, {opacity:1, y:0, duration:.28, delay:.44 + i * .07, ease:'expo.out'});
      });
      gsap.to(btn, {opacity:1, scale:1, duration:.4, delay:1.1, ease:'expo.out',
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
        gsap.to(item, {opacity:1, y:0, duration:.28, delay:.07 + i * .07, ease:'expo.out'});
      });
      var tripBadge = document.getElementById('s2d-trip-badge');
      if(tripBadge){
        gsap.fromTo(tripBadge, {opacity:0, scale:.85}, {opacity:1, scale:1, duration:.4, delay:.48, ease:'expo.out'});
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
      gsap.to(f, {opacity:1, x:0, duration:.32, delay:.07 + i * .05, ease:'expo.out'});
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
    /* Re-enable smooth scrolling: the walkthrough locked Lenis with stop().
       Without this, wheel/trackpad stays dead (only native arrow-key scroll
       works) for the rest of the scene. */
    try{ lenis.start(); }catch(e){}
    window.__scrollLocked = false;
    showSI();
    /* Extend wrapper so there's scroll room for the animation.
       Mobile skips the expand-to-dashboard morph, so it needs no extra scroll
       room — the section just scrolls away to the S23 phone app. */
    /* Desktop no longer expands the phone into the dashboard here — the iPad
       prototype (#proto-stage, next section) owns that. We only need room for
       the slide-to-centre + a short fade-to-black hand-off. */
    wrapper.style.height = isMobile() ? '100vh' : '160vh';
    ScrollTrigger.refresh();
    /* Snap to the pin start so the slide always begins from progress 0 —
       prevents any scroll accumulated during the walkthrough from making the
       phone slide before Screen D is fully out. */
    try{ lenis.scrollTo(wrapper, {immediate:true}); }catch(e){}
  }

  /* Expose so animateScreen can call it */
  window.__onScreenDComplete = onScreenDComplete;

  /* ── Reset Scene 2 to its parked walkthrough state ──
     Phone in its LEFT home panel (in-flow, no translate), dashboard/morph
     hidden, panels + cab image restored, chrome back to defaults. Used both
     in the BASE dead zone and on any reverse (scroll-up) so the phone stays
     stuck on the left instead of sliding. */
  function resetToWalkthrough(){
    /* (Removed: stale resets of the proto's dashboard #s23-trans/#s23-dash from
       the retired "Scene 2 expands into the dashboard" morph — the iPad proto now
       owns that dashboard, so Scene 2 must not touch it.) */
    if(mapMorph) mapMorph.style.opacity = '0';
    phoneFrame.classList.remove('phone-fixed');
    phoneFrame.style.position = '';
    phoneFrame.style.left = '';
    phoneFrame.style.top = '';
    phoneFrame.style.zIndex = '';
    phoneFrame.style.transition = '';
    phoneFrame.style.opacity = '1';
    phoneFrame.style.visibility = '';   /* never leave the phone hidden in the walkthrough */
    phoneFrame.style.transform = 'translateX(0px) translateY(0px) rotateX(0deg) rotateY(0deg)';
    mapMorphSrc = null;
    parallaxActive = true;
    if(s2Section){ s2Section.style.background = ''; s2Section.style.pointerEvents = ''; }
    if(imgPanel) imgPanel.style.opacity = '';
    if(headline){ headline.style.opacity = ''; headline.style.transform = ''; }
    if(featureList){ featureList.style.opacity = ''; featureList.style.transform = ''; }
    if(sceneHeading){ sceneHeading.style.opacity = ''; sceneHeading.style.transform = ''; }
    if(mapBgEl) mapBgEl.style.opacity = '';
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
    if(screenWrapS2){ screenWrapS2.style.borderRadius = ''; screenWrapS2.style.background = ''; }
    volBtns.forEach(function(v){ v.style.opacity = ''; });
  }

  ScrollTrigger.create({
    trigger: wrapper,
    start: 'top top',
    end: 'bottom bottom',
    pin: '#s2',
    onUpdate: function(self){
      /* Mobile: no phone→dashboard morph. The walkthrough plays, then S2 simply
         scrolls away and the S23 phone-app takes over (see s23.js mobile branch). */
      if(isMobile()) return;

      var p = self.progress;

      /* Don't animate until Screen D is done */
      if(!screenDComplete) return;

      /* Small dead zone before the slide begins, then the animation runs.
         Wrapper is 230vh (130vh of pinned scroll). BASE is kept tiny so the
         phone reaches center in ~5 scroll steps instead of ~11. */
      var BASE = 0.14;
      if(p <= BASE){
        resetToWalkthrough();
        return;
      }

      /* ═══ SCROLL-UP: phone stays STUCK on the left, no sliding ═══
         The forward slide/expansion only ever plays going DOWN. On any reverse
         scroll we snap straight back to the parked walkthrough state (phone in
         its left home), so returning from the dashboard / later scenes never
         drags the phone across the screen. */
      if(self.direction === -1){
        resetToWalkthrough();
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
        if(screenWrapS2) screenWrapS2.style.background = '';

        /* (Removed: stale S23 dashboard resets — the iPad proto owns that dashboard
           now; Scene 2 hiding #s23-dash here was what blanked it inside the iPad.) */
        mapMorphSrc = null; /* re-cache on next expansion */
      }

      /* ═══ POST-SLIDE (ap 0.167 → 1.0): the phone holds at viewport centre, the
         Scene-2 stage fades to solid black, then the phone itself fades out. The
         iPad-morph prototype (#proto-stage, the next pinned section) takes over
         from this identical centred phone — no dashboard expansion here. ═══ */
      if(ap > SLIDE_END){
        var ep = (ap - SLIDE_END) / (1 - SLIDE_END); /* 0→1 */

        parallaxActive = false;

        /* Keep the phone centred IN-FLOW — same translateX the slide ended on.
           Crucially NOT position:fixed: the phone is a child of the pinned #s2,
           so the pin already holds it in view, and when #s2 unpins at the hand-off
           it scrolls away with the section. A fixed phone would freeze in the
           viewport and linger over the proto (the duplicate phone + the white-
           screen occluding the iPad dashboard). */
        if(phoneFrame.classList.contains('phone-fixed')){
          phoneFrame.classList.remove('phone-fixed');
          phoneFrame.style.position = '';
          phoneFrame.style.top = '';
          phoneFrame.style.left = '';
          phoneFrame.style.zIndex = '';
        }
        var panelCenter = phonePanel.offsetLeft + phonePanel.offsetWidth / 2;
        var distance = (window.innerWidth / 2) - panelCenter;
        phoneFrame.style.transition = 'none';
        phoneFrame.style.transform = 'translateX(' + distance + 'px)';

        /* As the phone holds at centre and begins to "convert" into the
           dashboard, push the text UP as it fades, dissolve the cab backdrop
           slowly, then settle to solid black for the seamless hand-off. */
        var tp   = Math.min(1, ep / 0.35);      /* text leave progress */
        var lift = -56 * (tp * tp);             /* ease-in rise (accelerates up), px */
        if(headline){
          headline.style.opacity   = String(1 - tp);
          headline.style.transform = 'translateY(-50%) translateY(' + lift + 'px)';
        }
        if(sceneHeading){
          sceneHeading.style.opacity   = String(1 - tp);
          sceneHeading.style.transform = 'translateX(-50%) translateY(' + lift + 'px)';
        }
        if(featureList){
          var flOn = featureList.classList.contains('active') ? 1 : 0;
          featureList.style.opacity   = String((1 - tp) * flOn);
          featureList.style.transform = 'translateY(-50%) translateY(' + lift + 'px)';
        }

        /* Cab backdrop dissolves slowly across most of the post-slide window. */
        var bg = 1 - Math.pow(1 - Math.min(1, ep / 0.70), 2);   /* ease-out */
        if(imgPanel) imgPanel.style.opacity = String(1 - bg);

        /* Black stage completes before the section unpins (proto morph starts on black). */
        var k = Math.min(1, ep / 0.65);
        s2Section.style.background = 'rgba(0,0,0,' + k + ')';
        if(k > 0.5) s2Section.style.pointerEvents = 'none';

        /* The phone does NOT fade and does NOT hide — it stays fully visible at
           centre. The proto wrapper is pulled up 100vh so its pin begins exactly
           where this one ends; the proto's identical centred phone (#phone, same
           Screen D) reveals on top at that instant and occludes this one, so the
           hand-off reads as ONE continuous phone that morphs into the iPad. */
        phoneFrame.style.opacity = '1';
        phoneFrame.style.visibility = '';
      }
    }
  });
})();
