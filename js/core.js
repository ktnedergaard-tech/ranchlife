// Ranchlivet – Hjælpefunktioner og tegneflade til jordtekstur
'use strict';

const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const dist=(a,b,c,d)=>Math.hypot(a-c,b-d);
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const pad=n=>String(n).padStart(2,'0');
const fmt=n=>Math.round(n).toLocaleString('da-DK')+' kr';
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const DAYS=['Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag','Søndag'];
const SK='ranchlivet-save-v1';

/* ---------- canvas ---------- */
const cv=$('#game');const GC=document.createElement('canvas'),ctx=GC.getContext('2d');
let VW=innerWidth,VH=innerHeight;
function ell(c,x,y,rx,ry,rot){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot||0,0,Math.PI*2);c.fill()}
function rr(c,x,y,w,h,r){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);c.fill()}
function circ(c,x,y,r){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill()}
function shade(hex,amt){const n=parseInt(hex.slice(1),16);return'#'+[(n>>16)+amt,(n>>8&255)+amt,(n&255)+amt].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('')}
