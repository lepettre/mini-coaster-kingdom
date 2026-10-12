const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');
const puppeteer=require('puppeteer-core');const {createCanvas,loadImage}=require('@napi-rs/canvas');const fs=require('fs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const browser=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});
  const errs=[];const shots=[];
  const pos=[[5,3],[4,5],[5,5],[4,3]];
  for(let din=0;din<4;din++){
    const page=await browser.newPage();await page.setViewport({width:390,height:844,deviceScaleFactor:3});
    page.on('pageerror',e=>errs.push(e.message));page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
    await page.goto('file:///mnt/user-data/outputs/haengebahn.html');await sleep(1200);
    await page.evaluate(()=>window.__hb.close());
    const n=await page.evaluate((p,d)=>window.__hb.dbgLoop(p[0],p[1],d),pos[din],din);
    if(din===0)console.log('samples',n);
    for(const f of [.12,.5,.88]){
      await page.evaluate(f=>window.__hb.dbgAt(f),f);await sleep(900);
      const cc=[[272,335],[235,340],[260,365],[290,325]][din];const b=await page.screenshot({clip:{x:cc[0]-60,y:cc[1]-70,width:120,height:130}});shots.push([din,f,b]);
    }
    await page.close();
  }
  const cv=createCanvas(3*360,4*390),c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,cv.width,cv.height);
  for(let i=0;i<shots.length;i++){const im=await loadImage(shots[i][2]);c.drawImage(im,(i%3)*360,Math.floor(i/3)*390,360,390);}
  const out=createCanvas(1080,1560),o=out.getContext('2d');o.drawImage(cv,0,0);
  fs.writeFileSync('/mnt/user-data/outputs/looping_kontakt.png',out.toBuffer('image/png'));
  console.log('errors',errs.length?errs.slice(0,3).join('|'):'none');await browser.close();
})().catch(e=>{console.log('FAIL',e.message.slice(0,300));process.exit(1)});
