import type { SceneHitLayoutOptions } from './sceneHitLayout';

export type SceneHitResizeCorner = 'nw' | 'ne' | 'sw' | 'se';
export type SceneHitResizeEdge = 'n' | 's' | 'e' | 'w';

export function layoutPatchForCornerResize(
  corner: SceneHitResizeCorner,
  dx: number,
  dy: number,
  base: SceneHitLayoutOptions,
): Partial<SceneHitLayoutOptions> {
  const offsetX = base.layoutOffsetX ?? 0;
  const offsetY = base.layoutOffsetY ?? 0;
  const widthExtra = base.layoutWidthExtraPx ?? 0;
  const heightExtra = base.layoutHeightExtraPx ?? 0;

  switch (corner) {
    case 'se':
      return {
        layoutWidthExtraPx: widthExtra + dx,
        layoutHeightExtraPx: heightExtra + dy,
      };
    case 'sw':
      return {
        layoutOffsetX: offsetX + dx,
        layoutWidthExtraPx: widthExtra - dx,
        layoutHeightExtraPx: heightExtra + dy,
      };
    case 'ne':
      return {
        layoutOffsetY: offsetY + dy,
        layoutWidthExtraPx: widthExtra + dx,
        layoutHeightExtraPx: heightExtra - dy,
      };
    case 'nw':
      return {
        layoutOffsetX: offsetX + dx,
        layoutOffsetY: offsetY + dy,
        layoutWidthExtraPx: widthExtra - dx,
        layoutHeightExtraPx: heightExtra - dy,
      };
  }
}

export function layoutPatchForEdgeResize(
  edge: SceneHitResizeEdge,
  dx: number,
  dy: number,
  base: SceneHitLayoutOptions,
): Partial<SceneHitLayoutOptions> {
  const offsetX = base.layoutOffsetX ?? 0;
  const offsetY = base.layoutOffsetY ?? 0;
  const widthExtra = base.layoutWidthExtraPx ?? 0;
  const heightExtra = base.layoutHeightExtraPx ?? 0;

  switch (edge) {
    case 'e':
      return { layoutWidthExtraPx: widthExtra + dx };
    case 'w':
      return {
        layoutOffsetX: offsetX + dx,
        layoutWidthExtraPx: widthExtra - dx,
      };
    case 's':
      return { layoutHeightExtraPx: heightExtra + dy };
    case 'n':
      return {
        layoutOffsetY: offsetY + dy,
        layoutHeightExtraPx: heightExtra - dy,
      };
  }
}

export const SCENE_HIT_EDGE_HIT_PX = 10;
