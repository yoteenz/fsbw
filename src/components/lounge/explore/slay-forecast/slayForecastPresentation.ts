import type {
  ForecastEditionSignal,
  ForecastSignalDirection,
  ForecastSignalStatus,
} from '../../../../content/slay-forecast';
import { FORECAST_STATUS_LABELS } from '../../../../content/slay-forecast';

export function forecastDirectionArrow(direction: ForecastSignalDirection): string {
  switch (direction) {
    case 'rising':
      return '↑';
    case 'accelerating':
      return '↑↑';
    case 'steady':
      return '→';
    case 'cooling':
      return '↓';
    case 'fading':
      return '↓↓';
    default:
      return '';
  }
}

export function forecastEditionSignalDisplay(signal: ForecastEditionSignal): string {
  const label = FORECAST_STATUS_LABELS[signal.momentum];
  const arrow = forecastDirectionArrow(signal.direction);
  if (arrow === '·') return label;
  return `${label} ${arrow}`.trim();
}

export function forecastStatusArrow(status: ForecastSignalStatus): string {
  switch (status) {
    case 'emerging':
      return '·';
    case 'rising':
      return '↑';
    case 'accelerating':
      return '↑↑';
    case 'holding':
      return '→';
    case 'cooling':
      return '↓';
    default:
      return '';
  }
}

export function forecastStatusDisplay(status: ForecastSignalStatus): string {
  const label = FORECAST_STATUS_LABELS[status];
  const arrow = forecastStatusArrow(status);
  if (arrow === '·') return label;
  return `${label} ${arrow}`.trim();
}

export function forecastCategoryShortLabel(categoryLabel: string): string {
  return categoryLabel.replace(/\s+SIGNAL$/, '').trim();
}

export function forecastObservationDisplay(momentum: ForecastSignalStatus): string {
  if (momentum === 'holding') return 'STEADY →';
  return forecastStatusDisplay(momentum);
}
