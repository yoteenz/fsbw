import { MOAT_SOURCE_LABELS, MOAT_SOURCES } from './constants';
import type { MoatSourceStatus } from './types';

export function buildMoatSources(
  brainVitality: number,
  architectureNodes: number,
  orchestratorScore: number
): MoatSourceStatus[] {
  const base = Math.round((brainVitality + orchestratorScore) / 2);

  return MOAT_SOURCES.map((source, index) => {
    const contributionPct = Math.min(99, base + index * 3 - 8);
    let detail = `${MOAT_SOURCE_LABELS[source]} compounds Studio Intelligence™ over time.`;

    switch (source) {
      case 'profession-brain':
        detail = 'Every Profession Brain™ correction improves professional reasoning layers.';
        break;
      case 'legacy-vault':
        detail = 'Every Legacy Vault™ entry preserves expertise models must retain.';
        break;
      case 'blueprint':
        detail = 'Every Blueprint structures organizational knowledge for model consumption.';
        break;
      case 'simulations':
        detail = 'Every simulation teaches models how this organization decides.';
        break;
      default:
        break;
    }

    if (source === 'profession-brain' && brainVitality > 0) {
      detail = `${detail} Vitality ${brainVitality}%.`;
    }
    if (source === 'blueprint' && architectureNodes > 0) {
      detail = `${detail} ${architectureNodes} knowledge nodes connected.`;
    }

    return {
      source,
      label: MOAT_SOURCE_LABELS[source],
      contributionPct,
      compoundsIntelligence: true,
      detail,
    };
  });
}

export function buildMoatLine(sources: MoatSourceStatus[]): string {
  const avg = Math.round(
    sources.reduce((s, m) => s + m.contributionPct, 0) / Math.max(1, sources.length)
  );
  return `Long-term moat: organizational expertise structured for models (${avg}% compound score). Model size is not the moat — structured organizational intelligence is.`;
}

export function summarizeMoat(sources: MoatSourceStatus[]): string {
  return [buildMoatLine(sources), ...sources.slice(0, 4).map((s) => s.detail)].join(' ');
}
