const L=require('./lib.js');const {R,hsh,pl,rect,disc,ell,poly,shade,wallOf,mk,proj,grassTile,quantize}=L;
const Pt=require('./parts.js');
const walls=(P,b)=>({S:Object.assign(wallOf(P,b,'S'),{face:'S',h:b.dz}),E:Object.assign(wallOf(P,b,'E'),{face:'E',h:b.dz})});
function track(c,P,V){for(let i=0;i<4;i++){const y=1.5;for(let s=0;s<=5;s++){const x=i+(s+.5)/6,a=P(x,y-.19,0),b=P(x,y+.19,0);pl(c,a[0],a[1]+1,b[0],b[1]+1,R.stone[1],1);pl(c,a[0],a[1],b[0],b[1],R.stone[3],1)}
  [-1,1].forEach(sg=>{const a=P(i,y+.115*sg,0),b=P(i+1,y+.115*sg,0);pl(c,a[0],a[1]+2,b[0],b[1]+2,V.track[0],1);pl(c,a[0],a[1]+1,b[0],b[1]+1,V.track[1],1);pl(c,a[0],a[1],b[0],b[1],V.track[2],1);pl(c,a[0],a[1]-1,b[0],b[1]-1,V.track[3],1);pl(c,a[0],a[1]-2,b[0],b[1]-2,V.track[4],1)})}}
function box(c,P,x0,y0,z0,dx,dy,dz,col){poly(c,[P(x0,y0+dy,z0+dz),P(x0+dx,y0+dy,z0+dz),P(x0+dx,y0+dy,z0),P(x0,y0+dy,z0)],shade(col,.9));poly(c,[P(x0+dx,y0,z0+dz),P(x0+dx,y0+dy,z0+dz),P(x0+dx,y0+dy,z0),P(x0+dx,y0,z0)],shade(col,.66));poly(c,[P(x0,y0,z0+dz),P(x0+dx,y0,z0+dz),P(x0+dx,y0+dy,z0+dz),P(x0,y0+dy,z0+dz)],shade(col,1.12))}
function platform(c,P,V,part){const col=V.platform,y=part==='back'?1.0:1.78;box(c,P,1,y,0,1,.22,.14,col);const a=P(1,part==='back'?1.22:1.78,.14),b=P(2,part==='back'?1.22:1.78,.14);pl(c,a[0],a[1],b[0],b[1],V.edge,1)}
function path(c,P){[[1,2],[2,2]].forEach(([i,j])=>{poly(c,[P(i,j,0),P(i+1,j,0),P(i+1,j+1,0),P(i,j+1,0)],(i+j)%2?R.sandst[3]:R.sandst[2]);for(let k=1;k<4;k++){const q0=P(i+k*.25,j,0),q1=P(i+k*.25,j+1,0),r0=P(i,j+k*.25,0),r1=P(i+1,j+k*.25,0);pl(c,q0[0],q0[1],q1[0],q1[1],R.sandst[1],1);pl(c,r0[0],r0[1],r1[0],r1[1],R.sandst[1],1)}for(let k=0;k<8;k++){const p=P(i+hsh(i,j,k+50),j+hsh(i,j,k+60),0);rect(c,p[0],p[1],2,1,hsh(i,j,k+70)>.5?R.sandst[4]:R.sandst[2])}})}
const HB={x0:1.06,y0:.1,dx:1.88,dy:.76};
const posts=(c,P,col,hi,pts)=>pts.forEach(q=>{const a=P(q[0],q[1],.14),t=P(q[0],q[1],hi);pl(c,a[0],a[1],t[0],t[1],col[3],3);pl(c,a[0]-1,a[1],t[0]-1,t[1],col[4],1);rect(c,t[0]-4,t[1]-1,9,3,col[1])});
const P4=[[1.1,1.04],[1.9,1.04],[1.1,1.96],[1.9,1.96]];
const sconce=(c,w,u,v)=>{const f=w.pt(u,v);rect(c,f[0],f[1]-3,2,3,R.stone[1]);rect(c,f[0]-1,f[1]-6,4,3,R.orange[3]);rect(c,f[0],f[1]-8,2,3,R.yellow[3])};
// ================= A: MAERCHENBURG =================
function houseA(c,P,V){const b=Object.assign({z0:0,dz:1.4},HB),W=walls(P,b);
  Pt.tower(c,P,2.8,.24,.21,0,2.6,V.wall,3);Pt.cone(c,P,2.8,.24,.28,2.6,1.05,V.roof,7);let ap=P(2.8,.24,3.65);disc(c,ap[0],ap[1]-1,2,R.yellow[3]);Pt.flag(c,ap[0],ap[1]-2,13,V.banner[2],1,1);
  Pt.tower(c,P,1.24,.22,.15,0,2.1,V.wall,5);Pt.cone(c,P,1.24,.22,.2,2.1,.8,V.roof,6);ap=P(1.24,.22,2.9);disc(c,ap[0],ap[1]-1,2,R.yellow[3]);
  Pt.stoneTex(c,W.S,V.wall,1);Pt.stoneTex(c,W.E,V.wall,2);W.S.rectUV(c,0,0,b.dx,.1,shade(V.wall,.7));W.E.rectUV(c,0,0,b.dy,.1,shade(V.wall,.5));
  for(let r=0;r<6;r++)if(r%2===0)W.S.rectUV(c,b.dx-.07,.1+r*.17,.07,.15,shade(V.wall,1.14));
  W.S.rectUV(c,0,1.24,b.dx,.06,shade(V.wall,1.2));W.E.rectUV(c,0,1.24,b.dy,.06,shade(V.wall,.8));
  Pt.archDoor(c,W.S,.83,0,.24,.7,R.wood[2],R.stone[1],shade(V.wall,1.15));
  [.1,.36,1.3,1.56].forEach(u=>{Pt.archWindow(c,W.S,u,.62,.14,.46,shade(V.wall,1.15),R.sky[2],{});Pt.archWindow(c,W.S,u,.14,.14,.3,shade(V.wall,1.15),R.sky[2],{})});
  Pt.archWindow(c,W.E,.3,.62,.13,.46,shade(V.wall,.9),R.sky[1],{});
  [.62,1.14].forEach(u=>{W.S.rectUV(c,u,.62,.08,.4,V.banner[2]);poly(c,[W.S.pt(u,.62),W.S.pt(u+.08,.62),W.S.pt(u+.04,.54)],V.banner[2]);const m=W.S.pt(u+.04,.8);rect(c,m[0]-1,m[1]-1,3,3,R.yellow[3]);const t=W.S.pt(u,1.02),t2=W.S.pt(u+.08,1.02);pl(c,t[0],t[1],t2[0],t2[1],R.yellow[3],1)});
  sconce(c,W.S,.74,.5);sconce(c,W.S,1.09,.5);
  const rw=W.S.pt(.95,1.04);disc(c,rw[0],rw[1],6,shade(V.wall,1.2));disc(c,rw[0],rw[1],4,R.blue[3]);pl(c,rw[0]-4,rw[1],rw[0]+4,rw[1],shade(V.wall,1.2),1);pl(c,rw[0],rw[1]-4,rw[0],rw[1]+4,shade(V.wall,1.2),1);
  Pt.gableRoof(c,P,Object.assign({gable:{fill:shade(V.wall,.68)}},b),.05,.5,V.roof,V.roof,{rows:7,tile:.1});
  [1.45,2.4].forEach(x=>{const y=.86-.43*.42,z=1.4+.5*.42,p=P(x,y,z);rect(c,p[0]-8,p[1]-9,17,10,V.wall);rect(c,p[0]-8,p[1]-9,17,1,shade(V.wall,1.15));rect(c,p[0]-4,p[1]-8,8,8,R.sky[2]);rect(c,p[0]-1,p[1]-8,1,8,V.wall);poly(c,[[p[0]-10,p[1]-9],[p[0],p[1]-18],[p[0]+10,p[1]-9]],V.roof[2],V.roof[0]);pl(c,p[0]-10,p[1]-9,p[0],p[1]-18,V.roof[4],1)});
  [[1.55,.3],[2.15,.3]].forEach(k=>{const p=P(k[0],k[1],1.95);rect(c,p[0]-2,p[1]-6,5,8,R.stone[1]);rect(c,p[0]-3,p[1]-7,7,2,R.stone[3])})}
