// Tipp-Knopf: in jedem Level nur nach Tipps bauen (tippen -> BAUEN) bis zum geschlossenen Kreis, dann fahren.
// Erwartet: nie "Kein Tipp gefunden", Fahrt erfolgreich (mit Tipp höchstens 2 Sterne). Dazu ein Fall mit falschem ersten Teil.
const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const LV=JSON.parse(require('fs').readFileSync('levels24.json'));
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});const res=[],errs=[];
 const idx=process.argv.length>2?process.argv.slice(2).map(Number):LV.map((_,i)=>i);
 for(const i of idx){const p=await b.newPage();await p.setViewport({width:390,height:844});p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+require('path').resolve('../index.html'));await sleep(900);const ev=(f,...a)=>p.evaluate(f,...a);
  await ev(i=>{window.__hb.lvl(i);window.__hb.close()},i);await sleep(300);
  const tap=async id=>{const h=(await ev(()=>window.__hb.hits())).find(x=>x.id===id);if(!h)return false;await p.mouse.click(h.x*2+h.w,h.y*2+h.h);await sleep(120);return true};
  let n=0,msg='',t0=Date.now(),maxT=0;
  for(;n<25;n++){if(await ev(()=>window.__hb.st().ready))break;const t1=Date.now();await tap('tipp');maxT=Math.max(maxT,Date.now()-t1);msg=await ev(()=>window.__hb.st().hintMsg);if(!/^Tipp/.test(msg))break;await tap('build')}
  const ready=await ev(()=>window.__hb.st().ready);let st=null;if(ready){await ev(()=>window.__hb.go());for(let k=0;k<200;k++){await sleep(300);if(await ev(()=>window.__hb.get().overlay)==='result')break}st=await ev(()=>window.__hb.get().result&&window.__hb.get().result.st)}
  res.push([LV[i].id,'Teile '+n,ready?'Kreis zu':'STOPP: '+msg,'Sterne '+st,'längster Tipp '+maxT+' ms']);await p.close()}
 // falscher Start: erst ein unpassendes Teil, dann Tipp (Suche statt gespeicherter Lösung)
 {const p=await b.newPage();await p.setViewport({width:390,height:844});await p.goto('file://'+require('path').resolve('../index.html'));await sleep(900);const ev=(f,...a)=>p.evaluate(f,...a);
  await ev(()=>{window.__hb.lvl(12);window.__hb.close()});await sleep(300);await ev(()=>window.__hb.place('B'));const t1=Date.now();const h=(await ev(()=>window.__hb.hits())).find(x=>x.id==='tipp');await p.mouse.click(h.x*2+h.w,h.y*2+h.h);await sleep(150);
  res.push(['3-1 nach falschem Start','Antwort: '+await ev(()=>window.__hb.st().hintMsg),(Date.now()-t1)+' ms']);await p.close()}
 console.log(res.map(r=>r.join(' | ')).join('\n'));const bad=res.filter(r=>/STOPP|Sterne (null|0)/.test(r.join(' '))).length;console.log('Probleme:',bad,'errors',errs.join('|')||'none');await b.close();if(bad||errs.length)process.exit(1)})();
