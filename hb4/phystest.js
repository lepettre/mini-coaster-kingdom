// Physik-Check ohne Browser: kein Zug kommt über die Lifthill-Höhe, Anstieg kostet immer Schwung,
// alle festen Level und alle Pool-Rätsel bleiben mit 3 Sternen lösbar.
const HB=require('./logic.js');const fs=require('fs');
const LV=JSON.parse(fs.readFileSync('levels24.json')),PO=JSON.parse(fs.readFileSync('pool.json'));
const fail=[];
// Höhe über dem Lifthill ist nur mit Booster (Energie von außen) erlaubt
// 1) Direkt nach dem Lifthill (Gipfel) ist kein Anstieg möglich
{const run=HB.newRun(LV[0]);const g=HB.ghost(run,'A');if(!(g.stall||!g.valid))fail.push('Anstieg direkt nach Lifthill möglich')}
// 1b) Neue Teile: Bremse, Booster, Splash, Korkenzieher (zwei Felder)
{const base=Object.assign({},LV[0],{blocked:[[5,7]],flags:[[5,5]],inv:{G:5,L:5,R:5,A:5,B:5,P:2,H:3,V:3,W:2,C:2},groups:['kids']});
 const ex=(seq)=>{const run=HB.newRun(base);for(const k of seq){const g=HB.ghost(run,k);if(!g.valid||g.stall)return {run,bad:k,g};HB.place(run,g)}return {run}};
 let r=ex('RBB');const b0=r.run.head.k;let g=HB.ghost(r.run,'H');if(!(g.valid&&g.kExit<=1.2+1e-9&&g.kExit<b0))fail.push('Bremse senkt Schwung nicht auf 1,2');
 r=ex('V');if(!(r.run.head.k>1.0+1.3))fail.push('Booster gibt keinen Schwung');
 g=HB.ghost(ex('').run,'P');if(!g.stall)fail.push('Looping ohne Schwung möglich');g=HB.ghost(ex('VV').run,'P');if(!(g.valid&&!g.stall))fail.push('Looping nach zwei Boostern nicht möglich');
 r=ex('RBBB');g=HB.ghost(r.run,'W');if(!(g.valid&&!g.stall&&Math.abs(g.kExit-(r.run.head.k-1.2))<1e-9))fail.push('Splash auf Teich nicht möglich oder bremst falsch');
 g=HB.ghost(r.run,'G');if(g.valid)fail.push('Normales Teil auf Teich möglich');
 g=HB.ghost(ex('RBB').run,'W');if(g.valid)fail.push('Splash ohne Wasser/über Boden möglich');
 g=HB.ghost(ex('').run,'C');if(!g.stall)fail.push('Korkenzieher ohne Schwung möglich');
 const cb=Object.assign({},base,{blocked:[],flags:[[5,7]]});r={run:HB.newRun(cb)};for(const k of 'RBB')HB.place(r.run,HB.ghost(r.run,k));const n0=r.run.track.length;g=HB.ghost(r.run,'C');if(!(g.valid&&!g.stall)){fail.push('Korkenzieher mit Schwung nicht möglich')}else{HB.place(r.run,g);
  if(r.run.track.length!==n0+2)fail.push('Korkenzieher belegt nicht zwei Felder');if(HB.flagsHit(r.run)!==1)fail.push('Flagge auf zweitem Korkenzieher-Feld nicht gezählt');
  if(!(r.run.head.j===7&&r.run.head.i===5))fail.push('Kopf nach Korkenzieher falsch');HB.undo(r.run);if(r.run.track.length!==n0||r.run.inv.C!==2)fail.push('Rückgängig beim Korkenzieher falsch')}}
// 2) Alle Lösungen: Höhe nie über Lifthill, Schwung fällt bei jedem Anstieg
const check=(name,l)=>{const r=HB.solve(l,400,300000);const c=r.sols.filter(s=>s.centered);
  if(!c.length){fail.push(name+': keine zentrierte Lösung');return}
  if(Math.min(...c.map(s=>s.placed))>l.par)fail.push(name+': Par '+l.par+' nicht erreichbar');
  for(const s of r.sols){const run=HB.newRun(l);for(const k of s.seq){const g=HB.ghost(run,k);HB.place(run,g);const p=run.track[run.track.length-1];
    if(p.z1>run.lift&&!s.seq.includes('V')){fail.push(name+': Höhe '+p.z1+' über Lifthill ('+s.seq+')');return}
    if(p.type==='A'&&!(p.kOut<p.kIn)){fail.push(name+': Anstieg ohne Verlangsamung');return}}}};
LV.forEach(l=>{check(l.id,l);if(!(l.sols&&l.sols.length))fail.push(l.id+': keine gespeicherten Lösungen (node addsols.js)');else l.sols.forEach(sq=>{const run=HB.newRun(l);for(const k of sq){const g=HB.ghost(run,k);if(!g.valid||g.stall){fail.push(l.id+': gespeicherte Lösung ungültig '+sq);return}HB.place(run,g)}const j=HB.judge(run);if(!(j.success&&j.centered))fail.push(l.id+': gespeicherte Lösung ohne 3 Sterne '+sq)});if(Object.keys(l.inv).length>8)fail.push(l.id+': mehr als 8 Teilearten (Baufenster)')});
const b=LV[0];PO.forEach((e,k)=>check('Pool '+k,Object.assign({},b,{blocked:e.b,inv:e.i,groups:e.g,par:e.p})));
console.log('Level',LV.length,'Pool',PO.length,'Fehler:',fail.length?'\n'+fail.join('\n'):'keine');if(fail.length)process.exit(1);
