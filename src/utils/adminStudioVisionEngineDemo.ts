import type { VisionAnalyticsSummary } from '../studio-os-core/vision-engine/types';

export const ADMIN_STUDIO_VISION_ENGINE_SUBTITLE =
  'Vision Engine™ — cinematic presentation operating system for every Studio OS workspace. Internal only.';

export const VISION_ENGINE_INHERITANCE_CHAIN = [
  'WORKSPACE MANIFEST',
  'VISION MODES',
  'VISION ENGINE BUILDER',
  'VISION RECORDER',
  'VISION SHARE',
  'VISION ANALYTICS',
  'VISION AI (FUTURE)',
] as const;

export type VisionEngineTabId = 'overview' | 'builder' | 'recorder' | 'share' | 'analytics' | 'launch';

export const VISION_ENGINE_TABS: Array<{ id: VisionEngineTabId; label: string }> = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'builder', label: 'BUILDER' },
  { id: 'recorder', label: 'RECORDER' },
  { id: 'share', label: 'SHARE' },
  { id: 'analytics', label: 'ANALYTICS' },
  { id: 'launch', label: 'LAUNCH' },
];

export const DEMO_VISION_ANALYTICS: VisionAnalyticsSummary[] = [
  {
    shareId: 'demo-investor',
    modeLabel: 'Vision Mode — Investor',
    totalViews: 12,
    avgWatchMs: 384000,
    completionRate: 0.96,
    replayedSections: ['Build-A-Wig Atelier', 'Hair Showroom'],
    skippedSections: ['Mobile Concierge'],
    hotspotClicks: 8,
    ctaClicks: 3,
    shares: 2,
    engagementTimeline: 'Investor watched 96%. Designer replayed Build-A-Wig 4 times.',
  },
  {
    shareId: 'demo-agency',
    modeLabel: 'Vision Mode — Agency Presentation',
    totalViews: 7,
    avgWatchMs: 480000,
    completionRate: 0.88,
    replayedSections: ['Grand Lobby', 'Slay Cam Gallery'],
    skippedSections: ['Founder Suite'],
    hotspotClicks: 14,
    ctaClicks: 1,
    shares: 4,
    engagementTimeline: 'Agency spent 8 minutes inside Vision Mode.',
  },
  {
    shareId: 'demo-press',
    modeLabel: 'Vision Mode — Press Tour',
    totalViews: 21,
    avgWatchMs: 210000,
    completionRate: 0.72,
    replayedSections: ['TV Lounge'],
    skippedSections: ['Members Lounge'],
    hotspotClicks: 5,
    ctaClicks: 0,
    shares: 6,
    engagementTimeline: 'User exited during Members Lounge.',
  },
];

export function visionShareUrl(slug: string): string {
  if (typeof window === 'undefined') return `/vision/${slug}`;
  return `${window.location.origin}/vision/${slug}`;
}
