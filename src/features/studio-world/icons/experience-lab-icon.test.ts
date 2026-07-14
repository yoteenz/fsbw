import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  EXPERIENCE_LAB_ICON_NAMES,
  EXPERIENCE_LAB_ICON_REGISTRY,
  isExperienceLabIconName,
} from './experience-lab-icon-registry';
import { EXPERIENCE_LAB_ICON_SPRITE_CONFIG } from './experience-lab-icon-sprite.config';
import {
  EXPERIENCE_LAB_ICON_ASSETS,
  EXPERIENCE_LAB_ICON_EXTRACTION_VERSION,
  EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED,
  EXPERIENCE_LAB_ICON_SOURCE_ROLE,
  EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN,
  EXPERIENCE_LAB_ICON_V3_PIPELINE_RETIRED,
  EXPERIENCE_LAB_ICON_V4_PIPELINE_RETIRED,
  EXPERIENCE_LAB_ICON_LABELED_CATALOG_SHA256,
  EXPERIENCE_LAB_ICON_EXTRACTION_SOURCE_SHA256,
} from './experience-lab-icon-assets.generated';
import {
  STUDIO_WORLD_ICON_SOURCES,
  STUDIO_WORLD_ICON_FORBIDDEN_EXTRACTION_PATHS,
} from './studio-world-icon-source-manifest';
import { FOUNDER_OPTICAL_MODE_PAUSED } from './experience-lab-icon-presenter';
import {
  EXPERIENCE_LAB_ICON_OPTICAL_TUNING_PAUSED,
  resolveProductionExperienceLabIconAsset,
} from './experience-lab-icon-asset-resolver';

const ICONS_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(ICONS_DIR, '../../../..');
const LABELED = resolve(ROOT, STUDIO_WORLD_ICON_SOURCES.labeledCatalog.path);
const UNLABELED = resolve(ROOT, STUDIO_WORLD_ICON_SOURCES.unlabeledSource.path);
const TWIN = resolve(ROOT, STUDIO_WORLD_ICON_SOURCES.unlabeledTwin.path);
const V6_DIR = resolve(ROOT, 'src/assets/studio-world/experience-lab/icons/generated-v6');
const V5_DIR = resolve(ROOT, 'src/assets/studio-world/experience-lab/icons/generated-v5');
const COMPONENT = resolve(ICONS_DIR, 'ExperienceLabIcon.tsx');
const V2_SHELL = resolve(ICONS_DIR, '../experience-lab-v2/ExperienceLabV2Shell.tsx');
const LEGACY_PAGE = resolve(ROOT, 'src/pages/admin/studio/experience-lab/page.tsx');
const V6_SCRIPT = resolve(ROOT, 'scripts/generate-studio-world-icons-from-grid-calibration.mjs');
const ASSETS_TS = resolve(ICONS_DIR, 'experience-lab-icon-assets.generated.ts');

function iconFilename(key: string) {
  return `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}.png`;
}

