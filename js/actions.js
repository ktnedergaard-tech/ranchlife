// Ranchlivet – Handlinger, butik og stævner
'use strict';

/* ---------- actions ---------- */
function rmLead(a){G.P.leading=G.P.leading.filter(id=>id!==a.id)}
function release(a,zone,x,y){a.state='free';a.zone=zone;rmLead(a);if(x!==undefined){a.x=x;a.y=y}a.tx=0;a.idle=1}
function pet(a){a.happy=clamp(a.happy+4,0,100);G.P.needs.humoer=clamp(G.P.needs.humoer+3,0,100);toast(ICON[a.type]+' '+a.name+' nyder det.')}
function mount(a){const p=G.P;if(p.needs.helbred<20){toast('Du er for medtaget til at ride. Brug førstehjælpskassen.',1);return}if(p.holding){toast('Læg '+ITEMN[p.holding]+' fra dig først.');return}
 rmLead(a);a.state='ridden';p.riding=a.id;p.x=a.x;p.y=a.y;RD.gait=0;RD.tempo=1;RD.jumpT=0;RD.heading=a.dir>0?0:Math.PI;toast('Du sidder op på '+a.name+'. R/F = gangart, Z/X = tempo, mellemrum = spring.')}
function dismount(fell){const p=G.P,h=getA(p.riding);if(!h)return;p.riding=null;RD.gait=0;RD.jumpT=0;
 if(fell){h.state='free';h.zone=null}else{h.state='led';p.leading.push(h.id)}
 const ox=p.x-Math.sin(p.fa||0)*26,oy0=p.y+Math.cos(p.fa||0)*26;if(!blocked(ox,oy0,10,false)){p.x=ox;p.y=oy0}else if(!blocked(p.x-p.dir*26,p.y,10,false))p.x-=p.dir*26;else if(!blocked(p.x,p.y+22,10,false))p.y+=22}
function cycleJumps(){const seq=[0,40,60,80,100];G.arenaH=seq[(seq.indexOf(G.arenaH)+1)%seq.length];toast(G.arenaH?'Springene er sat op til '+G.arenaH+' cm.':'Springene er taget ned.')}
function takeFood(item,type){const k=FOODSTOCK[item],n=Math.min(G.stock[k],Math.max(1,G.animals.filter(a=>a.type===type).length));if(n<=0||G.stock[k]<=0){toast('Der er ikke mere '+ITEMN[item].slice(2).toLowerCase()+'. Bestil på computeren.',1);return}G.stock[k]-=n;G.P.holding=item;G.P.portions=n;toast('Du tager '+n+' portion'+(n>1?'er':'')+' '+ITEMN[item].slice(2).toLowerCase()+'.')}
function putDown(){const p=G.P,H=p.holding;if(FOODSTOCK[H])G.stock[FOODSTOCK[H]]+=p.portions;p.holding=null;p.portions=0}
function workTrip(){const p=G.P;if(p.leading.length){toast('Sæt dyrene på plads, før du kører.',1);return}const m=G.min%1440,target=14*60+30;const d=dayN();G.worked[d]='ja';
 skipTime(target-m,'Du kører på arbejde… 🚗  08:00 – 14:00',()=>{G.money+=1450;p.needs.humoer=clamp(p.needs.humoer-4,0,100);toast('Fyraften! +1.450 kr i løn 💰')})}

