// Ranchlivet – Bevægelse, dyr, ridning og spring
'use strict';

/* ---------- update ---------- */
const keys={};let JOY={x:0,y:0};
function inputVec(){let x=JOY.x,y=JOY.y;if(keys.a||keys.arrowleft)x--;if(keys.d||keys.arrowright)x++;if(keys.w||keys.arrowup)y--;if(keys.s||keys.arrowdown)y++;const m=Math.hypot(x,y);if(m>1){x/=m;y/=m}const cy=Math.cos(CAMS.yaw),sy=Math.sin(CAMS.yaw);return{x:x*cy+y*sy,y:-x*sy+y*cy}}
function wander(a,dt,R,spd){
 if(!R){a.moving=false;return}
 if(a.idle>0){a.idle-=dt;a.moving=false;return}
 if(!a.tx||!inR(a.tx,a.ty,R,40)){a.tx=R.x+Math.random()*R.w;a.ty=R.y+Math.random()*R.h}
 const dx=a.tx-a.x,dy=a.ty-a.y,d=Math.hypot(dx,dy);
 if(d<4){a.idle=2+Math.random()*7;a.tx=0;a.moving=false;return}
 const v=Math.min(d,spd*dt);a.x+=dx/d*v;a.y+=dy/d*v;if(Math.abs(dx)>1)a.dir=dx>=0?1:-1;a.moving=true;a.walk+=v*.11;
}
function follow(a,i,dt){const p=G.P,off=a.type==='horse'?48:a.type==='dog'?30:22,fa=p.fa||0,bk=off+i*14,sd=(i?i*12:10),tx=p.x-Math.cos(fa)*bk-Math.sin(fa)*sd,ty=p.y-Math.sin(fa)*bk+Math.cos(fa)*sd,dx=tx-a.x,dy=ty-a.y,d=Math.hypot(dx,dy);
 if(d>400){a.x=tx;a.y=ty;return}if(d>3){const v=Math.min(d,Math.max(70,d*3.4)*dt);a.x+=dx/d*v;a.y+=dy/d*v;if(Math.abs(dx)>1)a.dir=dx>=0?1:-1;a.moving=d>5;a.walk+=v*.11}else a.moving=false}
function update(dt){
 const p=G.P;
 const scale=p.sleeping?60:G.task?G.task.m/G.task.d:1;
 G.acc=(G.acc||0)+dt*scale;let n=0;while(G.acc>=1&&n<200){G.acc-=1;tickMinute();n++}
 if(G.task){G.task.t+=dt;if(G.task.t>=G.task.d){const f=G.task.f;G.task=null;f&&f();for(const k in p.needs)p.needs[k]=clamp(p.needs[k],0,100)}}
 RD.refCD-=dt;RD.msgCD-=dt;
 if(!G.task&&!p.sleeping&&!modalOpen){if(p.riding)updRiding(dt);else updWalk(dt)}else{p.moving=false;if(p.riding){const h=getA(p.riding);if(h)h.moving=false}}
 let li=0;for(const a of G.animals){
  if(a.jumpT>0)a.jumpT-=dt;
  if(a.state==='ridden')continue;
  if(a.state==='led'){follow(a,li++,dt);if(a.type==='rabbit')rabbitCourse(a);continue}
  if(a.state==='tied'){a.x+=(CROSS.x-a.x)*.2;a.y+=(CROSS.y-a.y)*.2;a.dir=1;a.moving=false;continue}
  let z=a.zone;if(a.type==='dog'||a.type==='cat'){const h=hour();if(!a.zone2||Math.random()<dt/40)a.zone2=(h>=21||h<7)?'house':a.type==='dog'?(Math.random()<.75?'yard':'porch'):(Math.random()<.6?'house':'porch');z=a.zone2;if(a.zone===null)z=null}
  wander(a,dt,zoneRect(z),{horse:28,dog:46,cat:30,rabbit:22}[a.type]);
  if(a.type==='rabbit'&&a.moving&&a.jumpT<=0&&Math.random()<dt*2)a.jumpT=.35;
 }
 for(const nbh of NB)wander(nbh,dt,NBZ,26);
 particles=particles.filter(q=>(q.l-=dt)>0);for(const q of particles){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=q.g*dt}
}
function rabbitCourse(a){a._in=a._in||{};HURDLES.forEach((hd,i)=>{const over=hitsRect(a.x,a.y,4,hd);
 if(over&&!a._in[i]){a._in[i]=1;if(a.jumpT>0){a.hop=(a.hop||0)|(1<<i);a.skill=Math.min(100,a.skill+.4);for(let k=0;k<5;k++)particles.push({x:a.x,y:a.y,vx:rnd(-30,30),vy:rnd(-40,-10),g:80,l:.5,c:'#e9f3c9',r:1.5})}else{a.hop=0;toast(a.name+' væltede springet – tryk Hop lige før.')}}
 if(!over&&a._in[i])a._in[i]=0});
 if(a.hop===15){a.hop=0;a.skill=Math.min(100,a.skill+3);a.happy=clamp(a.happy+5,0,100);toast('🐇 Fejlfri runde med '+a.name+'! Hun bliver dygtigere.')}}
