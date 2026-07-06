import { CONTEXT_AWARENESS_SIGNALS } from './constants';
import type { ContextSignalReading, ExperienceModeId } from './types';

const SIGNAL_META: Record<
  typeof CONTEXT_AWARENESS_SIGNALS[number],
  { label: string; reading: string; suggestedMode?: ExperienceModeId; active: boolean }
> = {
  calendar: { label: 'Calendar', reading: 'Executive review at 2:00 PM', suggestedMode: 'executive-review-mode', active: true },
  'organization-pulse': { label: 'Organization Pulse™', reading: 'Healthy — Thriving state', active: true },
  'founder-cognitive-load': { label: 'Founder Cognitive Load™', reading: 'Elevated — focus protection recommended', suggestedMode: 'focus-mode', active: true },
  'meeting-status': { label: 'Meeting Status', reading: 'Board presentation in 15 minutes', suggestedMode: 'presentation-mode', active: true },
  'presentation-status': { label: 'Presentation Status', reading: 'Stakeholder deck ready', suggestedMode: 'presentation-mode', active: false },
  'launch-day': { label: 'Launch Day', reading: 'Q3 campaign launches today', suggestedMode: 'launch-mode', active: false },
  milestones: { label: 'Milestones', reading: 'Infrastructure Chapter complete', suggestedMode: 'celebration-mode', active: true },
  workload: { label: 'Workload', reading: 'Moderate — 12 pending approvals', active: true },
  'time-of-day': { label: 'Time of Day', reading: 'Business hours — normal atmosphere', active: true },
  'active-workspace': { label: 'Active Workspace', reading: 'Frontal Slayer Headquarters', active: true },
  'current-department': { label: 'Current Department', reading: 'Executive · Marketing', active: true },
};

export function buildContextSignalReadings(): ContextSignalReading[] {
  return CONTEXT_AWARENESS_SIGNALS.map((signal) => {
    const meta = SIGNAL_META[signal];
    return {
      signal,
      label: meta.label,
      currentReading: meta.reading,
      suggestedMode: meta.suggestedMode,
      active: meta.active,
    };
  });
}

export function computeContextAwarenessPct(signals: ContextSignalReading[]): number {
  const active = signals.filter((s) => s.active).length;
  return Math.min(99, Math.round((active / signals.length) * 100 + 10));
}
