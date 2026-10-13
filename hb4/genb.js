(function(root){
  'use strict';
  // Zufallsrätsel im Browser. make(spec, seed, versuche, opts):
  // opts.bases = Grundrisse (Level-Objekte mit n, station, ret, deco, gate, target), opts.kinds = freigespielte Teile,
  // opts.flags = höchstens so viele Pflicht-Flaggen. Ohne opts: alter Grundriss, nur Grundteile.
  const HB=root.HB;let BASE=null;
  const D4=[[1,0],[0,1],[-1,0],[0,-1]],key=(i,j)=>i+','+j,SPECIAL=['H','V','W','C'];
  const manh=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]);
  function init(base){BASE=base}
  function reserved(b){const s=new Set(),st=b.station;for(let k=0;k<=4;k++)s.add(key(st[0]+k,st[1]));b.ret.forEach(r=>s.add(key(r[0],r[1])));b.deco.forEach(d=>s.add(key(d[0],d[1])));s.add(key(b.target[0],b.target[1]));return s}
  function shuffle(R,a){for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));const t=a[i];a[i]=a[j];a[j]=t}return a}
  // Zufallsweg mit kleinem Budget; Splash darf im Weg auf jedes freie Bodenfeld (dort entsteht danach ein Teich)
  function walk(R,base,spec,kinds,must,budget){
    const inv={};kinds.forEach(k=>inv[k]=k==='P'||k==='C'?2:SPECIAL.includes(k)?2:14);
    const lvl=Object.assign({},base,{blocked:[],inv,groups:['kids'],flags:[]});const run=HB.newRun(lvl),res=reserved(base);
    run.pond=new Set();for(let i=0;i<base.n;i++)for(let j=0;j<base.n;j++)if(!res.has(key(i,j)))run.pond.add(key(i,j));
    const exit=[run.exit.i,run.exit.j];let nodes=0,found=null;
    (function go(){
      if(found||nodes++>budget)return;
      if(HB.ready(run)){
        if(run.placed<spec.min||run.placed>spec.max)return;const seq=run.hist.map(h=>h.kind).join('');
        if(spec.loop==='must'&&!seq.includes('P'))return;if(must&&!seq.includes(must))return;
        const feas=[];for(const cand of spec.groups){const jr=HB.judge(Object.assign({},run,{groups:cand.map(id=>HB.GROUPS[id])}));if(jr.success&&jr.centered)feas.push(cand)}
        if(feas.length)found={seq,groups:feas[Math.floor(R()*feas.length)]};return}
      if(run.placed>=spec.max)return;
      const h=run.head,nx=[h.i+D4[h.dir][0],h.j+D4[h.dir][1]];const left=spec.max-run.placed;if(left<manh(nx,exit)||left<h.z)return;
      const ks=shuffle(R,kinds.slice());if(h.z>0&&R()<.5){ks.splice(ks.indexOf('B'),1);ks.unshift('B')}
      if(must&&run.hist.every(x=>x.kind!==must)&&R()<.5){ks.splice(ks.indexOf(must),1);ks.unshift(must)}
      for(const k of ks){if(spec.loop==='no'&&k==='P')continue;const g=HB.ghost(run,k);if(!g.valid||g.stall)continue;HB.place(run,g);go();if(found)return;HB.undo(run)}
    })();
    return found}
  function make(spec,seed,attempts,opts){
    const R=HB.mulberry32(seed>>>0);opts=opts||{};
    // Grundriss passend zur Länge: lange Rückfahrt (P3) und 9×9 erst ab mittleren Strecken
    let bases=(opts.bases&&opts.bases.length)?opts.bases:[BASE];const fit=bases.filter(b=>spec.max>=14||(b.n<=8&&b.ret.length<=6)||spec.max>=13&&b.ret.length<=6);if(fit.length)bases=fit;
    const kinds0=opts.kinds||['G','L','R','A','B','P'];
    for(let a=0;a<(attempts||2);a++){
      const base=bases[Math.floor(R()*bases.length)],res=reserved(base),N=base.n;
      const specials=kinds0.filter(k=>SPECIAL.includes(k)),must=specials.length&&R()<.75?specials[Math.floor(R()*specials.length)]:null;
      // Splash nur, wenn er Pflichtteil ist oder selten zufällig – sonst prägt er fast jedes Rätsel
      const kinds=kinds0.filter(k=>k!=='W'||must==='W'||R()<.25);
      const w=walk(R,base,spec,kinds,must,spec.budget||8000);if(!w)continue;
      // Strecke nachbauen: Splash-Felder werden Teich
      const pondT=[];{const r=HB.newRun(Object.assign({},base,{blocked:[],inv:{},groups:['kids'],flags:[]}));r.inv=new Proxy({},{get:()=>9});r.pond=new Set();for(let i=0;i<N;i++)for(let j=0;j<N;j++)if(!res.has(key(i,j)))r.pond.add(key(i,j));
        for(const k of w.seq){const g=HB.ghost(r,k);HB.place(r,g);if(k==='W')pondT.push([g.i,g.j])}
        var path=new Set(r.track.slice(1+r.lift).map(p=>key(p.i,p.j)))}
      const inv={};for(const c of w.seq)inv[c]=(inv[c]||0)+1;
      for(let e=0;e<(spec.extras||0);e++){const k=['G','L','R','B'][Math.floor(R()*4)];inv[k]=(inv[k]||0)+1}
      if(Object.keys(inv).length>8)continue;
      const taken=new Set(pondT.map(p=>key(p[0],p[1]))),ok=(i,j)=>i>=0&&j>=0&&i<N&&j<N&&!path.has(key(i,j))&&!res.has(key(i,j))&&!taken.has(key(i,j));
      // Teich als Hindernis neben der Strecke
      const seeds=[];for(let i=0;i<N;i++)for(let j=0;j<N;j++)if(ok(i,j)&&D4.some(d=>path.has(key(i+d[0],j+d[1]))))seeds.push([i,j]);
      if(!seeds.length)continue;
      const s0=seeds[Math.floor(R()*seeds.length)],pond=[[s0[0],s0[1]]],want=spec.pond[0]+Math.floor(R()*(spec.pond[1]-spec.pond[0]+1));taken.add(key(s0[0],s0[1]));
      for(let t=0;t<60&&pond.length<want;t++){const b=pond[Math.floor(R()*pond.length)],d=D4[Math.floor(R()*4)],ni=b[0]+d[0],nj=b[1]+d[1];if(ok(ni,nj)){pond.push([ni,nj]);taken.add(key(ni,nj))}}
      // Pflicht-Flaggen auf Feldern der gefundenen Strecke, mindestens 3 Felder auseinander
      const flags=[],nf=Math.min(opts.flags||0,spec.flags||0),cand=shuffle(R,[...path].map(s=>s.split(',').map(Number)).filter(p=>!res.has(key(p[0],p[1]))));
      for(const p of cand){if(flags.length>=nf)break;if(flags.every(f=>manh(f,p)>=3))flags.push(p)}
      const lvl={n:N,station:base.station,ret:base.ret,deco:base.deco,gate:base.gate,target:base.target,blocked:pondT.concat(pond),inv,groups:w.groups,flags};
      const r=HB.solve(lvl,spec.maxSol+1,40000),cen=r.sols.filter(s=>s.centered);
      if(r.sols.length<1||!cen.length||r.sols.length>spec.maxSol)continue;
      lvl.par=Math.min(...cen.map(s=>s.placed));return lvl}
    return null}
  root.HBG={init,make};
})(typeof window!=='undefined'?window:globalThis);
