// Zufallsgenerator ohne Browser messen: node zufalltest.js 24  (= alle Level freigespielt; SPECS wie in template.html)
globalThis.HB=require('./logic.js');require('./genb.js');const LV=JSON.parse(require('fs').readFileSync('levels24.json'));
const SPECS=[{min:8,max:12,groups:[['kids'],['fam']],loop:'no',extras:1,pond:[4,6],maxSol:100,flags:0},{min:10,max:14,groups:[['fam'],['teens']],loop:'allow',extras:1,pond:[4,6],maxSol:60,flags:1},{min:12,max:17,groups:[['teens'],['fans']],loop:'allow',extras:2,pond:[4,6],maxSol:30,budget:15000,flags:2}];
const upto=+process.argv[2];const U=LV.slice(0,upto);const seen=new Set(),bases=[];U.forEach(l=>{const k=l.n+'|'+l.station+'|'+JSON.stringify(l.ret);if(!seen.has(k)){seen.add(k);bases.push(l)}});
const kinds=[...new Set(['G','L','R','A','B'].concat(...U.map(l=>Object.keys(l.inv))))];const flags=Math.max(0,...U.map(l=>(l.flags||[]).length));
HBG.init(LV[0]);console.log('freigespielt bis',upto,'Teile',kinds.join(''),'Grundrisse',bases.length,'Flaggen',flags);
for(let d=0;d<3;d++){let ok=0,ms=[],sp={};for(let s=1;s<=12;s++){const t0=Date.now();let l=null;const T=Date.now();while(!l&&Date.now()-T<4500){l=HBG.make(SPECS[d],s*7919+Date.now()%1000,2,{bases,kinds,flags})}ms.push(Date.now()-t0);if(l){ok++;Object.keys(l.inv).filter(k=>'HVWC'.includes(k)).forEach(k=>sp[k]=(sp[k]||0)+1);sp.F=(sp.F||0)+l.flags.length}}
 console.log(' Stufe',d,'erfolgreich',ok,'/12  Zeit Median',ms.sort((a,b)=>a-b)[6],'ms  max',Math.max(...ms),'  Spezialteile/Flaggen',JSON.stringify(sp))}
