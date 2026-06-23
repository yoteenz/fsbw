import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';
import type {
  PanelDebugMap,
  PanelDebugPercentRect,
  PanelDebugSceneId,
} from '../types/desktopPanelDebug';

const STORAGE_PREFIX = 'desktopPanelDebug:';

export function panelDebugStorageKey(sceneId: PanelDebugSceneId): string {
  return `${STORAGE_PREFIX}${sceneId}`;
}

export function percentRectToImageRect(rect: PanelDebugPercentRect): FinalSceneHitRect {
  return {
    left: rect.x / 100,
    top: rect.y / 100,
    width: rect.width / 100,
    height: rect.height / 100,
  };
}

export function imageRectToPercentRect(rect: FinalSceneHitRect): PanelDebugPercentRect {
  return {
    x: roundPanelDebugPercent(rect.left * 100),
    y: roundPanelDebugPercent(rect.top * 100),
    width: roundPanelDebugPercent(rect.width * 100),
    height: roundPanelDebugPercent(rect.height * 100),
  };
}

export function roundPanelDebugPercent(value: number): number {
  return Math.round(value * 100) / 100;
}

export function clampPanelDebugPercentRect(rect: PanelDebugPercentRect): PanelDebugPercentRect {
  const width = Math.max(0.5, Math.min(100, rect.width));
  const height = Math.max(0.5, Math.min(100, rect.height));
  const x = Math.max(0, Math.min(100 - width, rect.x));
  const y = Math.max(0, Math.min(100 - height, rect.y));
  return {
    x: roundPanelDebugPercent(x),
    y: roundPanelDebugPercent(y),
    width: roundPanelDebugPercent(width),
    height: roundPanelDebugPercent(height),
  };
}

export function loadPanelDebugMap(sceneId: PanelDebugSceneId): PanelDebugMap | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(panelDebugStorageKey(sceneId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PanelDebugMap;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePanelDebugMap(sceneId: PanelDebugSceneId, map: PanelDebugMap): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(panelDebugStorageKey(sceneId), JSON.stringify(map, null, 2));
}

export function clearPanelDebugMap(sceneId: PanelDebugSceneId): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(panelDebugStorageKey(sceneId));
}

export function formatPanelDebugMapForExport(map: PanelDebugMap): string {
  return JSON.stringify(map, null, 2);
}

export function isPanelDebugModeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get('panelDebug') === '1';
  } catch {
    return false;
  }
}

const PANEL_DEBUG_VISIBLE_KEY = 'desktopPanelDebug:overlaysVisible';

export function loadPanelDebugOverlaysVisible(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.sessionStorage.getItem(PANEL_DEBUG_VISIBLE_KEY);
    if (raw === '0') return false;
    return true;
  } catch {
    return true;
  }
}

export function savePanelDebugOverlaysVisible(visible: boolean): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(PANEL_DEBUG_VISIBLE_KEY, visible ? '1' : '0');
}
