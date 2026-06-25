import type { HassEntity } from '../hass/types';

const UNAVAILABLE = new Set(['unavailable', 'unknown', 'none', '']);

/** Is the entity present and reporting a usable value? */
export function isAvailable(entity?: HassEntity): entity is HassEntity {
  return !!entity && !UNAVAILABLE.has(entity.state);
}

function toNumber(value: string | number | undefined): number | undefined {
  if (value === undefined) return undefined;
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isNaN(n) ? undefined : n;
}

/** German-formatted number, or "–" if not a number. */
export function num(
  value: string | number | undefined,
  maximumFractionDigits = 1,
): string {
  const n = toNumber(value);
  if (n === undefined) return '–';
  return n.toLocaleString('de-DE', { maximumFractionDigits });
}

/** German Euro formatting. */
export function euro(value: string | number | undefined): string {
  const n = toNumber(value);
  if (n === undefined) return '–';
  return n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

/** Numeric value of an entity's state, or undefined. */
export function stateNumber(entity?: HassEntity): number | undefined {
  return isAvailable(entity) ? toNumber(entity.state) : undefined;
}

/** Time-of-day greeting. */
export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return 'Gute Nacht';
  if (h < 11) return 'Guten Morgen';
  if (h < 17) return 'Guten Tag';
  if (h < 22) return 'Guten Abend';
  return 'Gute Nacht';
}

/** Map a HA weather condition to an emoji. */
export function weatherIcon(condition?: string): string {
  switch (condition) {
    case 'sunny':
      return '☀️';
    case 'clear-night':
      return '🌙';
    case 'partlycloudy':
      return '⛅';
    case 'cloudy':
      return '☁️';
    case 'fog':
      return '🌫️';
    case 'rainy':
    case 'pouring':
      return '🌧️';
    case 'lightning':
    case 'lightning-rainy':
      return '⛈️';
    case 'snowy':
    case 'snowy-rainy':
      return '❄️';
    case 'windy':
    case 'windy-variant':
      return '💨';
    case 'hail':
      return '🌨️';
    default:
      return '🌡️';
  }
}

/** Color for a battery percentage. */
export function batteryColor(pct: number | undefined): string {
  if (pct === undefined) return 'var(--rd-text-2)';
  if (pct <= 15) return 'var(--rd-danger)';
  if (pct <= 35) return 'var(--rd-warn)';
  return 'var(--rd-ok)';
}