function actions(){
 const p=G.P,A=[],H=p.holding,N=p.needs,add=(l,f)=>A.push({l,f}),nb=(x,y,r)=>dist(p.x,p.y,x,y)<r;
 if(G.task)return A;
 if(p.sleeping){add('☀️ Vågn op',wake);return A}
 if(p.riding){const h=getA(p.riding);if(nb(BTN.x,BTN.y,80))add('🚧 Spring: '+(G.arenaH?G.arenaH+' cm':'ingen')+' – skift',cycleJumps);add('⬇️ Stig af '+h.name,()=>dismount(false));return A}
 const led=p.leading.map(getA).filter(Boolean),ledH=led.find(a=>a.type==='horse');
 if(ledH){
  if(inR(p.x,p.y,PADDOCK))add('🌿 Slip '+ledH.name+' i folden',()=>{release(ledH,'paddock');toast(ledH.name+' galoperer ud i folden.')});
  for(const s of STALLS)if(nb(s.cx,888,60)&&!G.animals.some(o=>o.zone==='stall'+s.i&&o.state==='free'&&o.type==='horse'))add('🏠 Sæt '+ledH.name+' i boks '+(s.i+1),()=>{release(ledH,'stall'+s.i,s.cx,800);toast(ledH.name+' står i boks '+(s.i+1)+'.')});
  if(nb(CROSS.x,CROSS.y,80)&&!G.animals.some(o=>o.state==='tied'))add('🪢 Bind '+ledH.name+' op',()=>{ledH.state='tied';rmLead(ledH);toast(ledH.name+' er bundet op på opstaldningspladsen.')});
  if(H==='hestefoder')add('🌾 Fodre '+ledH.name,()=>{if(feedAnimal(ledH))usePortion()});
  if(ledH.saddled&&!H)add('🐎 Stig op på '+ledH.name,()=>mount(ledH));
 }
 for(const a of led){
  if(a.type==='dog')add('🦮 Tag snoren af '+a.name,()=>{release(a,'yard');toast(a.name+' løber rundt på gården.')});
  if(a.type==='rabbit'){add('🐇 Hop! (mellemrum)',hopRabbit);if(nb(530,1025,95))add('🏠 Sæt '+a.name+' i buret',()=>{release(a,'cage',530,950)})}
 }
 let best=null,bd=1e9;for(const a of G.animals){if(a.state!=='free'&&a.state!=='tied')continue;const d=dist(p.x,p.y,a.x,a.y),r=a.type==='horse'?70:42;if(d<r&&d<bd){bd=d;best=a}}
 if(best){const a=best;
  if(a.type==='horse'){
   if(H==='hestefoder')add('🌾 Fodre '+a.name,()=>{if(feedAnimal(a))usePortion()});
   if(!H)add('🤚 Klap '+a.name,()=>pet(a));
   if(a.state==='free'&&!H&&!ledH)add('🪢 Træktov på '+a.name,()=>{a.state='led';a.zone=null;p.leading.push(a.id)});
   if(a.state==='tied'){
    add('🔓 Løsne '+a.name,()=>{a.state='led';p.leading.push(a.id)});
    if(H==='børste')add('🪮 Strigle '+a.name,()=>task('Strigler '+a.name,10,()=>{a.clean=100;a.happy=clamp(a.happy+6,0,100);toast(a.name+' skinner! ✨')}));
    if(!a.saddled&&!H)add('🏇 Sadle '+a.name+' op',()=>{if(a.clean<45){toast('Strigl '+a.name+' først – snavs under sadlen giver gnavsår. Tag børsten på redskabsvæggen.',1);return}task('Sadler '+a.name+' op',6,()=>{a.saddled=true;toast('Sadel og trense er på – klar til at ride!')})});
    if(a.saddled&&!H){add('🐎 Stig op på '+a.name,()=>mount(a));add('🧺 Tag sadlen af',()=>task('Sadler af',4,()=>{a.saddled=false;toast('Sadlen hænger i sadelkammeret igen.')}))}
   }
  }else if(a.type==='dog'){
   add('🤚 Klap '+a.name,()=>pet(a));
   add('🎾 Kast bolden',()=>task('Leger med '+a.name,5,()=>{a.happy=clamp(a.happy+8,0,100);N.humoer=clamp(N.humoer+4,0,100)}));
   add('🦮 Snor på '+a.name,()=>{a.state='led';a.zone=null;p.leading.push(a.id);toast('Gå en tur væk fra ranchen – fx til skoven eller stranden.')});
  }else if(a.type==='cat'){
   add('🤚 Ae '+a.name,()=>pet(a));
   add('🪶 Leg med fjerpind',()=>task('Leger med '+a.name,5,()=>{a.happy=clamp(a.happy+8,0,100);N.humoer=clamp(N.humoer+3,0,100)}));
  }else if(a.type==='rabbit'&&a.state==='free'){
   add('🤚 Ae '+a.name,()=>pet(a));
   if(!H)add('🐇 Kaninsele på '+a.name,()=>{a.state='led';a.zone=null;a.x=530;a.y=1030;p.leading.push(a.id);toast('Gå til kaninhopbanen og tryk Hop lige før springene.')});
  }
 }
 if(nb(BTN.x,BTN.y,60))add('🚧 Spring: '+(G.arenaH?G.arenaH+' cm':'ingen')+' – skift',cycleJumps);
 // stald
 if(nb(1480,1078,65)){if(!H){for(const k in TOOLS)add('Tag '+ITEMN[k],()=>{p.holding=k})}else if(TOOLS[H])add('Hæng '+ITEMN[H]+' tilbage',()=>{p.holding=null})}
 if(nb(1870,1010,80)){if(!H)add('🌾 Tag hestefoder ('+G.stock.heste+' port.)',()=>takeFood('hestefoder','horse'));else if(H==='hestefoder')add('Læg hestefoderet tilbage',putDown)}
 if(H==='kost'&&nb(1580,965,90)&&G.aisleDirt>8)add('🧹 Fej staldgangen',()=>task('Fejer staldgangen',10,()=>{G.aisleDirt=0;N.hygiejne-=4;N.energi-=3;toast('Staldgangen er fejet.')}));
 if(H==='grebe')for(const s of STALLS)if(nb(s.cx,888,65)&&G.stallDirt[s.i]>8)add('🔱 Muge ud i boks '+(s.i+1),()=>task('Muger ud i boks '+(s.i+1),15,()=>{G.stallDirt[s.i]=0;G.poops=G.poops.filter(q=>!(q.x>s.x&&q.x<s.x+132&&q.y<872&&q.y>730));N.hygiejne-=8;N.energi-=5;toast('Frisk halm i boks '+(s.i+1)+'.')}));
 if((H==='grebe'||H==='skovl')){const near=G.poops.filter(q=>!q.r&&dist(p.x,p.y,q.x,q.y)<55&&!(q.y<872&&q.y>730&&inR(q.x,q.y,STABLE)));if(near.length)add('💩 Saml hestepærer op ('+near.length+')',()=>task('Samler op',3,()=>{G.poops=G.poops.filter(q=>!near.includes(q));N.hygiejne-=2}))}
 // kaniner
 if(nb(665,945,60)){if(!H)add('🥕 Tag kaninfoder',()=>takeFood('kaninfoder','rabbit'));else if(H==='kaninfoder')add('Læg kaninfoderet tilbage',putDown)}
 if(nb(530,1025,95)||nb(410,945,50)){
  if(H==='kaninfoder')add('🥕 Fodre kaninerne',()=>{for(const a of G.animals)if(a.type==='rabbit'&&p.portions>0&&a.full<=85){feedAnimal(a);usePortion()}});
  const cp=G.poops.filter(q=>q.r).length;if(H==='skovl'&&cp)add('🧽 Rens kaninburet ('+cp+')',()=>task('Gør kaninburet rent',10,()=>{G.poops=G.poops.filter(q=>!q.r);N.hygiejne-=4;G.animals.forEach(a=>{if(a.type==='rabbit')a.happy=clamp(a.happy+5,0,100)});toast('Kaninburet er rent med frisk strøelse.')}));
 }
 // hus
 if(nb(335,378,45))add('🚽 Gå på toilettet',()=>task('På toilettet',4,()=>{N.blaere=100;N.hygiejne-=3}));
 if(nb(345,492,42))add('🧼 Vask hænder',()=>task('Vasker hænder',2,()=>{N.hygiejne=clamp(N.hygiejne+10,0,100)}));
 if(nb(440,368,48))add('🚿 Tag et bad',()=>task('Tager bad',15,()=>{N.hygiejne=100;N.humoer=clamp(N.humoer+4,0,100)}));
 if(nb(420,508,40)&&N.helbred<95)add('🩹 Førstehjælpskasse',()=>{if(G.aidAt&&G.min-G.aidAt<60){toast('Vent lidt, før du bruger den igen.');return}G.aidAt=G.min;task('Plaster og køling',5,()=>{N.helbred=clamp(N.helbred+35,0,100);toast('Du har det bedre nu.')})});
 if(nb(335,722,48)&&!H)add('🧀 Snup en snack (25 kr)',()=>{if(G.money<25)return toast('Ikke penge nok.',1);G.money-=25;task('Spiser en snack',3,()=>{N.sult=clamp(N.sult+15,0,100)})});
 if(nb(418,722,48)&&!H)add('🍳 Lav aftensmad (65 kr)',()=>{if(G.money<65)return toast('Ikke penge nok.',1);G.money-=65;task('Laver mad',30,()=>{p.holding='mad';toast('Maden er klar – spis ved spisebordet.')})});
 if(nb(500,722,48)&&!H){add('🦴 Tag hundefoder ('+G.stock.hunde+')',()=>takeFood('hundefoder','dog'));add('🐟 Tag kattefoder ('+G.stock.katte+')',()=>takeFood('kattefoder','cat'))}
 if(H==='mad'&&nb(620,640,90))add('🍽️ Spis ved bordet',()=>task('Spiser',20,()=>{N.sult=clamp(N.sult+65,0,100);N.humoer=clamp(N.humoer+5,0,100);p.holding=null}));
 if(H==='hundefoder'&&nb(820,728,55))add('🦴 Fyld hundeskålen',()=>{for(const a of G.animals)if(a.type==='dog'&&p.portions>0&&a.full<=85){feedAnimal(a);usePortion();a.tx=820;a.ty=735;a.idle=0}});
 if(H==='kattefoder'&&nb(905,668,55))add('🐟 Fyld katteskålen',()=>{for(const a of G.animals)if(a.type==='cat'&&p.portions>0&&a.full<=85){feedAnimal(a);usePortion();a.tx=905;a.ty=675;a.idle=0}});
 if(nb(850,410,75))add('🛏️ Gå i seng',()=>{if(N.energi>92)return toast('Du er slet ikke træt.');p.sleeping=true;p.inBed=true;p.x=850;p.y=470;save()});
 if(nb(545,365,50))add('💻 Computer (køb/salg/foder)',()=>openShop('buy'));
 // bil
 if(nb(CAR.x,CAR.y,85)){const d=dayN(),wd=d%7,h=hour();
  if(wd<5&&h>=5&&h<9&&!G.worked[d])add('🚗 Kør på arbejde (08–14)',workTrip);
  if(wd>=5&&h>=6&&h<13&&!G.shows[d])add('🏆 Kør til stævne',openShows);
  if(!(wd<5&&h>=5&&h<9&&!G.worked[d])&&!(wd>=5&&h>=6&&h<13&&!G.shows[d]))add('🚗 Bil og hestetransporter',()=>toast(wd<5?'Arbejde: hverdage, kør mellem 05 og 09. Stævner: lørdag og søndag 06–13.':'Stævner: lørdag og søndag mellem 06 og 13.'))}
 // naboen
 if(nb(NPC.x,NPC.y,70)){add('💬 Snak med Birgitte',()=>{toast('Birgitte: “'+pick(TALK)+'”');N.humoer=clamp(N.humoer+3,0,100)});
  if(G.coffee!==dayN())add('☕ Drik kaffe med Birgitte',()=>task('Kaffe hos Birgitte',30,()=>{G.coffee=dayN();N.sult=clamp(N.sult+12,0,100);N.humoer=clamp(N.humoer+15,0,100);toast('Hyggeligt! Birgitte bød på hjemmebag.')}))}
 for(const n of NB)if(nb(n.x,n.y,85)&&!H){add('🤚 Klap naboens '+n.name,()=>{N.humoer=clamp(N.humoer+2,0,100);toast(n.name+' snuser til din hånd.')});break}
 if(H&&!A.some(a=>a.l.includes('tilbage')))add('Læg '+ITEMN[H]+' fra dig',putDown);
 return A;
}
const TALK=['Husk at give dem vand og frisk hø – hestene drikker op til 40 liter om dagen!','Har du prøvet at ride ned til vandet? Hestene elsker det om sommeren.','Mine heste står altid inde om natten. Det er trygt for dem.','Skovstien har nogle væltede træer. Kom i god trav, så springer de fint.','En hund skal ud at gå hver dag – ellers keder den sig.','Kaniner må aldrig bo alene. To er perfekt.','Der er stævne i weekenden. Jeg krydser fingre for dig!','Strigl altid, før du sadler op. Ellers får hesten gnavsår.'];
function hopRabbit(){for(const id of G.P.leading){const a=getA(id);if(a&&a.type==='rabbit'&&a.jumpT<=0)a.jumpT=.5}}

