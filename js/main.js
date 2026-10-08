// Ranchlivet – Skærmskift, start af spil og hovedløkke
'use strict';

/* ---------- screens ---------- */
function show(id){for(const s of['title','creator','pets'])$('#'+s).classList.toggle('hidden',s!==id);screen=id;
 const g=id==='game';for(const s of['#hud','#side','#bottom'])$(s).classList.toggle('hidden',!g);$('#joy').classList.toggle('hidden',!(g&&TOUCH));if(g&&VW<700)$('#alist').classList.add('hidden')}
if(!window.NO3D&&loadSave())$('#contB').classList.remove('hidden');
$('#newB').onclick=()=>{buildCreator();show('creator')};
$('#contB').onclick=()=>{const s=loadSave();if(!s)return;G=s;G.task=null;G.acc=0;G.P.leading=G.P.leading||[];if(G.P.riding){RD.gait=0;RD.heading=0}startGame(false)};
$('#toPets').onclick=()=>{LOOK.name=($('#pname').value||'').trim();if(!LOOK.name){$('#pname').focus();$('#pname').placeholder='Skriv et navn først';return}buildPets();show('pets')};
$('#backC').onclick=()=>{buildCreator();show('creator')};
$('#startB').onclick=()=>{G={min:7*60,money:30000,nextId:1,look:{...LOOK},P:{x:610,y:700,dir:1,walk:0,moving:false,needs:{sult:75,blaere:70,energi:95,hygiejne:85,helbred:100,humoer:80},holding:null,portions:0,riding:null,leading:[],sleeping:false,inBed:false},
 animals:[],poops:[],stallDirt:[25,25,10,10],aisleDirt:30,stock:{heste:20,hunde:15,katte:15,kanin:20},arenaH:0,worked:{},shows:{},rosetter:[],coffee:-1,walkDist:0,acc:0,task:null};
 for(const s of PS){const a=makeAnimal(s.type,s.breed,(s.name||pick(NAMES[s.type])).trim().slice(0,16),s.coat);placeIn(a,{horse:'paddock',dog:'yard',cat:'house',rabbit:'cage'}[s.type]);G.animals.push(a)}
 startGame(true)};
function startGame(fresh){buildNeeds();show('game');lastSig='';hudTick();save();
 if(fresh){toast('Velkommen til ranchen, '+G.look.name+'! 🐴');setTimeout(()=>toast('Start med morgenfodringen: hestefoder i foderrummet i stalden.'),1600);setTimeout(()=>toast('Tryk ? øverst til højre for styring og tips.'),3400)}}

/* ---------- loop ---------- */
let last=performance.now();
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;
 if(screen==='game'&&G){if(!modalOpen&&$('#fade').classList.contains('hidden'))update(dt);render();hudT-=dt;if(hudT<=0){hudT=.2;hudTick();renderActions()}}
 else if(screen==='creator')drawPreview();else if(screen==='pets')drawPetPreviews();
 requestAnimationFrame(loop)}
requestAnimationFrame(loop);
