/* ══════════════════════════════════════════
   PROTO A · 5C — Driver + Fleet Handoff timeline.
   Paused timeline on window.__s5Timelines.s5c. The divider links the two
   views; phone + console enter; the platform's response plays out in
   parallel on both (driver cards scan→confirm, fleet log + timeline
   stamp through). Timer maps progress → 02:42…04:12.
══════════════════════════════════════════ */
window.__s5Timelines = window.__s5Timelines || {};
(function () {
  var wrap = document.getElementById('s5c-wrapper');
  if (!wrap) return;
  wrap.style.height = '100vh';

  var g = window.gsap;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var byId = function (id) { return document.getElementById(id); };
  var timer = byId('running-timer');
  function fmt(sec) { var m = Math.floor(sec / 60), s = Math.round(sec % 60); return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }

  var divider = byId('s5c-divider'), labels = [byId('s5c-label-driver'), byId('s5c-label-fleet')];
  var phone = byId('s5c-phone'), console_ = byId('s5c-console');
  var alert = byId('s5c-alert'), svcLabel = byId('s5c-svc-label'), guidLabel = byId('s5c-guid-label'), guidance = byId('s5c-guidance'), comm = $$('#s5c-comm .pa5c-comm-btn');
  var greet = byId('s5c-greet'), badge = byId('s5c-badge'), vehicle = byId('s5c-vehicle'), vehStatus = byId('s5c-veh-status');
  var hfills = $$('#s5c-health .pa5c-hfill'), hrows = $$('#s5c-health .pa5c-hrow');
  var live = byId('s5c-live'), logRows = $$('#s5c-log .pa5c-logrow');
  var tlNodes = $$('#s5c-tl .pa5c-tlnode'), tlLines = $$('#s5c-tl .pa5c-tlline');
  var chat = $$('#s5c-chat .pa5c-msg'), headline = byId('s5c-headline');
  var cards = [0, 1, 2, 3].map(function (i) { return byId('s5c-card-' + i); });

  var CARD = [
    { val: 'Confirmed', cls: 'confirmed', sub: 'Ahmedabad CDC' },
    { val: '2h 14m', cls: 'confirmed', sub: '127 km · rerouted' },
    { val: '1h 15m', cls: 'confirmed', sub: 'No parts needed' },
    { val: '~15:17', cls: 'amber', sub: 'Estimated return' }
  ];
  function scan(ids) { ids.forEach(function (i) { var c = cards[i]; c.classList.remove('confirmed', 'amber'); c.classList.add('scanning'); }); }
  function resolve(ids) {
    ids.forEach(function (i) {
      var c = cards[i], d = CARD[i];
      c.classList.remove('scanning'); c.classList.add(d.cls);
      byId('s5c-val-' + i).textContent = d.val;
      byId('s5c-sub-' + i).innerHTML = '<span class="pa5c-sdot"></span>' + d.sub;
    });
  }

  function reset() {
    g.set(divider, { xPercent: -50, yPercent: -50, scaleY: 0 });
    g.set(labels, { opacity: 0 });
    g.set(phone, { opacity: 0, x: -42 });
    g.set(console_, { opacity: 0, x: 42 });
    g.set([greet, badge], { opacity: 0, y: -6 });
    g.set(vehicle, { opacity: 0 });
    g.set(hfills, { width: '0%' });
    g.set(alert, { opacity: 0, y: 10 });
    g.set([svcLabel, guidLabel], { opacity: 0 });
    g.set(cards, { opacity: 0 });
    g.set(guidance, { opacity: 0 });
    g.set(comm, { opacity: 0, y: 8 });
    g.set(live, { opacity: 0 });
    g.set(logRows, { opacity: 0, x: -8 });
    g.set(chat, { opacity: 0, y: 8 });
    g.set(headline, { opacity: 0 });
    cards.forEach(function (c, i) { c.classList.remove('scanning', 'confirmed', 'amber'); byId('s5c-val-' + i).textContent = '--'; byId('s5c-sub-' + i).innerHTML = '<span class="pa5c-sdot"></span>Scanning'; });
    tlNodes.forEach(function (n) { n.classList.remove('done', 'active'); });
    tlLines.forEach(function (l) { l.classList.remove('done'); });
    vehStatus.classList.remove('scheduled');
  }

  var tl = g.timeline({
    paused: true,
    onUpdate: function () { if (timer) timer.textContent = fmt(162 + this.progress() * 90); }
  });
  tl.add(reset, 0);

  /* link forms, both viewpoints enter */
  tl.to(labels, { opacity: 1, duration: 0.1 }, 0.03);
  tl.to(divider, { scaleY: 1, duration: 0.14, ease: 'power2.out' }, 0.04);
  tl.to(phone, { opacity: 1, x: 0, duration: 0.16, ease: 'power3.out' }, 0.08);
  tl.to(console_, { opacity: 1, x: 0, duration: 0.16, ease: 'power3.out' }, 0.08);

  /* console wakes */
  tl.to([greet, badge], { opacity: 1, y: 0, duration: 0.12, stagger: 0.04 }, 0.16);
  tl.to(vehicle, { opacity: 1, duration: 0.12 }, 0.20);
  hrows.forEach(function (row, i) { tl.to($('.pa5c-hfill', row), { width: row.getAttribute('data-h') + '%', duration: 0.16, ease: 'power2.out' }, 0.22 + i * 0.04); });
  tl.to(live, { opacity: 1, duration: 0.12 }, 0.24);

  /* phone alert + service cards */
  tl.to(alert, { opacity: 1, y: 0, duration: 0.12, ease: 'power3.out' }, 0.22);
  tl.to(svcLabel, { opacity: 1, duration: 0.1 }, 0.26);
  tl.to(cards, { opacity: 1, duration: 0.12, stagger: 0.03 }, 0.28);
  tl.add(function () { scan([0, 1]); }, 0.32);
  tl.add(function () { resolve([0, 1]); }, 0.42);
  tl.add(function () { scan([2, 3]); }, 0.46);
  tl.add(function () { resolve([2, 3]); }, 0.56);

  /* fleet event log + timeline stamp through, in step with the cards */
  var logAt = [0.34, 0.44, 0.54, 0.64];
  logRows.forEach(function (row, i) {
    tl.to(row, { opacity: 1, x: 0, duration: 0.12, ease: 'power2.out' }, logAt[i]);
    tl.add(function () {
      if (tlLines[i - 1]) tlLines[i - 1].classList.add('done');
      var node = tlNodes[i];
      if (node) { node.classList.remove('active'); node.classList.add(i < 3 ? 'done' : 'active'); }
    }, logAt[i] + 0.02);
  });
  /* vehicle flips to "scheduled · green" once rerouted */
  tl.add(function () { vehStatus.classList.add('scheduled'); }, 0.66);

  /* phone guidance + support */
  tl.to(guidLabel, { opacity: 1, duration: 0.1 }, 0.58);
  tl.to(guidance, { opacity: 1, duration: 0.12 }, 0.60);
  tl.to(comm, { opacity: 1, y: 0, duration: 0.12, stagger: 0.04 }, 0.64);

  /* support chat */
  tl.to(chat[0], { opacity: 1, y: 0, duration: 0.12 }, 0.70);
  tl.to(chat[1], { opacity: 1, y: 0, duration: 0.12 }, 0.78);

  /* headline + the proof-point timer pop */
  tl.to(headline, { opacity: 0.92, duration: 0.16, ease: 'power2.out' }, 0.84);
  tl.add(function () { if (timer) g.fromTo(timer, { scale: 1 }, { scale: 1.2, duration: 0.5, yoyo: true, repeat: 1, ease: 'power2.inOut', transformOrigin: '100% 50%' }); }, 0.92);
  tl.to({}, { duration: 0.06 }, 0.96);

  window.__s5Timelines.s5c = tl;
})();
