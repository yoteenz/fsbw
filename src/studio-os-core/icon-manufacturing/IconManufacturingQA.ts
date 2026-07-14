import type { StudioWorldIconGridCalibration } from '../../features/studio-world/icons/grid-calibration/StudioWorldIconGridCalibration';
import {
  resolveAllCalibratedCellRects,
  resolveStudioWorldIconCalibratedCellRect,
  type StudioWorldIconCellRect,
} from '../../features/studio-world/icons/grid-calibration/StudioWorldIconGridCalibration';
import type { IconSheetProfile } from './IconSheetProfiles';
import {
  applyManufacturingExtensionsToCellRect,
  type ManufacturingCalibrationExtensions,
} from './ManufacturingCalibrationExtensions';

export type IconManufacturingQaStatus = 'pass' | 'warn' | 'fail';

export type IconManufacturingQaCheck = {
  id: string;
  label: string;
  status: IconManufacturingQaStatus;
  message: string;
};

export type IconManufacturingCellQaReport = {
  row: number;
  column: number;
  iconId: string;
  checks: IconManufacturingQaCheck[];
  overall: IconManufacturingQaStatus;
};

export type IconManufacturingQaReport = {
  sheetId: string;
  generatedAt: string;
  totalCells: number;
  pass: number;
  warn: number;
  fail: number;
  cells: IconManufacturingCellQaReport[];
};

export type CellRegistryEntry = {
  key: string;
  row: number;
  column: number;
  displayName?: string;
};

export function getRegistryEntriesForProfile(
  _profile: IconSheetProfile,
  registry: Record<string, { row: number; column: number; accessibleLabel?: string; displayName?: string }>,
): CellRegistryEntry[] {
  return Object.entries(registry).map(([key, entry]) => ({
    key,
    row: entry.row,
    column: entry.column,
    displayName: entry.accessibleLabel ?? entry.displayName,
  }));
}

export function getSemanticKeyForCellFromRegistry(
  row: number,
  column: number,
  registry: Record<string, { row: number; column: number }>,
): string | undefined {
  return Object.entries(registry).find(([, e]) => e.row === row && e.column === column)?.[0];
}

export function resolveCalibratedCellRectForProfile(
  cal: StudioWorldIconGridCalibration,
  row: number,
  column: number,
  registry: Record<string, { row: number; column: number }>,
  extensions?: ManufacturingCalibrationExtensions,
): StudioWorldIconCellRect {
  const base = resolveStudioWorldIconCalibratedCellRect(cal, row, column);
  const semanticKey =
    getSemanticKeyForCellFromRegistry(row, column, registry) ?? base.semanticKey;
  if (!extensions) return { ...base, semanticKey };

  const adjusted = applyManufacturingExtensionsToCellRect(base, row, column, extensions);
  return { ...base, ...adjusted, semanticKey };
}

export function resolveAllCalibratedCellRectsForProfile(
  cal: StudioWorldIconGridCalibration,
  profile: IconSheetProfile,
  registry: Record<string, { row: number; column: number }>,
  extensions?: ManufacturingCalibrationExtensions,
): StudioWorldIconCellRect[] {
  const cells: StudioWorldIconCellRect[] = [];
  for (let row = 0; row < profile.grid.rows; row += 1) {
    for (let column = 0; column < profile.grid.columns; column += 1) {
      cells.push(resolveCalibratedCellRectForProfile(cal, row, column, registry, extensions));
    }
  }
  return cells;
}

function qaStatusFromChecks(checks: IconManufacturingQaCheck[]): IconManufacturingQaStatus {
  if (checks.some((c) => c.status === 'fail')) return 'fail';
  if (checks.some((c) => c.status === 'warn')) return 'warn';
  return 'pass';
}

