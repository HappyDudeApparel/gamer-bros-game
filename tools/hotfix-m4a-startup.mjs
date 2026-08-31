import fs from 'node:fs';

const gamePath='hybrid-v09/src/game.js';
let s=fs.readFileSync(gamePath,'utf8');
const start='    // ------------------------------------------------------------\n    // M4A DATA-DRIVEN VERTICAL ARENA BLOCKOUT';
const end='    // One-time environment capture. NO periodic CubeCamera renders.';
const i=s.indexOf(start),j=s.indexOf(end);
if(i<0||j<0||j<=i) throw new Error('Hybrid M4A block markers not found');
const replacement=`    // ------------------------------------------------------------\n    // CRYSTAL LIBRARY v2 — authored room/gallery environment\n    // Visible architecture lives in crystal-library-v2.js; analytic collision stays here.\n    // ------------------------------------------------------------\n    ext.clear();\n    walkSurfaces.length=0;\n    const arenaLayout=await fetch(new URL('../arena.layout.json',import.meta.url),{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('Crystal Library layout '+r.status);return r.json();});\n    const {buildCrystalLibraryV2}=await import('./crystal-library-v2.js?v=clv21');\n    const crystalLibrary=buildCrystalLibraryV2({THREE,scene,parent:ext,layout:arenaLayout,mobile,resolvedQuality,addRectSurface,addDiscSurface,addRampSurface,glowTex});\n    const arenaRoot=crystalLibrary.root;\n\n`;
s=s.slice(0,i)+replacement+s.slice(j);
fs.writeFileSync(gamePath,s);

const indexPath='hybrid-v09/index.html';
let html=fs.readFileSync(indexPath,'utf8');
if(!html.includes('<script type="importmap">')){
  html=html.replace('</head>',`<script type="importmap">\n{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/"}}\n</script>\n</head>`);
}
html=html.replaceAll('M4A Vertical Arena','Crystal Library v2');
html=html.replaceAll('M4A VERTICAL ARENA','CRYSTAL LIBRARY v2');
html=html.replace('Loading the clean portal timeline and new five-tier vertical arena foundation.','Loading the authored Crystal Library, connected stair routes, shelves and crystal vaults.');
html=html.replace(/\.\/src\/game\.js\?v=[^\"']+/,'./src/game.js?v=090clv21');
fs.writeFileSync(indexPath,html);

console.log('Replaced rejected M4A block with Crystal Library v2');
