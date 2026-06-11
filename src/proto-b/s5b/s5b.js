/* ══════════════════════════════════════════
   PROTO B · 5B — Route HUD timeline. window.__s5Timelines.s5b.
   Frame boots, map reveals, radar finds points, Ahmedabad locks with
   bracket + glow, reroute draws + locks. Timer → 01:30…02:42.
══════════════════════════════════════════ */
window.__s5Timelines = window.__s5Timelines || {};
(function () {
  var wrap = document.getElementById('s5b-wrapper');
  if (!wrap) return;
  wrap.style.height = '100vh';

  var g = window.gsap;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var timer = document.getElementById('running-timer');
  function fmt(sec) { var m = Math.floor(sec / 60), s = Math.round(sec % 60); return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }

  var corners = $$('#s5b-frame .hc'), top = $('#s5b-top'), grid = $('#s5b-grid'), land = $('#s5b-land');
  var truck = $('#s5b-truck'), truckRing = $('.pb5b-truck-ring', truck), radar = $('#s5b-radar');
  var nodes = $$('#s5b-map .pb5b-node');
  var rOrig = $('#s5b-rOrig'), rDet = $('#s5b-rDet'), rAft = $('#s5b-rAft');
  var panel = $('#s5b-detail'), prows = $$('#s5b-detail .pb5b-prow'), bracket = $('#s5b-bracket');
  var lock = $('#s5b-lock'), lockTxt = $('.pb5b-lock-txt', lock), lockIco = $('.pb5b-lock-ico', lock);
  var footmeta = $('#s5b-footmeta'), destChip = $('#s5b-dest-chip');
  var topStatus = $('#s5b-topstatus'), topTxt = $('.pb5b-status-txt', topStatus);
  var detLen = rDet ? rDet.getTotalLength() : 0;

  var truckPulse = null;
  function startTruckPulse() {
    if (truckPulse) truckPulse.kill();
    g.set(truckRing, { attr: { r: 6 }, opacity: 0.9 });
    truckPulse = g.to(truckRing, { attr: { r: 16 }, opacity: 0, duration: 1.1, repeat: -1, ease: 'power1.out' });
  }

  function reset() {
    if (truckPulse) { truckPulse.kill(); truckPulse = null; }
    g.set(corners, { opacity: 0, scale: 0.6 });
    g.set([top, grid, land], { opacity: 0 });
    g.set(nodes, { opacity: 0 });
    g.set(truck, { opacity: 0 });
    g.set(radar, { attr: { r: 0 }, opacity: 0 });
    g.set([rOrig, rAft], { opacity: 0 });
    g.set(rDet, { opacity: 0, strokeDasharray: detLen, strokeDashoffset: detLen });
    g.set(panel, { opacity: 0, x: 18 });
    g.set(prows, { opacity: 0, y: 5 });
    g.set(bracket, { opacity: 0 });
    nodes.forEach(function (n) {
      g.set($('.pb5b-dot', n), { attr: { r: 3 }, fill: '#6E7283', filter: 'none' });
      g.set($('.pb5b-nl', n), { opacity: 0 });
      var rl = $('.pb5b-rl', n); if (rl) g.set(rl, { opacity: 0 });
    });
    lock.classList.remove('locked'); if (lockTxt) lockTxt.textContent = 'LOCKING ROUTE'; if (lockIco) lockIco.textContent = '▸';
    destChip.classList.remove('locked'); destChip.textContent = 'LOCATING…';
    topStatus.classList.remove('locked'); if (topTxt) topTxt.textContent = 'REROUTING';
    if (footmeta) footmeta.textContent = 'EVALUATING 4 SERVICE POINTS…';
  }

  var tl = g.timeline({ paused: true, onUpdate: function () { if (timer) timer.textContent = fmt(90 + this.progress() * 72); } });
  tl.add(reset, 0);

  /* frame + strip boot */
  tl.to(corners, { opacity: 1, scale: 1, duration: 0.12, stagger: 0.03, ease: 'back.out(2)' }, 0.02);
  tl.to(top, { opacity: 1, duration: 0.14 }, 0.06);
  tl.to([grid, land], { opacity: 1, duration: 0.14, stagger: 0.04 }, 0.10);

  /* truck + pulse */
  tl.to(truck, { opacity: 1, duration: 0.08 }, 0.18);
  tl.add(startTruckPulse, 0.20);
  tl.to(rOrig, { opacity: 1, duration: 0.12 }, 0.22);

  /* radar */
  tl.fromTo(radar, { attr: { r: 0 }, opacity: 0.55 }, { attr: { r: 160 }, opacity: 0, duration: 0.34, ease: 'power1.out' }, 0.24);
  tl.fromTo(radar, { attr: { r: 0 }, opacity: 0.4 }, { attr: { r: 160 }, opacity: 0, duration: 0.34, ease: 'power1.out' }, 0.32);

  /* nodes ripple */
  nodes.forEach(function (n, i) { tl.to(n, { opacity: 1, duration: 0.06 }, 0.26 + i * 0.018); });

  /* candidates amber */
  var cands = nodes.filter(function (n) { return n.hasAttribute('data-c'); });
  cands.forEach(function (n, i) {
    tl.to($('.pb5b-dot', n), { attr: { r: 5 }, fill: '#F5A623', duration: 0.1 }, 0.44 + i * 0.025);
    tl.to($('.pb5b-nl', n), { opacity: 1, duration: 0.1 }, 0.44 + i * 0.025);
  });
  tl.add(function () { if (footmeta) footmeta.textContent = '4 CANDIDATES · WEIGHING SLA · PARTS · DISTANCE'; }, 0.46);
  nodes.filter(function (n) { return !n.hasAttribute('data-c'); }).forEach(function (n, i) { tl.to($('.pb5b-nl', n), { opacity: 0.5, duration: 0.1 }, 0.48 + i * 0.02); });

  /* reject */
  var rejects = cands.filter(function (n) { return !n.hasAttribute('data-s'); });
  rejects.forEach(function (n, i) {
    var at = 0.56 + i * 0.04, rl = $('.pb5b-rl', n);
    if (rl) tl.to(rl, { opacity: 1, duration: 0.1 }, at);
    tl.to($('.pb5b-dot', n), { attr: { r: 2.5 }, fill: '#2A2E3A', duration: 0.12 }, at + 0.02);
    tl.to($('.pb5b-nl', n), { opacity: 0.2, duration: 0.12 }, at + 0.02);
  });

  /* select Ahmedabad — red glow + bracket */
  var sel = nodes.filter(function (n) { return n.hasAttribute('data-s'); })[0];
  if (sel) {
    tl.to($('.pb5b-dot', sel), { attr: { r: 6 }, fill: '#D73030', filter: 'url(#pb5bGlow)', duration: 0.16, ease: 'back.out(2)' }, 0.70);
    tl.fromTo(bracket, { opacity: 0, scale: 1.3, svgOrigin: '184 280' }, { opacity: 1, scale: 1, duration: 0.2, ease: 'back.out(2)' }, 0.70);
    tl.add(function () { destChip.textContent = 'AHMEDABAD CDC'; destChip.classList.add('locked'); }, 0.70);
  }

  /* reroute draw */
  tl.to(rOrig, { opacity: 0.16, duration: 0.16 }, 0.72);
  tl.to(rDet, { opacity: 1, duration: 0.02 }, 0.72);
  tl.to(rDet, { strokeDashoffset: 0, duration: 0.22, ease: 'power2.inOut' }, 0.72);
  tl.to(rAft, { opacity: 1, duration: 0.14 }, 0.86);

  /* panel */
  tl.to(panel, { opacity: 1, x: 0, duration: 0.16, ease: 'power3.out' }, 0.80);
  tl.to(prows, { opacity: 1, y: 0, duration: 0.12, stagger: 0.03 }, 0.84);

  /* lock */
  tl.add(function () {
    lock.classList.add('locked'); if (lockTxt) lockTxt.textContent = 'ROUTE LOCKED'; if (lockIco) lockIco.textContent = '✓';
    topStatus.classList.add('locked'); if (topTxt) topTxt.textContent = 'ON ROUTE';
    if (footmeta) footmeta.textContent = 'ROUTE LOCKED · 127 KM · ETA 02:14 · AHMEDABAD CDC';
  }, 0.92);
  tl.to({}, { duration: 0.06 }, 0.94);

  window.__s5Timelines.s5b = tl;
})();
