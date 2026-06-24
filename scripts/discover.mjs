// One-off helper: connect to HA and print a summary of available entities so we
// can design a dashboard around the real setup. Run: node scripts/discover.mjs
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createConnection,
  createLongLivedTokenAuth,
  getStates,
} from 'home-assistant-js-websocket';
import WebSocket from 'ws';

globalThis.WebSocket = globalThis.WebSocket || WebSocket;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv() {
  const env = {};
  const envPath = path.join(root, '.env.local');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      if (line.trim().startsWith('#')) continue;
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  }
  return env;
}

const env = loadEnv();
const hassUrl = env.VITE_HASS_URL || process.env.VITE_HASS_URL;
const token = env.VITE_HASS_TOKEN || process.env.VITE_HASS_TOKEN;
if (!hassUrl || !token) {
  console.error('VITE_HASS_URL / VITE_HASS_TOKEN fehlen in .env.local');
  process.exit(1);
}

console.log('Verbinde mit', hassUrl, '…');
const auth = createLongLivedTokenAuth(hassUrl, token);
const connection = await createConnection({ auth });
const states = await getStates(connection);

// Count per domain
const byDomain = {};
for (const s of states) {
  const domain = s.entity_id.split('.')[0];
  (byDomain[domain] ??= []).push(s);
}

console.log(`\n=== ${states.length} Entities, ${Object.keys(byDomain).length} Domains ===`);
console.log('\nDomain-Übersicht:');
for (const [d, list] of Object.entries(byDomain).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${d.padEnd(20)} ${list.length}`);
}

// Detail for the domains that make for good dashboard content
const SHOW = ['sensor', 'binary_sensor', 'light', 'switch', 'climate', 'weather', 'media_player', 'cover', 'person', 'sun'];
for (const domain of SHOW) {
  const list = byDomain[domain];
  if (!list) continue;
  console.log(`\n--- ${domain} (${list.length}) ---`);
  for (const s of list.slice(0, 100)) {
    const name = s.attributes.friendly_name ?? '';
    const unit = s.attributes.unit_of_measurement ?? '';
    const dc = s.attributes.device_class ? `[${s.attributes.device_class}]` : '';
    console.log(`  ${s.entity_id.padEnd(45)} = ${String(s.state).slice(0, 24).padEnd(26)} ${unit.padEnd(6)} ${dc}  ${name}`);
  }
  if (list.length > 100) console.log(`  … +${list.length - 100} weitere`);
}

connection.close();
process.exit(0);
