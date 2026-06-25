import type { HassEntity } from '../hass/types';
import { toNumber } from './internal';
import { isAvailable } from './entity';

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

/** Temperature with unit (default °C). */
export function temp(
  value: string | number | undefined,
  unit = '°C',
): string {
  const n = toNumber(value);
  if (n === undefined) return '–';
  return `${num(n, 1)} ${unit}`;
}

/** Percentage value. */
export function pct(value: string | number | undefined): string {
  const n = toNumber(value);
  if (n === undefined) return '–';
  return `${num(n, 0)} %`;
}

/** Power in watts. */
export function power(value: string | number | undefined): string {
  const n = toNumber(value);
  if (n === undefined) return '–';
  return `${num(n, 0)} W`;
}

/** Energy in kWh. */
export function energy(value: string | number | undefined): string {
  const n = toNumber(value);
  if (n === undefined) return '–';
  return `${num(n, 2)} kWh`;
}

/** Light brightness: 0–255 or percent string -> display percent. */
export function brightness(value: string | number | undefined): string {
  const n = toNumber(value);
  if (n === undefined) return '–';
  const pctVal = n <= 1 ? Math.round(n * 100) : n <= 100 ? Math.round(n) : Math.round((n / 255) * 100);
  return `${pctVal} %`;
}

/** Color temperature: mired or Kelvin -> Kelvin display. */
export function colorTemp(value: string | number | undefined): string {
  const n = toNumber(value);
  if (n === undefined) return '–';
  const kelvin = n > 1000 ? Math.round(n) : Math.round(1_000_000 / n);
  return `${kelvin} K`;
}
