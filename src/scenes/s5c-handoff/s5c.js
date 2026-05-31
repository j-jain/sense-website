/* ════════════════════════════════════════════
   S5C — DRIVER SUPPORT (Card Dashboard)
════════════════════════════════════════════ */
(function(){
  var wrapper = document.getElementById('s5c-wrapper');
  wrapper.style.height = '100vh';

  /* Mouse-tracking parallax on phone */
  var phoneInner = document.getElementById('s5c-phone-inner');
  var s5cSection = document.getElementById('s5c');
  var tRX=0, tRY=0, cRX=0, cRY=0;
  if(s5cSection && phoneInner){
    s5cSection.addEventListener('mousemove', function(e){
      var rect = s5cSection.getBoundingClientRect();
      tRY = ((e.clientX - rect.left - rect.width/2) / (rect.width/2)) * 10;
      tRX = ((rect.height/2 - (e.clientY - rect.top)) / (rect.height/2)) * 6;
    });
    s5cSection.addEventListener('mouseleave', function(){ tRX=0; tRY=0; });
    (function animP(){
      cRX += (tRX - cRX) * 0.06;
      cRY += (tRY - cRY) * 0.06;
      phoneInner.style.transform = 'rotateY('+cRY+'deg) rotateX('+cRX+'deg)';
      requestAnimationFrame(animP);
    })();
  }

  /* Card data for scan→resolve */
  var s5cCards = [
    { id:0, value:'Confirmed', valueColor:'#16a34a', subClass:'green',
      subHTML:'<span class="s5c-sdot green"></span> Ahmedabad CDC · SLA Gold', cardClass:'confirmed' },
    { id:1, value:'2h 14m', valueColor:'#1D2438', subClass:'green',
      subHTML:'<span class="s5c-sdot green"></span> 127 km · rerouted', cardClass:'confirmed' },
    { id:2, value:'1h 15m', valueColor:'#1D2438', subClass:'green',
      subHTML:'<span class="s5c-sdot green"></span> No parts needed', cardClass:'confirmed' },
    { id:3, value:'~15:17', valueColor:'#b45309', subClass:'amber-text',
      subHTML:'<span class="s5c-sdot amber"></span> Estimated return', cardClass:'amber' }
  ];

  function s5cResolveCards(ids){
    ids.forEach(function(idx){
      var card = s5cCards[idx];
      var cardEl = document.getElementById('s5c-card-'+card.id);
      var valEl  = document.getElementById('s5c-val-'+card.id);
      var subEl  = document.getElementById('s5c-sub-'+card.id);
      if(!cardEl) return;
      cardEl.classList.remove('scanning');
      cardEl.classList.add(card.cardClass);
      var sl = cardEl.querySelector('.s5c-scan-line');
      if(sl) sl.remove();
      if(valEl){ valEl.textContent = card.value; valEl.style.color = card.valueColor; }
      if(subEl){ subEl.className = 's5c-stat-sub '+card.subClass; subEl.innerHTML = card.subHTML; }
    });
  }
  function s5cScanCards(ids){
    ids.forEach(function(idx){
      var el = document.getElementById('s5c-card-'+idx);
      if(!el) return;
      el.classList.add('scanning');
      if(!el.querySelector('.s5c-scan-line')){
        var sl = document.createElement('div');
        sl.className = 's5c-scan-line';
        el.appendChild(sl);
      }
    });
  }

  /* Desktop pins S5C during the locked autoplay. Mobile leaves it unpinned so
     it's a normal tall scrollable section (phone, then fleet cards) — the
     wrapper grows with content instead of being clamped to one viewport. */
  if(window.matchMedia('(max-width:768px)').matches){
    wrapper.style.height = 'auto';
  } else {
    ScrollTrigger.create({trigger:wrapper,start:'top top',end:'bottom bottom',pin:'#s5c'});
  }

  var s5ctl = gsap.timeline({
    paused:true,
    onUpdate: function(){
      var timerEl = document.getElementById('running-timer');
      var secs = Math.round(162 + this.progress() * 90);
      var mm = String(Math.floor(secs/60)).padStart(2,'0');
      var ss = String(secs%60).padStart(2,'0');
      if(timerEl) timerEl.textContent = mm+':'+ss;
    }
  });
  window.__s5Timelines.s5c = s5ctl;

  /* ── BEAT 1: Both viewpoint labels appear ── */
  s5ctl.to('#s5c-label-driver', {opacity:1, duration:0.04}, 0);
  s5ctl.to('#s5c-label-fleet',  {opacity:1, duration:0.04}, 0);

  /* ── BEAT 2: Both frames enter simultaneously ── */
  s5ctl.to('#s5c-phone-wrap', {
    opacity:1, x:0, duration:0.08, ease:'power3.out',
    onComplete: function(){
      var el = document.getElementById('s5c-phone-inner');
      if(el) el.style.animationPlayState = 'running';
    }
  }, 0.02);
  s5ctl.to('#s5c-dashboard', {opacity:1, x:0, duration:0.08, ease:'power3.out'}, 0.02);

  /* Mini map (ambient) */
  s5ctl.to('#s5c-minimap', {opacity:0.5, duration:0.06, ease:'power2.out'}, 0.05);

  /* ── BEAT 3: Alert banner (left) + Incident card (right) ── */
  var b3 = 0.12;
  s5ctl.to('#s5c-alert-banner',  {opacity:1, y:0, duration:0.04, ease:'power2.out'}, b3);
  s5ctl.to('#s5c-dash-incident', {opacity:1, x:0, duration:0.05, ease:'power3.out'}, b3);

  /* ── BEAT 4: Service label (left) + Service card (right) ── */
  var b4 = b3 + 0.06;
  s5ctl.to('#s5c-label-service',{opacity:1, duration:0.03, ease:'power2.out'}, b4);
  s5ctl.to('#s5c-dash-service', {opacity:1, x:0, duration:0.05, ease:'power3.out'}, b4);

  /* ── BEAT 5: Cards 0+1 scan+resolve (left) + Timeline card (right) ── */
  var b5 = b4 + 0.06;
  s5ctl.call(function(){ s5cScanCards([0,1]); }, null, b5);
  s5ctl.to('#s5c-dash-timeline', {opacity:1, x:0, duration:0.05, ease:'power3.out'}, b5);
  s5ctl.call(function(){ s5cResolveCards([0,1]); }, null, b5 + 0.06);

  /* ── BEAT 6: Cards 2+3 scan+resolve ── */
  var b6 = b5 + 0.1;
  s5ctl.call(function(){ s5cScanCards([2,3]); }, null, b6);
  s5ctl.call(function(){ s5cResolveCards([2,3]); }, null, b6 + 0.06);

  /* ── BEAT 7: Guidance + support (left) — dashboard already complete ── */
  var b7 = b6 + 0.1;
  s5ctl.to('#s5c-label-guidance', {opacity:1, duration:0.03, ease:'power2.out'}, b7);
  s5ctl.to('#s5c-guidance-card',  {opacity:1, y:0, duration:0.04, ease:'power2.out'}, b7+0.02);
  s5ctl.to('#s5c-label-support',  {opacity:1, duration:0.03, ease:'power2.out'}, b7+0.04);
  s5ctl.to('#s5c-comm-call',      {opacity:1, y:0, duration:0.03, ease:'power2.out'}, b7+0.05);
  s5ctl.to('#s5c-comm-chat',      {opacity:1, y:0, duration:0.03, ease:'power2.out'}, b7+0.06);

  /* ── BEAT 8: Headline + proof point ── */
  var b8 = b7 + 0.12;
  s5ctl.to('#s5c-headline', {opacity:0.65, duration:0.06, ease:'power2.out'}, b8);
  s5ctl.to('#s5c-proof',    {opacity:1,    duration:0.06, ease:'power2.out'}, b8+0.03);

})();
