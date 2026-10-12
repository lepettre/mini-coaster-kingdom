const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');
const puppeteer=require('puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const HB=require('./logic.js');const LV=JSON.parse(require('fs').readFileSync('levels24.json'));
const solSeq=l=>{const r=HB.solve(l,400,300000);const c=r.sols.filter(s=>s.centered);return(c.length?c:r.sols).sort((a,b)=>a.placed-b.placed)[0].seq};
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});
  const page=await browser.newPage();await page.setViewport({width:390,height:844,deviceScaleFactor:2});
  const errs=[];page.on('pageerror',e=>errs.push('ERR '+e.message));page.on('console',m=>{if(m.type()==='error')errs.push('CON '+m.text())});
  await page.goto('file://'+require('path').resolve('dist/mini-coaster-kingdom.html'));await sleep(1500);
  const ev=(fn,...a)=>page.evaluate(fn,...a);
  const hits=async()=>(await ev(()=>window.__hb.hits())).map(h=>h.id).join(',');
  const tap=async id=>{let h=null;for(let k=0;k<50&&!h;k++){await sleep(100);h=(await ev(()=>window.__hb.hits())).find(x=>x.id===id)}if(!h)throw new Error('no hit '+id+' have '+await hits());await page.mouse.click((h.x+h.w/2)*2,(h.y+h.h/2)*2);await sleep(300)};
  const ov=()=>ev(()=>window.__hb.get().overlay);
  console.log('start overlay',await ov(),'hits',await hits());
  await page.screenshot({path:'out/t2_menu.png'});
  await tap('mplay');console.log('nach Spielen',await ov());await tap('hok');
  const play=async seq=>{for(const k of seq.split('')){const cur=await ev(()=>window.__hb.get().sel);if(cur!==k)await tap('p'+k);await tap('build')}await tap('go');for(let k=0;k<300;k++){await sleep(300);if(await ov()==='result')break}await sleep(500);return ev(()=>{const h=window.__hb.get();return{st:h.result.st,ok:h.result.j.success}})};
  console.log('L1',JSON.stringify(await play(solSeq(LV[0]))));
  await tap('next');await sleep(600);console.log('Level danach',await ev(()=>window.__hb.get().run.level.id));
  await tap('menu');console.log('menu',await ov());await tap('mlev');console.log('levels hits',await hits());await page.screenshot({path:'out/t2_levels.png'});
  await tap('cnext');await page.screenshot({path:'out/t2_levels2.png'});await tap('lclose');
  await tap('mrnd');console.log('rand hits',await hits());await page.screenshot({path:'out/t2_rand.png'});
  await tap('rz0');for(let k=0;k<60;k++){await sleep(250);if(await ov()===null)break}
  const rl=await ev(()=>{const r=window.__hb.get().run.level;return{id:r.id,rnd:r.rnd,theme:r.theme,groups:r.groups,par:r.par}});console.log('Zufall',JSON.stringify(rl));
  const seq=await ev(()=>{const r=window.HB.solve(window.__hb.get().run.level,300,200000);const c=r.sols.filter(s=>s.centered);return(c.length?c:r.sols).sort((a,b)=>a.placed-b.placed)[0].seq});
  console.log('Zufall-Fahrt',JSON.stringify(await play(seq)));
  await tap('next');for(let k=0;k<60;k++){await sleep(250);if(await ov()===null)break}console.log('Neues Zufallsraetsel',await ev(()=>window.__hb.get().run.level.id));
  console.log('errors',errs.length?errs.slice(0,4).join(' | '):'none');await browser.close();
})().catch(e=>{console.log('FAIL',e.message.slice(0,300));process.exit(1)});
