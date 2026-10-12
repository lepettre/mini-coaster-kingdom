const L=require('./lib.js');const {R,hsh,pl,rect,disc,ell,poly,shade,mk,proj,grassTile,quantize}=L;
function shadow(c,x,y,w,ry){c.fillStyle='rgba(30,60,20,.27)';c.beginPath();c.ellipse(x+5,y+1,w,ry||w*.4,0,0,7);c.fill()}
function rnd(s,a,b){return hsh(s,a,b)}
// Blattbueschel-Krone: viele kleine, unregelmaessige Haufen, nach Licht von oben links schattiert
function crown(c,cx,cy,ells,ramps,seed,o){o=o||{};const dens=o.dens||1,cl=[];
  ells.forEach((e,ei)=>{const n=Math.round(e[2]*e[3]*.22*dens);for(let k=0;k<n;k++){const a=rnd(seed,ei*977+k,1)*6.283,d=Math.sqrt(rnd(seed,ei*977+k,2));const wob=1+.22*Math.sin(a*3+ei*2+seed)+.12*Math.sin(a*7+ei);const x=cx+e[0]+Math.cos(a)*d*e[2]*wob,y=cy+e[1]+Math.sin(a)*d*e[3]*wob;cl.push([x,y,d,e,ei,k])}});
  // Grundmasse (dunkel), damit keine Luecken entstehen
  ells.forEach((e,ei)=>{c.fillStyle=ramps[0][0];c.beginPath();for(let q=0;q<=24;q++){const a=q/24*6.283,w=1+.2*Math.sin(a*3+ei*2+seed)+.1*Math.sin(a*7+ei);const px=cx+e[0]+Math.cos(a)*e[2]*.86*w,py=cy+e[1]+Math.sin(a)*e[3]*.86*w;q?c.lineTo(px,py):c.moveTo(px,py)}c.fill()});
  cl.sort((a,b)=>a[1]-b[1]);
  cl.forEach(p=>{const[x,y,d,e,ei,k]=p;const u=(x-cx)/ (o.R||22),v=(y-cy)/(o.R||22);let l=-(0.5*u+0.9*(v+.3))*(.9)+(rnd(seed,k+ei*31,5)-.5)*.7;
    const rp=ramps[Math.floor(rnd(seed,k+ei*13,6)*ramps.length)%ramps.length];const idx=l<-.45?1:l<.05?2:l<.5?3:4;const col=rp[Math.min(idx,rp.length-1)],dk=rp[Math.max(0,idx-2)];
    const r=(1.6+rnd(seed,k+ei*7,7)*2.8)*(1-d*.15);
    c.fillStyle=dk;c.beginPath();c.arc(x+.5,y+1,r+.7,0,7);c.fill();c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,7);c.fill();
    if(idx>=3&&rnd(seed,k,8)>.4){rect(c,x-r*.5,y-r*.6,2,1,rp[Math.min(idx+1,rp.length-1)])}});
  // zerzauste Kante: kleine Blattspitzen nach aussen
  for(let q=0;q<(o.tufts||26);q++){const e=ells[q%ells.length],a=rnd(seed,q,40)*6.283,w=1+.2*Math.sin(a*3+(q%ells.length)*2+seed);const x=cx+e[0]+Math.cos(a)*e[2]*w*1.0,y=cy+e[1]+Math.sin(a)*e[3]*w*1.0;if(Math.sin(a)>.5)continue;const rp=ramps[q%ramps.length];rect(c,x,y,2,2,rp[1+(rnd(seed,q,41)>.5?1:0)]);rect(c,x+Math.cos(a)*2,y+Math.sin(a)*2,1,1,rp[2])}}