function canopyA(c,P,V){posts(c,P,R.wood,.84,P4);Pt.gableRoofOld(c,P,{x0:1.0,y0:1.0,dx:1.0,dy:1.0,z0:0,dz:.84,gable:{fill:shade(V.wall,.66)}},.08,.3,V.roof,V.roof,{rows:5,tile:.12});for(let k=0;k<5;k++){const a=P(1.0+k*.22,2.1,.8);poly(c,[[a[0]-3,a[1]],[a[0]+3,a[1]],[a[0],a[1]+7]],k%2?V.banner[2]:R.yellow[3])}}
function gateA(c,P,V){[[2.5,2.08],[2.5,2.92]].forEach(q=>{const a=P(q[0],q[1],0),t=P(q[0],q[1],1.15);for(let r=0;r<10;r++){const f=r%2?.82:1;rect(c,a[0]-5,a[1]+(t[1]-a[1])*r/10-4,11,Math.ceil(Math.abs(t[1]-a[1])/10)+1,shade(V.wall,f))}rect(c,a[0]+3,t[1]-4,3,Math.abs(t[1]-a[1])+6,shade(V.wall,.62));Pt.cone(c,P,q[0],q[1],.12,1.15,.5,V.roof,3)});
  const a=P(2.5,2.08,1.0),d=P(2.5,2.92,1.0);pl(c,a[0],a[1]+4,d[0],d[1]+4,R.wood[1],3);const m=P(2.5,2.5,.95);poly(c,[[m[0]-11,m[1]+2],[m[0]+11,m[1]+2],[m[0]+11,m[1]+9],[m[0],m[1]+16],[m[0]-11,m[1]+9]],V.banner[2]);rect(c,m[0]-3,m[1]+4,6,6,R.yellow[3]);rect(c,m[0]-1,m[1]+6,2,2,V.banner[1])}
