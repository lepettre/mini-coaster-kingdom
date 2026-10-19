// Looping-Sichtbarkeit: Wagen an 6 Stellen im Looping, 4 Fahrtrichtungen -> out/loopsicht.png (Wagen hinten muss von vorderen Schienen verdeckt sein)
const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const {createCanvas,loadImage}=require('@napi-rs/canvas');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const F=[.15,.3,.45,.55,.7,.85],POS=[[4,4,0],[4,4,1],[4,4,2],[4,4,3]];
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});const errs=[],shots=[];
 for(const q of POS){const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:1});p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+require('path').resolve('dist/teile-test.html'));await sleep(1000);await p.evaluate(()=>{window.__hb.lvl(0);window.__hb.close()});await sleep(300);
  await p.evaluate(k=>HBR.setLK(k),+(process.env.LK||1));await p.evaluate(q=>{window.__hb.dbgLoop(q[0],q[1],q[2]);const h=window.__hb.get(),P=HBR.proj(h.L);window.__ckm=P(q[0]+.5,q[1]+.5,1.2)},q);
  for(const f of F){await p.evaluate(f=>window.__hb.dbgAt(f),f);await sleep(250);const u=await p.evaluate(()=>window.__hb.dbgCrop(90,90));shots.push(Buffer.from(u.split(',')[1],'base64'))}await p.close()}
 const S=180,cv=createCanvas(F.length*S,POS.length*S),g=cv.getContext('2d');g.imageSmoothingEnabled=false;
 for(let k=0;k<shots.length;k++){const im=await loadImage(shots[k]);g.drawImage(im,(k%F.length)*S,Math.floor(k/F.length)*S,S,S)}
 require('fs').writeFileSync('out/loopsicht'+(process.env.LK||'')+'.png',cv.toBuffer('image/png'));console.log('errors',errs.join('|')||'none');await b.close()})();
