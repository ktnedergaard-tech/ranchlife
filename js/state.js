// Ranchlivet – Spiltilstand, kollision, beskeder, behov og tid
'use strict';

/* ---------- state ---------- */
let G=null,screen='title';
const RD={gait:0,tempo:1,heading:0,jumpT:0,over:new Set(),refCD:0,splash:0,msgCD:0};
const GAITS=['Holdt','Skridt','Trav','Galop'],GSPD=[0,60,125,215],TEMPO=['Langsom','Normal','Hurtig'],TM=[.7,1,1.3],JUMPDUR=.62;
const TOOLS={grebe:'Grebe',kost:'Kost',skovl:'Skovl',børste:'Strigle/børste'};
const ITEMN={grebe:'🔱 Grebe',kost:'🧹 Kost',skovl:'🪣 Skovl',børste:'🪮 Børste',hestefoder:'🌾 Hestefoder',hundefoder:'🦴 Hundefoder',kattefoder:'🐟 Kattefoder',kaninfoder:'🥕 Kaninfoder',mad:'🍲 Aftensmad'};
const FOODSTOCK={hestefoder:'heste',hundefoder:'hunde',kattefoder:'katte',kaninfoder:'kanin'};
let particles=[];
const getA=id=>G.animals.find(a=>a.id===id);
const dayN=()=>Math.floor(G.min/1440);
const hour=()=>Math.floor((G.min%1440)/60);
function makeAnimal(type,breed,name,coat){return{id:'a'+(G.nextId++),type,breed,name,coat:coat||0,x:0,y:0,dir:1,full:75,happy:80,clean:70,skill:type==='horse'?25:15,state:'free',zone:null,saddled:false,tx:0,ty:0,idle:0,walk:0,jumpT:0,poopT:Math.random()*100,fm:-1,fa:-1,walked:-1,moving:false}}
function placeIn(a,zone){a.zone=zone;const R=zoneRect(zone);if(R){a.x=R.x+Math.random()*R.w;a.y=R.y+Math.random()*R.h}}
function zoneRect(z){
 if(!z)return null;
 if(z==='paddock')return{x:1240,y:290,w:680,h:320};
 if(z.startsWith('stall')){const s=STALLS[+z.slice(5)];return{x:s.cx-40,y:780,w:80,h:60}}
 if(z==='cage')return{x:445,y:905,w:170,h:80};
 if(z==='yard')return{x:700,y:900,w:420,h:260};
 if(z==='house')return{x:520,y:580,w:360,h:150};
 if(z==='porch')return{x:620,y:790,w:420,h:130};
 return null;
}
function zoneName(a){if(a.state==='ridden')return'Rides';if(a.state==='led')return a.type==='horse'?'I træktov':'I snor';if(a.state==='tied')return'Opstaldningsplads';const z=a.zone;if(!z)return'Løs';if(z==='paddock')return'Folden';if(z.startsWith('stall'))return'Boks '+(+z.slice(5)+1);return{cage:'Kaninburet',yard:'Gården',house:'Huset',porch:'Ved huset'}[z]||z}

/* ---------- collision ---------- */
function hitsRect(x,y,r,R){const cx=clamp(x,R.x,R.x+R.w),cy=clamp(y,R.y,R.y+R.h);return(x-cx)*(x-cx)+(y-cy)*(y-cy)<r*r}
function activeJumps(){return G.arenaH>0?AJ.concat(LOGS):LOGS}
function blocked(x,y,r,jumping){
 if(x<r||y<96||x>W-r||y>H-r||y>2585)return true;
 for(const s of SOLIDS)if(hitsRect(x,y,r,s))return true;
 for(const t of TREES){const rr2=r+8*t.s;if((x-t.x)*(x-t.x)+(y-t.y)*(y-t.y)<rr2*rr2)return true}
 if(!jumping)for(const j of activeJumps())if(hitsRect(x,y,r,j))return j;
 return false;
}

/* ---------- toasts / modal ---------- */
function toast(m,bad){const t=document.createElement('div');t.className='toast'+(bad?' bad':'');t.textContent=m;const box=$('#toasts');box.appendChild(t);while(box.children.length>4)box.firstChild.remove();setTimeout(()=>t.remove(),4800)}
let modalOpen=false;
function openModal(html){$('#mbody').innerHTML=html;$('#modal').classList.remove('hidden');modalOpen=true}
function closeModal(){$('#modal').classList.add('hidden');modalOpen=false}
$('#mx').onclick=closeModal;
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
function skipTime(mins,text,cb){$('#fadeT').textContent=text;$('#fade').classList.remove('hidden');setTimeout(()=>{for(let i=0;i<mins;i++)tickMinute();$('#fade').classList.add('hidden');cb&&cb();save()},1100)}
function task(label,mins,fn){G.task={l:label,t:0,d:Math.min(2.4,.7+mins/14),m:mins,f:fn}}
function save(){try{localStorage.setItem(SK,JSON.stringify(G))}catch(e){}}
function loadSave(){try{const s=localStorage.getItem(SK);return s?JSON.parse(s):null}catch(e){return null}}

