/* ══════════════════════════════════════════
   PROTO B · 5A — Diagnostic HUD timeline.
   window.__s5Timelines.s5a. Frame + grid boot, wireframe truck draws,
   gauges spin up, a scan sweep pings hotspots and ignites the DPF module
   red with a callout. Timer maps progress → 00:00…01:30.
══════════════════════════════════════════ */
window.__s5Timelines = window.__s5Timelines || {};
(function () {
  var wrap = document.getElementById('s5a-wrapper');
  if (!wrap) return;
  wrap.style.height = '100vh';

  var g = window.gsap;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var timer = document.getElementById('running-timer');
  function fmt(sec) { var m = Math.floor(sec / 60), s = Math.round(sec % 60); return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }

  var grid = $('#s5a-grid'), corners = $$('#s5a-frame .hc'), idEl = $('#s5a-id');
  var steps = $$('#s5a-steps .hud-step'), left = $('#s5a-left'), right = $('#s5a-right'), ticker = $('#s5a-ticker'), tickStatus = $('#s5a-tickstatus');
  var truck = $('#s5a-truck'), drawPaths = $$('#s5a-truck .draw'), spots = $$('#s5a-truck .hud-spot');
  var dpf = $('#s5a-dpf'), scanline = $('#s5a-scanline'), callout = $('#s5a-callout'), conf = $('#s5a-conf');
  var gauge = $('#s5a-gauge'), gaugeV = $('#s5a-gaugev'), bars = $$('#s5a-left .hud-bar'), temp = $('#s5a-temp');
  var C = 2 * Math.PI * 50;

  drawPaths.forEach(function (p) { p.__len = p.getTotalLength(); });

  function setStep(i, st) { if (!steps[i]) return; steps[i].classList.remove('active', 'done'); if (st) steps[i].classList.add(st); }

  function reset() {
    g.set(grid, { opacity: 0 });
    g.set(corners, { opacity: 0, scale: 0.6 });
    g.set(idEl, { opacity: 0 });
    g.set([left, right, ticker], { opacity: 0 });
    g.set(callout, { opacity: 0, x: 10 });
    g.set(spots, { opacity: 0 });
    g.set(scanline, { opacity: 0, left: '4%' });
    drawPaths.forEach(function (p) { g.set(p, { strokeDasharray: p.__len, strokeDashoffset: p.__len }); });
    g.set(gauge, { strokeDasharray: C, strokeDashoffset: C });
    bars.forEach(function (b) { g.set($('.hb-fill', b), { width: '0%' }); });
    steps.forEach(function (s) { s.classList.remove('active', 'done'); });
    dpf.classList.remove('lit'); temp.classList.remove('hot'); temp.textContent = '212°';
    if (conf) conf.textContent = '0'; if (gaugeV) gaugeV.textContent = '0';
    if (tickStatus) tickStatus.textContent = '› scanning subsystems…';
  }

  var tl = g.timeline({ paused: true, onUpdate: function () { if (timer) timer.textContent = fmt(this.progress() * 90); } });
  tl.add(reset, 0);

  /* boot frame + grid */
  tl.to(corners, { opacity: 1, scale: 1, duration: 0.12, stagger: 0.03, ease: 'back.out(2)' }, 0.02);
  tl.to(grid, { opacity: 1, duration: 0.16 }, 0.04);
  tl.to(idEl, { opacity: 1, duration: 0.12 }, 0.10);

  /* truck wireframe draws */
  drawPaths.forEach(function (p, i) { tl.to(p, { strokeDashoffset: 0, duration: 0.16, ease: 'power1.inOut' }, 0.10 + i * 0.018); });

  /* left gauges spin up + step 1 */
  tl.add(function () { setStep(0, 'active'); }, 0.12);
  tl.to(left, { opacity: 1, duration: 0.14 }, 0.14);
  tl.to(gauge, { strokeDashoffset: C * (1 - 0.78), duration: 0.3, ease: 'power2.out' }, 0.16);
  tl.to({ v: 0 }, { v: 78, duration: 0.3, ease: 'power2.out', onUpdate: function () { if (gaugeV) gaugeV.textContent = Math.round(this.targets()[0].v); } }, 0.16);
  bars.forEach(function (b, i) { tl.to($('.hb-fill', b), { width: b.getAttribute('data-h') + '%', duration: 0.18, ease: 'power2.out' }, 0.18 + i * 0.04); });
  tl.to(right, { opacity: 1, duration: 0.14 }, 0.18);
  tl.to(ticker, { opacity: 1, duration: 0.12 }, 0.22);

  /* scan sweep across the truck */
  tl.to(scanline, { opacity: 1, duration: 0.04 }, 0.30);
  tl.to(scanline, { left: '96%', duration: 0.30, ease: 'none' }, 0.30);
  spots.forEach(function (s, i) { tl.fromTo(s, { opacity: 0, transformOrigin: '50% 50%' }, { opacity: 1, duration: 0.06, yoyo: true, repeat: 1 }, 0.33 + i * 0.07); });
  tl.add(function () { setStep(0, 'done'); setStep(1, 'active'); if (tickStatus) tickStatus.textContent = '› analysing fault patterns…'; }, 0.40);
  tl.to(scanline, { opacity: 0, duration: 0.05 }, 0.56);

  /* isolate the DPF */
  tl.add(function () { setStep(1, 'done'); setStep(2, 'active'); }, 0.56);
  tl.add(function () { dpf.classList.add('lit'); temp.classList.add('hot'); temp.textContent = '214°'; }, 0.58);
  tl.to(callout, { opacity: 1, x: 0, duration: 0.16, ease: 'power3.out' }, 0.62);
  tl.to({ v: 0 }, { v: 94, duration: 0.22, onUpdate: function () { if (conf) conf.textContent = Math.round(this.targets()[0].v); } }, 0.64);
  tl.add(function () { if (tickStatus) tickStatus.textContent = '› DPF partial blockage · 94% · locating service'; }, 0.80);
  tl.to({}, { duration: 0.1 }, 0.90);

  window.__s5Timelines.s5a = tl;
})();
