import { describe, expect, it } from 'vitest';
import {
  ICON_SHEET_PROFILES,
  validateGridCalibrationForProfile,
  runIconManufacturingQa,
  createManufacturingExtensions,
  buildBatchExportPlan,
  CERTIFICATION_PIPELINE,
} from '../../../../studio-os-core/icon-manufacturing';
import { NAVIGATION_MASTER_ICON_REGISTRY } from '../navigation-master/navigation-master-icon-registry';
import navigationCalibration from '../navigation-master/grid-calibration/navigation-master-grid-calibration-canonical.json';
import { EXPERIENCE_LAB_ICON_REGISTRY } from '../experience-lab-icon-registry';
import { STUDIO_WORLD_ICON_GRID_CALIBRATION_CANONICAL } from '../grid-calibration';

describe('Icon Manufacturing Pipeline', () => {
  it('defines sheet profiles for experience-lab and navigation-master', () => {
    expect(ICON_SHEET_PROFILES['experience-lab'].grid.iconCount).toBe(64);
    expect(ICON_SHEET_PROFILES['navigation-master'].grid.iconCount).toBe(93);
  });

  it('validates navigation 10×10 calibration', () => {
    const profile = ICON_SHEET_PROFILES['navigation-master'];
    const result = validateGridCalibrationForProfile(
      navigationCalibration as typeof STUDIO_WORLD_ICON_GRID_CALIBRATION_CANONICAL,
      profile,
      NAVIGATION_MASTER_ICON_REGISTRY,
    );
    expect(result.ok).toBe(true);
  });

  it('runs QA on navigation sheet', () => {
    const profile = ICON_SHEET_PROFILES['navigation-master'];
    const extensions = createManufacturingExtensions(profile);
    const qa = runIconManufacturingQa(
      profile,
      navigationCalibration as typeof STUDIO_WORLD_ICON_GRID_CALIBRATION_CANONICAL,
      NAVIGATION_MASTER_ICON_REGISTRY,
      extensions,
    );
    expect(qa.totalCells).toBe(100);
    expect(qa.pass + qa.warn + qa.fail).toBe(100);
  });

  it('builds batch export plan', () => {
    const profile = ICON_SHEET_PROFILES['navigation-master'];
    const extensions = createManufacturingExtensions(profile);
    const qa = runIconManufacturingQa(
      profile,
      navigationCalibration as typeof STUDIO_WORLD_ICON_GRID_CALIBRATION_CANONICAL,
      NAVIGATION_MASTER_ICON_REGISTRY,
      extensions,
    );
    const plan = buildBatchExportPlan(profile, qa, []);
    expect(plan.steps.length).toBeGreaterThan(8);
    expect(plan.buildScript).toContain('navigation-master:build-icons');
  });

  it('defines certification pipeline stages', () => {
    expect(CERTIFICATION_PIPELINE).toContain('certified');
    expect(CERTIFICATION_PIPELINE).toContain('founder-approved');
  });

  it('validates experience-lab 8×8 calibration', () => {
    const profile = ICON_SHEET_PROFILES['experience-lab'];
    const result = validateGridCalibrationForProfile(
      STUDIO_WORLD_ICON_GRID_CALIBRATION_CANONICAL,
      profile,
      EXPERIENCE_LAB_ICON_REGISTRY,
    );
    expect(result.ok).toBe(true);
  });
});
