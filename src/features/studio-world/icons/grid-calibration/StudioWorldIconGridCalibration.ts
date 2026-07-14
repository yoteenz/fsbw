import { EXPERIENCE_LAB_ICON_REGISTRY, type ExperienceLabIconName } from '../experience-lab-icon-registry';
import { STUDIO_WORLD_ICON_SOURCES } from '../studio-world-icon-source-manifest';

/** Per-cell optional override applied after row/column calibration. */
export type StudioWorldIconCellOverride = {
  row: number;
  column: number;
  semanticKey: ExperienceLabIconName | string;
  insetTop: number;
  insetRight: number;
  insetBottom: number;
  insetLeft: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  enabled: boolean;
  reason: string;
};

export type StudioWorldIconRowColumnPadding = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

/** Founder-controlled 8×8 grid calibration over the unlabeled source pack. */
export type StudioWorldIconGridCalibration = {
  sourceAssetPath: string;
  sourceWidth: number;
  sourceHeight: number;
  rowCount: number;
  columnCount: number;
  outerLeft: number;
  outerRight: number;
  outerTop: number;
  outerBottom: number;
  /** Normalized 0–1 positions within content rect; length rowCount + 1. */
  rowBoundaries: number[];
  /** Normalized 0–1 positions within content rect; length columnCount + 1. */
  columnBoundaries: number[];
  rowOffsets: number[];
  columnOffsets: number[];
  rowPadding: StudioWorldIconRowColumnPadding[];
  columnPadding: StudioWorldIconRowColumnPadding[];
  cellOverrides: StudioWorldIconCellOverride[];
  calibrationVersion: string;
  updatedAt: string;
  updatedBy: string;
  canonical: boolean;
  sourceChecksum?: string;
  notes?: string;
};

export type StudioWorldIconCellRect = {
  row: number;
  column: number;
  semanticKey: string;
  left: number;
  top: number;
  width: number;
  height: number;
  hasOverride: boolean;
};

export type StudioWorldIconGridValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export const STUDIO_WORLD_ICON_GRID_CALIBRATION_VERSION =
  'studio-world-icon-grid-calibration-v1' as const;

export const STUDIO_WORLD_ICON_UNLABELED_SOURCE_PATH =
  STUDIO_WORLD_ICON_SOURCES.unlabeledSource.path;

export const STUDIO_WORLD_ICON_LABELED_REFERENCE_PATH =
  STUDIO_WORLD_ICON_SOURCES.labeledCatalog.path;

const DEFAULT_ROWS = 8;
const DEFAULT_COLS = 8;

export function createEqualBoundaries(count: number): number[] {
  const boundaries: number[] = [];
  for (let i = 0; i <= count; i += 1) {
    boundaries.push(i / count);
  }
  return boundaries;
}

export function createDefaultGridCalibration(
  overrides: Partial<StudioWorldIconGridCalibration> = {},
): StudioWorldIconGridCalibration {
  const now = new Date().toISOString();
  return {
    sourceAssetPath: STUDIO_WORLD_ICON_UNLABELED_SOURCE_PATH,
    sourceWidth: STUDIO_WORLD_ICON_SOURCES.unlabeledSource.width,
    sourceHeight: STUDIO_WORLD_ICON_SOURCES.unlabeledSource.height,
    rowCount: DEFAULT_ROWS,
    columnCount: DEFAULT_COLS,
    outerLeft: 0,
    outerRight: 0,
    outerTop: 0,
    outerBottom: 0,
    rowBoundaries: createEqualBoundaries(DEFAULT_ROWS),
    columnBoundaries: createEqualBoundaries(DEFAULT_COLS),
    rowOffsets: Array.from({ length: DEFAULT_ROWS }, () => 0),
    columnOffsets: Array.from({ length: DEFAULT_COLS }, () => 0),
    rowPadding: Array.from({ length: DEFAULT_ROWS }, () => ({ top: 0, bottom: 0 })),
    columnPadding: Array.from({ length: DEFAULT_COLS }, () => ({ left: 0, right: 0 })),
    cellOverrides: [],
    calibrationVersion: STUDIO_WORLD_ICON_GRID_CALIBRATION_VERSION,
    updatedAt: now,
    updatedBy: 'system',
    canonical: false,
    ...overrides,
  };
}

