const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');
const puppeteer=require('puppeteer-core');const {createCanvas,loadImage}=require('@napi-rs/canvas');const fs=require('fs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});
 const shots=[];
 for(let din=0;din<4;din++){const page=await browser.newPage();await page.setViewport({width:390,height:844,deviceScaleFactor:3});
  await page.goto('file://'+require('path').resolve('dist/haengebahn.html'));await sleep(1200);await page.evaluate(()=>window.__hb.close());
  await page.evaluate(d=>window.__hb.dbgLoop(5,5,d),din);
  for(const f of [.5,.85]){await page.evaluate(f=>window.__hb.dbgAt(f),f);await sleep(1400);shots.push(await page.screenshot({clip:{x:105,y:215,width:180,height:200}}));}
  await page.close()}
 const cv=createCanvas(4*360,2*400),c=cv.getContext('2d');
 for(let i=0;i<shots.length;i++){const im=await loadImage(shots[i]);c.drawImage(im,Math.floor(i/2)*360,(i%2)*400,360,400)}
 fs.writeFileSync('out/looping_vier.png',cv.toBuffer('image/png'));await browser.close()})();
