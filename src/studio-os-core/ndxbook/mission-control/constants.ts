import type { MissionControlNavId, ProductionStageId } from './types';

export const NDXBOOK_MISSION_CONTROL_STORAGE_KEY = 'studioOsNdxbookMissionControl_v1';
export const NDXBOOK_MISSION_CONTROL_VERSION = '1.0.0';

export const PRODUCTION_STAGES: { id: ProductionStageId; label: string }[] = [
  { id: 'idea', label: 'IDEA' },
  { id: 'research', label: 'RESEARCH' },
  { id: 'script', label: 'SCRIPT' },
  { id: 'review', label: 'REVIEW' },
  { id: 'voice', label: 'VOICE' },
  { id: 'animation', label: 'ANIMATION' },
  { id: 'thumbnail', label: 'THUMBNAIL' },
  { id: 'caption', label: 'CAPTION' },
  { id: 'scheduled', label: 'SCHEDULED' },
  { id: 'published', label: 'PUBLISHED' },
  { id: 'analytics', label: 'ANALYTICS' },
];

export const NDXBOOK_MISSION_CONTROL_NAV: { id: MissionControlNavId; label: string }[] = [
  { id: 'mission-control', label: 'HEADQUARTERS' },
  { id: 'newsroom', label: 'NEWSROOM' },
  { id: 'library', label: 'LIBRARY' },
  { id: 'publishing', label: 'PUBLISHING' },
  { id: 'analytics', label: 'ANALYTICS' },
  { id: 'experiments', label: 'EXPERIMENTS' },
  { id: 'studio-intelligence', label: 'STUDIO INTELLIGENCE' },
  { id: 'creative-dna', label: 'CREATIVE DNA' },
  { id: 'knowledge', label: 'KNOWLEDGE' },
  { id: 'settings', label: 'SETTINGS' },
];

export const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸',
  tiktok: '🎵',
  'youtube-shorts': '▶',
  facebook: '👥',
  threads: '🧵',
  x: '𝕏',
  pinterest: '📌',
};

export const TALENT_STATUS_COLORS: Record<string, string> = {
  available: '#16A34A',
  researching: '#2563EB',
  recording: '#EB1C24',
  rendering: '#CA8A04',
  editing: '#6366F1',
  scheduled: '#808080',
};

export const ACTIVITY_CATEGORY_COLORS: Record<string, string> = {
  production: '#2563EB',
  experiment: '#6366F1',
  intelligence: '#CA8A04',
  social: '#16A34A',
  publish: '#EB1C24',
  revenue: '#059669',
  talent: '#7C3AED',
};
