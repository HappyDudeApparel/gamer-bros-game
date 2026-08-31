import fs from 'node:fs';
const p='playcanvas-v1/main.js';
let s=fs.readFileSync(p,'utf8');
function swap(a,b,label){if(!s.includes(a))throw new Error('Missing '+label);s=s.replace(a,b);}
swap("for(let z=-30;z<=30;z+=10){const arch=torus('vault rib',0,18,z,24,12,24,MAT.trim);arch.setEulerAngles(90,0,0);}",`for(let z=-30;z<=30;z+=10){
  const pts=[];for(let i=0;i<=12;i++){const x=-23+i*(46/12),y=10.4+9.2*(1-Math.pow(x/23,2));pts.push({x,y});}
  for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),q=box('vault rib',(a.x+b.x)/2,(a.y+b.y)/2,z,len,.24,.28,MAT.trim);q.setEulerAngles(0,0,Math.atan2(dy,dx)*180/Math.PI);}
}`,'vault ribs');
swap("island('entry',0,4,32,11,8,MAT.stone2);","island('entry',0,4,32,9,6.5,MAT.stone2);",'entry landing');
swap("const hero=new pc.Entity('Gamer Bro proxy');app.root.addChild(hero);","const hero=new pc.Entity('Gamer Bro proxy');hero.setLocalScale(.72,.72,.72);app.root.addChild(hero);",'hero scale');
swap("let camYaw=0,camPitch=.19,camDist=11.5,drag=false,lastPX=0,lastPY=0;","let camYaw=0,camPitch=.24,camDist=12.8,drag=false,lastPX=0,lastPY=0;",'camera');
fs.writeFileSync(p,s);
console.log('Refined PlayCanvas v1 opening composition');
