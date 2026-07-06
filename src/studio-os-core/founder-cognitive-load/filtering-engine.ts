import { FILTERING_ACTION_LABELS, FILTERING_ACTIONS } from './constants';
import type { IntelligentFilterSnapshot, LoadState } from './types';

export function buildIntelligentFilters(
  loadState: LoadState,
  cognitiveDemandPct: number
): IntelligentFilterSnapshot[] {
  const highLoad = loadState === 'elevated' || loadState === 'critical';

  const descriptions: Record<(typeof FILTERING_ACTIONS)[number], string> = {
    'delay-non-critical': highLoad
      ? 'Non-critical notifications postponed until tomorrow — urgent matters only.'
      : 'Monitoring notification volume — delay threshold not yet triggered.',
    'batch-decisions': highLoad
      ? 'Similar approvals combined into one executive decision batch.'
      : 'Decision batching ready when pending approvals accumulate.',
    'reduce-interruptions': highLoad
      ? 'Interruption frequency reduced — Command Dock summarizes instead of alerting.'
      : 'Standard communication rhythm — interruptions minimized by default.',
    'summarize-information': highLoad
      ? 'Twelve notifications combined into one briefing — better prioritization, not more information.'
      : 'Information delivered at full detail while cognitive load is manageable.',
    'escalate-urgent-only': highLoad
      ? 'Only revenue-critical and customer-urgent items surface immediately.'
      : 'Balanced escalation — all priorities visible at moderate load.',
    'protect-focus': highLoad
      ? 'Focus protection active — non-essential activity hidden during deep work.'
      : 'Founder attention protected — proactive filtering on standby.',
  };

  return FILTERING_ACTIONS.map((action) => ({
    action,
    label: FILTERING_ACTION_LABELS[action],
    active: highLoad || (action === 'protect-focus' && cognitiveDemandPct >= 50),
    description: descriptions[action],
  }));
}

export function computeFocusProtection(
  filters: IntelligentFilterSnapshot[],
  loadState: LoadState
): number {
  const activeCount = filters.filter((f) => f.active).length;
  const base = loadState === 'critical' ? 88 : loadState === 'elevated' ? 78 : loadState === 'moderate' ? 68 : 58;
  return Math.min(98, base + activeCount * 3);
}
