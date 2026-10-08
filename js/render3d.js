// Ranchlivet – 3D-grafik: modeller, verden, kamera og rendering
'use strict';

/* ---------- 3D: grundlag ---------- */
const M=27; // enheder pr. meter
const TOUCHDEV=matchMedia('(pointer:coarse)').matches;
const LOWQ=TOUCHDEV||Math.min(innerWidth,innerHeight)<700;
if(!window.THREE||!document.createElement('canvas').getContext('webgl')){document.querySelector('#title p').textContent='Din browser kan ikke vise 3D-grafik (WebGL). Prøv en nyere Chrome, Safari eller Edge.';document.querySelector('#newB').disabled=true;window.NO3D=true;throw new Error('WebGL mangler')}
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(LOWQ?1.5:2,devicePixelRatio||1));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(48,1,3,7000);
function resize(){VW=innerWidth;VH=innerHeight;renderer.setSize(VW,VH,false);camera.aspect=VW/VH;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
const MC={};
function mat(c){if(!MC[c])MC[c]=new THREE.MeshLambertMaterial({color:new THREE.Color(c)});return MC[c]}
const GEO={box:new THREE.BoxGeometry(1,1,1),sph:new THREE.SphereGeometry(1,16,12),sphL:new THREE.SphereGeometry(1,8,6),cyl:new THREE.CylinderGeometry(1,1,1,14),cylL:new THREE.CylinderGeometry(1,1,1,8),
 taper:new THREE.CylinderGeometry(.7,1,1,12),taperD:new THREE.CylinderGeometry(1,.7,1,12),cone:new THREE.ConeGeometry(1,1,12),hemi:new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2),ico:new THREE.IcosahedronGeometry(1,1),cone8:new THREE.ConeGeometry(1,1,8)};
function part(g,m,sx,sy,sz,x,y,z,par,shadow){const me=new THREE.Mesh(GEO[g],typeof m==='string'?mat(m):m);me.scale.set(sx,sy,sz);me.position.set(x,y,z);me.castShadow=shadow!==false;me.receiveShadow=true;if(par)par.add(me);return me}
function grp(par,x,y,z){const g=new THREE.Group();g.position.set(x||0,y||0,z||0);if(par)par.add(g);return g}
function lerpAng(a,b,t){let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return a+d*t}
const TXC={};
function plaidMat(col){const k='pl'+col;if(MC[k])return MC[k];const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle=col;x.fillRect(0,0,64,64);x.fillStyle='rgba(0,0,0,.28)';for(let i=0;i<64;i+=16){x.fillRect(i,0,6,64);x.fillRect(0,i,64,6)}x.fillStyle='rgba(255,255,255,.2)';for(let i=10;i<64;i+=16){x.fillRect(i,0,2,64);x.fillRect(0,i,64,2)}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);return MC[k]=new THREE.MeshLambertMaterial({map:t})}
function textCanvas(text,fs,bg,fg){const c=document.createElement('canvas'),x=c.getContext('2d'),F='800 '+fs+'px Nunito, system-ui, sans-serif';x.font=F;const w=Math.ceil(x.measureText(text).width+fs*.9),h=Math.ceil(fs*1.45);c.width=w;c.height=h;x.font=F;if(bg){x.fillStyle=bg;rr(x,0,0,w,h,h/2.4)}x.fillStyle=fg;x.textAlign='center';x.textBaseline='middle';x.fillText(text,w/2,h/2+fs*.05);return c}
function makeTag(text,size,bg,fg){const s=new THREE.Sprite(new THREE.SpriteMaterial({depthTest:false,transparent:true}));s.renderOrder=20;s.userData.size=size;s.userData.bg=bg||'rgba(251,244,226,.92)';s.userData.fg=fg||'#2d2416';setTag(s,text);return s}
function setTag(s,text){if(s.userData.text===text)return;s.userData.text=text;const c=textCanvas(text,48,s.userData.bg,s.userData.fg);if(s.material.map)s.material.map.dispose();const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;s.material.map=t;s.material.needsUpdate=true;s.scale.set(s.userData.size*c.width/c.height,s.userData.size,1)}
function boardMat(text,w,h){const c=document.createElement('canvas');c.width=w*4;c.height=h*4;const x=c.getContext('2d');x.fillStyle='#7b4a26';x.fillRect(0,0,c.width,c.height);x.fillStyle='rgba(0,0,0,.12)';for(let i=0;i<c.height;i+=12)x.fillRect(0,i,c.width,2);x.strokeStyle='#5a3418';x.lineWidth=6;x.strokeRect(3,3,c.width-6,c.height-6);
 let fs=c.height*.55;x.font='700 '+fs+'px "Bree Serif", Georgia, serif';while(x.measureText(text).width>c.width*.9)fs*=.92,x.font='700 '+fs+'px "Bree Serif", Georgia, serif';x.fillStyle='#fbf4e2';x.textAlign='center';x.textBaseline='middle';x.fillText(text,c.width/2,c.height/2+fs*.05);
 const t=new THREE.CanvasTexture(c);t.anisotropy=4;const face=new THREE.MeshLambertMaterial({map:t}),side=mat('#5a3418');return[side,side,side,side,face,face]}

/* ---------- 3D: personer ---------- */
function buildPerson(L){
 const root=new THREE.Group(),b=grp(root);b.scale.setScalar(M);
 const skin=L.skin,shirt=L.topC,pants=L.botC,shoe=SHOES[L.shoes]||'#333',P={root,b,legs:[],arms:[]};
 const topM=L.top==='Ternet skjorte'?plaidMat(shirt):mat(shirt);
 const tall=L.shoes==='Gummistøvler'||L.shoes==='Ridestøvler',sh=tall?.42:L.shoes==='Jodhpurstøvler'?.16:.09;
 for(const z of[-.095,.095]){const hip=grp(b,0,.92,z);
  if(L.bot==='Shorts'){part('cyl',pants,.085,.3,.085,0,-.15,0,hip);part('taperD',skin,.06,.56,.06,0,-.58,0,hip)}
  else part('taperD',pants,.08,.84,.08,0,-.42,0,hip);
  if(L.bot==='Ridebukser')part('cyl',shade(pants,-22),.085,.18,.085,0,-.36,0,hip);
  if(L.bot==='Arbejdsbukser')part('box',shade(pants,-25),.03,.12,.09,0,-.3,z>0?.05:-.05,hip);
  part('cyl',shoe,.07,sh,.07,0,-.88+sh/2,0,hip);
  part('box',shoe,.27,.08,.115,.05,-.885,0,hip);
  P.legs.push(hip)}
 const long=L.top==='Ridejakke';
 part('box',pants,.19,.16,.31,0,.96,0,b);
 part('box',topM,.2,long?.72:.6,.32,0,long?1.16:1.21,0,b);
 part('sph',topM,.1,.06,.165,0,1.5,0,b);
 if(L.top==='Hættetrøje'){part('box',shade(shirt,-18),.1,.2,.24,-.13,1.5,0,b);part('box',shade(shirt,-28),.02,.1,.16,.105,1.06,0,b)}
 if(L.top==='Ridejakke'){part('box','#f3efe6',.07,.07,.18,.08,1.52,0,b);part('box',shade(shirt,-35),.01,.62,.02,.101,1.17,0,b)}
 if(L.top==='Fleecetrøje'){part('box',shade(shirt,28),.205,.05,.325,0,1.32,0,b);part('box',shade(shirt,-30),.01,.3,.02,.101,1.35,0,b)}
 for(const z of[-.215,.215]){const s=grp(b,0,1.47,z),sl=L.top==='T-shirt'?.2:.58;
  part('taperD',topM,.058,sl,.058,0,-sl/2,0,s);if(sl<.58)part('cyl',skin,.045,.62-sl,.045,0,-(sl+.62)/2,0,s);
  part('sph',skin,.05,.055,.045,0,-.66,0,s);P.arms.push(s)}
 P.hand=grp(P.arms[1],0,-.68,0);P.handL=grp(P.arms[0],0,-.68,0);
 part('cyl',skin,.05,.1,.05,0,1.56,0,b);
 part('sph',skin,.105,.125,.1,0,1.7,0,b);
 part('sph',skin,.02,.025,.02,.1,1.69,0,b,false);
 for(const z of[-.04,.04])part('sph','#2a1d12',.014,.016,.014,.094,1.73,z,b,false);
 part('box','#b45a5a',.01,.008,.04,.098,1.645,0,b,false);
 const hc=L.hairC,hT=grp(b),hL=grp(b);P.hairTop=hT;
 const cap=()=>{part('hemi',hc,.118,.11,.112,-.01,1.715,0,hT);part('box',hc,.05,.08,.2,-.085,1.67,0,hT)};
 if(L.hair==='Kort')cap();
 if(L.hair==='Langt'){cap();part('box',hc,.08,.4,.23,-.075,1.55,0,hL)}
 if(L.hair==='Hestehale'){cap();part('sph',hc,.05,.16,.05,-.15,1.6,0,hL).rotation.z=-.35}
 if(L.hair==='Fletning'){cap();for(let i=0;i<6;i++)part('sph',hc,.036,.04,.036,-.12,1.66-i*.065,0,hL)}
 if(L.hair==='Krøllet')for(const[x,y,z]of[[-.02,1.8,0],[.04,1.78,.07],[.04,1.78,-.07],[-.07,1.76,.07],[-.07,1.76,-.07],[-.1,1.68,0],[-.09,1.62,.07],[-.09,1.62,-.07],[.07,1.8,0]])part('sph',hc,.056,.056,.056,x,y,z,hT);
 if(L.hair==='Knold'){cap();part('sph',hc,.062,.062,.062,-.07,1.84,0,hT)}
 const hm=grp(b);P.helmet=hm;hm.visible=false;part('hemi',L.helmC,.13,.13,.125,-.005,1.722,0,hm);part('box',L.helmC,.09,.014,.17,.12,1.735,0,hm);part('box','#1b1b1b',.012,.13,.01,.03,1.655,-.098,hm,false);part('box','#1b1b1b',.012,.13,.01,.03,1.655,.098,hm,false);
 return P}
