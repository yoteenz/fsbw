import type { CSSProperties } from 'react';
import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';

export type SceneHitLayoutOptions = {
  layoutOffsetX?: number;
  layoutOffsetY?: number;
  layoutScale?: { x: number; y: number };
  /** Default `center top` (shelves / baked TV); play tap uses `center center`. */
  layoutScaleOrigin?: 'center top' | 'center center' | (string & {});
  layoutHeightTrimPx?: number;
  layoutHeightExtraPx?: number;
};

function scaledPercentBox(
  rect: FinalSceneHitRect,
  scaleX: number,
  scaleY: number,
  origin: SceneHitLayoutOptions['layoutScaleOrigin'],
): { leftPct: number; topPct: number; widthPct: number; heightPct: number } {
  let leftPct = rect.left * 100;
  let topPct = rect.top * 100;
  let widthPct = rect.width * 100;
  let heightPct = rect.height * 100;

  if (scaleX === 1 && scaleY === 1) {
    return { leftPct, topPct, widthPct, heightPct };
  }

  const originStr = origin ?? 'center top';
  const fromCenterX = originStr === 'center center' || originStr.includes('center');
  const fromTop = originStr === 'center top' || originStr.includes('top');

  widthPct *= scaleX;
  heightPct *= scaleY;

  if (fromCenterX) {
    leftPct += (rect.width * 100 * (1 - scaleX)) / 2;
  }
  if (fromCenterX && !fromTop) {
    topPct += (rect.height * 100 * (1 - scaleY)) / 2;
  }

  return { leftPct, topPct, widthPct, heightPct };
}

/**
 * Position + size tune for cover-mapped scene hit boxes (production + QA).
 * Uses calc(%) + px (like shelf {@link SceneHitRegion}) — not transform: scale(),
 * which often leaves debug squares visually unchanged on scene overlays.
 */
export function sceneHitLayoutBoxStyle(
  rect: FinalSceneHitRect,
  screenOffsetX = 0,
  screenOffsetY = 0,
  layout: SceneHitLayoutOptions = {},
): CSSProperties {
  const scaleX = layout.layoutScale?.x ?? 1;
  const scaleY = layout.layoutScale?.y ?? 1;
  const { leftPct, topPct, widthPct, heightPct } = scaledPercentBox(
    rect,
    scaleX,
    scaleY,
    layout.layoutScaleOrigin,
  );

  const totalOffsetX = screenOffsetX + (layout.layoutOffsetX ?? 0);
  const totalOffsetY = screenOffsetY + (layout.layoutOffsetY ?? 0);

  let height: string;
  if (layout.layoutHeightTrimPx && layout.layoutHeightTrimPx > 0) {
    height = `calc(${heightPct}% - ${layout.layoutHeightTrimPx}px)`;
  } else if (layout.layoutHeightExtraPx) {
    height = `calc(${heightPct}% + ${layout.layoutHeightExtraPx}px)`;
  } else {
    height = `${heightPct}%`;
  }

  return {
    position: 'absolute',
    left: `calc(${leftPct}% + ${totalOffsetX}px)`,
    top: `calc(${topPct}% + ${totalOffsetY}px)`,
    width: `${widthPct}%`,
    height,
    boxSizing: 'border-box',
  };
}
