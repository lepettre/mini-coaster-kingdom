const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');
const puppeteer=require('puppeteer-core');const {createCanvas,loadImage}=require('@napi-rs/canvas');const fs=require('fs');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});
 const page=await browser.newPage();await page.setViewport({width:390,height:844,deviceScaleFactor:2});const errs=[];page.on('pageerror',e=>errs.push(e.message));
 await page.goto('file://'+require('path').resolve('dist/haengebahn.html'));await sleep(1500);
 const shots=[];for(const i of [0,6,12,18]){await page.evaluate(i=>{window.__hb.lvl(i);window.__hb.close()},i);await sleep(900);shots.push(await page.screenshot({clip:{x:0,y:90,width:390,height:330}}))}
 const out=createCanvas(1560,1320),o=out.getContext('2d');for(let k=0;k<4;k++){const im=await loadImage(shots[k]);o.drawImage(im,(k%2)*780,Math.floor(k/2)*660,780,660)}
fs.writeFileSync('out/landschaften.png',out.toBuffer('image/png'));console.log('errors',errs.join('|')||'none');await browser.close()})();
