import type { CSSProperties } from 'react';
import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';
import { rectToPercentStyle } from '../components/lobby/SceneHitRegion';
import { coverMappedRectScreenOffsetStyle } from './sceneCoverHitMap';

export type SceneHitLayoutOptions = {
  layoutOffsetX?: number;
  layoutOffsetY?: number;
  layoutScale?: { x: number; y: number };
  layoutScaleOrigin?: CSSProperties['transformOrigin'];
  layoutHeightTrimPx?: number;
  layoutHeightExtraPx?: number;
};

/** Position + optional scale/height tune for cover-mapped scene hit boxes (production + QA). */
export function sceneHitLayoutBoxStyle(
  rect: FinalSceneHitRect,
  screenOffsetX = 0,
  screenOffsetY = 0,
  layout: SceneHitLayoutOptions = {},
): CSSProperties {
  const totalOffsetX = screenOffsetX + (layout.layoutOffsetX ?? 0);
  const totalOffsetY = screenOffsetY + (layout.layoutOffsetY ?? 0);

  const position =
    totalOffsetX || totalOffsetY
      ? coverMappedRectScreenOffsetStyle(rect, totalOffsetX, totalOffsetY)
      : rectToPercentStyle(rect);

  let height = position.height as string;
  if (layout.layoutHeightTrimPx && layout.layoutHeightTrimPx > 0) {
    height = `calc(${rect.height * 100}% - ${layout.layoutHeightTrimPx}px)`;
  } else if (layout.layoutHeightExtraPx) {
    height = `calc(${rect.height * 100}% + ${layout.layoutHeightExtraPx}px)`;
  }

  const transformParts: string[] = [];
  if (layout.layoutScale) {
    transformParts.push(`scale(${layout.layoutScale.x}, ${layout.layoutScale.y})`);
  }

  return {
    position: 'absolute',
    left: position.left,
    top: position.top,
    width: position.width,
    height,
    boxSizing: 'border-box',
    ...(transformParts.length
      ? {
          transform: transformParts.join(' '),
          transformOrigin: layout.layoutScaleOrigin ?? 'center top',
        }
      : null),
  };
}
