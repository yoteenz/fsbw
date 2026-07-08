import type { OrbFocusMode } from './types';

export const ORB_RECOMMENDATIONS_STORAGE_KEY = 'studioOrbRecommendations_v1';
export const ORB_DAILY_BRIEF_SESSION_KEY = 'studioOrbDailyBriefShown_v1';

export const ORB_FOCUS_MODE_LABELS: Record<OrbFocusMode, string> = {
  executive: 'Executive Mode™',
  creative: 'Creative Mode™',
  builder: 'Builder Mode™',
  explorer: 'Explorer Mode™',
  growth: 'Growth Mode™',
  launch: 'Launch Mode™',
};

export const ORB_FOCUS_MODE_DESCRIPTIONS: Record<OrbFocusMode, string> = {
  executive: 'Only mission-critical recommendations.',
  creative: 'Inspiration and creative opportunities.',
  builder: 'Focus on generation and construction.',
  explorer: 'Highlight discoveries and hidden areas.',
  growth: 'Prioritize expansion opportunities.',
  launch: 'Focus entirely on shipping and execution.',
};

export const ORB_FOCUS_MODES: OrbFocusMode[] = [
  'executive',
  'creative',
  'builder',
  'explorer',
  'growth',
  'launch',
];

export const ORB_RECOMMENDATION_EVENT = 'studio-orb-recommendations-changed';
