// A "project" is your virtual filesystem: many files, one entry point.
export interface Project {
  files: Record<string, string>;
  entry: string;
}

// ── Virtual path helpers (posix-style, no leading slash) ─────────────────────
export function dirname(path: string): string {
  const i = path.lastIndexOf('/');
  return i === -1 ? '' : path.slice(0, i);
}

export function joinPath(base: string, rel: string): string {
  const parts = base ? base.split('/') : [];
  for (const seg of rel.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  return parts.join('/');
}

// ── Default project (a 2-file example that teaches modular structure) ─────────
const DASHBOARD_TSX = `import { useEntitiesByDomain, callService } from '@ha';
import { Card, Section } from '@ha/ui';
import { greeting } from '@ha/format';
import { Overview } from './components/Overview';

export default function Dashboard() {
  const lights = useEntitiesByDomain('light');

  return (
    <div style={{ display: 'grid', gap: 18, padding: 24 }}>
      <h1 style={{ margin: 0 }}>{greeting()} 👋</h1>

      {/* Komponente aus einer anderen Datei */}
      <Overview />

      <Section title="Lichter">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {lights.map((light) => (
            <Card key={light.entity_id}>
              <button
                onClick={() => callService('light', 'toggle', { entity_id: light.entity_id })}
                style={{ all: 'unset', cursor: 'pointer' }}
              >
                {light.attributes.friendly_name || light.entity_id}
                {' · '}
                <strong>{light.state}</strong>
              </button>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}
`;

const OVERVIEW_TSX = `import { useEntity } from '@ha';
import { Stat, Section } from '@ha/ui';
import { num } from '@ha/format';

// Eigene Komponente in einer eigenen Datei – per './components/Overview' importiert.
export function Overview() {
  const outside = useEntity('sensor.aussentemperatur');
  const computer = useEntity('sensor.computer_leistung');

  return (
    <Section title="Überblick">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 12,
      }}>
        <Stat label="Außen" value={num(outside?.state)} unit="°C" />
        <Stat label="Computer" value={num(computer?.state)} unit="W" accent />
      </div>
    </Section>
  );
}
`;

export const DEFAULT_PROJECT: Project = {
  entry: 'dashboard.tsx',
  files: {
    'dashboard.tsx': DASHBOARD_TSX,
    'components/Overview.tsx': OVERVIEW_TSX,
  },
};

/** Starter content when you add a brand-new file. */
export function newFileTemplate(path: string): string {
  const base = path.split('/').pop()!.replace(/\.(tsx?|jsx?)$/, '');
  const name = base.charAt(0).toUpperCase() + base.slice(1).replace(/[^a-zA-Z0-9]/g, '');
  return `export function ${name || 'Component'}() {
  return <div>${name}</div>;
}
`;
}