function stem(c,x,y,h,w,lean,seed,col){col=col||R.wood;let px=x;for(let k=0;k<h;k++){const t=k/h,wob=Math.sin(k*.35+seed)*.6,xx=Math.round(x+lean*t*t*h*.25+wob),ww=Math.max(2,Math.round(w*(1-t*.35)+(k<4?3-k*.7:0)));rect(c,xx-ww/2,y-k,ww,1,col[1]);rect(c,xx-ww/2,y-k,Math.max(1,Math.round(ww*.35)),1,col[3]);if(k%5===2)rect(c,xx+ww/2-1,y-k,1,1,col[0]);px=xx}return px}
function branch(c,x0,y0,x1,y1,w,col){pl(c,x0,y0,x1,y1,col[1],w);pl(c,x0-1,y0-1,x1-1,y1-1,col[3],1)}
const G=[R.grass,R.grass,R.grass],GL=[R.grass,R.lime.length?[R.grass[0],R.grass[1],R.grass[3],R.grass[4],R.grass[5]]:R.grass];
function oak(c,x,y,ramps,seed){shadow(c,x,y,22);const tx=stem(c,x,y,22,7,-.5,seed);branch(c,tx,y-16,tx-11,y-30,2,R.wood);branch(c,tx,y-18,tx+10,y-31,2,R.wood);branch(c,tx,y-22,tx+2,y-38,2,R.wood);
  crown(c,x,y,[[0,-38,20,14],[-14,-30,13,10],[14,-31,13,10],[3,-48,13,9],[-8,-42,11,8],[10,-40,11,8]],ramps,seed,{R:24,tufts:30})}
function linde(c,x,y,ramps,seed){shadow(c,x,y,18);const tx=stem(c,x,y,24,5,.3,seed);crown(c,x,y,[[0,-40,15,17],[-6,-33,12,10],[8,-36,11,11],[-2,-47,10,8]],ramps,seed,{R:20,tufts:22})}
function birke(c,x,y,ramps,seed){shadow(c,x,y,13);for(let k=0;k<30;k++){const xx=x+Math.round(Math.sin(k*.2+seed)*1.2);rect(c,xx-2,y-k,4,1,'#E8E8E0');rect(c,xx+1,y-k,1,1,'#B9C2CC');if(k%6===3)rect(c,xx-2,y-k,3,1,R.base[3])}branch(c,x,y-22,x-8,y-32,1,[0,'#D8DCE0',0,'#E8E8E0']);branch(c,x,y-26,x+7,y-35,1,[0,'#D8DCE0',0,'#E8E8E0']);
  crown(c,x,y,[[0,-40,12,13],[-6,-34,8,8],[6,-34,8,8],[0,-48,7,7]],ramps,seed,{R:16,tufts:20,dens:.9})}
function pappel(c,x,y,ramps,seed){shadow(c,x,y,10);stem(c,x,y,12,4,0,seed);crown(c,x,y,[[0,-34,8,24],[-2,-24,7,14],[2,-44,6,12]],ramps,seed,{R:26,tufts:22})}
function weide(c,x,y,ramps,seed){shadow(c,x,y,20);const tx=stem(c,x,y,24,7,-.4,seed);branch(c,tx,y-20,tx-10,y-32,2,R.wood);branch(c,tx,y-20,tx+10,y-32,2,R.wood);
  crown(c,x,y,[[0,-38,18,10],[-12,-33,10,7],[12,-33,10,7]],ramps,seed,{R:22,tufts:14});
  for(let k=-20;k<=20;k+=2){const a=Math.abs(k),top=y-(a>14?26:a>8?30:35),len=9+Math.floor(rnd(seed,k,4)*18),rp=ramps[(k+40)%ramps.length];for(let j=0;j<len;j++){const sway=Math.round(Math.sin(j*.35+k*.7)*1.3+Math.sin(j*.13+k)*1.1);const t=j/len;rect(c,x+k+sway,top+j,1,1,t>.8?rp[4>rp.length-1?rp.length-1:4]:(j%3?rp[2]:rp[1]));if(j%4===1&&rnd(seed,k,j)>.5)rect(c,x+k+sway+1,top+j,1,1,rp[3])}}}
function apfel(c,x,y,ramps,seed){shadow(c,x,y,18);const tx=stem(c,x,y,15,6,.4,seed);branch(c,tx,y-12,tx-8,y-22,2,R.wood);branch(c,tx,y-12,tx+8,y-22,2,R.wood);
  crown(c,x,y,[[0,-28,15,11],[-10,-22,9,7],[10,-22,9,7]],ramps,seed,{R:18,tufts:16});for(let k=0;k<9;k++){const a=rnd(seed,k,8)*6.283,d=4+rnd(seed,k,9)*11;const ax=x+Math.cos(a)*d,ay=y-27+Math.sin(a)*d*.65;rect(c,ax,ay,3,3,R.red[1]);rect(c,ax,ay,1,1,R.red[3]);rect(c,ax+1,ay+3,1,1,R.red[0])}}