function posePerson(P,o){const sw=o.moving?Math.sin(o.phase):0,amp=o.run?.65:.42;
 if(o.ride){P.legs[0].rotation.set(.38,0,.55);P.legs[1].rotation.set(-.38,0,.55);P.arms[0].rotation.set(.15,0,.8);P.arms[1].rotation.set(-.15,0,.8)}
 else{P.legs[0].rotation.set(0,0,sw*amp);P.legs[1].rotation.set(0,0,-sw*amp);P.arms[0].rotation.set(.06,0,-sw*amp*.8);P.arms[1].rotation.set(-.06,0,o.holding?.5:sw*amp*.8)}
 P.b.position.y=o.moving&&!o.ride?Math.abs(Math.cos(o.phase))*.025*M:0;P.b.rotation.z=o.lean||0;
 P.helmet.visible=!!o.helmet;P.hairTop.visible=!o.helmet}
function heldModel(it){const g=new THREE.Group();
 if(it==='grebe'||it==='kost'||it==='skovl'){const s=grp(g);s.rotation.z=.3;part('cylL','#8a6440',.015,1.25,.015,0,-.3,0,s);
  if(it==='grebe')for(let i=-2;i<=2;i++)part('cylL','#9a9a9a',.006,.22,.006,0,-1.02,i*.026,s);
  if(it==='kost')part('box','#c9a54a',.07,.12,.32,0,-.98,0,s);
  if(it==='skovl')part('box','#7a8a90',.03,.26,.22,0,-1.02,0,s)}
 else if(it==='børste'){part('box','#8a5a35',.13,.05,.07,.03,-.03,0,g);part('box','#2a1d12',.12,.03,.06,.03,-.07,0,g)}
 else if(it==='mad'){part('cyl','#fff',.13,.015,.13,.12,0,0,g);part('sph','#c46a3a',.08,.035,.08,.12,.02,0,g)}
 else{const col={hestefoder:'#2f6b3a',hundefoder:'#a33b3b',kattefoder:'#2f5d8a',kaninfoder:'#e08a2a'}[it]||'#888';part('cyl',col,.1,.22,.1,0,-.14,0,g);part('cyl','#ddd',.102,.02,.102,0,-.04,0,g)}
 return g}

/* ---------- 3D: dyr ---------- */
function buildHorse(a){
 const B=HB[a.breed]||HB['Dansk Varmblod'],co=B.coats[a.coat]||B.coats[0],col=co.c,mn=co.m,root=new THREE.Group(),b=grp(root),P={root,b,type:'horse',legs:[],s:B.s};
 b.scale.setScalar(M*B.s);const body=grp(b);P.body=body;
 part('sph',col,.8,.35,.31,0,1.26,0,body);part('sph',col,.4,.38,.31,.55,1.3,0,body);part('sph',col,.44,.39,.33,-.55,1.29,0,body);
 const neck=grp(body,.78,1.42,0);P.neck=neck;neck.rotation.z=-.55;
 part('taper',col,.2,.85,.15,0,.38,0,neck);part('box',mn,.07,.82,.06,-.15,.42,0,neck);
 const head=grp(neck,0,.8,0);P.head=head;head.rotation.z=-.5;
 part('sph',col,.17,.13,.12,.06,0,0,head);part('sph',col,.28,.1,.095,.3,-.01,0,head);part('sph',shade(col,-35),.07,.075,.078,.52,-.02,0,head);
 for(const z of[-1,1]){part('sph','#120e0b',.025,.03,.02,.12,.06,z*.1,head,false);const e=part('cone',col,.035,.13,.028,-.02,.15,z*.06,head);e.rotation.z=.85}
 part('box',mn,.1,.03,.08,.04,.13,0,head);
 P.muzzle=grp(head,.5,-.06,0);
 P.bridle=grp(head);const nb=part('cyl','#3a2416',.107,.035,.1,.32,-.01,0,P.bridle);nb.rotation.z=Math.PI/2;part('box','#3a2416',.025,.2,.26,-.02,.05,0,P.bridle);
 const tail=grp(body,-1.0,1.42,0);P.tail=tail;part('cyl',col,.07,.16,.07,0,-.02,0,tail);part('taper',mn,.065,.82,.065,0,-.42,0,tail);
 for(const[x,z]of[[.58,-.19],[.58,.19],[-.6,-.19],[-.6,.19]]){const L=grp(body,x,1.02,z);
  part('taperD',col,.12,.5,.1,0,-.24,0,L);part('sph',col,.075,.07,.07,0,-.5,0,L);part('cyl',col,.062,.42,.062,0,-.7,0,L);
  if(B.feather)part('taper',mn,.085,.24,.085,0,-.82,0,L);
  part('cyl','#2b2420',.075,.09,.075,0,-.95,0,L);P.legs.push(L)}
 if(co.spots){const r=rng(a.name?a.name.length*31+7:7);for(let i=0;i<46;i++){const x=-.95+r()*1.8,f=Math.sqrt(Math.max(.15,1-(x/1.05)**2)),t=r()*Math.PI*2;part('sph','#3a2a20',.045,.04,.045,x,1.27+.38*f*Math.cos(t),.33*f*Math.sin(t),body,false)}}
 const S=grp(body);P.saddle=S;
 part('box','#f3efe6',.6,.34,.66,-.02,1.48,0,S);part('box','#5a3418',.36,.28,.675,0,1.5,0,S);part('sph','#5a3418',.3,.1,.2,0,1.63,0,S);
 part('box','#4a2a12',.07,.09,.22,.22,1.68,0,S);part('box','#4a2a12',.07,.11,.24,-.24,1.69,0,S);part('box','#3a2416',.09,.74,.635,.18,1.24,0,S);
 for(const z of[-.34,.34]){part('box','#3a2416',.03,.38,.015,.02,1.36,z,S);part('box','#9aa0a6',.08,.03,.05,.02,1.16,z,S)}
 return P}
function animHorse(P,o){const ph=o.phase||0,amp=o.moving?o.amp:0,g=o.gait||1,t=o.t||0,offs=g===3?[0,.7,Math.PI,Math.PI+.7]:[0,Math.PI,Math.PI,0];
 P.legs.forEach((L,i)=>{L.rotation.z=o.tuck?(i<2?1.45:-.85):Math.sin(ph+offs[i])*amp});
 P.body.position.y=o.moving?(g===2?Math.abs(Math.sin(ph))*.05:g===3?Math.sin(ph)*.06:Math.sin(ph*2)*.012):Math.sin(t*1.6)*.004;
 P.body.rotation.z=o.tuck?.15:g===3&&o.moving?Math.sin(ph)*.06:0;
 P.gz=(P.gz||0)+((o.graze?1:0)-(P.gz||0))*.025;
 P.neck.rotation.z=-.55-P.gz*1.9+(o.moving?Math.sin(ph*2)*.035*g:0)+(o.tuck?.3:0);P.head.rotation.z=-.5+P.gz*.95;
 P.tail.rotation.z=-.3-(g>=2&&o.moving?.45:0)+Math.sin(t*1.3)*.05;P.tail.rotation.x=Math.sin(t*.9)*.14}
function buildDog(a){const B=DB[a.breed]||DB.Labrador,co=B.coats[a.coat]||B.coats[0],col=co.c,c2=co.c2,root=new THREE.Group(),b=grp(root),P={root,b,type:'dog',legs:[]};b.scale.setScalar(M*B.s*1.1);
 const lh=B.long?.14:.3,bl=B.long?.32:.27,hc=a.breed==='Jack Russell'?c2:col;
 part('sph',col,bl,.13,.12,0,lh+.1,0,b);part('sph',col,.14,.14,.12,bl*.72,lh+.13,0,b);
 for(const[x,z]of[[bl*.72,-.07],[bl*.72,.07],[-bl*.75,-.07],[-bl*.75,.07]]){const g=grp(b,x,lh+.04,z);part('cylL',col,.042,lh,.042,0,-lh/2,0,g);part('sph',col,.046,.026,.046,.014,-lh,0,g,false);P.legs.push(g)}
 const nk=part('cyl',hc,.07,.2,.07,bl+.04,lh+.22,0,b);nk.rotation.z=-.7;part('cyl','#c0392b',.073,.03,.073,bl+.02,lh+.19,0,b).rotation.z=-.7;
 const h=grp(b,bl+.1,lh+.3,0);P.head=h;
 part('sph',hc,.1,.095,.09,0,0,0,h);part('box',hc,.13,.075,.08,.1,-.035,0,h);part('sph','#111',.025,.022,.025,.17,-.015,0,h,false);
 for(const z of[-.045,.045])part('sph','#111',.014,.016,.014,.075,.03,z,h,false);
 for(const z of[-.06,.06]){if(B.ears==='up')part('cone',hc,.036,.12,.022,-.02,.12,z,h);else if(B.ears==='semi')part('cone',hc,.034,.085,.02,0,.1,z,h).rotation.z=-.55;else part('sph',shade(hc,-25),.025,.075,.045,-.02,-.02,z*1.45,h)}
 if(c2){if(a.breed==='Schæfer'){part('sph',c2,bl*.85,.07,.115,-.02,lh+.18,0,b);part('box',c2,.07,.04,.075,.16,-.035,0,h)}
  else if(a.breed==='Border Collie'){part('sph',c2,.1,.12,.11,bl*.92,lh+.1,0,b);part('box',c2,.14,.03,.035,.1,.0,0,h);part('box',c2,.13,.03,.082,.1,-.065,0,h)}
  else if(a.breed!=='Jack Russell')part('box',c2,.135,.05,.085,.1,-.05,0,h)}
 const t=grp(b,-bl-.02,lh+.15,0);P.tail=t;t.rotation.z=1.25;part('taper',col,.028,.24,.028,0,.11,0,t);
 P.anchor=grp(b,bl+.04,lh+.2,0);return P}
