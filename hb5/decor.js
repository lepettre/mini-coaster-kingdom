const L=require('./lib.js');const {R,hsh,pl,rect,disc,ell,poly,shade,mk,proj,grassTile,quantize}=L;
function box(c,P,x0,y0,z0,dx,dy,dz,col,out){const f=(p,cc)=>poly(c,p,cc,out);f([P(x0,y0+dy,z0+dz),P(x0+dx,y0+dy,z0+dz),P(x0+dx,y0+dy,z0),P(x0,y0+dy,z0)],shade(col,.9));f([P(x0+dx,y0,z0+dz),P(x0+dx,y0+dy,z0+dz),P(x0+dx,y0+dy,z0),P(x0+dx,y0,z0)],shade(col,.66));f([P(x0,y0,z0+dz),P(x0+dx,y0,z0+dz),P(x0+dx,y0+dy,z0+dz),P(x0,y0+dy,z0+dz)],shade(col,1.12))}
function cyl(c,x,y,rx,h,col){const ry=rx/2;for(let q=-rx;q<=rx;q++){const t=(q+rx)/(2*rx),f=t<.25?1.15:t<.55?1.0:t<.8?.85:.68;c.fillStyle=shade(col,f);const dy=Math.round(ry*Math.sqrt(Math.max(0,1-(q/rx)*(q/rx))));c.fillRect(x+q,y-h,1,h+dy)}ell(c,x,y-h,rx,ry,shade(col,1.12))}
function shad(c,x,y,w){c.fillStyle='rgba(30,60,20,.26)';c.beginPath();c.ellipse(x+4,y+1,w,w*.42,0,0,7);c.fill()}
function fountain(c,P,V){const x=P(.5,.5,0)[0],y=P(.5,.5,0)[1];shad(c,x,y,28);
  ell(c,x,y+7,25,12.5,shade(V.stone,.6));for(let q=-25;q<=25;q++){const dy=Math.round(12.5*Math.sqrt(1-(q/25)*(q/25)));c.fillStyle=shade(V.stone,q<-8?1.05:q<10?.9:.7);c.fillRect(x+q,y,1,dy+7)}
  ell(c,x,y,25,12.5,shade(V.stone,1.15));ell(c,x,y,21,10.5,R.water[1]);ell(c,x-1,y,18,9,R.water[2]);for(let k=0;k<8;k++){const a=hsh(k,3,1)*6.28,d=hsh(k,3,2)*.8;rect(c,x+Math.cos(a)*d*16,y+Math.sin(a)*d*8,4,1,R.water[3])}
  cyl(c,x,y-1,6,11,V.stone);ell(c,x,y-13,13,6.5,shade(V.stone,.7));ell(c,x,y-14,13,6.5,shade(V.stone,1.1));ell(c,x,y-14,10,5,R.water[2]);cyl(c,x,y-14,2,12,V.stone);
  [[-8,-3],[-5,-8],[0,-10],[5,-8],[8,-3]].forEach((d,i)=>{rect(c,x+d[0],y-26+d[1]+8,1,1,'#FFFFFF');rect(c,x+d[0]+(d[0]>0?1:-1),y-26+d[1]+10,1,1,R.water[4])});rect(c,x,y-34,1,6,'#FFFFFF');rect(c,x-1,y-30,3,1,R.water[4]);
  [[-12,10],[12,10],[0,14]].forEach(d=>{rect(c,x+d[0],y+d[1]-2,1,1,R.water[4])})}
