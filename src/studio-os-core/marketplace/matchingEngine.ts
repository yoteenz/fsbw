import type { MatchRecommendation, ParticipantProfile } from './types';

function matchId(): string {
  return `match-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function buildIntelligentMatches(
  workspaceId: string,
  participants: ParticipantProfile[],
  context: {
    companyDna?: string;
    creativeDna?: string;
    goals?: string[];
    budget?: string;
  } = {}
): MatchRecommendation[] {
  const ws = participants.filter((p) => p.workspaceId === workspaceId);
  if (ws.length === 0) return [];

  const creator = ws.find((p) => p.participantType === 'creator');
  const editor = ws.find((p) => p.participantType === 'editor');
  const photographer = ws.find((p) => p.participantType === 'photographer');
  const brand = ws.find((p) => p.participantType === 'brand');
  const agency = ws.find((p) => p.participantType === 'agency');

  const recs: MatchRecommendation[] = [];

  if (creator && editor) {
    recs.push({
      id: matchId(),
      workspaceId,
      participantId: creator.id,
      targetParticipantId: editor.id,
      targetNeed: 'Short-form editor for Money Monday + Future Friday packages',
      compatibilityScore: 91,
      explanation:
        'Editor completion rate 96% + creator audience fit (finance + tech) + shared AI Media workspace connection. Memory Bible editorial rules align.',
      signals: ['Company DNA · educational tone', 'Creative DNA v2.4', 'Performance history · 12 projects', 'Availability overlap Mon–Fri'],
      context: context.companyDna ?? 'AI Media Network · AI Media workspace',
    });
  }

  if (editor && photographer) {
    recs.push({
      id: matchId(),
      workspaceId,
      participantId: editor.id,
      targetParticipantId: photographer?.id,
      targetNeed: 'Thumbnail + B-roll photographer for cross-platform packages',
      compatibilityScore: 87,
      explanation:
        'Photographer trust score 88 · portfolio verified · prior collaboration with same creator roster. Knowledge Graph links to Programming Network.',
      signals: ['Portfolio verification', 'Industry · media production', 'Budget fit · retainer model', 'Growth Network · creator collab signal'],
      context: 'Ecosystem · editor needs photographer',
    });
  }

  if (brand && creator) {
    recs.push({
      id: matchId(),
      workspaceId,
      participantId: brand.id,
      targetParticipantId: creator.id,
      targetNeed: 'FinTech brand integration · Q3 finance campaign',
      compatibilityScore: 84,
      explanation:
        'Creator finance niche + brand audience demographics 25–44 · audience fit 82%. Long-term partnership potential — not one-off UGC.',
      signals: ['Audience fit', 'Industry · fintech', 'Goals · sponsored series', 'Memory Bible · brand safety rules'],
      context: context.goals?.join(', ') ?? 'Growth Network · brand partnership',
    });
  }

  if (agency && ws.find((p) => p.participantType === 'videographer')) {
    const videographer = ws.find((p) => p.participantType === 'videographer');
    recs.push({
      id: matchId(),
      workspaceId,
      participantId: agency!.id,
      targetParticipantId: videographer?.id,
      targetNeed: 'Campaign videographer for multi-episode brand series',
      compatibilityScore: 79,
      explanation:
        'Agency manages 3 creator accounts · videographer available Q3 · commission pricing aligns with agency model.',
      signals: ['Availability', 'Pricing · commission', 'Workspace verification', 'Repeat business history'],
      context: context.budget ?? 'Deal pipeline · qualified lead',
    });
  }

  if (photographer && brand) {
    recs.push({
      id: matchId(),
      workspaceId,
      participantId: photographer!.id,
      targetParticipantId: brand.id,
      targetNeed: 'Brand needs visual content partner for product launch',
      compatibilityScore: 86,
      explanation:
        'Photographer portfolio verified · brand industry match · prior 2 renewals with similar FinTech clients.',
      signals: ['Portfolio verification', 'Trust score · quality 94', 'Relationship history · repeat business'],
      context: 'Ecosystem · photographer needs brand',
    });
  }

  const manufacturer = ws.find((p) => p.participantType === 'manufacturer');
  const ecommerceBrand = ws.find((p) => p.participantType === 'brand' && p.industries.includes('ecommerce'));
  if (manufacturer && ecommerceBrand) {
    recs.push({
      id: matchId(),
      workspaceId,
      participantId: manufacturer.id,
      targetParticipantId: ecommerceBrand.id,
      targetNeed: 'Manufacturer needs ecommerce brand for DTC fulfillment pilot',
      compatibilityScore: 81,
      explanation:
        'Fulfillment capacity match · brand SKU count within manufacturer MOQ · workspace connections share Growth Network profile.',
      signals: ['Industry · ecommerce', 'Goals · scale fulfillment', 'Knowledge Graph · supply chain node'],
      context: 'Business ecosystem · manufacturer ↔ brand',
    });
  }

  return recs.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}
