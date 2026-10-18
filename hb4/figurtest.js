// Figuren in Großaufnahme: Stationsplatz von Level 1-1, 4-fach vergrößert -> out/figuren.png
const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');
const puppeteer=require('puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});
 const page=await browser.newPage();await page.setViewport({width:390,height:844,deviceScaleFactor:2});const errs=[];page.on('pageerror',e=>errs.push(e.message));
 await page.goto('file://'+require('path').resolve('../index.html'));await sleep(1300);const ev=(f,...a)=>page.evaluate(f,...a);
 await ev(()=>{window.__hb.lvl(0);window.__hb.close()});await sleep(800);
 const url=await ev(()=>{const L=window.__hb.get().L,r=window.__hb.get().run,st=r.track[0],P=HBR.proj(L),m=P(st.i+1,st.j+1.5,0);window.__ckm=m;return window.__hb.dbgCrop(90,60)});
 const b=Buffer.from(url.split(',')[1],'base64');const {createCanvas,loadImage}=require('@napi-rs/canvas');const im=await loadImage(b),cv=createCanvas(360,240),c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(im,0,0,360,240);
 require('fs').writeFileSync('out/figuren.png',cv.toBuffer('image/png'));console.log('errors',errs.join('|')||'none');await browser.close()})().catch(e=>{console.log('FAIL',e.message);process.exit(1)});
