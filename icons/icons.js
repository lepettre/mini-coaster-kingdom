const {createCanvas}=require('@napi-rs/canvas');const fs=require('fs');
const N=60;
function mk(){const cv=createCanvas(N,N),c=cv.getContext('2d');c.imageSmoothingEnabled=false;
 const px=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h)};
 const disc=(cx,cy,r,col)=>{for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r)px(cx+x,cy+y,1,1,col)};
 const bands=(cols,h0,bh)=>{cols.forEach((col,k)=>{px(0,h0+k*bh,N,bh+1,col);if(k)for(let x=0;x<N;x++)for(let y=h0+k*bh-2;y<h0+k*bh+2;y++)if((x+y)%2===0)px(x,y,1,1,cols[k-1])})};
 return{cv,c,px,disc,bands}}
// Looping-Kurve
const A=.35;let raw=[[0,0]];{let phi=0,x=0,z=0;const NN=400,gs=[];let tot=0;for(let k=0;k<NN;k++){const s=(k+.5)/NN,v=A+(1-A)*(1-Math.cos(2*Math.PI*s))/2;gs.push(v);tot+=v}for(let k=0;k<NN;k++){const dp=gs[k]/tot*2*Math.PI,pm=phi+dp/2;x+=Math.cos(pm)/NN;z+=Math.sin(pm)/NN;phi+=dp;raw.push([x,z])}}
const XT=raw[raw.length-1][0],ZM=Math.max(...raw.map(r=>r[1]));
function loopPts(cx,baseY,h,lead){const sc=h/ZM,ox=cx-XT*sc/2,pts=[];for(let i=-lead;i<0;i++)pts.push([ox+i*(sc*XT/lead),baseY,0]);raw.forEach((r,i)=>pts.push([ox+r[0]*sc,baseY-r[1]*sc,i/raw.length]));for(let i=1;i<=lead;i++)pts.push([ox+XT*sc+i*(sc*XT/lead),baseY,1]);return pts}
function track(o,pts,cols,w){const[d,m,l,hi,sh]=cols;pts.forEach(p=>o.px(p[0],p[1]+2,w,w,sh));pts.forEach(p=>o.px(p[0],p[1]+1,w,w,d));pts.forEach(p=>o.px(p[0],p[1],w,w,m));pts.forEach(p=>o.px(p[0],p[1]-1,w-1,w-1,l));pts.forEach(p=>o.px(p[0]+0,p[1]-1,1,1,hi))}
function crown(o,x,y){const G='#F2C12E',D='#7A5A00',L='#FFE27A';o.px(x,y+3,11,1,D);o.px(x,y+4,11,3,G);o.px(x,y+7,11,1,D);o.px(x+1,y+4,9,1,L);[[0,0],[5,-1],[10,0]].forEach(p=>{o.px(x+p[0],y+p[1],1,3,G);o.px(x+p[0],y+p[1]-1,1,1,L)});o.px(x+1,y+1,1,2,G);o.px(x+3,y+1,1,2,G);o.px(x+7,y+1,1,2,G);o.px(x+9,y+1,1,2,G);o.px(x+5,y+5,1,1,'#D83A3A');o.px(x+2,y+5,1,1,'#3A6FD8');o.px(x+8,y+5,1,1,'#3A6FD8')}
function car(o,x,y){o.px(x-4,y-1,9,4,'#1B4A9A');o.px(x-4,y+3,9,1,'#0F2A5E');o.px(x-3,y+4,2,2,'#F0C49A');o.px(x+1,y+4,2,2,'#FF8FA3')}
function castle(o,x,y,wall,dark,roof1,roof2){ // x,y = linke untere Ecke
 o.px(x+4,y-14,16,14,wall);o.px(x+4,y-14,16,1,dark);for(let i=0;i<4;i++)o.px(x+4+i*5,y-16,3,2,wall);o.px(x+10,y-7,4,7,dark);o.px(x+11,y-8,2,1,dark);
 [[x,y-20,roof1],[x+17,y-20,roof2]].forEach(t=>{o.px(t[0],t[1]+6,6,14,wall);o.px(t[0],t[1]+6,1,14,dark);o.px(t[0]+5,t[1]+6,1,14,dark);for(let k=0;k<5;k++)o.px(t[0]-1+k*0+0,t[1]+5-k,8,1,t[2]);o.px(t[0]+2,t[1]+11,2,3,dark);o.px(t[0]+2,t[1]-2,1,3,'#5A5F6B');o.px(t[0]+3,t[1]-2,3,2,'#F2C12E')})}
