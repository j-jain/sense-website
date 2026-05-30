/* ════════════════════════════════════════════
   S5A — REMOTE DIAGNOSTICS (Hybrid Grid + Sidebar)
   Autoplay — pinned for 100vh, timeline runs on time not scroll.
════════════════════════════════════════════ */
window.__s5Timelines = window.__s5Timelines || {};
(function(){
  var wrapper = document.getElementById('s5a-wrapper');
  wrapper.style.height = '100vh';

  /* ── Subsystem data: 48 cells (8×6) ── */
  var subsystems = [
    {n:'Engine Block',g:'eng'},{n:'Cylinder Head',g:'eng'},{n:'Crankshaft',g:'eng'},{n:'Camshaft',g:'eng'},
    {n:'Piston Assy',g:'eng'},{n:'Timing Chain',g:'eng'},{n:'Engine Mounts',g:'eng'},{n:'Flywheel',g:'eng'},
    {n:'Fuel Injectors',g:'fuel'},{n:'Fuel Pump',g:'fuel'},{n:'Fuel Filter',g:'fuel'},{n:'Air Filter',g:'air'},
    {n:'MAF Sensor',g:'air'},{n:'Turbocharger',g:'air',c:1},{n:'Intercooler',g:'air'},{n:'Intake Manifold',g:'air'},
    {n:'Exhaust Manifold',g:'exh',c:1},{n:'Exhaust Temp',g:'exh',c:1},{n:'DPF System',g:'dpf',c:1,t:1},{n:'DPF Pressure',g:'dpf',c:1},
    {n:'SCR Catalyst',g:'exh'},{n:'NOx Sensor',g:'exh'},{n:'EGR Valve',g:'exh',c:1},{n:'Exhaust Pipe',g:'exh'},
    {n:'Coolant Pump',g:'cool'},{n:'Thermostat',g:'cool'},{n:'Radiator',g:'cool'},{n:'Radiator Fan',g:'cool'},
    {n:'Coolant Temp B2',g:'cool'},{n:'Oil Cooler',g:'cool'},{n:'Oil Temp',g:'cool'},{n:'Heater Core',g:'cool'},
    {n:'ECU Primary',g:'elec'},{n:'Battery',g:'elec'},{n:'Alternator',g:'elec'},{n:'Starter Motor',g:'elec'},
    {n:'Wiring Harness',g:'elec'},{n:'Fuse Box',g:'elec'},{n:'CAN Bus',g:'elec'},{n:'Sensor Net',g:'elec'},
    {n:'Transmission',g:'drv'},{n:'Clutch Assy',g:'drv'},{n:'Driveshaft',g:'drv'},{n:'Differential',g:'drv'},
    {n:'Brake System',g:'brk'},{n:'ABS Module',g:'brk'},{n:'Suspension',g:'chs'},{n:'Steering',g:'chs'}
  ];

  /* ── Build grid cells ── */
  var gridEl = document.getElementById('s5a-grid');
  var cells = [];
  subsystems.forEach(function(sys, i) {
    var div = document.createElement('div');
    div.className = 's5a-cell';
    div.id = 's5a-c' + i;
    div._s = sys;
    var bc = sys.t ? 8 : (sys.c ? 5 : 1 + Math.floor(Math.random() * 3));
    var bars = '';
    for (var b = 0; b < bc; b++) {
      var h = sys.t ? (4 + Math.random() * 8) : (1.5 + Math.random() * 6);
      bars += '<div class="s5a-cell-bar" style="height:' + h.toFixed(1) + 'px"></div>';
    }
    div.innerHTML = '<div class="s5a-cell-name">' + sys.n + '</div><div class="s5a-cell-bars">' + bars + '</div>';
    gridEl.appendChild(div);
    cells.push(div);
  });

  /* ── Helpers ── */
  function setStep(n, state, statusText) {
    var el = document.getElementById('s5a-pt' + n);
    el.className = 's5a-pt-step ' + state;
    el.querySelector('.s5a-pt-status').textContent = statusText || '—';
  }
  function setBottom(html) {
    document.getElementById('s5a-bottomInfo').innerHTML = html;
  }
  function cellCenter(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width/2, y: r.top + r.height/2 };
  }
  function drawConns() {
    var svg = document.getElementById('s5a-connSvg');
    svg.innerHTML = '';
    var cc = cells.filter(function(c) { return c._s.c; });
    for (var i = 0; i < cc.length; i++) {
      for (var j = i+1; j < cc.length; j++) {
        var a = cellCenter(cc[i]), b = cellCenter(cc[j]);
        var line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('x1',a.x); line.setAttribute('y1',a.y);
        line.setAttribute('x2',b.x); line.setAttribute('y2',b.y);
        line.setAttribute('stroke','#e6a023');
        line.setAttribute('stroke-width','0.7');
        line.setAttribute('stroke-dasharray','4 3');
        line.setAttribute('opacity','0');
        line.classList.add('s5a-conn');
        svg.appendChild(line);
      }
    }
  }

  /* Track which callbacks have fired (scrub can replay) */
  var fired = {};
  function once(key, fn) {
    return function() { if (!fired[key]) { fired[key] = true; fn(); } };
  }

  /* ── Pin S5A for 100vh while its timeline autoplays ── */
  ScrollTrigger.create({
    trigger: wrapper,
    start: 'top top',
    end: 'bottom bottom',
    pin: '#s5a'
  });

  /* ── Autoplay timeline (paused until sequencer fires) ── */
  var s5atl = gsap.timeline({
    paused: true,
    onUpdate: function(){
      var timerEl = document.getElementById('running-timer');
      var secs = Math.round(this.progress() * 90);
      var mm = String(Math.floor(secs/60)).padStart(2,'0');
      var ss = String(secs%60).padStart(2,'0');
      if(timerEl) timerEl.textContent = mm+':'+ss;
    }
  });
  window.__s5Timelines.s5a = s5atl;

  /* ═══ Phase 0: Layout + grid appear (0-8%) ═══ */
  s5atl.to('#s5a-layout', {opacity:1, duration:0.03}, 0);
  s5atl.call(once('gridVis', function(){ gridEl.style.visibility = 'visible'; }), null, 0.01);
  s5atl.fromTo(cells, {opacity:0, scale:0.85}, {
    opacity:1, scale:1, duration:0.04,
    stagger:{amount:0.04, from:'random'}, ease:'power2.out'
  }, 0.02);

  /* ═══ CHECK 1: Vehicle History (8-22%) ═══ */
  s5atl.call(once('ch1start', function(){
    setStep(1,'active','Running...');
    setBottom('<span>48</span> subsystems · loading history');
  }), null, 0.08);

  /* Show history bars */
  s5atl.call(once('ch1bars', function(){
    cells.forEach(function(c){ c.classList.add('has-history'); });
  }), null, 0.12);

  /* DPF/cluster bars turn amber */
  s5atl.call(once('ch1amber', function(){
    cells.forEach(function(c){
      if(c._s.t){
        c.querySelectorAll('.s5a-cell-bar').forEach(function(b){ b.style.background='var(--amber)'; b.style.opacity='0.85'; });
      } else if(c._s.c){
        c.querySelectorAll('.s5a-cell-bar').forEach(function(b){ b.style.background='rgba(230,160,35,0.4)'; });
      }
    });
    setBottom('<span>48</span> subsystems · history loaded · <span style="color:var(--amber)">DPF anomaly flagged</span>');
  }), null, 0.16);

  s5atl.call(once('ch1done', function(){ setStep(1,'done','Complete'); }), null, 0.20);

  /* ═══ CHECK 2: Pattern Analysis — Scan Wave (22-42%) ═══ */
  s5atl.call(once('ch2start', function(){
    setStep(2,'active','Scanning...');
    setBottom('<span>48</span> subsystems · scanning for fault patterns');
  }), null, 0.22);

  s5atl.set('#s5a-scanWave', {left:'-100px', opacity:1}, 0.24);
  s5atl.to('#s5a-scanWave', {
    left:'100%', duration:0.10, ease:'power1.inOut',
    onUpdate: function(){
      var waveEl = document.getElementById('s5a-scanWave');
      var wr = waveEl.getBoundingClientRect();
      var wcx = wr.left + wr.width/2;
      cells.forEach(function(c){
        var r = c.getBoundingClientRect();
        var cx = r.left + r.width/2;
        var dist = Math.abs(cx - wcx);
        if(dist < 70 && !c.classList.contains('cluster') && !c.classList.contains('eliminated')){
          c.classList.add('scanned');
        }
        if(wcx > cx + 70){
          if(c._s.c){ c.classList.remove('scanned'); c.classList.add('cluster'); }
          else if(c.classList.contains('scanned')){ c.classList.remove('scanned'); }
        }
      });
    }
  }, 0.24);
  s5atl.set('#s5a-scanWave', {opacity:0}, 0.34);

  /* Connection lines */
  s5atl.call(once('ch2conns', function(){
    drawConns();
    gsap.to('.s5a-conn', {opacity:0.4, duration:0.5, stagger:0.03});
    var clusterCount = cells.filter(function(c){ return c._s.c; }).length;
    setBottom('<span>' + clusterCount + '</span> cluster cells identified · exhaust / DPF region');
  }), null, 0.36);

  s5atl.call(once('ch2done', function(){ setStep(2,'done','6 flagged'); }), null, 0.40);

  /* ═══ CHECK 3: Elimination (42-62%) ═══ */
  s5atl.call(once('ch3start', function(){
    setStep(3,'active','Eliminating...');
  }), null, 0.42);

  /* Fade non-cluster */
  s5atl.call(once('ch3fade', function(){
    cells.forEach(function(c){ if(!c._s.c) c.classList.add('eliminated'); });
    var rem = cells.filter(function(c){ return c._s.c; }).length;
    setBottom('<span>' + rem + '</span> candidates remaining');
  }), null, 0.44);

  /* Eliminate cluster cells one by one */
  var clusterNon = cells.filter(function(c){ return c._s.c && !c._s.t; });
  clusterNon.forEach(function(c, idx){
    var t = 0.47 + idx * 0.025;
    s5atl.call(once('ch3elim'+idx, function(){
      c.classList.add('checking');
    }), null, t);
    s5atl.call(once('ch3dim'+idx, function(){
      c.classList.remove('checking','cluster');
      c.classList.add('eliminated');
      var remaining = clusterNon.length - idx;
      setBottom('<span>' + remaining + '</span> ' + (remaining === 1 ? 'root cause identified' : 'candidates remaining'));
      gsap.to('.s5a-conn', {opacity: Math.max(0, 0.4 - (idx+1)*0.08), duration:0.3});
    }), null, t + 0.015);
  });

  /* TARGET FOUND */
  s5atl.call(once('ch3found', function(){
    var target = cells.find(function(c){ return c._s.t; });
    target.classList.remove('cluster');
    target.classList.add('found');
    gsap.to('.s5a-conn', {opacity:0, duration:0.3});
    setBottom('<span>1</span> root cause identified — <span style="color:var(--red)">DPF Partial Blockage</span>');
  }), null, 0.58);

  s5atl.call(once('ch3done', function(){ setStep(3,'done','1 found'); }), null, 0.62);

  /* ═══ CHECK 4: Service Readiness (62-82%) ═══ */
  s5atl.call(once('ch4start', function(){ setStep(4,'active','Preparing...'); }), null, 0.64);

  /* Dim grid, show diagnosis card */
  s5atl.to('#s5a-grid', {opacity:0.12, duration:0.04}, 0.66);
  s5atl.to('#s5a-diagCard', {opacity:1, scale:1, duration:0.04, ease:'back.out(1.3)'}, 0.67);

  /* Show readiness section */
  s5atl.to('#s5a-readiness', {opacity:1, duration:0.03}, 0.70);

  /* Populate readiness items */
  function showRdItem(id, val, t){
    s5atl.call(once('rd_'+id, function(){
      var el = document.getElementById(id);
      el.classList.add('done');
      el.querySelector('.s5a-rd-val').textContent = val;
    }), null, t);
  }
  showRdItem('s5a-rd1','None',0.72);
  showRdItem('s5a-rd2','1h 15m',0.74);
  showRdItem('s5a-rd3','Standard',0.76);
  showRdItem('s5a-rd4','Service Bay',0.78);
  showRdItem('s5a-rd5','Level 2',0.80);

  s5atl.call(once('ch4done', function(){ setStep(4,'done','Ready'); }), null, 0.82);

  /* ═══ HANDOFF (82-100%) ═══ */
  s5atl.call(once('handoff', function(){
    document.getElementById('s5a-bottomInfo').style.display = 'none';
    var hf = document.getElementById('s5a-handoffLine');
    hf.style.display = 'block';
    gsap.to(hf, {opacity:1, duration:0.4});
  }), null, 0.85);

})();
