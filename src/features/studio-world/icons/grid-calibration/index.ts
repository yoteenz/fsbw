export {
  STUDIO_WORLD_ICON_GRID_CALIBRATION_VERSION,
  STUDIO_WORLD_ICON_UNLABELED_SOURCE_PATH,
  STUDIO_WORLD_ICON_LABELED_REFERENCE_PATH,
  createDefaultGridCalibration,
  createEqualBoundaries,
  distributeBoundariesEvenly,
  resolveGridContentRect,
  resolveStudioWorldIconCalibratedCellRect,
  resolveAllCalibratedCellRects,
  validateGridCalibration,
  updateRowBoundary,
  updateColumnBoundary,
  applyRowPadding,
  applyColumnPadding,
  upsertCellOverride,
  getSemanticKeyForCell,
} from './StudioWorldIconGridCalibration';
export {
  createEmptyCellOverride,
  exportCalibrationJson,
  importCalibrationJson,
  saveGridCalibrationDraft,
  loadGridCalibrationDraft,
} from './StudioWorldIconGridCalibrationEditor.shared';
export type {
  StudioWorldIconCellOverride,
  StudioWorldIconCellRect,
  StudioWorldIconGridCalibration,
  StudioWorldIconGridValidationResult,
  StudioWorldIconRowColumnPadding,
} from './StudioWorldIconGridCalibration';

import canonicalCalibrationJson from './studio-world-icon-grid-calibration-canonical.json';
import type { StudioWorldIconGridCalibration } from './StudioWorldIconGridCalibration';

export const STUDIO_WORLD_ICON_GRID_CALIBRATION_CANONICAL =
  canonicalCalibrationJson as StudioWorldIconGridCalibration;
