const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function waitForGame() {
  for (let i = 0; i < 400; i++) {
    if (window.__bro && document.getElementById('ui')?.classList.contains('show')) return window.__bro;
    await sleep(25);
  }
  throw new Error('Game runtime did not expose Gamer Bro in time.');
}

function heroSvg(shirt, trim, label) {
  return `
  <svg viewBox="0 0 220 250" aria-hidden="true">
    <defs>
      <linearGradient id="lens-${label}" x1="0" x2="1"><stop stop-color="#ff4fc8"/><stop offset="1" stop-color="#a92dff"/></linearGradient>
      <linearGradient id="hair-${label}" y1="0" y2="1"><stop stop-color="#ffe39a"/><stop offset="1" stop-color="#d78d24"/></linearGradient>
    </defs>
    <ellipse cx="110" cy="232" rx="70" ry="12" fill="rgba(0,0,0,.28)"/>
    <rect x="53" y="136" width="114" height="73" rx="33" fill="${shirt}"/>
    <rect x="72" y="196" width="31" height="30" rx="12" fill="#171925"/><rect x="117" y="196" width="31" height="30" rx="12" fill="#171925"/>
    <path d="M52 219 Q79 207 105 219 L101 235 Q77 240 51 233Z" fill="${shirt}" stroke="#f5eee5" stroke-width="7"/>
    <path d="M115 219 Q141 207 168 219 L169 233 Q144 240 118 235Z" fill="${shirt}" stroke="#f5eee5" stroke-width="7"/>
    <circle cx="110" cy="104" r="66" fill="#eda152"/>
    <path d="M51 83 Q42 41 73 22 Q88 4 111 30 Q131 -2 142 30 Q168 6 165 45 Q188 26 170 78 Q136 50 96 60 Q74 68 51 83Z" fill="url(#hair-${label})" stroke="#7d561f" stroke-width="4"/>
    <path d="M48 45 Q30 74 38 112" fill="none" stroke="#151823" stroke-width="12" stroke-linecap="round"/>
    <path d="M172 45 Q190 74 182 112" fill="none" stroke="#151823" stroke-width="12" stroke-linecap="round"/>
    <rect x="24" y="76" width="28" height="51" rx="13" fill="#25bdc4" stroke="#10222b" stroke-width="6"/><circle cx="38" cy="102" r="10" fill="#f4a03c"/>
    <rect x="168" y="76" width="28" height="51" rx="13" fill="#25bdc4" stroke="#10222b" stroke-width="6"/><circle cx="182" cy="102" r="10" fill="#f4a03c"/>
    <path d="M55 79 Q110 64 165 79 L160 119 Q110 128 60 119Z" fill="url(#lens-${label})" stroke="#171720" stroke-width="7"/>
    <path d="M100 119 Q110 130 120 119" fill="none" stroke="#171720" stroke-width="5"/>
    <path d="M88 127 Q110 141 132 127 Q128 156 110 157 Q92 155 88 127Z" fill="#321719"/><path d="M94 130 Q110 137 126 130" fill="none" stroke="#fff6e7" stroke-width="9"/>
    <circle cx="56" cy="172" r="18" fill="#eda152"/><circle cx="164" cy="172" r="18" fill="#eda152"/>
    <text x="110" y="172" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="32" fill="#fff">G<tspan fill="${trim}">B</tspan></text>
    <text x="110" y="189" text-anchor="middle" font-family="Arial" font-weight="800" font-size="11" fill="#fff">GAMER BROS</text>
  </svg>`;
}

function buildMenu() {
  const el = document.createElement('div');
  el.id = 'gameMenu';
  el.innerHTML = `
    <div class="menuShell">
      <div class="menuEyebrow">GAMER BROS · PORTAL WORLD</div>
      <h1>Choose your Gamer Bro</h1>
      <p class="menuSub">Same hero build, two colourways. You can return here any time with Menu / Reset.</p>
      <div class="heroChoices">
        <button class="heroChoice gb1" data-hero="gb1">
          <div class="heroArt">${heroSvg('#ef3d9f','#31d6d8','gb1')}</div>
          <strong>GB1</strong><span>Pink Shirt</span>
        </button>
        <button class="heroChoice gb2" data-hero="gb2">
          <div class="heroArt">${heroSvg('#1ec9c8','#f149a9','gb2')}</div>
          <strong>GB2</strong><span>Teal Shirt</span>
        </button>
      </div>
      <div class="menuSettings">
        <label><input id="menuDevMode" type="checkbox"> <span>Developer controls</span></label>
        <label><input id="menuFollowLock" type="checkbox" checked> <span>Lock camera behind hero</span></label>
      </div>
      <div class="menuNote">Action: tap = zap · hold = continuous glasses beam</div>
    </div>`;
  document.body.appendChild(el);
  return el;
}

