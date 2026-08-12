import type {
  ForecastEditionSignal,
  ForecastEditionSignalCategory,
  ForecastSignalDirection,
} from '../content/slay-forecast/editionTypes';
import type { ForecastObservation } from '../content/slay-forecast/weeklyForecastTypes';
import type { ForecastSignalStatus } from '../content/slay-forecast/types';
import type { IntelligenceBackedSignal } from './resolveForecastIntelligence';

const CATEGORY_MAP: Record<string, ForecastEditionSignalCategory> = {
  texture: 'texture',
  color: 'color',
  lace: 'lace',
  hairline: 'silhouette',
  install: 'install',
  style: 'styling',
  styling: 'styling',
  silhouette: 'silhouette',
  part: 'part',
  volume: 'volume',
  care: 'styling',
  customization: 'styling',
};

function normalizeMomentum(raw: string): ForecastSignalStatus {
  const key = raw.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (key === 'rising') return 'rising';
  if (key === 'accelerating') return 'accelerating';
  if (key === 'cooling' || key === 'fading') return 'cooling';
  if (key === 'steady' || key === 'peaking' || key === 'holding') return 'holding';
  return 'emerging';
}

function momentumToDirection(momentum: ForecastSignalStatus): ForecastSignalDirection {
  if (momentum === 'rising') return 'rising';
  if (momentum === 'accelerating') return 'accelerating';
  if (momentum === 'cooling') return 'cooling';
  if (momentum === 'holding') return 'steady';
  return 'rising';
}

/** Map approved intelligence payload into supporting observations. */
export function mapIntelligenceToObservations(
  signals: IntelligenceBackedSignal[],
): ForecastObservation[] {
  return signals.map((signal, index) => {
    const categoryKey = signal.category.trim().toLowerCase();
    const category = CATEGORY_MAP[categoryKey] ?? 'styling';
    const momentum = normalizeMomentum(signal.momentum);

    return {
      id: signal.trendSignalId ?? `intel-${index}`,
      label: signal.label,
      description: signal.publicRationale,
      category,
      categoryLabel: signal.category,
      momentum,
      displayOrder: index,
    };
  });
}

/** Map approved intelligence payload into broadcast-compatible edition signals (legacy). */
export function mapIntelligenceToEditionSignals(
  signals: IntelligenceBackedSignal[],
): ForecastEditionSignal[] {
  return mapIntelligenceToObservations(signals).map((observation) => ({
    id: observation.id,
    category: observation.category,
    categoryLabel: observation.categoryLabel,
    label: observation.label,
    value: observation.label,
    direction: momentumToDirection(observation.momentum),
    momentum: observation.momentum,
    shortDescription: observation.description,
  }));
}
