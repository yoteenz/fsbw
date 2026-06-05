import type { DebugElementOverride, DebugPageConfig } from './debugMode';
import {
  DEBUG_MODE_UPDATED_EVENT,
  getDebugPageConfig,
  loadDebugModeStore,
  saveDebugPageConfig,
  saveDebugModeStore,
} from './debugMode';

export const GLOBAL_OVERLAY_IDS = ['cart-dropdown', 'currency-modal'] as const;
export type GlobalOverlayId = (typeof GLOBAL_OVERLAY_IDS)[number];

export function globalOverlayPageKey(overlayId: GlobalOverlayId): string {
  return `__global__/${overlayId}`;
}

export function getGlobalOverlayRegionOverride(
  overlayId: GlobalOverlayId,
  regionId: string,
): DebugElementOverride | undefined {
  return getDebugPageConfig(globalOverlayPageKey(overlayId))?.elements[regionId];
}

export function patchGlobalOverlayRegion(
  overlayId: GlobalOverlayId,
  regionId: string,
  patch: Partial<DebugElementOverride>,
): void {
  const pageKey = globalOverlayPageKey(overlayId);
  const store = loadDebugModeStore();
  const current: DebugPageConfig = store[pageKey] ?? { updatedAt: 0, elements: {} };
  const next: DebugPageConfig = {
    updatedAt: Date.now(),
    elements: {
      ...current.elements,
      [regionId]: { ...(current.elements[regionId] ?? {}), ...patch },
    },
  };
  saveDebugPageConfig(pageKey, next);
}

export function globalOverlayRegionStyle(
  overlayId: GlobalOverlayId,
  regionId: string,
  base: DebugElementOverride = {},
): DebugElementOverride {
  const saved = getGlobalOverlayRegionOverride(overlayId, regionId);
  return { ...base, ...saved };
}

function cssLength(value: string | number | undefined): string | undefined {
  if (value == null) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

export function cssFromDebugElementOverride(override: DebugElementOverride): React.CSSProperties {
  const style: Record<string, string | number> = {};
  if (override.color) style.color = override.color;
  if (override.fontSize != null) style.fontSize = `${override.fontSize}px`;
  if (override.fontWeight != null) style.fontWeight = override.fontWeight;
  if (override.fontFamily) style.fontFamily = override.fontFamily;
  if (override.textTransform) style.textTransform = override.textTransform;
  if (override.backgroundColor) style.backgroundColor = override.backgroundColor;
  if (override.paddingTop != null) style.paddingTop = `${override.paddingTop}px`;
  if (override.paddingRight != null) style.paddingRight = `${override.paddingRight}px`;
  if (override.paddingBottom != null) style.paddingBottom = `${override.paddingBottom}px`;
  if (override.paddingLeft != null) style.paddingLeft = `${override.paddingLeft}px`;
  if (override.minHeight != null) style.minHeight = `${override.minHeight}px`;
  if (override.borderRadius != null) style.borderRadius = `${override.borderRadius}px`;
  if (override.flexOrder != null) style.order = override.flexOrder;
  const top = cssLength(override.top);
  const left = cssLength(override.left);
  const right = cssLength(override.right);
  const bottom = cssLength(override.bottom);
  if (top != null) style.top = top;
  if (left != null) style.left = left;
  if (right != null) style.right = right;
  if (bottom != null) style.bottom = bottom;
  const offsetX = (override.layoutOffsetX ?? 0) + (override.translateX ?? 0);
  const offsetY = (override.layoutOffsetY ?? 0) + (override.translateY ?? 0);
  if (offsetX !== 0 || offsetY !== 0) {
    style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  }
  if (override.layoutWidthExtraPx != null) {
    style.width = `calc(100% + ${override.layoutWidthExtraPx}px)`;
  }
  if (override.layoutHeightExtraPx != null) {
    style.height = `calc(100% + ${override.layoutHeightExtraPx}px)`;
  }
  return style as React.CSSProperties;
}

export function saveGlobalOverlayPageConfig(
  overlayId: GlobalOverlayId,
  config: DebugPageConfig,
): void {
  saveDebugPageConfig(globalOverlayPageKey(overlayId), config);
}

export function clearGlobalOverlayPageConfig(overlayId: GlobalOverlayId): void {
  const pageKey = globalOverlayPageKey(overlayId);
  const store = loadDebugModeStore();
  delete store[pageKey];
  saveDebugModeStore(store);
}

export function notifyGlobalOverlayDebugUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(DEBUG_MODE_UPDATED_EVENT));
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace React {
  type CSSProperties = import('react').CSSProperties;
}