module.exports.A={house:houseA,canopy:canopyA,gate:gateA,V:[{wall:R.sandst[3],roof:R.slate,banner:R.slate,platform:R.sandst[4],edge:R.yellow[3],track:R.red},{wall:R.cream[2],roof:R.teal,banner:R.plum,platform:R.cream[3],edge:R.yellow[3],track:R.blue}]};
// ================= B: ALPEN-CHALET =================
function houseB(c,P,V){const g=Object.assign({z0:0,dz:.56},HB),u=Object.assign({z0:.56,dz:.78},HB),WG=walls(P,g),WU=walls(P,u);
  Pt.stoneTex(c,WG.S,V.base,1);Pt.stoneTex(c,WG.E,V.base,2);Pt.timberTex(c,WU.S,V.plaster,V.beam,3);Pt.timberTex(c,WU.E,V.plaster,V.beam,4);
  // Ueberkragung Obergeschoss
  const bb=P(1.06,.86,.56),bc=P(2.94,.86,.56);pl(c,bb[0],bb[1],bc[0],bc[1],R.wood[0],3);
  // Tuer + Fenster Erdgeschoss
  WG.S.rectUV(c,.82,0,.26,.5,R.wood[1]);WG.S.rectUV(c,.84,.02,.22,.46,R.wood[3]);[1,2,3].forEach(k=>WG.S.lineUV(c,.84+k*.055,.02,.84+k*.055,.48,R.wood[1],1));const kn=WG.S.pt(1.02,.25);rect(c,kn[0],kn[1],2,2,R.yellow[3]);
  [.14,.42,1.42,1.7].forEach(uu=>Pt.rectWindow(c,WG.S,uu,.16,.16,.24,R.wood[4],R.sky[2],{shutters:V.shutter,flowers:V.flower}));
  [.2,.62,1.14,1.58].forEach(uu=>Pt.rectWindow(c,WU.S,uu,.12,.15,.3,R.wood[4],R.sky[2],{shutters:V.shutter}));Pt.rectWindow(c,WG.E,.3,.1,.16,.2,R.wood[4],R.sky[1],{shutters:V.shutter});Pt.rectWindow(c,WU.E,.3,.12,.15,.3,R.wood[4],R.sky[1],{shutters:V.shutter});
  // Balkon
  const bz=.56,by0=.86,by1=1.0;poly(c,[P(1.3,by0,bz),P(2.7,by0,bz),P(2.7,by1,bz),P(1.3,by1,bz)],R.wood[3],R.wood[1]);for(let k=1;k<10;k++){const a=P(1.3+k*.14,by0,bz),d=P(1.3+k*.14,by1,bz);pl(c,a[0],a[1],d[0],d[1],R.wood[2],1)}
  const f0=P(1.3,by1,bz),f1=P(2.7,by1,bz);pl(c,f0[0],f0[1]+1,f1[0],f1[1]+1,R.wood[1],2);
  for(let k=0;k<=10;k++){const a=P(1.3+k*.14,by1,bz),t=P(1.3+k*.14,by1,bz+.2);pl(c,a[0],a[1],t[0],t[1],R.wood[3],1)}const r0=P(1.3,by1,bz+.2),r1=P(2.7,by1,bz+.2);pl(c,r0[0],r0[1],r1[0],r1[1],R.wood[4],2);
  for(let k=0;k<11;k++){const a=P(1.34+k*.13,by1,bz+.2);rect(c,a[0]-1,a[1]-5-(k%2),3,3,V.flower);rect(c,a[0],a[1]-3,1,2,R.green[2])}
  // Dach mit grossem Ueberstand
  Pt.gableRoof(c,P,Object.assign({gable:{fill:shade(V.plaster,.68)}},{x0:1.06,y0:.1,dx:1.88,dy:.76,z0:0,dz:1.34}),.1,.5,V.roof,V.roof,{rows:6,tile:.09,eave:0});
  [[1.5,.32],[2.55,.32]].forEach(k=>{const p=P(k[0],k[1],1.75);rect(c,p[0]-3,p[1]-9,7,12,R.stone[2]);rect(c,p[0]-4,p[1]-10,9,2,R.stone[4]);rect(c,p[0]-3,p[1]-9,2,12,R.stone[3])});
  // Dachfenster-Gaube
  const gp=P(2.0,.62,1.5);poly(c,[[gp[0]-8,gp[1]+3],[gp[0]+8,gp[1]+3],[gp[0]+8,gp[1]-5],[gp[0],gp[1]-11],[gp[0]-8,gp[1]-5]],V.plaster,R.wood[1]);rect(c,gp[0]-4,gp[1]-4,8,6,R.sky[2]);rect(c,gp[0]-1,gp[1]-4,1,6,R.wood[1])}
function canopyB(c,P,V){posts(c,P,R.wood,.9,P4);Pt.gableRoofOld(c,P,{x0:1.0,y0:1.0,dx:1.0,dy:1.0,z0:0,dz:.9,gable:{fill:shade(V.plaster,.7)}},.14,.32,V.roof,V.roof,{rows:5,tile:.1});for(let k=0;k<3;k++){const a=P(1.2+k*.3,2.1,.7);rect(c,a[0]-3,a[1],7,5,R.wood[0]);rect(c,a[0]-2,a[1]+1,5,3,R.red[3]);rect(c,a[0],a[1]-3,1,3,R.green[2])}}
function gateB(c,P,V){[[2.5,2.08],[2.5,2.92]].forEach(q=>{const a=P(q[0],q[1],0),t=P(q[0],q[1],1.2);pl(c,a[0],a[1],t[0],t[1],R.wood[3],4);pl(c,a[0]-1,a[1],t[0]-1,t[1],R.wood[4],1);for(let k=0;k<5;k++){const y=a[1]+(t[1]-a[1])*(k+.5)/5;rect(c,a[0]-2,y,5,1,R.wood[1])}});
  const a=P(2.5,2.08,1.2),d=P(2.5,2.92,1.2);pl(c,a[0]-2,a[1]-2,d[0]+2,d[1]-2,R.wood[2],4);const ma=P(2.5,2.5,1.4);poly(c,[[a[0]-6,a[1]-2],[ma[0],ma[1]-8],[d[0]+6,d[1]-2]],V.roof[2],R.wood[0]);
  const m=P(2.5,2.5,1.0);rect(c,m[0]-10,m[1]+2,21,8,R.wood[4]);rect(c,m[0]-9,m[1]+3,19,6,R.wood[3]);for(let k=0;k<5;k++)rect(c,m[0]-7+k*4,m[1]+5,2,2,R.wood[0]);const l=P(2.5,2.5,.7);pl(c,m[0],m[1]+10,m[0],l[1]+4,R.stone[1],1);rect(c,l[0]-2,l[1]+4,5,6,R.yellow[3])}
