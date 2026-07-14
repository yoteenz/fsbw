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
import twinParity from './studio-world-icon-source-twin-parity.generated.json';
import { FOUNDER_OPTICAL_MODE_PAUSED } from './experience-lab-icon-presenter';
import {
  EXPERIENCE_LAB_ICON_OPTICAL_TUNING_PAUSED,
  resolveProductionExperienceLabIconAsset,
} from './experience-lab-icon-asset-resolver';

const ICONS_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(ICONS_DIR, '../../../..');
const LABELED = resolve(ROOT, STUDIO_WORLD_ICON_SOURCES.labeledCatalog.path);
const TWIN = resolve(ROOT, STUDIO_WORLD_ICON_SOURCES.unlabeledTwin.path);
const DEPRECATED = resolve(ROOT, STUDIO_WORLD_ICON_SOURCES.deprecatedGeneratedUnlabeled.path);
const V5_DIR = resolve(ROOT, 'src/assets/studio-world/experience-lab/icons/generated-v5');
const COMPONENT = resolve(ICONS_DIR, 'ExperienceLabIcon.tsx');
const V2_SHELL = resolve(ICONS_DIR, '../experience-lab-v2/ExperienceLabV2Shell.tsx');
const LEGACY_PAGE = resolve(ROOT, 'src/pages/admin/studio/experience-lab/page.tsx');
const TWIN_SCRIPT = resolve(ROOT, 'scripts/create-studio-world-unlabeled-source-twin.mjs');
const V5_SCRIPT = resolve(ROOT, 'scripts/generate-studio-world-icons-from-source-twin.mjs');
const ASSETS_TS = resolve(ICONS_DIR, 'experience-lab-icon-assets.generated.ts');

function iconFilename(key: string) {
  return `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}.png`;
}