/* ---------- needs & time ---------- */
const NEEDS=[['sult','🍽️'],['blaere','🚻'],['energi','⚡'],['hygiejne','🛁'],['helbred','❤️'],['humoer','😊']];
const NEEDN={sult:'Mæthed',blaere:'Toilet',energi:'Energi',hygiejne:'Hygiejne',helbred:'Helbred',humoer:'Humør'};
function tickMinute(){
 G.min++;const p=G.P,N=p.needs,sl=p.sleeping;
 N.sult-=sl?.035:.075;N.blaere-=sl?.05:.11;N.energi+=sl?.33:-(p.riding?.11:.06);N.hygiejne-=sl?.01:.04;
 if(N.sult<8||N.energi<4)N.helbred-=.04;else if(N.helbred<100)N.helbred+=sl?.06:.015;
 const avg=(N.sult+N.energi+N.hygiejne+N.helbred+N.blaere)/5;N.humoer+=(avg-N.humoer)*.004;
 for(const k in N)N[k]=clamp(N[k],0,100);
 if(N.blaere<=0){N.blaere=100;N.hygiejne=Math.max(0,N.hygiejne-60);N.humoer=Math.max(0,N.humoer-25);toast('Uh nej… du nåede ikke på toilettet! Gå i bad.',1);if(sl)wake()}
 if(sl&&N.blaere<8){wake();toast('Du vågnede, fordi du skal tisse.')}
 if(!sl&&N.energi<=0&&!p.riding&&!G.task){p.sleeping=true;p.inBed=false;toast('Du faldt om af træthed og sover, hvor du står.',1)}
 if(sl&&N.energi>=100&&hour()>=5&&hour()<=12){wake();toast('Godmorgen! Du er udhvilet ☀️')}
 for(const a of G.animals){
  a.full=clamp(a.full-(a.type==='horse'?.1:.09),0,100);if(a.full<20)a.happy-=.05;
  a.clean=clamp(a.clean-(a.type==='horse'?.03:.01),0,100);a.happy=clamp(a.happy,0,100);
  const inStall=a.zone&&a.zone.startsWith('stall')&&a.state==='free';
  if(a.type==='horse'&&inStall)G.stallDirt[+a.zone.slice(5)]=Math.min(100,G.stallDirt[+a.zone.slice(5)]+.06);
  if((a.type==='horse'&&a.state==='free'&&(a.zone==='paddock'||inStall))||(a.type==='rabbit'&&a.state==='free'&&a.zone==='cage')){
   a.poopT-=1;if(a.poopT<=0){a.poopT=(a.type==='horse'?110:160)+Math.random()*80;if(G.poops.length<45)G.poops.push({x:a.x+rnd(-6,6),y:a.y+rnd(-3,3),r:a.type==='rabbit'?1:0})}}
 }
 G.aisleDirt=Math.min(100,G.aisleDirt+.012);
 if(G.min%60===0)hourly(hour());
}
function hourly(h){
 const d=dayN(),wd=d%7;
 if(h===7&&wd<5&&!G.worked[d])toast('⏰ Arbejde kl. 08–14. Gå hen til bilen ved vejen.');
 if(h===9&&wd<5&&!G.worked[d]){G.worked[d]='pjæk';toast('Du pjækkede fra arbejde i dag – ingen løn.',1)}
 if(h===6&&wd>=5)toast('🏆 Weekend! Der er stævner i dag – kør fra bilen mellem 6 og 13.');
 if(h===11)feedCheck('m');
 if(h===17)toast('🌇 Tid til aftensfodring (16–23).');
 if(h===22)feedCheck('a');
 if(h===21&&G.animals.some(a=>a.type==='horse'&&a.zone==='paddock'&&a.state==='free'))toast('🌙 Det bliver mørkt – sæt hestene i boks.');
 if(h===0){
  for(const a of G.animals){if(a.type==='horse'&&a.zone==='paddock'&&a.state==='free')a.happy-=6;if(a.type==='dog'&&a.walked<d-1){a.happy-=12;toast(a.name+' kom ikke på gåtur i går 😔',1)}}
 }
 const pp=G.poops.filter(q=>!q.r&&inR(q.x,q.y,PADDOCK)).length,cp=G.poops.filter(q=>q.r).length;
 if(pp>8)G.animals.forEach(a=>{if(a.zone==='paddock')a.happy-=2});
 if(cp>6){G.animals.forEach(a=>{if(a.type==='rabbit')a.happy-=3});if(h===12)toast('Kaninburet trænger til at blive gjort rent.',1)}
 G.stallDirt.forEach((v,i)=>{if(v>70)G.animals.forEach(a=>{if(a.zone==='stall'+i)a.happy-=2})});
 if(h===15&&G.stallDirt.some(v=>v>60))toast('Boksene trænger til at blive muget ud.',1);
 G.animals.forEach(a=>a.happy=clamp(a.happy,0,100));
 if(G.P.needs.sult<20&&h%2===0)toast('Du er sulten! Lav mad i køkkenet.',1);
 if(G.P.needs.blaere<20)toast('Du skal tisse! Find toilettet.',1);
 save();
}
function feedCheck(k){const d=dayN();const miss=G.animals.filter(a=>(k==='m'?a.fm:a.fa)!==d);miss.forEach(a=>a.happy=clamp(a.happy-12,0,100));if(miss.length)toast('Du glemte '+(k==='m'?'morgen':'aften')+'fodring af: '+miss.map(a=>a.name).join(', '),1)}
function feedAnimal(a){if(a.full>85){toast(a.name+' er ikke sulten endnu.');return false}a.full=100;a.happy=clamp(a.happy+5,0,100);const h=hour(),d=dayN();if(h>=5&&h<12)a.fm=d;else if(h>=16&&h<23)a.fa=d;toast(ICON[a.type]+' '+a.name+' spiser glad.');return true}
function usePortion(){const p=G.P;p.portions--;if(p.portions<=0){p.holding=null;p.portions=0}}
function wake(){G.P.sleeping=false;G.P.inBed=false;save()}
