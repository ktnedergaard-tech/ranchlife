// Ranchlivet – Kortets layout, forhindringer, træer og teksturer
'use strict';

/* ---------- world ---------- */
const W=3600,H=2800;
const HOUSE={x:300,y:320,w:620,h:440},STABLE={x:1200,y:720,w:760,h:380},PADDOCK={x:1200,y:250,w:760,h:400},ARENA={x:1200,y:1180,w:760,h:500};
const CAGE={x:420,y:880,w:220,h:130},COURSE={x:420,y:1050,w:440,h:150},NHOUSE={x:2500,y:330,w:460,h:340},NPAD={x:3030,y:260,w:420,h:400};
const FOREST={x:2200,y:1100,w:1350,h:880},TRACK={cx:2875,cy:1540,rx:520,ry:300};
const CROSS={x:1290,y:1035},BTN={x:1525,y:1166},CAR={x:1010,y:300};
const RANCH={x:280,y:200,w:1720,h:1520};
const STALLS=[1280,1412,1748,1880].map((cx,i)=>({i,cx,x:cx-66}));
const COURT={x:560,y:760,w:640,h:200};
const PATHS=[{x:1000,y:200,w:120,h:570},{x:1545,y:640,w:70,h:90},{x:1545,y:1090,w:70,h:100},{x:1100,y:950,w:70,h:1110},{x:1960,y:880,w:800,h:70},{x:2320,y:880,w:70,h:660},{x:2700,y:660,w:70,h:250},{x:1200,y:1680,w:1,h:1}];
const SOLIDS=[];
function seg(x,y,w,h,k){if(w>0&&h>0)SOLIDS.push({x,y,w,h,k})}
function segH(x1,x2,y,t,g,k){let c=x1;for(const[a,b]of(g||[]).slice().sort((p,q)=>p[0]-q[0])){if(a>c)seg(c,y,a-c,t,k);c=b}if(c<x2)seg(c,y,x2-c,t,k)}
function segV(x,y1,y2,t,g,k){let c=y1;for(const[a,b]of(g||[]).slice().sort((p,q)=>p[0]-q[0])){if(a>c)seg(x,c,t,a-c,k);c=b}if(c<y2)seg(x,c,t,y2-c,k)}
function box(R,t,g,k){segH(R.x,R.x+R.w,R.y,t,g.t,k);segH(R.x,R.x+R.w,R.y+R.h-t,t,g.b,k);segV(R.x,R.y+t,R.y+R.h-t,t,g.l,k);segV(R.x+R.w-t,R.y+t,R.y+R.h-t,t,g.r,k)}
box(HOUSE,12,{b:[[580,650]],r:[[600,670]]},'wall');
segV(480,332,526,10,[[440,500]],'wall');segH(312,490,526,10,[],'wall');
segV(760,332,556,10,[[480,545]],'wall');segH(760,908,556,10,[],'wall');
box(STABLE,14,{t:[[1545,1615]],b:[[1545,1615]],l:[[880,950]],r:[[880,950]]},'wall');
for(const x of[1346,1478,1682,1814])segV(x-4,734,870,8,[],'wall');
for(const s of STALLS)segH(s.x,s.x+132,870,8,[[s.cx-22,s.cx+22]],'wall');
segV(1790,944,1086,8,[[990,1050]],'wall');segH(1790,1946,936,8,[],'wall');
box(PADDOCK,6,{b:[[1545,1615]]},'fence');box(ARENA,6,{t:[[1545,1615]]},'fence');box(CAGE,6,{},'cage');box(NPAD,6,{},'fence');
box(NHOUSE,12,{b:[[2700,2770]]},'wall');
seg(955,264,112,22,'car');seg(1080,264,100,22,'car');
const AJ=[{x:1384,y:1192,w:12,h:80},{x:1764,y:1192,w:12,h:80},{x:1384,y:1590,w:12,h:80},{x:1764,y:1590,w:12,h:80}].map(o=>({...o,kind:'arena'}));
const LOGS=[{x:TRACK.cx-8,y:TRACK.cy+TRACK.ry-55,w:16,h:110},{x:TRACK.cx-8,y:TRACK.cy-TRACK.ry-55,w:16,h:110},{x:TRACK.cx+TRACK.rx-55,y:TRACK.cy-8,w:110,h:16},{x:2310,y:1250,w:90,h:16}].map(o=>({...o,kind:'log'}));
const HURDLES=[520,610,700,790].map(x=>({x,y:1095,w:6,h:60}));
const inR=(x,y,R,m=0)=>x>R.x-m&&x<R.x+R.w+m&&y>R.y-m&&y<R.y+R.h+m;
const TREES=[];
(function(){const r=rng(7);const AREAS=[HOUSE,STABLE,PADDOCK,ARENA,CAGE,COURSE,NHOUSE,NPAD,COURT,{x:930,y:200,w:270,h:110},...PATHS];
 function ok(x,y,m){if(y<230||y>2010)return false;for(const A of AREAS)if(inR(x,y,A,m))return false;for(const t of TREES)if(dist(x,y,t.x,t.y)<34)return false;return true}
 for(let i=0;i<420;i++){const x=FOREST.x+40+r()*(FOREST.w-80),y=FOREST.y+50+r()*(FOREST.h-80);const d=Math.hypot((x-TRACK.cx)/TRACK.rx,(y-TRACK.cy)/TRACK.ry);if(Math.abs(d-1)*320<80)continue;if(!ok(x,y,35))continue;const q=r();TREES.push({x,y,s:.85+r()*.45,k:q<.5?'pine':q<.85?'oak':'birch'})}
 const regions=[[40,260,250,2000,55],[300,2150,1730,2000,45],[1990,2200,1000,2000,14],[2000,3560,230,1060,45]];
 for(const[x1,x2,y1,y2,n]of regions){let c=0;for(let i=0;i<n*4&&c<n;i++){const x=x1+r()*(x2-x1),y=y1+r()*(y2-y1);if(!ok(x,y,45))continue;TREES.push({x,y,s:.8+r()*.5,k:r()<.7?'oak':'birch'});c++}}
})();
const FLOWERS=(()=>{const r=rng(21),a=[];for(let i=0;i<220;i++){const x=r()*W,y=230+r()*1780;if(inR(x,y,FOREST)||[HOUSE,STABLE,PADDOCK,ARENA,CAGE,COURSE,NHOUSE,NPAD,COURT,...PATHS].some(A=>inR(x,y,A,10)))continue;a.push({x,y,c:pick(['#f4f1e6','#f2d64b','#c95a8a','#8a7ad1'])})}return a})();
const NPC={x:2690,y:560,look:{skin:'#eec1a0',hair:'Knold',hairC:'#9a9a9a',top:'Fleecetrøje',topC:'#7a1f2b',bot:'Jeans',botC:'#2f4f78',shoes:'Gummistøvler',helmC:'#262626'}};
const NB=[{type:'horse',breed:'Haflinger',coat:0,name:'Fønix',x:3150,y:400,dir:1,walk:0,idle:0,tx:0,ty:0},{type:'horse',breed:'Islænder',coat:1,name:'Sóley',x:3300,y:520,dir:-1,walk:0,idle:2,tx:0,ty:0}];
const NBZ={x:3070,y:300,w:340,h:320};

