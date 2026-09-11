import * as THREE from 'three';
import {createGamerBro} from './playground-v2/gamer-bro.js?v=pass14';

const HEROES=[
  {id:'gb1',name:'GB1',label:'PINK GAMER BRO',accent:'#ff52c8',colorway:'pink'},
  {id:'gb2',name:'GB2',label:'CYAN GAMER BRO',accent:'#56e9ff',colorway:'teal'}
];
const coarse=matchMedia('(pointer:coarse)').matches;
const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||coarse;
const $=s=>document.querySelector(s);
const canvas=$('#heroCanvas'),stage=$('#heroStage'),heroButtons=$('#heroButtons'),heroName=$('#heroName'),heroLabel=$('#heroLabel'),playBtn=$('#playBtn'),status=$('#previewStatus');
const settingsBtn=$('#settingsBtn'),creditsBtn=$('#creditsBtn'),settingsModal=$('#settingsModal'),creditsModal=$('#creditsModal');
const reduceMotion=$('#reduceMotion'),previewQuality=$('#previewQuality');
let selected=localStorage.getItem('gamerBroCharacter');if(!HEROES.some(h=>h.id===selected))selected='gb2';
let motionReduced=localStorage.getItem('gbReducedMotion')==='1';
let quality=localStorage.getItem('gbPreviewQuality')||'auto';
if(reduceMotion)reduceMotion.checked=motionReduced;if(previewQuality)previewQuality.value=quality;

const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!mobile,powerPreference:'high-performance'});
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.AgXToneMapping;renderer.toneMappingExposure=1.22;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(31,1,.05,80);camera.position.set(0,1.55,6.6);camera.layers.enable(1);
scene.add(new THREE.HemisphereLight(0xeefdff,0x291437,2.5));const key=new THREE.DirectionalLight(0xffffff,3.1);key.position.set(4,7,5);scene.add(key);const cyan=new THREE.DirectionalLight(0x51eaff,2.1);cyan.position.set(-4,4,3);scene.add(cyan);const pink=new THREE.DirectionalLight(0xff55c9,2.0);pink.position.set(4,2,-4);scene.add(pink);
const platform=new THREE.Group();scene.add(platform);const disc=new THREE.Mesh(new THREE.CylinderGeometry(1.55,1.72,.18,64),new THREE.MeshStandardMaterial({color:0x0a1f30,metalness:.72,roughness:.28}));disc.position.y=-.09;platform.add(disc);const ring=new THREE.Mesh(new THREE.TorusGeometry(1.48,.035,10,96),new THREE.MeshBasicMaterial({color:0x56e9ff,transparent:true,opacity:.9}));ring.rotation.x=Math.PI/2;ring.position.y=.015;platform.add(ring);const ring2=new THREE.Mesh(new THREE.TorusGeometry(1.67,.015,8,96),new THREE.MeshBasicMaterial({color:0xff52c8,transparent:true,opacity:.48}));ring2.rotation.x=Math.PI/2;ring2.position.y=-.01;platform.add(ring2);
let current=null,adapter=null,token=0,drag=false,lastX=0,userYaw=0,t=0;
function detail(){if(quality==='low')return'low';if(quality==='high')return'high';return mobile?'low':'high'}
function fit(root,target=3.15){root.updateMatrixWorld(true);let box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3());root.scale.multiplyScalar(target/Math.max(.001,size.y));root.updateMatrixWorld(true);box=new THREE.Box3().setFromObject(root);const c=box.getCenter(new THREE.Vector3());root.position.x-=c.x;root.position.z-=c.z;root.position.y-=box.min.y;root.userData.baseY=root.position.y;return root}
function buildButtons(){heroButtons.replaceChildren();for(const h of HEROES){const b=document.createElement('button');b.className='hero-card';b.dataset.id=h.id;b.style.setProperty('--hero-accent',h.accent);b.innerHTML=`<span class="hero-swatch"></span><span><b>${h.name}</b><small>${h.label}</small></span>`;b.onclick=()=>select(h.id);heroButtons.appendChild(b)}}
async function select(id){const h=HEROES.find(x=>x.id===id)||HEROES[1];selected=h.id;localStorage.setItem('gamerBroCharacter',selected);heroName.textContent=h.name;heroLabel.textContent=h.label;ring.material.color.set(h.accent);heroButtons.querySelectorAll('.hero-card').forEach(b=>b.classList.toggle('active',b.dataset.id===selected));status.textContent='READYING '+h.name+'…';status.classList.remove('hide');const mine=++token;await new Promise(r=>requestAnimationFrame(r));try{const made=createGamerBro(THREE,renderer,{colorway:h.colorway,detail:detail(),height:2.62});made.setMotion('idle');const root=fit(made.root);root.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});if(mine!==token)return;if(current)scene.remove(current);current=root;adapter=made;current.rotation.y=.2;scene.add(current);status.classList.add('hide');window.__titleCharacterReady=selected;window.__playableRoster=HEROES.map(x=>x.id)}catch(err){console.error(err);status.textContent='PREVIEW UNAVAILABLE';}}
function resize(){const r=stage.getBoundingClientRect(),w=Math.max(1,Math.floor(r.width)),h=Math.max(1,Math.floor(r.height));const q=quality==='low'?1:quality==='high'?Math.min(devicePixelRatio||1,1.7):Math.min(devicePixelRatio||1,mobile?1:1.45);renderer.setPixelRatio(q);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(stage);addEventListener('resize',resize,{passive:true});resize();
canvas.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;canvas.setPointerCapture?.(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!drag)return;userYaw+=(e.clientX-lastX)*.008;lastX=e.clientX});canvas.addEventListener('pointerup',()=>drag=false);canvas.addEventListener('pointercancel',()=>drag=false);
playBtn.onclick=()=>{localStorage.setItem('gamerBroCharacter',selected);location.href=`./pass14-level-lab/?hero=${encodeURIComponent(selected)}&v=14.1`};
function open(m){m?.classList.add('show')}function close(m){m?.classList.remove('show')}settingsBtn.onclick=()=>open(settingsModal);creditsBtn.onclick=()=>open(creditsModal);document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>close(b.closest('.gb-modal')));document.querySelectorAll('.gb-modal').forEach(m=>m.addEventListener('pointerdown',e=>{if(e.target===m)close(m)}));
reduceMotion?.addEventListener('change',()=>{motionReduced=reduceMotion.checked;localStorage.setItem('gbReducedMotion',motionReduced?'1':'0')});previewQuality?.addEventListener('change',()=>{quality=previewQuality.value;localStorage.setItem('gbPreviewQuality',quality);resize();select(selected)});
let last=performance.now();function frame(now){requestAnimationFrame(frame);const dt=Math.min(.04,(now-last)/1000);last=now;t+=dt;if(current){adapter?.update(t,dt,0);if(!motionReduced&&!drag)current.rotation.y+=dt*.22;current.rotation.y+=userYaw;userYaw=0;current.position.y=(current.userData.baseY||0)+(motionReduced?0:Math.sin(now*.0017)*.025)}if(!motionReduced){ring.rotation.z+=dt*.18;ring2.rotation.z-=dt*.1}renderer.render(scene,camera)}
buildButtons();select(selected);requestAnimationFrame(frame);window.__titlePass15=true;document.documentElement.dataset.titlePass15='1';