function gazebo(c,P,V){const x=P(.5,.5,0)[0],y=P(.5,.5,0)[1];shad(c,x,y,32);box(c,P,.12,.12,0,.76,.76,.07,V.base);
  const pts=[[.2,.2],[.8,.2],[.2,.8],[.8,.8]];const post=(q)=>{const a=P(q[0],q[1],.07),t=P(q[0],q[1],1.05);pl(c,a[0],a[1],t[0],t[1],V.wall,3);pl(c,a[0]-1,a[1],t[0]-1,t[1],shade(V.wall,1.25),1)};
  post(pts[0]);post(pts[1]);post(pts[2]);post(pts[3]);
  // Bank innen
  box(c,P,.3,.28,.07,.4,.1,.12,R.wood[3]);
  // Gelaender
  [[.2,.8,.8,.8],[.8,.2,.8,.8]].forEach(l=>{const a=P(l[0],l[1],.32),d=P(l[2],l[3],.32);pl(c,a[0],a[1],d[0],d[1],V.wall,2);for(let k=0;k<=6;k++){const xx=l[0]+(l[2]-l[0])*k/6,yy=l[1]+(l[3]-l[1])*k/6,p=P(xx,yy,.07),q=P(xx,yy,.32);pl(c,p[0],p[1],q[0],q[1],V.wall,1)}});
  const ap=P(.5,.5,1.85);const e=[P(.02,.02,1.05),P(.98,.02,1.05),P(.98,.98,1.05),P(.02,.98,1.05)];
  poly(c,[e[3],e[2],ap],V.roof[2],V.roof[0]);poly(c,[e[2],e[1],ap],V.roof[1],V.roof[0]);
  for(let k=1;k<6;k++){const s=k/6,a=[e[3][0]+(ap[0]-e[3][0])*s,e[3][1]+(ap[1]-e[3][1])*s],b=[e[2][0]+(ap[0]-e[2][0])*s,e[2][1]+(ap[1]-e[2][1])*s];pl(c,a[0],a[1],b[0],b[1],V.roof[1],1)}
  pl(c,e[3][0],e[3][1]+1,e[2][0],e[2][1]+1,V.roof[0],2);pl(c,e[2][0],e[2][1]+1,e[1][0],e[1][1]+1,V.roof[0],2);for(let k=0;k<8;k++){const a=[e[3][0]+(e[2][0]-e[3][0])*k/7,e[3][1]+(e[2][1]-e[3][1])*k/7];rect(c,a[0]-1,a[1]+2,3,3,V.trim)}
  pl(c,ap[0],ap[1],ap[0],ap[1]-8,R.yellow[3],1);disc(c,ap[0],ap[1]-9,2,R.yellow[3])}
function bed(c,P,V){const x=P(.5,.5,0)[0],y=P(.5,.5,0)[1];shad(c,x,y,22);ell(c,x,y+2,23,11.5,R.stone[1]);ell(c,x,y,23,11.5,R.stone[4]);ell(c,x,y,20,10,R.wood[1]);
  [[17,8.5,V.c[0],14],[11,5.5,V.c[1],10],[5,2.5,V.c[2],6]].forEach(([rx,ry,col,n])=>{for(let k=0;k<n;k++){const a=k/n*6.28;const fx=x+Math.cos(a)*rx,fy=y+Math.sin(a)*ry;rect(c,fx-1,fy-2,3,3,col);rect(c,fx,fy-2,1,1,R.yellow[4]);rect(c,fx,fy+1,1,1,R.green[2])}});
  rect(c,x-2,y-6,5,5,V.c[3]);rect(c,x-1,y-9,3,3,V.c[3]);rect(c,x,y-4,1,4,R.green[2])}
function pot(c,x,y){rect(c,x-6,y-6,13,6,R.terra[2]);rect(c,x-6,y-6,4,6,R.terra[3]);rect(c,x-7,y-8,15,3,R.terra[1]);rect(c,x-5,y-1,11,1,R.terra[0])}
function topiary(c,P,kind){const x=P(.5,.5,0)[0],y=P(.5,.5,0)[1];shad(c,x,y,13);pot(c,x,y);const g=R.grass;
  if(kind==='ball'){disc(c,x,y-21,12,g[0]);disc(c,x,y-21,11,g[1]);disc(c,x-2,y-23,9,g[2]);disc(c,x-4,y-26,5,g[3]);for(let k=0;k<18;k++){const a=hsh(1,k,1)*6.28,d=Math.sqrt(hsh(1,k,2))*10;rect(c,x+Math.cos(a)*d,y-21+Math.sin(a)*d,1,1,hsh(1,k,3)>.5?g[4]:g[0])}}
  else if(kind==='cone'){[[ -9,10],[-17,8],[-25,6],[-32,4]].forEach((t,k)=>{poly(c,[[x,y+t[0]-8],[x+t[1],y+t[0]+3],[x-t[1],y+t[0]+3]],g[1]);poly(c,[[x,y+t[0]-8],[x-t[1],y+t[0]+3],[x-1,y+t[0]+3]],g[2]);pl(c,x-t[1]+2,y+t[0]+1,x-1,y+t[0]-6,g[3],1)});disc(c,x,y-42,2,R.yellow[3])}
  else{for(let k=0;k<5;k++){const r=10-k*1.8,xx=x+Math.round(Math.sin(k*1.3)*3);disc(c,xx,y-12-k*7,r+1,g[0]);disc(c,xx,y-12-k*7,r,g[1]);disc(c,xx-1,y-13-k*7,r*.75,g[2]);disc(c,xx-2,y-15-k*7,r*.4,g[3])}disc(c,x+1,y-48,3,g[2])}}
