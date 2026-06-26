// Eject-only insertion: picking a widget copies its real source into the user's
// dashboard (folded #region block, deduped), drops a `<Tag … />` at the cursor
// and merges the needed imports. No black-box import, so nothing the SDK later
// changes or removes can ever break an already-inserted widget.

import {
  WIDGET_CATALOG,
  catalogSnippet,
  catalogSourceOverride,
  widgetNameForDomain,
} from '../sdk/ui/catalog';
import { EJECT_SOURCES } from '../sdk/ui/catalog/eject.generated';

export type EjectInsert = {
  /** Primary component name — used for the usage tag. */
  name: string;
  /** `<Tag … />` inserted at the cursor; props stay easy to tweak. */
  usage: string;
  /** Import statements the definitions need (already public-aliased). */
  imports: string[];
  /**
   * Component sources to paste — the picked widget plus any nested catalog
   * widgets it uses (cascade), each in its own folded region and deduped.
   */
  definitions: { name: string; body: string }[];
};

function parseImportLine(
  line: string,
): { isType: boolean; module: string; names: string[] } | null {
  const m = line.match(/^import\s+(type\s+)?\{([^}]*)\}\s+from\s+'([^']+)'/);
  if (!m) return null;
  const names = m[2]
    .split(',')
    .map((s) => s.trim().replace(/^type\s+/, ''))
    .filter(Boolean);
  return { isType: Boolean(m[1]), module: m[3], names };
}

export const REGION_PREFIX = '// #region 🧩 ';
export const REGION_SUFFIX = ' (ejected · frei bearbeitbar · kein Auto-Update)';
export const REGION_END = '// #endregion';

/**
 * Build the eject payload for a catalog widget, cascading into any nested
 * catalog widgets it imports: those are ejected as their own regions and their
 * `@ha/ui` import is dropped, so the result has no black-box widget imports.
 */
export function ejectForWidgetName(
  name: string,
  entityId: string | null,
): EjectInsert | null {
  const entry = WIDGET_CATALOG.find((e) => e.name === name);
  if (!entry) return null;
  const usage = catalogSnippet(entry, entityId);

  const definitions: { name: string; body: string }[] = [];
  const imports: string[] = [];
  const visited = new Set<string>();

  const collect = (widget: string, isRoot: boolean) => {
    if (visited.has(widget)) return;
    visited.add(widget);

    if (isRoot) {
      const override = catalogSourceOverride(entry, entityId);
      if (override !== null) {
        definitions.push({ name: widget, body: override });
        return;
      }
    }
    const src = EJECT_SOURCES[widget];
    if (!src) return;
    definitions.push({ name: widget, body: src.body });

    for (const line of src.imports) {
      const parsed = parseImportLine(line);
      if (!parsed) {
        imports.push(line);
        continue;
      }
      const keep = parsed.names.filter((n) => {
        if (EJECT_SOURCES[n] && n !== widget) {
          collect(n, false); // nested catalog widget → eject instead of import
          return false;
        }
        return true;
      });
      if (keep.length) {
        const kw = parsed.isType ? 'import type' : 'import';
        imports.push(`${kw} { ${keep.join(', ')} } from '${parsed.module}';`);
      }
    }
  };
  collect(name, true);

  if (definitions.length === 0) return null;
  return { name, usage, imports, definitions };
}

/** Build the eject payload for the default widget of an entity's domain. */
export function ejectForEntity(entityId: string): EjectInsert | null {
  const domain = entityId.split('.')[0] ?? '';
  return ejectForWidgetName(widgetNameForDomain(domain), entityId);
}

/** Self-contained text block (imports + definitions + usage) for clipboard mode. */
export function ejectToText(e: EjectInsert): string {
  const defs = e.definitions.map((d) => d.body.trimEnd()).join('\n\n');
  return [...e.imports, '', defs, '', e.usage, ''].join('\n');
}

/** Binding names already imported anywhere in the document. */
function existingImportedNames(doc: string): Set<string> {
  const names = new Set<string>();
  const re = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+['"][^'"]+['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(doc))) {
    for (let part of m[1].split(',')) {
      part = part.trim().replace(/^type\s+/, '');
      if (!part) continue;
      const as = part.match(/\bas\s+(\w+)$/);
      names.add(as ? as[1] : part);
    }
  }
  return names;
}

/** Offset just after the last top-level import statement (0 if none). */
function lastImportEnd(doc: string): number {
  const re = /^import\b[\s\S]*?from\s+['"][^'"]+['"];?/gm;
  let end = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(doc))) end = m.index + m[0].length;
  return end;
}

/** Import lines for symbols the document does not already import, grouped by module. */
function missingImportLines(eject: EjectInsert, existing: Set<string>): string {
  const value = new Map<string, Set<string>>();
  const type = new Map<string, Set<string>>();
  for (const line of eject.imports) {
    const m = line.match(/^import\s+(type\s+)?\{([^}]*)\}\s+from\s+'([^']+)'/);
    if (!m) continue;
    const target = m[1] ? type : value;
    const mod = m[3];
    for (let n of m[2].split(',')) {
      n = n.trim().replace(/^type\s+/, '');
      if (!n || existing.has(n)) continue;
      if (!target.has(mod)) target.set(mod, new Set());
      target.get(mod)!.add(n);
    }
  }
  const lines: string[] = [];
  for (const [mod, names] of value) lines.push(`import { ${[...names].sort().join(', ')} } from '${mod}';`);
  for (const [mod, names] of type) lines.push(`import type { ${[...names].sort().join(', ')} } from '${mod}';`);
  return lines.join('\n');
}

export type EjectChange = { from: number; to: number; insert: string };

/**
 * Pure: compute the document edits for an eject insertion at selection [from,to].
 * Returns the change set plus the resulting cursor position (after the usage).
 */
export function computeEjectChanges(
  doc: string,
  from: number,
  to: number,
  eject: EjectInsert,
): { changes: EjectChange[]; selection: number } {
  const changes: EjectChange[] = [];

  const missing = missingImportLines(eject, existingImportedNames(doc));
  const importPos = lastImportEnd(doc);
  let importInsert = '';
  if (missing) importInsert = importPos > 0 ? `\n${missing}` : `${missing}\n`;
  if (importInsert) changes.push({ from: importPos, to: importPos, insert: importInsert });

  // usage replaces the current selection at the cursor
  changes.push({ from, to, insert: eject.usage });

  // definition regions (primary + cascaded) — skip any already ejected in the file
  let regionBlock = '';
  for (const def of eject.definitions) {
    const regionKey = REGION_PREFIX + def.name + REGION_SUFFIX;
    if (doc.includes(regionKey)) continue;
    regionBlock += `\n\n${regionKey}\n${def.body.trimEnd()}\n${REGION_END}\n`;
  }
  if (regionBlock) changes.push({ from: doc.length, to: doc.length, insert: regionBlock });

  const shift = importInsert && importPos <= from ? importInsert.length : 0;
  const selection = from + shift + eject.usage.length;
  return { changes, selection };
}
