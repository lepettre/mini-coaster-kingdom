const HB=require('./logic.js');const G=require('./gen2l.js');const LAY=require('./layouts.js');
const tilesOf=(l,seq)=>{const run=HB.newRun(l);const t=[];for(const k of seq){const g=HB.ghost(run,k);HB.place(run,g);t.push(g.i+','+g.j)}return t};
const spec={min:10,max:15,groups:[['kids'],['fam'],['teens']],loop:'allow',extras:2,pond:[3,5],maxSol:400,budget:20000};
for(const k of ['P1','P4']){G.setLayout(LAY[k]);const t0=Date.now();const out=[];let seed=100;
 while(Date.now()-t0<35000&&out.length<6){const l=G.makeLevel(spec,seed++);if(!l)continue;
  const r=HB.solve(l,300,150000);const sols=r.sols.map(s=>({s,t:tilesOf(l,s.seq)}));const cnt={};sols.forEach(x=>new Set(x.t).forEach(t=>cnt[t]=(cnt[t]||0)+1));
  const rare=Object.keys(cnt).filter(t=>cnt[t]<=sols.length*.5&&cnt[t]>=1);if(!rare.length)continue;
  const via=rare[(seed*7)%rare.length];const ok=sols.filter(x=>x.t.includes(via)&&x.s.centered);if(!ok.length)continue;
  out.push({via,n:ok.length,tiles:new Set(ok[0].t)})}
 let sum=0,n=0;for(let a=0;a<out.length;a++)for(let b=a+1;b<out.length;b++){let inter=0;out[a].tiles.forEach(t=>{if(out[b].tiles.has(t))inter++});sum+=inter/(out[a].tiles.size+out[b].tiles.size-inter);n++}
 const use=new Set();out.forEach(o=>o.tiles.forEach(t=>use.add(t)));
 console.log(LAY[k].name.padEnd(26),'mit Pflicht-Flagge: Level',out.length,' Überlappung',n?(sum/n).toFixed(2):'-',' genutzte Kacheln',use.size+'/'+LAY[k].n*LAY[k].n,' Lösungen je Level',out.map(o=>o.n).join(','))}
