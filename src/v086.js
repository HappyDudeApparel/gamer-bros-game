const sleep86 = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js');
    let bro, menu, scene, leafs = [];
    const names = new Set(['BASE','GOLD','GALAXY','GUMMY','HOLOFOIL','GEM']);
    for (let i=0;i<500;i++) {
      bro = window.__bro;
      menu = document.getElementById('gameMenu');
      scene = bro?.root?.parent;
      if (scene) leafs = scene.children.filter(o => names.has(o.userData?.name));
      if (bro && menu && leafs.length === 6) break;
      await sleep86(25);
    }
    if (!bro || !menu || leafs.length !== 6) throw new Error('v0.8.6 could not locate the game/menu/leaf actors.');
    document.body.classList.add('v086');

    // Cleaner player-select cards: the official duo artwork already carries the colour identity.
    menu.querySelectorAll('.heroChoice span').forEach(el => el.remove());
    menu.querySelectorAll('.heroChoice').forEach(el => el.classList.add('noColourLabel'));

    function mapleShape() {
      const pts=[[0,.90],[-.16,.60],[-.36,.73],[-.33,.45],[-.63,.49],[-.45,.23],[-.72,.06],[-.39,-.02],[-.46,-.34],[-.16,-.22],[0,-.63],[.16,-.22],[.46,-.34],[.39,-.02],[.72,.06],[.45,.23],[.63,.49],[.33,.45],[.36,.73],[.16,.60]];
      const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);s.closePath();return s;
    }

    const starts = {
      BASE:     [-4.10,1.30,2.20],
      GOLD:     [ 4.10,1.30,2.00],
      GALAXY:   [ 1.80,1.56,17.20],
      GUMMY:    [-1.70,3.04,24.50],
      HOLOFOIL: [ 2.45,3.31,38.45],
      GEM:      [ 0.00,5.25,72.00]
    };

    const variantStyle = {
      BASE:{color:0xf13a2c,emissive:0x2d0402,metalness:.02,roughness:.28,clearcoat:.72},
      GOLD:{color:0xf2c11e,emissive:0x5a3000,metalness:.88,roughness:.12,clearcoat:.94},
      GALAXY:{color:0x3d2b9e,emissive:0x281a86,metalness:.10,roughness:.20,clearcoat:.82},
      GUMMY:{color:0xff638f,emissive:0x243d20,metalness:.01,roughness:.18,clearcoat:.90},
      HOLOFOIL:{color:0xe7efff,emissive:0x526c91,metalness:.34,roughness:.055,clearcoat:1,iridescence:1,iridescenceIOR:1.35},
      GEM:{color:0xdff5ff,emissive:0x4f799c,metalness:.03,roughness:.045,clearcoat:1,transmission:.34,thickness:.8,ior:1.32}
    };

    const sharedWhite = new THREE.MeshPhysicalMaterial({color:0xfffdf6,roughness:.22,clearcoat:.45,transparent:true,opacity:1});
    const sharedBlack = new THREE.MeshPhysicalMaterial({color:0x090a10,roughness:.32,clearcoat:.32,transparent:true,opacity:1});
    const footMat = new THREE.MeshPhysicalMaterial({color:0x222432,roughness:.48,clearcoat:.25,transparent:true,opacity:1});
    const cheekMat = new THREE.MeshPhysicalMaterial({color:0xffa49d,roughness:.35,clearcoat:.18,transparent:true,opacity:.58});
    const bodyGeo = new THREE.ExtrudeGeometry(mapleShape(),{depth:.56,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.095,bevelThickness:.075});bodyGeo.center();
    const armGeo = new THREE.CapsuleGeometry(.16,.30,6,12);
    const legGeo = new THREE.CapsuleGeometry(.13,.23,5,10);
    const footGeo = new THREE.SphereGeometry(.26,18,12);
    const eyeGeo = new THREE.SphereGeometry(.13,18,12);
    const pupilGeo = new THREE.SphereGeometry(.055,14,10);
    const cheekGeo = new THREE.SphereGeometry(.10,12,8);
    const mouthGeo = new THREE.TorusGeometry(.18,.035,8,24,Math.PI);

    const detailRoots = new Map();
    leafs.forEach(g => {
      const name=g.userData.name, st=starts[name], style=variantStyle[name];
      g.children.forEach(c=>c.visible=false);
      g.userData.start.set(st[0],st[1],st[2]);g.position.copy(g.userData.start);g.userData.hitRadius=1.18;
      const root=new THREE.Group();root.name='v086LeafVisual';g.add(root);detailRoots.set(g,root);
      const mat=new THREE.MeshPhysicalMaterial({
        color:style.color,emissive:style.emissive,emissiveIntensity:name==='GALAXY'?.56:.28,
        metalness:style.metalness,roughness:style.roughness,clearcoat:style.clearcoat,clearcoatRoughness:.08,
        iridescence:style.iridescence||0,iridescenceIOR:style.iridescenceIOR||1.3,transmission:style.transmission||0,
        thickness:style.thickness||0,ior:style.ior||1.3,envMapIntensity:1.35,transparent:true,opacity:1
      });
      const body=new THREE.Mesh(bodyGeo,mat);body.position.set(0,.35,0);body.scale.set(1.02,1.08,1.10);body.castShadow=true;body.receiveShadow=true;root.add(body);
      for(const side of [-1,1]){
        const arm=new THREE.Mesh(armGeo,mat);arm.name=side<0?'armL':'armR';arm.position.set(side*.80,.20,.01);arm.rotation.z=side*.28;arm.scale.set(1.0,1.05,1.0);arm.castShadow=true;root.add(arm);
        const leg=new THREE.Mesh(legGeo,footMat);leg.name=side<0?'legL':'legR';leg.position.set(side*.31,-.77,.02);leg.castShadow=true;root.add(leg);
        const foot=new THREE.Mesh(footGeo,footMat);foot.name=side<0?'footL':'footR';foot.position.set(side*.34,-1.13,.12);foot.scale.set(1.10,.62,1.52);foot.castShadow=true;root.add(foot);
        const eye=new THREE.Mesh(eyeGeo,sharedWhite);eye.position.set(side*.22,.55,.39);eye.scale.set(.82,1.26,.55);root.add(eye);
        const pupil=new THREE.Mesh(pupilGeo,sharedBlack);pupil.position.set(side*.22,.55,.50);pupil.scale.set(.72,1.22,.52);root.add(pupil);
        const cheek=new THREE.Mesh(cheekGeo,cheekMat);cheek.position.set(side*.36,.20,.40);cheek.scale.set(1.15,.72,.40);root.add(cheek);
      }
      const mouth=new THREE.Mesh(mouthGeo,sharedBlack);mouth.position.set(0,.16,.47);mouth.rotation.z=Math.PI;mouth.scale.set(1.15,.78,1);root.add(mouth);
      if(name==='GALAXY'){
        const pts=new Float32Array(54);for(let i=0;i<18;i++){pts[i*3]=(Math.random()-.5)*1.05;pts[i*3+1]=-.20+Math.random()*1.10;pts[i*3+2]=.34+Math.random()*.20;}
        const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pts,3));const pm=new THREE.PointsMaterial({color:0xffffff,size:.032,transparent:true,opacity:.86,blending:THREE.AdditiveBlending,depthWrite:false});root.add(new THREE.Points(pg,pm));
      }
      if(name==='GUMMY'){
        const lower=new THREE.Mesh(new THREE.SphereGeometry(.67,20,12),new THREE.MeshPhysicalMaterial({color:0x4ed461,roughness:.20,clearcoat:.86,transparent:true,opacity:.38}));lower.position.set(0,-.22,-.02);lower.scale.set(1,.54,.62);root.add(lower);
      }
    });

    const actionBtn=document.getElementById('actionTouchBtn');let firing=false;
    actionBtn?.addEventListener('pointerdown',()=>{firing=true;});
    ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>actionBtn?.addEventListener(ev,()=>{firing=false;}));
    addEventListener('keydown',e=>{if(e.key.toLowerCase()==='f')firing=true;},true);
    addEventListener('keyup',e=>{if(e.key.toLowerCase()==='f')firing=false;},true);
    const origin=new THREE.Vector3(),dir=new THREE.Vector3(),to=new THREE.Vector3();
    const scoreValue=document.getElementById('scoreValue'),leafCount=document.getElementById('leafCount');
    function syncScore(){let score=0,caught=0;for(const g of leafs){if(g.userData.dead){score+=g.userData.score||0;caught++;}}if(scoreValue)scoreValue.textContent=String(score);if(leafCount)leafCount.textContent=`${caught} / ${leafs.length}`;}
    document.getElementById('resetBtn')?.addEventListener('click',()=>setTimeout(syncScore,30));

    let last=performance.now();
    function tick(now){
      const dt=Math.min(.05,(now-last)/1000);last=now;const t=now*.001;
      for(const g of leafs){
        const root=detailRoots.get(g);if(!root||g.userData.dead)continue;
        const step=Math.sin(t*4.8+g.userData.seed),step2=Math.sin(t*4.8+g.userData.seed+Math.PI);
        root.position.y=.045*Math.abs(step);
        const legL=root.getObjectByName('legL'),legR=root.getObjectByName('legR'),footL=root.getObjectByName('footL'),footR=root.getObjectByName('footR'),armL=root.getObjectByName('armL'),armR=root.getObjectByName('armR');
        if(legL)legL.rotation.x=.18*step;if(legR)legR.rotation.x=.18*step2;if(footL)footL.position.y=-1.13+.07*Math.max(0,-step);if(footR)footR.position.y=-1.13+.07*Math.max(0,-step2);if(armL)armL.rotation.x=-.14*step;if(armR)armR.rotation.x=-.14*step2;
      }
      if(firing&&!document.body.classList.contains('menuOpen')){
        bro.root.updateMatrixWorld(true);origin.set(0,1.88,.78);bro.root.localToWorld(origin);dir.set(0,0,1).applyQuaternion(bro.root.quaternion).normalize();let best=null,bestAlong=1e9;
        for(const g of leafs){if(!g.visible||g.userData.dead)continue;to.copy(g.position).sub(origin);const along=to.dot(dir);if(along<0||along>34)continue;const perpSq=Math.max(0,to.lengthSq()-along*along),r=g.userData.hitRadius||1.15;if(perpSq<=r*r&&along<bestAlong){best=g;bestAlong=along;}}
        if(best&&!best.userData.dead){best.userData.dead=true;best.userData.deadAt=performance.now();}
      }
      syncScore();requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  } catch(err) { console.error('v0.8.6 enhancement failed:',err); }
})();
