// Physik-Check ohne Browser: kein Zug kommt über die Lifthill-Höhe, Anstieg kostet immer Schwung,
// alle festen Level und alle Pool-Rätsel bleiben mit 3 Sternen lösbar.
const HB=require('./logic.js');const fs=require('fs');
const LV=JSON.parse(fs.readFileSync('levels24.json')),PO=JSON.parse(fs.readFileSync('pool.json'));
const fail=[];
// 1) Direkt nach dem Lifthill (Gipfel) ist kein Anstieg möglich
{const run=HB.newRun(LV[0]);const g=HB.ghost(run,'A');if(!(g.stall||!g.valid))fail.push('Anstieg direkt nach Lifthill möglich')}
// 2) Alle Lösungen: Höhe nie über Lifthill, Schwung fällt bei jedem Anstieg
const check=(name,l)=>{const r=HB.solve(l,400,300000);const c=r.sols.filter(s=>s.centered);
  if(!c.length){fail.push(name+': keine zentrierte Lösung');return}
  if(Math.min(...c.map(s=>s.placed))>l.par)fail.push(name+': Par '+l.par+' nicht erreichbar');
  for(const s of r.sols){const run=HB.newRun(l);for(const k of s.seq){const g=HB.ghost(run,k);HB.place(run,g);const p=run.track[run.track.length-1];
    if(p.z1>run.lift){fail.push(name+': Höhe '+p.z1+' über Lifthill ('+s.seq+')');return}
    if(p.type==='A'&&!(p.kOut<p.kIn)){fail.push(name+': Anstieg ohne Verlangsamung');return}}}};
LV.forEach(l=>check(l.id,l));
const b=LV[0];PO.forEach((e,k)=>check('Pool '+k,Object.assign({},b,{blocked:e.b,inv:e.i,groups:e.g,par:e.p})));
console.log('Level',LV.length,'Pool',PO.length,'Fehler:',fail.length?'\n'+fail.join('\n'):'keine');if(fail.length)process.exit(1);