(async () => {
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js');
    const bro = await waitForGame();
    const actionBtn = document.getElementById('actionTouchBtn');
    const resetBtn = document.getElementById('resetBtn');
    const dropBtn = document.getElementById('dropBtn');
    const activateBtn = document.getElementById('activateBtn');
    const followLockBtn = document.getElementById('followLockBtn');
    const characterStatus = document.getElementById('characterStatus');
    if (!actionBtn || !resetBtn || !dropBtn || !activateBtn) throw new Error('Expected controls were not found.');

    document.body.classList.add('gb83');
    actionBtn.textContent = 'ZAP';
    resetBtn.textContent = 'MENU / RESET';

    const originalSetColorway = bro.setColorway.bind(bro);
    const originalSetAction = bro.setAction.bind(bro);
    let selectedLabel = 'GB2 · TEAL';
    function applyHero(which) {
      if (which === 'gb1') {
        originalSetColorway('pink');
        bro.materials.cup?.color?.set(0x1ec9c8);
        bro.materials.cupAccent?.color?.set(0xffa13a);
        bro.materials.trim?.color?.set(0x31d6d8);
        bro.materials.shoe?.color?.set(0xef3d9f);
        selectedLabel = 'GB1 · PINK';
      } else {
        originalSetColorway('teal');
        bro.materials.cup?.color?.set(0x1ec9c8);
        bro.materials.cupAccent?.color?.set(0xffa13a);
        bro.materials.trim?.color?.set(0xf149a9);
        bro.materials.shoe?.color?.set(0x1ec9c8);
        selectedLabel = 'GB2 · TEAL';
      }
      localStorage.setItem('gamerBroHero', which);
    }

    // Outer game action can fire, while the internal controller/grip pose stays off.
    bro.setAction = (v) => { originalSetAction(false); return !!v; };
    if (bro.controllerGroup) {
      // The legacy laser reads this emitter, so relocate the invisible emitter to the glasses.
      bro.controllerGroup.position.set(0, 1.845, 0.58);
      bro.controllerGroup.rotation.set(0, 0, 0);
      bro.controllerGroup.visible = false;
    }
    if (bro.controllerEmitter) bro.controllerEmitter.position.set(0, 0.02, 0.20);

    // Stronger/faster locomotion cadence to eliminate the hover-walk appearance.
    const originalUpdate = bro.update.bind(bro);
    let heroAnimClock = 0;
    bro.update = (t, dt, fx) => {
      const m = bro.motion;
      const rate = m === 'run' ? 2.60 : (m === 'walk' ? 2.20 : 1.0);
      heroAnimClock += Math.min(0.05, dt) * rate;
      originalUpdate(heroAnimClock, dt, fx);
      if (bro.controllerGroup) bro.controllerGroup.visible = false;
    };

    // Phone-safe raycasts: never recurse through the full instanced environment.
    const nativeIntersectObject = THREE.Raycaster.prototype.intersectObject;
    const rayCaches = new WeakMap();
    THREE.Raycaster.prototype.intersectObject = function(object, recursive = true, optionalTarget = []) {
      if (!recursive || !object?.traverseVisible) {
        return nativeIntersectObject.call(this, object, recursive, optionalTarget);
      }
      let c = rayCaches.get(object);
      if (!c) {
        const candidates = [];
        object.traverseVisible(o => {
          if (candidates.length >= 48 || !o?.isMesh || o.isInstancedMesh || !o.geometry) return;
          const count = o.geometry.attributes?.position?.count || 0;
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          const tooTransparent = mats.some(m => m?.transparent && (m.opacity ?? 1) < 0.35);
          if (count > 0 && count <= 4200 && !tooTransparent) candidates.push(o);
        });
        c = { candidates, lastAt: 0, hits: [], ox: 1e9, oy: 1e9, oz: 1e9, dx: 0, dy: 0, dz: 0 };
        rayCaches.set(object, c);
      }
      const now = performance.now();
      const ro = this.ray.origin, rd = this.ray.direction;
      const moved = Math.abs(ro.x-c.ox)+Math.abs(ro.y-c.oy)+Math.abs(ro.z-c.oz) > 0.10 || Math.abs(rd.x-c.dx)+Math.abs(rd.y-c.dy)+Math.abs(rd.z-c.dz) > 0.025;
      if (moved || now - c.lastAt > 110) {
        c.lastAt = now; c.ox=ro.x; c.oy=ro.y; c.oz=ro.z; c.dx=rd.x; c.dy=rd.y; c.dz=rd.z;
        const hits = [];
        for (const candidate of c.candidates) nativeIntersectObject.call(this, candidate, false, hits);
        hits.sort((a,b)=>a.distance-b.distance);
        c.hits = hits.slice(0, 4);
      }
      optionalTarget.push(...c.hits);
      return optionalTarget;
    };

    // Turn the legacy toggle into tap/hold shooting.
    let bypassActionClick = false;
    let firing = false;
    let fireStartedAt = 0;
    function legacyActionToggle() {
      bypassActionClick = true;
      actionBtn.click();
      bypassActionClick = false;
    }
    actionBtn.addEventListener('click', e => {
      if (!bypassActionClick) { e.preventDefault(); e.stopImmediatePropagation(); }
    }, true);
    function startFire(e) {
      if (firing) return;
      e?.preventDefault?.();
      firing = true; fireStartedAt = performance.now();
      legacyActionToggle();
      actionBtn.classList.add('active'); actionBtn.textContent = 'ZAP';
    }
    function stopFire(e) {
      e?.preventDefault?.();
      if (!firing) return;
      const wait = Math.max(0, 115 - (performance.now() - fireStartedAt));
      setTimeout(() => {
        if (!firing) return;
        firing = false;
        legacyActionToggle();
        actionBtn.classList.remove('active'); actionBtn.textContent = 'ZAP';
      }, wait);
    }
    actionBtn.addEventListener('pointerdown', e => { actionBtn.setPointerCapture?.(e.pointerId); startFire(e); });
    for (const ev of ['pointerup','pointercancel','lostpointercapture']) actionBtn.addEventListener(ev, stopFire);
    window.addEventListener('keydown', e => {
      if (e.key.toLowerCase() !== 'f') return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (!e.repeat) startFire(e);
    }, true);
    window.addEventListener('keyup', e => {
      if (e.key.toLowerCase() !== 'f') return;
      e.preventDefault(); e.stopImmediatePropagation(); stopFire(e);
    }, true);

    // Walking into the portal now starts the full existing load + activate sequence.
    let portalArmed = true;
    let autoActivatePending = false;
    function monitorPortal() {
      const p = bro.root?.position;
      if (p) {
        const d = Math.hypot(p.x, p.z);
        const loadReady = !dropBtn.disabled && /LOAD HERO/i.test(dropBtn.textContent || '');
        if (!document.body.classList.contains('menuOpen') && portalArmed && loadReady && d < 1.42) {
          portalArmed = false; autoActivatePending = true; dropBtn.click();
        }
        if (autoActivatePending && !activateBtn.disabled && /ACTIVATE PORTAL/i.test(activateBtn.textContent || '')) {
          autoActivatePending = false; activateBtn.click();
        }
        if (!portalArmed && loadReady && d > 2.25) portalArmed = true;
      }
      requestAnimationFrame(monitorPortal);
    }

    const menu = buildMenu();
    const devMode = menu.querySelector('#menuDevMode');
    const followSetting = menu.querySelector('#menuFollowLock');
    devMode.checked = localStorage.getItem('gamerBroDev') !== 'off';
    followSetting.checked = localStorage.getItem('gamerBroFollow') !== 'off';
    function applySettings() {
      document.body.classList.toggle('cleanMode', !devMode.checked);
      localStorage.setItem('gamerBroDev', devMode.checked ? 'on' : 'off');
      localStorage.setItem('gamerBroFollow', followSetting.checked ? 'on' : 'off');
      const isLocked = /ON/i.test(followLockBtn?.textContent || '');
      if (followLockBtn && isLocked !== followSetting.checked) followLockBtn.click();
    }
    devMode.addEventListener('change', applySettings);
    followSetting.addEventListener('change', applySettings);

    function showMenu() {
      stopFire();
      document.body.classList.add('menuOpen');
      menu.classList.add('show');
    }
    function hideMenu() {
      applySettings();
      document.body.classList.remove('menuOpen');
      menu.classList.remove('show');
    }
    menu.querySelectorAll('[data-hero]').forEach(btn => btn.addEventListener('click', () => {
      applyHero(btn.dataset.hero);
      hideMenu();
    }));

    // Reset means reset world, then reopen hero select/settings.
    let bypassReset = false;
    resetBtn.addEventListener('click', e => {
      if (bypassReset) return;
      e.preventDefault(); e.stopImmediatePropagation();
      bypassReset = true; resetBtn.click(); bypassReset = false;
      showMenu();
    }, true);

    function updateSelectedLabel() {
      if (characterStatus && !/ENTERING|PORTAL READY|CONVERTING|TRANSMITTED/.test(characterStatus.textContent || '')) {
        const motion = bro.motion?.toUpperCase?.() || 'IDLE';
        const wanted = `${selectedLabel} · ${motion}`;
        if (characterStatus.textContent !== wanted) characterStatus.textContent = wanted;
      }
      if (actionBtn.textContent !== 'ZAP') actionBtn.textContent = 'ZAP';
      if (bro.controllerGroup?.visible) bro.controllerGroup.visible = false;
      setTimeout(updateSelectedLabel, 140);
    }

    applyHero(localStorage.getItem('gamerBroHero') === 'gb1' ? 'gb1' : 'gb2');
    applySettings();
    showMenu();
    monitorPortal();
    updateSelectedLabel();
  } catch (err) {
    console.error('v0.8.3 overlay failed:', err);
  }
})();
