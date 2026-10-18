// Speichert in levels24.json je Level bis zu 30 Drei-Sterne-Lösungen (Feld sols), kürzeste zuerst.
// Der Tipp-Knopf nutzt sie zuerst: passt die bisherige Strecke zu einer, kommt das nächste Teil sofort.
// Nach jeder Leveländerung ausführen: node addsols.js
const HB=require('./logic.js');const fs=require('fs');const LV=JSON.parse(fs.readFileSync('levels24.json'));
LV.forEach(l=>{const r=HB.solve(l,400,600000),c=r.sols.filter(s=>s.centered&&s.placed<=l.par+3).sort((a,b)=>a.placed-b.placed);l.sols=c.slice(0,30).map(s=>s.seq);console.log(l.id,'gespeichert',l.sols.length,'von',c.length)});
fs.writeFileSync('levels24.json',JSON.stringify(LV));