function lamp(c,P,V){const x=P(.5,.5,0)[0],y=P(.5,.5,0)[1];shad(c,x,y,8);rect(c,x-4,y-3,9,3,V.base);rect(c,x-3,y-7,7,5,V.base);rect(c,x-3,y-7,2,5,shade(V.base,1.3));rect(c,x-1,y-41,3,35,V.iron);rect(c,x-1,y-41,1,35,shade(V.iron,1.5));rect(c,x-3,y-17,7,2,V.iron);rect(c,x-4,y-26,9,1,V.gold);
  poly(c,[[x-5,y-40],[x+5,y-40],[x+6,y-48],[x-6,y-48]],V.iron);rect(c,x-4,y-47,9,7,V.glass);rect(c,x-4,y-47,3,7,R.yellow[4]);rect(c,x-1,y-47,1,7,V.iron);poly(c,[[x-7,y-48],[x+7,y-48],[x,y-55]],V.iron);disc(c,x,y-56,2,V.gold);rect(c,x-6,y-40,13,1,V.gold);rect(c,x-2,y-42,5,2,V.gold)}
function bench(c,P,V){const x=P(.5,.5,0)[0],y=P(.5,.5,0)[1];shad(c,x,y,19);
  [[.12,.38],[.84,.38]].forEach(q=>{box(c,P,q[0],q[1],0,.05,.26,.28,V.iron)});
  box(c,P,.1,.34,.26,.8,.32,.06,V.wood);for(let k=1;k<5;k++){const a=P(.1,.34+k*.064,.32),d=P(.9,.34+k*.064,.32);pl(c,a[0],a[1],d[0],d[1],shade(V.wood,.7),1)}
  box(c,P,.1,.34,.32,.8,.05,.3,V.wood);for(let k=1;k<3;k++){const a=P(.1,.39,.32+k*.1),d=P(.9,.39,.32+k*.1);pl(c,a[0],a[1],d[0],d[1],shade(V.wood,.7),1)}
  [[.1],[.88]].forEach(q=>{const a=P(q[0],.34,.62),t=P(q[0],.34,.7);disc(c,t[0],t[1],2,V.gold)})}
function statue(c,P,V){const x=P(.5,.5,0)[0],y=P(.5,.5,0)[1];shad(c,x,y,15);box(c,P,.3,.3,0,.4,.4,.2,V.ped);box(c,P,.34,.34,.2,.32,.32,.5,V.ped2);const b=P(.5,.5,.7);
  rect(c,b[0]-5,b[1]-4,11,4,shade(V.fig,.8));rect(c,b[0]-4,b[1]-22,9,18,V.fig);rect(c,b[0]-4,b[1]-22,3,18,shade(V.fig,1.2));rect(c,b[0]-9,b[1]-20,5,3,V.fig);rect(c,b[0]+5,b[1]-26,3,9,V.fig);disc(c,b[0],b[1]-27,4,V.fig);disc(c,b[0]-1,b[1]-28,2,shade(V.fig,1.25));rect(c,b[0]+8,b[1]-28,2,3,R.yellow[3]);rect(c,b[0]-3,b[1]-8,7,1,shade(V.fig,.7))}
function signpost(c,P,V){const x=P(.5,.5,0)[0],y=P(.5,.5,0)[1];shad(c,x,y,8);rect(c,x-2,y-40,4,40,R.wood[2]);rect(c,x-2,y-40,1,40,R.wood[4]);rect(c,x-4,y-2,9,2,R.wood[1]);
  [[-34,1,V.a],[-26,-1,V.b],[-18,1,V.c]].forEach(([yy,dir,col],i)=>{const w=18;const x0=dir>0?x+2:x-2-w;rect(c,x0,y+yy,w,7,col);rect(c,x0,y+yy,w,1,shade(col,1.3));rect(c,x0,y+yy+6,w,1,shade(col,.65));poly(c,[[dir>0?x0+w:x0,y+yy],[dir>0?x0+w+5:x0-5,y+yy+3.5],[dir>0?x0+w:x0,y+yy+7]],col);for(let k=0;k<3;k++)rect(c,x0+3+k*4,y+yy+3,2,1,'#FFFFFF')});disc(c,x,y-42,3,V.gold)}
