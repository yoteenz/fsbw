import { STUDIO_WORLD_ICON_SOURCES } from './studio-world-icon-source-manifest';

/** Grid geometry measured from unlabeled production source (1402×1122, 8×8). */
export const STUDIO_WORLD_ICON_GRID_CONFIG = {
  sourceRole: 'unlabeled-production-source' as const,
  sourcePath: STUDIO_WORLD_ICON_SOURCES.unlabeledSource.path,
  sourceWidth: STUDIO_WORLD_ICON_SOURCES.unlabeledSource.width,
  sourceHeight: STUDIO_WORLD_ICON_SOURCES.unlabeledSource.height,
  rows: STUDIO_WORLD_ICON_SOURCES.unlabeledSource.rows,
  columns: STUDIO_WORLD_ICON_SOURCES.unlabeledSource.columns,
  cellWidth: 1402 / 8,
  cellHeight: 1122 / 8,
  cellWidthRounded: 175,
  cellHeightRounded: 140,
  horizontalGutter: 0,
  verticalGutter: 0,
  outerMargin: 0,
  glyphSafePadding: 18,
  glyphSafeMaxYRatio: 0.72,
  outputCanvas: 512,
  alphaFloor: 24,
  blackLuminance: 28,
  whiteLuminance: 235,
} as const;

export type StudioWorldIconGridConfig = typeof STUDIO_WORLD_ICON_GRID_CONFIG;

export function resolveStudioWorldIconCellRect(row: number, column: number): {
  left: number;
  top: number;
  width: number;
  height: number;
} {
  const { sourceWidth, sourceHeight, columns, rows } = STUDIO_WORLD_ICON_GRID_CONFIG;
  const left = Math.round((column * sourceWidth) / columns);
  const top = Math.round((row * sourceHeight) / rows);
  const right = Math.round(((column + 1) * sourceWidth) / columns);
  const bottom = Math.round(((row + 1) * sourceHeight) / rows);
  return { left, top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) };
}
