import {
  adminStudioConciergeApprovalFlowPath,
  adminStudioRenderQueuePath,
  adminStudioScreeningRoomPath,
} from '../../utils/adminStudioRoutes';
import type {
  ChiefConciergeBrief,
  OrganizationalPresenceActivity,
  ScreenMoment,
  StudioRoomVariant,
} from './types';

const PRESENCE_ROTATION: OrganizationalPresenceActivity[] = [
  { id: 'p1', concierge: 'Brand Concierge', activity: 'reviewing Page 028 typography…', location: 'Editorial Board', state: 'busy' },
  { id: 'p2', concierge: 'Experience Concierge', activity: 'mapping viewer journey for Lace Mastery…', location: 'Screening Room', state: 'thinking' },
  { id: 'p3', concierge: 'Digital Concierge', activity: 'optimizing cross-platform metadata…', location: 'Publishing Wing', state: 'busy' },
  { id: 'p4', concierge: 'Technology Concierge', activity: 'optimizing render export…', location: 'Production Floor', state: 'busy', progressPct: 94 },
  { id: 'p5', concierge: 'Growth Concierge', activity: 'running retention forecast…', location: 'Analytics Center', state: 'thinking' },
  { id: 'p6', concierge: 'Knowledge Concierge', activity: 'indexing new institutional memory…', location: 'Knowledge Hub', state: 'busy' },
  { id: 'p7', concierge: 'Research AI', activity: 'typing competitive signals…', location: 'Mission Control', state: 'thinking' },
  { id: 'p8', concierge: 'Chief Concierge', activity: 'preparing morning briefing…', location: 'Headquarters', state: 'available' },
  { id: 'p9', concierge: 'Publishing Queue', activity: 'moving scheduled releases…', location: 'Publishing Wing', state: 'busy' },
  { id: 'p10', concierge: 'Render Queue', activity: 'processing voice generation…', location: 'Production Floor', state: 'busy', progressPct: 67 },
  { id: 'p11', concierge: 'Brand Concierge', activity: 'comparing against historical launches…', location: 'Concierge Layer', state: 'completed' },
  { id: 'p12', concierge: 'Technology Concierge', activity: 'rendering motion graphics…', location: 'Production Studio', state: 'busy', progressPct: 82 },
];

export function resolveStudioRoomVariant(pathname: string): StudioRoomVariant {
  if (pathname.includes('/screening-room')) return 'cinema';
  if (pathname.includes('/concierge-approval') || pathname.includes('/concierge-layer')) return 'editorial';
  if (
    pathname.includes('/production-studio') ||
    pathname.includes('/render-queue') ||
    pathname.includes('/production-builder') ||
    pathname.includes('/director-mode') ||
    pathname.includes('/production/')
  ) {
    return 'production-floor';
  }
  if (pathname.includes('/publishing-queue') || pathname.includes('/distribution')) return 'publishing-wing';
  if (pathname.includes('/ndxbook') || pathname.includes('/newsroom')) return 'newsroom';
  if (
    pathname.includes('/analytics') ||
    pathname.includes('/intelligence') ||
    pathname.includes('/audience-brain') ||
    pathname.includes('/growth-network')
  ) {
    return 'analytics-center';
  }
  if (pathname.includes('/labs') || pathname.includes('/experiment')) return 'labs';
  if (pathname.includes('/studio-institute') || pathname.includes('/organizational-apprenticeship')) return 'institute';
  return 'headquarters';
}

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning.';
  if (h < 17) return 'Good afternoon.';
  return 'Good evening.';
}

