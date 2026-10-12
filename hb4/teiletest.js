// Browser-Test der neuen Teile (Bremse H, Booster V, Korkenzieher C über 2 Felder, Splash W): bauen, fahren, Bilder nach out/
const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');
const puppeteer=require('puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});
 const page=await browser.newPage();await page.setViewport({width:390,height:844,deviceScaleFactor:2});const errs=[];page.on('pageerror',e=>errs.push(e.message));page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await page.goto('file://'+require('path').resolve('dist/teile-test.html'));await sleep(1200);const ev=(f,...a)=>page.evaluate(f,...a);
 await ev(()=>{window.__hb.lvl(0);window.__hb.close()});await sleep(500);await page.screenshot({path:'out/teile_baufenster.png'});
 await ev(()=>window.__hb.place('HVRCBRBBGRWL'));await sleep(500);const placed=await ev(()=>window.__hb.get().run.placed);await page.screenshot({path:'out/teile_strecke.png'});
 await ev(()=>window.__hb.go());const seen={};let ok=false;
 for(let k=0;k<400;k++){await sleep(50);const g=await ev(()=>{const h=window.__hb.get();return{ty:h.rideTy,o:h.overlay}});
  if(g.ty&&'HVCW'.includes(g.ty)&&!seen[g.ty]){seen[g.ty]=1;await page.screenshot({path:'out/teile_fahrt_'+g.ty+'.png',clip:{x:0,y:90,width:390,height:420}})}
  if(g.o==='result'){ok=true;break}}
 const r=ok?await ev(()=>{const h=window.__hb.get().result;return{st:h.st,ok:h.j.success,flags:h.j.flags}}):null;
 console.log('gebaut',placed,'von 12 | befahren',Object.keys(seen).sort().join(''),'| Ergebnis',JSON.stringify(r),'| errors',errs.join('|')||'none');
 await browser.close();if(placed!==12||Object.keys(seen).length<4||!r||!r.ok||errs.length)process.exit(1)})();