function updWalk(dt){
 const p=G.P,N=p.needs,iv=inputVec();let sp=keys.shift?175:112;if(N.energi<15||N.helbred<30)sp*=.6;if(p.y>2470)sp*=.6;if(p.holding==='mad')sp*=.8;
 const m=Math.hypot(iv.x,iv.y);
 if(m>.05){const dx=iv.x*sp*dt,dy=iv.y*sp*dt;const ox=p.x,oy=p.y;
  if(!blocked(p.x+dx,p.y,10,false))p.x+=dx;if(!blocked(p.x,p.y+dy,10,false))p.y+=dy;
  p.fa=Math.atan2(iv.y,iv.x);if(Math.abs(iv.x)>.1)p.dir=iv.x>0?1:-1;p.moving=true;p.walk+=dt*sp*.09;
  const moved=Math.hypot(p.x-ox,p.y-oy);
  const dogs=p.leading.map(getA).filter(a=>a&&a.type==='dog');
  if(dogs.length&&!inR(p.x,p.y,RANCH)){G.walkDist=(G.walkDist||0)+moved;if(G.walkDist>1800){G.walkDist=0;dogs.forEach(a=>{a.walked=dayN();a.happy=clamp(a.happy+20,0,100)});N.humoer=clamp(N.humoer+8,0,100);toast('🐕 Dejlig gåtur! '+dogs.map(a=>a.name).join(' og ')+' er glad.')}}
  if(keys.shift&&(inR(p.x,p.y,FOREST)||p.y>2050)&&Math.random()<dt*.04){N.helbred-=8;toast('Av! Du snublede over en rod og slog dig.',1)}
  if(p.y>2470&&Math.random()<dt*6)particles.push({x:p.x+rnd(-6,6),y:p.y,vx:rnd(-20,20),vy:rnd(-40,-15),g:120,l:.4,c:'#e6f6fb',r:1.6});
 }else p.moving=false;
}
function updRiding(dt){
 const p=G.P,h=getA(p.riding);if(!h){p.riding=null;return}const B=HB[h.breed],iv=inputVec();
 if(Math.hypot(iv.x,iv.y)>.3){const tg=Math.atan2(iv.y,iv.x);let df=tg-RD.heading;while(df>Math.PI)df-=2*Math.PI;while(df<-Math.PI)df+=2*Math.PI;const tr=(RD.gait===0?4:RD.gait===3?2.2:3)*dt;RD.heading+=clamp(df,-tr,tr)}
 let sp=GSPD[RD.gait]*TM[RD.tempo]*B.speed*(.85+h.skill/600);if(p.y>2470)sp*=.75;
 if(RD.jumpT>0){RD.jumpT-=dt;for(const j of activeJumps())if(hitsRect(p.x,p.y,20,j))RD.over.add(j);if(RD.jumpT<=0)land(h,B)}
 const jumping=RD.jumpT>0,vx=Math.cos(RD.heading)*sp*dt,vy=Math.sin(RD.heading)*sp*dt;
 if(sp>0){let b=blocked(p.x+vx,p.y,16,jumping);if(!b)p.x+=vx;else refuse(b,h);b=blocked(p.x,p.y+vy,16,jumping);if(!b)p.y+=vy;else refuse(b,h)}
 h.x=p.x;h.y=p.y;p.fa=RD.heading;if(Math.abs(Math.cos(RD.heading))>.15)p.dir=Math.cos(RD.heading)>=0?1:-1;h.dir=p.dir;h.moving=sp>0;h.walk+=sp*dt*(RD.gait===3?.06:.085);
 h.happy=clamp(h.happy+dt*.02,0,100);if(RD.gait>=2)h.skill=Math.min(100,h.skill+dt*.004);
 if(p.y>2470&&sp>0){RD.splash-=dt;if(RD.splash<=0){RD.splash=.04;for(let k=0;k<3;k++)particles.push({x:p.x+rnd(-18,18),y:p.y,vx:rnd(-50,50),vy:rnd(-90,-30)*(RD.gait/2+.5),g:220,l:.55,c:'#eaf7fb',r:2})}if(RD.msgCD<=0){RD.msgCD=40;toast('🌊 Plask! '+h.name+' elsker at gå i vandkanten.');h.happy=clamp(h.happy+5,0,100)}}
}
function refuse(b,h){if(b===true||RD.refCD>0)return;if(RD.gait>=2){RD.refCD=1.5;RD.gait=0;h.happy-=1;toast(h.name+' nægtede springet! Tryk SPRING lige før forhindringen.',1)}}
function jump(){if(!G.P.riding||RD.jumpT>0)return;if(RD.gait<2){toast('Du skal trave eller galopere for at springe.');return}RD.jumpT=JUMPDUR;RD.over=new Set()}
function land(h,B){if(!RD.over.size)return;const p=G.P;
 for(const j of RD.over){const ht=j.kind==='arena'?G.arenaH:55,cap=B.jump*(.7+h.skill/300)*(RD.gait===3?1.05:.9),ratio=ht/cap,pS=clamp(1.2-ratio,.1,.97);
  if(Math.random()<pS){h.skill=Math.min(100,h.skill+.8);p.needs.humoer=clamp(p.needs.humoer+3,0,100);toast(j.kind==='arena'?'✔ Flot spring over '+ht+' cm!':'✔ Flot – I sprang over træstammen!')}
  else{if((RD.gait===3&&RD.tempo===2&&Math.random()<.35)||Math.random()<.12*ratio){p.needs.helbred-=rnd(15,30);toast('Av! Du faldt af '+h.name+' og slog dig. Brug førstehjælpskassen i badeværelset.',1);dismount(true);return}
   toast(j.kind==='arena'?'Bom ned! '+h.name+' ramte springet – prøv igen.':h.name+' snublede over stammen.',1)}}}
function gait(d){if(!G.P.riding)return;RD.gait=clamp(RD.gait+d,0,3)}
function tempo(d){if(!G.P.riding)return;RD.tempo=clamp(RD.tempo+d,0,2)}