function buildCat(a){const B=CB[a.breed]||CB.Huskat,co=B.coats[a.coat]||B.coats[0],col=co.c,f=B.fluffy?1.25:1,pt=co.pt||col,root=new THREE.Group(),b=grp(root),P={root,b,type:'cat',legs:[]};b.scale.setScalar(M*B.s*1.15);
 part('sph',col,.2,.085*f,.075*f,0,.23,0,b);
 for(const[x,z]of[[.13,-.045],[.13,.045],[-.13,-.045],[-.13,.045]]){const g=grp(b,x,.2,z);part('cylL',pt,.027,.2,.027,0,-.1,0,g);P.legs.push(g)}
 const h=grp(b,.21,.33,0);P.head=h;part('sph',col,.075*f,.068*f,.075*f,0,0,0,h);part('sph',pt,.035,.03,.042,.06,-.015,0,h);
 for(const z of[-.04,.04]){part('cone',pt,.026,.06,.016,-.005,.065*f,z,h);part('sph','#4f8a3a',.012,.014,.01,.062,.012,z*.8,h,false)}
 part('sph','#d98a8a',.008,.008,.008,.096,-.01,0,h,false);
 const t=grp(b,-.19,.25,0);P.tail=t;t.rotation.z=.35;part('taper',pt,.022*f,.16,.022*f,0,.08,0,t);const t2=grp(t,0,.16,0);t2.rotation.z=-.7;part('taper',pt,.022*f,.16,.022*f,0,.08,0,t2);
 if(co.str)for(let i=0;i<4;i++)part('box',co.str,.025,.02,.155*f,-.12+i*.07,.295+.01*f,0,b,false);
 if(co.sp)for(const[x,z]of[[-.12,.03],[-.05,-.04],[.02,.04],[.08,-.02],[-.15,-.03],[.0,.0]])part('sph',co.sp,.022,.012,.022,x,.31,z,b,false);
 if(co.c2)part('sph',co.c2,.11,.06,.065,.08,.21,0,b);
 P.anchor=grp(b,.2,.3,0);return P}
function buildRabbit(a){const B=RB[a.breed]||RB.Rex,co=B.coats[a.coat]||B.coats[0],col=co.c,f=B.fluffy?1.25:1,root=new THREE.Group(),b=grp(root),P={root,b,type:'rabbit',legs:[]};b.scale.setScalar(M*B.s*1.25);
 const bod=grp(b);P.body=bod;part('sph',col,.16*f,.12*f,.11*f,-.03,.12,0,bod);part('sph',col,.09,.1,.1,.07,.12,0,bod);
 for(const z of[-.04,.04])part('sph',col,.03,.03,.03,.13,.02,z,bod);
 const h=grp(bod,.14,.22,0);P.head=h;part('sph',col,.075,.065,.065,0,0,0,h);
 if(B.mane)part('sph',shade(col,22),.07,.09,.095,-.035,.01,0,h);
 for(const z of[-1,1]){part('sph','#1a1a1a',.014,.016,.012,.05,.02,z*.045,h,false);
  if(B.lop){const e=part('sph',shade(col,-15),.022,.075,.038,-.01,-.035,z*.075,h);e.rotation.x=z*.15}else{const e=part('sph',col,.022,.09,.035,-.02,.11,z*.03,h);e.rotation.x=z*.18}}
 part('sph','#d98a8a',.01,.01,.012,.075,-.005,0,h,false);part('sph','#fbfaf6',.035,.035,.035,-.2,.15,0,bod);
 P.anchor=grp(b,.1,.15,0);return P}
function buildAnimal(a){return a.type==='horse'?buildHorse(a):a.type==='dog'?buildDog(a):a.type==='cat'?buildCat(a):buildRabbit(a)}
function animSmall(P,a,t){const ph=(a.walk||0)*1.4,m=a.moving;
 P.legs.forEach((L,i)=>L.rotation.z=m?Math.sin(ph+(i===0||i===3?0:Math.PI))*.6:0);
 if(P.tail)P.tail.rotation.x=P.type==='dog'?Math.sin(t*(m?14:6))*.45:Math.sin(t*1.7)*.3;
 if(P.type==='rabbit'&&P.body)P.body.scale.y=1+Math.sin(t*3)*.02;
 if(P.head)P.head.rotation.y=Math.sin(t*.7+(a.x||0))*.25}

/* ---------- 3D: verden ---------- */
const GK=.75;
function rr2s(c,x,y,w,h,r){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);c.stroke()}
function paintGround(){const c=ctx;c.setTransform(GK,0,0,GK,0,0);
 c.fillStyle=PAT.grass;c.fillRect(0,0,W,H);c.fillStyle='#6f9a4b';c.fillRect(0,0,W,92);
 c.fillStyle='#55575a';c.fillRect(0,92,W,108);c.fillStyle='#e9e4d0';for(let x=0;x<W;x+=80)c.fillRect(x,144,44,4);c.fillStyle='#cfcabc';c.fillRect(0,96,W,2);c.fillRect(0,194,W,2);
 c.fillStyle=PAT.sand;c.fillRect(0,2040,W,H-2040);for(let x=0;x<W;x+=70)ell(c,x,2042,46,16);
 c.fillStyle='rgba(140,110,60,.25)';c.fillRect(0,2410,W,60);
 const g=c.createLinearGradient(0,2455,0,2800);g.addColorStop(0,'#c9b98a');g.addColorStop(.15,'#7fae9e');g.addColorStop(.4,'#3f8fae');g.addColorStop(1,'#1f5f80');c.fillStyle=g;c.fillRect(0,2455,W,H-2455);
 c.fillStyle=PAT.forest;rr(c,FOREST.x,FOREST.y,FOREST.w,FOREST.h,140);
 c.strokeStyle=PAT.dirt;c.lineWidth=96;c.beginPath();c.ellipse(TRACK.cx,TRACK.cy,TRACK.rx,TRACK.ry,0,0,Math.PI*2);c.stroke();
 c.fillStyle=PAT.gravel;rr(c,COURT.x,COURT.y,COURT.w,COURT.h,24);rr(c,930,205,270,100,12);
 c.fillStyle=PAT.dirt;for(const r of PATHS)rr(c,r.x,r.y,r.w,r.h,20);
 c.fillStyle=PAT.pad;c.fillRect(PADDOCK.x,PADDOCK.y,PADDOCK.w,PADDOCK.h);c.fillStyle=PAT.dirt;ell(c,1580,630,70,26);ell(c,1910,300,50,22);
 c.fillStyle=PAT.pad;c.fillRect(NPAD.x,NPAD.y,NPAD.w,NPAD.h);
 c.fillStyle=PAT.arena;c.fillRect(ARENA.x,ARENA.y,ARENA.w,ARENA.h);c.strokeStyle='rgba(120,90,50,.2)';c.lineWidth=40;rr2s(c,ARENA.x+40,ARENA.y+40,ARENA.w-80,ARENA.h-80,60);
 c.fillStyle='#8fbd61';c.fillRect(COURSE.x,COURSE.y,COURSE.w,COURSE.h);c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=2;c.strokeRect(COURSE.x+4,COURSE.y+4,COURSE.w-8,COURSE.h-8);
 for(const f of FLOWERS){c.fillStyle=f.c;circ(c,f.x,f.y,2.4)}
 c.fillStyle=PAT.wood;c.fillRect(HOUSE.x,HOUSE.y,HOUSE.w,HOUSE.h);c.fillStyle=PAT.tile;c.fillRect(312,332,168,194);c.fillStyle='#b9a58c';c.fillRect(770,332,138,224);
 c.fillStyle='rgba(158,59,46,.75)';ell(c,620,640,62,40);c.fillStyle='rgba(226,181,75,.7)';ell(c,620,640,48,28);
 c.fillStyle='#8a5a35';c.fillRect(580,760,70,14);c.fillRect(920,600,14,70);
 c.fillStyle=PAT.concrete;c.fillRect(STABLE.x,STABLE.y,STABLE.w,STABLE.h);
 for(const s of STALLS){c.fillStyle=PAT.straw;c.fillRect(s.x+2,734,128,136);c.fillStyle='rgba(85,62,30,'+(G.stallDirt[s.i]/140)+')';c.fillRect(s.x+2,734,128,136)}
 const ad=G.aisleDirt/100;if(ad>.05){const r=rng(5);c.strokeStyle='rgba(200,170,90,'+Math.min(1,ad+.2)+')';c.lineWidth=1.6;for(let i=0;i<120*ad+5;i++){const x=1490+r()*190,y=760+r()*320;c.beginPath();c.moveTo(x,y);c.lineTo(x+r()*10-5,y+r()*10-5);c.stroke()}}
 c.fillStyle='#3b3b3e';rr(c,1240,995,100,80,6);
 c.fillStyle='#9fc272';c.fillRect(CAGE.x,CAGE.y,CAGE.w,CAGE.h);c.fillStyle=PAT.straw;c.fillRect(CAGE.x+6,CAGE.y+6,CAGE.w-12,CAGE.h-12);
 c.fillStyle=PAT.wood;c.fillRect(NHOUSE.x,NHOUSE.y,NHOUSE.w,NHOUSE.h);c.fillStyle='rgba(60,90,140,.5)';ell(c,2650,448,60,36);
 c.setTransform(1,0,0,1,0,0)}

