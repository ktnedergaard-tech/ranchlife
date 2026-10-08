// Ranchlivet – Racer, farver og valgmuligheder
'use strict';

/* ---------- data ---------- */
const HB={
 'Dansk Varmblod':{s:1,speed:1.05,jump:120,dressur:1.15,price:65000,coats:[{n:'Brun',c:'#6b3f22',m:'#1e130b'},{n:'Mørkebrun',c:'#3a2416',m:'#120c08'},{n:'Fuks',c:'#a5582a',m:'#8a4520'},{n:'Skimmel',c:'#c9c7c2',m:'#8f8c86'}]},
 'Frieser':{s:1.04,speed:.95,jump:85,dressur:1.1,price:115000,feather:true,coats:[{n:'Sort',c:'#1a1716',m:'#0c0b0a'}]},
 'Islænder':{s:.78,speed:.9,jump:75,dressur:.9,price:45000,coats:[{n:'Isabel',c:'#cdb07a',m:'#f0e6cf'},{n:'Brun',c:'#6b4a2f',m:'#2a1d12'},{n:'Rød',c:'#9c4f26',m:'#e9d9b9'}]},
 'Shetlandspony':{s:.58,speed:.7,jump:55,dressur:.7,price:12000,coats:[{n:'Brun',c:'#4b3424',m:'#22170f'},{n:'Palomino',c:'#d6b26a',m:'#f2e8cc'},{n:'Sort',c:'#1b1816',m:'#0e0c0b'}]},
 'Arabisk fuldblod':{s:.93,speed:1.2,jump:100,dressur:1,price:90000,coats:[{n:'Skimmel',c:'#dedbd4',m:'#bab6ad'},{n:'Fuks',c:'#a8602e',m:'#8c4b22'}]},
 'Knabstrupper':{s:1,speed:1,jump:105,dressur:1.05,price:75000,coats:[{n:'Leopardplettet',c:'#efe8dc',m:'#3a2a20',spots:true}]},
 'Haflinger':{s:.85,speed:.9,jump:85,dressur:.9,price:38000,coats:[{n:'Fuks m. lys man',c:'#b5743a',m:'#f1e3c2'}]},
 'Connemara':{s:.88,speed:1,jump:115,dressur:.95,price:55000,coats:[{n:'Skimmel',c:'#b3b2ae',m:'#6a6660'},{n:'Blakket',c:'#c9a36a',m:'#2a1d12'}]}
};
const DB={
 'Labrador':{s:1,agil:.9,price:12000,ears:'flop',coats:[{n:'Gul',c:'#d9b27a'},{n:'Sort',c:'#22201d'},{n:'Chokolade',c:'#5a3a24'}]},
 'Border Collie':{s:.95,agil:1.25,price:9000,ears:'semi',coats:[{n:'Sort/hvid',c:'#22201d',c2:'#f2efe8'},{n:'Rød/hvid',c:'#8a4a2a',c2:'#f2efe8'}]},
 'Schæfer':{s:1.08,agil:1.05,price:14000,ears:'up',coats:[{n:'Sort/brun',c:'#8a5a2b',c2:'#22201d'}]},
 'Golden Retriever':{s:1.02,agil:.95,price:15000,ears:'flop',coats:[{n:'Gylden',c:'#c98c45'}]},
 'Gravhund':{s:.85,agil:.7,price:10000,ears:'flop',long:true,coats:[{n:'Rød',c:'#9a4f26'},{n:'Sort/brun',c:'#22201d',c2:'#9a5a2a'}]},
 'Jack Russell':{s:.75,agil:1.15,price:8000,ears:'semi',coats:[{n:'Hvid/brun',c:'#f2efe8',c2:'#8a5a2a'}]}
};
const CB={
 'Huskat':{s:1,price:500,coats:[{n:'Grå tiger',c:'#8a8680',str:'#55524d'},{n:'Rød tiger',c:'#d38b45',str:'#a35a22'},{n:'Sort/hvid',c:'#22201d',c2:'#f2efe8'}]},
 'Maine Coon':{s:1.3,fluffy:true,price:9000,coats:[{n:'Brun tabby',c:'#8a6a4a',str:'#4a3524'}]},
 'Norsk Skovkat':{s:1.2,fluffy:true,price:7000,coats:[{n:'Sølv',c:'#c9c9c4',str:'#77746d'}]},
 'Ragdoll':{s:1.15,fluffy:true,price:8000,coats:[{n:'Seal point',c:'#efe6d6',pt:'#5a4030'}]},
 'Bengal':{s:1.05,price:10000,coats:[{n:'Brun spotted',c:'#d4a25e',sp:'#4a2e16'}]},
 'Britisk Korthår':{s:1.1,price:8000,coats:[{n:'Blå',c:'#8e97a3'}]}
};
const RB={
 'Dværgvædder':{s:1,hop:.9,price:400,lop:true,coats:[{n:'Grå',c:'#9c958a'},{n:'Hvid',c:'#f1ede4'},{n:'Brun',c:'#8a6a4a'}]},
 'Hermelin':{s:.8,hop:1,price:350,coats:[{n:'Hvid',c:'#f6f3ec'}]},
 'Rex':{s:1,hop:1,price:450,coats:[{n:'Castor',c:'#7a5236'},{n:'Sort',c:'#2a2624'}]},
 'Løvehoved':{s:.95,hop:.95,price:450,mane:true,coats:[{n:'Orange',c:'#d39a5a'},{n:'Hvid',c:'#f1ede4'}]},
 'Angora':{s:1.15,hop:.8,price:600,fluffy:true,coats:[{n:'Hvid',c:'#f5f2ea'}]},
 'Kaninhop-krydsning':{s:1.05,hop:1.3,price:500,coats:[{n:'Vildtfarvet',c:'#8a7356'}]}
};
const BREEDS={horse:HB,dog:DB,cat:CB,rabbit:RB};
const TYPEN={horse:'Hest',dog:'Hund',cat:'Kat',rabbit:'Kanin'};
const ICON={horse:'🐴',dog:'🐕',cat:'🐈',rabbit:'🐇'};
const NAMES={horse:['Bella','Storm','Luna','Komet','Freja','Mocca','Tornado','Lady','Sjus','Balder'],dog:['Bonnie','Bølle','Molly','Rex','Kalle'],cat:['Misser','Felix','Simba','Nala','Pjuske'],rabbit:['Stampe','Snuffi','Kaffe','Bobby','Lotte']};
const SPOTS=(()=>{const r=rng(9),a=[];for(let i=0;i<26;i++){const t=r()*Math.PI*2,d=Math.sqrt(r());a.push([Math.cos(t)*24*d,-35+Math.sin(t)*10*d])}return a})();

const SKINS=['#f6d7c3','#eec1a0','#d9a07a','#b97a52','#8d5a3b','#5c3a26'];
const HAIRS=['Kort','Langt','Hestehale','Fletning','Krøllet','Knold'];
const HAIRC=['#1b1410','#4a2e1b','#8a5a2b','#c99a52','#e8d29b','#b8442a','#9a9a9a','#d36c8e'];
const TOPS=['T-shirt','Hættetrøje','Ridejakke','Ternet skjorte','Fleecetrøje'];
const BOTS=['Jeans','Ridebukser','Shorts','Arbejdsbukser'];
const SHOES={'Gummistøvler':'#2f4a2c','Ridestøvler':'#1d1a17','Sneakers':'#ece8df','Jodhpurstøvler':'#5a3a22'};
const CLOTHC=['#2f5d8a','#a33b3b','#3f6b3a','#e0b04a','#6d4c8f','#d97a9c','#262626','#efe9dc','#8a5a35','#4aa3a1'];
const HELMC=['#1d2a44','#262626','#7a1f2b','#efe9dc','#3f6b3a','#d97a9c'];
