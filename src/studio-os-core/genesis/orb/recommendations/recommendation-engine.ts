import { buildHeadquartersCompanyProjection } from '../../executive-headquarters/projections/company-projection';
import {
  buildHeadquartersMissionProjection,
  buildHeadquartersRecommendedAction,
} from '../../executive-headquarters/projections/briefing-projection';
import { buildHeadquartersRoomPath } from '../../executive-headquarters/navigation/routing';
import type { OrbRecommendationCard } from '../types';
import { orbEngineNow } from '../context/context-engine';
import { mutateOrbStore, readOrbStore } from '../persistence';

/** Orb Recommendation Engine — evidence-backed decision drafts, not commands */
export function buildOrbRecommendations(): OrbRecommendationCard[] {
  const company = buildHeadquartersCompanyProjection();
  const recommended = buildHeadquartersRecommendedAction(company);
  const missions = buildHeadquartersMissionProjection(company);
  const timestamp = orbEngineNow();
  const overrides = new Set(readOrbStore().recommendationOverrides);

  const cards: OrbRecommendationCard[] = [
    {
      recommendationId: 'rec-founder-priority',
      title: recommended.action,
      reason: recommended.reason,
      evidence: [
        'Mission queue has blocked and awaiting-approval items',
        'Company pulse is stable with upward operational trend',
      ],
      confidence: recommended.confidence,
      alternatives: [
        'Review mission queue first in Mission Control™',
        'Open Department Directory for wing expansion preview',
      ],
      tradeoffs: [
        'Prioritizing strategic clarity may delay tactical mission resolution',
        'Prioritizing missions may defer long-range planning',
      ],
      risks: ['Open loops remain if priority is not confirmed'],
      sourceSystems: recommended.sourceSystems,
      requiresApproval: recommended.requiresApproval,
      targetPath: buildHeadquartersRoomPath(recommended.targetRoomId),
      targetRoomId: recommended.targetRoomId,
      posture: 'executive-advisor',
      createdAt: timestamp,
    },
    {
      recommendationId: 'rec-mission-control',
      title: 'Review mission queue blockers',
      reason: `${missions.blockedCount} blocked and ${missions.awaitingApprovalCount} awaiting approval.`,
      evidence: missions.queue.filter((m) => m.status === 'blocked' || m.status === 'awaiting-approval').map((m) => m.title),
      confidence: 0.89,
      alternatives: ['Delegate review to department lead', 'Schedule follow-up tomorrow'],
      tradeoffs: ['Immediate review protects delivery', 'Deferring preserves deep work time'],
      risks: ['Blocked missions may stall downstream work'],
      sourceSystems: ['Mission Engine™'],
      requiresApproval: false,
      targetPath: buildHeadquartersRoomPath('mission-control'),
      targetRoomId: 'mission-control',
      posture: 'mission-coordinator',
      createdAt: timestamp,
    },
    {
      recommendationId: 'rec-knowledge-audit',
      title: 'Audit Knowledge Wing sources',
      reason: 'Knowledge Core™ connector maturity affects source-backed briefing confidence.',
      evidence: ['Knowledge Wing mission blocked on connector'],
      confidence: 0.76,
      alternatives: ['Continue with projection adapters', 'Postpone until Knowledge Core ships'],
      tradeoffs: ['Early audit improves trust', 'Waiting reduces founder distraction'],
      risks: ['Unverified knowledge may reduce briefing accuracy'],
      sourceSystems: ['Knowledge Core™', 'Institute of Knowledge™'],
      requiresApproval: false,
      targetPath: buildHeadquartersRoomPath('knowledge-wing'),
      targetRoomId: 'knowledge-wing',
      posture: 'knowledge-guide',
      createdAt: timestamp,
    },
  ];

  return cards.filter((c) => !overrides.has(c.recommendationId));
}

export function overrideOrbRecommendation(recommendationId: string): void {
  mutateOrbStore((store) => ({
    ...store,
    recommendationOverrides: [...new Set([...store.recommendationOverrides, recommendationId])],
  }));
}
