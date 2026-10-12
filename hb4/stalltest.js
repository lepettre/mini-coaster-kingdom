const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');
const puppeteer=require('puppeteer-core');const {createCanvas,loadImage}=require('@napi-rs/canvas');const fs=require('fs');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});
 const page=await browser.newPage();await page.setViewport({width:390,height:844,deviceScaleFactor:2});const errs=[];page.on('pageerror',e=>errs.push(e.message));page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await page.goto('file://'+require('path').resolve('dist/mini-coaster-kingdom.html'));await sleep(1300);const ev=(f,...a)=>page.evaluate(f,...a);
 const tap=async id=>{let h=null;for(let k=0;k<50&&!h;k++){await sleep(100);h=(await ev(()=>window.__hb.hits())).find(x=>x.id===id)}if(!h)throw new Error('no hit '+id);await page.mouse.click((h.x+h.w/2)*2,(h.y+h.h/2)*2);await sleep(250)};
 await ev(()=>{window.__hb.lvl(2);window.__hb.close()});await sleep(500);
 for(const k of ['G','G','P']){const cur=await ev(()=>window.__hb.get().sel);if(cur!==k)await tap('p'+k);await tap('build')}
 const st=await ev(()=>{const h=window.__hb.get();return{placed:h.run.placed,stall:h.run.stall,k:h.run.head.k}});console.log('nach Bau',JSON.stringify(st));
 await page.screenshot({path:'out/stall_build.png'});
 await tap('go');const trace=[];let sawSwing=false,minS=1e9,maxS=-1e9,dir=0,flips=0,lastS=null;
 for(let k=0;k<200;k++){await sleep(150);const g=await ev(()=>{const h=window.__hb.get();return{o:h.overlay,m:h.mode,s:h.rideS,sw:!!h.swing,sS:h.stallS}});
  if(g.sw){sawSwing=true;if(lastS!==null){const d=Math.sign(g.s-lastS);if(d!==0&&dir!==0&&d!==dir)flips++;if(d!==0)dir=d}minS=Math.min(minS,g.s);maxS=Math.max(maxS,g.s);lastS=g.s;if(trace.length<4&&k%6===0){await page.screenshot({path:'out/stall_swing'+trace.length+'.png',clip:{x:0,y:90,width:390,height:380}});trace.push(g.s)}}
  if(g.o==='stall')break}
 await sleep(400);await page.screenshot({path:'out/stall_msg.png'});
 const end=await ev(()=>{const h=window.__hb.get();return{o:h.overlay,m:h.mode,placed:h.run.placed,stall:h.run.stall}});
 console.log('swing',sawSwing,'range',(maxS-minS).toFixed(2),'umkehrungen',flips,'ende',JSON.stringify(end),'errors',errs.join('|')||'none');
 await tap('sok');const after=await ev(()=>({o:window.__hb.get().overlay,m:window.__hb.get().mode}));console.log('nach OK',JSON.stringify(after));
 await browser.close()})().catch(e=>{console.log('FAIL',e.message);process.exit(1)});
