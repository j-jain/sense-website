// ==================================================
// SCENE 8-9-10 INTEGRATED PROTOTYPE
// ==================================================
import { prepText, revealChars } from '../../shared/text-reveal.js';

(function() {
  var sc8 = document.getElementById('sc8-root');
  if (!sc8) return;

  // ==================================================
  // SCENE 8: Pill Hover Logic
  // ==================================================
  var pills = sc8.querySelectorAll('.pill');
  var devices = {
    chat: document.getElementById('deviceChat'),
    predict: document.getElementById('devicePredict'),
    pattern: document.getElementById('devicePattern'),
    visibility: document.getElementById('deviceVisibility')
  };
  var labels = {
    chat: document.getElementById('labelChat'),
    predict: document.getElementById('labelPredict'),
    pattern: document.getElementById('labelPattern'),
    visibility: document.getElementById('labelVisibility')
  };
  var conns = {
    chat: document.getElementById('connChat'),
    predict: document.getElementById('connPredict'),
    pattern: document.getElementById('connPattern'),
    visibility: document.getElementById('connVisibility')
  };

  function clearAll() {
    Object.values(devices).forEach(function(d){ if(d){ gsap.set(d, {opacity:0, y:30, scale:0.92}); d.classList.remove('visible'); }});
    Object.values(labels).forEach(function(l){ if(l) l.classList.remove('visible'); });
    Object.values(conns).forEach(function(c){ if(c) c.classList.remove('visible'); });
    pills.forEach(function(p){ p.classList.remove('active'); });
  }

  function resetChat() {
    var b = sc8.querySelectorAll('.chat-bubble');
    b.forEach(function(x){ x.style.animation = 'none'; x.style.opacity = '0'; });
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ b.forEach(function(x){ x.style.animation = ''; }); });
    });
  }

  /* Robust touch detection: flip a flag on the first real touch. This avoids
     hover-media-query quirks (some Android Chrome reports hover:hover on touch)
     and the synthetic mouseenter→click double-fire that made taps appear dead. */
  var sc8HadTouch = false;
  window.addEventListener('touchstart', function(){
    if(sc8HadTouch) return;
    sc8HadTouch = true;
    var instr = document.getElementById('instructionText');
    if(instr) instr.textContent = 'Tap a capability to see it on its own device';
  }, {passive:true});

  function sc8ShowPill(pill){
    clearAll();
    var t = pill.dataset.target;
    pill.classList.add('active');
    if(devices[t]) {
      devices[t].classList.add('visible');
      gsap.fromTo(devices[t], {opacity:0, y:16, scale:0.96}, {opacity:1, y:0, scale:1, duration:0.28, ease:'expo.out'});
    }
    if(labels[t]) labels[t].classList.add('visible');
    if(conns[t]) conns[t].classList.add('visible');
    if (t === 'chat') resetChat();
  }
  pills.forEach(function(pill) {
    /* Pointer devices reveal on hover. After any touch, hover handlers no-op
       and a tap toggles the device — so phones never depend on hover.
       No mouseleave handler: the selection PERSISTS so exactly one pill is
       always active (sc8ShowPill clears the previous one when switching). */
    pill.addEventListener('mouseenter', function() {
      if(sc8HadTouch) return;
      sc8ShowPill(pill);
    });
    pill.addEventListener('click', function() {
      if(!sc8HadTouch) return;
      if(pill.classList.contains('active')){ clearAll(); return; }
      sc8ShowPill(pill);
    });
  });

  /* Default selection: Conversational AI is active the moment you reach the
     scene and stays selected until you hover another pill. Gated to real
     pointer devices so touch keeps its tap-to-reveal flow (no mockup over
     the map on arrival). */
  function sc8ShowDefault(){
    var def = sc8.querySelector('.pill[data-target="chat"]') || pills[0];
    if (def) sc8ShowPill(def);
  }
  if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    sc8ShowDefault();
  }

  // ==================================================
  // Element References
  // ==================================================
  var scene = document.getElementById('scene');
  var header = document.getElementById('sceneHeader');
  var bgGlow = document.getElementById('bgGlow');
  var pillsWrap = document.getElementById('pillsWrap');
  var truckDots = document.getElementById('truckDots');
  var connLinesSvg = document.getElementById('connLinesSvg');
  var instruction = document.getElementById('instructionText');
  var filmGrain = document.getElementById('filmGrain');
  var introText = document.getElementById('introText');
  if (!introText) {
    introText = document.createElement('div');
    introText.id = 'introText';
    introText.className = 'intro-text';
    introText.innerHTML = '<div class="intro-main">The completed journey generates operational intelligence.</div><div class="intro-sub">The platform continuously learns through:</div>';
    scene.appendChild(introText);
  }

  var states = sc8.querySelectorAll('.st');
  var highways = sc8.querySelectorAll('.hw');
  var cityDots = sc8.querySelectorAll('.city-dot');
  var cityLabels = sc8.querySelectorAll('.city-label');
  var indiaMap = sc8.querySelector('.india-map');
  var cards = sc8.querySelectorAll('.intel-card');
  var statsRow = document.getElementById('statsRow');
  var megaHeadline = document.getElementById('megaHeadline');
  prepText(megaHeadline);  /* pre-split; wrapper opacity stays scrub-driven */
  var sc8MegaFired = false;
  var closingSection = document.getElementById('closingSection');
  var barHeights = [18, 26, 14, 22, 10];

  // ── NETWORK → WORDS overlays (over the map; converge → headline) ──
  var ucOverlays = sc8.querySelectorAll('.uc-ov');
  var ucNums = sc8.querySelectorAll('.uc-num');
  var ucRing = sc8.querySelector('.uc-ring-fg');
  var ucRingP = ucRing ? parseFloat(ucRing.dataset.p) : 87;
  gsap.set(ucOverlays, { opacity: 0, scale: 0.92, y: 16 });
  gsap.set('#sc8-root .uc-viz-bars rect', { scaleY: 0 });
  gsap.set('#sc8-root .uc-prog', { scaleX: 0 });
  if (ucRing) gsap.set(ucRing, { strokeDasharray: ucRingP + ' 100', strokeDashoffset: ucRingP });
  gsap.set('#sc8-root .uc-spark', { strokeDasharray: 100, strokeDashoffset: 100 });
  gsap.set('#sc8-root .uc-viz-dots span', { opacity: 0, scale: 0.4, transformOrigin: 'center' });
  function ucDX(el){ var s = scene.getBoundingClientRect(), r = el.getBoundingClientRect(); return (s.left + s.width / 2) - (r.left + r.width / 2); }
  function ucDY(el){ var s = scene.getBoundingClientRect(), r = el.getBoundingClientRect(); return (s.top + s.height / 2) - (r.top + r.height / 2); }

  // ==================================================
  // ANIMATED TRUCKS ON HIGHWAYS
  // ==================================================
  var svgEl = sc8.querySelector('.india-map svg');
  var truckGroups = [];

  if (svgEl) {
    var defsEl = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defsEl.innerHTML = '<filter id="cityGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    svgEl.prepend(defsEl);

    // Build road casing (under) + dashed centre lane (over) for each highway,
    // so the .hw paths read as proper highways rather than thin lines.
    var hwGroup = sc8.querySelector('#highways');
    if (hwGroup) {
      var casingsFrag = document.createDocumentFragment();
      var lanesFrag = document.createDocumentFragment();
      highways.forEach(function(hw, i){
        var d = hw.getAttribute('d');
        var c = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        c.setAttribute('class', 'hw-casing'); c.setAttribute('d', d); casingsFrag.appendChild(c);
        var l = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        // Every other corridor reads as a live/active route (amber glow).
        l.setAttribute('class', (i % 2 === 0) ? 'hw-lane hw-lane-active' : 'hw-lane');
        l.setAttribute('d', d); lanesFrag.appendChild(l);
      });
      hwGroup.insertBefore(casingsFrag, hwGroup.firstChild); // casings beneath
      hwGroup.appendChild(lanesFrag);                        // dashed lane on top
    }

    function mkRect(x, y, w, h, rx, fill) {
      var r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r.setAttribute('x', x); r.setAttribute('y', y);
      r.setAttribute('width', w); r.setAttribute('height', h);
      r.setAttribute('rx', rx); r.setAttribute('fill', fill);
      return r;
    }

    var truckIdx = 0;
    highways.forEach(function(hw, hIdx) {
      var len = hw.getTotalLength();
      if (len < 50) return;
      var truckCount = len > 400 ? 3 : 2;
      for (var t = 0; t < truckCount; t++) {
        var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        var isRed = truckIdx % 2 === 0;
        var cargo = isRed ? '#C62828' : '#E6E6E6';
        var cab   = isRed ? '#8E1B1B' : '#9AA0AC';
        // soft drop shadow
        g.appendChild(mkRect(-10.5, -6, 20, 12, 3.5, 'rgba(0,0,0,0.22)'));
        // trailer / container (top-down)
        g.appendChild(mkRect(-10, -5, 13, 10, 2, cargo));
        // cab
        g.appendChild(mkRect(3.5, -4, 6, 8, 2, cab));
        // windshield
        g.appendChild(mkRect(8, -2.8, 1.6, 5.6, 0.6, 'rgba(18,22,32,0.7)'));
        // wheels poking out both sides (top-down)
        [[-8.5, -6.2], [-8.5, 4.6], [-1.5, -6.2], [-1.5, 4.6], [5, -5.6], [5, 4.2]].forEach(function(p){
          g.appendChild(mkRect(p[0], p[1], 3, 1.6, 0.6, '#1c1c1c'));
        });
        g.dataset.pathIndex = hIdx;
        g.dataset.speed = (8 + Math.random() * 7).toFixed(2);
        g.dataset.offset = (t / truckCount).toFixed(3);
        g.style.opacity = '0.96';
        svgEl.appendChild(g);
        truckGroups.push(g);
        truckIdx++;
      }
    });

    var hwLengths = [];
    highways.forEach(function(hw) { hwLengths.push(hw.getTotalLength()); });

    var trucksActive = false;
    var truckRafId = null;
    var startTime = performance.now();
    function animateTrucks(now) {
      if (!trucksActive) { truckRafId = null; return; }
      var elapsed = (now - startTime) / 1000;
      truckGroups.forEach(function(g) {
        var idx = parseInt(g.dataset.pathIndex);
        var hw = highways[idx];
        if (!hw) return;
        var len = hwLengths[idx];
        var speed = parseFloat(g.dataset.speed);
        var offset = parseFloat(g.dataset.offset);
        var progress = ((elapsed / speed) + offset) % 1;
        var pt = hw.getPointAtLength(progress * len);
        var pt2 = hw.getPointAtLength(Math.min((progress + 0.02) * len, len));
        var angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI;
        g.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ') rotate(' + angle + ')');
      });
      truckRafId = requestAnimationFrame(animateTrucks);
    }

    var truckObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          if (!trucksActive) {
            trucksActive = true;
            startTime = performance.now();
            truckRafId = requestAnimationFrame(animateTrucks);
          }
        } else {
          trucksActive = false;
          if (truckRafId) { cancelAnimationFrame(truckRafId); truckRafId = null; }
        }
      });
    }, { rootMargin: '200px' });
    truckObserver.observe(sc8);
  }

  // ==================================================
  // MASTER TIMELINE (600vh)
  // ==================================================
  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#sc8-root .scroll-wrapper',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      pin: '#scene',
      invalidateOnRefresh: true,
    }
  });

  // PHASE A (17-27%): Clear the Stage
  // Scrolling DOWN: clear before the pills/devices fade out.
  // Scrubbing back UP to the top: re-enable the pill strip (undo the 0.25
  // pointer-events disable) and restore the default selection so you land
  // back on Conversational AI, interactive again.
  tl.call(function(){
    if (tl.scrollTrigger && tl.scrollTrigger.direction === -1) {
      pillsWrap.style.pointerEvents = '';
      if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) sc8ShowDefault();
    } else {
      clearAll();
    }
  }, null, 0.16);
  tl.to(pillsWrap, { opacity: 0, y: 20, duration: 0.04 }, 0.17)
    .to(instruction, { opacity: 0, duration: 0.03 }, 0.17)
    .to(header, { opacity: 0, y: -20, duration: 0.04 }, 0.18)
    .to(connLinesSvg, { opacity: 0, duration: 0.03 }, 0.19)
    .to(truckDots, { opacity: 0, duration: 0.04 }, 0.19)
    .to(bgGlow, { opacity: 0, duration: 0.03 }, 0.20)
    .to('#sc8-root .device-overlay', { opacity: 0, y: 30, duration: 0.04, stagger: 0.008 }, 0.17)
    .to('#sc8-root .label-tag', { opacity: 0, duration: 0.03 }, 0.17);
  tl.call(function(){ pillsWrap.style.pointerEvents = 'none'; }, null, 0.25);

  // PHASE B (27-45%): Gradient Shift
  tl.to(scene, { backgroundColor: '#1D2438', duration: 0.18 }, 0.27);
  tl.to(states, { stroke: 'rgba(255,255,255,0.25)', fill: 'rgba(255,255,255,0.03)', duration: 0.18 }, 0.27)
    .to(highways, { stroke: '#6e768a', duration: 0.18 }, 0.27)
    .to(cityDots, { fill: '#D73030', duration: 0.18 }, 0.27)
    .to(cityLabels, { fill: '#F2F0EB', duration: 0.18 }, 0.27);
  tl.to(filmGrain, { opacity: 0.03, duration: 0.12 }, 0.33);

  // PHASE C (40-58%): intro text + the six viz overlays reveal over the map
  tl.to(indiaMap, { scale: 0.88, duration: 0.05 }, 0.40);
  tl.to(introText, { opacity: 1, duration: 0.05 }, 0.40);
  tl.to('#sc8-root .uc-ov', { opacity: 1, scale: 1, y: 0, duration: 0.05, stagger: 0.012, ease: 'expo.out' }, 0.42);
  tl.to('#sc8-root .uc-viz-bars rect', { scaleY: 1, duration: 0.05, stagger: 0.004, ease: 'power3.out' }, 0.45);
  tl.to('#sc8-root .uc-prog', { scaleX: 1, duration: 0.06, ease: 'power3.out' }, 0.45);
  if (ucRing) tl.to(ucRing, { strokeDashoffset: 0, duration: 0.07, ease: 'power2.out' }, 0.45);
  tl.to('#sc8-root .uc-spark', { strokeDashoffset: 0, duration: 0.07, ease: 'power2.out' }, 0.45);
  tl.to('#sc8-root .uc-viz-dots span', { opacity: 1, scale: 1, duration: 0.04, stagger: 0.008, ease: 'power3.out' }, 0.46);
  ucNums.forEach(function(el, i) {
    var dec = el.dataset.decimal ? parseInt(el.dataset.decimal, 10) : 0;
    var sfx = el.dataset.suffix || '';
    var obj = { v: 0 };
    tl.to(obj, {
      v: parseFloat(el.dataset.target), duration: 0.07, ease: 'power1.out',
      onUpdate: function() { el.textContent = (dec ? obj.v.toFixed(dec) : Math.round(obj.v).toLocaleString('en-US')) + sfx; }
    }, 0.43 + i * 0.006);
  });

  // PHASE D (60-80%): intro out · overlays converge to centre · map dims
  tl.to(introText, { opacity: 0, y: -20, duration: 0.04 }, 0.60);
  ucOverlays.forEach(function(ov) {
    tl.to(ov, { x: function(){ return ucDX(ov); }, y: function(){ return ucDY(ov); }, scale: 0.3, opacity: 0, duration: 0.16, ease: 'power2.in' }, 0.62);
  });
  tl.to(indiaMap, { opacity: 0.16, scale: 0.84, duration: 0.18, ease: 'power2.inOut' }, 0.62);

  // PHASE E (78-96%): the words form in the centre (solid white)
  tl.to(megaHeadline, { opacity: 1, duration: 0.04 }, 0.78);
  /* Letter reveal fires once on the way DOWN; re-arms on the way UP so a
     second scroll-down replays it. */
  tl.call(function(){
    var dir = tl.scrollTrigger ? tl.scrollTrigger.direction : 1;
    if(dir === 1){ if(!sc8MegaFired){ sc8MegaFired = true; revealChars(megaHeadline); } }
    else { sc8MegaFired = false; prepText(megaHeadline); }
  }, null, 0.79);

  // ── CLOSING FINALE: headline out → "Connected. Verified. Resolved." (one line) → brand · tagline · CTA ──
  tl.to(megaHeadline, { opacity: 0, y: -16, duration: 0.03 }, 0.84);
  tl.to(indiaMap, { opacity: 0.08, duration: 0.04 }, 0.84);
  if (truckGroups && truckGroups.length) tl.to(truckGroups, { opacity: 0.2, duration: 0.04 }, 0.84);
  tl.call(function(){ if (closingSection) closingSection.classList.remove('cs-active'); }, null, 0.84);
  tl.to(closingSection, { opacity: 1, duration: 0.02 }, 0.85);
  tl.call(function(){ if (closingSection) closingSection.classList.add('cs-active'); }, null, 0.85);
  tl.to('#cw1', { opacity: 1, y: 0, duration: 0.03, ease: 'power3.out' }, 0.86);
  tl.to('#cw2', { opacity: 1, y: 0, duration: 0.03, ease: 'power3.out' }, 0.885);
  tl.to('#cw3', { opacity: 1, y: 0, duration: 0.03, ease: 'power3.out' }, 0.91);
  tl.to('#closingBrand', { opacity: 1, y: 0, duration: 0.025, ease: 'power2.out' }, 0.94);
  tl.to('#closingTagline', { opacity: 1, y: 0, duration: 0.025, ease: 'power2.out' }, 0.965);
  tl.to('#closingCta', { opacity: 1, y: 0, duration: 0.025, ease: 'power2.out' }, 0.985);
  tl.to({}, { duration: 0.01 }, 1.0);
})();
