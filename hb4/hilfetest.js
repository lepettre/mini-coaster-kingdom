// Hilfe, Teile-Übersicht und Neu-Fenster im Browser prüfen (Bilder nach out/ui_*.png)
const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve('../index.html'));await sleep(1000);const ev=(f,...a)=>p.evaluate(f,...a);
await ev(()=>window.__hb.lvl(1));await sleep(500);await p.screenshot({path:'out/ui_help.png'});
await ev(()=>{window.__hb.get();});const tap=async id=>{const h=(await ev(()=>window.__hb.hits())).find(x=>x.id===id);if(!h)throw new Error('no '+id);await p.mouse.click(h.x*2+h.w,h.y*2+h.h);await sleep(400)};
await tap('hteile');await p.screenshot({path:'out/ui_teile.png'});await tap('tok');await tap('hok');console.log('nach Hilfe',await ev(()=>window.__hb.get().overlay));await p.screenshot({path:'out/ui_neu.png'});
await tap('nok');console.log('nach OK',await ev(()=>window.__hb.get().overlay),await ev(()=>localStorage.getItem('hb4')));
await ev(()=>window.__hb.lvl(9));await sleep(500);console.log('Level 2-4',await ev(()=>window.__hb.get().overlay));await p.screenshot({path:'out/ui_neu2.png'});
console.log('errors',errs.join('|')||'none');await b.close()})();
