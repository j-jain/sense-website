/* ══════════════════════════════════════════════════════════════
   stats-c.js — Prototype C · "Intelligence Dashboard"
   IntersectionObserver reveals (robust to Lenis + font reflow):
   header, the six-tile grid (count-ups), the fault + fleet panels
   (bar/route fills draw in), synthesis, finale. Crimson wash scrubbed
   across the section. Honors prefers-reduced-motion.
══════════════════════════════════════════════════════════════ */
(function () {
  var root = document.getElementById('psc');
  if (!root) return;

  var g = window.gsap;
  var ST = window.ScrollTrigger;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fmt(v, d) { return d ? v.toFixed(d) : Math.round(v).toLocaleString('en-US'); }
  function paint(el, v) {
    var dec = el.dataset.decimal ? parseInt(el.dataset.decimal, 10) : 0;
    el.textContent = fmt(v, dec) + (el.dataset.suffix || '');
  }
  function countUp(el) {
    var target = parseFloat(el.dataset.target), obj = { v: 0 };
    g.to(obj, { v: target, duration: 1.2, ease: 'power1.out', onUpdate: function () { paint(el, obj.v); } });
  }

  var nums = root.querySelectorAll('.psc-num, .psc-stat-num');

  if (reduce) {
    nums.forEach(function (el) { paint(el, parseFloat(el.dataset.target)); });
    g.set('.psc-head > *, .psc-tile, .psc-panel, .psc-synth-main, .psc-synth-sub, .psc-stat, .psc-mega', { opacity: 1, y: 0 });
    g.set('.psc-bar-fill, .psc-route-fill', { scaleX: 1 });
    g.set('.psc-warm', { opacity: 0.5 });
    return;
  }

  /* ── initial states ── */
  g.set('.psc-head > *', { opacity: 0, y: 24 });
  g.set('.psc-tile', { opacity: 0, y: 26 });
  g.set('.psc-panel', { opacity: 0, y: 26 });
  g.set('.psc-bar-fill, .psc-route-fill', { scaleX: 0 });
  g.set('.psc-synth-main, .psc-synth-sub, .psc-stat', { opacity: 0, y: 24 });
  g.set('.psc-mega', { opacity: 0, y: 32 });

  function revealHead() {
    g.to('.psc-head > *', { opacity: 1, y: 0, duration: 0.9, stagger: 0.09, ease: 'expo.out' });
  }
  function revealGrid() {
    g.to('.psc-tile', { opacity: 1, y: 0, duration: 0.8, stagger: 0.07, ease: 'expo.out' });
    root.querySelectorAll('.psc-grid .psc-num').forEach(countUp);
  }
  function revealPanels() {
    g.to('.psc-panel', { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'expo.out' });
    g.to('.psc-bar-fill', { scaleX: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: 0.2 });
    g.to('.psc-route-fill', { scaleX: 1, duration: 0.9, stagger: 0.06, ease: 'power3.out', delay: 0.3 });
  }
  function revealSynth() {
    g.to('.psc-synth-main', { opacity: 1, y: 0, duration: 0.85, ease: 'expo.out' });
    g.to('.psc-synth-sub', { opacity: 1, y: 0, duration: 0.85, delay: 0.1, ease: 'expo.out' });
    g.to('.psc-stat', { opacity: 1, y: 0, duration: 0.85, delay: 0.2, stagger: 0.09, ease: 'expo.out' });
    root.querySelectorAll('.psc-stat-num').forEach(countUp);
  }
  function revealFinale() {
    g.to('.psc-mega', { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out' });
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; io.unobserve(el);
      if (el.classList.contains('psc-head')) revealHead();
      else if (el.classList.contains('psc-grid')) revealGrid();
      else if (el.classList.contains('psc-panels')) revealPanels();
      else if (el.classList.contains('psc-synth')) revealSynth();
      else if (el.classList.contains('psc-finale')) revealFinale();
    });
  }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });

  io.observe(root.querySelector('.psc-head'));
  io.observe(root.querySelector('.psc-grid'));
  io.observe(root.querySelector('.psc-panels'));
  io.observe(root.querySelector('.psc-synth'));
  io.observe(root.querySelector('.psc-finale'));

  /* ── crimson wash scrubbed across the section ── */
  g.to('.psc-warm', {
    opacity: 0.8, ease: 'none',
    scrollTrigger: { trigger: '#psc', start: 'top top', end: 'bottom bottom', scrub: 0.6 },
  });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
  window.addEventListener('load', function () { ST.refresh(); });
})();