let WORLD=false,groundTex,BLD={},toolMeshes={},jumpGroup=null,stallTags=[],stationTags=[],seaMesh,treeData=[],treeMeshes=[],poopInst,ptsObj,lamps=[],playerE=null,npcE=null,zzz,sun,hemi,lantern;
const AM=new Map();
function gableRoof(R,h,base,color,ov,endMat){const g=new THREE.Group(),alongX=R.w>=R.h,L=(alongX?R.w:R.h)+ov*2,S=(alongX?R.h:R.w)+ov*2,half=S/2,ang=Math.atan2(h,half),slope=Math.hypot(half,h);
 for(const sg of[-1,1]){const m=new THREE.Mesh(GEO.box,mat(color));m.scale.set(L,4,slope+2);m.position.set(0,base+h/2,sg*half/2);m.rotation.x=sg*ang;m.castShadow=true;g.add(m)}
 const ridge=new THREE.Mesh(GEO.box,mat(shade(color,-20)));ridge.scale.set(L,6,8);ridge.position.set(0,base+h+1,0);g.add(ridge);
 const hs=(alongX?R.h:R.w)/2,hl=(alongX?R.w:R.h)/2,geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute([-hl,base,-hs,-hl,base,hs,-hl,base+h,0,hl,base,hs,hl,base,-hs,hl,base+h,0],3));geo.computeVertexNormals();
 const ends=new THREE.Mesh(geo,endMat);g.add(ends);
 g.position.set(R.x+R.w/2,0,R.y+R.h/2);if(!alongX)g.rotation.y=Math.PI/2;scene.add(g);return g}
function addWin(b,x,z,horiz,w,h,y){const t=12,f=new THREE.Mesh(GEO.box,mat('#f6f3ec')),gl=new THREE.Mesh(GEO.box,mat('#9fc9dc'));
 f.scale.set(horiz?w+5:t+1.4,h+5,horiz?t+1.4:w+5);gl.scale.set(horiz?w:t+2,h,horiz?t+2:w);f.position.set(x,y||42,z);gl.position.set(x,y||42,z);b.win.add(f);b.win.add(gl)}
function toolStand(k){const g=new THREE.Group(),b=grp(g);b.scale.setScalar(M);
 if(k==='børste'){part('box','#8a5a35',.13,.05,.07,0,1.05,0,b);part('box','#6a4a2a',.25,.03,.12,0,1.01,0,b)}
 else{part('cylL','#8a6440',.015,1.25,.015,0,.75,0,b);
  if(k==='grebe')for(let i=-2;i<=2;i++)part('cylL','#9a9a9a',.006,.22,.006,0,.06,i*.026,b);
  if(k==='kost')part('box','#c9a54a',.07,.12,.32,0,.08,0,b);
  if(k==='skovl')part('box','#7a8a90',.03,.26,.22,0,.13,0,b);b.rotation.x=-.12}
 return g}
function buildJumps(){if(jumpGroup)scene.remove(jumpGroup);jumpGroup=grp(scene);const Hc=G.arenaH;jumpGroup.userData.h=Hc;const top=Hc/100*M;
 if(!MC.pole){const c=document.createElement('canvas');c.width=8;c.height=64;const x=c.getContext('2d');for(let i=0;i<4;i++){x.fillStyle=i%2?'#ffffff':'#c0392b';x.fillRect(0,i*16,8,16)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,2);MC.pole=new THREE.MeshLambertMaterial({map:t})}
 for(const j of AJ){const cx=j.x+j.w/2,z0=j.y,z1=j.y+j.h,cz=(z0+z1)/2,sh=Math.max(top,.9*M)+10;
  for(const z of[z0-3,z1+3]){part('box','#f2efe6',5,sh,6,cx,sh/2,z,jumpGroup);part('box','#2f5d8a',5.6,5,6.6,cx,sh-5,z,jumpGroup);part('box','#f2efe6',22,3,5,cx,1.5,z,jumpGroup)}
  const pole=y=>{const p=new THREE.Mesh(GEO.cyl,MC.pole);p.scale.set(1.5,j.h+4,1.5);p.rotation.x=Math.PI/2;p.position.set(cx,y,cz);p.castShadow=true;jumpGroup.add(p)};
  if(!Hc)pole(1.6);else{const n=Math.max(1,Hc/20-1);for(let i=0;i<n;i++)pole(top*(1-i/n))}}}
