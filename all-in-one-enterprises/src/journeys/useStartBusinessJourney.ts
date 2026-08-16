import { useMemo } from 'react';
import type { RoadReadyItem } from '../road-ready/roadReadyTypes';
import { getOrganizationId, getRoadReadyItems, getRoadReadyProfile } from '../demo/roadReadyActions';
import { useDemoStore } from '../demo/useDemoStore';
import { startBusinessJourneyDef } from './startBusinessJourneyConfig';
import {
  aggregateStatuses,
  ctaForStatus,
  isStepComplete,
  mapRoadReadyStatus,
  statusForKeys,
  stepCountsForProgress,
} from './journeyStatusMap';
import { withJourneyContext } from './journeyContext';
import type {
  JourneyAttentionItem,
  JourneyStepId,
  JourneyStepStatus,
  JourneyStepView,
  JourneySubStepView,
  StartBusinessJourneyView,
} from './journeyTypes';
import { JOURNEY_STEP_STATUS_LABELS } from './journeyTypes';

function buildSubSteps(
  stepDef: (typeof startBusinessJourneyDef.steps)[number],
  items: RoadReadyItem[],
): JourneySubStepView[] | undefined {
  if (!stepDef.subSteps?.length) return undefined;
  return stepDef.subSteps.map((sub) => {
    const matched = items.filter((i) => sub.roadReadyKeys.includes(i.requirementKey));
    const applicableItems = matched.filter((i) => i.applicable !== false && i.status !== 'not_applicable');
    const applicable = applicableItems.length > 0 || matched.length === 0;
    const status =
      matched.length === 0
        ? ('not_started' as JourneyStepStatus)
        : applicableItems.length === 0
          ? ('not_applicable' as JourneyStepStatus)
          : aggregateStatuses(applicableItems.map((i) => mapRoadReadyStatus(i.status)));
    const route = sub.route ?? stepDef.route;
    const cta = ctaForStatus(status, withJourneyContext(route, stepDef.id));
    return {
      def: sub,
      status,
      statusLabel: JOURNEY_STEP_STATUS_LABELS[status],
      ctaLabel: cta.label,
      ctaRoute: cta.route,
      applicable,
    };
  });
}

function buildStepView(
  stepDef: (typeof startBusinessJourneyDef.steps)[number],
  items: RoadReadyItem[],
): JourneyStepView {
  const subSteps = buildSubSteps(stepDef, items);
  let status: JourneyStepStatus;
  if (stepDef.id === 'roll') {
    status = 'ready';
  } else if (subSteps?.length) {
    const applicableSubs = subSteps.filter((s) => s.applicable);
    status =
      applicableSubs.length === 0
        ? 'not_applicable'
        : aggregateStatuses(applicableSubs.map((s) => s.status));
  } else {
    status = statusForKeys(stepDef.roadReadyKeys, items);
  }

  const applicable =
    status !== 'not_applicable' &&
    (stepDef.optional !== true || stepDef.id === 'roll') &&
    (stepDef.roadReadyKeys.length > 0 || stepDef.id === 'roll' || Boolean(subSteps?.some((s) => s.applicable)));

  const route = withJourneyContext(stepDef.route, stepDef.id);
  const cta = ctaForStatus(status, route);

  let subProgress: JourneyStepView['subProgress'];
  if (subSteps?.length) {
    const counted = subSteps.filter((s) => s.applicable);
    const total = counted.length;
    const completed = counted.filter((s) => isStepComplete(s.status)).length;
    subProgress = { completed, total, percent: total ? Math.round((completed / total) * 100) : 0 };
  }

  return {
    def: stepDef,
    status,
    statusLabel: JOURNEY_STEP_STATUS_LABELS[status],
    ctaLabel: cta.label.toUpperCase() + ' →',
    ctaRoute: cta.route,
    applicable: stepDef.optional ? true : applicable || status !== 'not_applicable',
    optional: Boolean(stepDef.optional),
    subProgress,
    subSteps,
  };
}

const ACTION_PRIORITY: JourneyStepStatus[] = [
  'action_required',
  'in_progress',
  'waiting_partner',
  'waiting_aio',
  'ready',
  'not_started',
];

export function pickNextAction(steps: JourneyStepView[]): JourneyStepView | null {
  for (const p of ACTION_PRIORITY) {
    const match = steps.find((s) => s.status === p && s.applicable && !s.optional);
    if (match) return match;
  }
  return steps.find((s) => (s.status === 'ready' || s.status === 'not_started') && s.applicable && !s.optional) ?? null;
}

export function buildAttention(steps: JourneyStepView[]): JourneyAttentionItem[] {
  return steps
    .filter((s) => s.status === 'action_required' && s.applicable)
    .map((s) => ({
      stepId: s.def.id,
      label: `Complete ${s.def.shortTitle}`,
      route: s.ctaRoute,
    }));
}

export function useStartBusinessJourney(selectedStepId?: JourneyStepId): StartBusinessJourneyView {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);

  return useMemo(() => {
    const profile = getRoadReadyProfile(orgId, store);
    const items = profile ? getRoadReadyItems(orgId, store) : [];

    const steps = startBusinessJourneyDef.steps.map((def) => buildStepView(def, items));
    const progressInput = steps.map((s) => ({
      status: s.status,
      optional: s.optional,
      applicable: s.applicable && !s.optional,
    }));
    const { completed, total, percent } = stepCountsForProgress(progressInput);
    const nextAction = pickNextAction(steps);
    const attention = buildAttention(steps);
    const isComplete = total > 0 && completed >= total;

    const fallbackStep = nextAction?.def.id ?? 'build';
    const selected = selectedStepId ?? fallbackStep;

    return {
      journey: startBusinessJourneyDef,
      steps,
      progress: {
        percent,
        completedCount: completed,
        applicableCount: total,
        label: total ? `${completed} of ${total} milestones complete` : 'Ready to begin your startup journey',
      },
      nextAction,
      attention,
      isComplete,
      selectedStepId: selected,
    };
  }, [orgId, store, selectedStepId]);
}
