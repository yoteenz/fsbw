import { getOrganizationFounderCognitiveLoadProfile } from '../founder-cognitive-load/store';
import { FOCUS_PROTECTION_LABELS } from './constants';
import type { FocusProtectionAction, FocusProtectionTarget } from './types';

function actionId(target: string, orgId: string): string {
  return `fos-focus-${target}-${orgId}`;
}

export function buildFocusProtectionActions(organizationId: string): FocusProtectionAction[] {
  const cognitive = getOrganizationFounderCognitiveLoadProfile(organizationId);
  const loadState = cognitive?.loadState ?? 'moderate';
  const filtersActive = cognitive?.activeFilters.filter((f) => f.active).length ?? 0;

  const targets: FocusProtectionTarget[] = [
    'deep-work',
    'creative-sessions',
    'strategic-planning',
    'personal-learning',
    'recovery-time',
  ];

  return targets.map((target, i) => {
    const protectedBlock = loadState === 'elevated' || loadState === 'critical' || filtersActive > 2;
    const actions: Record<FocusProtectionTarget, string> = {
      'deep-work': protectedBlock
        ? 'Two 90-minute blocks protected — notifications batched.'
        : 'Schedule deep work Tuesday and Thursday mornings.',
      'creative-sessions': 'Evening creative window protected — operational work ends by 6 PM.',
      'strategic-planning': "You've spent 78% of your week in operations — block Friday for strategy.",
      'personal-learning': 'One learning session weekly — Studio Institute™ aligned.',
      'recovery-time': loadState === 'critical' ? 'Recovery time recommended — reduce meeting load 20%.' : 'Weekend recovery preserved — no operational alerts.',
    };
    const schedules: Record<FocusProtectionTarget, string> = {
      'deep-work': 'Tue/Thu 8:00–9:30 AM',
      'creative-sessions': 'Daily 9:00 PM–12:00 AM',
      'strategic-planning': 'Fri 1:00–3:00 PM',
      'personal-learning': 'Wed 4:00–5:00 PM',
      'recovery-time': 'Sat–Sun protected',
    };

    return {
      id: actionId(target, organizationId),
      target,
      label: FOCUS_PROTECTION_LABELS[target],
      action: actions[target],
      protected: protectedBlock || i < 3,
      scheduledBlock: schedules[target],
    };
  });
}

export function summarizeFocusActions(actions: FocusProtectionAction[]): string {
  const protectedCount = actions.filter((a) => a.protected).length;
  return `${protectedCount}/${actions.length} focus targets protected · batch low-priority work · recommend delegation.`;
}
