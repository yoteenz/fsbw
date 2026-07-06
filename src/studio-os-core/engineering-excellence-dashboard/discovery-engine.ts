import type { OrganizationEngineeringExcellenceProfile } from './types';

export function queryEngineeringExcellence(
  query: string,
  profile: OrganizationEngineeringExcellenceProfile,
  limit = 8
) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const p of profile.healthPillars) {
    const hay = `${p.label} ${p.summary} ${p.sourceSystem}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'pillar' as const,
        id: p.pillar,
        label: p.label,
        score: p.score,
        matchReason: `${p.status} · ${p.trend}`,
      });
    }
  }

  for (const k of profile.engineeringKpis) {
    const hay = `${k.label} ${k.summary} ${k.value}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'kpi' as const,
        id: k.kpi,
        label: k.label,
        score: k.numericScore,
        matchReason: k.value,
      });
    }
  }

  for (const h of profile.historicalExcellence) {
    const hay = `${h.periodLabel} ${h.summary}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'history' as const,
        id: h.id,
        label: h.periodLabel,
        score: h.engineeringScore,
        matchReason: `${h.deltaFromPrior >= 0 ? '+' : ''}${h.deltaFromPrior}%`,
      });
    }
  }

  for (const c of profile.cultureCelebrations) {
    const hay = `${c.title} ${c.description} ${c.achievementLabel}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'culture' as const,
        id: c.id,
        label: c.title,
        score: 90,
        matchReason: c.achievementLabel,
      });
    }
  }

  const briefHay = `${profile.executiveBrief.studioIntelligenceSummary} ${profile.executiveBrief.currentPriorities.join(' ')}`.toLowerCase();
  if (briefHay.includes(q)) {
    hits.push({
      type: 'brief' as const,
      id: profile.executiveBrief.id,
      label: 'Executive Briefing',
      score: profile.overallEngineeringScore,
      matchReason: 'Studio Intelligence™ briefing',
    });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
