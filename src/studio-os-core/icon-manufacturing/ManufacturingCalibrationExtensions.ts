import type { StudioWorldIconGridCalibration } from '../../features/studio-world/icons/grid-calibration/StudioWorldIconGridCalibration';
import type { IconSheetProfile } from './IconSheetProfiles';

/** Manufacturing studio extensions — row/column/global optical controls. */
export type ManufacturingCalibrationExtensions = {
  globalScale: number;
  globalOffsetX: number;
  globalOffsetY: number;
  globalSafeArea: number;
  globalOpticalMargin: number;
  rowScales: number[];
  columnScales: number[];
};

export const DEFAULT_MANUFACTURING_EXTENSIONS: ManufacturingCalibrationExtensions = {
  globalScale: 1,
  globalOffsetX: 0,
  globalOffsetY: 0,
  globalSafeArea: 0.08,
  globalOpticalMargin: 0.04,
  rowScales: [],
  columnScales: [],
};

export function createManufacturingExtensions(
  profile: IconSheetProfile,
  partial?: Partial<ManufacturingCalibrationExtensions>,
): ManufacturingCalibrationExtensions {
  return {
    ...DEFAULT_MANUFACTURING_EXTENSIONS,
    rowScales: Array.from({ length: profile.grid.rows }, () => 1),
    columnScales: Array.from({ length: profile.grid.columns }, () => 1),
    ...partial,
  };
}

export type ManufacturingCalibrationState = {
  calibration: StudioWorldIconGridCalibration;
  extensions: ManufacturingCalibrationExtensions;
};

export function manufacturingExtensionsStorageKey(profileId: string): string {
  return `studio-world:icon-manufacturing-extensions:${profileId}`;
}

export function loadManufacturingExtensions(
  profile: IconSheetProfile,
): ManufacturingCalibrationExtensions {
  if (typeof window === 'undefined') return createManufacturingExtensions(profile);
  try {
    const raw = window.localStorage.getItem(manufacturingExtensionsStorageKey(profile.id));
    if (!raw) return createManufacturingExtensions(profile);
    return { ...createManufacturingExtensions(profile), ...JSON.parse(raw) };
  } catch {
    return createManufacturingExtensions(profile);
  }
}

export function saveManufacturingExtensions(
  profileId: string,
  extensions: ManufacturingCalibrationExtensions,
): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    manufacturingExtensionsStorageKey(profileId),
    JSON.stringify(extensions),
  );
}

/** Apply row/column/global scale to a resolved cell rect. */
export function applyManufacturingExtensionsToCellRect(
  rect: { left: number; top: number; width: number; height: number },
  row: number,
  column: number,
  extensions: ManufacturingCalibrationExtensions,
): { left: number; top: number; width: number; height: number } {
  const rowScale = extensions.rowScales[row] ?? 1;
  const colScale = extensions.columnScales[column] ?? 1;
  const scale = extensions.globalScale * rowScale * colScale;
  const cx = rect.left + rect.width / 2 + extensions.globalOffsetX;
  const cy = rect.top + rect.height / 2 + extensions.globalOffsetY;
  const w = rect.width * scale;
  const h = rect.height * scale;
  const margin = extensions.globalOpticalMargin;
  const safeW = w * (1 - margin * 2);
  const safeH = h * (1 - margin * 2);
  return {
    left: Math.round(cx - safeW / 2),
    top: Math.round(cy - safeH / 2),
    width: Math.max(1, Math.round(safeW)),
    height: Math.max(1, Math.round(safeH)),
  };
}