export function resolveGridContentRect(cal: StudioWorldIconGridCalibration): {
  left: number;
  top: number;
  width: number;
  height: number;
} {
  const left = Math.round(cal.outerLeft * cal.sourceWidth);
  const top = Math.round(cal.outerTop * cal.sourceHeight);
  const right = Math.round(cal.sourceWidth * (1 - cal.outerRight));
  const bottom = Math.round(cal.sourceHeight * (1 - cal.outerBottom));
  return {
    left,
    top,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };
}

function boundaryPixel(
  normalized: number,
  origin: number,
  span: number,
): number {
  return origin + Math.round(normalized * span);
}

export function resolveStudioWorldIconCalibratedCellRect(
  cal: StudioWorldIconGridCalibration,
  row: number,
  column: number,
): StudioWorldIconCellRect {
  const content = resolveGridContentRect(cal);
  const rowPad = cal.rowPadding[row] ?? { top: 0, bottom: 0 };
  const colPad = cal.columnPadding[column] ?? { left: 0, right: 0 };
  const rowOffset = cal.rowOffsets[row] ?? 0;
  const colOffset = cal.columnOffsets[column] ?? 0;

  let left = boundaryPixel(cal.columnBoundaries[column]!, content.left, content.width)
    + (colPad.left ?? 0)
    + colOffset;
  let right = boundaryPixel(cal.columnBoundaries[column + 1]!, content.left, content.width)
    - (colPad.right ?? 0)
    + colOffset;
  let top = boundaryPixel(cal.rowBoundaries[row]!, content.top, content.height)
    + (rowPad.top ?? 0)
    + rowOffset;
  let bottom = boundaryPixel(cal.rowBoundaries[row + 1]!, content.top, content.height)
    - (rowPad.bottom ?? 0)
    + rowOffset;

  const registryEntry = Object.values(EXPERIENCE_LAB_ICON_REGISTRY).find(
    (e) => e.row === row && e.column === column,
  );
  const semanticKey = registryEntry
    ? (Object.entries(EXPERIENCE_LAB_ICON_REGISTRY).find(([, v]) => v === registryEntry)?.[0] ?? `${row}-${column}`)
    : `${row}-${column}`;

  const override = cal.cellOverrides.find(
    (o) => o.enabled && o.row === row && o.column === column,
  );
  let hasOverride = false;
  if (override) {
    hasOverride = true;
    left += override.insetLeft + override.offsetX;
    right -= override.insetRight;
    top += override.insetTop + override.offsetY;
    bottom -= override.insetBottom;
    if (override.scale !== 1) {
      const cx = (left + right) / 2;
      const cy = (top + bottom) / 2;
      const halfW = ((right - left) * override.scale) / 2;
      const halfH = ((bottom - top) * override.scale) / 2;
      left = Math.round(cx - halfW);
      right = Math.round(cx + halfW);
      top = Math.round(cy - halfH);
      bottom = Math.round(cy + halfH);
    }
  }

  return {
    row,
    column,
    semanticKey,
    left: Math.max(0, left),
    top: Math.max(0, top),
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
    hasOverride,
  };
}

export function resolveAllCalibratedCellRects(
  cal: StudioWorldIconGridCalibration,
): StudioWorldIconCellRect[] {
  const cells: StudioWorldIconCellRect[] = [];
  for (let row = 0; row < cal.rowCount; row += 1) {
    for (let column = 0; column < cal.columnCount; column += 1) {
      cells.push(resolveStudioWorldIconCalibratedCellRect(cal, row, column));
    }
  }
  return cells;
}

