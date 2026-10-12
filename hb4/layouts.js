const DV=[[1,0],[0,1],[-1,0],[0,-1]];
function layout(name,n,s,ret){const deco=[[s[0],s[1]-1],[s[0]+1,s[1]-1],[s[0],s[1]+1],[s[0]+1,s[1]+1]];const r0=ret[0],d=DV[r0[2]];
 return{name,n,station:s,groups:['kids'],blocked:[],deco,gate:[s[0]+1,s[1]+1],ret,target:[r0[0]-d[0],r0[1]-d[1]],inv:{},par:0,theme:'meadow'}}
module.exports={
 P1:layout('P1 Süd-Ost (jetzt)',8,[1,3],[[2,5,2,2],[1,5,2,2],[0,5,2,3],[0,4,3,3],[0,3,3,0]]),
 P2:layout('P2 Nord-Ost',8,[1,4],[[2,1,2,2],[1,1,2,2],[0,1,2,1],[0,2,1,1],[0,3,1,1],[0,4,1,0]]),
 P3:layout('P3 lange Süd-Rückfahrt',8,[1,5],[[5,7,2,2],[4,7,2,2],[3,7,2,2],[2,7,2,2],[1,7,2,2],[0,7,2,3],[0,6,3,3],[0,5,3,0]]),
 P4:layout('P4 großes Brett 9x9',9,[1,4],[[2,6,2,2],[1,6,2,2],[0,6,2,3],[0,5,3,3],[0,4,3,0]]),
 P5:layout('P5 kleines Brett 7x7',7,[1,2],[[2,4,2,2],[1,4,2,2],[0,4,2,3],[0,3,3,3],[0,2,3,0]])
};
