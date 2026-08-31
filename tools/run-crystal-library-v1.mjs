import fs from 'node:fs';
await import('./build-crystal-library-v1.mjs');
const path='hybrid-v09/src/game.js';
let s=fs.readFileSync(path,'utf8');
s=s.replace('for(let row=0;row<3;row++)for(let col=0;col++){','for(let row=0;row<3;row++)for(let col=0;col<4;col++){');
fs.writeFileSync(path,s);
console.log('Repaired Crystal Library puzzle-block loop');