function lampPost(x,z){part('cyl','#2f2f2f',1.4,62,1.4,x,31,z,scene);part('box','#2f2f2f',6,4,6,x,63,z,scene);part('box','#fff2c4',4.6,7,4.6,x,58,z,scene,false);const l=new THREE.PointLight(0xffc77a,0,380,1.4);l.position.set(x,56,z);scene.add(l);lamps.push(l)}
function buildWorld(){WORLD=true;
 scene.background=new THREE.Color('#a9d4e8');scene.fog=new THREE.Fog('#a9d4e8',1100,3300);
 hemi=new THREE.HemisphereLight(0xe3f1ff,0x5a6a3a,.62);scene.add(hemi);
 sun=new THREE.DirectionalLight(0xfff4de,.95);sun.castShadow=true;const ms=LOWQ?1024:2048;sun.shadow.mapSize.set(ms,ms);const sc=sun.shadow.camera;sc.left=-430;sc.right=430;sc.top=430;sc.bottom=-430;sc.near=10;sc.far=2400;sun.shadow.bias=-.0006;scene.add(sun);scene.add(sun.target);
 lantern=new THREE.PointLight(0xffd59a,0,280,1.5);scene.add(lantern);
 // jord
 GC.width=Math.round(W*GK);GC.height=Math.round(H*GK);paintGround();
 groundTex=new THREE.CanvasTexture(GC);groundTex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const gm=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshStandardMaterial({map:groundTex,roughness:1,metalness:0}));gm.rotation.x=-Math.PI/2;gm.position.set(W/2,0,H/2);gm.receiveShadow=true;scene.add(gm);
 const om=new THREE.Mesh(new THREE.PlaneGeometry(W*5,H*5),mat('#74a04f'));om.rotation.x=-Math.PI/2;om.position.set(W/2,-.6,H/2-H);scene.add(om);
 const sg=new THREE.PlaneGeometry(W+6000,2600,100,24);sg.rotateX(-Math.PI/2);sg.translate(W/2,0,2462+1300);
 seaMesh=new THREE.Mesh(sg,new THREE.MeshLambertMaterial({color:'#3f93b5',transparent:true,opacity:.72}));seaMesh.position.y=1.4;seaMesh.receiveShadow=true;scene.add(seaMesh);seaMesh.userData.base=Float32Array.from(sg.attributes.position.array);
 // bygninger
 BLD.house={R:HOUSE,mat:new THREE.MeshLambertMaterial({color:'#f1ebdf'}),win:grp(scene)};
 BLD.stable={R:STABLE,mat:new THREE.MeshLambertMaterial({color:'#9e3b2e'}),win:grp(scene)};
 BLD.nb={R:NHOUSE,mat:new THREE.MeshLambertMaterial({color:'#e7c76a'}),win:grp(scene)};
 const barsPos=[];
 for(const s of SOLIDS){if(s.k!=='wall')continue;const cx=s.x+s.w/2,cy=s.y+s.h/2,inner=cx>STABLE.x+20&&cx<STABLE.x+STABLE.w-20&&cy>STABLE.y+20&&cy<STABLE.y+STABLE.h-20;
  const b=inR(cx,cy,HOUSE,2)?BLD.house:inR(cx,cy,STABLE,2)?BLD.stable:BLD.nb,h=inner?36:72;
  const m=new THREE.Mesh(GEO.box,inner?mat('#7a5536'):b.mat);m.scale.set(s.w,h,s.h);m.position.set(cx,h/2,cy);m.castShadow=m.receiveShadow=true;scene.add(m);if(!inner)(b.meshes=b.meshes||[]).push(m);
  if(inner){const horiz=s.w>s.h,len=horiz?s.w:s.h;part('box','#2b2b2b',horiz?len:3,3,horiz?3:len,cx,64,cy,scene);for(let d=4;d<len;d+=9)barsPos.push(horiz?[s.x+d,cy]:[cx,s.y+d])}}
 const bars=new THREE.InstancedMesh(GEO.cylL,mat('#2b2b2b'),barsPos.length),mx=new THREE.Matrix4();barsPos.forEach(([x,z],i)=>{mx.makeScale(.9,28,.9).setPosition(x,50,z);bars.setMatrixAt(i,mx)});scene.add(bars);
 BLD.house.roof=gableRoof(HOUSE,62,72,'#4a4440',16,BLD.house.mat);BLD.stable.roof=gableRoof(STABLE,54,72,'#3d3a38',16,BLD.stable.mat);BLD.nb.roof=gableRoof(NHOUSE,52,72,'#7a3428',16,BLD.nb.mat);
 for(const x of[395,560,700,850])addWin(BLD.house,x,326,true,36,28);for(const x of[470,760,850])addWin(BLD.house,x,754,true,36,28);for(const z of[600,690])addWin(BLD.house,306,z,false,36,28);for(const z of[420,720])addWin(BLD.house,914,z,false,36,28);
 for(const s of STALLS)addWin(BLD.stable,s.cx,727,true,26,18,52);for(const x of[1700,1880])addWin(BLD.stable,x,1093,true,30,20,50);
 for(const x of[2600,2860])addWin(BLD.nb,x,336,true,36,28);for(const x of[2580,2880])addWin(BLD.nb,x,664,true,36,28);
 for(const z of[STABLE.y-4,STABLE.y+STABLE.h+4])part('box','#7a2c22',40,62,3,1525,31,z,scene);
 part('box','#6b4a2a',24,48,3,560,24,762,scene);part('box','#6b4a2a',24,48,3,2680,24,672,scene);
 // hegn
 const posts=[],cposts=[];
 for(const s of SOLIDS){if(s.k!=='fence'&&s.k!=='cage')continue;const cage=s.k==='cage',horiz=s.w>=s.h,len=horiz?s.w:s.h,n=Math.max(1,Math.round(len/(cage?20:38))),cx=s.x+s.w/2,cz=s.y+s.h/2;
  for(let i=0;i<=n;i++){const t=i/n;(cage?cposts:posts).push(horiz?[s.x+len*t,cz]:[cx,s.y+len*t])}
  if(!cage)for(const hy of[17,31])part('box','#a07a50',horiz?len:2.2,3,horiz?2.2:len,cx,hy,cz,scene);
  else{const w=new THREE.Mesh(GEO.box,MC.wire||(MC.wire=new THREE.MeshLambertMaterial({color:'#b8c0c6',transparent:true,opacity:.35,depthWrite:false})));w.scale.set(horiz?len:.6,24,horiz?.6:len);w.position.set(cx,12,cz);scene.add(w);part('box','#8a9096',horiz?len:1.5,1.5,horiz?1.5:len,cx,24,cz,scene)}}
 const pi=new THREE.InstancedMesh(GEO.box,mat('#6a4a2a'),posts.length);posts.forEach(([x,z],i)=>{mx.makeScale(4.5,36,4.5).setPosition(x,18,z);pi.setMatrixAt(i,mx)});pi.castShadow=true;scene.add(pi);
 const ci=new THREE.InstancedMesh(GEO.box,mat('#7a8086'),cposts.length);cposts.forEach(([x,z],i)=>{mx.makeScale(2.4,26,2.4).setPosition(x,13,z);ci.setMatrixAt(i,mx)});scene.add(ci);
 buildTrees();
 // stammer
 for(const l of LOGS){const horiz=l.w>l.h,len=horiz?l.w:l.h,m=new THREE.Mesh(GEO.cyl,[mat('#6b4a2e'),mat('#c9a27a'),mat('#c9a27a')]);m.scale.set(8,len,8);if(horiz)m.rotation.z=Math.PI/2;else m.rotation.x=Math.PI/2;m.position.set(l.x+l.w/2,8,l.y+l.h/2);m.castShadow=true;scene.add(m);
  const st=part('cyl','#5a3e26',2.4,12,2.4,l.x+l.w/2+(horiz?len*.2:0),14,l.y+l.h/2+(horiz?0:len*.2),scene);st.rotation.z=.6}
 // kaninhop
 for(const hd of HURDLES){const cx=hd.x+hd.w/2;for(const z of[hd.y,hd.y+hd.h])part('box','#f2efe6',2,10,2,cx,5,z,scene);for(const y of[4,7.5])part('box',y>5?'#c0392b':'#ffffff',1.4,1.4,hd.h,cx,y,hd.y+hd.h/2,scene)}
 buildJumps();
 // ridebane: bogstaver og knap
 for(const[l,x,y]of[['A',1580,1676],['C',1580,1184],['E',1204,1430],['B',1956,1430],['K',1260,1676],['F',1900,1676],['H',1260,1184],['M',1900,1184]]){part('box','#f2efe6',8,14,8,x,7,y,scene);const t=makeTag(l,9,'#ffffff','#2d2416');t.position.set(x,22,y);t.material.depthTest=true;scene.add(t)}
 part('box','#6a4a2a',3,34,3,BTN.x,17,BTN.y,scene);part('box','#e9dcc0',26,16,3,BTN.x,40,BTN.y,scene);for(const z of[-2.2,2.2])part('sph','#c0392b',3.2,3.2,1.6,BTN.x,40,BTN.y+z,scene);
 // hus: inventar
 const F=(g,c,sx,sy,sz,x,y,z)=>part(g,c,sx,sy,sz,x,y,z,scene);
 F('box','#fafafa',8,16,16,318,20,376);F('cyl','#fafafa',7,12,7,328,6,376);F('cyl','#e8eaea',7.4,1.2,7.4,328,12.6,376);
 F('box','#fafafa',46,15,24,446,7.5,348);F('box','#9fd0e0',42,1,20,446,14,348);F('cyl','#c0c4c6',.8,20,.8,467,30,337);
 F('box','#eef0f0',18,22,24,321,11,491);F('cyl','#fafafa',8,3,8,322,23,491);F('box','#cfe3ea',1,18,16,313,44,491);
 F('box','#fafafa',12,10,4,420,40,523);F('box','#c0392b',5,1.4,1,420,40,520.6);F('box','#c0392b',1.4,5,1,420,40,520.6);
 F('box','#7a5536',44,10,58,850,9,400);F('box','#7a5536',46,26,3,850,20,370);F('box','#f4f1e8',42,7,55,850,17,401);F('box','#ffffff',30,5,11,850,22.5,378);F('box','#6d8fb3',43,4,36,850,22,413);
 F('box','#8a6440',14,14,14,818,7,373);F('cyl','#f3d27a',2.5,5,2.5,818,17,373);
 F('box','#8a6440',46,2,20,548,20,350);for(const[x,z]of[[527,342],[569,342],[527,358],[569,358]])F('box','#6a4a2a',1.6,19,1.6,x,9.5,z);F('box','#262626',18,11,1.4,548,28,343);F('box','#7fb3d0',16.5,9.5,1,548,28,343.9);F('box','#5a5a5a',12,12,12,548,8,370);
 F('box','#4f6d7a',80,10,22,680,7,355);F('box','#4f6d7a',80,16,6,680,16,346);F('box','#5f7f8c',6,14,22,642,10,355);F('box','#5f7f8c',6,14,22,718,10,355);
 F('cyl','#8a5a35',5,9,5,740,4.5,520);F('ico','#3b6a2c',10,13,10,740,19,520);
 F('box','#d8d2c4',186,24,22,449,12,738);F('box','#f4f4f2',22,50,22,335,25,738);F('box','#cfcfcf',.8,14,.6,345,30,726.6);F('box','#2b2b2b',22,1,18,419,24.5,738);for(const[x,z]of[[413,734],[425,734],[413,742],[425,742]])F('cyl','#555',3,1.2,3,x,25.3,z);
 F('box','#9a7048',30,22,1,501,11,726.8);F('box','#c8c0b0',170,16,10,455,52,744);
 F('box','#a07a50',60,3,34,620,20,640);for(const[x,z]of[[593,626],[647,626],[593,654],[647,654]])F('box','#7a5536',2,19,2,x,9.5,z);
 for(const[x,z]of[[602,614],[638,614],[602,666],[638,666]]){F('box','#8a6440',12,2,12,x,11,z);F('box','#8a6440',12,14,2,x,18,z+(z<640?-6:6))}
 F('cyl','#ffffff',5,.6,5,605,21.8,632);F('cyl','#ffffff',5,.6,5,635,21.8,648);
 F('cyl','#8a5a35',17,8,17,862,4,706);F('cyl','#c94a4a',13,8.6,13,862,4.3,706);F('cyl','#9aa0a6',5,3,5,820,1.5,730);F('cyl','#9aa0a6',4.5,3,4.5,905,1.5,670);
 F('box','#c9b08a',26,3,26,882,1.5,612);F('cyl','#d8c49a',3,32,3,874,16,606);F('cyl','#d8c49a',3,46,3,890,23,618);F('cyl','#e6d6b6',9,2.5,9,874,32,606);F('cyl','#e6d6b6',9,2.5,9,890,46,618);
 // naboens hus
 F('box','#a07a50',50,3,30,2650,20,448);for(const[x,z]of[[2630,438],[2670,438],[2630,458],[2670,458]])F('box','#7a5536',2,19,2,x,9.5,z);
 F('box','#7a4d6a',80,10,22,2880,7,360);F('box','#7a4d6a',80,16,6,2880,16,351);F('box','#d8d2c4',150,24,22,2587,12,646);F('cyl','#8a5a35',5,9,5,2930,4.5,640);F('ico','#3b6a2c',10,13,10,2930,19,640);
 F('box','#8a6440',40,26,20,3408,13,302);F('box','#c9b06a',36,8,16,3408,28,302);
 // stald: inventar
 for(const s of STALLS){F('box','#6a4a2a',22,12,12,s.x+20,30,742);F('box','#c9b06a',20,4,10,s.x+20,37,742);F('cyl','#3f6f9a',6,10,6,s.x+112,24,742)}
 for(const x of[1226,1354]){F('cyl','#6a4a2a',3,56,3,x,28,1022);F('cyl','#c9a54a',2.2,1,2.2,x,46,1019)}
 for(const x of[1391,1413]){F('box','#3a3a3a',3,3,12,x,34,1088);F('sph','#5a3418',8,4,7,x,38,1086);F('box','#f3efe6',14,10,1.5,x,32,1082)}
 F('box','#6a4a2a',76,4,2,1483,56,1085);['grebe','kost','skovl','børste'].forEach((k,i)=>{const g=toolStand(k);g.position.set(1454+i*19,0,1080);scene.add(g);toolMeshes[k]=g});
 for(const[x,y,z]of[[1821,10,967],[1821,10,991],[1853,10,967],[1837,30,979]])F('box','#d6c08a',30,20,22,x,y,z);
 for(const[x,c]of[[1870,'#2f6b3a'],[1904,'#a33b3b'],[1932,'#7a8a90']]){F('cyl',c,11,24,11,x,12,1045);F('cyl',shade(c,-25),11.5,2,11.5,x,25,1045)}
 F('box','#3f6b3a',26,9,18,1647,13,1050);F('cyl','#222',5,3,5,1660,5,1050).rotation.x=Math.PI/2;F('box','#555',22,1.5,1.5,1632,14,1044);F('box','#555',22,1.5,1.5,1632,14,1056);
 F('box','#7a8a90',56,13,18,1910,6.5,293);F('box','#7fc1d6',52,1,14,1910,12.6,293);
 // kaniner
 F('box','#8a5a35',70,26,46,463,21,911);for(const[x,z]of[[431,891],[495,891],[431,931],[495,931]])F('box','#6a4a2a',3,8,3,x,4,z);
 const rf=F('box','#b05a3a',78,3,54,463,38,911);rf.rotation.x=.18;F('box','#3a2416',20,16,1,450,21,934.6);
 F('cyl','#6fb7c9',2.4,14,2.4,625,22,882);F('cyl','#9aa0a6',5,2.4,5,600,1.2,990);F('box','#a07a50',34,16,26,665,8,941);
 // bil og trailer
 const car=grp(scene,1010,0,268);
 part('box','#355f43',116,24,54,0,20,0,car);part('box','#2a4a34',64,22,50,8,42,0,car);part('box','#9fc6d8',30,18,51,-6,42,0,car,false);part('box','#9fc6d8',62,16,50.6,9,43,0,car,false);part('box','#2a4a34',64,2,50,8,53,0,car);
 for(const z of[-16,16]){part('box','#f3d27a',1,5,9,-58.4,22,z,car,false);part('box','#c0392b',1,5,9,58.4,22,z,car,false)}
 for(const[x,z]of[[-36,-27],[-36,27],[36,-27],[36,27]]){const w=part('cyl','#1d1d1f',10,6,10,x,10,z,car);w.rotation.x=Math.PI/2;const r=part('cyl','#9a9a9a',4.5,6.4,4.5,x,10,z,car,false);r.rotation.x=Math.PI/2}
 part('box','#4d4d50',16,3,3,64,10,0,car);
 const tr=grp(scene,1130,0,268);part('box','#ddd8cb',98,60,58,0,42,0,tr);part('box','#7b4a26',98,4,58.6,0,30,0,tr);part('box','#4a6e8f',26,12,58.8,-20,58,0,tr,false);part('box','#bcb5a5',2,52,54,49.5,40,0,tr);
 for(const z of[-31,31]){const w=part('cyl','#1d1d1f',10,6,10,0,10,z,tr);w.rotation.x=Math.PI/2}
 // skilte, postkasse, lygter
 const sign=(txt,x,z,w)=>{part('box','#5a3418',3,46,3,x-w/2+4,23,z,scene);part('box','#5a3418',3,46,3,x+w/2-4,23,z,scene);const m=new THREE.Mesh(GEO.box,boardMat(txt,w,18));m.scale.set(w,18,2.5);m.position.set(x,40,z);m.castShadow=true;scene.add(m)};
 sign((G.look.name||'Min')+'s ranch',1169,206,84);sign('Birgittes hestehold',2782,870,100);sign('Skov og strand ↓',2251,940,86);
 part('box','#5a3418',2.5,30,2.5,900,15,212,scene);part('box','#c0392b',10,8,14,900,32,212,scene);
 lampPost(560,790);lampPost(1500,1112);lampPost(2650,700);lampPost(1215,216);
 // nabo og etiketter
 npcE={P:buildPerson(NPC.look)};npcE.P.root.position.set(NPC.x,0,NPC.y);npcE.P.root.rotation.y=Math.PI;posePerson(npcE.P,{});scene.add(npcE.P.root);
 for(const[t,x,z,h]of[['Toilet',330,376,34],['Badekar',446,348,28],['Håndvask',322,491,46],['Førstehjælp',420,520,56],['Seng',850,400,36],['Computer',548,343,44],['Køleskab',335,738,60],['Komfur',419,738,36],['Dyrefoder',501,738,36],['Spisebord',620,640,34],['Hundekurv',862,706,20],['Kradsetræ',882,612,60],['Opstaldning',1290,1022,66],['Sadler',1402,1086,52],['Redskaber',1483,1084,66],['Foderrum',1870,1000,52],['Kaninfoder',665,941,28],['Kaninhop',640,1125,20],['Spring-knap',BTN.x,BTN.y,58],['Bil og trailer',CAR.x+60,268,74],['Birgitte',NPC.x,NPC.y,64],['Hundeskål',820,730,12],['Katteskål',905,670,12]]){const s=makeTag(t,6);s.position.set(x,h,z);s.userData.x=x;s.userData.z=z;s.visible=false;scene.add(s);stationTags.push(s)}
 for(const s of STALLS){const t=makeTag('Boks '+(s.i+1),7,'#e9dcc0');t.position.set(s.cx,46,874);t.material.depthTest=true;scene.add(t);stallTags.push(t)}
 // møg, partikler, spiller
 poopInst=new THREE.InstancedMesh(GEO.sphL,mat('#5e4528'),200);poopInst.count=0;poopInst.castShadow=true;scene.add(poopInst);
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(1200),3));pg.setAttribute('color',new THREE.BufferAttribute(new Float32Array(1200),3));
 ptsObj=new THREE.Points(pg,new THREE.PointsMaterial({size:3.4,vertexColors:true,transparent:true,opacity:.9}));ptsObj.frustumCulled=false;scene.add(ptsObj);
 playerE={P:buildPerson(G.look),yaw:G.P.fa||0,held:undefined};scene.add(playerE.P.root);
 zzz=makeTag('Zzz',10,'rgba(0,0,0,0)','#ffffff');zzz.visible=false;scene.add(zzz)}
