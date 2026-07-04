/**
 * Director Mode — cinematic rehearsal workspace (Milestone 15).
 * Demo/placeholder; bridges Production Builder before AI generation.
 */

import type { ProductionDraft, ProductionScene } from './adminStudioProductionBuilderDemo';
import { findProductionAsset, getScenePreviewSrc } from './adminStudioProductionBuilderDemo';
import { ASSET_DIRECTOR_CAMERA, ASSET_DIRECTOR_LIGHTING } from './adminStudioAssetDirectorDemo';

export const DIRECTOR_MODE_SUBTITLE =
  'REHEARSE YOUR PRODUCTION IN THE LUXURY CONTROL ROOM BEFORE AI GENERATES ASSETS.';

export const DIRECTOR_MODE_INHERITANCE_CHAIN = [
  'ASSET DIRECTOR',
  'PRODUCTION BUILDER',
  'DIRECTOR MODE',
  'CONTENT PACKS',
  'AI PRODUCTION',
  'DISTRIBUTION',
  'LEGACY',
] as const;

export type DirectorSceneStatus = 'draft' | 'ready' | 'rehearsed' | 'approved';

export type DirectorShot = {
  id: string;
  label: string;
  cameraId?: string;
};

export type DirectorSceneMeta = {
  sceneId: string;
  purpose: string;
  durationSec: number;
  status: DirectorSceneStatus;
  script: string;
  voiceNotes: string;
  sceneNotes: string;
  directorNotes: string;
  shots: DirectorShot[];
  estimatedRuntime: string;
};

export type DirectorGraphicsToggles = {
  lowerThirds: boolean;
  forecastGraphics: boolean;
  charts: boolean;
  luxuryTitles: boolean;
  captions: boolean;
  transitions: boolean;
};

export type DirectorVoiceSettings = {
  voiceId?: string;
  tone: string;
  energy: string;
  speed: string;
  pause: string;
  emotion: string;
};

export type DirectorMusicTrack = {
  id: string;
  name: string;
  mood: string;
  previewSrc: string;
};

export type DirectorReadinessDimension = {
  id: string;
  label: string;
  score: number;
};

export type DirectorSnapshot = {
  id: string;
  label: string;
  savedAt: string;
  note: string;
};

export type DirectorChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};

export type DirectorModeSession = {
  draftId: string;
  sceneMeta: Record<string, DirectorSceneMeta>;
  activeCameraOverride?: string;
  activeLightingOverride?: string;
  activeMusicId?: string;
  graphics: DirectorGraphicsToggles;
  voice: DirectorVoiceSettings;
  clientPreviewMode: boolean;
  rehearsalActive: boolean;
  snapshots: DirectorSnapshot[];
  checklist: DirectorChecklistItem[];
  updatedAt: string;
};

export const DIRECTOR_CAMERA_PRESETS = ASSET_DIRECTOR_CAMERA.slice(0, 8).map((c) => ({
  id: c.id,
  label: c.name,
  previewSrc: c.previewSrc,
}));

export const DIRECTOR_LIGHTING_PRESETS = ASSET_DIRECTOR_LIGHTING.map((l) => ({
  id: l.id,
  label: l.name,
  filter: lightingFilterForLabel(l.name),
}));

export const DIRECTOR_MUSIC_TRACKS: DirectorMusicTrack[] = [
  { id: 'dm-luxury', name: 'LUXURY STING', mood: 'LUXURY', previewSrc: '/assets/NOIR/noir-thumb.png' },
  { id: 'dm-editorial', name: 'EDITORIAL SCORE', mood: 'EDITORIAL', previewSrc: '/assets/NOIR/blanco-thumb.png' },
  { id: 'dm-modern', name: 'MODERN PULSE', mood: 'MODERN', previewSrc: '/assets/NOIR/wave-thumb.png' },
  { id: 'dm-launch', name: 'LAUNCH THEME', mood: 'LAUNCH', previewSrc: '/assets/NOIR/curl-thumb.png' },
  { id: 'dm-holiday', name: 'HOLIDAY WARMTH', mood: 'HOLIDAY', previewSrc: '/assets/NOIR/noir-thumb.png' },
  { id: 'dm-minimal', name: 'MINIMAL AMBIENT', mood: 'MINIMAL', previewSrc: '/assets/NOIR/blanco-thumb.png' },
];