module.exports.B={house:houseB,canopy:canopyB,gate:gateB,V:[{base:R.sandst[2],plaster:R.cream[3],beam:R.wood[1],roof:R.terra,shutter:R.green[2],flower:R.red[3],platform:R.wood[4],edge:R.yellow[3],track:R.green},{base:R.stone[3],plaster:R.yellow[4],beam:R.wood[0],roof:R.slate,shutter:R.blue[2],flower:R.pink[1],platform:R.cream[2],edge:R.red[3],track:R.orange}]};
// ================= C: MEDITERRAN =================
function houseC(c,P,V){const b=Object.assign({z0:0,dz:1.2},HB),W=walls(P,b);
  // Campanile (Quader)
  const bt={x0:2.58,y0:.1,dx:.34,dy:.34,z0:0,dz:2.15},WT=walls(P,bt);Pt.plasterTex(c,WT.S,V.wall,7);Pt.plasterTex(c,WT.E,V.wall,8);
  Pt.archWindow(c,WT.S,.07,1.55,.2,.4,V.dark,R.base[1],{});Pt.archWindow(c,WT.E,.07,1.55,.2,.4,V.dark,R.base[1],{});[1.0].forEach(v=>{WT.S.rectUV(c,0,v,.34,.04,shade(V.wall,1.2));WT.E.rectUV(c,0,v,.34,.04,shade(V.wall,.8))});
  const ta=P(2.58,.44,2.15),tb=P(2.92,.44,2.15),tc2=P(2.92,.1,2.15),apx=P(2.75,.27,2.85);poly(c,[ta,tb,apx],V.roof[2]);poly(c,[tb,tc2,apx],V.roof[1]);pl(c,apx[0],apx[1],apx[0],apx[1]-7,R.stone[4],1);rect(c,apx[0]-2,apx[1]-9,5,2,R.yellow[3]);
  Pt.plasterTex(c,W.S,V.wall,1);Pt.plasterTex(c,W.E,V.wall,2);
  // Arkaden EG
  W.S.rectUV(c,0,0,b.dx,.55,shade(V.wall,.95));for(let k=0;k<6;k++){const u=.1+k*.3;const pts=[W.S.pt(u,0),W.S.pt(u+.22,0)];const r=.11;for(let q=0;q<=8;q++){const a=Math.PI*q/8;pts.push(W.S.pt(u+.11+r*Math.cos(a),.36+r*Math.sin(a)))}poly(c,pts,V.dark);const hl=W.S.pt(u+.01,.2);rect(c,hl[0],hl[1],1,8,shade(V.wall,.7))}
  for(let k=0;k<=6;k++){const u=.04+k*.3;W.S.rectUV(c,u-.02,0,.05,.5,shade(V.wall,1.18))}W.S.rectUV(c,0,.5,b.dx,.05,shade(V.wall,1.2));
  // OG Fenster + Balkone
  [.14,.44,.74,1.04,1.34,1.64].forEach(u=>{Pt.archWindow(c,W.S,u+.03,.68,.14,.32,V.trim,R.sky[2],{shutters:V.shutter});const a=W.S.pt(u-.02,.64),d=W.S.pt(u+.2,.64);pl(c,a[0],a[1]+1,d[0],d[1]+1,R.base[1],1)});
  W.S.rectUV(c,0,1.14,b.dx,.06,shade(V.wall,1.22));W.E.rectUV(c,0,1.14,b.dy,.06,shade(V.wall,.82));
  Pt.archWindow(c,W.E,.3,.4,.15,.44,V.trim,R.sky[1],{shutters:V.shutter});
  // Bougainvillea an der Ostwand
  for(let k=0;k<26;k++){const u=hsh(9,k,1)*.74,v=.1+hsh(9,k,2)*.95,p=W.E.pt(u,v);rect(c,p[0],p[1],3,3,hsh(9,k,3)>.35?R.magenta[2]:R.magenta[1]);if(k%3===0)rect(c,p[0]+1,p[1]+2,2,2,R.green[2])}
  Pt.hipRoof(c,P,b,.08,.42,V.roof,{rows:7});
  [[1.16,.95],[2.8,.95]].forEach(q=>{const p=P(q[0],q[1],0);rect(c,p[0]-3,p[1]-6,7,6,R.terra[2]);rect(c,p[0]-4,p[1]-7,9,2,R.terra[3]);rect(c,p[0]-2,p[1]-12,5,5,R.green[2]);rect(c,p[0],p[1]-14,2,3,R.magenta[2])})}
function canopyC(c,P,V){[[1.1,1.04],[1.9,1.04],[1.1,1.96],[1.9,1.96]].forEach(q=>{const a=P(q[0],q[1],.14),t=P(q[0],q[1],.9);rect(c,a[0]-2,t[1],6,a[1]-t[1],V.wall);rect(c,a[0]+2,t[1],2,a[1]-t[1],shade(V.wall,.7));rect(c,a[0]-3,t[1],8,2,shade(V.wall,1.2));rect(c,a[0]-3,a[1]-2,8,2,shade(V.wall,1.2))});
  Pt.hipRoof(c,P,{x0:1.0,y0:1.0,dx:1.0,dy:1.0,z0:0,dz:.9},.1,.34,V.roof,{rows:5})}
function gateC(c,P,V){[[2.5,2.08],[2.5,2.92]].forEach(q=>{const a=P(q[0],q[1],0),t=P(q[0],q[1],1.15);rect(c,a[0]-4,t[1],9,a[1]-t[1],V.wall);rect(c,a[0]+2,t[1],3,a[1]-t[1],shade(V.wall,.7));rect(c,a[0]-5,t[1]-2,11,3,shade(V.wall,1.2));rect(c,a[0]-5,a[1]-3,11,3,shade(V.wall,1.2));rect(c,a[0]-1,t[1]-6,3,4,V.roof[2])});
  const a=P(2.5,2.08,1.15),d=P(2.5,2.92,1.15),m=P(2.5,2.5,1.2);poly(c,[[a[0]-5,a[1]-2],[d[0]+5,d[1]-2],[d[0]+5,d[1]+6],[a[0]-5,a[1]+6]],V.roof[2],V.roof[0]);pl(c,a[0]-5,a[1]-2,d[0]+5,d[1]-2,V.roof[4],1);
  const s=P(2.5,2.5,.85);rect(c,s[0]-10,s[1],21,9,V.trim);rect(c,s[0]-9,s[1]+1,19,7,V.shutter[0]||R.blue[2]);for(let k=0;k<4;k++)rect(c,s[0]-7+k*4,s[1]+3,2,3,V.trim);for(let k=0;k<6;k++){const bp=P(2.5,2.15+k*.14,1.0);rect(c,bp[0]-1,bp[1],3,3,k%2?R.magenta[2]:R.magenta[1])}}