function buildTrees(){
 const T=[],ZERO=new THREE.Matrix4().makeScale(1e-4,1e-4,1e-4);
 const tr=[],cn=[],sp=[];
 TREES.forEach((t,ti)=>{const s=t.s,d={x:t.x,z:t.y,r2:(46*s)**2,h:false,parts:[]};
  if(t.k==='pine'){tr.push([d,t.x,t.y,4*s,44*s,'#5b3d26']);for(const[y,r,h,c]of[[22,36,60,'#2f5a36'],[55,28,52,'#356642'],[85,20,44,'#3d7149']])cn.push([d,t.x,(y+h/2)*s,t.y,r*s,h*s,c])}
  else if(t.k==='birch'){tr.push([d,t.x,t.y,3.6*s,96*s,'#ece8df']);for(const[x,y,z,r,c]of[[0,96,0,24,'#8ab35a'],[-14,84,6,18,'#7aa34e'],[14,86,-6,19,'#94bd63'],[2,114,0,17,'#a2c86e']])sp.push([d,t.x+x*s,y*s,t.y+z*s,r*s,c])}
  else{tr.push([d,t.x,t.y,6*s,64*s,'#6a4a30']);for(const[x,y,z,r,c]of[[0,88,0,40,'#4f7f3a'],[-26,74,8,28,'#457334'],[25,76,-8,30,'#5a8a43'],[4,110,4,28,'#659a4c'],[-8,96,24,24,'#72a656'],[12,92,-24,24,'#55863f']])sp.push([d,t.x+x*s,y*s,t.y+z*s,r*s,c])}
  T.push(d)});
 const mk=(geo,n,flat)=>{const m=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:'#ffffff',flatShading:flat}),n);m.castShadow=true;m.receiveShadow=true;scene.add(m);treeMeshes.push(m);return m};
 const mT=mk(GEO.cylL,tr.length,false),mC=mk(GEO.cone8,cn.length,true),mS=mk(GEO.ico,sp.length,true),col=new THREE.Color(),q=new THREE.Quaternion(),v=new THREE.Vector3(),sc=new THREE.Vector3();
 const put=(m,i,d,x,y,z,sx,sy,sz,c)=>{const mx=new THREE.Matrix4().compose(v.set(x,y,z),q,sc.set(sx,sy,sz));m.setMatrixAt(i,mx);m.setColorAt(i,col.set(c));d.parts.push([m,i,mx])};
 tr.forEach(([d,x,z,r,h,c],i)=>put(mT,i,d,x,h/2,z,r,h,r,c));
 cn.forEach(([d,x,y,z,r,h,c],i)=>put(mC,i,d,x,y,z,r,h,r,c));
 sp.forEach(([d,x,y,z,r,c],i)=>put(mS,i,d,x,y,z,r,r*.9,r,c));
 treeData=T;treeData.ZERO=ZERO}
