/* ══════════════════════════════════════════════════════════════
   PROTO · 5A — "Blueprint Scan" timeline.
   Paused GSAP timeline on window.__s5Timelines.s5a; the autoplay sequencer
   stretches it via timeScale (~0.085). Internal tween-time ≈1s; the running
   timer maps progress → 00:00…01:30. reset() re-applies every initial state
   so restart(0) replays cleanly.

   Sequence: the mechanical blueprint is PRESENT FIRST (fades in fully, holds),
   THEN a scan bar sweeps left→right OVER it. As it crosses the front COOLING
   pack, the part lines IGNITE red + a thin locator ring pulses + a callout
   appears — in sync with the red Coolant cube + flagged row. Then the stage
   pans left toward the "Service Network →" teaser (hand-off to 5B).
   Animations are opacity/transform/class only (GPU-safe — no clip-path tween,
   no blend modes, no SVG filters).
══════════════════════════════════════════════════════════════ */
window.__s5Timelines = window.__s5Timelines || {};
(function () {
  var root = document.getElementById('s5a');
  if (!root) return;

  var g = window.gsap;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var isMobile = function () { return window.matchMedia('(max-width:768px)').matches; };

  var timer = document.getElementById('running-timer');
  function fmt(sec) { var m = Math.floor(sec / 60), s = Math.round(sec % 60); return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }

  /* ── elements ── */
  var stage   = $('#s5a-stage');
  var eyebrow = $('.s5a-eyebrow');
  var title   = $('#s5a-title');
  var pill    = $('#s5a-pill');
  var rows    = $$('#s5a-status .s5a-strow');
  var coolRow = $('#s5a-st-cooling');
  var analyze = $('#s5a-analyze');
  var anTxt   = $('#s5a-an-txt');
  var result  = $('#s5a-result');
  var conf    = $('#s5a-conf');
  var cubes   = $$('#s5a-cubes .s5a-cube');
  var coolCube= $('#s5a-cube-coolant');
  var coolCubeSub = coolCube ? $('.s5a-cube-sub', coolCube) : null;
  var truck   = $('#s5a-truck');
  var part    = $('#s5a-part');
  var partRing= $('#s5a-part-ring');
  var scan    = $('#s5a-scan');
  var callout = $('#s5a-callout');
  var pins    = $$('#s5a-pins .s5a-pin');
  var handoff = $('#s5a-handoff');

  /* ── split DIAGNOSTIC into per-letter spans (once) ── */
  var chars = [];
  if (title && !title.dataset.split) {
    var text = title.textContent;
    title.textContent = '';
    text.split('').forEach(function (c) {
      var span = document.createElement('span');
      span.className = 's5a-ch';
      span.textContent = c;
      title.appendChild(span);
      chars.push(span);
    });
    title.dataset.split = '1';
  } else if (title) {
    chars = $$('.s5a-ch', title);
  }

  function setPill(txt, done) {
    if (!pill) return;
    pill.classList.toggle('done', !!done);
    var t = $('.s5a-pill-txt', pill);
    if (t) t.textContent = txt;
  }

  function reset() {
    g.set(stage, { x: 0 });
    g.set(eyebrow, { opacity: 0, y: 8 });
    g.set(title, { opacity: 1 });
    g.set(chars, { opacity: 0, yPercent: 60 });
    g.set(rows, { opacity: 0, y: 10 });
    g.set(analyze, { opacity: 0, y: 8 });
    if (analyze) analyze.classList.remove('done');
    if (anTxt) anTxt.textContent = 'AI Analyzes';
    g.set(result, { opacity: 0, y: 10 });
    if (conf) conf.textContent = '0';
    g.set(cubes, { opacity: 0, y: 12 });
    g.set(truck, { opacity: 0, scale: 1 });           /* blueprint hidden until the intro */
    g.set(scan, { opacity: 0, left: '-14%' });
    g.set(callout, { opacity: 0, x: -8 });
    g.set(partRing, { opacity: 0, scale: 1 });
    g.set(pins, { opacity: 0, y: 6 });
    g.set(handoff, { opacity: 0 });
    if (part) part.classList.remove('ignited');
    if (coolRow) coolRow.classList.remove('flagged');
    if (coolCube) coolCube.classList.remove('bad');
    if (coolCubeSub) coolCubeSub.textContent = 'Good';
    setPill('Scanning', false);
  }

  var tl = g.timeline({
    paused: true,
    onStart: reset,   /* fires on every restart() — clears one-way toggles for clean Replay */
    onUpdate: function () { if (timer) timer.textContent = fmt(this.progress() * 90); }
  });

  tl.add(reset, 0);

  /* — panel entry — */
  tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.08 }, 0.02);
  tl.to(chars, { opacity: 1, yPercent: 0, duration: 0.06, stagger: 0.012, ease: 'power3.out' }, 0.05);

  /* — the blueprint APPEARS FULLY FIRST (truck + dimensions fade in together) — */
  tl.fromTo(truck, { opacity: 0, scale: 0.992 }, { opacity: 1, scale: 1, duration: 0.16, ease: 'power2.out' }, 0.06);

  tl.to(rows, { opacity: 1, y: 0, duration: 0.08, stagger: 0.04, ease: 'power3.out' }, 0.16);
  tl.to(cubes, { opacity: 1, y: 0, duration: 0.07, stagger: 0.025, ease: 'power3.out' }, 0.22);
  tl.to(pins, { opacity: 1, y: 0, duration: 0.08, stagger: 0.05 }, 0.28);
  /* (0.22 → 0.34 the drawing simply holds — clearly present — before the scan) */

  /* — the scan bar sweeps left→right OVER the present drawing — */
  tl.to(scan, { opacity: 1, duration: 0.03 }, 0.34);
  tl.fromTo(scan, { left: '-14%' }, { left: '108%', duration: 0.40, ease: 'none' }, 0.34);

  /* — FAULT FOUND: the scan crosses the front COOLING pack (~10% across) → three reds — */
  tl.add(function () {
    if (part) part.classList.add('ignited');
    if (coolCube) coolCube.classList.add('bad');
    if (coolCubeSub) coolCubeSub.textContent = 'Create report';
    if (coolRow) coolRow.classList.add('flagged');
  }, 0.41);
  tl.fromTo(partRing, { opacity: 0.9, scale: 0.5 }, { opacity: 0, scale: 2.0, duration: 0.34, ease: 'power2.out', transformOrigin: '50% 50%' }, 0.41);
  tl.to(callout, { opacity: 1, x: 0, duration: 0.12, ease: 'power3.out' }, 0.45);

  /* — scan completes, AI takes over — */
  tl.to(scan, { opacity: 0, duration: 0.05 }, 0.72);
  tl.to(analyze, { opacity: 1, y: 0, duration: 0.08 }, 0.70);

  /* — diagnosis resolves — */
  tl.add(function () {
    if (analyze) analyze.classList.add('done');
    if (anTxt) anTxt.textContent = 'Diagnosis complete';
    setPill('Diagnosed', true);
  }, 0.82);
  tl.to(result, { opacity: 1, y: 0, duration: 0.12, ease: 'expo.out' }, 0.83);
  tl.to({ v: 0 }, { v: 96, duration: 0.18, ease: 'power1.out',
    onUpdate: function () { if (conf) conf.textContent = Math.round(this.targets()[0].v); } }, 0.83);

  /* — handoff + sideways pan toward 5B — */
  tl.to(handoff, { opacity: 1, duration: 0.10 }, 0.90);
  tl.to(stage, {
    x: function () { return isMobile() ? 0 : -window.innerWidth * 0.30; },
    duration: 0.10, ease: 'power2.inOut'
  }, 0.95);
  tl.to({}, { duration: 0.06 }, 1.0);

  window.__s5Timelines.s5a = tl;
})();
