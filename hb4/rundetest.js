// Nach erfolgreicher Fahrt fährt der Zug im Hintergrund weiter (Runden), ohne Neustart; "Nochmal" beendet das.
const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');
const puppeteer=require('puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});
 const page=await browser.newPage();await page.setViewport({width:390,height:844,deviceScaleFactor:2});const errs=[];page.on('pageerror',e=>errs.push(e.message));page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await page.goto('file://'+require('path').resolve('../index.html'));await sleep(1300);const ev=(f,...a)=>page.evaluate(f,...a);
 const tap=async id=>{let h=null;for(let k=0;k<50&&!h;k++){await sleep(100);h=(await ev(()=>window.__hb.hits())).find(x=>x.id===id)}if(!h)throw new Error('no hit '+id);await page.mouse.click((h.x+h.w/2)*2,(h.y+h.h/2)*2);await sleep(250)};
 const fail=[];
 await ev(()=>{window.__hb.lvl(0);window.__hb.close()});await sleep(400);
 await ev(()=>{const L=window.__hb.get();window.__hb.place(LEVELS[0].sols[0])});await tap('go');
 for(let k=0;k<300;k++){await sleep(150);if((await ev(()=>window.__hb.get().overlay))==='result')break}
 const s=[];for(let k=0;k<40;k++){await sleep(250);s.push(await ev(()=>{const h=window.__hb.get();return{m:h.mode,o:h.overlay,s:h.rideS}}))}
 const wraps=s.slice(1).filter((x,k)=>x.s<s[k].s).length,moved=s.filter((x,k)=>k&&x.s!==s[k-1].s).length;
 if(s.some(x=>x.m!=='result'||x.o!=='result'))fail.push('Modus/Fenster wechselt');if(moved<35)fail.push('Zug steht ('+moved+')');if(wraps<1)fail.push('keine neue Runde');
 await page.screenshot({path:'out/runde.png'});
 await tap('again');const a=await ev(()=>{const h=window.__hb.get();return{m:h.mode,o:h.overlay,placed:h.run.placed}});if(a.m!=='build'||a.o||a.placed)fail.push('Nochmal: '+JSON.stringify(a));
 console.log('Runden-Sprünge',wraps,'bewegt',moved,'| Fehler:',fail.join('; ')||'keine','| errors',errs.join('|')||'none');
 await browser.close();process.exit(fail.length||errs.length?1:0)})().catch(e=>{console.log('FAIL',e.message);process.exit(1)});
