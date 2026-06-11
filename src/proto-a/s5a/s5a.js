/* ══════════════════════════════════════════
   PROTO A · 5A — Remote Diagnostic timeline.
   Paused GSAP timeline registered on window.__s5Timelines.s5a; the
   autoplay sequencer stretches it via timeScale. Internal tween-time is
   ~1s; the running timer maps progress → 00:00…01:30. Built so restart(0)
   replays cleanly (an init callback resets all DOM state).
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

  var console_ = $('#s5a-console');
  var headline = $('#s5a-headline');
  var rows = $$('#s5a-rows .pa5a-row');
  var scanline = $('#s5a-scanline');
  var phases = $$('#s5a-phases .pa5a-phase');
  var pill = $('#s5a-pill');
  var result = $('#s5a-result');
  var conf = $('#s5a-conf');
  var handoff = $('#s5a-handoff');
  var artDpf = $('#s5a-art-dpf');
  var scanmeta = $('#s5a-scanmeta');

  function reset() {
    g.set(console_, { opacity: 0, y: 26, scale: 0.985 });
    g.set(headline, { opacity: 0 });
    g.set(scanline, { opacity: 0, top: '0%' });
    g.set(result, { opacity: 0, y: 12, scale: 0.97 });
    g.set(handoff, { opacity: 0 });
    g.set(artDpf, { opacity: 0 });
    rows.forEach(function (r) {
      r.classList.remove('ok', 'bad');
      g.set($('.pa5a-fill', r), { width: '0%' });
      $('.pa5a-rs', r).textContent = '—';
    });
    phases.forEach(function (p) { p.classList.remove('active', 'done'); });
    pill.classList.remove('done');
    var pillTxt = pill.querySelector('.pa5a-pill-txt');
    if (pillTxt) pillTxt.textContent = 'Scanning';
    if (conf) conf.textContent = '0';
    if (scanmeta) scanmeta.textContent = '12 subsystems';
  }

  function setPhase(i, state) {
    if (!phases[i]) return;
    phases[i].classList.remove('active', 'done');
    if (state) phases[i].classList.add(state);
  }

  var tl = g.timeline({
    paused: true,
    onUpdate: function () { if (timer) timer.textContent = fmt(this.progress() * 90); }
  });

  tl.add(reset, 0);

  /* console + headline in */
  tl.to(console_, { opacity: 1, y: 0, scale: 1, duration: 0.16, ease: 'power3.out' }, 0.02);
  tl.to(headline, { opacity: 0.5, duration: 0.14 }, 0.10);

  /* phase 1 — reading history */
  tl.add(function () { setPhase(0, 'active'); if (scanmeta) scanmeta.textContent = 'reading history…'; }, 0.16);

  /* scan sweep — line travels the rows while each bar fills + clears green */
  tl.to(scanline, { opacity: 1, duration: 0.04 }, 0.18);
  tl.to(scanline, { top: '100%', duration: 0.44, ease: 'none' }, 0.18);
  rows.forEach(function (r, i) {
    var bad = r.hasAttribute('data-bad');
    var h = r.getAttribute('data-h') + '%';
    var at = 0.20 + i * 0.045;
    tl.to($('.pa5a-fill', r), { width: h, duration: 0.10, ease: 'power2.out' }, at);
    if (!bad) tl.add(function () { r.classList.add('ok'); $('.pa5a-rs', r).textContent = 'Nominal'; }, at + 0.06);
  });

  /* phase 2 — pattern analysis */
  tl.add(function () { setPhase(0, 'done'); setPhase(1, 'active'); if (scanmeta) scanmeta.textContent = 'pattern analysis…'; }, 0.34);

  /* phase 3 — isolate the DPF */
  tl.add(function () { setPhase(1, 'done'); setPhase(2, 'active'); if (scanmeta) scanmeta.textContent = 'isolating cause…'; }, 0.52);
  tl.add(function () {
    var bad = $('#s5a-rows .pa5a-row[data-bad]');
    if (bad) { bad.classList.add('bad'); $('.pa5a-rs', bad).textContent = 'Anomaly'; }
  }, 0.54);
  tl.to(artDpf, { opacity: 1, duration: 0.10 }, 0.55);
  tl.fromTo(artDpf, { scale: 1 }, { scale: 1.35, duration: 0.30, repeat: 1, yoyo: true, transformOrigin: '50% 50%', ease: 'sine.inOut' }, 0.55);
  tl.to(scanline, { opacity: 0, duration: 0.06 }, 0.60);

  /* result card resolves */
  tl.to(result, { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: 'expo.out' }, 0.64);
  tl.to({ v: 0 }, { v: 94, duration: 0.22, ease: 'power1.out', onUpdate: function () { if (conf) conf.textContent = Math.round(this.targets()[0].v); } }, 0.64);
  tl.add(function () {
    setPhase(2, 'done');
    if (scanmeta) scanmeta.textContent = '11 cleared · 1 found';
    pill.classList.add('done');
    var pt = pill.querySelector('.pa5a-pill-txt');
    if (pt) pt.textContent = 'Diagnosed';
  }, 0.80);

  /* handoff to the service network (5B) */
  tl.to(handoff, { opacity: 1, duration: 0.12 }, 0.86);
  tl.to({}, { duration: 0.10 }, 0.90); /* tail so the timer reaches 01:30 */

  window.__s5Timelines.s5a = tl;
})();
