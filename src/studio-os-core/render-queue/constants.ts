/** Centralized Render Queue — production floor heartbeat. */

export const RENDER_QUEUE_STORAGE_KEY = 'studioOsRenderQueue_v1';
export const RENDER_QUEUE_VERSION = '1.0.0';
export const RENDER_QUEUE_ID = 'render-queue';

export const RENDER_PIPELINE_STAGES = [
  { id: 'queued', label: 'QUEUED' },
  { id: 'generating-script', label: 'GENERATING SCRIPT' },
  { id: 'generating-voice', label: 'GENERATING VOICE' },
  { id: 'generating-visuals', label: 'GENERATING VISUALS' },
  { id: 'building-motion-graphics', label: 'BUILDING MOTION GRAPHICS' },
  { id: 'generating-captions', label: 'GENERATING CAPTIONS' },
  { id: 'creating-thumbnail', label: 'CREATING THUMBNAIL' },
  { id: 'rendering', label: 'RENDERING' },
  { id: 'optimizing', label: 'OPTIMIZING' },
  { id: 'exporting', label: 'EXPORTING' },
  { id: 'ready-for-review', label: 'READY FOR REVIEW' },
] as const;

export const RENDER_QUEUE_PHILOSOPHY = [
  'Every production moves through a visible pipeline — the founder never wonders what AI is doing.',
  'This is the heartbeat of the production floor — alive, never static.',
  'Studio Intelligence explains delays with clarity, not excuses.',
] as const;

export const RENDER_QUEUE_CONNECTED_SYSTEMS = [
  'PRODUCTION STUDIO',
  'MISSION CONTROL',
  'NEWSROOM',
  'PUBLISHING',
  'AI PRODUCTION ENGINE',
  'STUDIO INTELLIGENCE',
  'TALENT NETWORK',
  'CHIEF CONCIERGE',
] as const;

export const AI_WORKER_POOL = [
  'SCRIPT AGENT · WRITING DNA',
  'VOICE AGENT · ELEVENLABS POOL',
  'VISUAL AGENT · FAL IMAGE',
  'MOTION AGENT · AFTER EFFECTS SIM',
  'CAPTION AGENT · ACCESSIBILITY',
  'THUMBNAIL AGENT · BRAND CONCIERGE',
  'RENDER AGENT · GPU CLUSTER A',
  'OPTIMIZE AGENT · PLATFORM ADAPT',
  'EXPORT AGENT · DISTRIBUTION',
] as const;
