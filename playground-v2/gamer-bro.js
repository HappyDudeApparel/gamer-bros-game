function createGamerBro(THREE, renderer, options) {
  const cfg = Object.assign({ colorway: 'teal', detail: 'high', height: 2.62 }, options || {});
  const HI = cfg.detail !== 'low';
  const Q = HI
    ? { headSeg: 56, headPts: 44, bodySeg: 52, bodyPts: 40, hipSeg: 36, hipPts: 26,
        capSeg: 44, capPts: 32, cupSeg: 26, cupPts: 16, fistSeg: 22, fistPts: 18,
        lockSeg: 14, lockRad: 9, limbSeg: 14, limbRad: 12, shoeZ: 18, shoeK: 20,
        visA: 44, visV: 6 }
    : { headSeg: 36, headPts: 30, bodySeg: 34, bodyPts: 26, hipSeg: 24, hipPts: 18,
        capSeg: 28, capPts: 22, cupSeg: 18, cupPts: 12, fistSeg: 16, fistPts: 14,
        lockSeg: 10, lockRad: 7, limbSeg: 10, limbRad: 9, shoeZ: 12, shoeK: 14,
        visA: 32, visV: 4 };
  const aniso = renderer ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 4;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

  const PALETTES = {
    teal: { shirt: '#1ec9c8', shirtHi: '#48e3df', shirtLo: '#0a7a88', trim: '#f149a9', cup: '#1ec9c8', cupAccent: '#ffab33' },
    pink: { shirt: '#ef3d9f', shirtHi: '#ff74c2', shirtLo: '#8e1160', trim: '#31d6d8', cup: '#ef3d9f', cupAccent: '#31d6d8' }
  };
  let P = PALETTES[cfg.colorway] || PALETTES.teal;

  /* --------------------------------------------------------------------- */
  /* GEOMETRY HELPERS                                                       */
  /* --------------------------------------------------------------------- */

  // Resample an authored [x,y] profile by arc length and expose y→v lookups so
  // textures can be painted against real geometry instead of guessed numbers.
  function profile(raw, samples) {
    samples = samples || 72;
    const curve = new THREE.CatmullRomCurve3(raw.map(p => V3(p[0], p[1], 0)), false, 'centripetal');
    const pts = curve.getSpacedPoints(samples);
    const arc = [0];
    for (let i = 1; i < pts.length; i++) arc.push(arc[i - 1] + pts[i].distanceTo(pts[i - 1]));
    const total = arc[arc.length - 1] || 1;
    const p2 = pts.map((p, i) => {
      const last = i === 0 || i === pts.length - 1;
      return new THREE.Vector2(last ? Math.max(0, p.x) : Math.max(0.0006, p.x), p.y);
    });
    function find(y) {
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        if ((y >= a.y && y <= b.y) || (y <= a.y && y >= b.y)) {
          const f = Math.abs(b.y - a.y) < 1e-7 ? 0 : (y - a.y) / (b.y - a.y);
          return { i, f };
        }
      }
      return null;
    }
    return {
      points: p2,
      vAt(y) {
        const h = find(y); if (!h) return y < pts[0].y ? 0 : 1;
        return (arc[h.i - 1] + (arc[h.i] - arc[h.i - 1]) * h.f) / total;
      },
      rAt(y) {
        const h = find(y); if (!h) return 0;
        return pts[h.i - 1].x + (pts[h.i].x - pts[h.i - 1].x) * h.f;
      }
    };
  }

  // phiStart = PI puts u = 0.5 dead centre-front, u = 0 on the back seam,
  // and keeps canvas-left on screen-left. Textures can be painted unmirrored.
  function latheOf(prof, seg) {
    return new THREE.LatheGeometry(prof.points, seg || 76, Math.PI, Math.PI * 2);
  }

  // Curved shell with thickness + rim. Used for the visor frame and lens.
  function wrapShell(o) {
    const rx = o.rx, rz = o.rz, yc = o.yc, half = o.half, span = o.span, thick = o.thick;
    const centerA = o.centerA || 0;
    const segA = o.segA || 56, segV = o.segV || 8;
    const notch = o.notch || 0, notchW = o.notchW || 0.22;
    const taper = o.taper == null ? 0.26 : o.taper, domeY = o.domeY == null ? 0.20 : o.domeY;
    const A = segA + 1, B = segV + 1;

    function surf(a, t) {
      const k = Math.abs(a-centerA) / (span / 2);
      const hh = half * (1 - taper * Math.pow(k, 2.4));
      const yb = yc - hh + notch * Math.exp(-((a-centerA) * (a-centerA)) / (notchW * notchW));
      const yt = yc + hh;
      const y = yb + (yt - yb) * t;
      const dy = (y - yc) / Math.max(1e-4, half);
      const s = 1 - domeY * dy * dy;
      return V3(rx * s * Math.sin(a), y, rz * s * Math.cos(a));
    }
    function nrm(a, t) {
      const e = 0.005;
      const p0 = surf(a, t);
      const ta = surf(a + e, t).sub(p0);
      const tt = surf(a, Math.min(1, t + e)).sub(p0);
      const n = ta.cross(tt);
      return n.lengthSq() < 1e-12 ? V3(0, 0, 1) : n.normalize();
    }

    const pos = [], idx = [];
    const push = (v) => { pos.push(v.x, v.y, v.z); };
    for (let s = 0; s < 2; s++) {                     // 0 = outer shell, 1 = inner
      for (let i = 0; i < A; i++) {
        const a = centerA - span / 2 + (i / segA) * span;
        for (let j = 0; j < B; j++) {
          const t = j / segV;
          push(surf(a, t).addScaledVector(nrm(a, t), (s === 0 ? 0.5 : -0.5) * thick));
        }
      }
    }
    const SH = A * B;
    for (let i = 0; i < segA; i++) for (let j = 0; j < segV; j++) {
      const a = i * B + j, b = (i + 1) * B + j, c = (i + 1) * B + j + 1, d = i * B + j + 1;
      idx.push(a, b, d, b, c, d);                                   // outer, faces out
      idx.push(SH + a, SH + d, SH + b, SH + b, SH + d, SH + c);     // inner, reversed
    }
    // Border loop, counter-clockwise seen from outside, duplicated for a crisp rim.
    const loop = [];
    for (let i = 0; i < A; i++) loop.push([i, 0]);
    for (let j = 1; j < B; j++) loop.push([A - 1, j]);
    for (let i = A - 2; i >= 0; i--) loop.push([i, B - 1]);
    for (let j = B - 2; j >= 1; j--) loop.push([0, j]);
    const RB = pos.length / 3;
    for (const [i, j] of loop) {
      const a = centerA - span / 2 + (i / segA) * span, t = j / segV;
      const p = surf(a, t), n = nrm(a, t);
      push(p.clone().addScaledVector(n, thick * 0.5));
      push(p.clone().addScaledVector(n, -thick * 0.5));
    }
    for (let k = 0; k < loop.length; k++) {
      const k2 = (k + 1) % loop.length;
      const o1 = RB + k * 2, i1 = o1 + 1, o2 = RB + k2 * 2, i2 = o2 + 1;
      idx.push(o1, i1, i2, o1, i2, o2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  // Ribbon/tube sweep with a controllable flat cross-section. Hair, arms, band.
  function swept(o) {
    const curve = new THREE.CatmullRomCurve3(o.path, false, 'centripetal');
    const seg = o.seg || 20, radial = o.radial || 12;
    const width = o.width, thick = o.thick;
    const upRef = (o.up || V3(0, 0, 1)).clone().normalize();
    const pos = [], idx = [];
    const T = V3(), B = V3(), N = V3(), tmp = V3();
    for (let j = 0; j <= seg; j++) {
      const t = j / seg;
      const p = curve.getPointAt(t);
      curve.getTangentAt(t, T);
      B.copy(T).cross(upRef);
      if (B.lengthSq() < 1e-8) B.set(1, 0, 0); else B.normalize();
      N.copy(B).cross(T).normalize();
      const w = width(t) * 0.5, th = thick(t) * 0.5;
      for (let k = 0; k < radial; k++) {
        const ph = (k / radial) * Math.PI * 2;
        tmp.copy(p).addScaledVector(B, w * Math.cos(ph)).addScaledVector(N, th * Math.sin(ph));
        pos.push(tmp.x, tmp.y, tmp.z);
      }
    }
    for (let j = 0; j < seg; j++) for (let k = 0; k < radial; k++) {
      const k2 = (k + 1) % radial;
      const a = j * radial + k, b = (j + 1) * radial + k, c = (j + 1) * radial + k2, d = j * radial + k2;
      idx.push(a, b, d, b, c, d);
    }
    const s = curve.getPointAt(0), e = curve.getPointAt(1);
    const ci = pos.length / 3; pos.push(s.x, s.y, s.z);
    const ce = ci + 1; pos.push(e.x, e.y, e.z);
    for (let k = 0; k < radial; k++) {
      const k2 = (k + 1) % radial;
      idx.push(ci, k, k2);                                           // base cap, faces -T
      idx.push(ce, seg * radial + k2, seg * radial + k);             // tip cap, faces +T
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  // Superellipse cross-section swept along +Z. Flat-bottomed soles, sneaker uppers.
  function shoeSweep(o) {
    const slices = o.slices, segZ = o.segZ || 26, segK = o.segK || 30;
    const n = o.n || 3.0, ex = 2 / n;
    const cw = new THREE.CatmullRomCurve3(slices.map(s => V3(s[0], s[1], s[2])), false, 'centripetal');
    const cy = new THREE.CatmullRomCurve3(slices.map(s => V3(s[0], s[3], 0)), false, 'centripetal');
    const pos = [], idx = [];
    const sgn = (x) => (x < 0 ? -1 : 1);
    for (let j = 0; j <= segZ; j++) {
      const t = j / segZ;
      const a = cw.getPoint(t), b = cy.getPoint(t);
      const z = a.x, hw = Math.max(0.004, a.y), hh = Math.max(0.004, a.z), yc = b.y;
      for (let k = 0; k < segK; k++) {
        const ph = (k / segK) * Math.PI * 2;
        const c = Math.cos(ph), s = Math.sin(ph);
        pos.push(hw * sgn(c) * Math.pow(Math.abs(c), ex), yc + hh * sgn(s) * Math.pow(Math.abs(s), ex), z);
      }
    }
    for (let j = 0; j < segZ; j++) for (let k = 0; k < segK; k++) {
      const k2 = (k + 1) % segK;
      const a = j * segK + k, b = (j + 1) * segK + k, c = (j + 1) * segK + k2, d = j * segK + k2;
      idx.push(a, d, b, d, c, b);
    }
    const s0 = cw.getPoint(0), s1 = cw.getPoint(1), y0 = cy.getPoint(0), y1 = cy.getPoint(1);
    const c0 = pos.length / 3; pos.push(0, y0.y, s0.x);
    const c1 = c0 + 1; pos.push(0, y1.y, s1.x);
    for (let k = 0; k < segK; k++) {
      const k2 = (k + 1) % segK;
      idx.push(c0, k, k2);
      idx.push(c1, segZ * segK + k2, segZ * segK + k);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  /* --------------------------------------------------------------------- */
  /* PROFILES                                                               */
  /* --------------------------------------------------------------------- */

  const headProf = profile([
    [0.000, 1.200], [0.200, 1.215], [0.375, 1.265], [0.520, 1.360], [0.625, 1.495],
    [0.685, 1.650], [0.712, 1.820], [0.705, 1.985], [0.660, 2.150], [0.575, 2.300],
    [0.440, 2.420], [0.245, 2.495], [0.000, 2.520]
  ], Q.headPts);

  const shirtProf = profile([
    [0.000, 0.585], [0.310, 0.590], [0.500, 0.612], [0.605, 0.658], [0.628, 0.722],
    [0.622, 0.822], [0.605, 0.932], [0.585, 1.032], [0.548, 1.132], [0.495, 1.216],
    [0.425, 1.292], [0.330, 1.352], [0.205, 1.400], [0.090, 1.421], [0.000, 1.426]
  ], Q.bodyPts);

  const hipProf = profile([
    [0.000, 0.300], [0.250, 0.306], [0.400, 0.332], [0.470, 0.396], [0.500, 0.492],
    [0.505, 0.602], [0.480, 0.692], [0.400, 0.756], [0.220, 0.790], [0.000, 0.800]
  ], Q.hipPts);

  const hairCapProf = profile([
    [0.000, 1.905], [0.380, 1.915], [0.560, 1.936], [0.664, 1.968], [0.686, 2.062],
    [0.646, 2.204], [0.566, 2.352], [0.424, 2.472], [0.238, 2.542], [0.000, 2.566]
  ], Q.capPts);

  const cupProf = profile([
    [0.000, 0.000], [0.150, 0.005], [0.250, 0.032], [0.296, 0.082], [0.306, 0.150],
    [0.294, 0.206], [0.248, 0.236], [0.150, 0.249], [0.000, 0.252]
  ], Q.cupPts);

  const fistProf = profile([
    [0.000, -0.215], [0.105, -0.198], [0.168, -0.150], [0.204, -0.070],
    [0.212, 0.020], [0.192, 0.110], [0.138, 0.180], [0.070, 0.212], [0.000, 0.222]
  ], Q.fistPts);

  /* --------------------------------------------------------------------- */
  /* TEXTURES                                                               */
  /* --------------------------------------------------------------------- */

  function cvs(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function tex(c, srgb) {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = srgb === false ? THREE.NoColorSpace : THREE.SRGBColorSpace;
    t.anisotropy = aniso;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.needsUpdate = true;
    return t;
  }
  function speckle(g, w, h, count, alpha) {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w, y = Math.random() * h, r = 0.6 + Math.random() * 1.8;
      g.fillStyle = 'rgba(255,255,255,' + (alpha * (0.3 + Math.random() * 0.7)).toFixed(3) + ')';
      g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
    }
  }

  // --- face -------------------------------------------------------------
  function faceCanvas() {
    const W = 2048, H = 1024, c = cvs(W, H), g = c.getContext('2d');
    g.fillStyle = '#eda152'; g.fillRect(0, 0, W, H);

    // vertical form shading: dark under the jaw, dark again where hair sits
    let vg = g.createLinearGradient(0, H, 0, 0);
    vg.addColorStop(0.00, 'rgba(120,58,14,0.92)');
    vg.addColorStop(0.13, 'rgba(155,80,24,0.55)');
    vg.addColorStop(0.30, 'rgba(255,205,150,0.10)');
    vg.addColorStop(0.52, 'rgba(255,220,175,0.20)');
    vg.addColorStop(0.70, 'rgba(150,78,24,0.30)');
    vg.addColorStop(0.86, 'rgba(96,44,10,0.80)');
    vg.addColorStop(1.00, 'rgba(70,30,6,0.95)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);

    // side occlusion where the ear cups clamp on
    for (const u of [0.25, 0.75]) {
      const rg = g.createRadialGradient(u * W, 0.48 * H, 10, u * W, 0.48 * H, 0.19 * W);
      rg.addColorStop(0, 'rgba(96,44,10,0.52)'); rg.addColorStop(1, 'rgba(96,44,10,0)');
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    }
    // back of the head sits in shadow
    for (const u of [0.0, 1.0]) {
      const rg = g.createRadialGradient(u * W, 0.5 * H, 10, u * W, 0.5 * H, 0.20 * W);
      rg.addColorStop(0, 'rgba(70,30,6,0.55)'); rg.addColorStop(1, 'rgba(70,30,6,0)');
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    }

    const mv = headProf.vAt(1.605);          // mouth centre, from real geometry
    const mx = 0.5 * W, my = (1 - mv) * H;

    // cheeks
    for (const s of [-1, 1]) {
      const rg = g.createRadialGradient(mx + s * 0.088 * W, my - 0.035 * H, 6, mx + s * 0.088 * W, my - 0.035 * H, 0.072 * W);
      rg.addColorStop(0, 'rgba(255,150,96,0.55)'); rg.addColorStop(1, 'rgba(255,150,96,0)');
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    }

    // soft shadow the visor throws onto the face
    const bv = headProf.vAt(1.775);
    const sg = g.createLinearGradient(0, (1 - bv) * H - 60, 0, (1 - bv) * H + 70);
    sg.addColorStop(0, 'rgba(60,24,4,0.55)'); sg.addColorStop(1, 'rgba(60,24,4,0)');
    g.fillStyle = sg; g.fillRect(0.30 * W, (1 - bv) * H - 60, 0.40 * W, 140);

    // --- open laughing mouth, painted with depth ---
    const MW = 152, MH = 92;
    g.save(); g.translate(mx, my);
    const halo = g.createRadialGradient(0, 0, MW * 0.5, 0, 0, MW * 1.5);
    halo.addColorStop(0, 'rgba(120,52,12,0.50)'); halo.addColorStop(1, 'rgba(120,52,12,0)');
    g.fillStyle = halo; g.fillRect(-MW * 1.6, -MH * 1.8, MW * 3.2, MH * 3.6);

    g.beginPath();
    g.moveTo(-MW, -MH * 0.34);
    g.quadraticCurveTo(0, -MH * 0.62, MW, -MH * 0.34);
    g.quadraticCurveTo(MW * 0.72, MH * 1.06, 0, MH * 1.06);
    g.quadraticCurveTo(-MW * 0.72, MH * 1.06, -MW, -MH * 0.34);
    g.closePath();
    const cav = g.createLinearGradient(0, -MH * 0.6, 0, MH * 1.1);
    cav.addColorStop(0, '#1b0708'); cav.addColorStop(0.55, '#3a1113'); cav.addColorStop(1, '#571a1c');
    g.fillStyle = cav; g.fill();
    g.save(); g.clip();

    // tongue
    const tg = g.createRadialGradient(0, MH * 0.62, 8, 0, MH * 0.62, MW * 0.78);
    tg.addColorStop(0, '#f2776a'); tg.addColorStop(0.7, '#d4514a'); tg.addColorStop(1, '#8e2b2c');
    g.fillStyle = tg;
    g.beginPath(); g.ellipse(0, MH * 0.72, MW * 0.66, MH * 0.55, 0, 0, 6.2832); g.fill();

    // upper teeth
    g.fillStyle = '#fff8e8';
    g.beginPath();
    g.moveTo(-MW * 0.94, -MH * 0.30);
    g.quadraticCurveTo(0, -MH * 0.58, MW * 0.94, -MH * 0.30);
    g.lineTo(MW * 0.86, MH * 0.02);
    g.quadraticCurveTo(0, MH * 0.24, -MW * 0.86, MH * 0.02);
    g.closePath(); g.fill();
    g.strokeStyle = 'rgba(150,120,90,0.35)'; g.lineWidth = 2.5;
    for (const d of [-0.52, -0.18, 0.18, 0.52]) {
      g.beginPath(); g.moveTo(MW * d, -MH * 0.42); g.lineTo(MW * d * 0.94, MH * 0.12); g.stroke();
    }
    // occlusion just inside the lip line
    const inner = g.createLinearGradient(0, -MH * 0.6, 0, -MH * 0.05);
    inner.addColorStop(0, 'rgba(0,0,0,0.55)'); inner.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = inner; g.fillRect(-MW, -MH * 0.7, MW * 2, MH * 0.7);
    g.restore();

    // lower lip catch-light
    g.strokeStyle = 'rgba(255,196,140,0.55)'; g.lineWidth = 9;
    g.beginPath(); g.moveTo(-MW * 0.8, MH * 1.14); g.quadraticCurveTo(0, MH * 1.46, MW * 0.8, MH * 1.14); g.stroke();
    g.restore();

    speckle(g, W, H, 2600, 0.035);
    return c;
  }

  // --- shirt ------------------------------------------------------------
  function logoOn(g, x, y, w, mono) {
    const h = w * 0.78;
    g.save(); g.translate(x, y); g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '900 ' + (h * 0.66).toFixed(0) + 'px "Arial Black", Arial, sans-serif';
    if (mono) {
      g.fillStyle = '#ffffff';
      g.fillText('G', -w * 0.17, -h * 0.10);
      g.fillText('B', w * 0.19, -h * 0.10);
    } else {
      g.fillStyle = '#fdf7e4';
      g.fillText('G', -w * 0.17, -h * 0.10);
      const grad = g.createLinearGradient(w * 0.02, 0, w * 0.36, 0);
      grad.addColorStop(0.00, '#9df6ff'); grad.addColorStop(0.48, '#48d6e6');
      grad.addColorStop(0.50, '#ff5cc8'); grad.addColorStop(1.00, '#d24cff');
      g.fillStyle = grad;
      g.fillText('B', w * 0.19, -h * 0.10);
    }
    g.font = '900 ' + (h * 0.155).toFixed(0) + 'px "Arial Black", Arial, sans-serif';
    g.fillStyle = mono ? '#ffffff' : '#f6fbff';
    g.letterSpacing && (g.letterSpacing = '4px');
    g.fillText('GAMER BROS', 0, h * 0.36);
    g.restore();
  }

  function shirtCanvases() {
    const W = 2048, H = 1024;
    const alb = cvs(W, H), ga = alb.getContext('2d');
    const emi = cvs(W, H), ge = emi.getContext('2d');
    const rgh = cvs(1024, 512), gr = rgh.getContext('2d');

    ga.fillStyle = P.shirt; ga.fillRect(0, 0, W, H);
    let vg = ga.createLinearGradient(0, H, 0, 0);
    vg.addColorStop(0.00, 'rgba(0,0,0,0.50)');
    vg.addColorStop(0.16, 'rgba(0,0,0,0.24)');
    vg.addColorStop(0.55, 'rgba(255,255,255,0.06)');
    vg.addColorStop(0.86, 'rgba(255,255,255,0.16)');
    vg.addColorStop(1.00, 'rgba(0,0,0,0.42)');       // collar rolls into shadow
    ga.fillStyle = vg; ga.fillRect(0, 0, W, H);

    for (const u of [0.235, 0.765]) {                 // armpit occlusion
      const rg = ga.createRadialGradient(u * W, 0.72 * H, 12, u * W, 0.72 * H, 0.16 * W);
      rg.addColorStop(0, 'rgba(0,0,0,0.46)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      ga.fillStyle = rg; ga.fillRect(0, 0, W, H);
    }
    for (const u of [0.0, 1.0]) {
      const rg = ga.createRadialGradient(u * W, 0.5 * H, 12, u * W, 0.5 * H, 0.22 * W);
      rg.addColorStop(0, 'rgba(0,0,0,0.34)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      ga.fillStyle = rg; ga.fillRect(0, 0, W, H);
    }
    ga.fillStyle = P.shirtLo;
    ga.globalAlpha = 0.85; ga.fillRect(0, 0, W, 0.045 * H); ga.globalAlpha = 1;  // hem band

    const lv = shirtProf.vAt(1.020);
    const lx = 0.5 * W, ly = (1 - lv) * H, lw = 0.235 * W;
    logoOn(ga, lx, ly, lw, false);
    speckle(ga, W, H, 5200, 0.045);

    ge.fillStyle = '#000'; ge.fillRect(0, 0, W, H);
    logoOn(ge, lx, ly, lw, true);

    gr.fillStyle = '#9c9c9c'; gr.fillRect(0, 0, 1024, 512);
    speckle(gr, 1024, 512, 4200, 0.20);
    gr.fillStyle = '#4a4a4a';
    gr.globalAlpha = 0.9;
    gr.fillRect(0.5 * 1024 - lw * 0.28, (1 - lv) * 512 - lw * 0.22, lw * 0.56, lw * 0.44);
    gr.globalAlpha = 1;
    return { alb, emi, rgh };
  }

  function hipCanvas() {
    const W = 1024, H = 512, c = cvs(W, H), g = c.getContext('2d');
    g.fillStyle = '#14161f'; g.fillRect(0, 0, W, H);
    const vg = g.createLinearGradient(0, H, 0, 0);
    vg.addColorStop(0, 'rgba(0,0,0,0.65)');
    vg.addColorStop(0.45, 'rgba(120,130,160,0.16)');
    vg.addColorStop(1, 'rgba(0,0,0,0.70)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
    for (const u of [0.0, 1.0, 0.25, 0.75]) {
      const rg = g.createRadialGradient(u * W, 0.5 * H, 8, u * W, 0.5 * H, 0.16 * W);
      rg.addColorStop(0, 'rgba(0,0,0,0.45)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    }
    speckle(g, W, H, 2600, 0.05);
    return c;
  }

  function blobCanvas() {
    const S = 256, c = cvs(S, S), g = c.getContext('2d');
    const rg = g.createRadialGradient(S / 2, S / 2, 2, S / 2, S / 2, S / 2);
    rg.addColorStop(0.00, 'rgba(0,0,0,1)');
    rg.addColorStop(0.34, 'rgba(0,0,0,0.82)');
    rg.addColorStop(0.66, 'rgba(0,0,0,0.32)');
    rg.addColorStop(1.00, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.fillRect(0, 0, S, S);
    return c;
  }

  const faceTex = tex(faceCanvas());
  const shirtC = shirtCanvases();
  const shirtTex = tex(shirtC.alb);
  const shirtEmi = tex(shirtC.emi);
  const shirtRgh = tex(shirtC.rgh, false);
  const hipTex = tex(hipCanvas());
  const blobTex = tex(blobCanvas());

  /* --------------------------------------------------------------------- */
  /* MATERIALS                                                              */
  /* --------------------------------------------------------------------- */

  const M = {};
  M.skin = new THREE.MeshPhysicalMaterial({
    map: faceTex, roughness: 0.46, metalness: 0,
    clearcoat: 0.28, clearcoatRoughness: 0.42,
    sheen: 0.45, sheenColor: new THREE.Color(0xffb37a), sheenRoughness: 0.7,
    envMapIntensity: 1.0
  });
  M.skinPlain = new THREE.MeshPhysicalMaterial({
    color: 0xeda152, roughness: 0.46, metalness: 0,
    clearcoat: 0.28, clearcoatRoughness: 0.42,
    sheen: 0.45, sheenColor: new THREE.Color(0xffb37a), sheenRoughness: 0.7,
    envMapIntensity: 1.0
  });
  M.shirt = new THREE.MeshPhysicalMaterial({
    map: shirtTex, roughnessMap: shirtRgh, emissiveMap: shirtEmi,
    emissive: new THREE.Color(0xffffff), emissiveIntensity: 0.30,
    roughness: 0.72, metalness: 0.02,
    sheen: 0.55, sheenColor: new THREE.Color(0x8ff2ff), sheenRoughness: 0.55,
    envMapIntensity: 0.85
  });
  M.dark = new THREE.MeshPhysicalMaterial({
    map: hipTex, roughness: 0.68, metalness: 0.04, clearcoat: 0.12, envMapIntensity: 0.6
  });
  M.darkPlain = new THREE.MeshPhysicalMaterial({ color: 0x14161f, roughness: 0.68, metalness: 0.04, envMapIntensity: 0.6 });
  M.hair = new THREE.MeshPhysicalMaterial({
    color: 0xf7bf46, roughness: 0.30, metalness: 0.03,
    clearcoat: 0.55, clearcoatRoughness: 0.18, envMapIntensity: 1.25
  });
  M.hairDeep = new THREE.MeshPhysicalMaterial({
    color: 0xc07f1c, roughness: 0.42, metalness: 0.03, clearcoat: 0.35, envMapIntensity: 0.9
  });
  M.frame = new THREE.MeshPhysicalMaterial({
    color: 0x18345a, roughness: 0.20, metalness: 0.38, clearcoat: 0.82, clearcoatRoughness: 0.08, envMapIntensity: 1.45
  });
  M.lens = new THREE.MeshPhysicalMaterial({
    color: 0x55dcff, emissive: 0x145b93, emissiveIntensity: 0.58,
    roughness: 0.06, metalness: 0.18, clearcoat: 1, clearcoatRoughness: 0.03,
    iridescence: 0.35, iridescenceIOR: 1.4, envMapIntensity: 1.9
  });
  M.cup = new THREE.MeshPhysicalMaterial({ color: 0x25c6cf, roughness: 0.36, metalness: 0.06, clearcoat: 0.42, envMapIntensity: 1.0 });
  M.cupAccent = new THREE.MeshPhysicalMaterial({ color: 0xff9d35, roughness: 0.30, metalness: 0.07, clearcoat: 0.48, envMapIntensity: 1.15 });
  M.pad = new THREE.MeshPhysicalMaterial({ color: 0x26324a, roughness: 0.82, metalness: 0.0, sheen: 0.6, sheenColor: new THREE.Color(0x6a7288), envMapIntensity: 0.5 });
  M.trim = new THREE.MeshPhysicalMaterial({ color: 0xef4fa8, roughness: 0.30, metalness: 0.05, clearcoat: 0.48, envMapIntensity: 1.2 });
  M.sole = new THREE.MeshPhysicalMaterial({ color: 0xf6efe4, roughness: 0.48, metalness: 0.01, clearcoat: 0.18, envMapIntensity: 0.85 });
  M.shoe = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(P.shirt), roughness: 0.38, metalness: 0.04, clearcoat: 0.35, envMapIntensity: 1.0 });

  /* --------------------------------------------------------------------- */
  /* RIG                                                                    */
  /* --------------------------------------------------------------------- */

  const root = new THREE.Group();
  const bob = new THREE.Group(); root.add(bob);
  const body = new THREE.Group(); bob.add(body);
  const all = [];

  function mesh(parent, geo, mat, pos, scl, rot) {
    const m = new THREE.Mesh(geo, mat);
    if (pos) m.position.copy(pos);
    if (scl) m.scale.copy(scl);
    if (rot) m.rotation.copy(rot);
    m.castShadow = true; m.receiveShadow = true;
    m.layers.set(1);                         // lit only by the character rig
    parent.add(m); all.push(m);
    return m;
  }

  // --- contact shadow ---------------------------------------------------
  const blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.55, color: 0x000000 });
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.35), blobMat);
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.014; blob.renderOrder = -1;
  root.add(blob);

  // --- head, shirt, hips -------------------------------------------------
  const head = mesh(body, latheOf(headProf, Q.headSeg), M.skin, null, V3(1.04, 1, 0.965));
  head.userData.keep = true;
  const shirt = mesh(body, latheOf(shirtProf, Q.bodySeg), M.shirt, null, V3(1.02, 1, 0.90));
  shirt.userData.keep = true;
  const hips = mesh(body, latheOf(hipProf, Q.hipSeg), M.dark, null, V3(1.02, 1, 0.88));
  const hairCap = mesh(body, latheOf(hairCapProf, Q.capSeg), M.hair, null, V3(1.045, 1, 0.985));
  hairCap.userData.keep = true;
  const collar = mesh(body, new THREE.TorusGeometry(0.335, 0.052, 8, 30), M.trim,
    V3(0, 1.372, 0), V3(1.02, 1, 0.90), new THREE.Euler(Math.PI / 2, 0, 0));

  // --- glasses / visor ---------------------------------------------------
  // Two distinct glossy lenses with their own frames instead of one black visor slab.
  const glassesGroup = new THREE.Group(); body.add(glassesGroup);
  const leftFrame = mesh(glassesGroup, wrapShell({
    rx: 0.802, rz: 0.772, yc: 1.862, half: 0.165, span: 1.04, centerA: -0.54, thick: 0.058,
    notch: 0.030, notchW: 0.30, taper: 0.17, domeY: 0.17, segA: Math.max(20,Q.visA-10), segV: Q.visV+2
  }), M.frame);
  const rightFrame = mesh(glassesGroup, wrapShell({
    rx: 0.802, rz: 0.772, yc: 1.862, half: 0.165, span: 1.04, centerA: 0.54, thick: 0.058,
    notch: 0.030, notchW: 0.30, taper: 0.17, domeY: 0.17, segA: Math.max(20,Q.visA-10), segV: Q.visV+2
  }), M.frame);
  const lensL = mesh(glassesGroup, wrapShell({
    rx: 0.812, rz: 0.783, yc: 1.865, half: 0.132, span: 0.90, centerA: -0.54, thick: 0.030,
    notch: 0.018, notchW: 0.34, taper: 0.13, domeY: 0.16, segA: Math.max(18,Q.visA-12), segV: Q.visV+1
  }), M.lens);
  const lensR = mesh(glassesGroup, wrapShell({
    rx: 0.812, rz: 0.783, yc: 1.865, half: 0.132, span: 0.90, centerA: 0.54, thick: 0.030,
    notch: 0.018, notchW: 0.34, taper: 0.13, domeY: 0.16, segA: Math.max(18,Q.visA-12), segV: Q.visV+1
  }), M.lens);
  const bridge = mesh(glassesGroup,new THREE.BoxGeometry(.18,.075,.095),M.frame,V3(0,1.865,.782),null,new THREE.Euler(0,0,0));
  const bridgeCap = mesh(glassesGroup,new THREE.BoxGeometry(.085,.16,.065),M.frame,V3(0,1.825,.790),null,new THREE.Euler(0,0,0));
  const browL = mesh(glassesGroup, wrapShell({
    rx:.814,rz:.785,yc:2.010,half:.026,span:.93,centerA:-.54,thick:.040,taper:.12,domeY:.06,segA:Math.max(16,Q.visA-14),segV:2
  }),M.frame);
  const browR = mesh(glassesGroup, wrapShell({
    rx:.814,rz:.785,yc:2.010,half:.026,span:.93,centerA:.54,thick:.040,taper:.12,domeY:.06,segA:Math.max(16,Q.visA-14),segV:2
  }),M.frame);

  // --- headphones --------------------------------------------------------
  function earCup(side) {
    const g = new THREE.Group();
    g.position.set(side * 0.795, 1.862, -0.025);
    g.rotation.z = -side * Math.PI / 2;
    g.rotation.y = side * 0.05;
    body.add(g);
    mesh(g, latheOf(cupProf, Q.cupSeg), M.frame, V3(0, -0.02, 0), V3(1.0, 1.0, 1.0));
    mesh(g, latheOf(cupProf, Q.cupSeg), M.cup, V3(0, 0.02, 0), V3(0.86, 0.72, 0.86));
    mesh(g, latheOf(cupProf, Q.cupSeg), M.pad, V3(0, -0.10, 0), V3(0.72, 0.55, 0.72));
    mesh(g, new THREE.TorusGeometry(0.235, 0.028, 7, 24), M.cupAccent, V3(0, 0.168, 0), null, new THREE.Euler(Math.PI / 2, 0, 0));
    mesh(g, new THREE.CylinderGeometry(0.075, 0.075, 0.055, 14), M.trim, V3(0, 0.205, 0));
    return g;
  }
  const cupL = earCup(-1), cupR = earCup(1);

  const band = mesh(body, swept({
    path: [V3(-0.79, 1.98, -0.05), V3(-0.60, 2.36, -0.12), V3(0, 2.60, -0.17), V3(0.60, 2.36, -0.12), V3(0.79, 1.98, -0.05)],
    seg: 26, radial: 10, up: V3(0, 0, 1),
    width: t => 0.185 - 0.03 * Math.sin(t * Math.PI),
    thick: t => 0.115 + 0.02 * Math.sin(t * Math.PI)
  }), M.frame);
  const bandPad = mesh(body, swept({
    path: [V3(-0.48, 2.30, -0.13), V3(0, 2.545, -0.185), V3(0.48, 2.30, -0.13)],
    seg: 14, radial: 9, up: V3(0, 0, 1),
    width: () => 0.155, thick: () => 0.075
  }), M.cupAccent);

  // --- hair --------------------------------------------------------------
  const hairGroup = new THREE.Group(); body.add(hairGroup);
  const LOCKS = [
    // front cowlick / hero sweep
    [[-0.04,2.39,0.38],[-0.02,2.70,0.36],[-0.18,2.98,0.12],1.14],
    [[0.11,2.40,0.39],[0.32,2.72,0.34],[0.72,2.91,0.10],1.17],
    [[-0.21,2.36,0.34],[-0.38,2.62,0.31],[-0.67,2.78,0.07],1.08],
    [[0.28,2.36,0.32],[0.53,2.58,0.27],[0.83,2.69,0.02],1.05],
    // upper crown spikes
    [[-0.10,2.40,0.25],[-0.15,2.67,0.13],[-0.24,2.84,-0.08],1.00],
    [[0.13,2.40,0.26],[0.21,2.72,0.14],[0.35,2.87,-0.04],1.05],
    [[0.00,2.49,0.08],[0.03,2.80,-0.02],[0.00,2.98,-0.25],1.00],
    [[-0.34,2.33,0.13],[-0.50,2.60,0.00],[-0.63,2.73,-0.21],1.00],
    [[0.38,2.31,0.11],[0.56,2.57,-0.01],[0.72,2.67,-0.23],1.03],
    // side/back volume and smaller spikes
    [[-0.23,2.42,-0.16],[-0.31,2.65,-0.34],[-0.39,2.72,-0.59],0.90],
    [[0.25,2.40,-0.18],[0.35,2.62,-0.36],[0.46,2.68,-0.60],0.92],
    [[-0.53,2.15,0.03],[-0.66,2.33,-0.10],[-0.74,2.40,-0.34],0.86],
    [[0.55,2.13,0.01],[0.68,2.30,-0.13],[0.78,2.36,-0.36],0.88],
    [[-0.61,2.23,-0.16],[-0.72,2.38,-0.32],[-0.78,2.43,-0.52],0.72],
    [[0.62,2.21,-0.17],[0.73,2.36,-0.34],[0.82,2.40,-0.54],0.74],
    [[-0.34,2.30,-0.42],[-0.39,2.50,-0.56],[-0.40,2.55,-0.72],0.67],
    [[0.34,2.28,-0.44],[0.40,2.47,-0.58],[0.42,2.52,-0.74],0.69]
  ];
  const hairMeshes = [];
  for (const L of LOCKS) {
    const pts = [V3(...L[0]), V3(...L[1]), V3(...L[2])];
    const k = L[3];
    let up = V3(L[0][0], 0, L[0][2]);
    if (up.lengthSq() < 1e-4) up.set(0, 0, 1); else up.normalize();
    const m = mesh(hairGroup, swept({
      path: pts, seg: Q.lockSeg, radial: Q.lockRad, up,
      width: t => k * (0.32 - 0.105 * t - 0.215 * Math.pow(t, 3)),
      thick: t => k * (0.168 - 0.050 * t - 0.118 * Math.pow(t, 3))
    }), M.hair);
    hairMeshes.push(m);
  }

  // --- arms --------------------------------------------------------------
  function buildArm(side, pose) {
    const pivot = new THREE.Group();
    const px = side * 0.505, py = 1.145, pz = 0.02;
    pivot.position.set(px, py, pz);
    body.add(pivot);
    const off = V3(-px, -py, -pz);

    const sleeve = swept({
      path: [V3(side * 0.24, 1.235, 0.00), V3(side * 0.50, 1.150, 0.02), V3(side * 0.635, 1.020, 0.05)],
      seg: Q.limbSeg - 3, radial: Q.limbRad, up: V3(0, 1, 0),
      width: t => 0.455 - 0.10 * t, thick: t => 0.435 - 0.09 * t
    });
    sleeve.translate(off.x, off.y, off.z);
    mesh(pivot, sleeve, M.shirt);

    const arm = swept({
      path: pose.arm.map(p => V3(p[0] * side, p[1], p[2])),
      seg: Q.limbSeg, radial: Q.limbRad, up: V3(0, 1, 0),
      width: t => 0.335 - 0.045 * t, thick: t => 0.325 - 0.04 * t
    });
    arm.translate(off.x, off.y, off.z);
    mesh(pivot, arm, M.skinPlain);

    const fistGeo = latheOf(fistProf, Q.fistSeg);
    fistGeo.translate(pose.fist[0] * side + off.x, pose.fist[1] + off.y, pose.fist[2] + off.z);
    const fist = mesh(pivot, fistGeo, M.skinPlain);
    fist.scale.set(1.08, 1.0, 1.02);

    const thumb = swept({
      path: pose.thumb.map(p => V3(p[0] * side, p[1], p[2])),
      seg: 6, radial: 8, up: V3(0, 1, 0),
      width: t => 0.135 - 0.03 * t, thick: t => 0.125 - 0.03 * t
    });
    thumb.translate(off.x, off.y, off.z);
    mesh(pivot, thumb, M.skinPlain);
    // knuckle ridge
    const kn = swept({
      path: [V3((pose.fist[0] - 0.14) * side, pose.fist[1] + 0.09, pose.fist[2] + 0.08),
             V3((pose.fist[0] + 0.13) * side, pose.fist[1] + 0.09, pose.fist[2] + 0.10)],
      seg: 4, radial: 8, up: V3(0, 1, 0),
      width: () => 0.09, thick: () => 0.075
    });
    kn.translate(off.x, off.y, off.z);
    mesh(pivot, kn, M.skinPlain);
    return pivot;
  }

  const armL = buildArm(-1, {                     // relaxed, fist by the hip
    arm: [[0.62, 1.030, 0.05], [0.68, 0.900, 0.10], [0.665, 0.790, 0.17]],
    fist: [0.645, 0.700, 0.215],
    thumb: [[0.545, 0.740, 0.245], [0.505, 0.700, 0.315]]
  });
  const armR = buildArm(1, {                      // fist up and forward
    arm: [[0.62, 1.030, 0.06], [0.66, 0.985, 0.24], [0.60, 0.975, 0.40]],
    fist: [0.565, 0.965, 0.505],
    thumb: [[0.470, 1.010, 0.545], [0.405, 1.030, 0.605]]
  });
  armR.rotation.x = -0.10;

  // --- controller / action pose -----------------------------------------
  const controllerGroup=new THREE.Group();
  controllerGroup.position.set(0,1.00,.60);controllerGroup.rotation.x=-.10;controllerGroup.visible=false;body.add(controllerGroup);
  const controllerBody=mesh(controllerGroup,new THREE.CapsuleGeometry(.135,.34,5,14),M.frame,V3(0,0,0),V3(1.18,1.0,1.12),new THREE.Euler(0,0,Math.PI/2));
  const controllerPlate=mesh(controllerGroup,new THREE.BoxGeometry(.45,.075,.23),M.cup,V3(0,.045,.015),null,new THREE.Euler(0,0,0));
  const gripL=mesh(controllerGroup,new THREE.SphereGeometry(.13,14,10),M.frame,V3(-.25,-.035,.00),V3(.9,1.25,.95));
  const gripR=mesh(controllerGroup,new THREE.SphereGeometry(.13,14,10),M.frame,V3(.25,-.035,.00),V3(.9,1.25,.95));
  const stickGeo=new THREE.CylinderGeometry(.035,.045,.055,10);
  const stickL=mesh(controllerGroup,stickGeo,M.darkPlain,V3(-.10,.10,.085));
  const stickR=mesh(controllerGroup,stickGeo,M.darkPlain,V3(.10,.10,.085));
  const buttonGeo=new THREE.SphereGeometry(.025,8,6);
  mesh(controllerGroup,buttonGeo,M.trim,V3(.16,.10,.10));mesh(controllerGroup,buttonGeo,M.cupAccent,V3(.22,.075,.10));
  const controllerEmitter=new THREE.Object3D();controllerEmitter.position.set(0,.02,.20);controllerGroup.add(controllerEmitter);
  let actionActive=false,actionBlend=0;

  // --- legs and sneakers -------------------------------------------------
  function buildShoe(parent, side) {
    const g = new THREE.Group();
    g.position.set(0, -0.375, 0.02);
    g.rotation.y = side * 0.10;
    parent.add(g);

    mesh(g, shoeSweep({
      n: 4.2, segZ: Q.shoeZ, segK: Q.shoeK,
      slices: [
        [-0.245, 0.080, 0.042, 0.048], [-0.200, 0.140, 0.064, 0.066],
        [-0.100, 0.170, 0.072, 0.074], [0.050, 0.180, 0.074, 0.076],
        [0.200, 0.184, 0.072, 0.074], [0.320, 0.170, 0.064, 0.068],
        [0.400, 0.132, 0.050, 0.060], [0.445, 0.062, 0.028, 0.052]
      ]
    }), M.sole);

    mesh(g, shoeSweep({
      n: 2.5, segZ: Q.shoeZ, segK: Q.shoeK,
      slices: [
        [-0.225, 0.090, 0.108, 0.190], [-0.185, 0.152, 0.140, 0.200],
        [-0.080, 0.174, 0.145, 0.194], [0.045, 0.176, 0.128, 0.182],
        [0.165, 0.171, 0.102, 0.166], [0.285, 0.157, 0.079, 0.149],
        [0.375, 0.121, 0.058, 0.135], [0.430, 0.056, 0.032, 0.126]
      ]
    }), M.shoe);

    mesh(g, shoeSweep({                       // white toe cap
      n: 2.8, segZ: Q.shoeZ - 8, segK: Q.shoeK - 4,
      slices: [
        [0.175, 0.174, 0.098, 0.164], [0.265, 0.161, 0.081, 0.150],
        [0.360, 0.128, 0.061, 0.136], [0.432, 0.058, 0.034, 0.126]
      ]
    }), M.sole);

    mesh(g, new THREE.TorusGeometry(0.145, 0.036, 7, 22), M.trim,
      V3(0, 0.300, -0.150), V3(1.05, 1, 1.15), new THREE.Euler(Math.PI / 2, 0, 0));

    for (const s of [-1, 1]) {                 // side flash in the trim colour
      const st = swept({
        path: [V3(s * 0.168, 0.155, -0.145), V3(s * 0.182, 0.120, 0.020), V3(s * 0.150, 0.150, 0.230)],
        seg: 10, radial: 6, up: V3(0, 1, 0),
        width: () => 0.030, thick: t => 0.095 - 0.03 * t
      });
      mesh(g, st, M.trim);
    }
    return g;
  }

  function buildLeg(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.245, 0.585, 0.00);
    body.add(pivot);
    const leg = swept({
      path: [V3(side * 0.235, 0.660, -0.01), V3(side * 0.243, 0.450, 0.00), V3(side * 0.248, 0.255, 0.02)],
      seg: Q.limbSeg - 4, radial: Q.limbRad, up: V3(0, 1, 0),
      width: t => 0.335 - 0.055 * t, thick: t => 0.325 - 0.05 * t
    });
    leg.translate(-pivot.position.x, -pivot.position.y, -pivot.position.z);
    mesh(pivot, leg, M.darkPlain);
    const shoe = buildShoe(pivot, side);
    return { pivot, shoe };
  }
  const legL = buildLeg(-1), legR = buildLeg(1);


  // Merge sibling meshes that share a material. Cuts draw calls (and shadow-pass
  // draw calls) roughly 4x without touching the rig hierarchy.
  function mergeByMaterial(group) {
    const buckets = new Map();
    for (const child of group.children.slice()) {
      if (!child.isMesh || child.userData.keep) continue;
      const arr = buckets.get(child.material) || [];
      arr.push(child); buckets.set(child.material, arr);
    }
    for (const [mat, list] of buckets) {
      if (list.length < 2) continue;
      const pos = [], nor = [], uv = [], idx = [];
      let base = 0;
      const nm = new THREE.Matrix3(), v = new THREE.Vector3();
      for (const m of list) {
        m.updateMatrix();
        nm.getNormalMatrix(m.matrix);
        const g = m.geometry, pa = g.attributes.position, na = g.attributes.normal, ua = g.attributes.uv;
        for (let i = 0; i < pa.count; i++) {
          v.fromBufferAttribute(pa, i).applyMatrix4(m.matrix); pos.push(v.x, v.y, v.z);
          if (na) { v.fromBufferAttribute(na, i).applyMatrix3(nm).normalize(); nor.push(v.x, v.y, v.z); }
          else nor.push(0, 1, 0);
          if (ua) uv.push(ua.getX(i), ua.getY(i)); else uv.push(0, 0);
        }
        const ix = g.getIndex();
        if (ix) for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + base);
        else for (let i = 0; i < pa.count; i++) idx.push(i + base);
        base += pa.count;
        group.remove(m);
        const k = all.indexOf(m); if (k >= 0) all.splice(k, 1);
        g.dispose();
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx);
      const m = new THREE.Mesh(g, mat);
      m.castShadow = true; m.receiveShadow = true; m.layers.set(1);
      group.add(m); all.push(m);
    }
  }

  for (const g of [body, hairGroup, cupL, cupR, armL, armR, legL.pivot, legR.pivot, legL.shoe, legR.shoe]) mergeByMaterial(g);

  /* --------------------------------------------------------------------- */
  /* CHARACTER-ONLY LIGHT RIG (render layer 1)                              */
  /* --------------------------------------------------------------------- */

  const lightTarget = new THREE.Object3D();
  lightTarget.position.set(0, 1.55, 0);
  root.add(lightTarget);

  function charLight(color, intensity, pos) {
    const l = new THREE.DirectionalLight(color, intensity);
    l.position.set(pos[0], pos[1], pos[2]);
    l.target = lightTarget;
    l.layers.set(1);                       // touches nothing but this character
    root.add(l);
    return l;
  }
  const charAmbient = new THREE.HemisphereLight(0x6d6193, 0x2c1c10, 0.62);
  charAmbient.layers.set(1);
  root.add(charAmbient);

  const rimMagenta = charLight(0xff3fb4, 1.45, [-3.4, 3.4, -3.0]);
  const rimCyan = charLight(0x38d8ff, 1.15, [3.6, 2.6, -2.6]);
  const fill = charLight(0x8f7fff, 0.42, [0.4, 1.2, 4.2]);

  const charKey = new THREE.DirectionalLight(0xfff0d8, 1.9);
  charKey.position.set(-2.4, 4.4, 3.2);
  charKey.target = lightTarget;
  charKey.layers.set(1);
  charKey.castShadow = true;
  charKey.shadow.mapSize.set(HI ? 1024 : 512, HI ? 1024 : 512);
  const sc = charKey.shadow.camera;
  sc.left = -1.7; sc.right = 1.7; sc.top = 3.4; sc.bottom = -0.6; sc.near = 0.5; sc.far = 14;
  sc.updateProjectionMatrix();
  charKey.shadow.bias = -0.0006;
  charKey.shadow.normalBias = 0.022;
  charKey.shadow.autoUpdate = true;        // one small object; cheap every frame
  root.add(charKey);

  /* --------------------------------------------------------------------- */
  /* ANIMATION                                                              */
  /* --------------------------------------------------------------------- */

  const BASE = { mag: 1.45, cyan: 1.15, fill: 0.42, key: 1.9, amb: 0.62 };
  let roomMult = 1;
  function setRoomLight(mult) {
    roomMult = mult;
    charAmbient.intensity = BASE.amb * mult;
    fill.intensity = BASE.fill * mult;
    charKey.intensity = BASE.key * (0.45 + 0.55 * mult);
  }

  const MODES = ['idle', 'walk', 'run'];
  let motion = 'idle';
  const home = { x: 0, z: 0, ry: 0 };

  function update(t, dt, fx) {
    fx = fx || 0;
    const walk = motion === 'walk', run = motion === 'run';
    const move = walk ? 0.62 : (run ? 1 : 0);
    const speed = walk ? 3.0 : (run ? 5.25 : 1.0);
    const cy = t * speed;
    const breath = Math.sin(t * 1.65), step = Math.sin(cy), step2 = Math.sin(cy + Math.PI);
    const b = move ? Math.abs(Math.sin(cy)) * (run ? 0.075 : 0.045) : 0.026 * breath;

    bob.position.y = b;
    bob.rotation.z = (move ? 0.045 : 0.022) * Math.sin(cy * 0.5);
    body.rotation.y = 0.035 * Math.sin(t * 0.43);
    body.rotation.x = 0.015 * Math.sin(t * 0.57);

    shirt.scale.y = 1 + 0.022 * breath + 0.016 * move * Math.sin(cy * 2);
    head.position.y = 0.008 * breath;
    hairCap.position.y = head.position.y;
    hairGroup.position.y = head.position.y;

    actionBlend += ((actionActive?1:0)-actionBlend)*Math.min(1,dt*9.5);
    controllerGroup.visible=actionBlend>.025;
    controllerGroup.scale.setScalar(.92+.08*actionBlend);
    const armLX=0.08 + step * move * (run ? 0.90 : 0.62);
    const armRX=-0.08 - step * move * (run ? 0.84 : 0.58);
    const armLZ=0.07 - 0.15 * move * Math.sin(cy * 0.5);
    const armRZ=-0.07 + 0.13 * move * Math.sin(cy * 0.5);
    armL.rotation.x=THREE.MathUtils.lerp(armLX,-1.04,actionBlend);
    armR.rotation.x=THREE.MathUtils.lerp(armRX,-1.04,actionBlend);
    armL.rotation.z=THREE.MathUtils.lerp(armLZ,.62,actionBlend);
    armR.rotation.z=THREE.MathUtils.lerp(armRZ,-.62,actionBlend);
    armL.position.x=THREE.MathUtils.lerp(-.505,-.425,actionBlend);
    armR.position.x=THREE.MathUtils.lerp(.505,.425,actionBlend);
    armL.position.z=THREE.MathUtils.lerp(.02,.09,actionBlend);
    armR.position.z=THREE.MathUtils.lerp(.02,.09,actionBlend);

    legL.pivot.rotation.x = -step * move * (run ? 0.82 : 0.58);
    legR.pivot.rotation.x = -step2 * move * (run ? 0.82 : 0.58);
    legL.pivot.rotation.z = .035 * move * Math.sin(cy);
    legR.pivot.rotation.z = -.035 * move * Math.sin(cy);
    legL.shoe.rotation.x = Math.max(0, step) * move * (run?.34:.25);
    legR.shoe.rotation.x = Math.max(0, step2) * move * (run?.34:.25);
    legL.shoe.position.y = -.375 + Math.max(0,-step) * move * (run?.16:.11);
    legR.shoe.position.y = -.375 + Math.max(0,-step2) * move * (run?.16:.11);
    legL.shoe.position.z = .02 + Math.max(0,step) * move * .055;
    legR.shoe.position.z = .02 + Math.max(0,step2) * move * .055;

    hairGroup.rotation.z = 0.018 * Math.sin(t * 1.2) + 0.032 * move * Math.sin(cy * 0.5 + 0.5);
    hairGroup.rotation.x = 0.022 * Math.sin(t * 0.9) + 0.045 * move * Math.sin(cy + 0.8);

    M.lens.emissiveIntensity = 0.38 + 0.12 * (0.5 + 0.5 * Math.sin(t * 1.9)) + fx * 0.20;
    M.shirt.emissiveIntensity = 0.26 + 0.10 * fx;
    rimMagenta.intensity = (BASE.mag + fx * 0.55) * (0.55 + 0.45 * roomMult);
    rimCyan.intensity = (BASE.cyan + fx * 0.40) * (0.55 + 0.45 * roomMult);

    root.position.x = home.x + 0.025 * Math.sin(t * 0.39);
    root.position.z = home.z + (move ? 0.035 : 0) * Math.sin(cy * 0.5);
    root.rotation.y = home.ry + 0.025 * Math.sin(t * 0.31);

    blobMat.opacity = 0.55 - 0.10 * move - b * 0.35 + 0.05 * fx;
    blob.scale.set(1 - b * 0.22, 1 - b * 0.14, 1);
  }

  function setColorway(name) {
    P = PALETTES[name] || PALETTES.teal;
    const c = shirtCanvases();
    shirtTex.image = c.alb; shirtTex.needsUpdate = true;
    shirtEmi.image = c.emi; shirtEmi.needsUpdate = true;
    shirtRgh.image = c.rgh; shirtRgh.needsUpdate = true;
    M.cup.color.set(0x25c6cf); M.cupAccent.color.set(0xff9d35);
    M.trim.color.set(0xef4fa8); M.shoe.color.set(P.shirt);
    return name;
  }

  if (cfg.height) {
    const bb = new THREE.Box3().setFromObject(body);
    root.scale.setScalar(cfg.height / Math.max(0.001, bb.max.y));
  }

  return {
    root, body, head, all,
    lights: [rimMagenta, rimCyan, fill, charKey],
    materials: M,
    get motion() { return motion; },
    setMotion(m) { motion = MODES.indexOf(m) >= 0 ? m : 'idle'; return motion; },
    cycleMotion() { motion = MODES[(MODES.indexOf(motion) + 1) % MODES.length]; return motion; },
    setColorway, setRoomLight,
    setHome(x, z, ry) { home.x = x; home.z = z; home.ry = ry || 0; root.position.set(x, root.position.y, z); },
    setVisible(v) { root.visible = v; },
    setAction(v){actionActive=!!v;return actionActive;},
    get action(){return actionActive;},
    controllerGroup, controllerEmitter,
    update
  };
}

export { createGamerBro };
