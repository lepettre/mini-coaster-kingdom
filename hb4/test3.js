const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');
const puppeteer=require('puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const HB=require('./logic.js');const LV=JSON.parse(require('fs').readFileSync('levels24.json'));
const solSeq=l=>{const r=HB.solve(l,400,300000);const c=r.sols.filter(s=>s.centered);return(c.length?c:r.sols).sort((a,b)=>a.placed-b.placed)[0]};
(async()=>{const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});
 const errs=[];const res=[];
 for(const i of [3,8,14,19,22,23]){
  const page=await browser.newPage();await page.setViewport({width:390,height:844,deviceScaleFactor:1});page.on('pageerror',e=>errs.push(e.message));
  await page.goto('file://'+require('path').resolve('dist/haengebahn.html'));await sleep(1200);const ev=(f,...a)=>page.evaluate(f,...a);
  await ev(i=>{window.__hb.lvl(i);window.__hb.close()},i);await sleep(400);
  const s=solSeq(LV[i]);await ev(q=>window.__hb.place(q),s.seq);
  await ev(()=>window.__hb.go());let ok=false;for(let k=0;k<200;k++){await sleep(300);if(await ev(()=>window.__hb.get().overlay)==='result'){ok=true;break}}
  const r=ok?await ev(()=>{const h=window.__hb.get();return{st:h.result.st,ok:h.result.j.success}}):null;res.push([LV[i].id,LV[i].groups.join('+'),s.seq.length,JSON.stringify(r)]);await page.close()}
 console.log(res.map(r=>r.join(' ')).join('\n'));console.log('errors',errs.join('|')||'none');await browser.close()})();
