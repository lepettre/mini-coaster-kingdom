(function(root){
  'use strict';
  const HB=root.HB;let BASE=null,RET=null,DECO=[[1,2],[2,2],[1,4],[2,4]];
  const KINDS=['G','L','R','A','B','P'];
  const manh=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]);
  function init(base){BASE=base;RET=base.ret}
  function walk(R,spec,budget){
    const lvl={n:8,station:[1,3],blocked:[],deco:DECO,ret:RET,inv:{G:14,L:14,R:14,A:14,B:14,P:spec.loop==='no'?0:2},groups:['kids'],gate:[2,4],target:[3,5]};
    const run=HB.newRun(lvl);let nodes=0,found=null;const exit=[run.exit.i,run.exit.j];
    (function go(){
      if(found||nodes++>budget)return;
      if(HB.ready(run)){
        if(run.placed<spec.min||run.placed>spec.max)return;
        const seq=run.hist.map(h=>h.kind).join('');
        if(spec.loop==='must'&&!seq.includes('P'))return;
        const feas=[];for(const cand of spec.groups){const jr=HB.judge(Object.assign({},run,{groups:cand.map(id=>HB.GROUPS[id])}));if(jr.success&&jr.centered)feas.push(cand)}
        if(feas.length)found={seq,groups:feas[Math.floor(R()*feas.length)],track:run.track.map(p=>[p.i,p.j])};
        return}
      if(run.placed>=spec.max)return;
      const h=run.head,nx=[h.i+HB.DV[h.dir][0],h.j+HB.DV[h.dir][1]];
      const left=spec.max-run.placed;if(left<manh(nx,exit)||left<h.z)return;
      const ks=KINDS.slice();for(let i=ks.length-1;i>0;i--){const j=Math.floor(R()*(i+1));const t=ks[i];ks[i]=ks[j];ks[j]=t}
      if(h.z>0&&R()<.5){ks.splice(ks.indexOf('B'),1);ks.unshift('B')}
      for(const k of ks){if(spec.loop==='no'&&k==='P')continue;const g=HB.ghost(run,k);if(!g.valid||g.stall)continue;HB.place(run,g);go();if(found)return;HB.undo(run)}
    })();
    return found}
  function make(spec,seed,attempts){
    const R=HB.mulberry32(seed>>>0);
    for(let a=0;a<(attempts||2);a++){
      const w=walk(R,spec,spec.budget||8000);if(!w)continue;
      const inv={};for(const c of w.seq)inv[c]=(inv[c]||0)+1;
      for(let e=0;e<(spec.extras||0);e++){const k=['G','L','R','A','B'][Math.floor(R()*5)];inv[k]=(inv[k]||0)+1}
      const path=new Set(w.track.map(p=>p[0]+','+p[1]));
      const res=new Set(DECO.concat(RET.map(r=>[r[0],r[1]]),[[3,5],[3,4],[3,3],[4,3],[5,3]]).map(p=>p[0]+','+p[1]));
      const ok=(i,j)=>i>=4&&i<8&&j>=1&&j<8&&!path.has(i+','+j)&&!res.has(i+','+j);
      const seeds=[];for(let i=4;i<8;i++)for(let j=1;j<8;j++)if(ok(i,j)&&[[1,0],[-1,0],[0,1],[0,-1]].some(d=>path.has((i+d[0])+','+(j+d[1]))))seeds.push([i,j]);
      if(!seeds.length)continue;
      const s0=seeds[Math.floor(R()*seeds.length)],pond=[[s0[0],s0[1]]],want=spec.pond[0]+Math.floor(R()*(spec.pond[1]-spec.pond[0]+1));
      for(let t=0;t<60&&pond.length<want;t++){const b=pond[Math.floor(R()*pond.length)],d=[[1,0],[-1,0],[0,1],[0,-1]][Math.floor(R()*4)],ni=b[0]+d[0],nj=b[1]+d[1];if(ok(ni,nj)&&!pond.some(p=>p[0]===ni&&p[1]===nj))pond.push([ni,nj])}
      const lvl=Object.assign({},BASE,{blocked:pond,deco:DECO,inv,groups:w.groups});
      const r=HB.solve(lvl,spec.maxSol+1,40000),cen=r.sols.filter(s=>s.centered);
      if(r.sols.length<1||!cen.length||r.sols.length>spec.maxSol)continue;
      lvl.par=Math.min(...cen.map(s=>s.placed));return lvl}
    return null}
  root.HBG={init,make};
})(typeof window!=='undefined'?window:globalThis);