module.exports.C={house:houseC,canopy:canopyC,gate:gateC,V:[{wall:R.cream[2],dark:R.base[3],roof:R.terra,trim:R.cream[4],shutter:R.blue,platform:R.cream[3],edge:R.blue[2],track:R.blue},{wall:R.peach[2],dark:R.base[3],roof:R.teal,trim:R.cream[4],shutter:R.green,platform:R.peach[3],edge:R.magenta[2],track:R.purple}]};
// ================= D: WESTERN =================
function houseD(c,P,V){const b=Object.assign({z0:0,dz:.88},HB),W=walls(P,b);
  // Wasserturm hinten rechts
  [[2.55,.2],[2.95,.2],[2.55,.5],[2.95,.5]].forEach(q=>{const a=P(q[0],q[1],0),t=P(q[0],q[1],1.0);pl(c,a[0],a[1],t[0],t[1],R.wood[2],2)});const bw=P(2.75,.35,1.0);ell(c,bw[0],bw[1]+2,12,6,R.wood[1]);
  for(let x=-12;x<=12;x++){const t=(x+12)/24,f=t<.3?1.12:t<.65?.95:.75;c.fillStyle=shade(V.tank,f);c.fillRect(bw[0]+x,bw[1]-18,1,18+Math.round(6*Math.sqrt(1-(x/12)*(x/12))))}
  [-3,-9,-15].forEach(y=>pl(c,bw[0]-12,bw[1]+y,bw[0]+12,bw[1]+y,R.stone[1],1));ell(c,bw[0],bw[1]-18,12,6,shade(V.tank,.85));poly(c,[[bw[0]-13,bw[1]-18],[bw[0],bw[1]-32],[bw[0]+13,bw[1]-18]],V.roof[2]);poly(c,[[bw[0],bw[1]-32],[bw[0]+13,bw[1]-18],[bw[0],bw[1]-13]],V.roof[1]);
  Pt.plankTex(c,W.S,V.wall,1);Pt.plankTex(c,W.E,V.wall,2);
  // Falsche Fassade
  const fh=.65;W.S.rectUV(c,0,b.dz,b.dx,fh,shade(V.wall,.95));for(let k=0;k<=21;k++)W.S.lineUV(c,k*b.dx/21,b.dz,k*b.dx/21,b.dz+fh,shade(V.wall,.58),1);
  poly(c,[W.S.pt(.7,b.dz+fh),W.S.pt(1.18,b.dz+fh),W.S.pt(1.18,b.dz+fh+.3),W.S.pt(.7,b.dz+fh+.3)],shade(V.wall,.95));
  const s0=W.S.pt(.74,b.dz+.28);W.S.rectUV(c,.32,b.dz+.12,1.24,.34,V.sign);W.S.rectUV(c,.34,b.dz+.14,1.2,.3,V.sign2);
  for(let k=0;k<8;k++){const a=W.S.pt(.42+k*.14,b.dz+.2);rect(c,a[0],a[1]-5,3,5,V.letter);rect(c,a[0]+(k%2),a[1]-3,2,1,V.sign2)}
  W.S.rectUV(c,0,b.dz+fh,b.dx,.05,shade(V.wall,.6));W.E.rectUV(c,0,0,.1,b.dz,shade(V.wall,.7));
  // Vordach + Veranda
  const ax=1.06,bx=2.94;poly(c,[P(ax,.86,.92),P(bx,.86,.92),P(bx,1.2,.68),P(ax,1.2,.68)],V.roof[2],V.roof[0]);for(let k=1;k<8;k++){const a=P(ax,.86+.34*k/8,.92-.24*k/8),d=P(bx,.86+.34*k/8,.92-.24*k/8);pl(c,a[0],a[1],d[0],d[1],V.roof[1],1)}
  box(c,P,ax,.86,0,bx-ax,.34,.05,R.wood[3]);for(let k=0;k<=8;k++){const x=ax+.04+k*(bx-ax-.08)/8,a=P(x,1.17,.05),t=P(x,1.17,.7);pl(c,a[0],a[1],t[0],t[1],R.wood[3],2)}const r0=P(ax,1.17,.34),r1=P(bx,1.17,.34);pl(c,r0[0],r0[1],r1[0],r1[1],R.wood[4],2);
  // Pendeltuer + Fenster
  W.S.rectUV(c,.82,0,.26,.5,R.wood[1]);[.84,.97].forEach(u=>{W.S.rectUV(c,u,.1,.11,.3,R.wood[3]);for(let k=1;k<6;k++)W.S.lineUV(c,u,.1+k*.05,u+.11,.1+k*.05,R.wood[1],1)});
  [.14,.4,1.34,1.6].forEach(u=>Pt.rectWindow(c,W.S,u,.2,.18,.32,V.trim,R.sky[2],{shutters:V.shutter}));Pt.rectWindow(c,W.E,.3,.2,.18,.32,V.trim,R.sky[1],{shutters:V.shutter});
  // Fass + Haltebalken
  const f=P(1.3,1.35,0);rect(c,f[0]-5,f[1]-10,11,10,R.wood[2]);rect(c,f[0]-5,f[1]-8,11,1,R.stone[1]);rect(c,f[0]-5,f[1]-3,11,1,R.stone[1]);rect(c,f[0]-4,f[1]-11,9,2,R.wood[4]);
  const h0=P(1.5,1.5,.28),h1=P(2.5,1.5,.28);pl(c,h0[0],h0[1],h1[0],h1[1],R.wood[4],2);[1.5,2.0,2.5].forEach(x=>{const a=P(x,1.5,0),t=P(x,1.5,.3);pl(c,a[0],a[1],t[0],t[1],R.wood[3],2)})}
function canopyD(c,P,V){posts(c,P,R.wood,.86,P4);poly(c,[P(.96,.98,.98),P(2.04,.98,.98),P(2.04,2.04,.86),P(.96,2.04,.86)],V.roof[2],V.roof[0]);for(let k=1;k<9;k++){const y=.98+1.06*k/9,z=.98-.12*k/9,a=P(.96,y,z),d=P(2.04,y,z);pl(c,a[0],a[1],d[0],d[1],V.roof[1],1)}const e0=P(.96,2.04,.86),e1=P(2.04,2.04,.86);pl(c,e0[0],e0[1]+1,e1[0],e1[1]+1,V.roof[0],2);for(let k=0;k<8;k++){const a=P(1.0+k*.13,2.04,.84);poly(c,[[a[0]-2,a[1]+2],[a[0]+2,a[1]+2],[a[0],a[1]+6]],R.wood[3])}}
function gateD(c,P,V){[[2.5,2.08],[2.5,2.92]].forEach(q=>{const a=P(q[0],q[1],0),t=P(q[0],q[1],1.2);pl(c,a[0],a[1],t[0],t[1],R.wood[2],5);pl(c,a[0]-2,a[1],t[0]-2,t[1],R.wood[4],1);for(let k=0;k<6;k++){const y=a[1]+(t[1]-a[1])*(k+.5)/6;rect(c,a[0]-2,y,6,1,R.wood[0])}});
  const a=P(2.5,2.08,1.2),d=P(2.5,2.92,1.2);pl(c,a[0],a[1]-2,d[0],d[1]-2,R.wood[2],5);const m=P(2.5,2.5,1.0);rect(c,m[0]-13,m[1]-2,27,11,V.sign);rect(c,m[0]-12,m[1]-1,25,9,V.sign2);for(let k=0;k<6;k++)rect(c,m[0]-9+k*4,m[1]+1,2,4,V.letter);pl(c,m[0]-8,m[1]-2,a[0],a[1]-1,R.stone[1],1);pl(c,m[0]+8,m[1]-2,d[0],d[1]-1,R.stone[1],1)}