export function runIconManufacturingQa(
  profile: IconSheetProfile,
  cal: StudioWorldIconGridCalibration,
  registry: Record<string, { row: number; column: number }>,
  extensions?: ManufacturingCalibrationExtensions,
): IconManufacturingQaReport {
  const cells = resolveAllCalibratedCellRectsForProfile(cal, profile, registry, extensions);
  const registryPositions = new Set(
    Object.values(registry).map((e) => `${e.row}:${e.column}`),
  );
  const seenIds = new Set<string>();

  const cellReports: IconManufacturingCellQaReport[] = cells.map((cell) => {
    const iconId = cell.semanticKey;
    const checks: IconManufacturingQaCheck[] = [];

    const cx = cell.left + cell.width / 2;
    const cy = cell.top + cell.height / 2;
    const srcCx = cal.sourceWidth / 2;
    const srcCy = cal.sourceHeight / 2;
    const offsetPct = Math.hypot(cx - srcCx, cy - srcCy) / Math.max(cal.sourceWidth, cal.sourceHeight);
    checks.push({
      id: 'centered',
      label: 'Centered',
      status: offsetPct < 0.35 ? 'pass' : offsetPct < 0.45 ? 'warn' : 'fail',
      message: `Optical offset ${(offsetPct * 100).toFixed(1)}%`,
    });

    const minDim = Math.min(cell.width, cell.height);
    const maxDim = Math.max(cell.width, cell.height);
    const aspect = minDim / maxDim;
    checks.push({
      id: 'aspect',
      label: 'Aspect Ratio',
      status: aspect >= 0.75 ? 'pass' : aspect >= 0.5 ? 'warn' : 'fail',
      message: `Ratio ${aspect.toFixed(2)}`,
    });

    if (cell.width < 8 || cell.height < 8) {
      checks.push({ id: 'resolution', label: 'Resolution', status: 'fail', message: 'Cell too small' });
    } else if (cell.width < 32 || cell.height < 32) {
      checks.push({ id: 'resolution', label: 'Resolution', status: 'warn', message: 'Low cell resolution' });
    } else {
      checks.push({ id: 'resolution', label: 'Resolution', status: 'pass', message: `${cell.width}×${cell.height}` });
    }

    if (cell.left + cell.width > cal.sourceWidth || cell.top + cell.height > cal.sourceHeight) {
      checks.push({ id: 'clipping', label: 'Clipping', status: 'fail', message: 'Exceeds source bounds' });
    } else {
      checks.push({ id: 'clipping', label: 'Clipping', status: 'pass', message: 'Within bounds' });
    }

    const hasRegistry = registryPositions.has(`${cell.row}:${cell.column}`);
    if (!hasRegistry) {
      checks.push({ id: 'empty', label: 'Empty Cell', status: 'warn', message: 'Reserved blank cell' });
    } else {
      checks.push({ id: 'empty', label: 'Empty Cell', status: 'pass', message: 'Mapped icon' });
    }

    if (hasRegistry && seenIds.has(iconId)) {
      checks.push({ id: 'duplicate', label: 'Duplicate', status: 'fail', message: `Duplicate id ${iconId}` });
    }
    seenIds.add(iconId);

    if (hasRegistry) {
      checks.push({
        id: 'metadata',
        label: 'Metadata',
        status: 'pass',
        message: 'Registry entry present',
      });
    }

    return {
      row: cell.row,
      column: cell.column,
      iconId,
      checks,
      overall: qaStatusFromChecks(checks),
    };
  });

  return {
    sheetId: profile.id,
    generatedAt: new Date().toISOString(),
    totalCells: cellReports.length,
    pass: cellReports.filter((c) => c.overall === 'pass').length,
    warn: cellReports.filter((c) => c.overall === 'warn').length,
    fail: cellReports.filter((c) => c.overall === 'fail').length,
    cells: cellReports,
  };
}

export function validateGridCalibrationForProfile(
  cal: StudioWorldIconGridCalibration,
  profile: IconSheetProfile,
  registry: Record<string, { row: number; column: number }>,
): { ok: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const expectedCells = profile.grid.rows * profile.grid.columns;

  if (cal.rowCount !== profile.grid.rows) {
    errors.push(`rowCount must be ${profile.grid.rows} (got ${cal.rowCount})`);
  }
  if (cal.columnCount !== profile.grid.columns) {
    errors.push(`columnCount must be ${profile.grid.columns} (got ${cal.columnCount})`);
  }
  if (cal.rowBoundaries.length !== cal.rowCount + 1) {
    errors.push(`rowBoundaries length must be ${cal.rowCount + 1}`);
  }
  if (cal.columnBoundaries.length !== cal.columnCount + 1) {
    errors.push(`columnBoundaries length must be ${cal.columnCount + 1}`);
  }

  const cells = resolveAllCalibratedCellRects(cal);
  if (cells.length !== expectedCells) {
    errors.push(`expected ${expectedCells} cells, got ${cells.length}`);
  }

  const semanticPositions = new Map<string, string>();
  for (const [key, entry] of Object.entries(registry)) {
    const pos = `${entry.row}:${entry.column}`;
    if (semanticPositions.has(pos)) errors.push(`duplicate semantic position ${pos}`);
    semanticPositions.set(pos, key);
  }

  if (cal.sourceAssetPath.includes('catalog-labeled')) {
    errors.push('labeled catalog must not be used as extraction source');
  }

  if (!cal.canonical) warnings.push('Calibration not marked canonical — export is preview-quality');

  return { ok: errors.length === 0, errors, warnings };
}
