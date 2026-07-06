import type { WalkthroughStop } from './types';

/** Default HQ walkthrough — progressive onboarding aligned with M125 Getting Started. */
export const DEFAULT_WALKTHROUGH_STOPS: WalkthroughStop[] = [
  {
    id: 'organization',
    title: 'Your Organization',
    purpose: 'Studio OS begins with your organization — workspace, identity, and registry.',
    routeSegment: 'studio-os',
    order: 1,
  },
  {
    id: 'blueprint',
    title: 'Business Discovery Blueprint™',
    purpose: 'Capture how your business operates before automation begins.',
    routeSegment: 'business-discovery-blueprint',
    order: 2,
  },
  {
    id: 'profession-brain',
    title: 'Profession Brain™',
    purpose: 'Your expertise becomes living organizational intelligence.',
    routeSegment: 'profession-brain',
    order: 3,
  },
  {
    id: 'mission-control',
    title: 'Headquarters — Mission Control',
    purpose: 'Your executive nerve center — priorities, health, timeline, and today\'s best move.',
    routeSegment: 'mission-control',
    order: 4,
  },
  {
    id: 'command-dock',
    title: 'Command Dock™',
    purpose: 'Speak naturally. Studio OS routes requests to the right concierges automatically.',
    order: 5,
  },
  {
    id: 'departments',
    title: 'Departments',
    purpose: 'Each wing of Headquarters reflects a part of how your business actually operates.',
    order: 6,
  },
  {
    id: 'digital-staff',
    title: 'Digital Concierges',
    purpose: 'Hire concierges and intelligence employees on Digital Payroll — not AI subscriptions.',
    routeSegment: 'expansion-center',
    order: 7,
  },
  {
    id: 'executive-council',
    title: 'Executive Council™',
    purpose: 'Many minds, one briefing — simulated executive perspectives on decisions.',
    routeSegment: 'executive-council',
    order: 8,
  },
  {
    id: 'expansion-center',
    title: 'Expansion Center',
    purpose: 'Permanently expand Headquarters with new departments when your organization is ready.',
    routeSegment: 'expansion-center',
    order: 9,
  },
  {
    id: 'registry',
    title: 'Organization Registry',
    purpose: 'Your organization\'s permanent home in the Studio OS workspace portfolio.',
    routeSegment: 'studio-os',
    order: 10,
  },
];