/* ---------- shop / shows ---------- */
const LIMIT={horse:4,dog:3,cat:3,rabbit:2};
const FEED=[['heste','🌾 Hestefoder','10 portioner kraftfoder + hø',10,420],['hunde','🦴 Hundefoder','15 portioner',15,249],['katte','🐟 Kattefoder','15 portioner',15,179],['kanin','🥕 Kaninfoder','20 portioner hø og piller',20,99]];
function cnt(t){return G.animals.filter(a=>a.type===t).length}
function sellPrice(a){const B=BREEDS[a.type][a.breed];return Math.round(B.price*(.6+a.skill/200+a.happy/500)/100)*100}
function openShop(tab){
 const T=[['buy','Køb dyr'],['sell','Sælg dyr'],['feed','Foder'],['mine','Mine dyr']];
 let h='<h2>💻 Computeren</h2><div class="tabs">'+T.map(t=>`<button class="chip ${t[0]===tab?'on':''}" data-tab="${t[0]}">${t[1]}</button>`).join('')+`</div><p class="muted">Saldo: <b>${fmt(G.money)}</b></p>`;
 if(tab==='buy'){for(const t of['horse','dog','cat','rabbit']){const full=cnt(t)>=LIMIT[t];h+=`<h3>${ICON[t]} ${TYPEN[t]}e <small class="muted">(${cnt(t)}/${LIMIT[t]})</small></h3>`;
   if(full)h+=`<p class="muted">${t==='rabbit'?'Du må højst have 2 kaniner.':t==='horse'?'Stalden har kun 4 bokse.':'Du må højst have 3 '+(t==='dog'?'hunde':'katte')+'.'}</p>`;
   else for(const b in BREEDS[t])h+=`<div class="row"><div><b>${b}</b><small>${fmt(BREEDS[t][b].price)}</small></div><button class="btn" data-buy="${t}|${b}" ${G.money<BREEDS[t][b].price?'disabled':''}>Køb</button></div>`}}
 if(tab==='sell'){if(!G.animals.length)h+='<p>Du har ingen dyr.</p>';for(const a of G.animals)h+=`<div class="row"><div><b>${ICON[a.type]} ${a.name}</b><small>${a.breed} · dygtighed ${Math.round(a.skill)}</small></div><button class="btn alt" data-sell="${a.id}">Sælg for ${fmt(sellPrice(a))}</button></div>`}
 if(tab==='feed')for(const[k,n,d,q,pr]of FEED)h+=`<div class="row"><div><b>${n}</b><small>${d} · på lager: ${G.stock[k]}</small></div><button class="btn" data-feed="${k}" ${G.money<pr?'disabled':''}>Køb ${fmt(pr)}</button></div>`;
 if(tab==='mine'){for(const a of G.animals)h+=`<div class="row"><div><b>${ICON[a.type]} ${a.name}</b><small>${a.breed} · ${BREEDS[a.type][a.breed].coats[a.coat]?.n||''} · ${zoneName(a)}</small></div><small style="text-align:right">Dygtighed ${Math.round(a.skill)}<br>Glæde ${Math.round(a.happy)} · Ren ${Math.round(a.clean)}</small></div>`;
  h+='<h3 style="margin-top:12px">🏆 Placeringer</h3>'+(G.rosetter.length?G.rosetter.slice(-12).reverse().map(r=>`<div class="row"><span>${r.n} – ${r.disc}</span><b>${r.p}. plads</b></div>`).join(''):'<p class="muted">Ingen endnu. Stævner er i weekenden.</p>')}
 openModal(h);
 $('#mbody').onclick=e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.tab)openShop(b.dataset.tab);
  if(b.dataset.buy){const[t,br]=b.dataset.buy.split('|');buyStep(t,br)}
  if(b.dataset.feed){const f=FEED.find(x=>x[0]===b.dataset.feed);if(G.money>=f[4]){G.money-=f[4];G.stock[f[0]]+=f[3];toast('Foder leveret til '+(f[0]==='heste'?'foderrummet':f[0]==='kanin'?'foderkassen ved kaninburet':'køkkenskabet')+'.');openShop('feed')}}
  if(b.dataset.sell){if(b.dataset.ok!=='1'){b.dataset.ok='1';b.textContent='Bekræft salg';return}const a=getA(b.dataset.sell);if(G.P.riding===a.id)dismount(false);rmLead(a);G.money+=sellPrice(a);G.animals=G.animals.filter(x=>x!==a);toast(a.name+' er solgt for '+fmt(sellPrice(a))+'.');openShop('sell')}
 };
}
function buyStep(t,br){const B=BREEDS[t][br];let coat=0;
 const draw=()=>{openModal(`<h2>${ICON[t]} ${br}</h2><p class="muted">Pris ${fmt(B.price)}</p><div class="opt"><label>Farve</label><div class="tabs">${B.coats.map((c,i)=>`<button class="chip ${i===coat?'on':''}" data-coat="${i}">${c.n}</button>`).join('')}</div></div><div class="opt"><label for="bn">Navn</label><input type="text" id="bn" maxlength="16" value="${pick(NAMES[t])}"></div><div style="display:flex;gap:8px;margin-top:12px"><button class="btn alt" data-back="1">Tilbage</button><button class="btn" data-ok="1">Køb og hent hjem</button></div>`);
  $('#mbody').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.coat){const nm=$('#bn').value;coat=+b.dataset.coat;draw();$('#bn').value=nm}if(b.dataset.back)openShop('buy');
   if(b.dataset.ok){if(G.money<B.price||cnt(t)>=LIMIT[t])return;G.money-=B.price;const a=makeAnimal(t,br,($('#bn').value||pick(NAMES[t])).slice(0,16),coat);placeIn(a,{horse:'paddock',dog:'yard',cat:'house',rabbit:'cage'}[t]);a.full=90;G.animals.push(a);toast(a.name+' er flyttet ind! '+ICON[t]);openShop('buy')}}};
 draw()}
