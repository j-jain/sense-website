/* ══════════════════════════════════════════════════════════════
   stats-a.js — Prototype A · "Editorial Ledger"
   Reveals are driven by IntersectionObserver (robust to Lenis + async
   DENSO-font reflow): header stagger, per-row count-up + red rule
   draw-in, synthesis stats, finale headline. ScrollTrigger drives only
   the navy→crimson colour wash (a scrub). Honors prefers-reduced-motion.
   Uses bare window.gsap / window.ScrollTrigger globals (paste-able).
══════════════════════════════════════════════════════════════ */
(function () {
  var root = document.getElementById('psa');
  if (!root) return;

  var g = window.gsap;
  var ST = window.ScrollTrigger;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── number formatting + count-up ── */
  function fmt(v, decimals) {
    if (decimals) return v.toFixed(decimals);
    return Math.round(v).toLocaleString('en-US');
  }
  function paint(el, v) {
    var dec = el.dataset.decimal ? parseInt(el.dataset.decimal, 10) : 0;
    el.textContent = fmt(v, dec) + (el.dataset.suffix || '');
  }
  function countUp(el) {
    var target = parseFloat(el.dataset.target);
    var obj = { v: 0 };
    g.to(obj, { v: target, duration: 1.15, ease: 'power1.out', onUpdate: function () { paint(el, obj.v); } });
  }

  var nums = root.querySelectorAll('.psa-num, .psa-stat-num');

  /* ── reduced motion: final state, no movement ── */
  if (reduce) {
    nums.forEach(function (el) { paint(el, parseFloat(el.dataset.target)); });
    g.set('.psa-rule', { scaleX: 1 });
    g.set('.psa-head > *, .psa-row, .psa-synth-main, .psa-synth-sub, .psa-stat, .psa-mega', { opacity: 1, y: 0 });
    g.set('.psa-warm', { opacity: 0.6 });
    return;
  }

  /* ── initial hidden states ── */
  g.set('.psa-head > *', { opacity: 0, y: 26 });
  g.set('.psa-row', { opacity: 0, y: 30 });
  g.set('.psa-rule', { scaleX: 0 });
  g.set('.psa-synth-main, .psa-synth-sub, .psa-stat', { opacity: 0, y: 26 });
  g.set('.psa-mega', { opacity: 0, y: 34 });

  function revealHeader() {
    g.to('.psa-head > *', { opacity: 1, y: 0, duration: 0.9, stagger: 0.09, ease: 'expo.out' });
  }
  function revealRow(row) {
    var num = row.querySelector('.psa-num');
    var rule = row.querySelector('.psa-rule');
    g.to(row, { opacity: 1, y: 0, duration: 0.85, ease: 'expo.out' });
    if (rule) g.to(rule, { scaleX: 1, duration: 1.05, ease: 'power3.out', delay: 0.04 });
    if (num) countUp(num);
  }
  function revealSynth() {
    g.to('.psa-synth-main', { opacity: 1, y: 0, duration: 0.85, ease: 'expo.out' });
    g.to('.psa-synth-sub', { opacity: 1, y: 0, duration: 0.85, delay: 0.1, ease: 'expo.out' });
    g.to('.psa-stat', { opacity: 1, y: 0, duration: 0.85, delay: 0.2, stagger: 0.09, ease: 'expo.out' });
    root.querySelectorAll('.psa-stat-num').forEach(countUp);
  }
  function revealFinale() {
    g.to('.psa-mega', { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out' });
  }

  /* ── IntersectionObserver: fires for already-visible AND
        scrolled-into-view elements; immune to Lenis/refresh timing ── */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      io.unobserve(el);
      if (el.classList.contains('psa-head')) revealHeader();
      else if (el.classList.contains('psa-row')) revealRow(el);
      else if (el.classList.contains('psa-synth')) revealSynth();
      else if (el.classList.contains('psa-finale')) revealFinale();
    });
  }, { threshold: 0, rootMargin: '0px 0px -15% 0px' });

  io.observe(root.querySelector('.psa-head'));
  root.querySelectorAll('.psa-row').forEach(function (r) { io.observe(r); });
  io.observe(root.querySelector('.psa-synth'));
  io.observe(root.querySelector('.psa-finale'));

  /* ── colour wash: cold navy → warm crimson, scrubbed across scroll ── */
  g.to('.psa-warm', {
    opacity: 0.9, ease: 'none',
    scrollTrigger: { trigger: '#psa', start: 'top top', end: 'bottom bottom', scrub: 0.6 },
  });

  /* ── recompute trigger positions once the DENSO fonts settle layout ── */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
  window.addEventListener('load', function () { ST.refresh(); });
})();
