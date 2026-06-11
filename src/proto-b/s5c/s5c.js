/* ══════════════════════════════════════════
   PROTO B · 5C — Split HUD Handoff timeline. window.__s5Timelines.s5c.
   Beam links the two HUDs; both boot via scan reveal; command timeline
   stamps through while the driver read resolves to "service scheduled".
   Timer → 02:42…04:12.
══════════════════════════════════════════ */
window.__s5Timelines = window.__s5Timelines || {};
(function () {
  var wrap = document.getElementById('s5c-wrapper');
  if (!wrap) return;
  wrap.style.height = '100vh';

  var g = window.gsap;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var timer = document.getElementById('running-timer');
  function fmt(sec) { var m = Math.floor(sec / 60), s = Math.round(sec % 60); return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }

  var beam = $('#s5c-beam'), beamTag = $('#s5c-beamtag'), labels = [$('#s5c-label-driver'), $('#s5c-label-fleet')];
  var driver = $('#s5c-driver'), command = $('#s5c-command'), scanL = $('#s5c-scan-l'), scanR = $('#s5c-scan-r');
  var dStatus = $('#s5c-driver-status'), dsTxt = $('#s5c-ds-txt'), dDest = $('#s5c-driver-dest'), guide = $('#s5c-guide'), comm = $$('#s5c-comm .pb5c-comm-btn');
  var incRows = $$('#s5c-incident .pb5c-row'), svcRows = $$('#s5c-service .pb5c-row');
  var tlNodes = $$('#s5c-tl .pb5c-tlnode'), tlLines = $$('#s5c-tl .pb5c-tlline');
  var headline = $('#s5c-headline');

  function reset() {
    g.set(beam, { xPercent: -50, yPercent: -50, scaleY: 0 });
    g.set(beamTag, { opacity: 0 });
    g.set(labels, { opacity: 0 });
    g.set([driver, command], { opacity: 0 });
    g.set([scanL, scanR], { opacity: 0, top: '0%' });
    g.set([dDest, guide], { opacity: 0 });
    g.set(comm, { opacity: 0, y: 6 });
    g.set(incRows, { opacity: 0, x: -6 });
    g.set(svcRows, { opacity: 0, x: -6 });
    g.set(headline, { opacity: 0 });
    dStatus.classList.remove('ok'); if (dsTxt) dsTxt.textContent = 'ANALYSING';
    tlNodes.forEach(function (n) { n.classList.remove('done', 'active'); });
    tlLines.forEach(function (l) { l.classList.remove('done'); });
  }

  function bootScan(el) { g.fromTo(el, { top: '0%', opacity: 0.9 }, { top: '100%', opacity: 0, duration: 0.22, ease: 'power1.in' }); }

  var tl = g.timeline({ paused: true, onUpdate: function () { if (timer) timer.textContent = fmt(162 + this.progress() * 90); } });
  tl.add(reset, 0);

  /* link forms */
  tl.to(labels, { opacity: 1, duration: 0.1 }, 0.03);
  tl.to(beam, { scaleY: 1, duration: 0.16, ease: 'power2.out' }, 0.04);
  tl.to(beamTag, { opacity: 1, duration: 0.12 }, 0.12);

  /* panels boot with a scan reveal */
  tl.to(command, { opacity: 1, duration: 0.12 }, 0.08);
  tl.add(function () { bootScan(scanR); }, 0.08);
  tl.to(driver, { opacity: 1, duration: 0.12 }, 0.12);
  tl.add(function () { bootScan(scanL); }, 0.12);

  /* command — incident rows */
  incRows.forEach(function (r, i) { tl.to(r, { opacity: 1, x: 0, duration: 0.1, ease: 'power2.out' }, 0.18 + i * 0.04); });
  /* driver — destination appears */
  tl.to(dDest, { opacity: 1, duration: 0.14 }, 0.24);

  /* command — service rows */
  svcRows.forEach(function (r, i) { tl.to(r, { opacity: 1, x: 0, duration: 0.1, ease: 'power2.out' }, 0.36 + i * 0.04); });

  /* command — event timeline lights in sequence (0,1,2 done · 3 active · 4 future) */
  var tAt = [0.30, 0.40, 0.50, 0.60];
  [0, 1, 2, 3].forEach(function (i) {
    tl.add(function () {
      if (tlLines[i - 1]) tlLines[i - 1].classList.add('done');
      var n = tlNodes[i]; if (n) { n.classList.remove('active'); n.classList.add(i < 3 ? 'done' : 'active'); }
    }, tAt[i]);
  });

  /* driver — status resolves once matched + rerouted */
  tl.add(function () { dStatus.classList.add('ok'); if (dsTxt) dsTxt.textContent = 'SERVICE SCHEDULED'; }, 0.52);
  tl.to(guide, { opacity: 1, duration: 0.14 }, 0.56);
  tl.to(comm, { opacity: 1, y: 0, duration: 0.12, stagger: 0.05 }, 0.62);

  /* headline + proof-point timer pop */
  tl.to(headline, { opacity: 0.92, duration: 0.16, ease: 'power2.out' }, 0.82);
  tl.add(function () { if (timer) g.fromTo(timer, { scale: 1 }, { scale: 1.2, duration: 0.5, yoyo: true, repeat: 1, ease: 'power2.inOut', transformOrigin: '100% 50%' }); }, 0.92);
  tl.to({}, { duration: 0.06 }, 0.96);

  window.__s5Timelines.s5c = tl;
})();
