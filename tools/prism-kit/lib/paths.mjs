// Canonical paths for the Prism Kit tooling. Single source of truth so no
// stage has to guess a directory name.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(HERE, '..', '..', '..');

export const CACHE_DIR = path.join(REPO_ROOT, '.prism-cache');
export const TOOLS_CACHE_DIR = path.join(CACHE_DIR, 'tools');
export const ASSETS_DIR = path.join(REPO_ROOT, 'assets', 'prism-kit');
export const PREVIEW_SRC_DIR = path.join(REPO_ROOT, 'src', 'prism-preview');
export const REFERENCES_DIR = path.join(REPO_ROOT, 'references', 'prism-valley');
export const PROOF_DIR = path.join(REPO_ROOT, 'proof', 'prism-kit');
export const PER_ASSET_TOOLS_DIR = path.join(REPO_ROOT, 'tools', 'prism-kit', 'assets');

export function assetCacheDir(asset) {
  return path.join(CACHE_DIR, asset);
}

export function checkpointPath(asset) {
  return path.join(assetCacheDir(asset), 'state.json');
}

export function capsulePath(asset) {
  return path.join(assetCacheDir(asset), 'failure-capsule.json');
}

export function doctorReportPath() {
  return path.join(CACHE_DIR, 'doctor-report.json');
}