function kiosk(c,P,V){const x=P(.5,.5,0)[0],y=P(.5,.5,0)[1];shad(c,x,y,26);const b={};
  box(c,P,.1,.15,0,.8,.7,.62,V.wall);const a=P(.1,.85,0);// Theke-Oeffnung
  poly(c,[P(.2,.85,.14),P(.8,.85,.14),P(.8,.85,.5),P(.2,.85,.5)],R.base[1]);poly(c,[P(.22,.85,.14),P(.78,.85,.14),P(.78,.85,.2),P(.22,.85,.2)],V.counter);
  // Markise
  const m=[P(.04,.85,.62),P(.96,.85,.62),P(.96,1.05,.42),P(.04,1.05,.42)];poly(c,m,V.awn[0]);for(let k=0;k<6;k++){const u0=.04+.153*k,u1=u0+.153;poly(c,[P(u0,.85,.62),P(u1,.85,.62),P(u1,1.05,.42),P(u0,1.05,.42)],k%2?V.awn[1]:V.awn[0])}
  for(let k=0;k<6;k++){const e=P(.04+.153*k+.076,1.05,.42);ell(c,e[0],e[1]+1,5,2.5,k%2?V.awn[1]:V.awn[0],0,3.14)}
  // Dach + Eiswaffel
  const r=[P(.04,.1,.62),P(.96,.1,.62),P(.96,.9,.62),P(.04,.9,.62)],ap=P(.5,.5,1.0);poly(c,[r[3],r[2],ap],V.roof[2],V.roof[0]);poly(c,[r[2],r[1],ap],V.roof[1],V.roof[0]);for(let k=1;k<5;k++){const s=k/5;pl(c,r[3][0]+(ap[0]-r[3][0])*s,r[3][1]+(ap[1]-r[3][1])*s,r[2][0]+(ap[0]-r[2][0])*s,r[2][1]+(ap[1]-r[2][1])*s,V.roof[1],1)}
  poly(c,[[ap[0]-5,ap[1]-4],[ap[0]+5,ap[1]-4],[ap[0],ap[1]+9]],R.orange[3]);disc(c,ap[0],ap[1]-7,5,V.scoop[0]);disc(c,ap[0]-1,ap[1]-12,4,V.scoop[1]);rect(c,ap[0]-3,ap[1]-12,2,2,'#FFFFFF');disc(c,ap[0],ap[1]-16,2,R.red[3])}
function hedge(c,P,V){const x=P(.5,.5,0)[0],y=P(.5,.5,0)[1];shad(c,x,y,24);const g=V.g;box(c,P,.06,.06,0,.88,.88,.5,g[1]);
  for(let k=0;k<70;k++){const u=hsh(2,k,1),v=hsh(2,k,2),w=hsh(2,k,3),p=P(.06+u*.88,.06+v*.88,.5);rect(c,p[0],p[1],2,1,w>.6?g[3]:w>.3?g[0]:g[4])}
  [[.1,.1],[.9,.1],[.1,.9],[.9,.9]].forEach(q=>{const p=P(q[0]-.0,q[1],.5);disc(c,p[0],p[1]-3,5,g[0]);disc(c,p[0],p[1]-3,4,g[1]);disc(c,p[0]-1,p[1]-5,3,g[3])});
  if(V.flow)for(let k=0;k<16;k++){const u=hsh(5,k,1),v=hsh(5,k,2),p=P(.1+u*.8,.1+v*.8,.5);rect(c,p[0],p[1]-1,2,2,V.flow[k%V.flow.length])}}
function picnic(c,P,V){const x=P(.5,.5,0)[0],y=P(.5,.5,0)[1];shad(c,x,y,24);box(c,P,.14,.1,0,.72,.14,.2,V.wood);box(c,P,.14,.76,0,.72,.14,.2,V.wood);box(c,P,.2,.28,.26,.6,.44,.06,V.top);for(let k=1;k<4;k++){const a=P(.2,.28+k*.11,.32),d=P(.8,.28+k*.11,.32);pl(c,a[0],a[1],d[0],d[1],shade(V.top,.7),1)}
  [[.3],[.7]].forEach(q=>{const a=P(q[0],.4,.0),t=P(q[0],.4,.26);pl(c,a[0],a[1],t[0],t[1],V.wood,2);const a2=P(q[0],.6,.0),t2=P(q[0],.6,.26);pl(c,a2[0],a2[1],t2[0],t2[1],V.wood,2)});const cup=P(.5,.5,.32);rect(c,cup[0]-2,cup[1]-6,4,5,R.cream[4]);rect(c,cup[0]-1,cup[1]-9,2,3,R.red[3])}