module.exports.D={house:houseD,canopy:canopyD,gate:gateD,V:[{wall:R.wood[3],roof:R.wood,tank:R.wood[2],sign:R.wood[0],sign2:R.cream[3],letter:R.red[2],trim:R.cream[3],shutter:R.green[1],platform:R.wood[4],edge:R.cream[3],track:R.red},{wall:R.cream[3],roof:R.slate,tank:R.blue[1],sign:R.blue[0],sign2:R.cream[4],letter:R.blue[2],trim:R.blue[3],shutter:R.blue[2],platform:R.cream[2],edge:R.blue[3],track:R.blue}]};

const chim=(c,P,x,y,z,h)=>{box(c,P,x,y,z,.13,.13,h,R.stone[2]);box(c,P,x-.015,y-.015,z+h,.16,.16,.05,R.stone[3])};
// ---- A neu ----
function houseA2(c,P,V){const b=Object.assign({z0:0,dz:1.4},HB),W=walls(P,b);
  Pt.tower(c,P,2.8,.24,.21,0,2.6,V.wall,3);Pt.cone(c,P,2.8,.24,.28,2.6,1.05,V.roof,7);let ap=P(2.8,.24,3.65);disc(c,ap[0],ap[1]-1,2,R.yellow[3]);Pt.flag(c,ap[0],ap[1]-2,13,V.banner[2],1,1);
  Pt.tower(c,P,1.24,.22,.15,0,2.1,V.wall,5);Pt.cone(c,P,1.24,.22,.2,2.1,.8,V.roof,6);ap=P(1.24,.22,2.9);disc(c,ap[0],ap[1]-1,2,R.yellow[3]);
  Pt.stoneTex(c,W.S,V.wall,1);Pt.stoneTex(c,W.E,V.wall,2);W.S.rectUV(c,0,0,b.dx,.1,shade(V.wall,.7));W.E.rectUV(c,0,0,b.dy,.1,shade(V.wall,.5));
  for(let r=0;r<6;r++)if(r%2===0)W.S.rectUV(c,b.dx-.07,.1+r*.17,.07,.15,shade(V.wall,1.14));
  W.S.rectUV(c,0,1.24,b.dx,.06,shade(V.wall,1.2));W.E.rectUV(c,0,1.24,b.dy,.06,shade(V.wall,.8));
  Pt.archDoor(c,W.S,.83,0,.24,.7,R.wood[2],R.stone[1],shade(V.wall,1.15));
  [.1,.36,1.3,1.56].forEach(u=>{Pt.archWindow(c,W.S,u,.62,.14,.46,shade(V.wall,1.15),R.sky[2],{});Pt.archWindow(c,W.S,u,.14,.14,.3,shade(V.wall,1.15),R.sky[2],{})});
  Pt.archWindow(c,W.E,.3,.62,.13,.46,shade(V.wall,.9),R.sky[1],{});
  [.62,1.14].forEach(u=>{W.S.rectUV(c,u,.62,.08,.4,V.banner[2]);poly(c,[W.S.pt(u,.62),W.S.pt(u+.08,.62),W.S.pt(u+.04,.54)],V.banner[2]);const m=W.S.pt(u+.04,.8);rect(c,m[0]-1,m[1]-1,3,3,R.yellow[3]);const t=W.S.pt(u,1.02),t2=W.S.pt(u+.08,1.02);pl(c,t[0],t[1],t2[0],t2[1],R.yellow[3],1)});
  sconce(c,W.S,.74,.5);sconce(c,W.S,1.09,.5);
  const rw=W.S.pt(.95,1.04);disc(c,rw[0],rw[1],6,shade(V.wall,1.2));disc(c,rw[0],rw[1],4,R.blue[3]);pl(c,rw[0]-4,rw[1],rw[0]+4,rw[1],shade(V.wall,1.2),1);pl(c,rw[0],rw[1]-4,rw[0],rw[1]+4,shade(V.wall,1.2),1);
  const o={rows:7,tile:.1,fascia:shade(V.wall,.8),barge:shade(V.wall,1.18),gableTex:(cc,w,rh)=>Pt.stoneTex(cc,Object.assign(w,{h:rh}),V.wall,9),gableWin:(cc,w,len,rh)=>{Pt.archWin(cc,w,len/2-.08,.1,.16,.38,shade(V.wall,1.2),R.sky[2]);const a=w.pt(len/2,.1),d=w.pt(len/2,.48);}};
  const rf=Pt.gableRoof2(c,P,b,.05,.8,V.roof,o);
  [1.45,2.4].forEach(x=>{const yd=rf.ys-(rf.ys-rf.ym)*.14,zb=rf.zAt(yd);Pt.dormer(c,P,x,yd,zb,.46,.5,{wall:V.wall,frame:shade(V.wall,1.2),glass:R.sky[2],slopeY:1/rf.slope},V.roof)});
  chim(c,P,1.58,rf.ym-.06,rf.zr-.1,.38);chim(c,P,2.2,rf.ym-.06,rf.zr-.1,.38)}