function updOcclusion(){const cx=camera.position.x,cz=camera.position.z,vx=CAMS.x-cx,vz=CAMS.z-cz,L2=vx*vx+vz*vz||1;let ch=false;
 for(const T of treeData){const t=((T.x-cx)*vx+(T.z-cz)*vz)/L2;let hide=false;if(t>-.05&&t<1.1){const px=cx+vx*t,pz=cz+vz*t;hide=(T.x-px)**2+(T.z-pz)**2<T.r2}
  if(hide!==T.h){T.h=hide;ch=true;for(const[m,i,mx]of T.parts)m.setMatrixAt(i,hide?treeData.ZERO:mx)}}
 if(ch)for(const m of treeMeshes)m.instanceMatrix.needsUpdate=true}

/* ---------- 3D: kamera og styring ---------- */
const CAMS={yaw:0,pitch:.62,dist:innerWidth<innerHeight?340:250,x:0,y:0,z:0,init:false,ep:.62,ed:innerWidth<innerHeight?340:250};
const ptrs=new Map();let pinchD=0,lastDrag=0;
cv.style.touchAction='none';
cv.addEventListener('pointerdown',e=>{ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});try{cv.setPointerCapture(e.pointerId)}catch(_){}if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinchD=Math.hypot(a.x-b.x,a.y-b.y)}});
cv.addEventListener('pointermove',e=>{const o=ptrs.get(e.pointerId);if(!o)return;const dx=e.clientX-o.x,dy=e.clientY-o.y;o.x=e.clientX;o.y=e.clientY;
 lastDrag=performance.now();if(ptrs.size===1){CAMS.yaw-=dx*.007;CAMS.pitch=clamp(CAMS.pitch+dy*.005,.2,1.4)}
 else if(ptrs.size===2){const[a,b]=[...ptrs.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinchD)CAMS.dist=clamp(CAMS.dist*pinchD/d,90,560);pinchD=d}});
const pend=e=>{ptrs.delete(e.pointerId);pinchD=0};cv.addEventListener('pointerup',pend);cv.addEventListener('pointercancel',pend);
cv.addEventListener('wheel',e=>{e.preventDefault();CAMS.dist=clamp(CAMS.dist*(1+e.deltaY*.001),90,560)},{passive:false});
function camRotKeys(dt){if(keys.q||keys.c)lastDrag=performance.now();if(keys.q)CAMS.yaw+=dt*1.6;if(keys.c)CAMS.yaw-=dt*1.6;const h=G.P.riding&&getA(G.P.riding);if(h&&h.moving&&performance.now()-lastDrag>1500)CAMS.yaw=lerpAng(CAMS.yaw,Math.atan2(-Math.cos(RD.heading),-Math.sin(RD.heading)),Math.min(1,dt*1.3))}
function updCamera(dt){const p=G.P,inside=inR(p.x,p.y,HOUSE)||inR(p.x,p.y,STABLE)||inR(p.x,p.y,NHOUSE);camRotKeys(dt);
 const tp=inside?Math.max(CAMS.pitch,.95):CAMS.pitch,td=inside?Math.min(CAMS.dist,240):CAMS.dist,ty=p.riding?62:p.sleeping&&p.inBed?20:30,px=p.sleeping&&p.inBed?850:p.x,pz=p.sleeping&&p.inBed?420:p.y;
 if(!CAMS.init){CAMS.x=px;CAMS.y=ty;CAMS.z=pz;CAMS.init=true}
 const k=Math.min(1,dt*7);CAMS.x+=(px-CAMS.x)*k;CAMS.y+=(ty-CAMS.y)*k;CAMS.z+=(pz-CAMS.z)*k;CAMS.ep+=(tp-CAMS.ep)*Math.min(1,dt*4);CAMS.ed+=(td-CAMS.ed)*Math.min(1,dt*4);
 const cp=Math.cos(CAMS.ep)*CAMS.ed;camera.position.set(CAMS.x+Math.sin(CAMS.yaw)*cp,CAMS.y+Math.sin(CAMS.ep)*CAMS.ed,CAMS.z+Math.cos(CAMS.yaw)*cp);camera.lookAt(CAMS.x,CAMS.y,CAMS.z)}

/* ---------- 3D: render ---------- */
const PCOL={};let lastRT=0,gT=0,groundSig='',occT=0,slowT=0;
const tmpA=new THREE.Vector3(),tmpB=new THREE.Vector3(),SKYD=new THREE.Color('#a9d4e8'),SKYN=new THREE.Color('#0e1633'),SKYE=new THREE.Color('#f2b38a');
const ropeMat=new THREE.LineBasicMaterial({color:0x4a2e14}),ropes=[];
function setRope(i,a,b,sag){if(!ropes[i]){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(36),3));const l=new THREE.Line(g,ropeMat);l.frustumCulled=false;scene.add(l);ropes[i]=l}
 const l=ropes[i],arr=l.geometry.attributes.position.array;l.visible=true;for(let k=0;k<12;k++){const t=k/11;arr[k*3]=a.x+(b.x-a.x)*t;arr[k*3+1]=a.y+(b.y-a.y)*t-Math.sin(Math.PI*t)*sag;arr[k*3+2]=a.z+(b.z-a.z)*t}l.geometry.attributes.position.needsUpdate=true}
function animEntity(e,a,dt,t){
 const dx=a.x-e.px,dy=a.y-e.py;let tg=null;
 if(a.state==='ridden')tg=RD.heading;else if(a.state==='tied')tg=0;else if(dx*dx+dy*dy>.0004)tg=Math.atan2(dy,dx);
 if(tg!==null)e.yaw=lerpAng(e.yaw,tg,Math.min(1,dt*(a.state==='ridden'?14:6)));e.px=a.x;e.py=a.y;
 let lift=0;
 if(a.state==='ridden'&&RD.jumpT>0)lift=Math.sin(Math.PI*(1-RD.jumpT/JUMPDUR))*(10+Math.max(55,G.arenaH)/100*M*.85);
 else if(a.jumpT>0)lift=Math.sin(Math.PI*clamp(1-a.jumpT/(a.state==='led'?.5:.35),0,1))*(a.state==='led'?12:3);
 const R=e.P.root;R.position.set(a.x,lift,a.y);R.rotation.y=-e.yaw;
 if(a.type==='horse'){const rid=a.state==='ridden';
  animHorse(e.P,{moving:a.moving,phase:a.walk||0,amp:rid?[.2,.32,.5,.72][RD.gait]:.32,gait:rid?Math.max(1,RD.gait):1,tuck:rid&&RD.jumpT>0,graze:!a.moving&&a.idle>0&&!rid&&a.state!=='led'&&a.state!=='tied'&&(a.zone==='paddock'||!a.id),t});
  e.P.saddle.visible=!!a.saddled;e.P.bridle.visible=!!(a.saddled||a.state==='led'||a.state==='tied')}
 else animSmall(e.P,a,t);
 if(e.tag){const hh=(a.type==='horse'?2.35*(HB[a.breed]||{s:1}).s:a.type==='dog'?.95:a.type==='cat'?.75:.6)*M;e.tag.position.set(a.x,lift+hh+6,a.y);e.tag.visible=a.state!=='ridden'&&dist(G.P.x,G.P.y,a.x,a.y)<170}}