async function sha256File(path: string) {
  const { createHash } = await import('node:crypto');
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

describe('Experience Lab icon system v6 (grid-calibrated unlabeled source)', () => {
  it('preserves labeled catalog byte-for-byte checksum', async () => {
    expect(existsSync(LABELED)).toBe(true);
    expect(await sha256File(LABELED)).toBe(STUDIO_WORLD_ICON_SOURCES.labeledCatalog.checksum);
    expect(EXPERIENCE_LAB_ICON_LABELED_CATALOG_SHA256).toBe(STUDIO_WORLD_ICON_SOURCES.labeledCatalog.checksum);
  });

  it('unlabeled source is production extraction source', async () => {
    expect(existsSync(UNLABELED)).toBe(true);
    const meta = await sharp(UNLABELED).metadata();
    expect(meta.width).toBe(1402);
    expect(meta.height).toBe(1122);
    expect(STUDIO_WORLD_ICON_SOURCES.unlabeledSource.rows).toBe(8);
    expect(STUDIO_WORLD_ICON_SOURCES.unlabeledSource.columns).toBe(8);
    expect(EXPERIENCE_LAB_ICON_NAMES).toHaveLength(64);
    expect(EXPERIENCE_LAB_ICON_EXTRACTION_SOURCE_SHA256).toBe(STUDIO_WORLD_ICON_SOURCES.unlabeledSource.checksum);
  });

  it('v6 generator reads only unlabeled source; labeled and twin forbidden for extraction', () => {
    const gen = readFileSync(V6_SCRIPT, 'utf8');
    expect(gen).toContain('studio-world-icon-source-unlabeled.png');
    expect(gen).not.toContain('create-studio-world-unlabeled-source-twin');
    expect(gen).toMatch(/cellToTransparentPng\(sourcePath/);
    expect(gen).not.toMatch(/cellToTransparentPng\(labeledPath/);
    expect(EXPERIENCE_LAB_ICON_SOURCE_ROLE).toBe('unlabeled-grid-calibrated');
    expect(STUDIO_WORLD_ICON_FORBIDDEN_EXTRACTION_PATHS).toContain(STUDIO_WORLD_ICON_SOURCES.labeledCatalog.path);
    expect(STUDIO_WORLD_ICON_FORBIDDEN_EXTRACTION_PATHS).toContain(STUDIO_WORLD_ICON_SOURCES.unlabeledTwin.path);
    const assets = readFileSync(ASSETS_TS, 'utf8');
    expect(assets).not.toContain('generated-v5/');
    expect(assets).toContain('generated-v6/');
  });

  it('generates 64 v6 PNGs with transparency', async () => {
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      const file = resolve(V6_DIR, iconFilename(name));
      expect(existsSync(file), `${name} v6`).toBe(true);
      const meta = await sharp(file).metadata();
      expect(meta.hasAlpha).toBe(true);
      expect(meta.width).toBe(512);
      expect(meta.height).toBe(512);
      const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let opaque = 0;
      for (let i = 0; i < data.length; i += info.channels) {
        if (data[i + 3] > 20) opaque += 1;
      }
      expect(opaque, `${name} blank`).toBeGreaterThan(24);
    }
  });

  it('maps all semantic keys to v6 runtime assets', () => {
    expect(EXPERIENCE_LAB_ICON_EXTRACTION_VERSION).toBe('studio-world-icons-v6-grid-calibration');
    expect(EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN).toBe(true);
    expect(EXPERIENCE_LAB_ICON_V3_PIPELINE_RETIRED).toBe(true);
    expect(EXPERIENCE_LAB_ICON_V4_PIPELINE_RETIRED).toBe(true);
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.mode).toBe('grid-calibration-v6');
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.generatedDir).toContain('generated-v6');
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      const asset = resolveProductionExperienceLabIconAsset(name);
      expect(asset.src, name).toBeTruthy();
      expect(asset.source).toBe('v6-grid-calibration');
      expect(EXPERIENCE_LAB_ICON_ASSETS[name].sourceRole).toBe('unlabeled-grid-calibrated');
    }
  });

  it('retired twin and v5 bundle remain rollback-only', () => {
    expect(existsSync(TWIN)).toBe(true);
    expect(STUDIO_WORLD_ICON_SOURCES.unlabeledTwin.role).toBe('historical-only');
    expect(readFileSync(ASSETS_TS, 'utf8')).not.toContain('unlabeled-twin');
    if (existsSync(V5_DIR)) {
      expect(readFileSync(ASSETS_TS, 'utf8')).not.toContain('generated-v5/');
    }
  });

  it('optical tuning paused; lockdown not certified until founder QA', () => {
    expect(FOUNDER_OPTICAL_MODE_PAUSED).toBe(true);
    expect(EXPERIENCE_LAB_ICON_OPTICAL_TUNING_PAUSED).toBe(true);
    expect(EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED).toBe(false);
  });

  it('Experience Lab V2 layout and orb unchanged', () => {
    const cmd = readFileSync(resolve(ICONS_DIR, '../experience-lab-v2/ExperienceLabCommandDock.tsx'), 'utf8');
    const workbench = readFileSync(resolve(ICONS_DIR, '../experience-lab-v2/ExperienceLabFounderWorkbench.tsx'), 'utf8');
    expect(cmd).toContain('ExperienceLabIcon');
    expect(workbench).toContain('ExperienceLabIcon');
    expect(workbench).toMatch(/orb|Orb/);
    expect(readFileSync(LEGACY_PAGE, 'utf8')).not.toContain('ExperienceLabIcon');
    expect(readFileSync(V2_SHELL, 'utf8')).toContain('ExperienceLabV2Shell');
    expect(readFileSync(COMPONENT, 'utf8')).not.toContain('backgroundPosition');
  });

  it('grid calibration editor route registered', () => {
    const page = readFileSync(resolve(ROOT, 'src/pages/admin/studio/studio-world-icon-grid-calibration/page.tsx'), 'utf8');
    expect(page).toContain('Studio World Icon Grid Calibration Editor');
    expect(page).toContain('unlabeled');
  });

  it('prebuild uses v6 grid calibration generator', () => {
    const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')) as { scripts: Record<string, string> };
    expect(pkg.scripts.prebuild).toContain('generate-studio-world-icons-from-grid-calibration.mjs');
    expect(pkg.scripts.prebuild).not.toContain('generate-studio-world-icons-from-source-twin.mjs');
  });

  it('unknown semantic keys fail safely', () => {
    expect(isExperienceLabIconName('notReal')).toBe(false);
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      expect(EXPERIENCE_LAB_ICON_REGISTRY[name].row).toBeGreaterThanOrEqual(0);
    }
  });
});
