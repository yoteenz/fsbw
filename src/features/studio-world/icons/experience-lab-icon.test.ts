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
  EXPERIENCE_LAB_ICON_EXTRACTION_VERSION,
  EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED,
  EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN,
} from './experience-lab-icon-assets.generated';
import { StudioWorldIconCropManifest, STUDIO_WORLD_ICON_SOURCE } from './studio-world-icon-crop-manifest';
import { FOUNDER_OPTICAL_MODE_PAUSED } from './experience-lab-icon-presenter';
import { resolveProductionExperienceLabIconAsset } from './experience-lab-icon-asset-resolver';

const ICONS_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(ICONS_DIR, '../../../..');
const SOURCE = resolve(ROOT, 'src/assets/studio-world/experience-lab/experience-lab-icon-source-labeled.png');
const V3_PREVIEW_DIR = resolve(ROOT, 'src/assets/studio-world/experience-lab/icons/generated-v3/_preview-unapproved');
const COMPONENT = resolve(ICONS_DIR, 'ExperienceLabIcon.tsx');
const V2_SHELL = resolve(ICONS_DIR, '../experience-lab-v2/ExperienceLabV2Shell.tsx');
const LEGACY_PAGE = resolve(ROOT, 'src/pages/admin/studio/experience-lab/page.tsx');

function iconFilename(key: string) {
  return `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}.png`;
}

describe('Experience Lab icon system v3 (deterministic crops)', () => {
  it('preserves the original labeled source sheet unchanged', () => {
    expect(existsSync(SOURCE)).toBe(true);
    const hash = readFileSync(
      resolve(ROOT, 'src/features/studio-world/icons/experience-lab-icon-source.sha256'),
      'utf8',
    ).trim();
    expect(STUDIO_WORLD_ICON_SOURCE.sha256).toBe(hash);
  });

  it('maps 64 icons in crop manifest with explicit coordinates', () => {
    expect(EXPERIENCE_LAB_ICON_NAMES).toHaveLength(64);
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      const crop = StudioWorldIconCropManifest[name];
      expect(crop.cropWidth).toBeGreaterThan(0);
      expect(crop.cropHeight).toBeGreaterThan(0);
      expect(crop.sourceLabel).toBe(EXPERIENCE_LAB_ICON_REGISTRY[name].sourceLabel);
    }
  });

  it('generates v3 preview PNGs with transparency (not blank)', async () => {
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      const file = resolve(V3_PREVIEW_DIR, iconFilename(name));
      expect(existsSync(file), `${name} preview`).toBe(true);
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

  it('v2 pipeline frozen; production fail-closed until crops approved', () => {
    expect(EXPERIENCE_LAB_ICON_V2_PIPELINE_FROZEN).toBe(true);
    expect(EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED).toBe(false);
    expect(EXPERIENCE_LAB_ICON_EXTRACTION_VERSION).toBe('studio-world-icons-v3');
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      const asset = resolveProductionExperienceLabIconAsset(name);
      expect(asset.src).toBeNull();
      expect(asset.approved).toBe(false);
    }
  });

  it('optical tuning paused', () => {
    expect(FOUNDER_OPTICAL_MODE_PAUSED).toBe(true);
  });

  it('ExperienceLabIcon uses presentation layer with missing fallback', () => {
    const src = readFileSync(COMPONENT, 'utf8');
    expect(src).toContain('ExperienceLabIconPresentation');
    expect(src).not.toContain('backgroundPosition');
    expect(src).toContain('elab-icon--missing');
    expect(isExperienceLabIconName('blueprint')).toBe(true);
    expect(isExperienceLabIconName('not-an-icon')).toBe(false);
  });

  it('sprite config points at v3 deterministic mode', () => {
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.mode).toBe('deterministic-crop-v3');
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.lockdownCertified).toBe(false);
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.v2PipelineFrozen).toBe(true);
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.generatedDir).toContain('generated-v3');
  });

  it('Experience Lab V2 uses ExperienceLabIcon; legacy route unchanged', () => {
    const cmd = readFileSync(resolve(ICONS_DIR, '../experience-lab-v2/ExperienceLabCommandDock.tsx'), 'utf8');
    const viewport = readFileSync(resolve(ICONS_DIR, '../experience-lab-v2/StudioViewport.tsx'), 'utf8');
    const workbench = readFileSync(resolve(ICONS_DIR, '../experience-lab-v2/ExperienceLabFounderWorkbench.tsx'), 'utf8');
    expect(cmd).toContain('ExperienceLabIcon');
    expect(viewport).toContain('ExperienceLabIcon');
    expect(workbench).toContain('ExperienceLabIcon');
    expect(readFileSync(LEGACY_PAGE, 'utf8')).not.toContain('ExperienceLabIcon');
    expect(readFileSync(V2_SHELL, 'utf8')).toContain('ExperienceLabV2Shell');
  });

  it('QA and crop editor routes exist', () => {
    const qa = readFileSync(resolve(ROOT, 'src/pages/admin/studio/experience-lab-icon-qa/page.tsx'), 'utf8');
    const editor = readFileSync(resolve(ROOT, 'src/pages/admin/studio/experience-lab-icon-crop-editor/page.tsx'), 'utf8');
    const appRoutes = readFileSync(resolve(ROOT, 'src/App.tsx'), 'utf8');
    expect(appRoutes).toContain('studio/experience-lab-icon-qa');
    expect(appRoutes).toContain('studio/experience-lab-icon-crop-editor');
    expect(qa).toContain('v3');
    expect(qa).toContain('optical paused');
    expect(editor).toContain('Crop Editor');
  });
});
