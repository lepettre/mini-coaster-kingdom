const HB=require('./logic.js');const LV=JSON.parse(require('fs').readFileSync('levels24.json'));
const sets=[],heat={};const first={};let seqs=[];
LV.forEach(l=>{const r=HB.solve(l,60,200000);const c=r.sols.filter(s=>s.centered);const s=(c.length?c:r.sols).sort((a,b)=>a.placed-b.placed)[0];
 const run=HB.newRun(l);const tiles=new Set();for(const k of s.seq){const g=HB.ghost(run,k);HB.place(run,g);tiles.add(g.i+','+g.j)}
 sets.push(tiles);tiles.forEach(t=>heat[t]=(heat[t]||0)+1);seqs.push(s.seq);first[s.seq.slice(0,3)]=(first[s.seq.slice(0,3)]||0)+1});
let sum=0,n=0;for(let a=0;a<sets.length;a++)for(let b=a+1;b<sets.length;b++){let inter=0;sets[a].forEach(t=>{if(sets[b].has(t))inter++});sum+=inter/(sets[a].size+sets[b].size-inter);n++}
console.log('mittlere Kachel-Überlappung (Jaccard):',(sum/n).toFixed(2));
console.log('Heatmap (Anteil Level, in dem die Kachel befahren wird), Zeile=j, Spalte=i');
for(let j=0;j<8;j++){let row='';for(let i=0;i<8;i++){const v=heat[i+','+j]||0;row+=(v?String(Math.round(v/LV.length*100)).padStart(4):'   .')}console.log(row)}
console.log('häufigste Anfänge:',Object.entries(first).sort((a,b)=>b[1]-a[1]).slice(0,5).map(e=>e[0]+'×'+e[1]).join(' '));
console.log('Längen:',seqs.map(s=>s.length).join(','));
