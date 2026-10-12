const {createCanvas}=require('@napi-rs/canvas');
const R={
 sky:['#5BA4E6','#6FB5EE','#8CC6F4','#A9D6F8','#C8E6FB','#E4F3FD'],
 grass:['#2C6B1E','#3B8528','#4C9C32','#5FB23E','#7BC853','#9BDC6E'],
 sand:['#B88A4A','#CFA05A','#E0B66F','#EDCB8A','#F5DDA6'],
 snow:['#9DB4CF','#BFD2E6','#DCE8F3','#F0F6FB','#FFFFFF'],
 stone:['#3C3F48','#5A5F6B','#7C8290','#A0A6B2','#C4C9D2','#E3E6EB'],
 wood:['#3E2616','#5C3A20','#7E5230','#A06B3D','#C08A55'],
 red:['#5A0E0E','#8E1B16','#C22A22','#E04A3C','#F27A66'],
 blue:['#0F2A5E','#1B4A9A','#2F6FD6','#5B95EA','#93BDF5'],
 green:['#0F4A2A','#1B7440','#2E9E5B','#5CC283','#96DDAE'],
 orange:['#7A3A08','#B5560F','#E07A1F','#F5A04A','#FFC585'],
 yellow:['#8A6A00','#C99A1E','#F2C12E','#FFD84F','#FFEC9A'],
 pine:['#10331F','#1A4D2E','#256B3C','#378A4D','#5BAA66'],
 water:['#1F5FA8','#2F7BC8','#4A97DD','#7DBBEE','#B5DBF7'],
 skin:['#C98E64','#E0AA80','#F0C49A','#FADBB8'],
 pink:['#C25A78','#FF8FA3','#FFC1CF'],purple:['#5B3392','#8B5CC4','#B58CF0'],cyan:['#2F8FB5','#4CC3F0','#9BE0FA'],lime:['#6E9A20','#9BCB3C','#C5E67A'],
 base:['#0B0F18','#1B2030','#FFFFFF','#2B2B2B'],
 // neu fuer Themenpark
 sandst:['#8F7C58','#AD9A74','#C9B78F','#E0D2AD','#F2E8CC'],
 slate:['#1B2B58','#2A4180','#3A58A8','#5C7DC9','#8EABE8'],
 teal:['#0F4A4A','#1B6F6F','#2E9C98','#5CC4BE','#9BE0DA'],
 terra:['#6E2810','#A0401C','#D2602A','#EA854E','#F6B184'],
 cream:['#C8B58C','#E0CFA6','#F0E4C8','#F8F0DC','#FFFBF0'],
 peach:['#C28660','#E0A27C','#F0BC98','#F8D6BA'],
 magenta:['#701C58','#A82A82','#D84CAA','#F288CE'],
 autumn:['#7E2A0C','#BC4A18','#E67E1E','#F4B038','#FFD66A'],
 blossom:['#B8506E','#E47E9E','#FFA8C4','#FFD0E0'],
 mint:['#2C6B5A','#3E8F78','#5CB598','#8ED8BC'],
 plum:['#3E1F4E','#5E3278','#8A58A8']
};
const PAL=[].concat(...Object.values(R));
const PRGB=PAL.map(h=>{const n=parseInt(h.slice(1),16);return[n>>16,(n>>8)&255,n&255]});
let LUT=null;
function lut(){if(LUT)return LUT;LUT=new Uint8Array(32768);for(let k=0;k<32768;k++){const r=((k>>10)&31)*8+4,g=((k>>5)&31)*8+4,b=(k&31)*8+4;let best=0,bd=1e9;for(let p=0;p<PRGB.length;p++){const c=PRGB[p],d=(r-c[0])*(r-c[0])*.9+(g-c[1])*(g-c[1])*1.4+(b-c[2])*(b-c[2])*.7;if(d<bd){bd=d;best=p}}LUT[k]=best}return LUT}
function quantize(ctx,w,h){const T=lut(),im=ctx.getImageData(0,0,w,h),d=im.data;for(let i=0;i<d.length;i+=4){if(d[i+3]<128){d[i+3]=0;continue}const p=PRGB[T[((d[i]>>3)<<10)|((d[i+1]>>3)<<5)|(d[i+2]>>3)]];d[i]=p[0];d[i+1]=p[1];d[i+2]=p[2];d[i+3]=255}ctx.putImageData(im,0,0)}
function hsh(a,b,c){let h=(a*374761393+b*668265263+c*2147483647)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296}
function pl(c,x0,y0,x1,y1,col,th){c.fillStyle=col;x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);th=th||1;const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1,sh=dx>=-dy;let e=dx+dy,g=0;for(;;){if(sh)c.fillRect(x0,y0,1,th);else c.fillRect(x0,y0,th,1);if((x0===x1&&y0===y1)||g++>800)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h)};
const disc=(c,x,y,r,col)=>{c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,7);c.fill()};
const ell=(c,x,y,rx,ry,col,a0,a1)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,a0||0,a1===undefined?7:a1);c.fill()};
const poly=(c,pts,fill,stroke)=>{c.beginPath();pts.forEach((p,k)=>k?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke()}};
function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;if(f>=1){r+=(255-r)*(f-1);g+=(255-g)*(f-1);b+=(255-b)*(f-1)}else{r*=f;g*=f;b*=f}return 'rgb('+Math.round(r)+','+Math.round(g)+','+Math.round(b)+')'}
const mk=(w,h)=>createCanvas(w,h);
const proj=(ox,oy)=>(x,y,z)=>[Math.round(ox+(x-y)*32),Math.round(oy+(x+y)*16-(z||0)*16)];
// Iso-Bodenkachel mit Gras
function grassTile(c,P,i,j,alt,col){const top=[P(i,j,0),P(i+1,j,0),P(i+1,j+1,0),P(i,j+1,0)];poly(c,top,col||((i+j)%2?R.grass[2]:R.grass[3]));const a=P(i,j,0);for(let k=0;k<14;k++){const rx=hsh(i,j,k),ry=hsh(i,j,k+17),px=a[0]+Math.round((rx-ry)*32),py=a[1]+Math.round((rx+ry)*16);const lt=hsh(i,j,k+40);rect(c,px,py,1,1,lt>.66?R.grass[4]:lt>.33?R.grass[1]:R.grass[5])}}
// Wand-Ebene: face 'S' (y=y0+dy) oder 'E' (x=x0+dx); u laeuft entlang der Wand, v nach oben
function wallOf(P,b,face){const pt=face==='S'?(u,v)=>P(b.x0+u,b.y0+b.dy,b.z0+v):(u,v)=>P(b.x0+b.dx,b.y0+u,b.z0+v);const len=face==='S'?b.dx:b.dy;
 const out=face==='S'?(u,v,d)=>P(b.x0+u,b.y0+b.dy+d,b.z0+v):(u,v,d)=>P(b.x0+b.dx+d,b.y0+u,b.z0+v);return{pt,out,len,rectUV(c,u0,v0,w,h,col){poly(c,[pt(u0,v0),pt(u0+w,v0),pt(u0+w,v0+h),pt(u0,v0+h)],col)},lineUV(c,u0,v0,u1,v1,col,th){const a=pt(u0,v0),d=pt(u1,v1);pl(c,a[0],a[1],d[0],d[1],col,th||1)},dotUV(c,u,v,w,h,col){const a=pt(u,v);rect(c,a[0],a[1]-h,w,h,col)}}}
module.exports={R,PAL,quantize,hsh,pl,rect,disc,ell,poly,shade,mk,proj,grassTile,wallOf,createCanvas};
