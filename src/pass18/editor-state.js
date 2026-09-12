export const PASS18_EDITOR_SCHEMA = '18-1B.0';

function round4(value) {
  return Math.round(Number(value) * 10000) / 10000;
}

function vec3(value, fallback = [0, 0, 0]) {
  const v = Array.isArray(value) ? value : fallback;
  return [round4(v[0] || 0), round4(v[1] || 0), round4(v[2] || 0)];
}

function scale3(value) {
  if (Array.isArray(value)) return [round4(value[0] ?? 1), round4(value[1] ?? 1), round4(value[2] ?? 1)];
  const scalar = Number.isFinite(Number(value)) ? Number(value) : 1;
  return [round4(scalar), round4(scalar), round4(scalar)];
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function pass18ChunkKey(position, cellSize = 24) {
  const p = vec3(position);
  return `${Math.floor(p[0] / cellSize)},${Math.floor(p[2] / cellSize)}`;
}

export function pass18SnapPosition(position, {
  snapGrid = true,
  snapVertical = true,
  gridStep = 0.5,
  verticalStep = 0.25,
} = {}) {
  const [x, y, z] = vec3(position);
  const snap = (value, step) => step > 0 ? Math.round(value / step) * step : value;
  return [
    round4(snapGrid ? snap(x, gridStep) : x),
    round4(snapVertical ? snap(y, verticalStep) : y),
    round4(snapGrid ? snap(z, gridStep) : z),
  ];
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function centroid(points) {
  if (!points.length) return [0, 0, 0];
  const sum = points.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]);
  return sum.map(v => round4(v / points.length));
}

export class Pass18EditorDocument {
  constructor({ cellSize = 24, sections = [] } = {}) {
    this.cellSize = cellSize;
    this.sections = clone(sections);
    this.snap = { snapGrid: true, snapVertical: true, gridStep: 0.5, verticalStep: 0.25 };
    this.placements = new Map();
    this.polylines = new Map();
    this.cameras = new Map();
    this.sequence = { placement: 0, polyline: 0, camera: 0 };
  }

  configureSnap(patch = {}) {
    this.snap = { ...this.snap, ...patch };
    return { ...this.snap };
  }

  snapPosition(position) {
    return pass18SnapPosition(position, this.snap);
  }

  nearestSection(position) {
    if (!this.sections.length) return null;
    const [x, y, z] = vec3(position);
    let best = null;
    let distance = Infinity;
    for (const section of this.sections) {
      const [sx, sy, sz] = section.center || [0, 0, 0];
      const d = Math.hypot(x - sx, (y - sy) * 0.35, z - sz);
      if (d < distance) { distance = d; best = section.id; }
    }
    return best;
  }

  _id(type, prefix) {
    this.sequence[type] += 1;
    return `${prefix}${String(this.sequence[type]).padStart(4, '0')}`;
  }

  _positionMeta(position, section = null) {
    const p = this.snapPosition(position);
    return {
      position: p,
      section: section || this.nearestSection(p),
      chunk: pass18ChunkKey(p, this.cellSize),
    };
  }

  addPlacement({
    asset,
    position = [0, 0, 0],
    rotationY = 0,
    scale = [1, 1, 1],
    targetMax = 3,
    section = null,
    mode = 'manual',
    tags = [],
  }) {
    if (!asset) throw new Error('Placement asset is required');
    const meta = this._positionMeta(position, section);
    const record = {
      id: this._id('placement', 'p'),
      asset,
      ...meta,
      rotationY: round4(rotationY),
      scale: scale3(scale),
      targetMax: round4(targetMax),
      mode,
      tags: [...tags],
    };
    this.placements.set(record.id, record);
    return clone(record);
  }

  updatePlacement(id, patch = {}) {
    const existing = this.placements.get(id);
    if (!existing) throw new Error(`Unknown placement ${id}`);
    const next = { ...existing };
    if ('position' in patch) Object.assign(next, this._positionMeta(patch.position, patch.section || existing.section));
    if ('section' in patch && !('position' in patch)) next.section = patch.section;
    if ('rotationY' in patch) next.rotationY = round4(patch.rotationY);
    if ('scale' in patch) next.scale = scale3(patch.scale);
    if ('targetMax' in patch) next.targetMax = round4(patch.targetMax);
    if ('tags' in patch) next.tags = [...patch.tags];
    if ('mode' in patch) next.mode = patch.mode;
    next.chunk = pass18ChunkKey(next.position, this.cellSize);
    this.placements.set(id, next);
    return clone(next);
  }

