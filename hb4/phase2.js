// Varianz-Paket, Phase 2: erzeugt die Level ab 1-4 neu und schreibt sie in levels24.json (1-1 bis 1-3 bleiben).
// Baukasten je Level: Grundriss (P1–P4), Gästegruppe(n), Pflicht-Teile, Hindernis-Schablone, Zahl der Flaggen.
// Walk mit kleinem Budget liefert eine bekannte Lösung, ein Solver-Lauf prüft Lösungszahl und Par.
// Aufruf: node phase2.js            -> alle Level
//         node phase2.js k2-4 k3-1   -> nur diese (Rest bleibt wie in levels24.json)
const HB=require('./logic.js');const fs=require('fs');const LAY=require('./layouts.js');
const V=require('./varianz.js');
const LV=JSON.parse(fs.readFileSync('levels24.json'));
const D4=[[1,0],[0,1],[-1,0],[0,-1]],key=(i,j)=>i+','+j;

// id: [Grundriss, Gruppen, Pflicht-Teile, Hindernis, Flaggen, min, max, Looping erlaubt]
const PLAN={
 'k1-4':['P1',['kids'],'', 'Zeile',0,8,11,0],
 'k1-5':['P2',['fam'],'', 'L',0,8,12,0],
 'k1-6':['P1',['teens'],'', 'Zickzack',0,10,13,1],
 'k2-1':['P2',['kids'],'H','Zeile',1,8,12,0],
 'k2-2':['P3',['fam'],'V','L',1,9,13,0],
 'k2-3':['P1',['teens'],'V','Doppelteich',1,10,14,1],
 'k2-4':['P1',['kids'],'H','Zickzack',1,8,12,0],
 'k2-5':['P2',['kids','fam'],'HV','L',1,9,13,0],
 'k2-6':['P4',['teens'],'HV','Zeile',1,11,15,1],
 'k3-1':['P3',['fam'],'H','Doppelteich',2,10,14,0],
 'k3-2':['P4',['teens'],'C','L',2,11,15,1],
 'k3-3':['P2',['fans'],'CV','Zickzack',2,11,15,1],
 'k3-4':['P1',['kids','fam'],'HV','Zeile',2,10,14,0],
 'k3-5':['P4',['fans'],'C','Doppelteich',2,12,16,1],
 'k3-6':['P3',['teens'],'CH','L',2,12,16,1],
 'k4-1':['P2',['fam'],'W','Zeile',2,10,14,0],
 'k4-2':['P4',['teens'],'WV','Zickzack',2,12,16,1],
 'k4-3':['P3',['fans'],'CW','L',2,12,16,1],
 'k4-4':['P1',['kids'],'WH','Doppelteich',3,10,14,0],
 'k4-5':['P4',['fans'],'CV','Zickzack',3,13,17,1],
 'k4-6':['P4',['fans'],'CWV','L',3,14,18,1]};

// Walk: alle erlaubten Teile, Splash darf im Walk auf jedes freie Bodenfeld (dort entsteht danach ein Teich)
function walk(R,base,spec){const kinds=['G','L','R','A','B'].concat(spec.loop?['P']:[],spec.must.split(''));
  const inv={};kinds.forEach(k=>inv[k]=k==='P'||k==='C'?2:k==='W'||k==='H'||k==='V'?2:14);
  const lvl=Object.assign({},base,{blocked:[],inv,groups:spec.groups,flags:[]});const run=HB.newRun(lvl);
  const res=V.reserved(base);run.pond=new Set();for(let i=0;i<base.n;i++)for(let j=0;j<base.n;j++)if(!res.has(key(i,j)))run.pond.add(key(i,j));
  const exit=[run.exit.i,run.exit.j];let nodes=0,found=null;
  (function go(){if(found||nodes++>spec.budget)return;
    if(HB.ready(run)){if(run.placed<spec.min)return;const seq=run.hist.map(h=>h.kind).join('');if(spec.must.split('').some(k=>!seq.includes(k)))return;
      const j=HB.judge(run);if(j.success&&j.centered)found=seq;return}
    if(run.placed>=spec.max)return;const h=run.head,nx=[h.i+D4[h.dir][0],h.j+D4[h.dir][1]];if(spec.max-run.placed<Math.abs(nx[0]-exit[0])+Math.abs(nx[1]-exit[1]))return;
    const ks=kinds.slice();for(let i=ks.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[ks[i],ks[j]]=[ks[j],ks[i]]}
    // Pflicht-Teile, die noch fehlen, öfter zuerst probieren
    spec.must.split('').forEach(m=>{if(run.hist.every(x=>x.kind!==m)&&R()<.5){ks.splice(ks.indexOf(m),1);ks.unshift(m)}});
    for(const k of ks){const g=HB.ghost(run,k);if(!g.valid||g.stall)continue;HB.place(run,g);go();if(found)return;HB.undo(run)}})();
  return found}

