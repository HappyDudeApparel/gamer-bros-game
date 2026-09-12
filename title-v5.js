import * as THREE from 'three';
import {createGamerBro} from './playground-v2/gamer-bro.js?v=pass17-title';

const HEROES=[
 {id:'gb1',colorway:'pink',canvas:document.getElementById('gb1Canvas')},
 {id:'gb2',colorway:'teal',canvas:document.getElementById('gb2Canvas')}
];
const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||matchMedia('(pointer:coarse)').matches;
let selected=localStorage.getItem('gamerBroCharacter');if(!HEROES.some(h=>h.id===selected))selected='gb2';
const previews=[],play=document.getElementById('playBtn');

function makePreview(h){
 const renderer=new THREE.WebGLRenderer({canvas:h.canvas,alpha:true,antialias:!mobile,powerPreference:'high-performance'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.AgXToneMapping;renderer.toneMappingExposure=1.32;renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1:1.35));
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(28,1,.05,50);camera.position.set(0,1.32,7.35);camera.layers.enable(1);
 scene.add(new THREE.HemisphereLight(0xf6fdff,0x25102f,2.9));
 const key=new THREE.DirectionalLight(0xffffff,3.3);key.position.set(4,6,5);scene.add(key);
 const accent=new THREE.DirectionalLight(h.id==='gb1'?0xff52c8:0x56e9ff,2.9);accent.position.set(-4,3,3);scene.add(accent);
 const bro=createGamerBro(THREE,renderer,{colorway:h.colorway,detail:mobile?'low':'high',height:2.62});bro.setMotion('idle');
 const root=bro.root;root.traverse(o=>{o.layers?.enable?.(1)});scene.add(root);root.updateMatrixWorld(true);
 let box=new THREE.Box3().setFromObject(root),sz=box.getSize(new THREE.Vector3());root.scale.multiplyScalar(2.72/Math.max(.001,sz.y));root.updateMatrixWorld(true);box=new THREE.Box3().setFromObject(root);const c=box.getCenter(new THREE.Vector3());root.position.x-=c.x;root.position.z-=c.z;root.position.y-=box.min.y;root.rotation.y=.12;
 const platform=new THREE.Mesh(new THREE.CylinderGeometry(1.32,1.48,.13,48),new THREE.MeshStandardMaterial({color:0x091925,metalness:.68,roughness:.27}));platform.position.y=-.07;scene.add(platform);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(1.30,.025,8,64),new THREE.MeshBasicMaterial({color:h.id==='gb1'?0xff52c8:0x56e9ff,transparent:true,opacity:.95}));ring.rotation.x=Math.PI/2;ring.position.y=.01;scene.add(ring);
 function resize(){const r=h.canvas.parentElement.getBoundingClientRect(),w=Math.max(1,r.width),hh=Math.max(1,r.height);renderer.setSize(w,hh,false);camera.aspect=w/hh;camera.position.z=camera.aspect>2.25?8.25:7.35;camera.updateProjectionMatrix()}
 resize();new ResizeObserver(resize).observe(h.canvas.parentElement);return{renderer,scene,camera,bro,root,ring};
}
for(const h of HEROES)previews.push(makePreview(h));
function target(){return`./pass17-world1/?hero=${encodeURIComponent(selected)}&v=17`}
function sync(){document.querySelectorAll('.heroWindow').forEach(b=>b.classList.toggle('selected',b.dataset.id===selected));localStorage.setItem('gamerBroCharacter',selected);window.__titleSelectedHero=selected;play.dataset.href=target()}
document.querySelectorAll('.heroWindow').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.id;sync()}));
play.addEventListener('click',()=>{localStorage.setItem('gamerBroCharacter',selected);location.href=target()});
const sm=document.getElementById('settingsModal'),cm=document.getElementById('creditsModal');document.getElementById('settingsBtn').onclick=()=>sm.classList.add('show');document.getElementById('creditsBtn').onclick=()=>cm.classList.add('show');document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('.gb-modal').classList.remove('show'));document.querySelectorAll('.gb-modal').forEach(m=>m.addEventListener('pointerdown',e=>{if(e.target===m)m.classList.remove('show')}));
let last=performance.now(),t=0;function frame(now){requestAnimationFrame(frame);const dt=Math.min(.04,(now-last)/1000);last=now;t+=dt;for(const p of previews){p.bro.update(t,dt,0);p.root.rotation.y=.12+Math.sin(t*.45)*.07;p.root.position.y=Math.sin(t*1.7)*.016;p.ring.rotation.z+=dt*.12;p.renderer.render(p.scene,p.camera)}}
sync();requestAnimationFrame(frame);window.__pass17TitleReady=true;window.__playableRoster=['gb1','gb2'];document.documentElement.dataset.title17='1';