function kirsche(c,x,y,seed){shadow(c,x,y,22);const tx=stem(c,x,y,19,6,-.6,seed,[R.wood[0],R.wood[0],R.wood[1],R.wood[2]]);branch(c,tx,y-14,tx-12,y-27,2,R.wood);branch(c,tx,y-16,tx+11,y-28,2,R.wood);
  crown(c,x,y,[[0,-36,18,12],[-13,-29,12,9],[13,-30,12,9],[2,-45,12,8]],[BL1,BL2],seed,{R:22,tufts:30});
  for(let k=0;k<22;k++){rect(c,x-24+rnd(seed,k,11)*48,y-4+rnd(seed,k,12)*7,2,1,R.blossom[rnd(seed,k,13)>.5?2:3])}for(let k=0;k<8;k++){rect(c,x-10+rnd(seed,k,14)*20,y-26-rnd(seed,k,15)*22,1,2,R.blossom[3])}}
// ---- Nadelbaeume: Etagen aus haengenden Aesten ----
function needleBranch(c,x0,y0,dx,dy,col,snow,seed,k,front){const n=Math.max(4,Math.round(Math.abs(dx)/1.6)),pts=[];for(let i=0;i<=n;i++){const t=i/n;pts.push([x0+dx*t,y0+dy*Math.pow(t,1.5)+Math.sin(t*4+seed+k)*.7])}
  for(let i=0;i<n;i++){const a=pts[i],b=pts[i+1];pl(c,a[0],a[1],b[0],b[1],col[front?2:1],2);pl(c,a[0],a[1]-1,b[0],b[1]-1,col[front?3:2],1);pl(c,a[0],a[1]+2,b[0],b[1]+2,col[0],1)}
  for(let i=1;i<=n;i++){const p=pts[i],t=i/n,len=1+Math.round(t*2.2*(.6+rnd(seed,k*17+i,1)));pl(c,p[0],p[1]+2,p[0]+(dx>0?1:-1),p[1]+2+len,col[front?1:0],1);if(rnd(seed,k*5+i,2)>.5)pl(c,p[0]+(dx>0?-1:1),p[1]+2,p[0]+(dx>0?-1:1),p[1]+1+len,col[2],1)}
  if(snow){for(let i=0;i<=n;i++){const p=pts[i];rect(c,p[0],p[1]-2,2,1,R.snow[4]);if(i%2===0)rect(c,p[0]-1,p[1]-1,3,1,R.snow[3])}}}
function conifer(c,x,y,K,w0,sp,seed,snow,nbk){stem(c,x,y,12,5,.2,seed);
  for(let k=0;k<K;k++){const yy=y-11-k*sp,w=w0*Math.pow(1-k/(K+.4),.82)+2.5,nb=Math.round(w*nbk)+4;
    // dichte Innenmasse
    c.fillStyle=R.pine[1];c.beginPath();c.moveTo(x,yy-sp*.9);c.lineTo(x+w*.62,yy+4);c.lineTo(x+w*.2,yy+6);c.lineTo(x-w*.25,yy+5);c.lineTo(x-w*.62,yy+4);c.closePath();c.fill();
    const list=[];for(let b=0;b<nb;b++){const side=b%2?1:-1,len=w*(.5+.5*rnd(seed,k*31+b,1)),front=rnd(seed,k*31+b,2)>.45;list.push([side,len,front,rnd(seed,k*31+b,3)*3-1])}
    list.sort((a,b)=>(a[2]?1:0)-(b[2]?1:0)).forEach((br,i)=>needleBranch(c,x,yy+br[3],br[0]*br[1],2.5+br[1]*.2+rnd(seed,k*7+i,5)*2.5,R.pine,snow,seed+k,i,br[2]));}
  const top=y-11-(K-1)*sp;for(let q=0;q<6;q++){rect(c,x-(q<2?0:1),top-8+q*2,q<2?1:3,2,R.pine[q%2?2:1])}rect(c,x,top-10,1,3,R.pine[3]);if(snow)rect(c,x-1,top-11,3,2,R.snow[4])}
