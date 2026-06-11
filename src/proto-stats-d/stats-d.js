/* ══════════════════════════════════════════════════════════════
   stats-d.js — Prototype D · "Innovation Report" (Bidwells-inspired)
   IntersectionObserver reveals (robust to Lenis + font reflow) with
   Bidwells-style animated count-ups, a drawing donut, growing bar
   columns and route bars. Crimson wash scrubbed across scroll.
══════════════════════════════════════════════════════════════ */
(function () {
  var root = document.getElementById('psd');
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
    g.to(obj, { v: target, duration: 1.25, ease: 'power1.out', onUpdate: function () { paint(el, obj.v); } });
  }
  function countIn(scope) { scope.querySelectorAll('.psd-num').forEach(countUp); }

  if (reduce) {
    root.querySelectorAll('.psd-num').forEach(function (el) { paint(el, parseFloat(el.dataset.target)); });
    g.set('.psd-head > *, .psd-thesis, .psd-card, .psd-feature, .psd-bar, [data-fleet] .psd-fleet-hero, [data-fleet] .psd-fleet-right, .psd-synth-sub, .psd-stat, .psd-mega', { opacity: 1, y: 0 });
    g.set('.psd-bar-fill', { scaleY: 1 });
    g.set('.psd-route-fill', { scaleX: 1 });
    g.set('.psd-donut-fg', { strokeDashoffset: 0 });
    g.set('.psd-warm', { opacity: 0.5 });
    return;
  }

  /* ── initial states ── */
  g.set('.psd-head > *', { opacity: 0, y: 26 });
  g.set('.psd-thesis', { opacity: 0, y: 26 });
  g.set('.psd-card', { opacity: 0, y: 30 });
  g.set('.psd-feature', { opacity: 0, y: 28 });
  g.set('.psd-donut-fg', { strokeDashoffset: 94.2 });
  g.set('[data-bars-section] .psd-bar', { opacity: 0, y: 20 });
  g.set('.psd-bar-fill', { scaleY: 0 });
  g.set('[data-fleet] .psd-fleet-hero, [data-fleet] .psd-fleet-right', { opacity: 0, y: 22 });
  g.set('.psd-route-fill', { scaleX: 0 });
  g.set('.psd-synth-sub, .psd-stat', { opacity: 0, y: 24 });
  g.set('.psd-mega', { opacity: 0, y: 32 });

  function revealHead() { g.to('.psd-head > *', { opacity: 1, y: 0, duration: 0.9, stagger: 0.09, ease: 'expo.out' }); }
  function revealThesis() { g.to('.psd-thesis', { opacity: 1, y: 0, duration: 1.0, ease: 'expo.out' }); }
  function revealCards(scope) {
    g.to('.psd-card', { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'expo.out' });
    countIn(scope);
  }
  function revealFeature(scope) {
    g.to('.psd-feature', { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' });
    g.to('.psd-donut-fg', { strokeDashoffset: 0, duration: 1.4, ease: 'power2.out', delay: 0.15 });
    countIn(scope);
  }
  function revealBars(scope) {
    g.to(scope.querySelectorAll('.psd-bar'), { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'expo.out' });
    g.to(scope.querySelectorAll('.psd-bar-fill'), { scaleY: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: 0.1 });
    countIn(scope);
  }
  function revealFleet(scope) {
    g.to(scope.querySelectorAll('.psd-fleet-hero, .psd-fleet-right'), { opacity: 1, y: 0, duration: 0.85, stagger: 0.12, ease: 'expo.out' });
    g.to(scope.querySelectorAll('.psd-route-fill'), { scaleX: 1, duration: 0.9, stagger: 0.06, ease: 'power3.out', delay: 0.3 });
    countIn(scope);
  }
  function revealSynth(scope) {
    g.to('.psd-synth-sub', { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' });
    g.to('.psd-stat', { opacity: 1, y: 0, duration: 0.85, delay: 0.12, stagger: 0.09, ease: 'expo.out' });
    countIn(scope);
  }
  function revealFinale() { g.to('.psd-mega', { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out' }); }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; io.unobserve(el);
      if (el.classList.contains('psd-head')) revealHead();
      else if (el.dataset.thesis !== undefined) revealThesis();
      else if (el.classList.contains('psd-cards')) revealCards(el);
      else if (el.dataset.feature !== undefined) revealFeature(el);
      else if (el.dataset.barsSection !== undefined) revealBars(el);
      else if (el.dataset.fleet !== undefined) revealFleet(el);
      else if (el.dataset.synth !== undefined) revealSynth(el);
      else if (el.dataset.finale !== undefined) revealFinale();
    });
  }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });

  ['.psd-head', '[data-thesis]', '.psd-cards', '[data-feature]', '[data-bars-section]', '[data-fleet]', '[data-synth]', '[data-finale]']
    .forEach(function (sel) { var el = root.querySelector(sel); if (el) io.observe(el); });

  /* ── crimson wash scrubbed across the section ── */
  g.to('.psd-warm', {
    opacity: 0.85, ease: 'none',
    scrollTrigger: { trigger: '#psd', start: 'top top', end: 'bottom bottom', scrub: 0.6 },
  });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
  window.addEventListener('load', function () { ST.refresh(); });
})();
