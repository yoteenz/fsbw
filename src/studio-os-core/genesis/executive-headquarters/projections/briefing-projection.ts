import type {
  HeadquartersBriefingProjection,
  HeadquartersHealthProjection,
  HeadquartersMissionProjection,
  HeadquartersOrbDockState,
  HeadquartersRecommendedAction,
} from '../types';
import type { HqRoomId } from '../constants';
import { headquartersProjectionNow } from './company-projection';
import type { HeadquartersCompanyProjection } from '../types';

/** HeadquartersBriefingProjection — Ambient Awareness™ adapter */
export function buildHeadquartersBriefingProjection(
  company: HeadquartersCompanyProjection
): HeadquartersBriefingProjection {
  const generatedAt = headquartersProjectionNow();
  return {
    projectionId: `hq-briefing-${company.companyIdentityId}`,
    owningSystem: 'Ambient Awareness™',
    replacementPlan: 'Ambient Awareness™ will own change detection and source citations.',
    greeting: `Good morning, ${company.founderDisplayName}. ${company.companyDisplayName} headquarters is ready.`,
    briefingParagraph: `${company.companyDisplayName} is operating in Launch Stack mode. Three priorities are staged, company pulse is stable, and the mission queue awaits your review. Orb recommends confirming today's critical decision before entering deep work.`,
    whatChanged: 'Identity context resolved. Build Order and Headquarters runtime are active.',
    requiresAttention: 'Review mission queue blockers and today\'s recommended action.',
    canWait: 'Department wing expansion previews and locked future rooms.',
    activeDepartments: ['Operations', 'Marketing', 'Customer Experience'],
    generatedAt,
    stale: false,
  };
}

/** HeadquartersHealthProjection — Analytics™ / Company Health Index™ adapter */
export function buildHeadquartersHealthProjection(
  company: HeadquartersCompanyProjection
): HeadquartersHealthProjection {
  return {
    projectionId: `hq-health-${company.companyIdentityId}`,
    owningSystem: 'Company Health Index™',
    replacementPlan: 'Analytics™ will supply live metrics; HQ renders composed health story.',
    overallScore: 78,
    overallLabel: company.companyDisplayName.toUpperCase(),
    operationalPulse: 'Steady — missions progressing, no critical blockers flagged.',
    riskNotes: ['Upstream Mission Engine™ projection — verify blockers before commit.'],
    metrics: [
      { metricId: 'ops', label: 'Operations', score: 82, trend: 'up', sourceSystem: 'Analytics™' },
      { metricId: 'mkt', label: 'Marketing', score: 74, trend: 'flat', sourceSystem: 'Analytics™' },
      { metricId: 'cx', label: 'Experience', score: 80, trend: 'up', sourceSystem: 'Analytics™' },
      { metricId: 'know', label: 'Knowledge', score: 71, trend: 'up', sourceSystem: 'Knowledge Core™' },
    ],
    generatedAt: headquartersProjectionNow(),
  };
}

/** HeadquartersMissionProjection — Mission Engine™ adapter */
export function buildHeadquartersMissionProjection(
  company: HeadquartersCompanyProjection
): HeadquartersMissionProjection {
  const queue = [
    {
      missionId: 'mission-launch-readiness',
      title: 'Launch Stack readiness review',
      status: 'active' as const,
      departmentLabel: 'Operations',
      updatedAt: headquartersProjectionNow(),
      targetRoomId: 'mission-control' as HqRoomId,
    },
    {
      missionId: 'mission-founder-briefing',
      title: 'Daily executive briefing calibration',
      status: 'active' as const,
      departmentLabel: 'Executive',
      updatedAt: headquartersProjectionNow(),
      targetRoomId: 'daily-briefing' as HqRoomId,
    },
    {
      missionId: 'mission-dept-expansion',
      title: 'Department wing expansion planning',
      status: 'awaiting-approval' as const,
      departmentLabel: 'Strategy',
      updatedAt: headquartersProjectionNow(),
      targetRoomId: 'founder-office' as HqRoomId,
    },
    {
      missionId: 'mission-knowledge-seed',
      title: 'Knowledge Wing source audit',
      status: 'blocked' as const,
      departmentLabel: 'Knowledge',
      blockerNote: 'Awaiting Knowledge Core™ connector.',
      updatedAt: headquartersProjectionNow(),
      targetRoomId: 'knowledge-wing' as HqRoomId,
    },
  ];

  return {
    projectionId: `hq-missions-${company.companyIdentityId}`,
    owningSystem: 'Mission Engine™',
    replacementPlan: 'Mission Engine™ will own queue truth and blocker events.',
    queue,
    activeCount: queue.filter((m) => m.status === 'active').length,
    blockedCount: queue.filter((m) => m.status === 'blocked').length,
    awaitingApprovalCount: queue.filter((m) => m.status === 'awaiting-approval').length,
    generatedAt: headquartersProjectionNow(),
  };
}

export function buildHeadquartersRecommendedAction(
  _company: HeadquartersCompanyProjection
): HeadquartersRecommendedAction {
  return {
    actionId: 'rec-action-briefing-review',
    action: 'Review today\'s critical decision in Founder Office',
    reason: 'Mission queue has one blocked item and one approval waiting — clarifying priority reduces open loops.',
    confidence: 0.86,
    sourceSystems: ['Mission Engine™', 'Executive Headquarters™'],
    requiresApproval: false,
    targetRoomId: 'founder-office',
  };
}

export function buildHeadquartersOrbDockState(
  briefing: HeadquartersBriefingProjection,
  mode: HeadquartersOrbDockState['mode'] = 'greeting'
): HeadquartersOrbDockState {
  return {
    mode,
    presenceLine: briefing.greeting,
    orientationLine:
      'I reviewed company pulse, open missions, and the launch queue. The most important move is to confirm today\'s priority before deep work.',
    citationSystems: ['Identity Engine™', 'Mission Engine™', 'Company Health Index™'],
    expandable: true,
  };
}
