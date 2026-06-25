// Smoke-test for the shipped default dashboard (src/studio/project.ts).
//
// The default project is stored as template strings, so `tsc` never type-checks
// it — a broken starter dashboard would only surface on a user's install. This
// script reproduces the in-browser compile pipeline (Sucrase transpile + import
// resolution across the virtual files) so CI fails fast if the default breaks.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname as pathDirname, join } from 'node:path';
import { transform } from 'sucrase';

const here = pathDirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// Module names provided by the runtime registry (src/studio/runtime.ts).
// Imports of these resolve to the host environment rather than to a file.
const REGISTRY = new Set([
  'react',
  'react/jsx-runtime',
  '@ha',
  '@ha/ui',
  '@ha/format',
]);

// Keep in sync with src/studio/compile.ts.
const RESOLVE_EXTS = ['', '.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts'];

function dirname(path) {
  const i = path.lastIndexOf('/');
  return i === -1 ? '' : path.slice(0, i);
}

function joinPath(base, rel) {
  const parts = base ? base.split('/') : [];
  for (const seg of rel.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  return parts.join('/');
}

function resolve(files, importer, request) {
  if (REGISTRY.has(request)) return request;
  const base = request.startsWith('.')
    ? joinPath(dirname(importer), request)
    : request;
  for (const ext of RESOLVE_EXTS) {
    if (base + ext in files) return base + ext;
  }
  throw new Error(`Unresolved import '${request}' in ${importer}`);
}

function extractImports(source) {
  const re = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  const out = [];
  let m;
  while ((m = re.exec(source)) !== null) out.push(m[1]);
  return out;
}

// Load DEFAULT_PROJECT by transpiling project.ts (it has no runtime imports).
const projectSrc = readFileSync(join(root, 'src/studio/project.ts'), 'utf8');
const projectJs = transform(projectSrc, {
  transforms: ['typescript', 'imports'],
  production: true,
}).code;
const mod = { exports: {} };
new Function('require', 'module', 'exports', projectJs)(
  (r) => {
    throw new Error(`project.ts must have no runtime imports (got '${r}')`);
  },
  mod,
  mod.exports,
);

const project = mod.exports.DEFAULT_PROJECT;
if (!project || !project.files || !project.entry) {
  throw new Error('DEFAULT_PROJECT is missing files/entry.');
}

const { files, entry } = project;
if (!(entry in files)) {
  throw new Error(`Entry "${entry}" does not exist in files.`);
}

let count = 0;
for (const [path, source] of Object.entries(files)) {
  // 1) Transpile each file exactly like the browser does (catches syntax errors).
  transform(source, {
    transforms: ['typescript', 'jsx', 'imports'],
    jsxRuntime: 'automatic',
    production: true,
    filePath: path,
  });
  // 2) Every import must resolve to the registry or another project file.
  for (const request of extractImports(source)) resolve(files, path, request);
  count++;
}

console.log(`✓ default dashboard OK — ${count} files, entry "${entry}"`);
