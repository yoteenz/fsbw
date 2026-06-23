import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';
import {
  DESKTOP_PSA_SUITE_HOLOGRAM_FRAME_LAYOUT,
  DESKTOP_PSA_SUITE_HOLOGRAM_HIT_REGION,
  DESKTOP_PSA_SUITE_HOLOGRAM_SCREEN_OFFSET_X_PX,
  DESKTOP_PSA_SUITE_HOLOGRAM_SCREEN_OFFSET_Y_PX,
} from '../constants/desktopPsaSuiteLayout';
import type { SceneHitLayoutOptions } from './sceneHitLayout';

export const DESKTOP_PSA_SUITE_FRAME_OVERRIDES_KEY = 'baw_desktop_psa_suite_frame_overrides';

export type DesktopPsaSuiteFrameConfig = {
  rect: FinalSceneHitRect;
  layout: SceneHitLayoutOptions;
  screenOffsetX: number;
  screenOffsetY: number;
};

export type DesktopPsaSuiteFrameOverridesFile = {
  updatedAt?: number;
  rect?: Partial<FinalSceneHitRect>;
  layout?: Partial<SceneHitLayoutOptions>;
  screenOffsetX?: number;
  screenOffsetY?: number;
};

export const DESKTOP_PSA_SUITE_FRAME_DEFAULTS: DesktopPsaSuiteFrameConfig = {
  rect: DESKTOP_PSA_SUITE_HOLOGRAM_HIT_REGION,
  layout: { ...DESKTOP_PSA_SUITE_HOLOGRAM_FRAME_LAYOUT },
  screenOffsetX: DESKTOP_PSA_SUITE_HOLOGRAM_SCREEN_OFFSET_X_PX,
  screenOffsetY: DESKTOP_PSA_SUITE_HOLOGRAM_SCREEN_OFFSET_Y_PX,
};

function mergeRect(base: FinalSceneHitRect, patch?: Partial<FinalSceneHitRect>): FinalSceneHitRect {
  if (!patch) return base;
  return {
    left: patch.left ?? base.left,
    top: patch.top ?? base.top,
    width: patch.width ?? base.width,
    height: patch.height ?? base.height,
  };
}

function mergeLayout(base: SceneHitLayoutOptions, patch?: Partial<SceneHitLayoutOptions>): SceneHitLayoutOptions {
  if (!patch) return base;
  return {
    ...base,
    ...patch,
    layoutScale: patch.layoutScale ? { ...base.layoutScale, ...patch.layoutScale } : base.layoutScale,
  };
}

export function loadDesktopPsaSuiteFrameOverrides(): DesktopPsaSuiteFrameOverridesFile {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(DESKTOP_PSA_SUITE_FRAME_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as DesktopPsaSuiteFrameOverridesFile;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveDesktopPsaSuiteFrameOverrides(overrides: DesktopPsaSuiteFrameOverridesFile): void {
  localStorage.setItem(
    DESKTOP_PSA_SUITE_FRAME_OVERRIDES_KEY,
    JSON.stringify({ ...overrides, updatedAt: Date.now() }, null, 2),
  );
}

export function clearDesktopPsaSuiteFrameOverrides(): void {
  localStorage.removeItem(DESKTOP_PSA_SUITE_FRAME_OVERRIDES_KEY);
}

export function getEffectiveDesktopPsaSuiteFrameConfig(
  draft?: DesktopPsaSuiteFrameOverridesFile,
): DesktopPsaSuiteFrameConfig {
  const saved = loadDesktopPsaSuiteFrameOverrides();
  const rect = mergeRect(
    mergeRect(DESKTOP_PSA_SUITE_FRAME_DEFAULTS.rect, saved.rect),
    draft?.rect,
  );
  const layout = mergeLayout(
    mergeLayout(DESKTOP_PSA_SUITE_FRAME_DEFAULTS.layout, saved.layout),
    draft?.layout,
  );
  return {
    rect,
    layout,
    screenOffsetX: draft?.screenOffsetX ?? saved.screenOffsetX ?? DESKTOP_PSA_SUITE_FRAME_DEFAULTS.screenOffsetX,
    screenOffsetY: draft?.screenOffsetY ?? saved.screenOffsetY ?? DESKTOP_PSA_SUITE_FRAME_DEFAULTS.screenOffsetY,
  };
}

export function formatDesktopPsaSuiteFrameOverridesForCopy(
  overrides: DesktopPsaSuiteFrameOverridesFile,
): string {
  return JSON.stringify(overrides, null, 2);
}
