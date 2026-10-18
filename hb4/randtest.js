// Sichere Ränder (iPhone): mit 47 px oben und 34 px unten liegen Kopfzeile und untere Knöpfe vollständig im sichtbaren Bereich
const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');
const puppeteer=require('puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});
 const page=await browser.newPage();await page.setViewport({width:390,height:844,deviceScaleFactor:2});const errs=[];page.on('pageerror',e=>errs.push(e.message));
 await page.goto('file://'+require('path').resolve('../index.html'));await sleep(1300);const ev=(f,...a)=>page.evaluate(f,...a);
 await ev(()=>{const s=document.getElementById('sa').style;s.paddingTop='47px';s.paddingBottom='34px';window.dispatchEvent(new Event('resize'));window.__hb.lvl(0);window.__hb.close()});await sleep(500);
 const r=await ev(()=>{const b=document.getElementById('cv').getBoundingClientRect(),U=2,hs=window.__hb.hits(),f=id=>hs.find(h=>h.id===id);const m=f('menu')||{y:NaN},g=f('go')||{y:NaN,h:0},n=f('neu')||{y:NaN,h:0};return{ids:hs.map(h=>h.id).join(','),top:b.top,bottom:b.bottom,menuY:b.top+m.y*U,goY:b.top+(g.y+g.h)*U,neuY:b.top+(n.y+n.h)*U}});
 const fail=[];if(isNaN(r.menuY))fail.push('ids');if(r.menuY<47)fail.push('Menü unter Statusleiste');if(isNaN(r.neuY)||r.neuY>844-34)fail.push('untere Knöpfe unter Home-Balken');
 await page.screenshot({path:'out/rand.png'});
 console.log(JSON.stringify(r),'| Fehler:',fail.join('; ')||'keine','| errors',errs.join('|')||'none');await browser.close();process.exit(fail.length||errs.length?1:0)})().catch(e=>{console.log('FAIL',e.message);process.exit(1)});
