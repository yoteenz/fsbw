import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';
import {
  DESKTOP_LOUNGE_TV_FRAME_LAYOUT,
  DESKTOP_LOUNGE_TV_HIT_REGION,
  DESKTOP_LOUNGE_TV_SCREEN_OFFSET_X_PX,
  DESKTOP_LOUNGE_TV_SCREEN_OFFSET_Y_PX,
} from '../constants/desktopLoungeTvLayout';
import type { SceneHitLayoutOptions } from './sceneHitLayout';

export const DESKTOP_LOUNGE_TV_FRAME_OVERRIDES_KEY = 'baw_desktop_lounge_tv_frame_overrides';

export type DesktopLoungeTvFrameConfig = {
  rect: FinalSceneHitRect;
  layout: SceneHitLayoutOptions;
  screenOffsetX: number;
  screenOffsetY: number;
};

export type DesktopLoungeTvFrameOverridesFile = {
  updatedAt?: number;
  rect?: Partial<FinalSceneHitRect>;
  layout?: Partial<SceneHitLayoutOptions>;
  screenOffsetX?: number;
  screenOffsetY?: number;
};

export const DESKTOP_LOUNGE_TV_FRAME_DEFAULTS: DesktopLoungeTvFrameConfig = {
  rect: DESKTOP_LOUNGE_TV_HIT_REGION,
  layout: { ...DESKTOP_LOUNGE_TV_FRAME_LAYOUT },
  screenOffsetX: DESKTOP_LOUNGE_TV_SCREEN_OFFSET_X_PX,
  screenOffsetY: DESKTOP_LOUNGE_TV_SCREEN_OFFSET_Y_PX,
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

export function loadDesktopLoungeTvFrameOverrides(): DesktopLoungeTvFrameOverridesFile {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(DESKTOP_LOUNGE_TV_FRAME_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as DesktopLoungeTvFrameOverridesFile;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveDesktopLoungeTvFrameOverrides(overrides: DesktopLoungeTvFrameOverridesFile): void {
  localStorage.setItem(
    DESKTOP_LOUNGE_TV_FRAME_OVERRIDES_KEY,
    JSON.stringify({ ...overrides, updatedAt: Date.now() }, null, 2),
  );
}

export function clearDesktopLoungeTvFrameOverrides(): void {
  localStorage.removeItem(DESKTOP_LOUNGE_TV_FRAME_OVERRIDES_KEY);
}

export function getEffectiveDesktopLoungeTvFrameConfig(
  draft?: DesktopLoungeTvFrameOverridesFile,
): DesktopLoungeTvFrameConfig {
  const saved = loadDesktopLoungeTvFrameOverrides();
  const rect = mergeRect(
    mergeRect(DESKTOP_LOUNGE_TV_FRAME_DEFAULTS.rect, saved.rect),
    draft?.rect,
  );
  const layout = mergeLayout(
    mergeLayout(DESKTOP_LOUNGE_TV_FRAME_DEFAULTS.layout, saved.layout),
    draft?.layout,
  );
  return {
    rect,
    layout,
    screenOffsetX: draft?.screenOffsetX ?? saved.screenOffsetX ?? DESKTOP_LOUNGE_TV_FRAME_DEFAULTS.screenOffsetX,
    screenOffsetY: draft?.screenOffsetY ?? saved.screenOffsetY ?? DESKTOP_LOUNGE_TV_FRAME_DEFAULTS.screenOffsetY,
  };
}

export function formatDesktopLoungeTvFrameOverridesForCopy(
  overrides: DesktopLoungeTvFrameOverridesFile,
): string {
  return JSON.stringify(overrides, null, 2);
}
