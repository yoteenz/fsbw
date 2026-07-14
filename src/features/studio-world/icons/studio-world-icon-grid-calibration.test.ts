import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STUDIO_WORLD_ICON_GRID_CALIBRATION_CANONICAL,
  applyColumnPadding,
  applyRowPadding,
  createDefaultGridCalibration,
  createEqualBoundaries,
  distributeBoundariesEvenly,
  resolveAllCalibratedCellRects,
  resolveStudioWorldIconCalibratedCellRect,
  upsertCellOverride,
  validateGridCalibration,
} from './grid-calibration';
import { pushHistory } from './grid-calibration/StudioWorldIconGridCalibrationEditor.shared';
import { STUDIO_WORLD_ICON_SOURCES } from './studio-world-icon-source-manifest';
import { EXPERIENCE_LAB_ICON_REGISTRY } from './experience-lab-icon-registry';

const ICONS_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(ICONS_DIR, '../../../..');

describe('Studio World icon grid calibration', () => {
  const cal = STUDIO_WORLD_ICON_GRID_CALIBRATION_CANONICAL;

  it('uses unlabeled source as extraction path only', () => {
    expect(cal.sourceAssetPath).toBe(STUDIO_WORLD_ICON_SOURCES.unlabeledSource.path);
    expect(cal.sourceAssetPath).not.toContain('catalog-labeled');
    expect(cal.sourceAssetPath).not.toContain('unlabeled-twin');
  });

  it('labeled catalog is reference-only in manifest', () => {
    expect(STUDIO_WORLD_ICON_SOURCES.labeledCatalog.role).toBe('semantic-reference');
    expect(STUDIO_WORLD_ICON_SOURCES.unlabeledSource.role).toBe('runtime-extraction-source');
    expect(STUDIO_WORLD_ICON_SOURCES.unlabeledTwin.role).toBe('historical-only');
  });

  it('grid contains exactly 8 rows and 8 columns producing 64 cells', () => {
    expect(cal.rowCount).toBe(8);
    expect(cal.columnCount).toBe(8);
    expect(cal.rowBoundaries).toHaveLength(9);
    expect(cal.columnBoundaries).toHaveLength(9);
    const cells = resolveAllCalibratedCellRects(cal);
    expect(cells).toHaveLength(64);
  });

  it('row and column boundaries remain ordered', () => {
    for (let i = 1; i < cal.rowBoundaries.length; i += 1) {
      expect(cal.rowBoundaries[i]).toBeGreaterThan(cal.rowBoundaries[i - 1]!);
    }
    for (let i = 1; i < cal.columnBoundaries.length; i += 1) {
      expect(cal.columnBoundaries[i]).toBeGreaterThan(cal.columnBoundaries[i - 1]!);
    }
  });

  it('row adjustment updates all eight cells in that row', () => {
    const next = applyRowPadding(cal, 3, { bottom: 4 });
    const rowCells = resolveAllCalibratedCellRects(next).filter((c) => c.row === 3);
    expect(rowCells).toHaveLength(8);
    const baseline = resolveAllCalibratedCellRects(cal).filter((c) => c.row === 3);
    for (let i = 0; i < 8; i += 1) {
      expect(rowCells[i]!.height).toBeLessThan(baseline[i]!.height);
    }
  });

  it('column adjustment updates all eight cells in that column', () => {
    const next = applyColumnPadding(cal, 5, { left: 3 });
    const colCells = resolveAllCalibratedCellRects(next).filter((c) => c.column === 5);
    expect(colCells).toHaveLength(8);
    const baseline = resolveAllCalibratedCellRects(cal).filter((c) => c.column === 5);
    for (let i = 0; i < 8; i += 1) {
      expect(colCells[i]!.left).toBeGreaterThan(baseline[i]!.left);
    }
  });

  it('cell override affects only the selected cell', () => {
    const override = {
      row: 2,
      column: 4,
      semanticKey: 'test',
      insetTop: 2,
      insetRight: 2,
      insetBottom: 2,
      insetLeft: 2,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
      enabled: true,
      reason: 'test',
    };
    const next = upsertCellOverride(cal, override);
    const target = resolveStudioWorldIconCalibratedCellRect(next, 2, 4);
    const neighbor = resolveStudioWorldIconCalibratedCellRect(next, 2, 3);
    const baselineNeighbor = resolveStudioWorldIconCalibratedCellRect(cal, 2, 3);
    expect(target.hasOverride).toBe(true);
    expect(neighbor.hasOverride).toBe(false);
    expect(neighbor).toEqual(baselineNeighbor);
  });

  it('undo/redo history stack preserves prior calibration', () => {
    const history: Array<{ calibration: typeof cal; label: string }> = [];
    const withHistory = pushHistory(history, { calibration: cal, label: 'before row pad' });
    expect(withHistory).toHaveLength(1);
    expect(withHistory[0]!.calibration).toEqual(cal);
    const updated = applyRowPadding(cal, 1, { top: 2 });
    expect(updated.rowPadding[1]?.top).toBe(2);
  });

  it('validates calibration before publish', () => {
    const bad = createDefaultGridCalibration({ rowBoundaries: [0, 0.5, 1] });
    const result = validateGridCalibration(bad);
    expect(result.ok).toBe(false);
    expect(validateGridCalibration(cal).ok).toBe(true);
  });

  it('semantic registry maps each row/column without inference', () => {
    const positions = new Set<string>();
    for (const entry of Object.values(EXPERIENCE_LAB_ICON_REGISTRY)) {
      positions.add(`${entry.row}:${entry.column}`);
    }
    expect(positions.size).toBe(64);
  });

  it('grid calibration editor route is registered', () => {
    const app = readFileSync(resolve(ROOT, 'src/App.tsx'), 'utf8');
    const perms = readFileSync(resolve(ROOT, 'src/studio-os-core/canonical-studio-world/permission-model.ts'), 'utf8');
    expect(app).toContain('studio-world-icon-grid-calibration');
    expect(perms).toContain('/admin/studio/studio-world-icon-grid-calibration');
  });

  it('v6 generator reads only unlabeled source and canonical calibration', () => {
    const gen = readFileSync(resolve(ROOT, 'scripts/generate-studio-world-icons-from-grid-calibration.mjs'), 'utf8');
    expect(gen).toContain('studio-world-icon-source-unlabeled.png');
    expect(gen).toContain('studio-world-icon-grid-calibration-canonical.json');
    expect(gen).not.toContain('create-studio-world-unlabeled-source-twin');
    expect(gen).toMatch(/cellToTransparentPng\(sourcePath/);
    expect(gen).not.toMatch(/cellToTransparentPng\(labeledPath/);
  });

  it('prebuild uses v6 grid generator not twin pipeline', () => {
    const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')) as { scripts: Record<string, string> };
    expect(pkg.scripts.prebuild).toContain('generate-studio-world-icons-from-grid-calibration.mjs');
    expect(pkg.scripts.prebuild).not.toContain('create-studio-world-unlabeled-source-twin.mjs');
    expect(pkg.scripts.prebuild).not.toContain('generate-studio-world-icons-from-source-twin.mjs');
  });

  it('editor exposes mobile and desktop control modules', () => {
    const page = readFileSync(resolve(ROOT, 'src/pages/admin/studio/studio-world-icon-grid-calibration/page.tsx'), 'utf8');
    expect(page).toContain('matchMedia');
    expect(page).toContain('StepperControl');
    expect(page).toContain('layoutMobile');
    expect(page).toContain('Save Draft');
    expect(page).toContain('Publish to Experience Lab V2');
  });

  it('publishing requires explicit confirmation', () => {
    const page = readFileSync(resolve(ROOT, 'src/pages/admin/studio/studio-world-icon-grid-calibration/page.tsx'), 'utf8');
    expect(page).toContain('publishConfirm');
    expect(page).toContain('Confirm publish');
  });

  it('equal boundary preset creates 9 grid lines', () => {
    expect(createEqualBoundaries(8)).toEqual(distributeBoundariesEvenly(8));
    expect(createEqualBoundaries(8)).toHaveLength(9);
  });

  it('forensic audit document exists', () => {
    expect(existsSync(resolve(ROOT, 'docs/studio-os/forensics/STUDIO_WORLD_ICON_GRID_CALIBRATION_AUDIT.md'))).toBe(true);
  });
});
