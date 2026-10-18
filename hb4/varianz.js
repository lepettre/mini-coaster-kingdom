// Hilfsfunktionen für phase2.js: Zufallsweg, Hindernis-Schablonen, Flaggen auf einer bekannten Lösungsstrecke, Textbrett.
const HB=require('./logic.js');const fs=require('fs');const LAY=require('./layouts.js');
const LV=JSON.parse(fs.readFileSync('levels24.json'));
const D4=[[1,0],[0,1],[-1,0],[0,-1]],key=(i,j)=>i+','+j;

// ---- Hindernis-Schablonen (Kachel-Offsets), werden gedreht/gespiegelt ----
const SHAPES={L:[[0,0],[1,0],[2,0],[2,1]],Zeile:[[0,0],[1,0],[2,0],[3,0]],Zickzack:[[0,0],[1,0],[1,1],[2,1]],Teich2:[[0,0],[1,0]]};
function variants(sh){const out=[],seen=new Set();for(let r=0;r<4;r++)for(const m of [1,-1]){const v=sh.map(([x,y])=>{let a=x*m,b=y;for(let k=0;k<r;k++)[a,b]=[-b,a];return[a,b]});const mx=Math.min(...v.map(p=>p[0])),my=Math.min(...v.map(p=>p[1]));const n=v.map(p=>[p[0]-mx,p[1]-my]).sort((p,q)=>p[0]-q[0]||p[1]-q[1]);const k=JSON.stringify(n);if(!seen.has(k)){seen.add(k);out.push(n)}}return out}

// Reservierte Kacheln eines Grundrisses: Station + Lifthill + Platz davor, Rückstrecke, Deko, Ziel
function reserved(base){const st=base.station,s=new Set();for(let k=0;k<=4;k++)s.add(key(st[0]+k,st[1]));base.ret.forEach(r=>s.add(key(r[0],r[1])));base.deco.forEach(d=>s.add(key(d[0],d[1])));s.add(key(base.target[0],base.target[1]));return s}
function tilesOf(l,seq){const run=HB.newRun(l);for(const k of seq)HB.place(run,HB.ghost(run,k));return run.track.slice(1+run.lift).map(p=>[p.i,p.j])}

// Schablone neben die Strecke legen (berührt die Strecke, liegt aber nicht darauf)
function placeShape(R,shape,base,path,taken){const N=base.n,res=reserved(base),opts=[];
  for(const v of variants(shape))for(let i=0;i<N;i++)for(let j=0;j<N;j++){const cells=v.map(p=>[p[0]+i,p[1]+j]);
    if(cells.some(([a,b])=>a<0||b<0||a>=N||b>=N||res.has(key(a,b))||path.has(key(a,b))||taken.has(key(a,b))))continue;
    if(!cells.some(([a,b])=>D4.some(d=>path.has(key(a+d[0],b+d[1])))))continue;opts.push(cells)}
  return opts.length?opts[Math.floor(R()*opts.length)]:null}

// Walk mit kleinem Budget (nur für neue Grundrisse): zufällige gültige Strecke, die für die Gruppe zentriert passt
function walk(R,base,spec){const lvl=Object.assign({},base,{blocked:[],inv:{G:14,L:14,R:14,A:14,B:14,P:spec.loop?2:0},groups:spec.groups});
  const run=HB.newRun(lvl),exit=[run.exit.i,run.exit.j];let nodes=0,found=null;const ks0=['G','L','R','A','B','P'];
  (function go(){if(found||nodes++>spec.budget)return;
    if(HB.ready(run)){if(run.placed<spec.min)return;const j=HB.judge(run);if(j.success&&j.centered)found=run.hist.map(h=>h.kind).join('');return}
    if(run.placed>=spec.max)return;const h=run.head,nx=[h.i+D4[h.dir][0],h.j+D4[h.dir][1]];if(spec.max-run.placed<Math.abs(nx[0]-exit[0])+Math.abs(nx[1]-exit[1]))return;
    const ks=ks0.slice();for(let i=ks.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[ks[i],ks[j]]=[ks[j],ks[i]]}
    for(const k of ks){if(!spec.loop&&k==='P')continue;const g=HB.ghost(run,k);if(!g.valid||g.stall)continue;HB.place(run,g);go();if(found)return;HB.undo(run)}})();
  return found}

// Flaggen: Kacheln der Strecke, die möglichst wenige andere Lösungen befahren (damit die Flagge etwas entscheidet)
function pickFlags(l,seq,n,avoid){const free=Object.assign({},l,{inv:invOf(seq,2)});const r=HB.solve(free,300,150000),cnt={};
  r.sols.forEach(s=>new Set(tilesOf(free,s.seq).map(t=>key(t[0],t[1]))).forEach(t=>cnt[t]=(cnt[t]||0)+1));
  const mine=tilesOf(l,seq).map(t=>key(t[0],t[1])).filter(t=>!avoid.has(t));
  const order=[...new Set(mine)].sort((a,b)=>(cnt[a]||0)-(cnt[b]||0));const out=[];
  for(const t of order){const [i,j]=t.split(',').map(Number);if(out.some(f=>Math.abs(f[0]-i)+Math.abs(f[1]-j)<3))continue;out.push([i,j]);if(out.length>=n)break}
  return out}
function invOf(seq,extra){const inv={};for(const c of seq)inv[c]=(inv[c]||0)+1;if(extra)['G','L','R','B'].slice(0,extra).forEach(k=>inv[k]=(inv[k]||0)+1);return inv}

function finish(l,lo,hi){const r=HB.solve(l,hi+1,400000),c=r.sols.filter(s=>s.centered);if(!c.length||r.sols.length<lo||r.sols.length>hi)return null;
  l.par=Math.min(...c.map(s=>s.placed));return{l,n:r.sols.length,cen:c.length,ex:c.sort((a,b)=>a.placed-b.placed)[0].seq}}

// Textansicht: S Station, T Lifthill, = Rückstrecke, d Deko, ~ Teich/Hindernis, F Flagge, E Ziel, Buchstabe = Teil der Beispiel-Lösung
function board(l,seq){const N=l.n,g=[...Array(N)].map(()=>Array(N).fill('.'));const set=(i,j,c)=>{if(i>=0&&j>=0&&i<N&&j<N)g[j][i]=c};
  l.deco.forEach(d=>set(d[0],d[1],'d'));l.ret.forEach(r=>set(r[0],r[1],'='));l.blocked.forEach(b=>set(b[0],b[1],'~'));
  const run=HB.newRun(l);set(l.station[0],l.station[1],'S');for(let k=1;k<=run.lift;k++)set(l.station[0]+k,l.station[1],'T');
  for(const k of seq){const gh=HB.ghost(run,k);HB.place(run,gh);set(gh.i,gh.j,k)}
  set(l.target[0],l.target[1],'E');(l.flags||[]).forEach(f=>set(f[0],f[1],g[f[1]][f[0]]==='.'?'F':'F'));
  return '    '+[...Array(N).keys()].join(' ')+'\n'+g.map((r,j)=>'  '+j+' '+r.join(' ')).join('\n')}

function search(name,fn,seed0){for(let s=seed0;s<seed0+400;s++){const R=HB.mulberry32(s),o=fn(R);if(o){o.seed=s;console.log('== '+name+' (Seed '+s+')');return o}}throw new Error('keine Variante: '+name)}

module.exports={walk,tilesOf,invOf,placeShape,pickFlags,finish,board,reserved,SHAPES};