// ---- B neu ----
function houseB2(c,P,V){const g=Object.assign({z0:0,dz:.56},HB),u=Object.assign({z0:.56,dz:.78},HB),WG=walls(P,g),WU=walls(P,u);
  Pt.stoneTex(c,WG.S,V.base,1);Pt.stoneTex(c,WG.E,V.base,2);Pt.timberTex(c,WU.S,V.plaster,V.beam,3);Pt.timberTex(c,WU.E,V.plaster,V.beam,4);
  const bb=P(1.06,.86,.56),bc=P(2.94,.86,.56);pl(c,bb[0],bb[1],bc[0],bc[1],R.wood[0],3);
  WG.S.rectUV(c,.82,0,.26,.5,R.wood[1]);WG.S.rectUV(c,.84,.02,.22,.46,R.wood[3]);[1,2,3].forEach(k=>WG.S.lineUV(c,.84+k*.055,.02,.84+k*.055,.48,R.wood[1],1));const kn=WG.S.pt(1.02,.25);rect(c,kn[0],kn[1],2,2,R.yellow[3]);
  [.14,.42,1.42,1.7].forEach(uu=>Pt.rectWindow(c,WG.S,uu,.16,.16,.24,R.wood[4],R.sky[2],{shutters:V.shutter,flowers:V.flower}));
  [.2,.62,1.14,1.58].forEach(uu=>Pt.rectWindow(c,WU.S,uu,.12,.15,.3,R.wood[4],R.sky[2],{shutters:V.shutter}));Pt.rectWindow(c,WG.E,.3,.1,.16,.2,R.wood[4],R.sky[1],{shutters:V.shutter});Pt.rectWindow(c,WU.E,.3,.12,.15,.3,R.wood[4],R.sky[1],{shutters:V.shutter});
  const bz=.56,by0=.86,by1=1.0;poly(c,[P(1.3,by0,bz),P(2.7,by0,bz),P(2.7,by1,bz),P(1.3,by1,bz)],R.wood[3],R.wood[1]);for(let k=1;k<10;k++){const a=P(1.3+k*.14,by0,bz),d=P(1.3+k*.14,by1,bz);pl(c,a[0],a[1],d[0],d[1],R.wood[2],1)}
  const f0=P(1.3,by1,bz),f1=P(2.7,by1,bz);pl(c,f0[0],f0[1]+1,f1[0],f1[1]+1,R.wood[1],2);
  for(let k=0;k<=10;k++){const a=P(1.3+k*.14,by1,bz),t=P(1.3+k*.14,by1,bz+.2);pl(c,a[0],a[1],t[0],t[1],R.wood[3],1)}const r0=P(1.3,by1,bz+.2),r1=P(2.7,by1,bz+.2);pl(c,r0[0],r0[1],r1[0],r1[1],R.wood[4],2);
  for(let k=0;k<11;k++){const a=P(1.34+k*.13,by1,bz+.2);rect(c,a[0]-1,a[1]-5-(k%2),3,3,V.flower);rect(c,a[0],a[1]-3,1,2,R.green[2])}
  const bR={x0:1.06,y0:.1,dx:1.88,dy:.76,z0:0,dz:1.34};
  const o={rows:6,tile:.09,fascia:R.wood[1],barge:R.wood[3],gableTex:(cc,w,rh)=>Pt.timberTex(cc,Object.assign(w,{h:rh}),V.plaster,V.beam,11),gableWin:(cc,w,len,rh)=>{Pt.archWin(cc,w,len/2-.07,.09,.14,.3,R.wood[3],R.sky[2])}};
  const rf=Pt.gableRoof2(c,P,bR,.07,.72,V.roof,o);
  { const x=2.0,yd=rf.ys-(rf.ys-rf.ym)*.14,zb=rf.zAt(yd);Pt.dormer(c,P,x,yd,zb,.5,.46,{wall:V.plaster,frame:R.wood[3],glass:R.sky[2],slopeY:1/rf.slope},V.roof);
    // Blumenkasten an der Gaube
    const W2=wallOf(P,{x0:x-.25,y0:yd+.02,dx:.5,dy:0,z0:zb},'S');W2.rectUV(c,.04,0,.42,.06,R.wood[2]);for(let k=0;k<6;k++){const a=W2.pt(.06+k*.07,.06);rect(c,a[0]-1,a[1]-3,3,3,V.flower);rect(c,a[0],a[1]-1,1,1,R.green[2])} }
  chim(c,P,1.5,rf.ym-.06,rf.zr-.14,.4);chim(c,P,2.55,rf.ym-.06,rf.zr-.14,.4)}
