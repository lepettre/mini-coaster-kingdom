const {makeLevel}=require('./gen2.js');const fs=require('fs');
const SP=[{min:8,max:12,groups:[['kids'],['fam']],loop:'no',extras:1,pond:[4,6],maxSol:30,budget:20000},{min:10,max:14,groups:[['fam'],['teens']],loop:'allow',extras:1,pond:[4,6],maxSol:12,budget:20000},{min:12,max:17,groups:[['teens'],['fans']],loop:'allow',extras:2,pond:[4,6],maxSol:6,budget:30000}];
const out=[];const seen=new Set();const t0=Date.now();
for(let d=0;d<3;d++){let seed=9000+d*10000,n=0;const tl=Date.now();
  while(n<30&&Date.now()-tl<150000){const l=makeLevel(SP[d],seed++);if(!l)continue;const key=JSON.stringify([l.blocked,l.inv]);if(seen.has(key))continue;seen.add(key);n++;
    out.push({b:l.blocked,i:l.inv,g:l.groups,p:l.par,d});fs.writeFileSync('pool.json',JSON.stringify(out))}
  console.log('diff',d,'n',n,((Date.now()-t0)/1000).toFixed(0)+'s')}
console.log('done',out.length);
