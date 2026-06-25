const DEVICE_CLASS_ICONS: Record<string, string> = {
  temperature: '🌡️',
  humidity: '💧',
  power: '⚡',
  energy: '🔋',
  battery: '🔋',
  motion: '🚶',
  door: '🚪',
  window: '🪟',
  smoke: '🔥',
  gas: '💨',
  light: '💡',
  illuminance: '☀️',
  pressure: '📊',
  co2: '🌿',
  pm25: '🌫️',
  voltage: '⚡',
  current: '⚡',
  timestamp: '🕐',
  connectivity: '📶',
  running: '▶️',
  problem: '⚠️',
  safety: '🛡️',
  tamper: '🔒',
  update: '🔄',
  plug: '🔌',
  water: '💧',
  carbon_monoxide: '☠️',
  cold: '❄️',
  heat: '🔥',
};

/** Emoji for a sensor device_class when no entity icon is set. */
export function deviceClassIcon(deviceClass?: string): string {
  if (!deviceClass) return '📟';
  return DEVICE_CLASS_ICONS[deviceClass] ?? '📟';
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
