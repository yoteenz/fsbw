import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  EXPERIENCE_LAB_ICON_NAMES,
} from './experience-lab-icon-registry';
import {
  StudioWorldIconCropManifest,
  STUDIO_WORLD_ICON_CROP_KEYS,
  STUDIO_WORLD_ICON_CROP_MANIFEST_VERSION,
  STUDIO_WORLD_ICON_SOURCE,
  isCropInsideCell,
  EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN,
} from './studio-world-icon-crop-manifest';
import {
  EXPERIENCE_LAB_ICON_EXTRACTION_VERSION,
  EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED,
  EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN as ASSETS_V2_FROZEN,
} from './experience-lab-icon-assets.generated';
import { EXPERIENCE_LAB_ICON_SPRITE_CONFIG } from './experience-lab-icon-sprite.config';
import { FOUNDER_OPTICAL_MODE_PAUSED } from './experience-lab-icon-presenter';
import { EXPERIENCE_LAB_ICON_OPTICAL_TUNING_PAUSED } from './experience-lab-icon-asset-resolver';

const ROOT = resolve(import.meta.dirname, '../../../..');

describe('studio-world-icon-crop-manifest v3', () => {
  it('labeled source checksum unchanged', () => {
    const hash = readFileSync(
      resolve(ROOT, 'src/features/studio-world/icons/experience-lab-icon-source.sha256'),
      'utf8',
    ).trim();
    expect(STUDIO_WORLD_ICON_SOURCE.sha256).toBe(hash);
    expect(STUDIO_WORLD_ICON_SOURCE.sha256).toBe(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.sourceSha256);
  });

  it('exactly 64 crop manifest entries with coordinates', () => {
    expect(STUDIO_WORLD_ICON_CROP_KEYS.length).toBe(64);
    expect(EXPERIENCE_LAB_ICON_NAMES.length).toBe(64);
    for (const key of EXPERIENCE_LAB_ICON_NAMES) {
      const entry = StudioWorldIconCropManifest[key];
      expect(entry.semanticKey).toBe(key);
      expect(entry.cropWidth).toBeGreaterThan(0);
      expect(entry.cropHeight).toBeGreaterThan(0);
      expect(entry.sourceLabel.length).toBeGreaterThan(0);
      expect(typeof entry.approved).toBe('boolean');
    }
  });

  it('every crop stays inside its source cell', () => {
    for (const key of EXPERIENCE_LAB_ICON_NAMES) {
      expect(isCropInsideCell(StudioWorldIconCropManifest[key])).toBe(true);
    }
  });

  it('v2 pipeline frozen and lockdown decertified', () => {
    expect(EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN).toBe(true);
    expect(ASSETS_V2_FROZEN).toBe(true);
    expect(EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED).toBe(false);
    expect(EXPERIENCE_LAB_ICON_EXTRACTION_VERSION).toBe('studio-world-icons-v3');
    expect(STUDIO_WORLD_ICON_CROP_MANIFEST_VERSION).toBe('studio-world-icon-crops-v3');
  });

  it('optical tuning paused until source approval', () => {
    expect(FOUNDER_OPTICAL_MODE_PAUSED).toBe(true);
    expect(EXPERIENCE_LAB_ICON_OPTICAL_TUNING_PAUSED).toBe(true);
  });

  it('v3 generator outputs preview PNGs for all icons', () => {
    const previewDir = resolve(
      ROOT,
      'src/assets/studio-world/experience-lab/icons/generated-v3/_preview-unapproved',
    );
    expect(existsSync(previewDir)).toBe(true);
    const files = readFileSync(resolve(previewDir, '../_generation-summary.json'), 'utf8');
    const summary = JSON.parse(files) as { previewUnapproved: number; mapped: number };
    expect(summary.mapped).toBe(64);
    expect(summary.previewUnapproved).toBe(64);
  });

  it('prebuild uses v3 generator not v2 extractor', () => {
    const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts.prebuild).toContain('generate-studio-world-icons-from-crops.mjs');
    expect(pkg.scripts.prebuild).not.toContain('extract-experience-lab-icons.mjs');
  });

  it('crop editor and QA routes registered in App.tsx', () => {
    const app = readFileSync(resolve(ROOT, 'src/App.tsx'), 'utf8');
    expect(app).toContain('studio/experience-lab-icon-crop-editor');
    expect(app).toContain('AdminStudioExperienceLabIconCropEditor');
    expect(app).toContain('studio/experience-lab-icon-qa');
  });

  it('Experience Lab layout files unchanged (no workbench/dock edits in sprint)', () => {
    const workbench = readFileSync(
      resolve(ROOT, 'src/features/studio-world/experience-lab-v2/ExperienceLabFounderWorkbench.tsx'),
      'utf8',
    );
    expect(workbench).not.toContain('generated-v3');
    expect(workbench).toContain('ExperienceLabIcon');
  });
});