function loopFull(cx,baseY,h){const sc=h/ZM,ox=cx-XT*sc/2,pts=[];for(let x=0;x<ox;x++)pts.push([x,baseY,0]);raw.forEach((r,i)=>pts.push([ox+r[0]*sc,baseY-r[1]*sc,i/raw.length]));for(let x=Math.ceil(ox+XT*sc);x<N;x++)pts.push([x,baseY,1]);return pts}
const icons={};
// A: Burg + Looping
{const o=mk();o.bands(['#5BA4E6','#6FB5EE','#8CC6F4','#A9D6F8','#C8E6FB'],0,8);o.disc(10,9,7,'#FFE9A0');o.disc(10,9,5,'#FFF5CC');
 for(let x=0;x<N;x++){const y=Math.round(43+2*Math.sin(x*.2)+Math.sin(x*.5));o.px(x,y,1,N-y,'#5FB23E');o.px(x,y,1,2,'#7BC853')}
 castle(o,6,44,'#C8CFDB','#8E97A8','#C22A22','#2E4FA8');
 const pts=loopPts(40,50,25,10);track(o,pts,['#5A0E0E','#8E1B16','#C22A22','#E04A3C','#F27A66'].map((c,i)=>c).slice(0,5),3);
 const top=pts.reduce((a,b)=>b[1]<a[1]?b:a);car(o,top[0],top[1]-2);icons.A=o.cv}
// B: Krone auf dem Looping, dunkel
{const o=mk();for(let y=0;y<N;y++){const t=y/N;o.px(0,y,N,1,t<.5?'#0F1B38':'#1B2D57')}
 for(let k=0;k<14;k++){const sx=(k*37+11)%N,sy=(k*23+5)%28;o.px(sx,sy,1,1,k%3?'#FFFFFF':'#F2C12E')}
 for(let x=0;x<N;x++){const y=Math.round(50+Math.sin(x*.25)*1.5);o.px(x,y,1,N-y,'#2E7A2A');o.px(x,y,1,1,'#5FB23E')}
 const pts=loopPts(30,50,30,14);track(o,pts,['#5A0E0E','#8E1B16','#C22A22','#E04A3C','#F27A66'],3);
 const top=pts.reduce((a,b)=>b[1]<a[1]?b:a);crown(o,top[0]-5,top[1]-10);icons.B=o.cv}
// C: Abendstimmung, Burg-Silhouette, durchgehende Strecke, ohne Wagen
{const o=mk();o.bands(['#3B2C6B','#7A3E8E','#C65A7E','#F08A5D','#FFC27A'],0,9);o.disc(50,15,7,'#FFE1A0');o.disc(50,15,5,'#FFF0C8');
 for(let x=0;x<N;x++){const y=Math.round(46+2*Math.sin(x*.16+1));o.px(x,y,1,N-y,'#1E3A2C');o.px(x,y,1,1,'#2F5A3F')}
 castle(o,4,46,'#2A2146','#1B1530','#2A2146','#2A2146');
 const pts=loopFull(38,52,24);
 for(const sx of [6,14,23,52,57]){for(let y=53;y<60;y++)o.px(sx,y,1,1,'#120E24')}
 track(o,pts,['#2B0A0A','#7A1712','#C22A22','#E04A3C','#F27A66'],3);icons.C=o.cv}
// D: Wappen: goldener Rahmen, Looping mit Krone, Wagen unten
{const o=mk();o.px(0,0,N,N,'#0B1424');o.px(2,2,N-4,N-4,'#F2C12E');o.px(3,3,N-6,N-6,'#13244A');
 for(let y=4;y<N-4;y++)for(let x=4;x<N-4;x++)if((x+y)%6===0)o.px(x,y,1,1,'#1B3366');
 const pts=loopPts(30,46,28,10);track(o,pts,['#4A0E0E','#9B2A1B','#E04A3C','#FF8A70','#FFC2B0'],3);
 const top=pts.reduce((a,b)=>b[1]<a[1]?b:a);crown(o,top[0]-5,top[1]-10);car(o,12,45);o.px(11,46,1,1,'#1B4A9A');icons.D=o.cv}
const sizes=[180,120,60],W=30+sizes.reduce((x,y)=>x+y+24,0),H=250;const out=createCanvas(W,H),q=out.getContext('2d');q.imageSmoothingEnabled=false;q.fillStyle='#CFE6F7';q.fillRect(0,0,W,H);
let x=24;sizes.forEach(S=>{const y=20,r=Math.round(S*.22);q.save();q.beginPath();q.moveTo(x+r,y);q.arcTo(x+S,y,x+S,y+S,r);q.arcTo(x+S,y+S,x,y+S,r);q.arcTo(x,y+S,x,y,r);q.arcTo(x,y,x+S,y,r);q.closePath();q.clip();q.drawImage(icons.C,x,y,S,S);q.restore();q.fillStyle='#10213A';q.font='bold 15px sans-serif';q.fillText(S+' px',x,y+S+22);x+=S+24});
fs.writeFileSync('icon_C_final.png',out.toBuffer('image/png'));
for(const n of [180,512]){const o=createCanvas(n,n),q2=o.getContext('2d');q2.imageSmoothingEnabled=false;q2.drawImage(icons.C,0,0,n,n);fs.writeFileSync('iconC_'+n+'.png',o.toBuffer('image/png'))}
console.log('ok');
