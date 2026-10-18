// Kreuzungen: Regeln (Gerade über/unter Gerade, rechtwinklig, ≥ 2 Ebenen) und Bild einer Kreuzung in Level 2-5 -> out/kreuzung.png
const HB=require('./logic.js');const LV=require('./levels24.json');const fail=[];
{const l=LV.find(x=>x.id==='k2-5'),run=HB.newRun(l);for(const k of 'GGLBBLLAB'){const g=HB.ghost(run,k);if(!g.valid)fail.push('Aufbau '+k);HB.place(run,g)}
 const g=HB.ghost(run,'G');if(!(g.valid&&g.cross))fail.push('Kreuzung unter der Startgeraden nicht möglich');
 if(HB.ghost(run,'L').valid)fail.push('Kurve auf belegtem Feld möglich');
 HB.place(run,g);if(!run.track[run.track.length-1].cross)fail.push('Kreuzung nicht vermerkt');HB.undo(run);
 if(HB.ghost(run,'B').valid)fail.push('Abfahrt auf Kreuzungsfeld möglich')}
const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');
const puppeteer=require('puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});
 const page=await browser.newPage();await page.setViewport({width:390,height:844,deviceScaleFactor:2});const errs=[];page.on('pageerror',e=>errs.push(e.message));
 await page.goto('file://'+require('path').resolve('../index.html'));await sleep(1300);const ev=(f,...a)=>page.evaluate(f,...a);
 const li=LV.findIndex(x=>x.id==='k2-5');await ev(i=>{window.__hb.lvl(i);window.__hb.close();window.__hb.place('GGLBBLLABGBR')},li);await sleep(600);
 const url=await ev(()=>{const h=window.__hb.get(),x=h.run.track.find(p=>p.cross),P=HBR.proj(h.L);window.__ckm=P(x.i+.5,x.j+.5,1.5);return window.__hb.dbgCrop(200,160)});
 const {createCanvas,loadImage}=require('@napi-rs/canvas');const im=await loadImage(Buffer.from(url.split(',')[1],'base64')),cv=createCanvas(600,480),c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(im,0,0,600,480);require('fs').writeFileSync('out/kreuzung.png',cv.toBuffer('image/png'));
 await ev(()=>window.__hb.go());let o=null;for(let k=0;k<400&&o!=='result';k++){await sleep(80);o=await ev(()=>window.__hb.get().overlay)}if(o!=='result')fail.push('Fahrt über Kreuzung endet nicht');
 console.log('Fehler:',fail.join('; ')||'keine','| errors',errs.join('|')||'none');await browser.close();process.exit(fail.length||errs.length?1:0)})().catch(e=>{console.log('FAIL',e.message);process.exit(1)});
