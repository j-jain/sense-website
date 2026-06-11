/* ══════════════════════════════════════════════════════════════
   stats-b.js — Prototype B · "Network → Words"
   A pinned, scroll-scrubbed stage: (1) the map + six viz overlays
   reveal with count-ups and viz draw-ins, (2) the overlays converge to
   the centre and dissolve while the map dims, (3) the headline forms in
   the centre, its letters gradient-filled by the overlay palette.
   Desktop = pinned timeline; mobile / reduced-motion = static stack.
══════════════════════════════════════════════════════════════ */
(function () {
  var root = document.getElementById('psb');
  if (!root) return;

  var g = window.gsap;
  var ST = window.ScrollTrigger;
  var stage = document.getElementById('psb-stage');
  var mega = document.getElementById('psb-mega');
  var ring = root.querySelector('.psb-ring-fg');
  var ringP = ring ? parseFloat(ring.dataset.p) : 87;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia('(max-width:768px)').matches;

  /* ── numbers ── */
  function fmt(v, d) { return d ? v.toFixed(d) : Math.round(v).toLocaleString('en-US'); }
  function paint(el, v) {
    var dec = el.dataset.decimal ? parseInt(el.dataset.decimal, 10) : 0;
    el.textContent = fmt(v, dec) + (el.dataset.suffix || '');
  }

  /* ── split the headline into word spans ── */
  if (mega && !mega.dataset.split) {
    var words = mega.textContent.trim().split(/\s+/);
    mega.textContent = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span');
      s.className = 'psb-word';
      s.textContent = w;
      mega.appendChild(s);
      if (i < words.length - 1) mega.appendChild(document.createTextNode(' '));
    });
    mega.dataset.split = '1';
  }

  var nums = root.querySelectorAll('.psb-num');

  /* ── static end-state (mobile / reduced motion) ── */
  if (reduce || mobile) {
    nums.forEach(function (el) { paint(el, parseFloat(el.dataset.target)); });
    g.set('.psb-ov, .psb-map', { opacity: 1, scale: 1, x: 0, y: 0 });
    g.set('.psb-viz-bars rect', { scaleY: 1 });
    g.set('.psb-prog', { scaleX: 1 });
    if (ring) g.set(ring, { strokeDasharray: ringP + ' 100', strokeDashoffset: 0 });
    g.set('.psb-spark', { strokeDasharray: 100, strokeDashoffset: 0 });
    g.set('.psb-viz-dots span', { opacity: 1, scale: 1 });
    g.set('.psb-word', { opacity: 1, yPercent: 0 });
    g.set('.psb-warm', { opacity: 0.4 });
    return;
  }

  /* ── initial (pre-scroll) states ── */
  g.set('.psb-map', { opacity: 0, scale: 0.97, transformOrigin: 'center center' });
  g.set('.psb-ov', { opacity: 0, scale: 0.92, y: 16 });
  g.set('.psb-viz-bars rect', { scaleY: 0 });
  g.set('.psb-prog', { scaleX: 0 });
  if (ring) g.set(ring, { strokeDasharray: ringP + ' 100', strokeDashoffset: ringP });
  g.set('.psb-spark', { strokeDasharray: 100, strokeDashoffset: 100 });
  g.set('.psb-viz-dots span', { opacity: 0, scale: 0.4, transformOrigin: 'center' });
  g.set('.psb-word', { opacity: 0, yPercent: 60 });
  g.set('.psb-warm', { opacity: 0 });

  /* ── converge deltas (overlay rest-centre → stage centre) ── */
  function dX(el) { var s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(); return (s.left + s.width / 2) - (r.left + r.width / 2); }
  function dY(el) { var s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(); return (s.top + s.height / 2) - (r.top + r.height / 2); }

  /* ── master pinned timeline ── */
  var tl = g.timeline({
    scrollTrigger: {
      trigger: '.psb-scroll', start: 'top top', end: 'bottom bottom',
      scrub: 0.6, pin: '.psb-stage', invalidateOnRefresh: true,
    },
  });

  /* (1) reveal */
  tl.to('.psb-map', { opacity: 1, scale: 1, duration: 0.12, ease: 'power2.out' }, 0);
  tl.to('.psb-ov', { opacity: 1, scale: 1, y: 0, duration: 0.16, stagger: 0.03, ease: 'power3.out' }, 0.05);
  tl.to('.psb-viz-bars rect', { scaleY: 1, duration: 0.16, stagger: 0.015, ease: 'power3.out' }, 0.12);
  tl.to('.psb-prog', { scaleX: 1, duration: 0.18, ease: 'power3.out' }, 0.12);
  if (ring) tl.to(ring, { strokeDashoffset: 0, duration: 0.24, ease: 'power2.out' }, 0.12);
  tl.to('.psb-spark', { strokeDashoffset: 0, duration: 0.24, ease: 'power2.out' }, 0.12);
  tl.to('.psb-viz-dots span', { opacity: 1, scale: 1, duration: 0.12, stagger: 0.03, ease: 'power3.out' }, 0.16);
  nums.forEach(function (el, i) {
    var o = { v: 0 };
    tl.to(o, { v: parseFloat(el.dataset.target), duration: 0.2, ease: 'power1.out', onUpdate: function () { paint(el, o.v); } }, 0.10 + i * 0.012);
  });

  /* (2) converge + dim */
  root.querySelectorAll('.psb-ov').forEach(function (ov) {
    tl.to(ov, { x: function () { return dX(ov); }, y: function () { return dY(ov); }, scale: 0.3, opacity: 0, duration: 0.26, ease: 'power2.in' }, 0.46);
  });
  tl.to('.psb-map', { opacity: 0.16, scale: 1.05, duration: 0.26, ease: 'power2.inOut' }, 0.46);
  tl.to('.psb-warm', { opacity: 0.75, duration: 0.30, ease: 'none' }, 0.44);

  /* (3) form the words */
  tl.to('.psb-word', { opacity: 1, yPercent: 0, duration: 0.22, stagger: 0.04, ease: 'expo.out' }, 0.68);
  tl.to('.psb-mega', { filter: 'drop-shadow(0 0 80px rgba(215,48,48,0.4))', duration: 0.2, ease: 'power2.out' }, 0.74);
  tl.to({}, { duration: 0.06 }, 0.96);

  /* recompute once the DENSO fonts settle layout */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
  window.addEventListener('load', function () { ST.refresh(); });
})();
