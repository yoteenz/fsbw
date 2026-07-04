import type { GrowthTalentRecommendation, TalentProfile } from './types';

function recId(): string {
  return `gtr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function buildGrowthTalentRecommendations(
  workspaceId: string,
  talents: TalentProfile[]
): GrowthTalentRecommendation[] {
  const ws = talents.filter((t) => t.workspaceId === workspaceId);
  if (ws.length === 0) return [];

  const topHost = [...ws].sort((a, b) => b.talentScore.overall - a.talentScore.overall)[0];
  const financeExpert = ws.find((t) => t.aiProfile?.knowledgeDomains.some((d) => d.includes('finance')));
  const photographer = ws.find((t) => t.talentType === 'photographer');

  const recs: GrowthTalentRecommendation[] = [];

  if (topHost) {
    recs.push({
      id: recId(),
      workspaceId,
      talentId: topHost.id,
      recommendation: `This series performs better with host ${topHost.displayName} — retention ${topHost.talentScore.viewerRetention}%.`,
      context: 'Money Monday · AI Media Network',
      confidence: 0.88,
    });
  }

  recs.push({
    id: recId(),
    workspaceId,
    talentType: 'ai-presenter',
    recommendation: 'This brand needs a presenter with finance credibility — match Voice B + business wardrobe.',
    context: 'Growth Network · brand partnership',
    confidence: 0.82,
  });

  if (financeExpert) {
    recs.push({
      id: recId(),
      workspaceId,
      talentId: financeExpert.id,
      recommendation: 'This campaign requires a financial expert — assign approved money pillar topics only.',
      context: 'Q3 Finance Push campaign',
      confidence: 0.9,
    });
  }

  if (photographer) {
    recs.push({
      id: recId(),
      workspaceId,
      talentId: photographer.id,
      recommendation: 'This creator needs a photographer for thumbnail + B-roll package.',
      context: 'Creator collaboration opportunity',
      confidence: 0.75,
    });
  }

  return recs;
}