export const DEFAULT_GRAPHICS_TOGGLES: DirectorGraphicsToggles = {
  lowerThirds: true,
  forecastGraphics: true,
  charts: false,
  luxuryTitles: true,
  captions: true,
  transitions: true,
};

export const DEFAULT_VOICE_SETTINGS: DirectorVoiceSettings = {
  tone: 'LUXURY CONCIERGE',
  energy: 'WARM · CONFIDENT',
  speed: 'MODERATE',
  pause: 'EDITORIAL',
  emotion: 'TRUST · EDUCATION',
};

export const EMERGENCY_CHECKLIST_SEED: Omit<DirectorChecklistItem, 'checked'>[] = [
  { id: 'assets', label: 'ASSETS COMPLETE' },
  { id: 'prompt', label: 'PROMPT COMPLETE' },
  { id: 'brand', label: 'BRAND COMPLIANT' },
  { id: 'workspace', label: 'WORKSPACE COMPLIANT' },
  { id: 'resolution', label: 'RESOLUTION CORRECT' },
  { id: 'outputs', label: 'OUTPUT SIZES SELECTED' },
  { id: 'voice', label: 'VOICE SELECTED' },
  { id: 'music', label: 'MUSIC SELECTED' },
  { id: 'cta', label: 'CTA PRESENT' },
];

function lightingFilterForLabel(name: string): string {
  const n = name.toUpperCase();
  if (n.includes('NIGHT')) return 'brightness(0.72) contrast(1.1) saturate(0.9)';
  if (n.includes('BROADCAST')) return 'brightness(1.05) contrast(1.15) saturate(1.1)';
  if (n.includes('GOLDEN')) return 'brightness(1.08) sepia(0.15) saturate(1.2)';
  if (n.includes('RUNWAY')) return 'brightness(1.1) contrast(1.2) saturate(0.95)';
  if (n.includes('HOLIDAY')) return 'brightness(1.05) hue-rotate(-8deg) saturate(1.15)';
  return 'brightness(1.02) contrast(1.05)';
}

const SCENE_SCRIPT_SEEDS: Record<string, Partial<DirectorSceneMeta>> = {
  OPEN: {
    purpose: 'OPENING',
    script: 'PSA:\n"Welcome to today\'s luxury forecast — where editorial meets atmosphere."',
    voiceNotes: 'Warm open · measured pace · luxury concierge tone',
    shots: [
      { id: 'sh-1', label: 'WIDE STUDIO', cameraId: 'ad-camera-0' },
      { id: 'sh-2', label: 'MEDIUM PSA', cameraId: 'ad-camera-1' },
    ],
  },
  FORECAST: {
    purpose: 'TEACHING',
    script: 'PSA:\n"Today\'s forecast isn\'t about the weather — it\'s about the mood you bring to every room."',
    voiceNotes: 'Educational · confident · slight smile',
    shots: [
      { id: 'sh-3', label: 'FORECAST SCREEN', cameraId: 'ad-camera-2' },
      { id: 'sh-4', label: 'CHART GRAPHIC', cameraId: 'ad-camera-3' },
    ],
  },
  CTA: {
    purpose: 'CTA',
    script: 'PSA:\n"Shop the collection — your forecast starts with confidence."',
    voiceNotes: 'Clear CTA · inviting · not salesy',
    shots: [
      { id: 'sh-5', label: 'CLOSE PRODUCT', cameraId: 'ad-camera-4' },
      { id: 'sh-6', label: 'CTA HERO', cameraId: 'ad-camera-5' },
    ],
  },
  OUTRO: {
    purpose: 'OUTRO',
    script: 'PSA:\n"Until next time — stay luxurious, stay forecast-ready."',
    voiceNotes: 'Soft close · brand sign-off',
    shots: [{ id: 'sh-7', label: 'WIDE STUDIO', cameraId: 'ad-camera-0' }],
  },
};

