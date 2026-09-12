// Pass 17 concept-match presentation layer for GB1 / GB2.
// Keeps the proven Gamer Bro rig/motion controller intact and pushes the visible
// silhouette toward the approved Prism Valley V2 concept: compact toy proportions,
// bigger blond hair, oversized headphones and a clean GB back mark.

export function applyPass17ConceptHero(THREE, bro, {heroId='gb2', colorway='teal', mobile=false}={}) {
  if (!bro?.root || !bro?.body || bro.root.userData.pass17ConceptHero) return bro?.root?.userData?.pass17ConceptHeroMeta || null;

  const body=bro.body, all=bro.all||[], M=bro.materials||{};
  const group=new THREE.Group();
  group.name='pass17-concept-hero-shell';
  body.add(group);

  // Compact/chunky toy read. The gameplay root and movement controller stay untouched.
  body.scale.set(1.095,.955,1.055);
  if (bro.head) {
    bro.head.scale.multiply(new THREE.Vector3(1.055,1.035,1.045));
    bro.head.position.y+=.012;
  }

  const hairMat=M.hair || new THREE.MeshStandardMaterial({color:0xf7bf46,roughness:.32,metalness:.02});
  const hairDeep=M.hairDeep || new THREE.MeshStandardMaterial({color:0xc88722,roughness:.44,metalness:.02});
  const cupColor=colorway==='pink'?0x23c9e5:0xff4eaa;
  const cupAccent=colorway==='pink'?0xffa23a:0x42e5ef;
  const cupMat=new THREE.MeshPhysicalMaterial({color:cupColor,roughness:.20,metalness:.34,clearcoat:.78,clearcoatRoughness:.10,envMapIntensity:1.2});
  const accentMat=new THREE.MeshPhysicalMaterial({color:cupAccent,roughness:.24,metalness:.28,clearcoat:.70,clearcoatRoughness:.12});
  const darkMat=new THREE.MeshPhysicalMaterial({color:0x102037,roughness:.26,metalness:.30,clearcoat:.55,clearcoatRoughness:.13});

  function register(o){
    o.traverse?.(m=>{if(!m.isMesh)return;m.castShadow=!mobile;m.receiveShadow=false;m.layers.enable(0);m.layers.enable(1);all.push(m)});
    return o;
  }

  // Chunky crown spikes layered over the authored hair. They are deliberately few and
  // broad so the silhouette reads like the concept instead of becoming noisy/anime-thin.
  function spike(x,y,z,rx,rz,s=1,deep=false){
    const geo=new THREE.ConeGeometry(.145*s,.46*s,7,1,false);
    geo.translate(0,.18*s,0);
    const m=new THREE.Mesh(geo,deep?hairDeep:hairMat);
    m.position.set(x,y,z);m.rotation.set(rx,0,rz);group.add(m);register(m);return m;
  }
  spike(-.08,2.49,.04,-.20,-.18,1.18);
  spike(.17,2.48,.02,-.16,.34,1.05);
  spike(-.28,2.43,.00,-.10,-.56,.96);
  spike(.34,2.42,-.02,-.08,.63,.92);
  spike(-.39,2.34,-.20,.18,-.82,.78,true);
  spike(.42,2.33,-.22,.20,.86,.80,true);
  spike(.02,2.43,-.35,.42,.08,.86,true);

  // Oversized side cups and bright rings are the strongest read in the approved rear view.
  function ear(side){
    const g=new THREE.Group();g.name=`pass17-headphone-${side<0?'left':'right'}`;
    g.position.set(side*.805,1.875,-.018);group.add(g);
    const disk=new THREE.Mesh(new THREE.CylinderGeometry(.238,.238,.135,24,1,false),darkMat);
    disk.rotation.z=Math.PI/2;g.add(disk);
    const face=new THREE.Mesh(new THREE.CylinderGeometry(.205,.205,.148,24,1,false),cupMat);
    face.rotation.z=Math.PI/2;face.position.x=side*.012;g.add(face);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.205,.036,8,28),accentMat);
    ring.rotation.y=Math.PI/2;ring.position.x=side*.080;g.add(ring);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(.072,.072,.17,18),accentMat);
    hub.rotation.z=Math.PI/2;hub.position.x=side*.086;g.add(hub);
    register(g);return g;
  }
  ear(-1);ear(1);

  // A clean rear GB mark matching the concept artwork. Canvas keeps it resolution-independent.
  const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font='900 154px Arial Black, Arial, sans-serif';ctx.lineJoin='round';
  ctx.strokeStyle='rgba(20,24,40,.35)';ctx.lineWidth=18;ctx.strokeText('GB',256,132);
  ctx.fillStyle='#f7fbff';ctx.fillText('GB',256,132);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.needsUpdate=true;
  const badge=new THREE.Mesh(new THREE.PlaneGeometry(.52,.26),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,toneMapped:false}));
  badge.name='pass17-gb-back-mark';badge.position.set(0,1.03,-.575);badge.rotation.y=Math.PI;group.add(badge);register(badge);

  // Small shoulder trim gives GB1/GB2 a cleaner toy-like upper-body read without touching animation.
  const trimMat=M.trim||accentMat;
  for(const side of [-1,1]){
    const trim=new THREE.Mesh(new THREE.SphereGeometry(.095,14,10),trimMat);
    trim.scale.set(1.45,.72,1.05);trim.position.set(side*.55,1.285,.02);group.add(trim);register(trim);
  }

  const meta={
    version:'17-hero-1',heroId,colorway,
    silhouette:'compact-chibi',hairSpikes:7,headphoneCups:2,backMark:true,
    target:'approved-prism-valley-v2-concept'
  };
  bro.root.userData.pass17ConceptHero=group;
  bro.root.userData.pass17ConceptHeroMeta=meta;
  group.userData.pass17ConceptHeroMeta=meta;
  return meta;
}
