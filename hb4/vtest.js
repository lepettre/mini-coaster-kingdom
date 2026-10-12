// Browser-Test der Varianz-Vorschau: jedes Testlevel per Lösung spielen, Flaggen-Prüfung, Screenshots nach out/
const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');
const puppeteer=require('puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const HB=require('./logic.js');const LV=JSON.parse(require('fs').readFileSync('varianz_test.json'));
const best=l=>{const r=HB.solve(l,400,400000);const c=r.sols.filter(s=>s.centered);return c.sort((a,b)=>a.placed-b.placed)[0].seq};
// eine Strecke, die alle Gäste froh macht, aber eine Flagge auslässt (falls es sie gibt)
const noFlag=l=>{if(!(l.flags||[]).length)return null;const r=HB.solve(Object.assign({},l,{flags:[]}),400,400000);
  for(const s of r.sols){const run=HB.newRun(l);for(const k of s.seq)HB.place(run,HB.ghost(run,k));if(HB.flagsHit(run)<l.flags.length)return s.seq}return null};
(async()=>{const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});
 const errs=[],res=[];
 const play=async(i,seq,shot)=>{const page=await browser.newPage();await page.setViewport({width:390,height:844,deviceScaleFactor:1});page.on('pageerror',e=>errs.push(e.message));
  await page.goto('file://'+require('path').resolve('../vorschau.html'));await sleep(1200);const ev=(f,...a)=>page.evaluate(f,...a);
  await ev(i=>{window.__hb.lvl(i);window.__hb.close()},i);await sleep(500);if(shot)await page.screenshot({path:'out/'+shot+'_leer.png'});
  await ev(q=>window.__hb.place(q),seq);await sleep(400);if(shot)await page.screenshot({path:'out/'+shot+'_strecke.png'});
  await ev(()=>window.__hb.go());let ok=false;for(let k=0;k<200;k++){await sleep(300);if(await ev(()=>window.__hb.get().overlay)==='result'){ok=true;break}}
  const r=ok?await ev(()=>{const h=window.__hb.get();return{st:h.result.st,ok:h.result.j.success,flags:h.result.j.flags}}):null;await page.close();return r};
 for(let i=0;i<LV.length;i++){const l=LV[i];res.push([l.id,'Lösung',JSON.stringify(await play(i,best(l),l.id))]);
  const nf=noFlag(l);if(nf)res.push([l.id,'ohne Flagge',JSON.stringify(await play(i,nf,null))])}
 console.log(res.map(r=>r.join(' ')).join('\n'));console.log('errors',errs.join('|')||'none');await browser.close()})();
