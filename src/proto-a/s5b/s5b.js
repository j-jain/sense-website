/* ══════════════════════════════════════════
   PROTO A · 5B — Service Network timeline.
   Paused timeline on window.__s5Timelines.s5b. Map reveals, radar finds
   service points, candidates are weighed, Ahmedabad CDC is selected and
   the reroute is drawn + locked. Timer maps progress → 01:30…02:42.
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

  var card = $('#s5b-card'), headline = $('#s5b-headline'), grid = $('#s5b-grid'), land = $('#s5b-land');
  var truck = $('#s5b-truck'), truckRing = $('.pa5b-truck-ring', truck), radar = $('#s5b-radar');
  var nodes = $$('#s5b-map .pa5b-node');
  var rOrig = $('#s5b-rOrig'), rDet = $('#s5b-rDet'), rAft = $('#s5b-rAft');
  var detail = $('#s5b-detail'), drows = $$('#s5b-detail .pa5b-drow');
  var lock = $('#s5b-lock'), lockTxt = $('.pa5b-lock-txt', lock), lockIco = $('.pa5b-lock-ico', lock);
  var footmeta = $('#s5b-footmeta'), destChip = $('#s5b-dest-chip');
  var topStatus = $('#s5b-topstatus'), topTxt = $('.pa5b-status-txt', topStatus);

  var detLen = rDet ? rDet.getTotalLength() : 0;

  /* Perpetual truck-ring pulse — runs as its OWN tween (real-time), never
     added to the scrubbed timeline, so the timeline keeps a finite duration
     and the autoplay's onComplete fires. */
  var truckPulse = null;
  function startTruckPulse() {
    if (truckPulse) truckPulse.kill();
    g.set(truckRing, { attr: { r: 6 }, opacity: 0.9 });
    truckPulse = g.to(truckRing, { attr: { r: 16 }, opacity: 0, duration: 1.1, repeat: -1, ease: 'power1.out' });
  }

  function reset() {
    if (truckPulse) { truckPulse.kill(); truckPulse = null; }
    g.set(card, { opacity: 0, scale: 0.965 });
    g.set(headline, { opacity: 0 });
    g.set([grid, land], { opacity: 0 });
    g.set(nodes, { opacity: 0 });
    g.set(truck, { opacity: 0 });
    g.set(radar, { attr: { r: 0 }, opacity: 0 });
    g.set(rOrig, { opacity: 0 });
    g.set(rAft, { opacity: 0 });
    g.set(rDet, { opacity: 0, strokeDasharray: detLen, strokeDashoffset: detLen });
    g.set(detail, { opacity: 0, x: -22 });
    g.set(drows, { opacity: 0, y: 6 });
    nodes.forEach(function (n) {
      g.set($('.pa5b-dot', n), { attr: { r: 3 }, fill: '#5A6076', filter: 'none' });
      g.set($('.pa5b-nl', n), { opacity: 0 });
      var rl = $('.pa5b-rl', n); if (rl) g.set(rl, { opacity: 0 });
    });
    lock.classList.remove('locked'); if (lockTxt) lockTxt.textContent = 'Locking route'; if (lockIco) lockIco.textContent = '▸';
    destChip.classList.remove('locked'); destChip.textContent = 'Locating…';
    topStatus.classList.remove('locked'); if (topTxt) topTxt.textContent = 'Rerouting';
    if (footmeta) footmeta.textContent = 'Evaluating 4 capable service points…';
  }

  var tl = g.timeline({
    paused: true,
    onUpdate: function () { if (timer) timer.textContent = fmt(90 + this.progress() * 72); }
  });

  tl.add(reset, 0);

  /* card expands in + headline */
  tl.to(card, { opacity: 1, scale: 1, duration: 0.16, ease: 'power3.out' }, 0.02);
  tl.to(headline, { opacity: 0.5, duration: 0.14 }, 0.08);

  /* map fabric */
  tl.to([grid, land], { opacity: 1, duration: 0.14, stagger: 0.04 }, 0.14);

  /* truck appears + perpetual ring pulse (independent tween) */
  tl.to(truck, { opacity: 1, duration: 0.08 }, 0.20);
  tl.add(startTruckPulse, 0.22);

  /* original heading draws (dim, dashed) */
  tl.to(rOrig, { opacity: 1, duration: 0.12 }, 0.24);

  /* radar sweep — two expanding pulses from the truck */
  tl.fromTo(radar, { attr: { r: 0 }, opacity: 0.5 }, { attr: { r: 150 }, opacity: 0, duration: 0.34, ease: 'power1.out' }, 0.26);
  tl.fromTo(radar, { attr: { r: 0 }, opacity: 0.4 }, { attr: { r: 150 }, opacity: 0, duration: 0.34, ease: 'power1.out' }, 0.34);

  /* nodes ripple in (closest first) */
  nodes.forEach(function (n, i) { tl.to(n, { opacity: 1, duration: 0.06 }, 0.28 + i * 0.018); });

  /* candidates highlight amber + labels */
  var cands = nodes.filter(function (n) { return n.hasAttribute('data-c'); });
  cands.forEach(function (n, i) {
    tl.to($('.pa5b-dot', n), { attr: { r: 5 }, fill: '#E2A23A', duration: 0.1 }, 0.44 + i * 0.025);
    tl.to($('.pa5b-nl', n), { opacity: 1, duration: 0.1 }, 0.44 + i * 0.025);
  });
  tl.add(function () { if (footmeta) footmeta.textContent = '4 candidates · weighing SLA, parts, distance…'; }, 0.46);
  /* non-candidate context labels in softly */
  nodes.filter(function (n) { return !n.hasAttribute('data-c'); }).forEach(function (n, i) {
    tl.to($('.pa5b-nl', n), { opacity: 0.55, duration: 0.1 }, 0.48 + i * 0.02);
  });

  /* reject the non-Ahmedabad candidates (reason shows, dot dims) */
  var rejects = cands.filter(function (n) { return !n.hasAttribute('data-s'); });
  rejects.forEach(function (n, i) {
    var at = 0.56 + i * 0.04;
    var rl = $('.pa5b-rl', n);
    if (rl) tl.to(rl, { opacity: 1, duration: 0.1 }, at);
    tl.to($('.pa5b-dot', n), { attr: { r: 2.5 }, fill: '#3A3F4E', duration: 0.12 }, at + 0.02);
    tl.to($('.pa5b-nl', n), { opacity: 0.25, duration: 0.12 }, at + 0.02);
  });

  /* select Ahmedabad — red + glow */
  var sel = nodes.filter(function (n) { return n.hasAttribute('data-s'); })[0];
  if (sel) {
    tl.to($('.pa5b-dot', sel), { attr: { r: 7 }, fill: '#D73030', filter: 'url(#pa5bGlow)', duration: 0.18, ease: 'back.out(2)' }, 0.70);
    tl.add(function () { destChip.textContent = 'Ahmedabad CDC'; destChip.classList.add('locked'); }, 0.70);
  }

  /* dim the original heading further */
  tl.to(rOrig, { opacity: 0.18, duration: 0.16 }, 0.72);

  /* draw the reroute (red) */
  tl.to(rDet, { opacity: 1, duration: 0.02 }, 0.72);
  tl.to(rDet, { strokeDashoffset: 0, duration: 0.22, ease: 'power2.inOut' }, 0.72);
  /* after-service leg (dashed) */
  tl.to(rAft, { opacity: 1, duration: 0.14 }, 0.86);

  /* detail card + rows */
  tl.to(detail, { opacity: 1, x: 0, duration: 0.16, ease: 'power3.out' }, 0.80);
  tl.to(drows, { opacity: 1, y: 0, duration: 0.12, stagger: 0.03 }, 0.84);

  /* lock the route */
  tl.add(function () {
    lock.classList.add('locked'); if (lockTxt) lockTxt.textContent = 'Route Locked'; if (lockIco) lockIco.textContent = '✓';
    topStatus.classList.add('locked'); if (topTxt) topTxt.textContent = 'On Route';
    if (footmeta) footmeta.textContent = 'Route locked · 127 km · ETA 2h 14m · Ahmedabad CDC';
  }, 0.92);
  tl.to({}, { duration: 0.06 }, 0.94); /* tail to reach 02:42 */

  window.__s5Timelines.s5b = tl;
})();
