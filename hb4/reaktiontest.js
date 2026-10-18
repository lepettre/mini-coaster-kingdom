// Gäste-Reaktionen: Sprechblasen-Symbole während der Fahrt (Staunen, Lachen, nass, Durchatmen, Übelkeit, Herz in der Runde danach)
const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');
const puppeteer=require('puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});
 const page=await browser.newPage();await page.setViewport({width:390,height:844,deviceScaleFactor:2});const errs=[];page.on('pageerror',e=>errs.push(e.message));page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await page.goto('file://'+require('path').resolve('../index.html'));await sleep(1300);const ev=(f,...a)=>page.evaluate(f,...a);
 const seen={},shot={};
 for(const li of [2,8,14,20,23]){await ev(i=>{window.__hb.lvl(i);window.__hb.close();window.__hb.place(LEVELS[i].sols[0]);window.__hb.go()},li);
  for(let k=0;k<500;k++){await sleep(60);const g=await ev(()=>{const h=window.__hb.get();return{m:h.mode,o:h.overlay,r:h.react}});if(g.r){seen[g.r.sym]=(seen[g.r.sym]||0)+1;if(!shot[g.r.sym]&&g.m==='ride'){shot[g.r.sym]=1;await page.screenshot({path:'out/reakt_'+g.r.sym+'.png',clip:{x:0,y:120,width:390,height:520}})}}if(g.o==='result'&&seen.herz)break}}
 const need=['wow','wow2','lach','nass','herz'],miss=need.filter(k=>!seen[k]);
 console.log('Symbole',JSON.stringify(seen),'| fehlt:',miss.join(',')||'nichts','| errors',errs.join('|')||'none');
 await browser.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.log('FAIL',e.message);process.exit(1)});
