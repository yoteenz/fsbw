import {
  STUDIO_WORLD_ICON_GRID_CALIBRATION_CANONICAL,
  resolveStudioWorldIconCalibratedCellRect,
  type StudioWorldIconGridCalibration,
} from './grid-calibration';
import { STUDIO_WORLD_ICON_SOURCES } from './studio-world-icon-source-manifest';

/** Grid geometry from founder-controlled calibration over unlabeled source (1402×1122, 8×8). */
export const STUDIO_WORLD_ICON_GRID_CONFIG = {
  sourceRole: 'unlabeled-grid-calibrated' as const,
  sourcePath: STUDIO_WORLD_ICON_SOURCES.unlabeledSource.path,
  sourceWidth: STUDIO_WORLD_ICON_SOURCES.unlabeledSource.width,
  sourceHeight: STUDIO_WORLD_ICON_SOURCES.unlabeledSource.height,
  rows: STUDIO_WORLD_ICON_SOURCES.unlabeledSource.rows,
  columns: STUDIO_WORLD_ICON_SOURCES.unlabeledSource.columns,
  calibrationVersion: STUDIO_WORLD_ICON_GRID_CALIBRATION_CANONICAL.calibrationVersion,
  glyphSafePadding: 18,
  outputCanvas: 512,
  alphaFloor: 24,
  blackLuminance: 28,
  whiteLuminance: 235,
} as const;

export type StudioWorldIconGridConfig = typeof STUDIO_WORLD_ICON_GRID_CONFIG;

export function getActiveGridCalibration(): StudioWorldIconGridCalibration {
  return STUDIO_WORLD_ICON_GRID_CALIBRATION_CANONICAL;
}

export function resolveStudioWorldIconCellRect(
  row: number,
  column: number,
  calibration: StudioWorldIconGridCalibration = getActiveGridCalibration(),
): {
  left: number;
  top: number;
  width: number;
  height: number;
} {
  const cell = resolveStudioWorldIconCalibratedCellRect(calibration, row, column);
  return { left: cell.left, top: cell.top, width: cell.width, height: cell.height };
}