function tanne(c,x,y,snow,seed){shadow(c,x,y,17);conifer(c,x,y,7,19,8,seed,snow,1.3)}
function fichte(c,x,y,seed){shadow(c,x,y,11);conifer(c,x,y,10,11,5.6,seed,false,1.0)}
function kiefer(c,x,y,seed){shadow(c,x,y,16);let px=x;for(let k=0;k<38;k++){const sw=Math.round(Math.sin(k*.17+seed)*3+k*.02*k*.1),xx=x+sw;rect(c,xx-2,y-k,4,1,R.orange[1]);rect(c,xx-2,y-k,1,1,R.orange[3]);if(k%4===2)rect(c,xx+1,y-k,1,1,R.orange[0]);px=xx}
  branch(c,px,y-26,px+14,y-36,2,[0,R.orange[1],0,R.orange[3]]);branch(c,px,y-31,px-12,y-40,2,[0,R.orange[1],0,R.orange[3]]);branch(c,px,y-36,px+2,y-46,2,[0,R.orange[1],0,R.orange[3]]);
  const pads=[[-14,-42,11,4],[13,-38,11,4],[2,-50,12,5],[-4,-36,8,3]];pads.forEach((p,i)=>{crown(c,x+p[0],y+p[1],[[0,0,p[2],p[3]]],[R.pine.concat([R.pine[3]]).map(v=>v)],seed+i,{R:p[2],tufts:10,dens:1.4});for(let q=0;q<8;q++){const a=rnd(seed,i*9+q,2)*6.283;pl(c,x+p[0]+Math.cos(a)*p[2]*.8,y+p[1]+Math.sin(a)*p[3]*.8,x+p[0]+Math.cos(a)*p[2]*1.0,y+p[1]+Math.sin(a)*p[3]*1.0+2,R.pine[1],1)}})}
function zypresse(c,x,y,seed){shadow(c,x,y,9);rect(c,x-1,y-5,3,5,R.wood[1]);crown(c,x,y,[[0,-24,6,20],[-1,-14,6,12],[1,-34,5,13]],[R.pine],seed,{R:22,tufts:14,dens:1.2})}
const DG1=['#17381A','#1F4A1A','#2B5E22','#37702A','#478338'],DG2=['#1A3F1C','#24521E','#31672A','#3C7630','#478338'],MG1=['#1F3F2A','#2A5236','#356043','#3F6E4D','#4A7A57'],MG2=['#183626','#24472F','#356043','#3F6E4D','#4A7A57'];
const dk=(a,f)=>a.map(x=>shade(x,f)),BL1=dk(R.blossom.concat(['#FFFFFF']),.95),BL2=dk(R.blossom.concat(['#FFF0F5']),.95);
const A1=dk(R.autumn,.68),Y1=dk([R.yellow[0],R.yellow[1],R.yellow[2],R.yellow[3],R.yellow[4]],.68),RE=dk([R.red[0],R.red[1],R.red[2],R.red[3],R.red[4]],.68);
const T=[['Eiche – Sommer',c=>oak(c,60,86,[DG1,DG2],21)],['Eiche – Herbst',c=>oak(c,60,86,[A1,Y1,RE,[R.orange[0],R.orange[1],R.orange[2],R.orange[3],R.orange[4]]],22)],
 ['Kirschblüte',c=>kirsche(c,60,86,23)],['Apfelbaum',c=>apfel(c,60,86,[DG1,DG2],24)],['Linde',c=>linde(c,60,86,[DG1,DG2],25)],['Birke',c=>birke(c,60,86,[DG2,[DG1[1],DG1[2],DG2[2],DG2[3],DG2[4]]],26)],['Pappel',c=>pappel(c,60,86,[DG1,DG2],27)],['Trauerweide',c=>weide(c,60,86,[MG1,MG2],28)],
 ['Tanne',c=>tanne(c,60,86,false,29)],['Schneetanne',c=>tanne(c,60,86,true,30)],['Fichte, schlank',c=>fichte(c,60,86,31)],['Kiefer',c=>kiefer(c,60,86,32)],['Zypresse',c=>zypresse(c,60,86,33)]];
function cell(fn,w,h){const cv=mk(w||120,h||110),c=cv.getContext('2d'),P=proj((w||120)/2,(h||110)-52);grassTile(c,P,0,0);fn(c);quantize(c,w||120,h||110);return cv}
module.exports={T,cell};