export function buildChiefConciergeBrief(pathname: string): ChiefConciergeBrief {
  const greeting = timeGreeting();
  if (pathname.includes('/mission-control') || pathname.endsWith('/studio')) {
    return {
      greeting,
      lines: [
        'Brand Concierge has completed creative review on Lace Mastery.',
        'Growth Concierge recommends publishing at 2:00 PM for peak retention.',
        'Technology Concierge completed rendering — Screening Room is ready.',
        'Would you like to review today\'s production?',
      ],
      cta: { label: 'REVIEW PRODUCTION', route: adminStudioScreeningRoomPath() },
    };
  }
  if (pathname.includes('/production-studio') || pathname.includes('/render-queue')) {
    return {
      greeting,
      lines: [
        'Production floor is active — scripts moving · voice rendering · motion assembling.',
        'Render Queue shows 3 jobs in progress with Technology Concierge oversight.',
        'Nothing requires founder judgment until Screening Room review completes.',
      ],
      cta: { label: 'OPEN RENDER QUEUE', route: adminStudioRenderQueuePath() },
    };
  }
  if (pathname.includes('/screening-room')) {
    return {
      greeting,
      lines: [
        'Private cinema is prepared — Version B is the concierge recommendation.',
        'Experience Concierge notes trust-first pacing approved for beginners.',
        'When ready, Editorial Board has unified the founder brief.',
      ],
      cta: { label: 'EDITORIAL BOARD', route: adminStudioConciergeApprovalFlowPath() },
    };
  }
  if (pathname.includes('/concierge-approval')) {
    return {
      greeting,
      lines: [
        'Six discipline reviews are consolidated into one Chief Concierge brief.',
        'You receive finished organizational judgment — not raw drafts.',
        'Lace Mastery awaits your final decision.',
      ],
    };
  }
  if (pathname.includes('/publishing-queue')) {
    return {
      greeting,
      lines: [
        'Publishing Wing is sequencing this week\'s releases.',
        'Digital Concierge confirmed metadata across platforms.',
        'Two launches approaching — countdowns are live in the timeline.',
      ],
    };
  }
  if (pathname.includes('/analytics') || pathname.includes('/intelligence')) {
    return {
      greeting,
      lines: [
        'Analytics Center is quiet — Growth Concierge updated forecasts overnight.',
        'No critical risks flagged. One opportunity surfaced in retention data.',
      ],
    };
  }
  return {
    greeting,
    lines: [
      'The organization has been working while you were away.',
      'Chief Concierge prepared today\'s priorities — Mission Control has your briefing.',
    ],
    cta: { label: 'MISSION CONTROL', route: '/admin/studio/mission-control' },
  };
}

export function getPresenceActivity(index: number): OrganizationalPresenceActivity {
  const i = ((index % PRESENCE_ROTATION.length) + PRESENCE_ROTATION.length) % PRESENCE_ROTATION.length;
  return PRESENCE_ROTATION[i]!;
}

export function getPresenceActivities(count: number, startIndex: number): OrganizationalPresenceActivity[] {
  return Array.from({ length: count }, (_, i) => getPresenceActivity(startIndex + i));
}

/** Subtle organizational moments — no popups, quiet acknowledgment. */
export function getActiveScreenMoment(pathname: string): ScreenMoment | null {
  if (pathname.includes('/publishing-queue')) {
    return {
      id: 'launch-countdown',
      message: 'Launch countdown active · Publishing Wing sequencing releases',
      tone: 'countdown',
    };
  }
  if (pathname.includes('/concierge-approval')) {
    return {
      id: 'founder-ready',
      message: 'Editorial Board ready · unified brief prepared for founder review',
      tone: 'milestone',
    };
  }
  if (pathname.includes('/render-queue')) {
    return {
      id: 'production-momentum',
      message: 'Production floor momentum · AI workers collaborating across pipeline',
      tone: 'milestone',
    };
  }
  return null;
}

export function stateLabel(state: OrganizationalPresenceActivity['state']): string {
  switch (state) {
    case 'available':
      return 'AVAILABLE';
    case 'thinking':
      return 'THINKING';
    case 'busy':
      return 'IN PROGRESS';
    case 'completed':
      return 'COMPLETE';
  }
}
