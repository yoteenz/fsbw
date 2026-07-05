import {
  DOCK_IDLE_ACTIVITIES,
  MICRO_MOMENT_LABELS,
  ARRIVAL_WELCOME,
} from './constants';
import type {
  ConciergeLivingStatus,
  MorningArrivalUpdate,
  OrganizationalMoment,
  TimePhase,
} from './types';
import type { ConciergePresenceState, OrganizationalPresenceActivity } from '../studio-immersion/types';

export function getTimePhase(date = new Date()): TimePhase {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 22) return 'evening';
  return 'night';
}

export function getTimePhaseLabel(phase: TimePhase): string {
  switch (phase) {
    case 'morning':
      return 'Executive briefings · planning · coordination';
    case 'afternoon':
      return 'Production · meetings · creative work';
    case 'evening':
      return 'Summaries · render completion · knowledge organization';
    case 'night':
      return 'Automation · learning · organizational intelligence';
  }
}

export function mapPresenceToLivingStatus(state: ConciergePresenceState): ConciergeLivingStatus {
  switch (state) {
    case 'available':
      return 'available';
    case 'thinking':
      return 'researching';
    case 'busy':
      return 'monitoring';
    case 'completed':
      return 'completed';
  }
}

export function livingStatusLabel(status: ConciergeLivingStatus): string {
  return status.replace(/-/g, ' ').toUpperCase();
}

/** Dock idle rotation — headquarters never feels empty. */
export function getDockIdleActivity(index: number, phase?: TimePhase): string {
  const base = DOCK_IDLE_ACTIVITIES[index % DOCK_IDLE_ACTIVITIES.length]!;
  if (phase === 'morning' && index % 7 === 0) {
    return 'Chief Concierge preparing your morning briefing…';
  }
  if (phase === 'night' && index % 5 === 2) {
    return 'Organizational intelligence optimizing overnight…';
  }
  return base;
}

export function getMicroMomentLabel(index: number): string {
  return MICRO_MOMENT_LABELS[index % MICRO_MOMENT_LABELS.length]!;
}

/** Quiet organizational moments — no popups, no interruption. */
export function getOrganizationalMoments(pathname: string, phase: TimePhase): OrganizationalMoment[] {
  const universal: OrganizationalMoment[] = [
    { id: 'om-knowledge', message: 'Knowledge graph expanded.', category: 'knowledge', quiet: true },
    { id: 'om-insight', message: 'New insight discovered.', category: 'insight', quiet: true },
  ];

  if (pathname.includes('/render-queue') || pathname.includes('/production-studio')) {
    return [
      { id: 'om-render', message: 'Render finished.', category: 'render', quiet: true },
      { id: 'om-production', message: 'Production Studio rendering today\'s media.', category: 'render', quiet: true },
      ...universal,
    ];
  }

  if (pathname.includes('/publishing')) {
    return [
      { id: 'om-publish', message: 'Publishing completed.', category: 'publishing', quiet: true },
      ...universal,
    ];
  }

  if (pathname.includes('/concierge-approval') || pathname.includes('/campaign')) {
    return [
      { id: 'om-campaign', message: 'Campaign approved.', category: 'campaign', quiet: true },
      ...universal,
    ];
  }

  if (pathname.includes('/executive-council') || pathname.includes('/chief-of-staff')) {
    return [
      { id: 'om-council', message: 'Executive Council preparing recommendations.', category: 'executive', quiet: true },
      ...universal,
    ];
  }

  if (phase === 'morning') {
    return [
      { id: 'om-brief', message: 'Morning briefing prepared.', category: 'executive', quiet: true },
      { id: 'om-render-yday', message: 'Yesterday\'s render completed successfully.', category: 'render', quiet: true },
      ...universal,
    ];
  }

  if (phase === 'evening') {
    return [
      { id: 'om-schedule', message: 'Today\'s schedule has been optimized.', category: 'insight', quiet: true },
      ...universal,
    ];
  }

  return [
    { id: 'om-relationship', message: 'Relationship updated.', category: 'relationship', quiet: true },
    { id: 'om-revenue', message: 'Revenue milestone reached.', category: 'revenue', quiet: true },
    ...universal,
  ];
}

/** Meaningful updates when founder returns — never overwhelm. */
export function buildMorningArrival(isReturning: boolean): MorningArrivalUpdate | null {
  if (!isReturning) return null;
  return {
    headline: ARRIVAL_WELCOME,
    items: [
      'Three recommendations are waiting.',
      'Yesterday\'s render completed successfully.',
      'Knowledge Concierge discovered a recurring customer trend.',
      'Brand Concierge has one creative recommendation.',
    ],
  };
}

export function enrichPresenceActivity(activity: OrganizationalPresenceActivity): {
  activity: OrganizationalPresenceActivity;
  livingStatus: ConciergeLivingStatus;
  livingLabel: string;
} {
  const livingStatus = mapPresenceToLivingStatus(activity.state);
  return {
    activity,
    livingStatus,
    livingLabel: livingStatusLabel(livingStatus),
  };
}

export function getAmbientTimeClass(phase: TimePhase): string {
  return `studio-time-${phase}`;
}