// ---- D neu ----
function houseD2(c,P,V){const b=Object.assign({z0:0,dz:.88},HB),W=walls(P,b);
  [[2.55,.2],[2.95,.2],[2.55,.5],[2.95,.5]].forEach(q=>{const a=P(q[0],q[1],0),t=P(q[0],q[1],1.0);pl(c,a[0],a[1],t[0],t[1],R.wood[2],2)});const bw=P(2.75,.35,1.0);
  ell(c,bw[0],bw[1]+2,12,6,R.wood[1]);for(let x=-12;x<=12;x++){const t=(x+12)/24,f=t<.3?1.12:t<.65?.95:.75;c.fillStyle=shade(V.tank,f);c.fillRect(bw[0]+x,bw[1]-18,1,18+Math.round(6*Math.sqrt(1-(x/12)*(x/12))))}
  [-3,-9,-15].forEach(y=>pl(c,bw[0]-12,bw[1]+y,bw[0]+12,bw[1]+y,R.stone[1],1));ell(c,bw[0],bw[1]-18,12,6,shade(V.tank,.85));poly(c,[[bw[0]-13,bw[1]-18],[bw[0],bw[1]-32],[bw[0]+13,bw[1]-18]],V.roof[2]);poly(c,[[bw[0],bw[1]-32],[bw[0]+13,bw[1]-18],[bw[0],bw[1]-13]],V.roof[1]);
  Pt.plankTex(c,W.S,V.wall,1);Pt.plankTex(c,W.E,V.wall,2);
  // flaches Satteldach hinter der falschen Fassade, geschlossener Giebel mit Fenster
  const o={rows:5,tile:.08,fascia:R.wood[1],barge:V.trim,gableTex:(cc,w,rh)=>Pt.plankTex(cc,Object.assign(w,{h:rh}),V.wall,13),gableWin:(cc,w,len,rh)=>{Pt.rectWindow(cc,w,len/2-.07,.06,.14,.16,V.trim,R.sky[1],{})}};
  const bR={x0:1.06,y0:.1,dx:1.88,dy:.76,z0:0,dz:.88};Pt.gableRoof2(c,P,bR,.05,.3,V.roof,o);
  // Falsche Fassade mit Dicke
  const fh=.68,fb={x0:1.06,y0:.8,dx:1.88,dy:.06,z0:b.dz,dz:fh};box(c,P,fb.x0,fb.y0,fb.z0,fb.dx,fb.dy,fb.dz,V.wall);
  const FS=Object.assign(wallOf(P,{x0:1.06,y0:.1,dx:1.88,dy:.76,z0:0},'S'),{face:'S'});
  for(let k=0;k<=21;k++)FS.lineUV(c,k*b.dx/21,b.dz,k*b.dx/21,b.dz+fh,shade(V.wall,.58),1);
  poly(c,[FS.pt(.7,b.dz+fh),FS.pt(1.18,b.dz+fh),FS.pt(1.18,b.dz+fh+.3),FS.pt(.7,b.dz+fh+.3)],shade(V.wall,.95),R.base[1]);
  FS.rectUV(c,.32,b.dz+.12,1.24,.34,V.sign);FS.rectUV(c,.34,b.dz+.14,1.2,.3,V.sign2);
  for(let k=0;k<8;k++){const a=FS.pt(.42+k*.14,b.dz+.2);rect(c,a[0],a[1]-5,3,5,V.letter);rect(c,a[0]+(k%2),a[1]-3,2,1,V.sign2)}
  FS.rectUV(c,0,b.dz+fh-.04,b.dx,.04,shade(V.wall,.6));
  // Vordach + Veranda
  const ax=1.06,bx=2.94;poly(c,[P(ax,.86,.92),P(bx,.86,.92),P(bx,1.2,.68),P(ax,1.2,.68)],V.roof[2],V.roof[0]);for(let k=1;k<8;k++){const a=P(ax,.86+.34*k/8,.92-.24*k/8),d=P(bx,.86+.34*k/8,.92-.24*k/8);pl(c,a[0],a[1],d[0],d[1],V.roof[1],1)}
  box(c,P,ax,.86,0,bx-ax,.34,.05,R.wood[3]);for(let k=0;k<=8;k++){const x=ax+.04+k*(bx-ax-.08)/8,a=P(x,1.17,.05),t=P(x,1.17,.7);pl(c,a[0],a[1],t[0],t[1],R.wood[3],2)}const r0=P(ax,1.17,.34),r1=P(bx,1.17,.34);pl(c,r0[0],r0[1],r1[0],r1[1],R.wood[4],2);
  W.S.rectUV(c,.82,0,.26,.5,R.wood[1]);[.84,.97].forEach(u=>{W.S.rectUV(c,u,.1,.11,.3,R.wood[3]);for(let k=1;k<6;k++)W.S.lineUV(c,u,.1+k*.05,u+.11,.1+k*.05,R.wood[1],1)});
  [.14,.4,1.34,1.6].forEach(u=>Pt.rectWindow(c,W.S,u,.2,.18,.32,V.trim,R.sky[2],{shutters:V.shutter}));Pt.rectWindow(c,W.E,.3,.2,.18,.32,V.trim,R.sky[1],{shutters:V.shutter});
  const f=P(1.3,1.35,0);rect(c,f[0]-5,f[1]-10,11,10,R.wood[2]);rect(c,f[0]-5,f[1]-8,11,1,R.stone[1]);rect(c,f[0]-5,f[1]-3,11,1,R.stone[1]);rect(c,f[0]-4,f[1]-11,9,2,R.wood[4]);
  const h0=P(1.5,1.5,.28),h1=P(2.5,1.5,.28);pl(c,h0[0],h0[1],h1[0],h1[1],R.wood[4],2);[1.5,2.0,2.5].forEach(x=>{const a=P(x,1.5,0),t=P(x,1.5,.3);pl(c,a[0],a[1],t[0],t[1],R.wood[3],2)})}
module.exports.A.house=houseA2;module.exports.B.house=houseB2;module.exports.D.house=houseD2;

// ================= SZENEN =================
function bbox(cv){const w=cv.width,h=cv.height,d=cv.getContext('2d').getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}return[x0,y0,x1,y1]}
function crop(cv,pad){const[b0,b1,b2,b3]=bbox(cv);pad=pad||4;const w=b2-b0+1+pad*2,h=b3-b1+1+pad*2,o=mk(w,h);o.getContext('2d').drawImage(cv,b0-pad,b1-pad,w,h,0,0,w,h);return o}
function scene(theme,vi){const T=module.exports[theme],V=T.V[vi];const W=330,H=260,cv=mk(W,H),c=cv.getContext('2d'),P=proj(150,96);
  for(let j=0;j<3;j++)for(let i=0;i<4;i++)grassTile(c,P,i,j);
  poly(c,[P(0,3,0),P(4,3,0),P(4,3,-.7),P(0,3,-.7)],R.wood[3]);poly(c,[P(4,0,0),P(4,3,0),P(4,3,-.7),P(4,0,-.7)],R.wood[1]);
  path(c,P);track(c,P,V);platform(c,P,V,'back');T.house(c,P,V);platform(c,P,V,'front');T.canopy(c,P,V);T.gate(c,P,V);quantize(c,W,H);return crop(cv,3)}
function hero(theme,vi){const T=module.exports[theme],V=T.V[vi];const W=330,H=260,cv=mk(W,H),c=cv.getContext('2d'),P=proj(150,96);
  for(let j=0;j<2;j++)for(let i=0;i<4;i++)grassTile(c,P,i,j);poly(c,[P(0,2,0),P(4,2,0),P(4,2,-.6),P(0,2,-.6)],R.wood[3]);poly(c,[P(4,0,0),P(4,2,0),P(4,2,-.6),P(4,0,-.6)],R.wood[1]);
  T.house(c,P,V);quantize(c,W,H);return crop(cv,3)}
module.exports.scene=scene;module.exports.hero=hero;module.exports.crop=crop;
