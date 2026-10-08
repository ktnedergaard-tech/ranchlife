// Ranchlivet – HUD, tastatur/joystick, person-editor og valg af dyr
'use strict';

/* ---------- HUD ---------- */
let lastSig='',hudT=0,curActs=[];
function buildNeeds(){$('#needs').innerHTML=NEEDS.map(([k,i])=>`<div class="nr" title="${NEEDN[k]}"><span>${i}</span><div><div class="bar"><i id="n_${k}"></i></div></div></div>`).join('')}
function barCol(v){return v>60?'#5f8a3e':v>30?'#e2b54b':'#9e3b2e'}
function hudTick(){const p=G.P,N=p.needs,d=dayN(),m=G.min%1440;
 $('#tday').textContent=DAYS[d%7]+', dag '+(d+1);$('#ttime').textContent=pad(Math.floor(m/60))+':'+pad(m%60)+(p.sleeping?' 💤':'');$('#money').textContent=fmt(G.money);
 for(const[k]of NEEDS){const el=$('#n_'+k);el.style.width=N[k]+'%';el.style.background=barCol(N[k])}
 const ho=$('#holding');if(p.holding){ho.classList.remove('hidden');ho.textContent='Du holder: '+ITEMN[p.holding]+(p.portions?' ×'+p.portions:'')}else ho.classList.add('hidden');
 $('#alist').innerHTML=G.animals.map(a=>`<div class="ar"><span>${ICON[a.type]}</span><div><b>${a.name}</b><small>${zoneName(a)}</small><div class="bar" title="Mæthed"><i style="width:${a.full}%;background:${barCol(a.full)}"></i></div><div class="bar" title="Glæde"><i style="width:${a.happy}%;background:#6fa3c9"></i></div></div><div class="fd">${a.fm===d?'☀️✓':'☀️–'}<br>${a.fa===d?'🌙✓':'🌙–'}</div></div>`).join('');
 const rp=$('#ride');if(p.riding){rp.classList.remove('hidden');const s=GAITS[RD.gait]+(RD.gait?' · '+TEMPO[RD.tempo]:'');if(rp.dataset.s!==s){rp.dataset.s=s;rp.innerHTML=`<button class="act" data-r="g-">◀ Gangart <kbd>F</kbd></button><button class="act" data-r="t-">− <kbd>Z</kbd></button><span class="st">${s}</span><button class="act" data-r="t+">+ <kbd>X</kbd></button><button class="act" data-r="g+">Gangart ▶ <kbd>R</kbd></button><button class="act jump" data-r="j">Spring <kbd>␣</kbd></button>`}}else rp.classList.add('hidden');
 const tk=$('#task');if(G.task){tk.classList.remove('hidden');$('#taskL').textContent=G.task.l+'…';$('#taskB').style.width=(G.task.t/G.task.d*100)+'%'}else tk.classList.add('hidden');
}
function renderActions(){curActs=actions();const sig=curActs.map(a=>a.l).join('|');if(sig===lastSig)return;lastSig=sig;$('#acts').innerHTML=curActs.slice(0,9).map((a,i)=>`<button class="act" data-i="${i}"><kbd>${i===0?'E':i+1}</kbd>${a.l}</button>`).join('')}
function runAction(i){const a=curActs[i];if(a){a.f();lastSig='';renderActions()}}
$('#acts').addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(b)runAction(+b.dataset.i)});
$('#ride').addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(!b)return;const r=b.dataset.r;if(r==='g+')gait(1);if(r==='g-')gait(-1);if(r==='t+')tempo(1);if(r==='t-')tempo(-1);if(r==='j')jump();hudTick()});
$('#pcB').onclick=()=>$('#alist').classList.toggle('hidden');
$('#helpB').onclick=()=>openModal(`<h2>Sådan spiller du</h2>
<p><b>Gå:</b> WASD eller piletaster (Shift = løb). På mobil bruger du joysticket.<br><b>Handlinger:</b> E/Enter eller tal 1–9 – eller tryk på knapperne nederst.</p>
<p><b>Til hest:</b> styr med WASD/pile. R/F = gangart op/ned (holdt, skridt, trav, galop). Z/X = langsommere/hurtigere inden for gangarten. Mellemrum = spring.</p>
<p><b>Rideklar:</b> træktov på hesten → bind den op på opstaldningspladsen i stalden → strigl med børsten fra redskabsvæggen → sadl op → stig op.</p>
<p><b>Fodring:</b> morgen (5–12) og aften (16–23). Hestefoder i foderrummet, hunde- og kattefoder i køkkenskabet, kaninfoder ved buret.</p>
<p><b>Rengøring:</b> grebe til at muge ud i boksene og samle hestepærer i folden, kost til staldgangen, skovl til kaninburet.</p>
<p><b>Hverdage:</b> arbejde 08–14 fra bilen (1.450 kr). <b>Weekend:</b> stævner fra bilen. Gå i seng når du vil.</p>
<p><b>Kamera:</b> træk med musen eller en finger for at dreje og vippe. Scroll eller knib for at zoome. Q/C drejer også kameraet. Væggene bliver gennemsigtige, når du går indenfor.</p>
<p><b>Udflugter:</b> skovstien har væltede træer at springe over. Stranden er syd for ridebanen. Birgitte bor mod øst.</p>`);
$('#menuB').onclick=()=>{openModal(`<h2>Menu</h2><div class="row"><span>Spillet gemmes automatisk hver time.</span><button class="btn" id="svB">Gem nu</button></div><div class="row"><span>Start forfra med en ny person</span><button class="btn alt" id="rsB">Nyt spil</button></div>`);
 $('#svB').onclick=()=>{save();toast('Spillet er gemt.');closeModal()};$('#rsB').onclick=e=>{if(e.target.dataset.ok!=='1'){e.target.dataset.ok='1';e.target.textContent='Bekræft – slet gemt spil';return}try{localStorage.removeItem(SK)}catch(_){}location.reload()}};