function render(){
 if(!WORLD)buildWorld();
 const t=performance.now()/1000,dt=Math.min(.05,t-(lastRT||t));lastRT=t;const p=G.P;
 if(jumpGroup.userData.h!==G.arenaH)buildJumps();
 if(t-gT>2){gT=t;const sig=G.stallDirt.map(v=>Math.round(v/5)).join()+'|'+Math.round(G.aisleDirt/5);if(sig!==groundSig){groundSig=sig;paintGround();groundTex.needsUpdate=true}}
 // dyr
 const live=new Set();
 for(const a of G.animals){live.add(a.id);let e=AM.get(a.id);const key=a.type+'|'+a.breed+'|'+a.coat;
  if(!e||e.key!==key){if(e){scene.remove(e.P.root);scene.remove(e.tag)}e={P:buildAnimal(a),key,yaw:a.dir>0?0:Math.PI,px:a.x,py:a.y,tag:makeTag(a.name,7)};scene.add(e.P.root);scene.add(e.tag);AM.set(a.id,e)}
  setTag(e.tag,a.name);animEntity(e,a,dt,t)}
 for(const[id,e]of AM)if(!live.has(id)&&!id.startsWith('nb')){scene.remove(e.P.root);scene.remove(e.tag);AM.delete(id)}
 NB.forEach((n,i)=>{let e=AM.get('nb'+i);if(!e){e={P:buildHorse(n),key:'nb',yaw:0,px:n.x,py:n.y,tag:makeTag(n.name,8)};scene.add(e.P.root);scene.add(e.tag);AM.set('nb'+i,e)}animEntity(e,n,dt,t)});
 // spiller
 const PE=playerE,PR=PE.P.root;
 if(PE.held!==p.holding){PE.held=p.holding;PE.P.hand.clear();if(p.holding)PE.P.hand.add(heldModel(p.holding))}
 let ri=0;
 if(p.riding&&getA(p.riding)){const h=getA(p.riding),e=AM.get(h.id);e.P.root.updateMatrixWorld(true);const seat=e.P.b.localToWorld(tmpA.set(-.04,1.7+e.P.body.position.y,0));
  PR.position.set(seat.x,seat.y-.9*M,seat.z);PR.rotation.set(0,-e.yaw,0);
  posePerson(PE.P,{ride:true,helmet:true,lean:RD.jumpT>0?-.4:RD.gait===3&&h.moving?-.22:-.04});
  PE.P.b.position.y=RD.gait===2&&h.moving?Math.max(0,Math.sin(h.walk||0))*.06*M:0;
  PR.updateMatrixWorld(true);PE.P.hand.getWorldPosition(tmpA);e.P.muzzle.getWorldPosition(tmpB);setRope(ri++,tmpA,tmpB,2);
  PE.P.handL.getWorldPosition(tmpA);setRope(ri++,tmpA,tmpB,2)}
 else if(p.sleeping){if(p.inBed)PR.position.set(850,20,428);else PR.position.set(p.x,3,p.y);PR.rotation.set(-Math.PI/2,-Math.PI/2,0);posePerson(PE.P,{})}
 else{PE.yaw=lerpAng(PE.yaw,p.fa||0,Math.min(1,dt*12));PR.position.set(p.x,0,p.y);PR.rotation.set(0,-PE.yaw,0);posePerson(PE.P,{moving:p.moving,phase:p.walk,run:keys.shift,holding:p.holding})}
 zzz.visible=!!p.sleeping;if(p.sleeping){zzz.position.set(PR.position.x+10,PR.position.y+30+Math.sin(t*2)*4,PR.position.z-30)}
 // reb
 PR.updateMatrixWorld(true);
 for(const id of p.leading){const a=getA(id),e=a&&AM.get(id);if(!e)continue;e.P.root.updateMatrixWorld(true);PE.P.hand.getWorldPosition(tmpA);(e.P.muzzle||e.P.anchor).getWorldPosition(tmpB);setRope(ri++,tmpA,tmpB,a.type==='horse'?8:5)}
 for(const a of G.animals)if(a.state==='tied'){const e=AM.get(a.id);if(!e)continue;e.P.root.updateMatrixWorld(true);e.P.muzzle.getWorldPosition(tmpB);setRope(ri++,tmpA.set(1226,46,1019),tmpB,3);setRope(ri++,tmpA.set(1354,46,1019),tmpB,3)}
 for(let i=ri;i<ropes.length;i++)ropes[i].visible=false;
 // langsomme opdateringer
 if(t-slowT>.25){slowT=t;
  let n=0;const mx=new THREE.Matrix4();for(const q of G.poops){const r=q.r?.9:2.6;for(const[ox,oz,oy]of q.r?[[-2,0,0],[0,1,0],[2,-.5,0]]:[[-2.6,0,0],[2.6,.8,0],[0,-1.5,2.2]]){if(n>=200)break;mx.makeScale(r,r*.8,r).setPosition(q.x+ox,r*.7+oy,q.y+oz);poopInst.setMatrixAt(n++,mx)}}poopInst.count=n;poopInst.instanceMatrix.needsUpdate=true;
  for(const s of stationTags)s.visible=!p.riding&&dist(p.x,p.y,s.userData.x,s.userData.z)<150;
  STALLS.forEach((s,i)=>{const h=G.animals.find(a=>a.zone==='stall'+i&&a.type==='horse');setTag(stallTags[i],h?h.name:'Boks '+(i+1))});
  for(const k in toolMeshes)toolMeshes[k].visible=p.holding!==k}
 // partikler
 const pa=ptsObj.geometry.attributes.position.array,pc=ptsObj.geometry.attributes.color.array;let pn=0;
 for(const q of particles){if(pn>=400)break;if(q.y0===undefined){q.y0=q.y;q.zj=rnd(-10,10)}const c=PCOL[q.c]||(PCOL[q.c]=new THREE.Color(q.c));pa[pn*3]=q.x;pa[pn*3+1]=Math.max(.5,q.y0-q.y)+2;pa[pn*3+2]=q.y0+q.zj;pc[pn*3]=c.r;pc[pn*3+1]=c.g;pc[pn*3+2]=c.b;pn++}
 ptsObj.geometry.setDrawRange(0,pn);ptsObj.geometry.attributes.position.needsUpdate=true;ptsObj.geometry.attributes.color.needsUpdate=true;
 // hav
 const sp=seaMesh.geometry.attributes.position.array,sb=seaMesh.userData.base;for(let i=0;i<sp.length;i+=3)sp[i+1]=Math.sin(sb[i]/90+t*1.2)*1.4+Math.sin(sb[i+2]/55+t*.9)*1.1;seaMesh.geometry.attributes.position.needsUpdate=true;
 // bygninger gennemsigtige indefra
 for(const k in BLD){const b=BLD[k],inside=inR(p.x,p.y,b.R),tg=inside?.18:1;b.f=(b.f===undefined?1:b.f)+(tg-(b.f===undefined?1:b.f))*Math.min(1,dt*6);b.mat.opacity=b.f;b.mat.transparent=b.f<.98;b.mat.depthWrite=b.f>=.98;b.roof.visible=!inside;b.win.visible=b.f>.6;if(b.sh!==inside){b.sh=inside;for(const m of b.meshes)m.castShadow=!inside}}
 // lys og kamera
 updCamera(dt);
 const hf=(G.min%1440)/60;let d=hf<5?.6:hf<7?.6*(7-hf)/2:hf<19?0:hf<22?.6*(hf-19)/3:.6;if(p.sleeping)d=Math.max(d,.3);const n=d/.6,dusk=Math.max(0,1-Math.abs(hf-19.5)/1.5)*(1-n);
 sun.intensity=.95*(1-n)+.14*n;sun.color.set(n>.5?'#9fb3ff':(hf<8.5||hf>17.5)?'#ffd2a1':'#fff4de');hemi.intensity=.62*(1-n*.72);
 scene.background.copy(SKYD).lerp(SKYE,dusk*.6).lerp(SKYN,n);scene.fog.color.copy(scene.background);
 const az=clamp((hf-6)/12,0,1)*Math.PI;sun.position.set(CAMS.x+Math.cos(az)*520,260+Math.sin(az)*520,CAMS.z-300);sun.target.position.set(CAMS.x,0,CAMS.z);
 lantern.position.set(p.x,48,p.y);lantern.intensity=n*1.5;for(const l of lamps)l.intensity=n>.15?1.4*n:0;
 if(t-occT>.12){occT=t;updOcclusion()}
 renderer.render(scene,camera)}

/* ---------- previews ---------- */
let PV=null;
function pvR(){if(PV)return PV;const c=document.createElement('canvas');c.width=600;c.height=720;const r=new THREE.WebGLRenderer({canvas:c,antialias:true,alpha:true,preserveDrawingBuffer:true});r.setPixelRatio(1);r.setSize(600,720,false);r.setClearColor(0x000000,0);
 const s=new THREE.Scene();s.add(new THREE.HemisphereLight(0xffffff,0x6a7a4a,.75));const d=new THREE.DirectionalLight(0xfff2de,.75);d.position.set(220,400,300);s.add(d);
 const disc=new THREE.Mesh(GEO.cyl,mat('#a9c77a'));s.add(disc);PV={c,r,s,cam:new THREE.PerspectiveCamera(30,1,1,5000),disc,obj:null,key:'',pets:[]};return PV}
function drawPreview(){const V=pvR(),k=JSON.stringify(LOOK),t=performance.now()/1000;
 if(V.key!==k){if(V.obj)V.s.remove(V.obj.root);V.obj=buildPerson(LOOK);V.s.add(V.obj.root);V.key=k}
 posePerson(V.obj,{helmet:false});V.obj.root.rotation.y=-Math.PI/2+Math.sin(t*.6)*.7;V.obj.root.visible=true;
 V.disc.scale.set(30,2,30);V.disc.position.set(0,-1,0);V.r.setScissorTest(false);V.r.setViewport(0,0,600,720);V.cam.aspect=600/720;V.cam.updateProjectionMatrix();V.cam.position.set(0,32,118);V.cam.lookAt(0,25,0);
 V.r.render(V.s,V.cam);const c2=$('#pv').getContext('2d');c2.clearRect(0,0,600,720);c2.drawImage(V.c,0,0)}
function drawPetPreviews(){const V=pvR(),t=performance.now()/1000;if(V.obj)V.obj.root.visible=false;
 document.querySelectorAll('[data-pc]').forEach(cn=>{const i=+cn.dataset.pc,s=PS[i],k=s.type+s.breed+s.coat;let o=V.pets[i];
  if(!o||o.key!==k){if(o)V.s.remove(o.P.root);o=V.pets[i]={key:k,P:buildAnimal({...s,x:0,y:0})};V.s.add(o.P.root)}
  V.pets.forEach(q=>{if(q)q.P.root.visible=q===o});
  const B=BREEDS[s.type][s.breed],S=({horse:2.9,dog:1.05,cat:.8,rabbit:.6})[s.type]*B.s*M;
  if(s.type==='horse'){o.P.saddle.visible=false;o.P.bridle.visible=false;animHorse(o.P,{t})}else animSmall(o.P,{walk:0,moving:false,x:i},t);
  o.P.root.rotation.y=-.45;V.disc.scale.set(S*.75,2,S*.75);V.disc.position.set(0,-1,0);
  V.r.setViewport(0,0,440,240);V.r.setScissor(0,0,440,240);V.r.setScissorTest(true);V.r.clear();V.cam.aspect=440/240;V.cam.updateProjectionMatrix();V.cam.position.set(S*.3,S*.5,S*1.95);V.cam.lookAt(0,S*.36,0);V.r.render(V.s,V.cam);
  const c2=cn.getContext('2d');c2.clearRect(0,0,440,240);c2.drawImage(V.c,0,720-240,440,240,0,0,440,240)});
 V.r.setScissorTest(false);V.pets.forEach(q=>{if(q)q.P.root.visible=false})}
