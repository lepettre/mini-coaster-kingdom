const HB=require('./logic.js');const fs=require('fs');
let BASE=null,RET=null,DECO=null;
function setLayout(L){BASE=L;RET=L.ret;DECO=L.deco}
function rng(seed){return HB.mulberry32(seed>>>0)}
const KINDS=['G','L','R','A','B','P'];
function manh(a,b){return Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])}
function walk(R,spec,budget){
  const lvl=Object.assign({},BASE,{blocked:[],inv:{G:14,L:14,R:14,A:14,B:14,P:spec.loop==='no'?0:2},groups:['kids']});
  const run=HB.newRun(lvl);let nodes=0,found=null;
  const exit=[run.exit.i,run.exit.j];
  (function go(depth){
    if(found||nodes++>budget)return;
    if(HB.ready(run)){
      if(run.placed<spec.min||run.placed>spec.max)return;
      const seq=run.hist.map(h=>h.kind).join('');
      if(spec.loop==='must'&&!seq.includes('P'))return;
      const feas=[];
      for(const cand of spec.groups){const jr=HB.judge(Object.assign({},run,{groups:cand.map(id=>HB.GROUPS[id])}));if(jr.success&&jr.centered)feas.push(cand)}
      if(feas.length){found={seq,groups:feas[Math.floor(R()*feas.length)],track:run.track.map(p=>[p.i,p.j])}}
      return}
    if(run.placed>=spec.max)return;
    const h=run.head,nx=[h.i+HB.DV[h.dir][0],h.j+HB.DV[h.dir][1]];
    const left=spec.max-run.placed;if(left<manh(nx,exit)||left<h.z)return;
    const ks=KINDS.slice();for(let i=ks.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[ks[i],ks[j]]=[ks[j],ks[i]]}
    if(h.z>0&&R()<.5){ks.splice(ks.indexOf('B'),1);ks.unshift('B')}
    for(const k of ks){if(spec.loop==='no'&&k==='P')continue;const g=HB.ghost(run,k);if(!g.valid||g.stall)continue;HB.place(run,g);go(depth+1);if(found)return;HB.undo(run)}
  })(0);
  return found;
}
function makeLevel(spec,seed){
  const R=rng(seed);
  for(let attempt=0;attempt<25;attempt++){
    const w=walk(R,spec,spec.budget||20000);if(!w)continue;
    const inv={};for(const c of w.seq)inv[c]=(inv[c]||0)+1;
    for(let e=0;e<(spec.extras||0);e++){const k=['G','L','R','A','B'][Math.floor(R()*5)];inv[k]=(inv[k]||0)+1}
    const path=new Set(w.track.map(p=>p[0]+','+p[1]));
    const st=BASE.station,tg=BASE.target,resA=[st,[st[0]+1,st[1]],[st[0]+2,st[1]],[st[0]+3,st[1]],[st[0]+4,st[1]],tg];const res=new Set(DECO.concat(RET.map(r=>[r[0],r[1]]),resA).map(p=>p[0]+','+p[1]));
    const NN=BASE.n||8;const ok=(i,j)=>i>=0&&i<NN&&j>=0&&j<NN&&!path.has(i+','+j)&&!res.has(i+','+j);
    const cand=[];for(let i=0;i<NN;i++)for(let j=0;j<NN;j++)if(ok(i,j)){const adj=[[1,0],[-1,0],[0,1],[0,-1]].some(d=>path.has((i+d[0])+','+(j+d[1])));cand.push([i,j,adj])}
    const seeds=cand.filter(c=>c[2]);if(!seeds.length)continue;
    const s0=seeds[Math.floor(R()*seeds.length)];const pond=[[s0[0],s0[1]]];
    const want=spec.pond[0]+Math.floor(R()*(spec.pond[1]-spec.pond[0]+1));
    for(let t=0;t<60&&pond.length<want;t++){const b=pond[Math.floor(R()*pond.length)],d=[[1,0],[-1,0],[0,1],[0,-1]][Math.floor(R()*4)],ni=b[0]+d[0],nj=b[1]+d[1];if(ok(ni,nj)&&!pond.some(p=>p[0]===ni&&p[1]===nj))pond.push([ni,nj])}
    const lvl=Object.assign({},BASE,{blocked:pond,deco:DECO,inv,groups:w.groups});
    const r=HB.solve(lvl,spec.maxSol+1,60000);
    const cen=r.sols.filter(s=>s.centered);
    if(r.sols.length<1||!cen.length)continue;
    if(r.sols.length>spec.maxSol)continue;
    if(spec.minSol&&r.sols.length<spec.minSol)continue;
    lvl.par=Math.min(...cen.map(s=>s.placed));lvl._n=r.sols.length;lvl._ex=cen[0].seq;
    return lvl}
  return null}
module.exports={makeLevel,rng,setLayout};
