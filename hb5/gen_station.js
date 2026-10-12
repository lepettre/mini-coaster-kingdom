const {createCanvas}=require('@napi-rs/canvas');const fs=require('fs');
const L=require('./lib.js');const S=require('./stations.js');
const [,, T, vi, outp]=process.argv;
const TT=S[T],V=TT.V[+vi];const W=330,H=260,OX=150,OY=96;
function layer(fn){const cv=createCanvas(W,H),c=cv.getContext('2d'),P=L.proj(OX,OY);fn(c,P);L.quantize(c,W,H);
  const d=c.getImageData(0,0,W,H).data;let x0=W,y0=H,x1=-1,y1=-1;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  const w=x1-x0+1,h=y1-y0+1,o=createCanvas(w,h);o.getContext('2d').drawImage(cv,x0,y0,w,h,0,0,w,h);
  return{ox:x0-OX,oy:y0-OY,w,h,src:'data:image/png;base64,'+o.toBuffer('image/png').toString('base64')}}
// platform helper aus stations.js ist nicht exportiert -> ueber scene-Funktionen nachbauen
const fs2=fs.readFileSync('./stations.js','utf8');
const m=new Function('require','module','exports','__dirname',fs2+';return {platform,track,path}')(require,{exports:{}},{},__dirname);
const res={house:layer((c,P)=>TT.house(c,P,V)),plat:layer((c,P)=>{m.platform(c,P,V,'back');m.platform(c,P,V,'front')}),canopy:layer((c,P)=>TT.canopy(c,P,V)),gate:layer((c,P)=>TT.gate(c,P,V))};
fs.writeFileSync(outp,JSON.stringify(res));console.log(Object.keys(res).map(k=>k+':'+res[k].w+'x'+res[k].h+'@'+res[k].ox+','+res[k].oy).join(' '))