/* ---------- input ---------- */
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT')return;const k=e.key.toLowerCase();if(!keys[k])onPress(k);keys[k]=true;if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault()});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
function onPress(k){if(screen!=='game'||!G)return;if(k==='escape'&&modalOpen)return closeModal();if(modalOpen)return;
 if(k==='e'||k==='enter')runAction(0);else if(/^[1-9]$/.test(k))runAction(+k-1);
 else if(k===' '){if(G.P.riding)jump();else hopRabbit()}
 else if(k==='r')gait(1);else if(k==='f')gait(-1);else if(k==='z'||k==='-')tempo(-1);else if(k==='x'||k==='+')tempo(1)}
const joy=$('#joy'),knob=$('#knob');let jid=null;
joy.addEventListener('pointerdown',e=>{jid=e.pointerId;joy.setPointerCapture(jid);jm(e)});
joy.addEventListener('pointermove',e=>{if(e.pointerId===jid)jm(e)});
const jend=e=>{if(e.pointerId!==jid)return;jid=null;JOY={x:0,y:0};knob.style.left='40px';knob.style.top='40px'};
joy.addEventListener('pointerup',jend);joy.addEventListener('pointercancel',jend);
function jm(e){const r=joy.getBoundingClientRect();let x=e.clientX-r.left-65,y=e.clientY-r.top-65;const m=Math.hypot(x,y);if(m>48){x*=48/m;y*=48/m}knob.style.left=(40+x)+'px';knob.style.top=(40+y)+'px';JOY={x:x/48,y:y/48}}
const TOUCH=matchMedia('(pointer:coarse)').matches;if(TOUCH)document.body.classList.add('touch');

/* ---------- creator ---------- */
let LOOK={name:'',skin:SKINS[1],hair:'Hestehale',hairC:HAIRC[2],top:'Ridejakke',topC:CLOTHC[0],bot:'Ridebukser',botC:CLOTHC[7],shoes:'Ridestøvler',helmC:HELMC[0]};
const COPTS=[['skin','Hudfarve','sw',SKINS],['hair','Frisure','chip',HAIRS],['hairC','Hårfarve','sw',HAIRC],['top','Overdel','chip',TOPS],['topC','Farve på overdel','sw',CLOTHC],['bot','Bukser','chip',BOTS],['botC','Farve på bukser','sw',CLOTHC],['shoes','Fodtøj','chip',Object.keys(SHOES)],['helmC','Ridehjelm','sw',HELMC]];
function buildCreator(){let h=`<div class="opt"><label for="pname">Navn</label><input type="text" id="pname" maxlength="16" placeholder="Fx Emma" value="${LOOK.name}"></div>`;
 for(const[k,l,t,o]of COPTS)h+=`<div class="opt"><label>${l}</label><div class="chips">${o.map(v=>t==='sw'?`<button class="sw ${LOOK[k]===v?'on':''}" style="background:${v}" data-k="${k}" data-v="${v}" aria-label="${l}"></button>`:`<button class="chip ${LOOK[k]===v?'on':''}" data-k="${k}" data-v="${v}">${v}</button>`).join('')}</div></div>`;
 $('#copts').innerHTML=h;$('#pname').oninput=e=>LOOK.name=e.target.value}
$('#copts').addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b)return;LOOK[b.dataset.k]=b.dataset.v;LOOK.name=$('#pname').value;buildCreator()});
$('#randB').onclick=()=>{for(const[k,,,o]of COPTS)LOOK[k]=pick(o);LOOK.name=$('#pname').value;buildCreator()};
/* pets */
const SLOTS=[['horse','Hest 1','Dansk Varmblod'],['horse','Hest 2','Islænder'],['dog','Hund','Labrador'],['cat','Kat','Huskat'],['rabbit','Kanin 1','Dværgvædder'],['rabbit','Kanin 2','Løvehoved']];
let PS=[];
function buildPets(){if(!PS.length){const used=new Set();PS=SLOTS.map(([t,,b])=>{let n;do n=pick(NAMES[t]);while(used.has(n));used.add(n);return{type:t,breed:b,coat:0,name:n}})}
 $('#pgrid').innerHTML=PS.map((s,i)=>{const B=BREEDS[s.type];return`<div class="pcard"><h3>${ICON[s.type]} ${SLOTS[i][1]}</h3><canvas width="440" height="240" data-pc="${i}"></canvas><select data-br="${i}" aria-label="Race">${Object.keys(B).map(b=>`<option ${b===s.breed?'selected':''}>${b}</option>`).join('')}</select><div class="chips" style="display:flex;flex-wrap:wrap;gap:5px">${B[s.breed].coats.map((c,j)=>`<button class="chip ${j===s.coat?'on':''}" data-ct="${i}|${j}" style="font-size:12px;padding:4px 9px">${c.n}</button>`).join('')}</div><input type="text" data-nm="${i}" maxlength="16" value="${s.name}" aria-label="Navn"></div>`}).join('')}
$('#pgrid').addEventListener('change',e=>{if(e.target.dataset.br){const i=+e.target.dataset.br;PS[i].breed=e.target.value;PS[i].coat=0;buildPets()}});
$('#pgrid').addEventListener('input',e=>{if(e.target.dataset.nm)PS[+e.target.dataset.nm].name=e.target.value});
$('#pgrid').addEventListener('click',e=>{const b=e.target.closest('[data-ct]');if(!b)return;const[i,j]=b.dataset.ct.split('|').map(Number);PS[i].coat=j;buildPets()});
