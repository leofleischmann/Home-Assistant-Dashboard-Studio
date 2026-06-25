import type { HassEntity } from './types';

const ENTITY_ID_RE = /^[\w.]+$/;

/** Returns true when the cursor sits inside a string literal used as an entity ID. */
export function isEntityIdContext(linePrefix: string): boolean {
  return (
    /useEntity(?:State)?\(\s*['"]?$/.test(linePrefix) ||
    /entity_id:\s*['"]?$/.test(linePrefix) ||
    /\b(?:powerId|kwhId|costId|switchId|entityId|lightId|sensorKey)=\s*['"]?$/.test(
      linePrefix,
    )
  );
}

/**
 * Lazily search entities — no upfront sort, O(n) scan stopped at `limit`.
 * With an empty query only the first `limit` entities are returned.
 */
export function searchEntities(
  states: Record<string, HassEntity>,
  query: string,
  limit = 50,
): HassEntity[] {
  const q = query.trim().toLowerCase();
  const results: HassEntity[] = [];

  for (const id in states) {
    const entity = states[id];
    if (
      q &&
      !id.toLowerCase().includes(q) &&
      !(entity.attributes.friendly_name ?? '').toLowerCase().includes(q)
    ) {
      continue;
    }
    results.push(entity);
    if (results.length >= limit) break;
  }

  return results;
}

export { ENTITY_ID_RE };
