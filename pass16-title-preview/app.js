import * as THREE from 'three';
import {createGamerBro} from '../playground-v2/gamer-bro.js?v=pass16-title';

const HEROES=[
 {id:'gb1',colorway:'pink',canvas:document.getElementById('gb1Canvas')},
 {id:'gb2',colorway:'teal',canvas:document.getElementById('gb2Canvas')}
];
const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||matchMedia('(pointer:coarse)').matches;
let selected=localStorage.getItem('gamerBroCharacter');if(!HEROES.some(h=>h.id===selected))selected='gb2';
const previews=[],play=document.getElementById('playBtn');
function makePreview(h){
 const renderer=new THREE.WebGLRenderer({canvas:h.canvas,alpha:true,antialias:!mobile,powerPreference:'high-performance'});renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.AgXToneMapping;renderer.toneMappingExposure=1.28;renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1:1.35));
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(30,1,.05,50);camera.position.set(0,1.55,6.0);scene.add(new THREE.HemisphereLight(0xf5fcff,0x25102f,2.7));const key=new THREE.DirectionalLight(0xffffff,3.2);key.position.set(4,6,5);scene.add(key);const accent=new THREE.DirectionalLight(h.id==='gb1'?0xff52c8:0x56e9ff,2.7);accent.position.set(-4,3,3);scene.add(accent);
 const bro=createGamerBro(THREE,renderer,{colorway:h.colorway,detail:mobile?'low':'high',height:2.62});bro.setMotion('idle');const root=bro.root;scene.add(root);root.updateMatrixWorld(true);let box=new THREE.Box3().setFromObject(root),sz=box.getSize(new THREE.Vector3());root.scale.multiplyScalar(3.0/Math.max(.001,sz.y));root.updateMatrixWorld(true);box=new THREE.Box3().setFromObject(root);const c=box.getCenter(new THREE.Vector3());root.position.x-=c.x;root.position.z-=c.z;root.position.y-=box.min.y;root.rotation.y=.15;
 const platform=new THREE.Mesh(new THREE.CylinderGeometry(1.45,1.58,.14,48),new THREE.MeshStandardMaterial({color:0x091925,metalness:.65,roughness:.3}));platform.position.y=-.08;scene.add(platform);const ring=new THREE.Mesh(new THREE.TorusGeometry(1.42,.027,8,64),new THREE.MeshBasicMaterial({color:h.id==='gb1'?0xff52c8:0x56e9ff,transparent:true,opacity:.9}));ring.rotation.x=Math.PI/2;ring.position.y=.01;scene.add(ring);
 function resize(){const r=h.canvas.parentElement.getBoundingClientRect();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix()}resize();new ResizeObserver(resize).observe(h.canvas.parentElement);return{renderer,scene,camera,bro,root,ring};
}
for(const h of HEROES)previews.push(makePreview(h));
function target(){return`../pass16-world1/?hero=${encodeURIComponent(selected)}&v=16`}
function sync(){document.querySelectorAll('.heroWindow').forEach(b=>b.classList.toggle('selected',b.dataset.id===selected));localStorage.setItem('gamerBroCharacter',selected);window.__titleSelectedHero=selected;play.dataset.href=target()}
document.querySelectorAll('.heroWindow').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.id;sync()}));
play.addEventListener('click',()=>{localStorage.setItem('gamerBroCharacter',selected);location.href=target()});
const sm=document.getElementById('settingsModal'),cm=document.getElementById('creditsModal');document.getElementById('settingsBtn').onclick=()=>sm.classList.add('show');document.getElementById('creditsBtn').onclick=()=>cm.classList.add('show');document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('.gb-modal').classList.remove('show'));document.querySelectorAll('.gb-modal').forEach(m=>m.addEventListener('pointerdown',e=>{if(e.target===m)m.classList.remove('show')}));
let last=performance.now(),t=0;function frame(now){requestAnimationFrame(frame);const dt=Math.min(.04,(now-last)/1000);last=now;t+=dt;for(const p of previews){p.bro.update(t,dt,0);p.root.rotation.y=.15+Math.sin(t*.45)*.08;p.root.position.y=Math.sin(t*1.7)*.018;p.ring.rotation.z+=dt*.12;p.renderer.render(p.scene,p.camera)}}
sync();requestAnimationFrame(frame);window.__pass16TitleReady=true;window.__playableRoster=['gb1','gb2'];document.documentElement.dataset.title16='1';
