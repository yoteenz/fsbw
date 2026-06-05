import type { CSSProperties } from 'react';
import type { SceneHitLayoutOptions } from './sceneHitLayout';

/** Apply scene-hit layout tuning to an absolutely positioned inner TV panel. */
export function loungeTvInnerAbsolutePanelStyle(
  base: { left: number; right: number; top: number },
  layout: SceneHitLayoutOptions = {},
): CSSProperties {
  const offsetX = layout.layoutOffsetX ?? 0;
  const offsetY = layout.layoutOffsetY ?? 0;
  const widthExtra = layout.layoutWidthExtraPx ?? 0;
  const heightExtra = layout.layoutHeightExtraPx ?? 0;

  return {
    left: base.left + offsetX,
    right: Math.max(0, base.right - widthExtra),
    top: base.top + offsetY,
    bottom: -(heightExtra),
  };
}

/** Video shell max-height from layout scale + px extra. */
export function loungeTvVideoMaxHeightStyle(
  basePercent: number,
  baseExtraPx: number,
  layout: SceneHitLayoutOptions = {},
): string {
  const scaleY = layout.layoutScale?.y ?? 1;
  const percent = basePercent * scaleY;
  const extra = layout.layoutHeightExtraPx ?? baseExtraPx;
  const offsetY = layout.layoutOffsetY ?? 0;
  const widthExtra = layout.layoutWidthExtraPx ?? 0;
  void offsetY;
  void widthExtra;
  return `calc(${percent}% + ${extra}px)`;
}

/** Nudge/size for in-flow video shell (width + vertical margin). */
export function loungeTvVideoShellStyle(layout: SceneHitLayoutOptions = {}): CSSProperties {
  const offsetX = layout.layoutOffsetX ?? 0;
  const offsetY = layout.layoutOffsetY ?? 0;
  const widthExtra = layout.layoutWidthExtraPx ?? 0;
  return {
    marginLeft: offsetX,
    marginTop: offsetY,
    width: widthExtra ? `calc(100% + ${widthExtra}px)` : '100%',
  };
}
