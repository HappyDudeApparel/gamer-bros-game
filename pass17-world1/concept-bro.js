export function createConceptBro(THREE, renderer, options={}){
  const cfg={colorway:'teal',detail:'high',height:2.62,...options};
  const low=cfg.detail==='low';
  const pink=cfg.colorway==='pink';
  const C={shirt:pink?0xef3f9d:0x20c7d4,shirtHi:pink?0xff78c5:0x67eff2,accent:pink?0x26d6e0:0xff4dac,skin:0xf4bd86,hair:0xf2bd52,hairHi:0xffdd78,dark:0x192333,sole:0xf5f7fb,cup:0x1dc8df,cup2:0xf48f35,lens:0xff43b8};
  const root=new THREE.Group();root.name=pink?'GB1-concept-bro':'GB2-concept-bro';
  const all=[];const lights=[];let motion='idle',actionActive=false,actionBlend=0,roomLight=1;const home={x:0,z:0,ry:0};
  const mat=(color,o={})=>new THREE.MeshStandardMaterial({color,roughness:o.roughness??.48,metalness:o.metalness??0,emissive:o.emissive??0x000000,emissiveIntensity:o.emissiveIntensity??0});
  const M={skin:mat(C.skin,{roughness:.68}),hair:mat(C.hair,{roughness:.42}),hairHi:mat(C.hairHi,{roughness:.4}),shirt:mat(C.shirt,{roughness:.5,emissive:C.shirt,emissiveIntensity:.08}),shirtHi:mat(C.shirtHi,{roughness:.45}),dark:mat(C.dark,{roughness:.55}),sole:mat(C.sole,{roughness:.4}),cup:mat(C.cup,{roughness:.34,metalness:.18}),cup2:mat(C.cup2,{roughness:.36}),lens:mat(C.lens,{roughness:.22,metalness:.22,emissive:C.lens,emissiveIntensity:.25}),black:mat(0x091019,{roughness:.35})};
  function mesh(g,m,parent=root){const x=new THREE.Mesh(g,m);x.castShadow=!low;x.receiveShadow=false;parent.add(x);all.push(x);return x}
  const body=new THREE.Group();root.add(body);
  const bob=new THREE.Group();body.add(bob);
  // Big toy head: concept art target is deliberately head-heavy.
  const head=mesh(new THREE.SphereGeometry(.61,low?22:34,low?16:24),M.skin,bob);head.scale.set(1.02,.96,.94);head.position.y=1.77;
  // Ears.
  for(const s of [-1,1]){const e=mesh(new THREE.SphereGeometry(.115,16,10),M.skin,bob);e.scale.set(.62,1,.48);e.position.set(s*.59,1.78,0)}
  // Hair cap + chunky swept spikes.
  const cap=mesh(new THREE.SphereGeometry(.625,low?20:30,12,0,Math.PI*2,0,Math.PI*.52),M.hair,bob);cap.position.y=1.95;cap.scale.set(1.01,.72,.96);
  const hairGroup=new THREE.Group();bob.add(hairGroup);hairGroup.position.y=1.96;
  const spikeGeom=new THREE.ConeGeometry(.15,.55,low?6:9);
  const spikes=[[-.34,.20,.02,-.55],[-.16,.34,.02,-.28],[.02,.38,.01,-.05],[.19,.33,.00,.24],[.34,.21,.00,.50],[-.43,.03,.02,-.85]];
  for(const [x,y,z,rz] of spikes){const s=mesh(spikeGeom,Math.abs(x)<.15?M.hairHi:M.hair,hairGroup);s.position.set(x,y,z);s.rotation.z=rz;s.rotation.x=-.10}
  // Visor gives the concept silhouette a strong gamer read without hiding the face completely.
  const visor=mesh(new THREE.BoxGeometry(.86,.23,.12),M.lens,bob);visor.position.set(0,1.84,.54);visor.geometry.translate(0,0,0);visor.scale.x=1.0;
  for(const s of [-1,1]){const hinge=mesh(new THREE.CylinderGeometry(.08,.08,.13,14),M.black,bob);hinge.rotation.z=Math.PI/2;hinge.position.set(s*.48,1.84,.49)}
  // Headphones: oversized cyan cups + orange rings, strongly matching concept.
  for(const s of [-1,1]){const cupG=new THREE.Group();bob.add(cupG);cupG.position.set(s*.655,1.82,0);const c=mesh(new THREE.CylinderGeometry(.16,.16,.17,low?14:22),M.cup,cupG);c.rotation.z=Math.PI/2;const r=mesh(new THREE.TorusGeometry(.17,.035,8,18),M.cup2,cupG);r.rotation.y=Math.PI/2;const pad=mesh(new THREE.CylinderGeometry(.105,.105,.185,14),M.dark,cupG);pad.rotation.z=Math.PI/2;pad.position.x=-s*.045}
  const band=mesh(new THREE.TorusGeometry(.63,.045,8,low?24:36,Math.PI),M.dark,bob);band.rotation.z=Math.PI;band.position.y=1.99;band.rotation.x=Math.PI/2;
  // Rounded torso.
  const shirt=mesh(new THREE.SphereGeometry(.49,low?20:30,low?14:20),M.shirt,bob);shirt.scale.set(1,.78,.78);shirt.position.y=.93;
  const waist=mesh(new THREE.CylinderGeometry(.39,.42,.30,low?18:28),M.dark,bob);waist.position.y=.58;
  // GB chest badge as actual geometry, phone-readable.
  const badge=new THREE.Group();bob.add(badge);badge.position.set(0,1.01,.405);const badgePlate=mesh(new THREE.BoxGeometry(.34,.16,.025),M.sole,badge);const gbar=mesh(new THREE.BoxGeometry(.11,.035,.014),M.shirt,badge);gbar.position.set(-.075,.015,.021);const gbar2=mesh(new THREE.BoxGeometry(.035,.10,.014),M.shirt,badge);gbar2.position.set(-.11,0,.021);const b1=mesh(new THREE.BoxGeometry(.035,.11,.014),M.shirt,badge);b1.position.set(.045,0,.021);const b2=mesh(new THREE.BoxGeometry(.095,.035,.014),M.shirt,badge);b2.position.set(.082,.035,.021);const b3=b2.clone();b3.position.y=-.035;badge.add(b3);all.push(b3);
  // Arms.
  const armL=new THREE.Group(),armR=new THREE.Group();bob.add(armL,armR);armL.position.set(-.49,1.03,0);armR.position.set(.49,1.03,0);
  function arm(group,side){const sleeve=mesh(new THREE.CapsuleGeometry(.125,.22,5,10),M.shirt,group);sleeve.rotation.z=side*.12;const hand=mesh(new THREE.SphereGeometry(.135,14,10),M.skin,group);hand.position.y=-.26;return{group,sleeve,hand}}
  const A1=arm(armL,-1),A2=arm(armR,1);
  // Legs + chunky sneakers.
  const legs=[];for(const s of [-1,1]){const p=new THREE.Group();bob.add(p);p.position.set(s*.20,.48,0);const leg=mesh(new THREE.CapsuleGeometry(.105,.22,4,10),M.dark,p);leg.position.y=-.18;const shoeG=new THREE.Group();p.add(shoeG);shoeG.position.set(0,-.42,.08);const upper=mesh(new THREE.BoxGeometry(.34,.20,.47),M.shirt,shoeG);upper.geometry.translate(0,0,.04);const toe=mesh(new THREE.SphereGeometry(.18,16,10),M.shirtHi,shoeG);toe.scale.set(.95,.62,1.25);toe.position.z=.21;const sole=mesh(new THREE.BoxGeometry(.37,.07,.52),M.sole,shoeG);sole.position.y=-.125;sole.position.z=.05;legs.push({p,shoeG})}
  // Controller / power emitter preserved for Prism Breaker.
  const controllerGroup=new THREE.Group();bob.add(controllerGroup);controllerGroup.position.set(0,.93,.48);const controller=mesh(new THREE.BoxGeometry(.35,.11,.20),M.dark,controllerGroup);controller.scale.x=1.15;for(const s of [-1,1]){const grip=mesh(new THREE.SphereGeometry(.10,12,8),M.black,controllerGroup);grip.position.set(s*.19,-.065,.02)}const controllerEmitter=new THREE.Object3D();controllerEmitter.position.set(0,.02,.24);controllerGroup.add(controllerEmitter);controllerGroup.visible=false;
  // Subtle character rim lights, reduced on mobile by caller detail selection.
  const rim1=new THREE.PointLight(C.shirt,.55,4,2),rim2=new THREE.PointLight(0x5eeaff,.32,4,2);rim1.position.set(-1.2,1.7,-.8);rim2.position.set(1.2,1.4,-.5);root.add(rim1,rim2);lights.push(rim1,rim2);
  function setMotion(m){motion=['idle','walk','run'].includes(m)?m:'idle';return motion}
  function setHome(x,z,ry=0){home.x=x;home.z=z;home.ry=ry;root.position.x=x;root.position.z=z;root.rotation.y=ry}
  function setAction(v){actionActive=!!v;return actionActive}
  function setRoomLight(v){roomLight=v??1;return roomLight}
  function update(t,dt,fx=0){const walk=motion==='walk',run=motion==='run',move=walk?.62:run?1:0,cy=t*(run?7:walk?4.4:1.5),step=Math.sin(cy),breath=Math.sin(t*2);actionBlend+=((actionActive?1:0)-actionBlend)*Math.min(1,dt*10);bob.position.y=(move?Math.abs(step)*.045:breath*.014);bob.rotation.z=Math.sin(cy*.5)*.018*move;head.rotation.y=Math.sin(t*.6)*.025;hairGroup.rotation.z=Math.sin(t*1.4)*.015+step*.02*move;armL.rotation.x=THREE.MathUtils.lerp(step*.55*move,-1.08,actionBlend);armR.rotation.x=THREE.MathUtils.lerp(-step*.55*move,-1.08,actionBlend);armL.rotation.z=THREE.MathUtils.lerp(.08,.66,actionBlend);armR.rotation.z=THREE.MathUtils.lerp(-.08,-.66,actionBlend);legs[0].p.rotation.x=-step*.65*move;legs[1].p.rotation.x=step*.65*move;legs[0].shoeG.position.y=-.42+Math.max(0,-step)*.09*move;legs[1].shoeG.position.y=-.42+Math.max(0,step)*.09*move;controllerGroup.visible=actionBlend>.03;controllerGroup.scale.setScalar(.92+.08*actionBlend);M.lens.emissiveIntensity=.22+.10*Math.sin(t*2.2)+fx*.18;M.shirt.emissiveIntensity=.06+.05*fx;rim1.intensity=(.42+.20*fx)*roomLight;rim2.intensity=.28*roomLight;root.position.x=home.x;root.position.z=home.z;root.rotation.y=home.ry}
  // Normalize to requested overall height.
  root.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(root);const h=Math.max(.001,box.max.y-box.min.y);root.scale.setScalar(cfg.height/h);
  return{root,body,head,all,lights,materials:M,get motion(){return motion},setMotion,setHome,setAction,get action(){return actionActive},setRoomLight,setVisible(v){root.visible=v},controllerGroup,controllerEmitter,update};
}
