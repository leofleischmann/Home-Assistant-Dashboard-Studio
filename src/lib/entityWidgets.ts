import { entityDomain } from './entityActions';

type WidgetName =
  | 'EntityRow'
  | 'Gauge'
  | 'BinaryBadge'
  | 'LightTile'
  | 'ClimateCard'
  | 'CoverCard'
  | 'MediaPlayerCard'
  | 'WeatherCard'
  | 'PersonChip'
  | 'NumberSlider'
  | 'ActionButton';

const WIDGET_BY_DOMAIN: Record<string, WidgetName> = {
  sensor: 'Gauge',
  binary_sensor: 'BinaryBadge',
  light: 'LightTile',
  switch: 'EntityRow',
  fan: 'EntityRow',
  climate: 'ClimateCard',
  cover: 'CoverCard',
  media_player: 'MediaPlayerCard',
  weather: 'WeatherCard',
  person: 'PersonChip',
  device_tracker: 'PersonChip',
  input_number: 'NumberSlider',
  script: 'ActionButton',
  scene: 'ActionButton',
  button: 'ActionButton',
  automation: 'ActionButton',
  input_boolean: 'EntityRow',
  lock: 'EntityRow',
  vacuum: 'EntityRow',
};

export function widgetForDomain(domain: string): WidgetName {
  return WIDGET_BY_DOMAIN[domain] ?? 'EntityRow';
}

/** JSX one-liner for the Entity-Inserter „Widget“ mode. */
export function entityWidgetSnippet(entityId: string): string {
  const widget = widgetForDomain(entityDomain(entityId));
  return `<${widget} entityId="${entityId}" />`;
}

export const WIDGET_IMPORTS =
  'import { EntityRow, Gauge, BinaryBadge, LightTile, ClimateCard, CoverCard, MediaPlayerCard, WeatherCard, PersonChip, NumberSlider, ActionButton } from \'@ha/ui\';';