function bin(c,P,V){const x=P(.5,.5,0)[0],y=P(.5,.5,0)[1];shad(c,x,y,9);cyl(c,x,y,7,13,V.body);ell(c,x,y-13,7,3.5,shade(V.body,.55));rect(c,x-6,y-9,13,1,V.band);rect(c,x-6,y-4,13,1,V.band);cyl(c,x,y-13,8,3,V.lid);rect(c,x-1,y-19,3,2,V.gold)}
const D=[
 ['Brunnen – warmer Stein',(c,P)=>fountain(c,P,{stone:R.sandst[3]})],['Brunnen – grauer Marmor',(c,P)=>fountain(c,P,{stone:R.stone[4]})],
 ['Pavillon – weiß/grün',(c,P)=>gazebo(c,P,{base:R.cream[2],wall:R.cream[4],roof:R.green,trim:R.cream[3]})],['Pavillon – blau/gold',(c,P)=>gazebo(c,P,{base:R.sandst[3],wall:R.cream[3],roof:R.slate,trim:R.yellow[3]})],
 ['Blumenbeet – bunt',(c,P)=>bed(c,P,{c:[R.red[3],R.yellow[3],R.purple[2],R.pink[1]]})],['Blumenbeet – Rosa/Weiß',(c,P)=>bed(c,P,{c:[R.pink[1],'#FFFFFF',R.magenta[2],R.pink[2]]})],['Blumenbeet – Sonne',(c,P)=>bed(c,P,{c:[R.orange[3],R.yellow[3],R.red[3],R.orange[4]]})],
 ['Formschnitt – Kugel',(c,P)=>topiary(c,P,'ball')],['Formschnitt – Kegel',(c,P)=>topiary(c,P,'cone')],['Formschnitt – Spirale',(c,P)=>topiary(c,P,'spiral')],
 ['Laterne – Gusseisen',(c,P)=>lamp(c,P,{base:R.stone[3],iron:R.green[0],gold:R.yellow[3],glass:R.yellow[3]})],['Laterne – Schwarz/Gold',(c,P)=>lamp(c,P,{base:R.sandst[2],iron:R.base[1],gold:R.yellow[3],glass:R.yellow[4]})],
 ['Bank – Grün',(c,P)=>bench(c,P,{iron:R.green[0],wood:R.wood[3],gold:R.yellow[3]})],['Bank – Weiß',(c,P)=>bench(c,P,{iron:R.cream[4],wood:R.cream[3],gold:R.blue[2]})],
 ['Statue – Stein',(c,P)=>statue(c,P,{ped:R.stone[3],ped2:R.stone[4],fig:R.stone[5]})],['Statue – Bronze',(c,P)=>statue(c,P,{ped:R.sandst[2],ped2:R.sandst[3],fig:R.green[2]})],
 ['Wegweiser',(c,P)=>signpost(c,P,{a:R.blue[2],b:R.green[2],c:R.orange[2],gold:R.yellow[3]})],
 ['Eiskiosk – Minze',(c,P)=>kiosk(c,P,{wall:R.cream[3],counter:R.wood[3],awn:[R.mint[2],R.cream[4]],roof:R.mint,scoop:[R.pink[1],R.cream[4]]})],['Eiskiosk – Rosa',(c,P)=>kiosk(c,P,{wall:R.cream[4],counter:R.wood[3],awn:[R.pink[1],R.cream[4]],roof:R.blue,scoop:[R.mint[2],R.yellow[4]]})],
 ['Hecke',(c,P)=>hedge(c,P,{g:R.grass})],['Blütenhecke',(c,P)=>hedge(c,P,{g:R.grass,flow:[R.pink[1],'#FFFFFF',R.magenta[2]]})],
 ['Picknicktisch',(c,P)=>picnic(c,P,{wood:R.wood[2],top:R.wood[4]})],['Papierkorb – Fass',(c,P)=>bin(c,P,{body:R.wood[3],band:R.stone[1],lid:R.wood[1],gold:R.stone[3]})],['Papierkorb – Gusseisen',(c,P)=>bin(c,P,{body:R.green[1],band:R.yellow[3],lid:R.green[0],gold:R.yellow[3]})]];
function cell(fn,w,h){w=w||130;h=h||120;const cv=mk(w,h),c=cv.getContext('2d'),P=proj(w/2-0,h-58);const Q=(x,y,z)=>[Math.round(w/2+(x-y)*32),Math.round(h-58+(x+y)*16-(z||0)*16)];
  grassTile(c,Q,0,0);fn(c,Q);quantize(c,w,h);return cv}
module.exports={D,cell};
