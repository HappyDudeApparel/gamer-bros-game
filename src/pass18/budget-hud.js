export function createPass18BudgetHud({ renderer, registry, spatial, enabled = new URLSearchParams(location.search).get('debug') === '1' }) {
  if (!enabled) return { update() {}, element: null };
  const el = document.createElement('pre');
  el.id = 'pass18BudgetHud';
  Object.assign(el.style, {
    position: 'fixed', right: '10px', top: '10px', zIndex: 50, margin: 0,
    padding: '9px 11px', borderRadius: '10px', color: '#fff', background: '#10212ddd',
    font: '700 10px/1.35 ui-monospace,SFMono-Regular,Consolas,monospace', pointerEvents: 'none',
    whiteSpace: 'pre-wrap', maxWidth: '46vw'
  });
  document.body.appendChild(el);
  const samples = [];
  let last = performance.now();
  let lastPaint = 0;
  function update(now = performance.now()) {
    const dt = now - last; last = now;
    if (dt > 0 && dt < 250) { samples.push(dt); if (samples.length > 120) samples.shift(); }
    if (now - lastPaint < 250) return;
    lastPaint = now;
    const avg = samples.length ? samples.reduce((a,b)=>a+b,0)/samples.length : 0;
    const fps = avg ? 1000 / avg : 0;
    const r = renderer.info.render;
    const m = renderer.info.memory;
    const a = registry.snapshot();
    const s = spatial.snapshot();
    const warnings = [];
    if (r.calls > 180) warnings.push('CALLS');
    if (r.triangles > 350000) warnings.push('TRIS');
    if (avg > 40) warnings.push('FRAME');
    el.textContent = [
      `PASS 18 DEBUG ${warnings.length ? '⚠ '+warnings.join(',') : '✓'}`,
      `${fps.toFixed(1)} fps · ${avg.toFixed(1)} ms`,
      `${r.calls} calls · ${r.triangles} tris`,
      `${m.geometries} geom · ${m.textures} tex`,
      `${a.sourceLoads} loads · ${a.cacheHits} hits · ${a.uniqueSources} sources`,
      `${a.placements} placements · ${a.instancedInstances} instanced · ${a.staticBatchInstances} batched`,
      `${s.visibleGroups}/${s.totalVisualGroups} visual groups · ${s.collisionCandidates}/${s.totalColliders} collision candidates`
    ].join('\n');
  }
  return { update, element: el };
}
