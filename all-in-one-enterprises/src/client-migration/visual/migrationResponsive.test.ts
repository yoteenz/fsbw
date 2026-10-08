import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MIGRATION_BREAKPOINTS, MIGRATION_PAGES, migrationPage, migrationPageAttributes } from './migrationResponsive';

/** Every built migration screen (phone authorities): the shell must find a declaration for each. */
const SCREENS = [
  'root', 'existing', 'upload', 'received', 'extract', 'match', 'review', 'conflicts', 'approval', 'prebuilt', 'invite', 'invited',
  'welcome', 'company', 'people', 'vehicles', 'services', 'documents', 'changed', 'confirm', 'complete',
  'new', 'new-received', 'new-extract', 'new-identity', 'new-records', 'new-review', 'new-approval', 'new-prebuilt', 'new-invite', 'new-confirm',
  'batch', 'batch-received', 'batch-processing', 'batch-summary', 'batch-conflicts', 'batch-queue', 'batch-client', 'batch-approval', 'batch-run', 'batch-complete',
];
const pages = Object.values(MIGRATION_PAGES);

describe('migration responsive declarations', () => {
  it('declares every migration screen exactly once', () => {
    expect(Object.keys(MIGRATION_PAGES).sort()).toEqual([...SCREENS].sort());
    expect(new Set(pages.map((p) => p.authority)).size).toBe(pages.length);
  });

  it('keeps actor boundaries: clients live under the portal, staff under the office', () => {
    for (const p of pages) {
      if (p.actor === 'CLIENT') {
        expect(p.route.startsWith('/portal/activation/review'), p.screen).toBe(true);
        expect(p.primaryGrid, p.screen).toBe('CENTERED');
      } else {
        expect(p.route.startsWith('/office/migration'), p.screen).toBe(true);
        expect(p.primaryGrid, p.screen).not.toBe('CENTERED');
      }
    }
  });

  it('uses the FULL hero only for the landing and the arrival', () => {
    expect(pages.filter((p) => p.hero === 'FULL').map((p) => p.pageType).sort()).toEqual(['ARRIVAL', 'LANDING']);
  });

  it('declares TABLE only where a table is rendered from tablet up', () => {
    expect(pages.filter((p) => p.table === 'TABLE').map((p) => p.screen).sort()).toEqual(['batch-queue', 'new-received', 'received']);
  });

  it('uses semantic breakpoints that tile the width axis', () => {
    expect(MIGRATION_BREAKPOINTS.MOBILE.max! + 1).toBe(MIGRATION_BREAKPOINTS.TABLET.min);
    expect(MIGRATION_BREAKPOINTS.TABLET.max! + 1).toBe(MIGRATION_BREAKPOINTS.DESKTOP.min);
  });

  it('writes every declaration field onto the shell as data attributes', () => {
    expect(migrationPageAttributes(MIGRATION_PAGES.review)).toEqual({
      'data-page-type': 'REVIEW',
      'data-density': 'HIGH',
      'data-hero': 'COMPACT',
      'data-grid': 'CANVAS_PANEL',
      'data-process': 'STEPPER',
      'data-support': 'SIDE',
      'data-form': 'CHOICES',
      'data-table': 'ROWS',
      'data-overlay': 'NONE',
    });
  });

  it('gives an undeclared screen a safe default for its actor', () => {
    expect(migrationPage('future-client-step', 'CLIENT')).toMatchObject({ actor: 'CLIENT', primaryGrid: 'CENTERED', hero: 'COMPACT' });
    expect(migrationPage('future-staff-step')).toMatchObject({ actor: 'STAFF', primaryGrid: 'MAIN_SIDE' });
  });

  it('matches the blueprint screen map (npm run migration:blueprint)', () => {
    const file = resolve(__dirname, '../../../../AIO_CLIENT_MIGRATION_RESPONSIVE_BLUEPRINT/screen-responsive-map.json');
    if (!existsSync(file)) return;
    const map = JSON.parse(readFileSync(file, 'utf8')) as { screens: Array<Record<string, string>> };
    expect(map.screens.map((s) => s.SCREEN).sort()).toEqual(Object.keys(MIGRATION_PAGES).sort());
    for (const s of map.screens) {
      const p = MIGRATION_PAGES[s.SCREEN];
      expect([s.SCREEN_ID, s.ROUTE, s.ACTOR, s.PAGE_TYPE, s.DENSITY_CLASS, s.HERO_MODE, s.PRIMARY_GRID_MODE, s.PROCESS_MODE, s.SUPPORT_GRID_MODE, s.FORM_MODE, s.TABLE_MODE, s.OVERLAY_MODE]).toEqual([
        p.authority, p.route, p.actor, p.pageType, p.density, p.hero, p.primaryGrid, p.process, p.support, p.form, p.table, p.overlay,
      ]);
    }
  });
});
