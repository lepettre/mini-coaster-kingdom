const {makeLevel}=require('./gen2.js');const fs=require('fs');
const S=(g,min,max,maxSol,o={})=>Object.assign({min,max,groups:[g],loop:'allow',extras:1,pond:[4,6],maxSol,budget:30000},o);
const CH=[
 {theme:'meadow',style:'B1',name:'Wiese',cols:['red','blue','green'],lv:[null,null,null,S(['kids'],9,12,14,{loop:'no'}),S(['fam'],9,13,12),S(['teens'],11,15,12)]},
 {theme:'winter',style:'A2',name:'Winter',cols:['blue'],lv:[S(['kids'],9,12,22,{loop:'no'}),S(['fam'],9,13,18),S(['teens'],12,15,10),S(['kids'],9,12,30,{extras:2,loop:'no'}),S(['fam'],10,14,10,{extras:2}),S(['teens'],13,16,8,{extras:2})]},
 {theme:'desert',style:'D1',name:'Wüste',cols:['orange'],lv:[S(['fam'],10,14,14,{extras:2}),S(['teens'],12,16,12,{extras:2}),S(['fans'],12,18,60,{loop:'must',budget:80000}),S(['kids'],9,12,20,{extras:1,loop:'no'}),S(['fans'],13,19,40,{loop:'must',budget:80000}),S(['teens'],13,17,8,{extras:2})]},
 {theme:'coast',style:'C1',name:'Küste',cols:['green'],lv:[S(['fam'],9,13,30,{extras:1}),S(['teens'],13,17,10,{extras:2}),S(['fans'],13,19,30,{loop:'must',budget:80000}),S(['kids'],9,12,16,{extras:1,loop:'no'}),S(['fans'],13,20,60,{loop:'must',budget:80000}),S(['fans'],14,22,60,{loop:'must',budget:120000})]}];
const NAMES=[['Erste Fahrt','Familientag','Für Mutige','Sanfter Hügel','Picknick-Runde','Wilde Wiese'],['Schneeglöckchen','Eisfamilie','Frostbiss','Rodelbahn','Winterzauber','Nordlicht'],['Fata Morgana','Kamelritt','Sandsturm','Oase','Wüstenblitz','Skorpion'],['Zypressenweg','Hafenblick','Olivenhain','Bergdorf','Sonnenuntergang','Meisterstück']];
let out=[];try{out=JSON.parse(fs.readFileSync('levels24.json'))}catch(e){}const have=new Set(out.map(l=>l.id));const t0=Date.now();
const BASE=JSON.parse(fs.readFileSync('level1.json'));
const old=JSON.parse(fs.readFileSync('levels.json'));
CH.forEach((c,ci)=>c.lv.forEach((spec,li)=>{
  const id='k'+(ci+1)+'-'+(li+1);let lvl=null;if(have.has(id))return;
  if(!spec){lvl=Object.assign({},old[li],{id})}
  else{let sp=Object.assign({},spec),seed=ci*1000+li*100+1,tries=0;const tl=Date.now();
    while(!lvl&&Date.now()-tl<70000){lvl=makeLevel(sp,seed++);tries++;if(!lvl&&tries%12===0){sp.maxSol=Math.round(sp.maxSol*1.5)+1;sp.max+=1}}
    if(!lvl){console.log('FAIL',id);return}
    lvl=Object.assign({},BASE,lvl,{id,name:NAMES[ci][li]})}
  lvl.name=NAMES[ci][li];lvl.theme=c.theme;lvl.style=c.style;lvl.trackCol=c.cols[li%c.cols.length];lvl.chapter=ci+1;
  delete lvl._ex;out.push(lvl);
  console.log(id,lvl.groups.join('+'),'par',lvl.par,'sol',lvl._n,JSON.stringify(lvl.inv),((Date.now()-t0)/1000).toFixed(0)+'s');
  fs.writeFileSync('levels24.json',JSON.stringify(out.map(l=>{const o=Object.assign({},l);delete o._n;return o})))}));
console.log('done',out.length);
