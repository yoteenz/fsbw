import type { WalkthroughStop } from './types';

export const DEFAULT_WALKTHROUGH_STOPS: WalkthroughStop[] = [
  {
    id: 'mission-control',
    title: 'Mission Control',
    purpose: 'Your executive nerve center — priorities, health, timeline, and today\'s best move.',
    routeSegment: 'mission-control',
    order: 1,
  },
  {
    id: 'command-dock',
    title: 'Command Dock',
    purpose: 'Speak naturally. Studio OS routes requests to the right concierges automatically.',
    order: 2,
  },
  {
    id: 'departments',
    title: 'Departments',
    purpose: 'Each wing of Headquarters reflects a part of how your business actually operates.',
    order: 3,
  },
  {
    id: 'digital-staff',
    title: 'Digital Staff',
    purpose: 'Hire concierges and intelligence employees on Digital Payroll — not AI subscriptions.',
    routeSegment: 'expansion-center',
    order: 4,
  },
  {
    id: 'expansion-center',
    title: 'Expansion Center',
    purpose: 'Permanently expand Headquarters with new departments when your organization is ready.',
    routeSegment: 'expansion-center',
    order: 5,
  },
  {
    id: 'registry',
    title: 'Organization Registry',
    purpose: 'Your organization\'s permanent home in the Studio OS workspace portfolio.',
    routeSegment: 'studio-os',
    order: 6,
  },
];
