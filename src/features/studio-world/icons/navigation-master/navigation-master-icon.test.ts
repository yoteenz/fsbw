import { describe, expect, it } from 'vitest';
import {
  NAVIGATION_MASTER_BLANK_CELLS,
  NAVIGATION_MASTER_ICON_GRID,
  NAVIGATION_MASTER_ICON_NAMES,
  NAVIGATION_MASTER_ICON_REGISTRY,
} from './navigation-master-icon-registry';
import {
  getNavigationMasterDraftIconCount,
  listNavigationMasterDraftIconDefinitions,
  NAVIGATION_MASTER_DRAFT_PREFIX,
} from './navigation-master-icon-draft-bridge';
import { NAVIGATION_MASTER_SHEET_DIMENSIONS } from './navigation-master-icon-source-manifest';

describe('Navigation Master Icon Registry', () => {
  it('defines 93 navigation icons in 10×10 grid', () => {
    expect(NAVIGATION_MASTER_ICON_NAMES.length).toBe(93);
    expect(NAVIGATION_MASTER_ICON_GRID.iconCount).toBe(93);
    expect(NAVIGATION_MASTER_ICON_GRID.totalCells).toBe(100);
    expect(NAVIGATION_MASTER_BLANK_CELLS.length).toBe(7);
  });

  it('assigns unique row/column positions', () => {
    const positions = new Set<string>();
    for (const name of NAVIGATION_MASTER_ICON_NAMES) {
      const e = NAVIGATION_MASTER_ICON_REGISTRY[name];
      const key = `${e.row}:${e.column}`;
      expect(positions.has(key)).toBe(false);
      positions.add(key);
      expect(e.row).toBeGreaterThanOrEqual(0);
      expect(e.row).toBeLessThan(10);
      expect(e.column).toBeGreaterThanOrEqual(0);
      expect(e.column).toBeLessThan(10);
    }
  });

  it('targets 10240px master sheet resolution', () => {
    expect(NAVIGATION_MASTER_SHEET_DIMENSIONS.width).toBeGreaterThanOrEqual(8192);
    expect(NAVIGATION_MASTER_SHEET_DIMENSIONS.preferredResolution).toBe(10240);
    expect(NAVIGATION_MASTER_SHEET_DIMENSIONS.cellSize).toBe(1024);
  });
});

describe('Navigation Master Draft Bridge', () => {
  it('prepares draft placeholders without production registration', () => {
    const drafts = listNavigationMasterDraftIconDefinitions();
    expect(drafts.length).toBe(getNavigationMasterDraftIconCount());
    expect(drafts.every((d) => d.certification === 'draft')).toBe(true);
    expect(drafts.every((d) => d.category === 'navigation')).toBe(true);
    expect(drafts.every((d) => d.id.startsWith(NAVIGATION_MASTER_DRAFT_PREFIX))).toBe(true);
    expect(drafts.every((d) => d.pngPath === null)).toBe(true);
    expect(drafts.every((d) => Object.keys(d.stateAssets).length === 0)).toBe(true);
  });
});
