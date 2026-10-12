const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');
const puppeteer=require('puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const HB=require('./logic.js');const LV=JSON.parse(require('fs').readFileSync('levels.json'));
const seqs=LV.map(l=>{const r=HB.solve(l,500,400000);const c=r.sols.filter(s=>s.centered);const p=(c.length?c:r.sols).sort((a,b)=>a.placed-b.placed)[0];return{n:r.sols.length,cen:c.length,seq:p.seq,placed:p.placed}});
console.log('solver',JSON.stringify(seqs.map(s=>[s.n,s.cen,s.placed])));
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});
  const page=await browser.newPage();await page.setViewport({width:390,height:844,deviceScaleFactor:2});
  const errs=[];page.on('pageerror',e=>errs.push('PAGEERR '+e.message));page.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});
  await page.goto('file://'+require('path').resolve('dist/mini-coaster-kingdom.html'));await sleep(1500);
  const ev=(fn,...a)=>page.evaluate(fn,...a);
  const tap=async id=>{let h=null;for(let k=0;k<50&&!h;k++){await sleep(100);h=(await ev(()=>window.__hb.hits())).find(x=>x.id===id)}if(!h)throw new Error('no hit '+id);await page.mouse.click((h.x+h.w/2)*2,(h.y+h.h/2)*2);await sleep(250)};
  const res=[];
  await tap('hok');
  for(let i=0;i<3;i++){
    if(i>0){await tap('next');await sleep(500)}
    const lid=await ev(()=>window.__hb.get().run.level.id);
    for(const k of seqs[i].seq.split('')){const cur=await ev(()=>window.__hb.get().sel);if(cur!==k)await tap('p'+k);await tap('build')}
    if(i===0){await sleep(300);await page.screenshot({path:'out/shot_l1.png'})}
    await tap('go');
    for(let k=0;k<120;k++){await sleep(300);const o=await ev(()=>window.__hb.get().overlay);if(o==='result')break}
    await sleep(600);
    const r=await ev(()=>{const h=window.__hb.get();return{stars:h.result.st,ok:h.result.j.success}});
    res.push([lid,r.stars,r.ok]);
  }
  console.log('played',JSON.stringify(res));
  await tap('close');await tap('menu');await sleep(300);
  const hits=(await ev(()=>window.__hb.hits())).map(h=>h.id).join(',');console.log('menu hits',hits);
  await page.screenshot({path:'out/shot_menu.png'});
  const saved=await ev(()=>localStorage.getItem('hb4'));console.log('saved',saved);
  console.log('errors:',errs.length?errs.join('\n'):'none');
  await browser.close();
})().catch(e=>{console.log('FAIL',e.message.slice(0,500));process.exit(1)});
