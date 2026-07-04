/**
 * Asset Factory — manufacturing department (Milestone 19).
 * Demo simulation — providers not connected; no real generation.
 */

export const ASSET_FACTORY_SUBTITLE = 'MANUFACTURING CREATIVE SYSTEMS';

export const ASSET_FACTORY_INHERITANCE_CHAIN = [
  'BLUEPRINT MANAGER',
  'ASSET FACTORY',
  'ASSET DIRECTOR',
  'MISSION CONTROL',
  'EXECUTIVE AI DIRECTOR',
] as const;

export type AssetFactoryViewMode = 'executive' | 'floor' | 'tour';

export type FactoryJobStatus =
  | 'queued'
  | 'running'
  | 'paused'
  | 'waiting'
  | 'needs-review'
  | 'failed'
  | 'completed';

export type FactoryDepartmentId =
  | 'prompt-engineering'
  | 'environment-lab'
  | 'lighting-lab'
  | 'camera-lab'
  | 'animation-studio'
  | 'voice-studio'
  | 'quality-assurance'
  | 'archive'
  | 'asset-director';

export const FACTORY_DEPARTMENTS: Array<{
  id: FactoryDepartmentId;
  label: string;
  role: string;
  tourMessage: string;
}> = [
  { id: 'prompt-engineering', label: 'PROMPT ENGINEERING', role: 'PROMPT ENGINEER', tourMessage: 'ASSEMBLING PROMPT STACK…' },
  { id: 'environment-lab', label: 'ENVIRONMENT LAB', role: 'ENVIRONMENT ARTIST', tourMessage: 'GENERATING MASTER ENVIRONMENT…' },
  { id: 'lighting-lab', label: 'LIGHTING LAB', role: 'LIGHTING ARTIST', tourMessage: 'APPLYING LUXURY DAY…' },
  { id: 'camera-lab', label: 'CAMERA LAB', role: 'CAMERA DIRECTOR', tourMessage: 'CREATING CAMERA PRESETS…' },
  { id: 'animation-studio', label: 'ANIMATION STUDIO', role: 'VIDEO EDITOR', tourMessage: 'GENERATING IDLE LOOP…' },
  { id: 'voice-studio', label: 'VOICE STUDIO', role: 'VOICE DESIGNER', tourMessage: 'PREPARING VOICE ASSETS…' },
  { id: 'quality-assurance', label: 'QUALITY ASSURANCE', role: 'QUALITY INSPECTOR', tourMessage: 'VALIDATING PRODUCTION…' },
  { id: 'archive', label: 'ARCHIVE', role: 'ARCHIVIST', tourMessage: 'VERSIONING ASSETS…' },
  { id: 'asset-director', label: 'ASSET DIRECTOR', role: 'DELIVERY', tourMessage: 'PRODUCTION COMPLETE.' },
];

export type FactoryExecutiveMetrics = {
  factoryHealth: number;
  jobsRunning: number;
  jobsWaiting: number;
  jobsCompleted: number;
  creditsUsed: number;
  estimatedCost: string;
  estimatedCompletion: string;
  storageUsed: string;
  queueHealth: number;
  productionEfficiency: number;
  factoryUtilization: number;
  blueprintReadiness: number;
};

export const FACTORY_EXECUTIVE_SEED: FactoryExecutiveMetrics = {
  factoryHealth: 94,
  jobsRunning: 1,
  jobsWaiting: 2,
  jobsCompleted: 14,
  creditsUsed: 2840,
  estimatedCost: '$142.00',
  estimatedCompletion: '4M 12S',
  storageUsed: '2.4 GB',
  queueHealth: 91,
  productionEfficiency: 88,
  factoryUtilization: 72,
  blueprintReadiness: 68,
};

export type FactoryPerformanceMetrics = {
  avgGenerationTime: string;
  avgQaScore: number;
  providerSuccessRate: number;
  assetsManufactured: number;
  imagesGenerated: number;
  videosGenerated: number;
  creditsUsed: number;
  storage: string;
  factoryUtilization: number;
};

export const FACTORY_PERFORMANCE_SEED: FactoryPerformanceMetrics = {
  avgGenerationTime: '3M 48S',
  avgQaScore: 96,
  providerSuccessRate: 94,
  assetsManufactured: 312,
  imagesGenerated: 248,
  videosGenerated: 64,
  creditsUsed: 2840,
  storage: '2.4 GB',
  factoryUtilization: 72,
};

