import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'dist', 'dashboard.js');
const dest = join(
  root,
  'custom_components',
  'react_dashboard_studio',
  'dashboard.js',
);

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log('Copied dashboard.js -> custom_components/react_dashboard_studio/');
