const {makeLevel}=require('./gen2.js');const fs=require('fs');
const out=JSON.parse(fs.readFileSync('pool.json'));const seen=new Set(out.map(e=>JSON.stringify([e.b,e.i])));
const sp={min:11,max:16,groups:[['teens'],['fans']],loop:'allow',extras:1,pond:[4,6],maxSol:25,budget:25000};
let seed=70000,n=0;const tl=Date.now();
while(n<18&&Date.now()-tl<130000){const l=makeLevel(sp,seed++);if(!l)continue;const k=JSON.stringify([l.blocked,l.inv]);if(seen.has(k))continue;seen.add(k);n++;out.push({b:l.blocked,i:l.inv,g:l.groups,p:l.par,d:2});fs.writeFileSync('pool.json',JSON.stringify(out))}
console.log('added',n,'total',out.length)
