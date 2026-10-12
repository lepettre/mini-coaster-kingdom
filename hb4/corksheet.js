// Aufruf: python3 build.py teile; node corksheet.js '[{"name":"A","ck":{...}}]' bild.png  (Varianten über HBR.setCK)
// Entwurfsblatt Korkenzieher: Varianten x 4 Richtungen + Wagen kopfüber
const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const {createCanvas,loadImage}=require('@napi-rs/canvas');const fs=require('fs');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const VAR=JSON.parse(process.argv[2]);const out=process.argv[3];
const POS=[[4,5,0],[5,4,1],[6,5,2],[5,6,3]];
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:'shell'});const shots=[];const errs=[];
for(const v of VAR){for(let d=0;d<5;d++){const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:1});p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+require('path').resolve('dist/teile-test.html'));await sleep(1000);await p.evaluate(()=>{window.__hb.lvl(0);window.__hb.close()});await sleep(300);
 const q=POS[d%4];await p.evaluate((v,q)=>{HBR.setCK(v.ck);return window.__hb.dbgCork(q[0],q[1],q[2],1)},v,q);
 if(d===4)await p.evaluate(()=>window.__hb.dbgAt(.5));await sleep(900);const u=await p.evaluate(()=>window.__hb.dbgCrop(170,150));shots.push(Buffer.from(u.split(',')[1],'base64'));await p.close()}}
const S=170*2,cv=createCanvas(5*S+40,VAR.length*(S*150/170+30)),g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,cv.width,cv.height);g.font='bold 22px sans-serif';g.fillStyle='#222';
for(let k=0;k<shots.length;k++){const im=await loadImage(shots[k]);const r=Math.floor(k/5),c=k%5;if(c===0)g.fillText(VAR[r].name,8,r*(S*150/170+30)+22);g.imageSmoothingEnabled=false;g.drawImage(im,c*(S+8),r*(S*150/170+30)+28,S,S*150/170)}
fs.writeFileSync(out,cv.toBuffer('image/png'));console.log('errors',errs.join('|')||'none');await b.close()})();
