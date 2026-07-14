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
  EXPERIENCE_LAB_ICON_LABELED_CATALOG_SHA256,
  EXPERIENCE_LAB_ICON_EXTRACTION_SOURCE_SHA256,
} from './experience-lab-icon-assets.generated';
import {
  STUDIO_WORLD_ICON_SOURCES,
  STUDIO_WORLD_ICON_FORBIDDEN_EXTRACTION_PATH,
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
const V4_DIR = resolve(ROOT, 'src/assets/studio-world/experience-lab/icons/generated-v4');
const COMPONENT = resolve(ICONS_DIR, 'ExperienceLabIcon.tsx');
const V2_SHELL = resolve(ICONS_DIR, '../experience-lab-v2/ExperienceLabV2Shell.tsx');
const LEGACY_PAGE = resolve(ROOT, 'src/pages/admin/studio/experience-lab/page.tsx');
const GENERATOR = resolve(ROOT, 'scripts/generate-studio-world-icons-from-unlabeled-source.mjs');

function iconFilename(key: string) {
  return `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}.png`;
}

async function sha256File(path: string) {
  const { createHash } = await import('node:crypto');
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

describe('Experience Lab icon system v4 (unlabeled grid)', () => {
  it('preserves labeled catalog and unlabeled source unchanged', async () => {
    expect(existsSync(LABELED)).toBe(true);
    expect(existsSync(UNLABELED)).toBe(true);
    expect(await sha256File(LABELED)).toBe(STUDIO_WORLD_ICON_SOURCES.labeledCatalog.checksum);
    expect(await sha256File(UNLABELED)).toBe(STUDIO_WORLD_ICON_SOURCES.unlabeledSource.checksum);
    expect(EXPERIENCE_LAB_ICON_LABELED_CATALOG_SHA256).toBe(STUDIO_WORLD_ICON_SOURCES.labeledCatalog.checksum);
    expect(EXPERIENCE_LAB_ICON_EXTRACTION_SOURCE_SHA256).toBe(STUDIO_WORLD_ICON_SOURCES.unlabeledSource.checksum);
  });

  it('records matching source-pair dimensions and 64 registry entries', () => {
    expect(STUDIO_WORLD_ICON_SOURCES.labeledCatalog.width).toBe(
      STUDIO_WORLD_ICON_SOURCES.unlabeledSource.width,
    );
    expect(STUDIO_WORLD_ICON_SOURCES.labeledCatalog.height).toBe(
      STUDIO_WORLD_ICON_SOURCES.unlabeledSource.height,
    );
    expect(STUDIO_WORLD_ICON_SOURCES.labeledCatalog.rows).toBe(
      STUDIO_WORLD_ICON_SOURCES.unlabeledSource.rows,
    );
    expect(STUDIO_WORLD_ICON_SOURCES.labeledCatalog.columns).toBe(
      STUDIO_WORLD_ICON_SOURCES.unlabeledSource.columns,
    );
    expect(EXPERIENCE_LAB_ICON_NAMES).toHaveLength(64);
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      expect(EXPERIENCE_LAB_ICON_REGISTRY[name].row).toBeGreaterThanOrEqual(0);
      expect(EXPERIENCE_LAB_ICON_REGISTRY[name].column).toBeGreaterThanOrEqual(0);
    }
  });

  it('canonical generator reads only unlabeled source; no text-removal in production path', () => {
    const gen = readFileSync(GENERATOR, 'utf8');
    expect(gen).toContain('studio-world-icon-source-unlabeled.png');
    expect(gen).not.toContain('label-band');
    expect(gen).not.toContain('labelExclusionY');
    expect(gen).not.toContain('glyph-versus-label');
    expect(EXPERIENCE_LAB_ICON_SOURCE_ROLE).toBe('unlabeled-production-source');
    expect(STUDIO_WORLD_ICON_FORBIDDEN_EXTRACTION_PATH).toBe(STUDIO_WORLD_ICON_SOURCES.labeledCatalog.path);
  });

  it('generates v4 PNGs with transparency and nonblank content', async () => {
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      const file = resolve(V4_DIR, iconFilename(name));
      expect(existsSync(file), `${name} v4`).toBe(true);
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

  it('maps all semantic keys to v4 runtime assets', () => {
    expect(EXPERIENCE_LAB_ICON_EXTRACTION_VERSION).toBe('studio-world-icons-v4-unlabeled-source');
    expect(EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN).toBe(true);
    expect(EXPERIENCE_LAB_ICON_V3_PIPELINE_RETIRED).toBe(true);
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.mode).toBe('unlabeled-grid-v4');
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.generatedDir).toContain('generated-v4');
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      const asset = resolveProductionExperienceLabIconAsset(name);
      expect(asset.src, name).toBeTruthy();
      expect(asset.source).toBe('v4-unlabeled');
      expect(EXPERIENCE_LAB_ICON_ASSETS[name].sourceRole).toBe('unlabeled-production-source');
    }
  });

  it('optical tuning paused; lockdown not certified until founder QA', () => {
    expect(FOUNDER_OPTICAL_MODE_PAUSED).toBe(true);
    expect(EXPERIENCE_LAB_ICON_OPTICAL_TUNING_PAUSED).toBe(true);
    expect(EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED).toBe(false);
  });

  it('ExperienceLabIcon uses presentation layer without CSS sprites', () => {
    const src = readFileSync(COMPONENT, 'utf8');
    expect(src).toContain('ExperienceLabIconPresentation');
    expect(src).not.toContain('backgroundPosition');
    expect(isExperienceLabIconName('blueprint')).toBe(true);
    expect(isExperienceLabIconName('not-an-icon')).toBe(false);
  });

  it('Experience Lab V2 uses ExperienceLabIcon; legacy route and orb unchanged', () => {
    const cmd = readFileSync(resolve(ICONS_DIR, '../experience-lab-v2/ExperienceLabCommandDock.tsx'), 'utf8');
    const viewport = readFileSync(resolve(ICONS_DIR, '../experience-lab-v2/StudioViewport.tsx'), 'utf8');
    const workbench = readFileSync(resolve(ICONS_DIR, '../experience-lab-v2/ExperienceLabFounderWorkbench.tsx'), 'utf8');
    expect(cmd).toContain('ExperienceLabIcon');
    expect(viewport).toContain('ExperienceLabIcon');
    expect(workbench).toContain('ExperienceLabIcon');
    expect(readFileSync(LEGACY_PAGE, 'utf8')).not.toContain('ExperienceLabIcon');
    expect(readFileSync(V2_SHELL, 'utf8')).toContain('ExperienceLabV2Shell');
    expect(workbench).toMatch(/orb|Orb/);
  });

  it('QA route uses v4 source-pair columns', () => {
    const qa = readFileSync(resolve(ROOT, 'src/pages/admin/studio/experience-lab-icon-qa/page.tsx'), 'utf8');
    const appRoutes = readFileSync(resolve(ROOT, 'src/App.tsx'), 'utf8');
    expect(appRoutes).toContain('studio/experience-lab-icon-qa');
    expect(qa).toContain('v4 unlabeled source');
    expect(qa).toContain('Source Pair Pass');
    expect(qa).toContain('generated-v4');
    expect(qa).not.toContain('v3 deterministic crop QA');
  });

  it('prebuild uses unlabeled generator only', () => {
    const pkg = readFileSync(resolve(ROOT, 'package.json'), 'utf8');
    expect(pkg).toContain('generate-studio-world-icons-from-unlabeled-source.mjs');
    expect(pkg).not.toContain('generate-studio-world-icons-from-crops.mjs');
  });

  it('unknown semantic keys fail safely', () => {
    expect(isExperienceLabIconName('notReal')).toBe(false);
    const asset = resolveProductionExperienceLabIconAsset('blueprint');
    expect(asset.src).toBeTruthy();
  });
});
