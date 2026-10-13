// prüft: nach dem Wechsel Bauen->Fahrt und Fahrt->Ergebnis klingt nur noch ein Stück (alter Kanal stumm)
const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const HB=require('./logic.js');const LV=JSON.parse(require('fs').readFileSync('levels24.json'));
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--no-sandbox','--autoplay-policy=no-user-gesture-required'],executablePath:await chromium.executablePath(),headless:'shell'});const p=await b.newPage();await p.setViewport({width:390,height:844});const errs=[];p.on('pageerror',e=>errs.push(e.message));
// Analyser hinter dem Musik-Ausgang: misst Pegel; zusätzlich zählen wir die verbundenen Stück-Kanäle
await p.evaluateOnNewDocument(()=>{window.__bus=[];const A=window.AudioContext;window.AudioContext=function(){const c=new A();const g=c.createGain.bind(c);c.createGain=()=>{const x=g();const cn=x.connect.bind(x),dc=x.disconnect.bind(x);x.connect=(d,...r)=>{x.__to=d;return cn(d,...r)};x.disconnect=(...r)=>{x.__off=1;return dc(...r)};window.__bus.push(x);return x};return c}});
await p.goto('file://'+require('path').resolve('../index.html'));await sleep(1000);
await p.evaluate(()=>{window.__hb.lvl(0);window.__hb.close()});await sleep(300);const h=(await p.evaluate(()=>window.__hb.hits())).find(x=>x.id==='snd');await p.mouse.click((h.x+h.w/2)*2,(h.y+h.h/2)*2);await sleep(2500);
const seq=HB.solve(LV[0],50,300000).sols.filter(s=>s.centered)[0].seq;await p.evaluate(q=>window.__hb.place(q),seq);await p.evaluate(()=>window.__hb.go());await sleep(1500);
// Stück-Kanäle = Gains mit gain 1 direkt am Musik-Gain (0.22): aktiv = nicht getrennt und Pegel > 0
const cnt=()=>p.evaluate(()=>{const mus=window.__bus.find(x=>Math.abs(x.gain.value-.22)<1e-6);return window.__bus.filter(x=>x.__to===mus&&!x.__off&&x.gain.value>0.01).length});
console.log('aktive Stück-Kanäle während Fahrt:',await cnt());for(let k=0;k<200;k++){await sleep(300);if(await p.evaluate(()=>window.__hb.get().overlay)==='result')break}await sleep(800);
console.log('aktive Stück-Kanäle nach Fahrt:',await cnt(),JSON.stringify(await p.evaluate(()=>HBS.stats())),'errors',errs.join('|')||'none');await b.close()})();