export type FactoryActivityItem = {
  id: string;
  text: string;
  time: string;
  category: string;
};

export const FACTORY_ACTIVITY_SEED: FactoryActivityItem[] = [
  { id: 'fa-1', text: 'BLUEPRINT APPROVED · WEATHER STUDIO', time: 'JUST NOW', category: 'BLUEPRINT' },
  { id: 'fa-2', text: 'PROMPT STACK ASSEMBLED', time: '2M AGO', category: 'PROMPT' },
  { id: 'fa-3', text: 'ENVIRONMENT COMPLETE · MASTER', time: '5M AGO', category: 'ENVIRONMENT' },
  { id: 'fa-4', text: 'LIGHTING COMPLETE · LUXURY DAY', time: '8M AGO', category: 'LIGHTING' },
  { id: 'fa-5', text: 'VIDEO COMPLETE · IDLE LOOP', time: '12M AGO', category: 'VIDEO' },
  { id: 'fa-6', text: 'QA PASSED · 96% SCORE', time: '14M AGO', category: 'QA' },
  { id: 'fa-7', text: 'ARCHIVED · VERSION 3', time: '15M AGO', category: 'ARCHIVE' },
  { id: 'fa-8', text: 'ASSET DIRECTOR UPDATED', time: '15M AGO', category: 'DELIVERY' },
  { id: 'fa-9', text: 'MISSION CONTROL UPDATED', time: '15M AGO', category: 'SYNC' },
  { id: 'fa-10', text: 'EXECUTIVE AI DIRECTOR NOTIFIED', time: '15M AGO', category: 'INTELLIGENCE' },
];

export type FactoryEadSuggestion = {
  id: string;
  title: string;
  detail: string;
  source: 'history' | 'config' | 'estimate';
};

export const FACTORY_EAD_SUGGESTIONS: FactoryEadSuggestion[] = [
  { id: 'fe-1', title: 'GENERATE HOLIDAY VERSION', detail: 'WEATHER STUDIO BLUEPRINT INCLUDES HOLIDAY VARIANT — NOT YET MANUFACTURED (WORKSPACE HISTORY).', source: 'history' },
  { id: 'fe-2', title: 'UPSCALE HERO ASSET', detail: 'MASTER ENVIRONMENT AT 3840×1600 — CONSIDER 4K DELIVERY FOR LOUNGE TV (ESTIMATE).', source: 'estimate' },
  { id: 'fe-3', title: 'IMPROVE PROMPT STACK', detail: 'ADD SCENE RULES LAYER BEFORE PROVIDER FORMATTING (CONFIG).', source: 'config' },
  { id: 'fe-4', title: 'GENERATE MOBILE VARIANT', detail: 'SOCIAL ASPECT RATIOS MISSING FROM LAST RUN (HISTORY).', source: 'history' },
  { id: 'fe-5', title: 'GENERATE EDITORIAL VERSION', detail: 'EDITORIAL IMAGE VARIANT LISTED IN BLUEPRINT — QUEUE RECOMMENDED (ESTIMATE).', source: 'estimate' },
];

export type VariationPreset = {
  id: string;
  label: string;
};

export const VARIATION_PRESETS: VariationPreset[] = [
  { id: 'luxury', label: 'LUXURY' },
  { id: 'editorial', label: 'EDITORIAL' },
  { id: 'holiday', label: 'HOLIDAY' },
  { id: 'launch', label: 'LAUNCH' },
  { id: 'minimal', label: 'MINIMAL' },
  { id: 'campaign', label: 'CAMPAIGN' },
  { id: 'mobile', label: 'MOBILE' },
  { id: 'desktop', label: 'DESKTOP' },
  { id: 'social', label: 'SOCIAL' },
];

export type QaCheckResult = {
  id: string;
  label: string;
  passed: boolean;
};

export const QA_CHECK_LABELS = [
  'RESOLUTION',
  'ASPECT RATIO',
  'WORKSPACE RULES',
  'BRAND COMPLIANCE',
  'LUXURY STYLE',
  'PROMPT MATCH',
  'TRANSPARENCY',
  'NAMING CONVENTION',
] as const;

export function jobStatusColor(status: FactoryJobStatus): string {
  if (status === 'completed') return '#16A34A';
  if (status === 'running') return '#2563EB';
  if (status === 'failed') return '#EB1C24';
  if (status === 'needs-review') return '#CA8A04';
  if (status === 'paused') return '#9CA3AF';
  return '#6B7280';
}