async function sha256File(path: string) {
  const { createHash } = await import('node:crypto');
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

describe('Experience Lab icon system v5 (pixel-preserving source twin)', () => {
  it('preserves labeled catalog byte-for-byte checksum', async () => {
    expect(existsSync(LABELED)).toBe(true);
    expect(await sha256File(LABELED)).toBe(STUDIO_WORLD_ICON_SOURCES.labeledCatalog.checksum);
    expect(EXPERIENCE_LAB_ICON_LABELED_CATALOG_SHA256).toBe(STUDIO_WORLD_ICON_SOURCES.labeledCatalog.checksum);
  });

  it('unlabeled twin matches labeled dimensions and grid', async () => {
    expect(existsSync(TWIN)).toBe(true);
    const labeledMeta = await sharp(LABELED).metadata();
    const twinMeta = await sharp(TWIN).metadata();
    expect(twinMeta.width).toBe(1402);
    expect(twinMeta.height).toBe(1122);
    expect(twinMeta.width).toBe(labeledMeta.width);
    expect(twinMeta.height).toBe(labeledMeta.height);
    expect(STUDIO_WORLD_ICON_SOURCES.unlabeledTwin.rows).toBe(8);
    expect(STUDIO_WORLD_ICON_SOURCES.unlabeledTwin.columns).toBe(8);
    expect(EXPERIENCE_LAB_ICON_NAMES).toHaveLength(64);
  });

  it('source-twin parity is PASS 64 with zero protected pixel changes', () => {
    expect(twinParity.protectedPixelsChanged).toBe(0);
    expect(twinParity.parityPass).toBe(64);
    expect(twinParity.parityWarn).toBe(0);
    expect(twinParity.parityFail).toBe(0);
    for (const icon of twinParity.icons) {
      expect(icon.protectedPixelsChanged).toBe(0);
      expect(icon.iconRegionChecksumBefore).toBe(icon.iconRegionChecksumAfter);
      expect(icon.parityStatus).toBe('PASS');
      expect(icon.residualTextPixels).toBe(0);
    }
  });

  it('v5 generator reads only twin; forbidden sources not referenced', () => {
    const gen = readFileSync(V5_SCRIPT, 'utf8');
    expect(gen).toContain('studio-world-icon-source-unlabeled-twin.png');
    expect(gen).not.toContain('generate-studio-world-icons-from-unlabeled-source');
    expect(EXPERIENCE_LAB_ICON_SOURCE_ROLE).toBe('pixel-preserving-unlabeled-twin');
    expect(STUDIO_WORLD_ICON_FORBIDDEN_EXTRACTION_PATHS).toContain(STUDIO_WORLD_ICON_SOURCES.labeledCatalog.path);
    expect(STUDIO_WORLD_ICON_FORBIDDEN_EXTRACTION_PATHS).toContain(
      STUDIO_WORLD_ICON_SOURCES.deprecatedGeneratedUnlabeled.path,
    );
    const assets = readFileSync(ASSETS_TS, 'utf8');
    expect(assets).not.toContain('generated-v4/');
    expect(assets).not.toContain('studio-world-icon-source-unlabeled.png');
    expect(assets).toContain('generated-v5/');
  });

  it('twin script uses deterministic label masks not generative inpainting', () => {
    const script = readFileSync(TWIN_SCRIPT, 'utf8');
    expect(script).toContain('labelMaskTop');
    expect(script).not.toContain('openai');
    expect(script).not.toContain('fal-ai');
    expect(script).toContain('protectedPixelsChanged');
  });

  it('generates 64 v5 PNGs with transparency', async () => {
    expect(await sha256File(TWIN)).toBe(STUDIO_WORLD_ICON_SOURCES.unlabeledTwin.checksum);
    expect(EXPERIENCE_LAB_ICON_EXTRACTION_SOURCE_SHA256).toBe(STUDIO_WORLD_ICON_SOURCES.unlabeledTwin.checksum);
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      const file = resolve(V5_DIR, iconFilename(name));
      expect(existsSync(file), `${name} v5`).toBe(true);
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

  it('maps all semantic keys to v5 runtime assets', () => {
    expect(EXPERIENCE_LAB_ICON_EXTRACTION_VERSION).toBe('studio-world-icons-v5-source-twin');
    expect(EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN).toBe(true);
    expect(EXPERIENCE_LAB_ICON_V3_PIPELINE_RETIRED).toBe(true);
    expect(EXPERIENCE_LAB_ICON_V4_PIPELINE_RETIRED).toBe(true);
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.mode).toBe('source-twin-grid-v5');
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.generatedDir).toContain('generated-v5');
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      const asset = resolveProductionExperienceLabIconAsset(name);
      expect(asset.src, name).toBeTruthy();
      expect(asset.source).toBe('v5-source-twin');
      expect(EXPERIENCE_LAB_ICON_ASSETS[name].sourceRole).toBe('pixel-preserving-unlabeled-twin');
    }
  });

  it('deprecated unlabeled source exists but is not production extraction path', () => {
    expect(existsSync(DEPRECATED)).toBe(true);
    expect(STUDIO_WORLD_ICON_SOURCES.deprecatedGeneratedUnlabeled.role).toBe('historical-only');
    expect(readFileSync(ASSETS_TS, 'utf8')).not.toContain('studio-world-icon-source-unlabeled.png');
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

  it('QA route uses v5 source-twin columns', () => {
    const qa = readFileSync(resolve(ROOT, 'src/pages/admin/studio/experience-lab-icon-qa/page.tsx'), 'utf8');
    expect(qa).toContain('v5 source twin');
    expect(qa).toContain('Source Twin Pass');
    expect(qa).toContain('generated-v5');
    expect(qa).not.toContain('v4 unlabeled source');
  });

  it('prebuild uses twin creation and v5 generator', () => {
    const pkg = readFileSync(resolve(ROOT, 'package.json'), 'utf8');
    expect(pkg).toContain('create-studio-world-unlabeled-source-twin.mjs');
    expect(pkg).toContain('generate-studio-world-icons-from-source-twin.mjs');
    expect(pkg).not.toContain('generate-studio-world-icons-from-unlabeled-source.mjs');
  });

  it('unknown semantic keys fail safely', () => {
    expect(isExperienceLabIconName('notReal')).toBe(false);
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      expect(EXPERIENCE_LAB_ICON_REGISTRY[name].row).toBeGreaterThanOrEqual(0);
    }
  });
});
