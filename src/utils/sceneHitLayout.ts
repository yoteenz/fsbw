import type { CSSProperties } from 'react';
import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';

export type SceneHitLayoutOptions = {
  layoutOffsetX?: number;
  layoutOffsetY?: number;
  /** Added to mapped width (negative shrinks). Center-anchored via left nudge. */
  layoutWidthExtraPx?: number;
  /** Added to mapped height (negative shrinks). Center-anchored via top nudge. */
  layoutHeightExtraPx?: number;
  layoutWidthScale?: number;
  layoutHeightScale?: number;
};

/**
 * Position + size for cover-mapped hit boxes (QA overlays and production taps).
 * Uses calc(% + px) so tuning is visible on device (transform scale often is not).
 */
export function sceneHitLayoutBoxStyle(
  rect: FinalSceneHitRect,
  layout?: SceneHitLayoutOptions,
  screenOffsetX = 0,
  screenOffsetY = 0,
): CSSProperties {
  const offsetX = (layout?.layoutOffsetX ?? 0) + screenOffsetX;
  const offsetY = (layout?.layoutOffsetY ?? 0) + screenOffsetY;
  const widthExtra = layout?.layoutWidthExtraPx ?? 0;
  const heightExtra = layout?.layoutHeightExtraPx ?? 0;
  const widthScale = layout?.layoutWidthScale ?? 1;
  const heightScale = layout?.layoutHeightScale ?? 1;

  const widthPct = rect.width * 100 * widthScale;
  const heightPct = rect.height * 100 * heightScale;
  const scaleLeftPct = widthScale !== 1 ? rect.width * (1 - widthScale) * 50 : 0;
  const scaleTopPct = heightScale !== 1 ? rect.height * (1 - heightScale) * 50 : 0;

  return {
    left: `calc(${rect.left * 100 + scaleLeftPct}% + ${offsetX - widthExtra / 2}px)`,
    top: `calc(${rect.top * 100 + scaleTopPct}% + ${offsetY - heightExtra / 2}px)`,
    width: `calc(${widthPct}% + ${widthExtra}px)`,
    height: `calc(${heightPct}% + ${heightExtra}px)`,
  };
}
