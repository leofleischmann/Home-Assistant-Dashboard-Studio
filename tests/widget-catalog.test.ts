import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseWidgetCatalog,
  domainDefaultWidgets,
} from '../scripts/lib/parse-widget-catalog.mjs';

// Guards the widget-descriptor contract: each domain widget's metadata lives in
// a `defineWidget()` descriptor next to its component (cards/domain/<x>.widget.ts),
// not in a separate parallel catalog tree.

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG = join(ROOT, 'src/sdk/ui/catalog');
const DOMAIN_DIR = join(ROOT, 'src/sdk/ui/cards/domain');

describe('widget catalog descriptors', () => {
  it('parses every widget (domain co-located + featured/composite consolidated)', () => {
    const widgets = parseWidgetCatalog(CATALOG);
    const names = widgets.map((w) => w.name);
    expect(widgets.length).toBeGreaterThanOrEqual(40);
    // a representative from each category resolves
    expect(names).toContain('LightTile'); // domain
    expect(names).toContain('SunArc'); // featured
    expect(names).toContain('RoomCard'); // composite
    // no duplicate widget names across the assembled catalog
    expect(new Set(names).size).toBe(names.length);
  });

  it('has no parallel catalog/domain metadata tree', () => {
    expect(existsSync(join(CATALOG, 'domain'))).toBe(false);
  });

  it('keeps every domain descriptor next to its component via defineWidget()', () => {
    const widgetFiles = readdirSync(DOMAIN_DIR).filter((f) => f.endsWith('.widget.ts'));
    expect(widgetFiles.length).toBeGreaterThan(0);
    for (const file of widgetFiles) {
      const src = readFileSync(join(DOMAIN_DIR, file), 'utf8');
      expect(src, `${file} should declare its descriptor with defineWidget`).toMatch(
        /defineWidget\(/,
      );
    }
  });

  it('resolves a default widget per domain', () => {
    const defaults = domainDefaultWidgets(parseWidgetCatalog(CATALOG));
    expect(defaults.light).toBe('LightTile');
    expect(defaults.weather).toBe('WeatherNow');
  });
});
