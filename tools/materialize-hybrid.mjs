import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const runtimePath = path.join(root, 'hybrid-v09/runtime/main.js');
const runtime = await fs.readFile(runtimePath, 'utf8');
const start = runtime.indexOf('function patchRuntime(source){');
const end = runtime.indexOf('\ntry{', start);
if (start < 0 || end < 0) throw new Error('Could not locate patchRuntime() in Hybrid runtime.');

const fnSource = runtime.slice(start, end);
const patchRuntime = new Function(`${fnSource}\nreturn patchRuntime;`)();

const chunkDir = path.join(root, 'hybrid-v09/src/chunks');
const parts = [];
for (let i = 1; i <= 10; i += 1) {
  const name = String(i).padStart(2, '0') + '.txt';
  parts.push(await fs.readFile(path.join(chunkDir, name), 'utf8'));
}

const materialized = patchRuntime(parts.join(''));
const banner = `// HYBRID v0.9 — materialized source\n// Generated once from the Phase 2D runtime patch stack so future work can edit real source.\n// Do not regenerate after M1 de-patch is accepted.\n\n`;
await fs.writeFile(path.join(root, 'hybrid-v09/src/game.js'), banner + materialized, 'utf8');
console.log(`Materialized ${materialized.length} bytes into hybrid-v09/src/game.js`);