  removePlacement(id) {
    const record = this.placements.get(id);
    this.placements.delete(id);
    return record ? clone(record) : null;
  }

  scatter({ asset, center, count = 6, radius = 3, seed = 1801, targetMax = 2.8, section = null }) {
    if (!asset) throw new Error('Scatter asset is required');
    const rng = mulberry32(seed);
    const c = vec3(center);
    const created = [];
    const total = Math.max(1, Math.min(64, Math.round(count)));
    const r = Math.max(0, Number(radius) || 0);
    for (let i = 0; i < total; i += 1) {
      const angle = rng() * Math.PI * 2;
      const distance = Math.sqrt(rng()) * r;
      const point = [c[0] + Math.cos(angle) * distance, c[1], c[2] + Math.sin(angle) * distance];
      created.push(this.addPlacement({
        asset,
        position: point,
        rotationY: rng() * Math.PI * 2,
        scale: 0.86 + rng() * 0.3,
        targetMax,
        section,
        mode: 'scatter',
        tags: ['scatter'],
      }));
    }
    return created;
  }

  addPolyline({ role, points, assetHint = null, spacing = 1.5, width = 1.2, section = null }) {
    if (!['path', 'fence'].includes(role)) throw new Error(`Unsupported polyline role ${role}`);
    if (!Array.isArray(points) || points.length < 2) throw new Error('Polyline requires at least two points');
    const snapped = points.map(point => this.snapPosition(point));
    const center = centroid(snapped);
    const record = {
      id: this._id('polyline', role === 'path' ? 'path' : 'fence'),
      role,
      points: snapped,
      assetHint,
      spacing: round4(spacing),
      width: round4(width),
      section: section || this.nearestSection(center),
      chunk: pass18ChunkKey(center, this.cellSize),
    };
    this.polylines.set(record.id, record);
    return clone(record);
  }

  removePolyline(id) {
    const record = this.polylines.get(id);
    this.polylines.delete(id);
    return record ? clone(record) : null;
  }

  addCamera({ label = '', position, target, fov = 46, section = null }) {
    const p = vec3(position);
    const t = vec3(target);
    const record = {
      id: this._id('camera', 'cam'),
      label: label || `Camera ${this.sequence.camera}`,
      position: p,
      target: t,
      fov: round4(fov),
      section: section || this.nearestSection(t),
      chunk: pass18ChunkKey(t, this.cellSize),
    };
    this.cameras.set(record.id, record);
    return clone(record);
  }

  snapshot() {
    const chunks = new Set();
    this.placements.forEach(record => chunks.add(record.chunk));
    this.polylines.forEach(record => chunks.add(record.chunk));
    this.cameras.forEach(record => chunks.add(record.chunk));
    return {
      schema: PASS18_EDITOR_SCHEMA,
      cellSize: this.cellSize,
      placements: this.placements.size,
      polylines: this.polylines.size,
      cameras: this.cameras.size,
      chunks: chunks.size,
      snap: { ...this.snap },
    };
  }

  exportObject({ name = 'Prism Valley authoring', includeGeneratedAt = false } = {}) {
    const chunks = new Map();
    const ensure = key => {
      if (!chunks.has(key)) chunks.set(key, { id: key, placements: [], polylines: [], cameras: [] });
      return chunks.get(key);
    };
    [...this.placements.values()].sort((a, b) => a.id.localeCompare(b.id)).forEach(record => ensure(record.chunk).placements.push(clone(record)));
    [...this.polylines.values()].sort((a, b) => a.id.localeCompare(b.id)).forEach(record => ensure(record.chunk).polylines.push(clone(record)));
    [...this.cameras.values()].sort((a, b) => a.id.localeCompare(b.id)).forEach(record => ensure(record.chunk).cameras.push(clone(record)));
    const output = {
      version: PASS18_EDITOR_SCHEMA,
      type: 'pass18-world-authoring',
      name,
      sourceWorld: 'data/pass18/world-skeleton.json',
      cellSize: this.cellSize,
      snap: { ...this.snap },
      chunks: [...chunks.values()].sort((a, b) => a.id.localeCompare(b.id)),
      summary: this.snapshot(),
    };
    if (includeGeneratedAt) output.generatedAt = new Date().toISOString();
    return output;
  }

  exportJSON(options = {}) {
    return JSON.stringify(this.exportObject(options), null, 2);
  }
}