function openShows(){
 const p=G.P;let h='<h2>🏆 Stævne i dag</h2><p class="muted">Vælg et dyr. Hestene kører med i hestetransporteren. Tilmeldingen koster gebyr – vinderne får præmiepenge.</p>';
 const opts=[];for(const a of G.animals){if(a.type==='horse'){opts.push([a,'Springning',300]);opts.push([a,'Dressur',250])}if(a.type==='dog')opts.push([a,'Agility',150]);if(a.type==='cat')opts.push([a,'Katteudstilling',200]);if(a.type==='rabbit')opts.push([a,'Kaninhop',75])}
 opts.forEach(([a,d,f],i)=>h+=`<div class="row"><div><b>${ICON[a.type]} ${a.name} – ${d}</b><small>Dygtighed ${Math.round(a.skill)} · glæde ${Math.round(a.happy)} · mæthed ${Math.round(a.full)}</small></div><button class="btn" data-show="${i}" ${G.money<f?'disabled':''}>Tilmeld ${fmt(f)}</button></div>`);
 openModal(h);
 $('#mbody').onclick=e=>{const b=e.target.closest('button[data-show]');if(!b)return;const[a,disc,fee]=opts[+b.dataset.show];
  if(a.full<40)return toast(a.name+' er for sulten til stævne. Fodr først.',1);
  if(a.type==='horse'&&a.clean<40)return toast('Strigl '+a.name+' først – dommerne ser på soignering.',1);
  if(p.riding)dismount(false);p.leading.forEach(id=>{const o=getA(id);if(o){o.state='free';placeIn(o,o.type==='horse'?'paddock':o.type==='dog'?'yard':'cage')}});p.leading=[];
  closeModal();G.money-=fee;G.shows[dayN()]=1;
  skipTime(300,a.type==='horse'?'Hestetransporteren er pakket… 🚗🐴  Afsted til stævne!':'Afsted til stævne med '+a.name+'… 🚗',()=>{
   const B=BREEDS[a.type][a.breed];const apt=disc==='Springning'?B.jump/110:disc==='Dressur'?B.dressur:disc==='Agility'?B.agil:disc==='Kaninhop'?B.hop:1;
   const sc=a.skill*.55+a.happy*.2+a.clean*.1+apt*25+rnd(0,25);let place=1;const n=9+Math.floor(Math.random()*6);for(let i=0;i<n;i++)if(rnd(30,62+dayN()*.4)>sc)place++;
   const mult=[6,4,2.5,1.5,1][place-1]||0,prize=Math.round(fee*mult);G.money+=prize;a.skill=Math.min(100,a.skill+4);a.happy=clamp(a.happy+(place<=3?8:2),0,100);a.full-=20;a.clean-=25;p.needs.energi-=20;p.needs.humoer=clamp(p.needs.humoer+(place<=3?15:3),0,100);
   if(place<=5)G.rosetter.push({n:a.name,disc,p:place,d:dayN()});
   openModal(`<h2>${place<=3?'🎉':'🏁'} ${disc} med ${a.name}</h2><p style="font-size:20px"><b>${place}. plads</b> ud af ${n+1}</p><p>${place===1?'I vandt! Rosetten hænger nu i stalden.':place<=3?'Flot placering – I er på podiet!':place<=5?'I fik sløjfe. Godt kæmpet.':'Ingen placering denne gang. Træn mere hjemme.'}</p><p>Præmiepenge: <b>${fmt(prize)}</b> · Gebyr: ${fmt(fee)}</p><p class="muted">${a.name} har lært noget og er blevet dygtigere.</p><button class="btn" onclick="closeModal()">Hjem til ranchen</button>`)})};
}
