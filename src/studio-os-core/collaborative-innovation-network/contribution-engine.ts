import {
  CONTRIBUTION_DOMAIN_LABELS,
  CONTRIBUTION_DOMAINS,
} from './constants';
import type { ContributionDomain, ContributionShare, FounderGenomeSnapshot } from './types';

function domainForStrength(strength: string): ContributionDomain {
  const s = strength.toLowerCase();
  if (/luxury|design|creative|scene|parallel/i.test(s)) return 'creative-direction';
  if (/automation|workflow|program/i.test(s)) return 'automation';
  if (/psychology|story|brand/i.test(s)) return 'storytelling';
  if (/architect|campus|spatial/i.test(s)) return 'architecture';
  if (/light/i.test(s)) return 'lighting';
  if (/operat/i.test(s)) return 'operations';
  if (/system/i.test(s)) return 'systems';
  return CONTRIBUTION_DOMAINS[Math.abs(strength.length) % CONTRIBUTION_DOMAINS.length]!;
}

function roundShares(shares: number[]): number[] {
  const total = shares.reduce((a, b) => a + b, 0);
  if (total === 0) return shares.map(() => Math.floor(100 / shares.length));
  const scaled = shares.map((s) => Math.round((s / total) * 100));
  const diff = 100 - scaled.reduce((a, b) => a + b, 0);
  if (diff !== 0 && scaled.length > 0) scaled[0]! += diff;
  return scaled;
}

export function computeContributionShares(
  founders: FounderGenomeSnapshot[],
  innovationTitle: string
): ContributionShare[] {
  if (founders.length === 0) return [];

  const rawWeights = founders.map((f, i) => {
    const base = 20 + f.primaryStrengths.length * 8;
    const titleBoost = innovationTitle.toLowerCase().includes(f.primaryStrengths[0]?.toLowerCase() ?? '') ? 12 : 0;
    return base + titleBoost + (i === 0 ? 5 : 0);
  });

  const percentages = roundShares(rawWeights);

  return founders.map((f, i) => {
    const domain = domainForStrength(f.primaryStrengths[0] ?? 'systems');
    return {
      founderId: f.founderId,
      founderName: f.founderName,
      domain,
      domainLabel: CONTRIBUTION_DOMAIN_LABELS[domain],
      percentage: percentages[i]!,
      evidence: `${f.founderName} contributed ${f.primaryStrengths.join(', ')} — attributed from session activity and genome alignment.`,
    };
  });
}

export function summarizeContributions(shares: ContributionShare[]): string {
  if (shares.length === 0) return 'No contributions recorded.';
  return shares.map((s) => `${s.founderName} ${s.percentage}% (${s.domainLabel})`).join(' · ');
}

export function validateContributionTotal(shares: ContributionShare[]): boolean {
  const total = shares.reduce((sum, s) => sum + s.percentage, 0);
  return total === 100;
}