function jacc(a,b){let n=0;a.forEach(t=>{if(b.has(t))n++});return n/(a.size+b.size-n)}

function make(id,seed0,others){const [P,groups,must,shape,nflags,min,max,loop]=PLAN[id],base=LAY[P];
  for(let s=seed0;s<seed0+600;s++){const R=HB.mulberry32(s);
    const seq=walk(R,base,{groups,must,min,max,loop,budget:12000});if(!seq)continue;
    // Splash-Felder werden Teich
    const pondT=[];
    {const r=HB.newRun(Object.assign({},base,{blocked:[],inv:V.invOf(seq),groups,flags:[]}));const res=V.reserved(base);r.pond=new Set();for(let i=0;i<base.n;i++)for(let j=0;j<base.n;j++)if(!res.has(key(i,j)))r.pond.add(key(i,j));
     for(const k of seq){const g=HB.ghost(r,k);HB.place(r,g);if(k==='W')pondT.push([g.i,g.j])}}
    const path=new Set();{const r=HB.newRun(Object.assign({},base,{blocked:pondT,inv:V.invOf(seq),groups,flags:[]}));for(const k of seq){const g=HB.ghost(r,k);if(!g.valid){path.clear();break}HB.place(r,g)}r.track.slice(1+r.lift).forEach(p=>path.add(key(p.i,p.j)))}
    if(!path.size)continue;
    const taken=new Set(pondT.map(t=>key(t[0],t[1])));let blocked=pondT.slice();
    // Teiche um Splash-Felder um ein Feld neben der Strecke erweitern
    pondT.forEach(([a,b])=>{const nb=D4.map(d=>[a+d[0],b+d[1]]).filter(([x,y])=>x>=0&&y>=0&&x<base.n&&y<base.n&&!path.has(key(x,y))&&!taken.has(key(x,y))&&!V.reserved(base).has(key(x,y)));if(nb.length){const c=nb[Math.floor(R()*nb.length)];blocked.push(c);taken.add(key(c[0],c[1]))}});
    const shapes=shape==='Doppelteich'?['Teich2','Teich2']:[shape];let okS=true;
    for(const sh of shapes){const c=V.placeShape(R,V.SHAPES[sh],base,path,taken);if(!c){okS=false;break}c.forEach(t=>taken.add(key(t[0],t[1])));blocked=blocked.concat(c)}
    if(!okS)continue;
    const extra=id<'k3'?1:2,inv=V.invOf(seq,0);for(let e=0;e<extra;e++){const k=['G','L','R','B'][Math.floor(R()*4)];inv[k]=(inv[k]||0)+1}
    if(Object.keys(inv).length>8)continue;
    let l=Object.assign({},base,{groups,blocked,inv,flags:[]});
    if(nflags){const fl=V.pickFlags(l,seq,nflags,V.reserved(base));if(fl.length<nflags)continue;l.flags=fl}
    const r=HB.solve(l,151,300000),c=r.sols.filter(x=>x.centered);if(!c.length||r.sols.length<2||r.sols.length>150)continue;
    const best=c.sort((a,b)=>a.placed-b.placed)[0];
    // Die Par-Lösung muss alle neuen Teile des Levels nutzen und darf nicht viel kürzer als geplant sein
    if(must.split('').some(m=>!best.seq.includes(m))||best.placed<min-1)continue;const tiles=new Set(V.tilesOf(l,best.seq).map(t=>key(t[0],t[1])));
    if(others.some(o=>o.P===P&&jacc(o.tiles,tiles)>.6))continue;
    l.par=best.placed;return{l,P,tiles,seed:s,n:r.sols.length,cen:c.length,ex:best.seq,nodes:r.nodes}}
  return null}

const only=process.argv.slice(2);const out=LV.slice(),done=[],t0=Date.now();
for(let k=3;k<LV.length;k++){const old=LV[k];if(only.length&&!only.includes(old.id))continue;const t1=Date.now();
  const o=make(old.id,1000+k*1000,done);if(!o){console.log(old.id,'KEINE Variante gefunden');continue}done.push(o);
  const keep={id:old.id,name:old.name,theme:old.theme,style:old.style,trackCol:old.trackCol,chapter:old.chapter};
  const l=Object.assign({},o.l,keep);delete l.groups_;out[k]=l;
  console.log(old.id.padEnd(5),old.name.padEnd(16),o.P,l.groups.join('+').padEnd(10),'Teile',JSON.stringify(l.inv),'Flaggen',l.flags.length,'Lösungen',o.n,'(zentr.',o.cen+')','Par',l.par,'Bsp',o.ex,((Date.now()-t1)/1000).toFixed(0)+'s');
  console.log(V.board(l,o.ex));
  fs.writeFileSync('levels24.json',JSON.stringify(out))}
console.log('fertig in',((Date.now()-t0)/1000).toFixed(0),'s');
