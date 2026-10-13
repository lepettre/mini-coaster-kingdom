// Ton prüfen: Hörprobe als WAV rendern (out/hoerprobe.wav) und im Spiel Ton einschalten + eine Fahrt mit Geräuschen
const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');const puppeteer=require('puppeteer-core');const fs=require('fs');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const HB=require('./logic.js');const LV=JSON.parse(fs.readFileSync('levels24.json'));
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--no-sandbox','--autoplay-policy=no-user-gesture-required'],executablePath:await chromium.executablePath(),headless:'shell'});
 const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:1});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file://'+require('path').resolve('../index.html'));await sleep(1000);const ev=(f,...a)=>p.evaluate(f,...a);
 // 1) Hörprobe offline rendern
 const wav=await ev(async()=>{const sr=22050,len=60,oc=new OfflineAudioContext(1,sr*len,sr);const save=window.HBS;const end=HBS.demo(oc);const buf=await oc.startRendering();const d=buf.getChannelData(0),n=Math.min(d.length,Math.ceil(end*sr)+sr);let peak=0;for(let i=0;i<n;i++)peak=Math.max(peak,Math.abs(d[i]));
   const out=new DataView(new ArrayBuffer(44+n*2));const w=(o,s)=>{for(let i=0;i<s.length;i++)out.setUint8(o+i,s.charCodeAt(i))};w(0,'RIFF');out.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');out.setUint32(16,16,true);out.setUint16(20,1,true);out.setUint16(22,1,true);out.setUint32(24,sr,true);out.setUint32(28,sr*2,true);out.setUint16(32,2,true);out.setUint16(34,16,true);w(36,'data');out.setUint32(40,n*2,true);
   const g=peak>0?.9/peak:1;for(let i=0;i<n;i++)out.setInt16(44+i*2,Math.max(-1,Math.min(1,d[i]*g))*32767,true);let s='';const u=new Uint8Array(out.buffer);for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return{b64:btoa(s),sec:n/sr,peak}});
 fs.writeFileSync('out/hoerprobe.wav',Buffer.from(wav.b64,'base64'));console.log('Hörprobe',wav.sec.toFixed(1),'s, Spitze',wav.peak.toFixed(2));
 // 2) im Spiel: Seite neu laden (HBS wurde von der Hörprobe umgehängt), Ton per Knopf an, Level 3-2 (Korkenzieher) fahren
 await p.reload();await sleep(1000);await ev(()=>{window.__hb.lvl(13);window.__hb.close()});await sleep(400);
 const h=(await ev(()=>window.__hb.hits())).find(x=>x.id==='snd');await p.mouse.click((h.x+h.w/2)*2,(h.y+h.h/2)*2);await sleep(400);
 const s1=await ev(()=>({on:HBS.isOn(),st:HBS.stats()}));const seq=HB.solve(LV[13],50,400000).sols.filter(s=>s.centered)[0].seq;await ev(q=>window.__hb.place(q),seq);await ev(()=>window.__hb.go());
 for(let k=0;k<200;k++){await sleep(300);if(await ev(()=>window.__hb.get().overlay)==='result')break}const s2=await ev(()=>({st:HBS.stats(),res:window.__hb.get().result&&window.__hb.get().result.st,saved:JSON.parse(localStorage.getItem('hb4')).snd}));
 console.log('Ton an',JSON.stringify(s1),'nach Fahrt',JSON.stringify(s2),'errors',errs.join('|')||'none');await b.close();if(!s1.on||errs.length)process.exit(1)})();
