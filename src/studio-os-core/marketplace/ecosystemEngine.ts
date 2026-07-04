import type { EcosystemRecommendation, ParticipantProfile, ParticipantType } from './types';

function ecoId(): string {
  return `eco-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

const ECOSYSTEM_CHAINS: Array<{
  from: ParticipantType;
  to: ParticipantType;
  need: string;
  recommendation: string;
}> = [
  {
    from: 'creator',
    to: 'editor',
    need: 'Creator needs editor for recurring short-form packages',
    recommendation: 'Match editor before creator searches — build retainer, not one-off freelance gig.',
  },
  {
    from: 'editor',
    to: 'photographer',
    need: 'Editor needs photographer for thumbnail + B-roll',
    recommendation: 'Introduce photographer with shared timeline — strengthens both sides for renewals.',
  },
  {
    from: 'photographer',
    to: 'brand',
    need: 'Photographer needs brand client for campaign retainer',
    recommendation: 'Brand partnership with multi-episode scope — long-term visual identity work.',
  },
  {
    from: 'brand',
    to: 'creator',
    need: 'Brand needs creator for authentic integration series',
    recommendation: 'Creator audience fit + brand safety score — 6-episode minimum for relationship value.',
  },
  {
    from: 'manufacturer',
    to: 'brand',
    need: 'Manufacturer needs ecommerce brand for fulfillment partnership',
    recommendation: 'DTC pilot with renewal path — not transactional marketplace listing.',
  },
  {
    from: 'agency',
    to: 'videographer',
    need: 'Agency needs videographer for client campaign roster',
    recommendation: 'Commission model + shared collaboration hub per client — agency retains relationship.',
  },
];

export function buildEcosystemRecommendations(
  workspaceId: string,
  participants: ParticipantProfile[]
): EcosystemRecommendation[] {
  const ws = participants.filter((p) => p.workspaceId === workspaceId);
  const recs: EcosystemRecommendation[] = [];

  for (const chain of ECOSYSTEM_CHAINS) {
    const from = ws.find((p) => p.participantType === chain.from);
    const to = ws.find((p) => p.participantType === chain.to);
    if (!from) continue;

    recs.push({
      id: ecoId(),
      workspaceId,
      fromParticipantId: from.id,
      toParticipantType: chain.to,
      toParticipantId: to?.id,
      need: chain.need,
      recommendation: chain.recommendation,
      longTermFocus: true,
    });
  }

  return recs;
}
