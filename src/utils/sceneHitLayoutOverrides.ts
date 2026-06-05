import type {
  SceneHitCoverOffset,
  SceneHitRegionConfig,
  SceneHitRegionId,
} from './sceneHitRegionDefaults';
import { getAllDefaultSceneHitRegionConfigs, SCENE_HIT_REGION_IDS } from './sceneHitRegionDefaults';
import type { SceneHitLayoutOptions } from './sceneHitLayout';

export const SCENE_HIT_LAYOUT_OVERRIDES_KEY = 'baw_scene_hit_layout_overrides';

export type SceneHitLayoutOverridesFile = Partial<Record<SceneHitRegionId, SceneHitRegionConfig>>;

function mergeLayout(
  base: SceneHitLayoutOptions,
  patch?: Partial<SceneHitLayoutOptions>,
): SceneHitLayoutOptions {
  if (!patch) return { ...base, ...(base.layoutScale ? { layoutScale: { ...base.layoutScale } } : {}) };
  return {
    ...base,
    ...patch,
    layoutScale: patch.layoutScale ?? base.layoutScale,
  };
}

function mergeOffset(
  base: SceneHitCoverOffset | undefined,
  patch: SceneHitCoverOffset | undefined,
): SceneHitCoverOffset | undefined {
  if (!base && !patch) return undefined;
  return {
    x: patch?.x ?? base?.x ?? 0,
    y: patch?.y ?? base?.y ?? 0,
  };
}

export function mergeSceneHitRegionConfig(
  defaults: SceneHitRegionConfig,
  override?: Partial<SceneHitRegionConfig>,
): SceneHitRegionConfig {
  if (!override) return defaults;
  return {
    coverOffset: mergeOffset(defaults.coverOffset, override.coverOffset),
    screenOffset: mergeOffset(defaults.screenOffset, override.screenOffset),
    layout: mergeLayout(defaults.layout, override.layout),
  };
}

export function loadSceneHitLayoutOverrides(): SceneHitLayoutOverridesFile {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SCENE_HIT_LAYOUT_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SceneHitLayoutOverridesFile;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveSceneHitLayoutOverrides(overrides: SceneHitLayoutOverridesFile): void {
  localStorage.setItem(SCENE_HIT_LAYOUT_OVERRIDES_KEY, JSON.stringify(overrides, null, 2));
}

export function clearSceneHitLayoutOverrides(): void {
  localStorage.removeItem(SCENE_HIT_LAYOUT_OVERRIDES_KEY);
}

export function getEffectiveSceneHitRegionConfigs(
  draft?: SceneHitLayoutOverridesFile,
): Record<SceneHitRegionId, SceneHitRegionConfig> {
  const defaults = getAllDefaultSceneHitRegionConfigs();
  const saved = loadSceneHitLayoutOverrides();
  return SCENE_HIT_REGION_IDS.reduce(
    (acc, id) => {
      const merged = mergeSceneHitRegionConfig(defaults[id], saved[id]);
      acc[id] = draft?.[id] ? mergeSceneHitRegionConfig(merged, draft[id]) : merged;
      return acc;
    },
    {} as Record<SceneHitRegionId, SceneHitRegionConfig>,
  );
}

export function formatSceneHitOverridesForCopy(
  configs: Record<SceneHitRegionId, SceneHitRegionConfig>,
): string {
  return JSON.stringify(configs, null, 2);
}
