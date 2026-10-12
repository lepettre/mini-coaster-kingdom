const HB=require('./logic.js');const G=require('./gen2l.js');const LAY=require('./layouts.js');
const spec={min:9,max:13,groups:[['kids'],['fam']],loop:'allow',extras:1,pond:[3,5],maxSol:60,budget:15000};
for(const k of Object.keys(LAY)){G.setLayout(LAY[k]);const t0=Date.now();const lv=[];let seed=1;
 while(Date.now()-t0<25000&&lv.length<6){const l=G.makeLevel(spec,seed++);if(l)lv.push(l)}
 const sets=[],lens=[];const use={};
 lv.forEach(l=>{const r=HB.solve(l,40,100000);const c=r.sols.filter(s=>s.centered);const s=(c.length?c:r.sols)[0];const run=HB.newRun(l);const t=new Set();for(const kk of s.seq){const g=HB.ghost(run,kk);HB.place(run,g);t.add(g.i+','+g.j)}sets.push(t);lens.push(s.seq.length);t.forEach(x=>use[x]=1)});
 let sum=0,n=0;for(let a=0;a<sets.length;a++)for(let b=a+1;b<sets.length;b++){let inter=0;sets[a].forEach(t=>{if(sets[b].has(t))inter++});sum+=inter/(sets[a].size+sets[b].size-inter);n++}
 const N=LAY[k].n;console.log(LAY[k].name.padEnd(28),'Level in 25s:',lv.length,' Überlappung:',n?(sum/n).toFixed(2):'-',' genutzte Kacheln:',Object.keys(use).length+'/'+N*N,' Längen:',lens.join(','))}
