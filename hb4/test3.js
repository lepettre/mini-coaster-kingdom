const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');
const puppeteer=require('puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const HB=require('./logic.js');const LV=JSON.parse(require('fs').readFileSync('levels24.json'));
const solSeq=l=>{const r=HB.solve(l,400,300000);const c=r.sols.filter(s=>s.centered);return(c.length?c:r.sols).sort((a,b)=>a.placed-b.placed)[0]};
(async()=>{const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});
 const errs=[];const res=[];
 // alle Level; Teilmenge per Argument, z. B. node test3.js 3 8 14
 const idx=process.argv.length>2?process.argv.slice(2).map(Number):LV.map((_,i)=>i);
 for(const i of idx){
  const page=await browser.newPage();await page.setViewport({width:390,height:844,deviceScaleFactor:1});page.on('pageerror',e=>errs.push(e.message));
  await page.goto('file://'+require('path').resolve('dist/mini-coaster-kingdom.html'));await sleep(1200);const ev=(f,...a)=>page.evaluate(f,...a);
  await ev(i=>{window.__hb.lvl(i);window.__hb.close()},i);await sleep(400);
  const s=solSeq(LV[i]);await ev(q=>window.__hb.place(q),s.seq);
  await ev(()=>window.__hb.go());let ok=false;for(let k=0;k<200;k++){await sleep(300);if(await ev(()=>window.__hb.get().overlay)==='result'){ok=true;break}}
  const r=ok?await ev(()=>{const h=window.__hb.get();return{st:h.result.st,ok:h.result.j.success}}):null;res.push([LV[i].id,LV[i].groups.join('+'),s.seq.length,JSON.stringify(r)]);await page.close()}
 console.log(res.map(r=>r.join(' ')).join('\n'));const three=res.filter(r=>/"st":3/.test(r[3])).length;console.log('3 Sterne:',three+' / '+res.length);console.log('errors',errs.join('|')||'none');await browser.close();if(three<res.length||errs.length)process.exit(1)})();
