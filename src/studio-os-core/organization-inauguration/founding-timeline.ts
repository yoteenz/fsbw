import type { FoundingTimelineMilestone } from './types';

export function buildFoundingTimeline(now: string, organizationName: string): FoundingTimelineMilestone[] {
  const iso = now;
  return [
    {
      id: 'tl-org-created',
      label: `${organizationName} · Organization Created`,
      occurredAt: iso,
      permanent: true,
    },
    {
      id: 'tl-blueprint',
      label: 'Business Discovery Blueprint™ Completed',
      occurredAt: iso,
      permanent: true,
    },
    {
      id: 'tl-hq-activated',
      label: 'Headquarters Activated',
      occurredAt: iso,
      permanent: true,
    },
    {
      id: 'tl-mission-control',
      label: 'Mission Control Online',
      occurredAt: iso,
      permanent: true,
    },
    {
      id: 'tl-workforce',
      label: 'Digital Workforce Initialized',
      occurredAt: iso,
      permanent: true,
    },
  ];
}
