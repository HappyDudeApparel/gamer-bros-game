// Gamer Bros v0.8.8 scenic recovery pass
// Adds an efficient authored-style tree/foliage/rock layer around the preserved
// v0.8.7 open-world routes without changing movement or collision geometry.
(async()=>{
  const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
  try{
    const THREE=await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js');
    let bro=null,scene=null;
    for(let i=0;i<400;i++){
      bro=window.__bro;scene=bro?.root?.parent;
      if(scene&&document.querySelector('#stage canvas'))break;
      await sleep(25);
    }
    if(!scene||!bro)throw new Error('Scenic pass could not find initialized v0.8.7 scene.');
    if(scene.getObjectByName('V088ScenicRecovery'))return;

    const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||matchMedia('(pointer:coarse)').matches;
    const root=new THREE.Group();root.name='V088ScenicRecovery';scene.add(root);window.__v088Scenic=root;

    let seed=0xC17A5EED;
    const rnd=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};

    const treeSites=[
      [-6.8,.18,6.3,1.05], [7.3,.18,6.0,.94], [-7.4,.18,-6.2,.88], [7.1,.18,-6.6,1.08],
      [-20.2,.18,4.7,1.04],[-20.8,.18,-4.2,.88],[-16.2,.18,4.8,.78],[20.4,.18,4.4,.98],[20.7,.18,-4.5,.85],[16.1,.18,-4.7,.76],
      [-4.8,.18,-18.7,.88],[4.9,.18,-19.0,.92],
      [-12.4,2.27,35.7,.90],[-12.1,2.27,41.0,1.05],[12.2,2.27,35.8,.97],[12.3,2.27,41.1,.86],
      [-13.6,3.78,52.2,1.05],[-13.1,3.78,57.7,.90],[13.4,3.78,52.4,.96],[13.2,3.78,57.8,1.08],
      [-8.3,4.12,69.0,1.08],[8.3,4.12,69.1,.98],[-7.7,4.12,75.0,.88],[7.9,4.12,75.2,1.03]
    ];
    if(mobile)treeSites.splice(18,6);

    const trunkMat=new THREE.MeshPhysicalMaterial({color:0x714126,roughness:.91,metalness:0,clearcoat:.04});
    const branchMat=new THREE.MeshPhysicalMaterial({color:0x815034,roughness:.94,metalness:0});
    const leafMat=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.82,metalness:0,clearcoat:.05,vertexColors:true});
    const trunkGeo=new THREE.CylinderGeometry(.34,.55,4.25,9,2);
    const branchGeo=new THREE.CylinderGeometry(.12,.20,2.15,7,1);
    const leafGeo=new THREE.IcosahedronGeometry(1.13,mobile?1:2);
    const trunks=new THREE.InstancedMesh(trunkGeo,trunkMat,treeSites.length);
    const branches=new THREE.InstancedMesh(branchGeo,branchMat,treeSites.length*2);
    const leaves=new THREE.InstancedMesh(leafGeo,leafMat,treeSites.length*5);
    trunks.name='V088TreeTrunks';branches.name='V088TreeBranches';leaves.name='V088TreeCanopies';
    trunks.castShadow=!mobile;trunks.receiveShadow=true;branches.castShadow=!mobile;branches.receiveShadow=true;leaves.castShadow=!mobile;leaves.receiveShadow=true;
    root.add(trunks,branches,leaves);

    const dummy=new THREE.Object3D();
    const up=new THREE.Vector3(0,1,0),dir=new THREE.Vector3();
    const colour=new THREE.Color();let bi=0,li=0;
    treeSites.forEach(([x,y,z,s],i)=>{
      const ry=rnd()*Math.PI*2,lean=(rnd()-.5)*.08;
      dummy.position.set(x,y+2.05*s,z);dummy.rotation.set(lean,ry,(rnd()-.5)*.055);dummy.scale.set(s*(.86+rnd()*.20),s,s*(.86+rnd()*.20));dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);

      for(let b=0;b<2;b++){
        const a=ry+(b?2.35:-1.05)+(rnd()-.5)*.45;
        const base=new THREE.Vector3(x,y+(2.75+b*.42)*s,z);
        dir.set(Math.cos(a)*1.35,.81+rnd()*.27,Math.sin(a)*1.35).normalize();
        dummy.position.copy(base).addScaledVector(dir,.88*s);
        dummy.quaternion.setFromUnitVectors(up,dir);dummy.scale.set(s*(.82+rnd()*.18),s*(.82+rnd()*.20),s*(.82+rnd()*.18));dummy.updateMatrix();branches.setMatrixAt(bi++,dummy.matrix);
      }

      const autumn=(i%7===0)||(z>66&&i%3===0);
      const red=(i%11===0);
      const palette=red?[[.01,.76,.42],[.04,.72,.38],[.08,.68,.40]]:autumn?[[.08,.76,.50],[.12,.78,.50],[.04,.70,.48]]:[[.27,.48,.35],[.29,.52,.32],[.24,.44,.31],[.31,.55,.37]];
      const clusters=[
        [0,4.55,0,1.34],[-.92,4.12,.12,1.00],[.92,4.18,.08,1.03],[-.16,5.22,-.18,.91],[.18,4.42,-.92,.86]
      ];
      clusters.forEach((c,j)=>{
        dummy.position.set(x+c[0]*s,y+c[1]*s,z+c[2]*s);dummy.rotation.set(rnd()*.22,rnd()*Math.PI*2,rnd()*.16);dummy.scale.set(c[3]*s*(.86+rnd()*.22),c[3]*s*(.82+rnd()*.25),c[3]*s*(.86+rnd()*.20));dummy.updateMatrix();leaves.setMatrixAt(li,dummy.matrix);
        const p=palette[(i+j)%palette.length];colour.setHSL(p[0],p[1],p[2]+(rnd()-.5)*.045);leaves.setColorAt(li,colour);li++;
      });
    });
    trunks.instanceMatrix.needsUpdate=true;branches.instanceMatrix.needsUpdate=true;leaves.instanceMatrix.needsUpdate=true;if(leaves.instanceColor)leaves.instanceColor.needsUpdate=true;

    const bushCount=mobile?38:68;
    const bushGeo=new THREE.IcosahedronGeometry(.48,1);
    const bushMat=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.9,clearcoat:.03,vertexColors:true});
    const bushes=new THREE.InstancedMesh(bushGeo,bushMat,bushCount);bushes.name='V088Bushes';bushes.castShadow=false;bushes.receiveShadow=true;root.add(bushes);
    const zones=[[-7,0,8,.18],[-19,0,5,.18],[19,0,5,.18],[0,-19,5,.18],[-10,38,5,2.27],[10,38,5,2.27],[-11,55,5,3.78],[11,55,5,3.78],[0,72,7,4.12]];
    for(let i=0;i<bushCount;i++){
      const q=zones[i%zones.length],a=rnd()*Math.PI*2,r=1.8+rnd()*q[2],x=q[0]+Math.cos(a)*r,z=q[1]+Math.sin(a)*r,s=.65+rnd()*.75;
      dummy.position.set(x,q[3]+.27*s,z);dummy.rotation.set(rnd()*.25,rnd()*Math.PI*2,rnd()*.18);dummy.scale.set(s*(1+rnd()*.4),s,s*(.82+rnd()*.4));dummy.updateMatrix();bushes.setMatrixAt(i,dummy.matrix);colour.setHSL(.25+rnd()*.08,.48+rnd()*.20,.29+rnd()*.08);bushes.setColorAt(i,colour);
    }
    bushes.instanceMatrix.needsUpdate=true;if(bushes.instanceColor)bushes.instanceColor.needsUpdate=true;

    const rockCount=mobile?28:48;
    const rockGeo=new THREE.DodecahedronGeometry(.58,0);
    const rockMat=new THREE.MeshPhysicalMaterial({color:0x777783,roughness:.95,metalness:.01,clearcoat:.02});
    const rocks=new THREE.InstancedMesh(rockGeo,rockMat,rockCount);rocks.name='V088Rocks';rocks.castShadow=!mobile;rocks.receiveShadow=true;root.add(rocks);
    for(let i=0;i<rockCount;i++){
      const q=zones[(i*5)%zones.length],a=rnd()*Math.PI*2,r=2.3+rnd()*(q[2]+1.5),s=.34+rnd()*.92;
      dummy.position.set(q[0]+Math.cos(a)*r,q[3]+.24*s,q[1]+Math.sin(a)*r);dummy.rotation.set(rnd()*.65,rnd()*Math.PI*2,rnd()*.55);dummy.scale.set(s*(.9+rnd()*.65),s*(.55+rnd()*.45),s*(.82+rnd()*.55));dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);
    }
    rocks.instanceMatrix.needsUpdate=true;

    const moteCount=mobile?34:72;
    const motePos=new Float32Array(moteCount*3);
    for(let i=0;i<moteCount;i++){
      const zone=i<moteCount*.45?[0,72,4.1]:i<moteCount*.72?[0,55,3.8]:[0,38,2.3];
      const a=rnd()*Math.PI*2,r=1.8+rnd()*8;motePos[i*3]=zone[0]+Math.cos(a)*r;motePos[i*3+1]=zone[2]+.7+rnd()*4.6;motePos[i*3+2]=zone[1]+Math.sin(a)*r;
    }
    const moteGeo=new THREE.BufferGeometry();moteGeo.setAttribute('position',new THREE.BufferAttribute(motePos,3));
    const moteMat=new THREE.PointsMaterial({color:0xcba2ff,size:mobile?.055:.07,transparent:true,opacity:.48,depthWrite:false,blending:THREE.AdditiveBlending});
    const motes=new THREE.Points(moteGeo,moteMat);motes.name='V088MagicMotes';root.add(motes);

    const accents=[[0,4.8,72,0x8d5cff,4.4,16],[-10,3.7,55,0xff9a4a,2.6,10],[10,3.7,55,0x51d8ff,2.7,10]];
    accents.forEach(([x,y,z,c,intensity,distance])=>{const l=new THREE.PointLight(c,intensity,distance,2);l.position.set(x,y,z);root.add(l);});

    let raf=0;
    const animate=(now)=>{
      if(!root.parent){cancelAnimationFrame(raf);return;}
      const t=now*.001;moteMat.opacity=.36+.16*(.5+.5*Math.sin(t*1.7));motes.rotation.y=Math.sin(t*.08)*.05;
      raf=requestAnimationFrame(animate);
    };raf=requestAnimationFrame(animate);

    document.body.classList.add('v088ScenicReady');
    console.info('[v0.8.8] Scenic recovery pass ready:',treeSites.length,'trees,',bushCount,'bushes,',rockCount,'rocks.');
  }catch(err){console.error('[v0.8.8 scenic recovery]',err);}
})();
