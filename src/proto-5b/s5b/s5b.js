/* ════════════════════════════════════════════
   PROTO · 5B — SERVICE NETWORK
   Ported from the live scene (src/scenes/s5b-route). The one substantive
   change vs. the live version: the truck no longer just ROTATES in place
   when it reroutes — it physically GLIDES along the detour path to
   Ahmedabad (sampled with getPointAtLength), turning onto the new road as
   it goes, while the red route draws just ahead of it. reset() runs via
   onStart so Replay is clean (the truck transform is set manually, outside
   GSAP's tween bookkeeping, so it must be reset explicitly).
════════════════════════════════════════════ */
import { prepText, revealText } from '../../shared/text-reveal.js';

window.__s5Timelines = window.__s5Timelines || {};
(function(){
  var g = window.gsap;
  var wrapper = document.getElementById('s5b-wrapper');
  if(!wrapper || !g) return;
  wrapper.style.height = '100vh';

  var s5bHead = document.querySelector('#s5b .s5b-scene-headline');
  if(s5bHead) prepText(s5bHead);
  var s5bHeadFired = false;

  var trk  = document.getElementById('trk');
  var body = trk ? trk.querySelector('.truck-body') : null;
  var det  = document.getElementById('rDet');
  var aft  = document.getElementById('rAft');
  var dLen = det ? det.getTotalLength() : 0;

  /* parked pose from the markup */
  var START_TF = 'translate(224.1,538.7)';
  var BODY_TF0 = 'scale(0.8)';

  /* single heading from detour start → end, so the truck faces Ahmedabad
     without wobbling at the mid waypoint */
  var headRot = (function(){
    if(!det) return 0;
    var a = det.getPointAtLength(0), b = det.getPointAtLength(dLen);
    return Math.atan2(b.x - a.x, -(b.y - a.y)) * 180 / Math.PI;
  })();

  /* place the truck at fraction p along the detour, turning onto the new
     road as it advances (rotation eases 0 → headRot with p). */
  function placeTruck(p){
    if(!det || !trk) return;
    var pt = det.getPointAtLength(dLen * p);
    trk.setAttribute('transform', 'translate(' + pt.x.toFixed(2) + ',' + pt.y.toFixed(2) + ')');
    if(body) body.setAttribute('transform', 'scale(0.8) rotate(' + (headRot * p).toFixed(1) + ')');
  }

  function reset(){
    if(trk)  trk.setAttribute('transform', START_TF);
    if(body) body.setAttribute('transform', BODY_TF0);
  }

  var tl = g.timeline({
    paused:true,
    onStart: reset,   /* fires on every restart() — clean Replay */
    onUpdate:function(){
      var t = document.getElementById('running-timer');
      if(t){ var s = Math.round(this.progress()*90); t.textContent = String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); }
    }
  });
  window.__s5Timelines.s5b = tl;
  tl.add(reset, 0);

  if(s5bHead) tl.call(function(){ if(s5bHeadFired) return; s5bHeadFired = true; revealText(s5bHead); }, null, 0.01);

  /* ── ENTRY: map + BLR→DEL route ── */
  tl.to('#s5b .st',{opacity:1,stagger:0.003,duration:0.06},0);
  tl.to('#s5b .hw',{opacity:1,stagger:0.006,duration:0.04},0.01);
  tl.to('#rTrav',{opacity:1,duration:0.025},0.03);
  tl.to('#rOrig',{opacity:1,duration:0.025},0.04);
  tl.to('#s5b .cdot',{opacity:1,duration:0.02},0.04);
  tl.to('#s5b .cl',{opacity:1,duration:0.02},0.04);
  tl.to('#trk',{opacity:1,duration:0.02},0.05);

  /* truck pulse (continuous) */
  document.querySelectorAll('#s5b .truck-ring').forEach(function(r,i){
    g.to(r,{attr:{r:parseInt(r.getAttribute('r'))+20},opacity:0,duration:2.5,repeat:-1,delay:i*0.7,ease:'power1.out'});
  });

  /* ── BEAT 1: radar + network illumination ── */
  document.querySelectorAll('#s5b .rr').forEach(function(ring,i){
    var t=0.08+i*0.028;
    tl.fromTo(ring,{opacity:0,attr:{r:15}},{opacity:0.3,attr:{r:60+i*100},duration:0.14,ease:'power1.out'},t);
    tl.to(ring,{opacity:0,duration:0.08},t+0.12);
  });
  tl.to('#rGlow',{opacity:0.6,duration:0.08},0.08);
  tl.to('#rGlow',{opacity:0.1,attr:{r:400},duration:0.2},0.15);

  var nodes=Array.from(document.querySelectorAll('#s5b .sn'));
  nodes.sort(function(a,b){return parseFloat(a.dataset.dist)-parseFloat(b.dataset.dist)});
  nodes.forEach(function(n,i){ tl.to(n,{opacity:1,duration:0.012},0.10+i*0.004); });

  /* ── BEAT 1B: candidates highlight amber ── */
  document.querySelectorAll('#s5b .sn[data-c="true"]').forEach(function(n,i){
    var dot=n.querySelector('.nd'), lbl=n.querySelector('.nl');
    tl.to(dot,{fill:'#c4841d',attr:{r:5},duration:0.025},0.28+i*0.012);
    if(lbl) tl.to(lbl,{opacity:1,duration:0.03},0.29+i*0.012);
  });

  /* ── BEAT 2: rejection + selection ── */
  Array.from(document.querySelectorAll('#s5b .sn[data-c="true"][data-s="false"]')).forEach(function(n,i){
    var dot=n.querySelector('.nd'), lbl=n.querySelector('.nl'), rej=n.querySelector('.rl');
    var t=0.36+i*0.04;
    if(rej) tl.to(rej,{opacity:1,duration:0.02},t);
    tl.to(dot,{fill:'#222',attr:{r:2},duration:0.03},t+0.02);
    if(lbl) tl.to(lbl,{opacity:0.15,duration:0.025},t+0.04);
    if(rej) tl.to(rej,{opacity:0,duration:0.02},t+0.04);
  });
  var selNode=document.querySelector('#s5b .sn[data-s="true"]');
  if(selNode){
    var selDot=selNode.querySelector('.nd'), selLbl=selNode.querySelector('.nl');
    tl.to(selDot,{fill:'#D73030',attr:{r:7},duration:0.04},0.48);
    tl.set(selDot,{attr:{filter:'url(#glow)'}},0.48);
    if(selLbl) tl.to(selLbl,{fill:'#D73030',opacity:1,duration:0.03},0.49);
  }

  /* ── BEAT 2B: REROUTE — the red line LEADS, the truck GLIDES along it ── */
  tl.to('#rOrig',{stroke:'rgba(255,255,255,0.04)',strokeDasharray:'4 8',strokeWidth:1,duration:0.05},0.52);

  if(det){
    g.set(det,{strokeDasharray:dLen,strokeDashoffset:dLen});
    tl.to(det,{opacity:1,duration:0.01},0.54);
    tl.to(det,{strokeDashoffset:0,duration:0.16,ease:'power2.inOut'},0.54);   /* smooth draw */
  }
  /* truck eases along the detour, starting just after the line begins */
  var glide={p:0};
  tl.to(glide,{p:1,duration:0.18,ease:'power2.inOut',onUpdate:function(){ placeTruck(glide.p); }},0.58);

  if(aft){
    var aLen=aft.getTotalLength();
    g.set(aft,{strokeDasharray:aLen,strokeDashoffset:aLen});
    tl.to(aft,{opacity:1,duration:0.01},0.72);
    tl.to(aft,{strokeDashoffset:0,duration:0.1,ease:'power2.inOut'},0.72);
  }

  /* ── BEAT 2C: detail card ── */
  tl.to('#s5b .s5b-card',{opacity:1,x:0,duration:0.04},0.64);
  document.querySelectorAll('#s5b .s5b-card .li').forEach(function(item,i){
    tl.to(item,{opacity:1,duration:0.02},0.68+i*0.025);
  });

  /* ── BEAT 3: route locked ── */
  if(det) tl.to(det,{strokeWidth:3,duration:0.04},0.82);
  tl.to('#s5b .s5b-rs',{opacity:1,duration:0.03},0.84);
})();
