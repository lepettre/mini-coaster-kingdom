// Abzeichen: Vergabe nach Erfolg (Erste Fahrt, Looping, Kreuzung, Zuschauer nach 3 Runden), Hinweis oben, Fenster im Menü
const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');
const puppeteer=require('puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));const LV=require('./levels24.json');
(async()=>{const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});
 const page=await browser.newPage();await page.setViewport({width:390,height:844,deviceScaleFactor:2});const errs=[];page.on('pageerror',e=>errs.push(e.message));page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 const url='file://'+require('path').resolve('../index.html');await page.goto(url);await page.evaluate(()=>localStorage.clear());await page.goto(url);await sleep(1300);const ev=(f,...a)=>page.evaluate(f,...a);
 const tap=async id=>{let h=null;for(let k=0;k<50&&!h;k++){await sleep(100);h=(await ev(()=>window.__hb.hits())).find(x=>x.id===id)}if(!h)throw new Error('no hit '+id);await page.mouse.click((h.x+h.w/2)*2,(h.y+h.h/2)*2);await sleep(250)};
 const ride=async(li,seq)=>{await ev((i,s)=>{window.__hb.lvl(i);window.__hb.close();window.__hb.place(s);window.__hb.go()},li,seq);for(let k=0;k<600;k++){await sleep(80);if((await ev(()=>window.__hb.get().overlay))==='result')return}};
 const fail=[];
 if((await ev(()=>window.__hb.badges().ab.length))!==0)fail.push('Start nicht leer');
 await ride(0,LV[0].sols[0]);await sleep(300);let b=await ev(()=>window.__hb.badges());if(!b.ab.includes('erste'))fail.push('Erste Fahrt fehlt');if(!b.toast.length)fail.push('kein Hinweis');
 await page.screenshot({path:'out/abz_toast.png',clip:{x:0,y:0,width:390,height:120}});
 for(let k=0;k<120&&!(await ev(()=>window.__hb.badges().ab.includes('runden')));k++)await sleep(500);b=await ev(()=>window.__hb.badges());if(!b.ab.includes('runden'))fail.push('Zuschauer fehlt nach 3 Runden');
 const li=LV.findIndex(l=>l.sols.some(s=>s.includes('P')));await ride(li,LV[li].sols.find(s=>s.includes('P')));b=await ev(()=>window.__hb.badges());if(!b.ab.includes('loop'))fail.push('Kopfüber fehlt ('+LV[li].id+')');
 const k5=LV.findIndex(l=>l.id==='k2-5');await ride(k5,'GGLBBLLABGBR');b=await ev(()=>window.__hb.badges());const ok5=await ev(()=>window.__hb.st().ok);if(ok5&&!b.ab.includes('kreuz'))fail.push('Brückenbau fehlt');
 await ev(()=>window.__hb.close());await tap('menu');await tap('mbadge');await sleep(300);await page.screenshot({path:'out/abz_fenster.png'});await tap('bok');
 const saved=await ev(()=>JSON.parse(localStorage.getItem('hb4')).ab);if(saved.length!==b.ab.length)fail.push('nicht gespeichert');
 console.log('Abzeichen',b.ab.join(','),'| Kreuzungsfahrt erfolgreich:',ok5,'| Fehler:',fail.join('; ')||'keine','| errors',errs.join('|')||'none');
 await browser.close();process.exit(fail.length||errs.length?1:0)})().catch(e=>{console.log('FAIL',e.message);process.exit(1)});