function inferSceneSeed(name: string): Partial<DirectorSceneMeta> {
  const upper = name.toUpperCase();
  if (upper.includes('OPEN') || upper.includes('INTRO')) return SCENE_SCRIPT_SEEDS.OPEN;
  if (upper.includes('FORECAST') || upper.includes('TEACH') || upper.includes('DEMO')) return SCENE_SCRIPT_SEEDS.FORECAST;
  if (upper.includes('CTA') || upper.includes('SHOP')) return SCENE_SCRIPT_SEEDS.CTA;
  if (upper.includes('OUTRO') || upper.includes('CLOSE')) return SCENE_SCRIPT_SEEDS.OUTRO;
  return {
    purpose: 'SEGMENT',
    script: `PSA:\n"${name} — luxury editorial segment."`,
    voiceNotes: 'Editorial pacing · luxury tone',
    shots: [{ id: `sh-${Date.now()}`, label: 'HERO SHOT', cameraId: 'ad-camera-0' }],
  };
}

export function buildDefaultSceneMeta(scene: ProductionScene, index: number): DirectorSceneMeta {
  const seed = inferSceneSeed(scene.name);
  const durationSec = 12 + index * 8;
  return {
    sceneId: scene.id,
    purpose: seed.purpose ?? `SCENE ${index + 1}`,
    durationSec,
    status: scene.selection.studioId && scene.selection.talentId ? 'ready' : 'draft',
    script: seed.script ?? '',
    voiceNotes: seed.voiceNotes ?? '',
    sceneNotes: 'Timing aligned to broadcast editorial rhythm.',
    directorNotes: '',
    shots: seed.shots ?? [{ id: `sh-${scene.id}`, label: 'WIDE STUDIO', cameraId: 'ad-camera-0' }],
    estimatedRuntime: `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')}`,
  };
}

export function createDirectorSession(draftId: string, scenes: ProductionScene[]): DirectorModeSession {
  const sceneMeta: Record<string, DirectorSceneMeta> = {};
  scenes.forEach((s, i) => {
    sceneMeta[s.id] = buildDefaultSceneMeta(s, i);
  });
  return {
    draftId,
    sceneMeta,
    graphics: { ...DEFAULT_GRAPHICS_TOGGLES },
    voice: { ...DEFAULT_VOICE_SETTINGS },
    clientPreviewMode: false,
    rehearsalActive: false,
    snapshots: [],
    checklist: EMERGENCY_CHECKLIST_SEED.map((item) => ({ ...item, checked: false })),
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  };
}

export function computeReadinessScores(draft: ProductionDraft, session: DirectorModeSession): {
  dimensions: DirectorReadinessDimension[];
  overall: number;
} {
  const scenes = draft.scenes;
  const hasAssets = scenes.every((s) => s.selection.studioId && s.selection.talentId);
  const hasOutputs = draft.outputTypes.length > 0;
  const promptReady = draft.promptStatus === 'ready' || draft.promptStatus === 'assembled';
  const checklistDone = session.checklist.filter((c) => c.checked).length;

  const dimensions: DirectorReadinessDimension[] = [
    { id: 'creative', label: 'CREATIVE', score: scenes.length >= 2 ? 98 : 85 },
    { id: 'assets', label: 'ASSETS', score: hasAssets ? 95 : 62 },
    { id: 'brand', label: 'BRAND', score: 100 },
    { id: 'continuity', label: 'CONTINUITY', score: scenes.length > 1 ? 97 : 88 },
    { id: 'prompt', label: 'PROMPT QUALITY', score: promptReady ? 96 : 70 },
    { id: 'distribution', label: 'DISTRIBUTION READY', score: hasOutputs ? 94 : 55 },
  ];

  const base = dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length;
  const checklistBoost = (checklistDone / session.checklist.length) * 3;
  const overall = Math.min(100, Math.round(base + checklistBoost));

  return { dimensions, overall };
}

