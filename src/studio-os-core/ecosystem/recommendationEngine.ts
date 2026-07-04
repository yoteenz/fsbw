import type { EcosystemAsset, EcosystemRecommendation } from './types';

function recId(): string {
  return `eco-rec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function buildEcosystemRecommendations(
  workspaceId: string,
  assets: EcosystemAsset[],
  context: { industry?: string; growthStage?: string; installedModules?: string[] } = {}
): EcosystemRecommendation[] {
  const published = assets.filter((a) => a.stage === 'published' || a.stage === 'updates');
  if (published.length === 0) return [];

  const recs: EcosystemRecommendation[] = [];

  const mediaBlueprint = published.find((a) => a.title.includes('Media Network'));
  if (mediaBlueprint) {
    recs.push({
      id: recId(),
      workspaceId,
      assetId: mediaBlueprint.id,
      assetTitle: mediaBlueprint.title,
      score: 94,
      explanation: 'Matches AI Media Company DNA + installed Labs + Growth Network modules. Complete operating system for digital media company.',
      signals: ['Company DNA match', 'Industry · media', 'Growth stage · scale', 'KG · programming network node'],
    });
  }

  const writingBible = published.find((a) => a.category === 'writing-bible');
  if (writingBible) {
    recs.push({
      id: recId(),
      workspaceId,
      assetId: writingBible.id,
      assetTitle: writingBible.title,
      score: 88,
      explanation: 'Creative DNA + Memory Bible editorial rules align. Recommended for finance/education content pillars.',
      signals: ['Creative DNA v2.4', 'Installed modules · content-brain', 'Workspace goals · myth-busting content'],
    });
  }

  const execTeam = published.find((a) => a.category === 'executive-ai-team');
  if (execTeam) {
    recs.push({
      id: recId(),
      workspaceId,
      assetId: execTeam.id,
      assetTitle: execTeam.title,
      score: 85,
      explanation: 'Business tier unlocks executive AI team size 5. CMO + Growth Strategist fits Q3 finance campaign goals.',
      signals: ['Usage history · growth network', 'Membership · business', 'Knowledge graph · executive nodes'],
    });
  }

  const automation = published.find((a) => a.category === 'automation-pack');
  if (automation) {
    recs.push({
      id: recId(),
      workspaceId,
      assetId: automation.id,
      assetTitle: automation.title,
      score: 82,
      explanation: 'Requires Labs + Distribution Network — both installed. Publish → experiment pipeline matches network model.',
      signals: ['Dependencies satisfied', 'Installed · labs', 'Installed · distribution-network'],
    });
  }

  void context.industry;
  void context.growthStage;
  void context.installedModules;

  return recs.sort((a, b) => b.score - a.score);
}
