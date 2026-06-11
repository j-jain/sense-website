/* ════════════════════════════════════════════
   PROTO · 5C — DRIVER & FLEET HANDOFF
   Based on the live scene, with two deliberate changes:
     1) TEXT-FIRST — the right-side headline reveals fully and alone,
        then the phone + FleetMatters dashboard load in and the headline
        recedes. (Live version brought them in together.)
     2) reset() via onStart so Replay is clean — the scan→resolve cards
        mutate classes / inject DOM / rewrite text outside GSAP's
        bookkeeping, so they're restored explicitly.
════════════════════════════════════════════ */
import { prepText, revealChars } from '../../shared/text-reveal.js';

window.__s5Timelines = window.__s5Timelines || {};
(function(){
  var g = window.gsap;
  var wrapper = document.getElementById('s5c-wrapper');
  if(!wrapper || !g) return;
  wrapper.style.height = '100vh';

  var s5cHead = document.getElementById('s5c-headline');
  if(s5cHead) prepText(s5cHead);   /* split into chars; wrapper opacity:1, chars hidden */
  var headFired = false;

  /* Mouse-tracking parallax on the phone (real browsers only) */
  var phoneInner = document.getElementById('s5c-phone-inner');
  var s5cSection = document.getElementById('s5c');
  var tRX=0, tRY=0, cRX=0, cRY=0;
  if(s5cSection && phoneInner){
    s5cSection.addEventListener('mousemove', function(e){
      var r = s5cSection.getBoundingClientRect();
      tRY = ((e.clientX - r.left - r.width/2) / (r.width/2)) * 10;
      tRX = ((r.height/2 - (e.clientY - r.top)) / (r.height/2)) * 6;
    });
    s5cSection.addEventListener('mouseleave', function(){ tRX=0; tRY=0; });
    (function animP(){
      cRX += (tRX - cRX) * 0.06;
      cRY += (tRY - cRY) * 0.06;
      phoneInner.style.transform = 'rotateY('+cRY+'deg) rotateX('+cRX+'deg)';
      requestAnimationFrame(animP);
    })();
  }

  /* Card data for scan → resolve */
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
      var card=s5cCards[idx];
      var cardEl=document.getElementById('s5c-card-'+card.id);
      var valEl=document.getElementById('s5c-val-'+card.id);
      var subEl=document.getElementById('s5c-sub-'+card.id);
      if(!cardEl) return;
      cardEl.classList.remove('scanning'); cardEl.classList.add(card.cardClass);
      var sl=cardEl.querySelector('.s5c-scan-line'); if(sl) sl.remove();
      if(valEl){ valEl.textContent=card.value; valEl.style.color=card.valueColor; }
      if(subEl){ subEl.className='s5c-stat-sub '+card.subClass; subEl.innerHTML=card.subHTML; }
    });
  }
  function s5cScanCards(ids){
    ids.forEach(function(idx){
      var el=document.getElementById('s5c-card-'+idx);
      if(!el) return;
      el.classList.add('scanning');
      if(!el.querySelector('.s5c-scan-line')){
        var sl=document.createElement('div'); sl.className='s5c-scan-line'; el.appendChild(sl);
      }
    });
  }

  /* Clean-Replay reset for the non-GSAP mutations */
  function reset(){
    s5cCards.forEach(function(card){
      var cardEl=document.getElementById('s5c-card-'+card.id);
      var valEl=document.getElementById('s5c-val-'+card.id);
      var subEl=document.getElementById('s5c-sub-'+card.id);
      if(cardEl){ cardEl.classList.remove('scanning','confirmed','amber'); var sl=cardEl.querySelector('.s5c-scan-line'); if(sl) sl.remove(); }
      if(valEl){ valEl.textContent='--'; valEl.style.color=''; }
      if(subEl){ subEl.className='s5c-stat-sub red'; subEl.innerHTML='<span class="s5c-sdot red"></span> Scanning'; }
    });
    if(phoneInner) phoneInner.style.animationPlayState='paused';
  }

  var s5ctl = g.timeline({
    paused:true,
    onStart: reset,
    onUpdate:function(){
      var t=document.getElementById('running-timer');
      if(t){ var s=Math.round(this.progress()*90); t.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); }
    }
  });
  window.__s5Timelines.s5c = s5ctl;
  s5ctl.add(reset, 0);

  /* ── BEAT 0: TEXT FIRST — the headline reveals fully, on its own ── */
  s5ctl.call(function(){ if(headFired) return; headFired=true; if(s5cHead) revealChars(s5cHead); }, null, 0.0);

  /* ── BEAT 1: the UI loads in after the text; headline recedes to make room ── */
  var bUI = 0.16;
  s5ctl.to('#s5c-label-driver', {opacity:1, duration:0.04}, bUI);
  s5ctl.to('#s5c-label-fleet',  {opacity:1, duration:0.04}, bUI);
  s5ctl.fromTo('#s5c-phone-wrap', {opacity:0, x:-30}, {
    opacity:1, x:0, duration:0.09, ease:'power3.out',
    onComplete:function(){ var el=document.getElementById('s5c-phone-inner'); if(el) el.style.animationPlayState='running'; }
  }, bUI);
  s5ctl.to('#s5c-dashboard', {opacity:1, x:0, duration:0.09, ease:'power3.out'}, bUI);
  s5ctl.to('#s5c-headline',  {opacity:0.5, duration:0.1, ease:'power2.out'}, bUI+0.03);   /* recede */
  s5ctl.to('#s5c-minimap',   {opacity:0.5, duration:0.06, ease:'power3.out'}, bUI+0.05);

  /* ── BEAT 3: alert (left) + incident card (right) ── */
  var b3 = bUI + 0.12;
  s5ctl.to('#s5c-alert-banner',  {opacity:1, y:0, duration:0.04, ease:'power3.out'}, b3);
  s5ctl.to('#s5c-dash-incident', {opacity:1, x:0, duration:0.05, ease:'power3.out'}, b3);

  /* ── BEAT 4: service label (left) + service card (right) ── */
  var b4 = b3 + 0.06;
  s5ctl.to('#s5c-label-service',{opacity:1, duration:0.03}, b4);
  s5ctl.to('#s5c-dash-service', {opacity:1, x:0, duration:0.05, ease:'power3.out'}, b4);

  /* ── BEAT 5: cards 0+1 scan→resolve (left) + timeline card (right) ── */
  var b5 = b4 + 0.06;
  s5ctl.call(function(){ s5cScanCards([0,1]); }, null, b5);
  s5ctl.to('#s5c-dash-timeline', {opacity:1, x:0, duration:0.05, ease:'power3.out'}, b5);
  s5ctl.call(function(){ s5cResolveCards([0,1]); }, null, b5 + 0.06);

  /* ── BEAT 6: cards 2+3 scan→resolve ── */
  var b6 = b5 + 0.1;
  s5ctl.call(function(){ s5cScanCards([2,3]); }, null, b6);
  s5ctl.call(function(){ s5cResolveCards([2,3]); }, null, b6 + 0.06);

  /* ── BEAT 7: guidance + support (left) ── */
  var b7 = b6 + 0.1;
  s5ctl.to('#s5c-label-guidance', {opacity:1, duration:0.03}, b7);
  s5ctl.to('#s5c-guidance-card',  {opacity:1, y:0, duration:0.04, ease:'power3.out'}, b7+0.02);
  s5ctl.to('#s5c-label-support',  {opacity:1, duration:0.03}, b7+0.04);
  s5ctl.to('#s5c-comm-call',      {opacity:1, y:0, duration:0.03}, b7+0.05);
  s5ctl.to('#s5c-comm-chat',      {opacity:1, y:0, duration:0.03}, b7+0.06);
})();