export function computeConsoleMetrics(draft: ProductionDraft, session: DirectorModeSession): {
  estimatedRuntime: string;
  estimatedCost: string;
  generationTime: string;
  requiredAssets: number;
  missingAssets: number;
  aiConfidence: number;
} {
  const totalSec = draft.scenes.reduce((sum, s) => sum + (session.sceneMeta[s.id]?.durationSec ?? 15), 0);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  let required = 0;
  let missing = 0;
  draft.scenes.forEach((s) => {
    const sel = s.selection;
    const fields = [sel.studioId, sel.talentId, sel.wardrobeId, sel.cameraId, sel.lightingId];
    required += fields.length;
    missing += fields.filter((f) => !f).length;
  });
  const { overall } = computeReadinessScores(draft, session);
  return {
    estimatedRuntime: `${mins}:${String(secs).padStart(2, '0')}`,
    estimatedCost: '$' + (draft.scenes.length * 42 + draft.outputTypes.length * 18).toFixed(0),
    generationTime: `~${draft.scenes.length * 4 + draft.outputTypes.length * 2} MIN`,
    requiredAssets: required,
    missingAssets: missing,
    aiConfidence: overall,
  };
}

export function evaluateChecklist(draft: ProductionDraft, session: DirectorModeSession): DirectorChecklistItem[] {
  const scenes = draft.scenes;
  const first = scenes[0]?.selection;
  return session.checklist.map((item) => {
    let checked = item.checked;
    switch (item.id) {
      case 'assets':
        checked = scenes.every((s) => s.selection.studioId && s.selection.talentId);
        break;
      case 'prompt':
        checked = draft.promptStatus === 'ready' || draft.promptStatus === 'assembled' || Boolean(draft.promptOverride);
        break;
      case 'brand':
        checked = Boolean(draft.brand);
        break;
      case 'workspace':
        checked = Boolean(draft.workspace);
        break;
      case 'resolution':
        checked = Boolean(draft.aspectRatio);
        break;
      case 'outputs':
        checked = draft.outputTypes.length > 0;
        break;
      case 'voice':
        checked = Boolean(first?.voiceId || session.voice.tone?.trim());
        break;
      case 'music':
        checked = Boolean(session.activeMusicId || first?.musicId);
        break;
      case 'cta':
        checked = Boolean(draft.cta?.trim());
        break;
    }
    return { ...item, checked };
  });
}

export function allChecklistPassed(items: DirectorChecklistItem[]): boolean {
  return items.length > 0 && items.every((i) => i.checked);
}

export function getCinemaPreviewSrc(
  selection: ProductionScene['selection'],
  cameraOverride?: string,
  lightingOverride?: string
): { src: string; filter: string; cameraLabel: string; lightingLabel: string } {
  const src = getScenePreviewSrc(selection);
  const cameraId = cameraOverride ?? selection.cameraId;
  const lightingId = lightingOverride ?? selection.lightingId;
  const camera = findProductionAsset(cameraId ?? '') ?? DIRECTOR_CAMERA_PRESETS.find((c) => c.id === cameraId);
  const lighting = DIRECTOR_LIGHTING_PRESETS.find((l) => l.id === lightingId) ?? DIRECTOR_LIGHTING_PRESETS[0];
  return {
    src,
    filter: lighting?.filter ?? 'none',
    cameraLabel: camera ? ('name' in camera ? camera.name : camera.label) : 'WIDE',
    lightingLabel: lighting?.label ?? 'LUXURY DAY',
  };
}

export function buildRehearsalSteps(draft: ProductionDraft, session: DirectorModeSession): Array<{ id: string; label: string; duration: string }> {
  return [...draft.scenes]
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      const meta = session.sceneMeta[s.id];
      return {
        id: s.id,
        label: `${s.name} · ${meta?.purpose ?? 'SEGMENT'}`,
        duration: meta?.estimatedRuntime ?? '0:15',
      };
    });
}

export function resolveAssetLabel(id: string | undefined): string {
  if (!id) return '—';
  return findProductionAsset(id)?.name ?? id;
}