/* ---------- patterns ---------- */
function mkPat(fn,s){s=s||128;const c=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d');fn(x,s,rng(s+fn.length*7));return ctx.createPattern(c,'repeat')}
const PAT={
 grass:mkPat((x,s,r)=>{x.fillStyle='#78a352';x.fillRect(0,0,s,s);for(let i=0;i<600;i++){x.fillStyle=['#6f9a4b','#84ad5c','#6a9446','#8fb866'][i%4];x.fillRect(r()*s,r()*s,1.5,3)}}),
 pad:mkPat((x,s,r)=>{x.fillStyle='#86a456';x.fillRect(0,0,s,s);for(let i=0;i<500;i++){x.fillStyle=['#7a9a4c','#95b161','#8d8a52'][i%3];x.fillRect(r()*s,r()*s,2,2)}}),
 forest:mkPat((x,s,r)=>{x.fillStyle='#4f7438';x.fillRect(0,0,s,s);for(let i=0;i<500;i++){x.fillStyle=['#456832','#5a7f3f','#6b5a38'][i%3];x.fillRect(r()*s,r()*s,2,2)}}),
 dirt:mkPat((x,s,r)=>{x.fillStyle='#b29467';x.fillRect(0,0,s,s);for(let i=0;i<500;i++){x.fillStyle=['#a5875a','#c0a276','#9a7d52'][i%3];x.fillRect(r()*s,r()*s,2,2)}}),
 gravel:mkPat((x,s,r)=>{x.fillStyle='#c9bfae';x.fillRect(0,0,s,s);for(let i=0;i<700;i++){x.fillStyle=['#b3a894','#ddd4c3','#a39883'][i%3];circ(x,r()*s,r()*s,1.2)}}),
 sand:mkPat((x,s,r)=>{x.fillStyle='#e8d6a4';x.fillRect(0,0,s,s);for(let i=0;i<500;i++){x.fillStyle=['#dcc890','#f1e2b8','#d4bf86'][i%3];x.fillRect(r()*s,r()*s,1.5,1.5)}}),
 arena:mkPat((x,s,r)=>{x.fillStyle='#d4b98a';x.fillRect(0,0,s,s);for(let i=0;i<500;i++){x.fillStyle=['#c7aa78','#ddc59a','#bf9f6c'][i%3];x.fillRect(r()*s,r()*s,2,1.5)}}),
 wood:mkPat((x,s,r)=>{x.fillStyle='#b58a5c';x.fillRect(0,0,s,s);for(let y=0;y<s;y+=16){x.fillStyle=y%32?'#ad8255':'#bb9064';x.fillRect(0,y,s,15);x.fillStyle='#8f6a44';x.fillRect(0,y+15,s,1);x.fillRect(((y*37)%s),y,1,15)}}),
 tile:mkPat((x,s)=>{x.fillStyle='#e8ecec';x.fillRect(0,0,s,s);x.fillStyle='#c5cccc';for(let i=0;i<s;i+=16){x.fillRect(i,0,1,s);x.fillRect(0,i,s,1)}}),
 concrete:mkPat((x,s,r)=>{x.fillStyle='#b9b5ac';x.fillRect(0,0,s,s);for(let i=0;i<300;i++){x.fillStyle=['#aca79d','#c4c0b7'][i%2];x.fillRect(r()*s,r()*s,2,2)}}),
 straw:mkPat((x,s,r)=>{x.fillStyle='#d9bd6a';x.fillRect(0,0,s,s);x.lineWidth=1.2;for(let i=0;i<260;i++){x.strokeStyle=['#c9a955','#ead08a','#b8973f'][i%3];const a=r()*s,b=r()*s,t=r()*Math.PI;x.beginPath();x.moveTo(a,b);x.lineTo(a+Math.cos(t)*9,b+Math.sin(t)*9);x.stroke()}})
};