export function validateGridCalibration(
  cal: StudioWorldIconGridCalibration,
): StudioWorldIconGridValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (cal.rowCount !== 8) errors.push(`rowCount must be 8 (got ${cal.rowCount})`);
  if (cal.columnCount !== 8) errors.push(`columnCount must be 8 (got ${cal.columnCount})`);
  if (cal.rowBoundaries.length !== cal.rowCount + 1) {
    errors.push(`rowBoundaries length must be ${cal.rowCount + 1}`);
  }
  if (cal.columnBoundaries.length !== cal.columnCount + 1) {
    errors.push(`columnBoundaries length must be ${cal.columnCount + 1}`);
  }

  const assertMonotonic = (values: number[], label: string) => {
    for (let i = 1; i < values.length; i += 1) {
      if (values[i]! <= values[i - 1]!) errors.push(`${label} boundaries must be strictly increasing`);
    }
    if (values[0] !== 0) warnings.push(`${label} first boundary should be 0`);
    if (values[values.length - 1] !== 1) warnings.push(`${label} last boundary should be 1`);
  };
  assertMonotonic(cal.rowBoundaries, 'row');
  assertMonotonic(cal.columnBoundaries, 'column');

  if (cal.outerLeft < 0 || cal.outerRight < 0 || cal.outerTop < 0 || cal.outerBottom < 0) {
    errors.push('outer margins must be non-negative');
  }
  if (cal.outerLeft + cal.outerRight >= 1 || cal.outerTop + cal.outerBottom >= 1) {
    errors.push('outer margins must leave a positive content area');
  }

  const cells = resolveAllCalibratedCellRects(cal);
  if (cells.length !== 64) errors.push(`expected 64 cells, got ${cells.length}`);

  const positions = new Set<string>();
  for (const cell of cells) {
    if (cell.left + cell.width > cal.sourceWidth || cell.top + cell.height > cal.sourceHeight) {
      errors.push(`cell r${cell.row}c${cell.column} exceeds source bounds`);
    }
    const key = `${cell.row}:${cell.column}`;
    if (positions.has(key)) errors.push(`duplicate cell position ${key}`);
    positions.add(key);
  }

  const semanticPositions = new Map<string, string>();
  for (const [key, entry] of Object.entries(EXPERIENCE_LAB_ICON_REGISTRY)) {
    const pos = `${entry.row}:${entry.column}`;
    if (semanticPositions.has(pos)) {
      errors.push(`duplicate semantic position ${pos}`);
    }
    semanticPositions.set(pos, key);
  }

  if (cal.sourceAssetPath.includes('catalog-labeled')) {
    errors.push('labeled catalog must not be used as extraction source');
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function distributeBoundariesEvenly(count: number): number[] {
  return createEqualBoundaries(count);
}

export function updateRowBoundary(
  cal: StudioWorldIconGridCalibration,
  index: number,
  value: number,
): StudioWorldIconGridCalibration {
  const next = [...cal.rowBoundaries];
  const clamped = Math.max(
    next[index - 1] ?? 0,
    Math.min(value, next[index + 1] ?? 1),
  );
  next[index] = clamped;
  return { ...cal, rowBoundaries: next, updatedAt: new Date().toISOString() };
}

export function updateColumnBoundary(
  cal: StudioWorldIconGridCalibration,
  index: number,
  value: number,
): StudioWorldIconGridCalibration {
  const next = [...cal.columnBoundaries];
  const clamped = Math.max(
    next[index - 1] ?? 0,
    Math.min(value, next[index + 1] ?? 1),
  );
  next[index] = clamped;
  return { ...cal, columnBoundaries: next, updatedAt: new Date().toISOString() };
}

export function applyRowPadding(
  cal: StudioWorldIconGridCalibration,
  row: number,
  delta: { top?: number; bottom?: number },
): StudioWorldIconGridCalibration {
  const rowPadding = cal.rowPadding.map((p, i) =>
    i === row ? { ...p, top: (p.top ?? 0) + (delta.top ?? 0), bottom: (p.bottom ?? 0) + (delta.bottom ?? 0) } : p,
  );
  return { ...cal, rowPadding, updatedAt: new Date().toISOString() };
}

export function applyColumnPadding(
  cal: StudioWorldIconGridCalibration,
  column: number,
  delta: { left?: number; right?: number },
): StudioWorldIconGridCalibration {
  const columnPadding = cal.columnPadding.map((p, i) =>
    i === column
      ? { ...p, left: (p.left ?? 0) + (delta.left ?? 0), right: (p.right ?? 0) + (delta.right ?? 0) }
      : p,
  );
  return { ...cal, columnPadding, updatedAt: new Date().toISOString() };
}

export function upsertCellOverride(
  cal: StudioWorldIconGridCalibration,
  override: StudioWorldIconCellOverride,
): StudioWorldIconGridCalibration {
  const cellOverrides = cal.cellOverrides.filter(
    (o) => !(o.row === override.row && o.column === override.column),
  );
  if (override.enabled) cellOverrides.push(override);
  return { ...cal, cellOverrides, updatedAt: new Date().toISOString() };
}

export function getSemanticKeyForCell(row: number, column: number): string | undefined {
  return Object.entries(EXPERIENCE_LAB_ICON_REGISTRY).find(
    ([, e]) => e.row === row && e.column === column,
  )?.[0];
}
