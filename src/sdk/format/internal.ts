/** Entity states that should not be treated as usable values. */
export const UNAVAILABLE = new Set(['unavailable', 'unknown', 'none', '']);

export function toNumber(value: string | number | undefined): number | undefined {
  if (value === undefined) return undefined;
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isNaN(n) ? undefined : n;
}
