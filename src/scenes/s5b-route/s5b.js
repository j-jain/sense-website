/* ════════════════════════════════════════════
   S5B — SERVICE NETWORK
════════════════════════════════════════════ */
(function(){
  var wrapper = document.getElementById('s5b-wrapper');
  wrapper.style.height = '100vh';

var TDX=-16.6,TDY=-2.1;

ScrollTrigger.create({trigger:wrapper,start:'top top',end:'bottom bottom',pin:'#s5b'});

var tl=gsap.timeline({paused:true,onUpdate:function(){var timerEl=document.getElementById('running-timer');if(timerEl){var secs=Math.round(90+this.progress()*72);var mm=String(Math.floor(secs/60)).padStart(2,'0');var ss=String(secs%60).padStart(2,'0');timerEl.textContent=mm+':'+ss;}}});
window.__s5Timelines.s5b = tl;

// ══════════════════════════════════════
// ENTRY: Map + BLR→DEL route (0–8%)
// ══════════════════════════════════════
tl.to('#s5b .st',{opacity:1,stagger:0.003,duration:0.06},0);
tl.to('#s5b .hw',{opacity:1,stagger:0.006,duration:0.04},0.01);
tl.to('#rTrav',{opacity:1,duration:0.025},0.03);
tl.to('#rOrig',{opacity:1,duration:0.025},0.04);
tl.to('#s5b .cdot',{opacity:1,duration:0.02},0.04);
tl.to('#s5b .cl',{opacity:1,duration:0.02},0.04);
tl.to('#trk',{opacity:1,duration:0.02},0.05);

// Truck pulse (continuous)
document.querySelectorAll('#s5b .truck-ring').forEach(function(r,i){
  gsap.to(r,{attr:{r:parseInt(r.getAttribute('r'))+20},opacity:0,duration:2.5,repeat:-1,delay:i*0.7,ease:'power1.out'});
});

// ══════════════════════════════════════
// BEAT 1: Radar + Network Illumination (8–28%)
// ══════════════════════════════════════
document.querySelectorAll('#s5b .rr').forEach(function(ring,i){
  var t=0.08+i*0.028;
  tl.fromTo(ring,{opacity:0,attr:{r:15}},{opacity:0.3,attr:{r:60+i*100},duration:0.14,ease:'power1.out'},t);
  tl.to(ring,{opacity:0,duration:0.08},t+0.12);
});
tl.to('#rGlow',{opacity:0.6,duration:0.08},0.08);
tl.to('#rGlow',{opacity:0.1,attr:{r:400},duration:0.2},0.15);

// All nodes appear grey, rippling outward
var nodes=Array.from(document.querySelectorAll('#s5b .sn'));
nodes.sort(function(a,b){return parseFloat(a.dataset.dist)-parseFloat(b.dataset.dist)});
nodes.forEach(function(n,i){
  tl.to(n,{opacity:1,duration:0.012},0.10+i*0.004);
});

// ══════════════════════════════════════
// BEAT 1B: Candidates highlight amber (28–35%)
// ══════════════════════════════════════
// Candidates turn amber and grow, labels appear
var candidates=document.querySelectorAll('#s5b .sn[data-c="true"]');
candidates.forEach(function(n,i){
  var dot=n.querySelector('.nd');
  var lbl=n.querySelector('.nl');
  tl.to(dot,{fill:'#c4841d',attr:{r:5},duration:0.025},0.28+i*0.012);
  if(lbl) tl.to(lbl,{opacity:1,duration:0.03},0.29+i*0.012);
});

// ══════════════════════════════════════
// BEAT 2: Rejection + Selection (35–55%)
// ══════════════════════════════════════
// Rejected candidates: show reason, then dim
var rejects=document.querySelectorAll('#s5b .sn[data-c="true"][data-s="false"]');
var rArr=Array.from(rejects);
rArr.forEach(function(n,i){
  var dot=n.querySelector('.nd');
  var lbl=n.querySelector('.nl');
  var rej=n.querySelector('.rl');
  var t=0.36+i*0.04;
  // Show rejection reason
  if(rej) tl.to(rej,{opacity:1,duration:0.02},t);
  // Dim the dot
  tl.to(dot,{fill:'#222',attr:{r:2},duration:0.03},t+0.02);
  // Fade label and reason
  if(lbl) tl.to(lbl,{opacity:0.15,duration:0.025},t+0.04);
  if(rej) tl.to(rej,{opacity:0,duration:0.02},t+0.04);
});

// Ahmedabad: amber → DENSO Red, grows, glow
var selNode=document.querySelector('#s5b .sn[data-s="true"]');
if(selNode){
  var selDot=selNode.querySelector('.nd');
  var selLbl=selNode.querySelector('.nl');
  tl.to(selDot,{fill:'#D73030',attr:{r:7},duration:0.04},0.48);
  tl.set(selDot,{attr:{filter:'url(#glow)'}},0.48);
  if(selLbl){
    tl.to(selLbl,{fill:'#D73030',opacity:1,duration:0.03},0.49);
  }
}

// ══════════════════════════════════════
// BEAT 2B: Reroute animation (50–65%)
// ══════════════════════════════════════
// Original route dims
tl.to('#rOrig',{stroke:'rgba(255,255,255,0.04)',strokeDasharray:'4 8',strokeWidth:1,duration:0.05},0.52);

// Detour line draws truck→Ahmedabad
var det=document.getElementById('rDet');
if(det){
  var dLen=det.getTotalLength();
  gsap.set(det,{strokeDasharray:dLen,strokeDashoffset:dLen});
  tl.to(det,{opacity:1,duration:0.008},0.54);
  tl.to(det,{strokeDashoffset:0,duration:0.08,ease:'power2.inOut'},0.54);
}

// After-service route: Ahmedabad→Delhi
var aft=document.getElementById('rAft');
if(aft){
  var aLen=aft.getTotalLength();
  gsap.set(aft,{strokeDasharray:aLen,strokeDashoffset:aLen});
  tl.to(aft,{opacity:1,duration:0.008},0.60);
  tl.to(aft,{strokeDashoffset:0,duration:0.06,ease:'power1.inOut'},0.60);
}

// ══════════════════════════════════════
// BEAT 2C: Detail card (58–72%)
// ══════════════════════════════════════
tl.to('#s5b .s5b-card',{opacity:1,x:0,duration:0.04},0.62);
document.querySelectorAll('#s5b .s5b-card .li').forEach(function(item,i){
  tl.to(item,{opacity:1,duration:0.02},0.66+i*0.025);
});

// ══════════════════════════════════════
// BEAT 3: Route Locked (75–100%)
// ══════════════════════════════════════
if(det) tl.to(det,{strokeDasharray:'0 0',strokeWidth:3,duration:0.04},0.78);
tl.to('#s5b .s5b-rs',{opacity:1,duration:0.03},0.82);

// Truck rotates slightly toward Ahmedabad and moves
var angle = Math.atan2(TDX, -TDY) * 180 / Math.PI;
tl.to('#trk .truck-body',{rotation:angle,transformOrigin:'center center',duration:0.08,ease:'power2.inOut'},0.84);


// Flowing dashes on detour — only 62-76% of the timeline (autoplay).
var dashAnim = null;
tl.eventCallback('onUpdate', (function(prev){
  return function(){
    if(typeof prev === 'function') prev.apply(this, arguments);
    var p = this.progress();
    if(p >= 0.62 && p < 0.76){
      if(!dashAnim && det) dashAnim = gsap.to(det, {strokeDashoffset:'-=24', repeat:-1, duration:0.8, ease:'none'});
    } else {
      if(dashAnim){ dashAnim.kill(); dashAnim = null; }
    }
  };
})(tl.eventCallback('onUpdate')));
})();
