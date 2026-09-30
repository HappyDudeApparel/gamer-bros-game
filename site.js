const CONFIG={steamWishlistUrl:""};
const track=document.querySelector("#slides");
const slides=[...track.children];
const dotsWrap=document.querySelector("#dots");
let i=0,timer;
slides.forEach((_,n)=>{const b=document.createElement("button");b.type="button";b.ariaLabel=`Hero image ${n+1}`;b.onclick=()=>go(n,true);dotsWrap.appendChild(b)});
const dots=[...dotsWrap.children];
function render(){track.style.transform=`translateX(-${i*100}%)`;dots.forEach((d,n)=>d.classList.toggle("active",n===i))}
function go(n,reset=false){i=(n+slides.length)%slides.length;render();if(reset)start()}
function start(){clearInterval(timer);timer=setInterval(()=>go(i+1),12000)}
document.querySelector(".prev").onclick=()=>go(i-1,true);
document.querySelector(".next").onclick=()=>go(i+1,true);
let tx=null;document.querySelector(".hero").addEventListener("touchstart",e=>tx=e.touches[0].clientX,{passive:true});document.querySelector(".hero").addEventListener("touchend",e=>{if(tx===null)return;const dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>45)go(i+(dx<0?1:-1),true);tx=null},{passive:true});
document.querySelectorAll(".js-steam").forEach(b=>b.onclick=()=>CONFIG.steamWishlistUrl?window.open(CONFIG.steamWishlistUrl,"_blank","noopener"):alert("Steam wishlist link will be added when the store page is live."));
render();start();
