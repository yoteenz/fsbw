import { describe, expect, it, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import sharp from 'sharp';
import {
  EXPERIENCE_LAB_ICON_NAMES,
  EXPERIENCE_LAB_ICON_REGISTRY,
  isExperienceLabIconName,
} from './experience-lab-icon-registry';
import { EXPERIENCE_LAB_ICON_SPRITE_CONFIG } from './experience-lab-icon-sprite.config';
import { EXPERIENCE_LAB_ICON_ASSETS } from './experience-lab-icon-assets.generated';
import { resolveExperienceLabIconOpticalScale } from './experience-lab-icon-optical-scale';

const ICONS_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(ICONS_DIR, '../../../..');
const SOURCE = resolve(ROOT, 'src/assets/studio-world/experience-lab/experience-lab-icon-source-labeled.png');
const GENERATED_DIR = resolve(ROOT, 'src/assets/studio-world/experience-lab/icons/generated');
const COMPONENT = resolve(ICONS_DIR, 'ExperienceLabIcon.tsx');
const METADATA = resolve(ICONS_DIR, 'experience-lab-icon-extraction-metadata.generated.json');
const V2_SHELL = resolve(ICONS_DIR, '../experience-lab-v2/ExperienceLabV2Shell.tsx');
const LEGACY_PAGE = resolve(ROOT, 'src/pages/admin/studio/experience-lab/page.tsx');

const AUDIT_ICONS = [
  'experienceLab',
  'blueprint',
  'construction',
  'materials',
  'lighting',
  'camera',
  'attachments',
  'analytics',
  'team',
  'permissions',
  'dashboard',
  'diagnostics',
] as const;

function iconFilename(key: string) {
  return `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}.png`;
}

describe('Experience Lab extracted icon system', () => {
  let sourceHashBefore: string;

  beforeAll(() => {
    sourceHashBefore = readFileSync(SOURCE).toString('hex').slice(0, 16);
    execSync('node scripts/extract-experience-lab-icons.mjs', { cwd: ROOT, stdio: 'pipe' });
  });

  it('preserves the original labeled source sheet unchanged', () => {
    expect(existsSync(SOURCE)).toBe(true);
    const after = readFileSync(SOURCE).toString('hex').slice(0, 16);
    expect(after).toBe(sourceHashBefore);
  });

  it('maps every semantic icon to one generated transparent PNG', () => {
    expect(EXPERIENCE_LAB_ICON_NAMES).toHaveLength(64);
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      const file = resolve(GENERATED_DIR, iconFilename(name));
      expect(existsSync(file), `${name} missing ${file}`).toBe(true);
      expect(EXPERIENCE_LAB_ICON_ASSETS[name].src).toBeTruthy();
      expect(EXPERIENCE_LAB_ICON_ASSETS[name].sourceLabel).toBe(
        EXPERIENCE_LAB_ICON_REGISTRY[name].sourceLabel,
      );
    }
  });

  it('generated PNGs have alpha, line pixels, and are not blank', async () => {
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      const file = resolve(GENERATED_DIR, iconFilename(name));
      const meta = await sharp(file).metadata();
      expect(meta.hasAlpha).toBe(true);
      expect(meta.width).toBe(256);
      expect(meta.height).toBe(256);

      const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let opaque = 0;
      let whiteLine = 0;
      let blackOpaque = 0;
      for (let i = 0; i < data.length; i += info.channels) {
        const a = data[i + 3];
        if (a === 0) continue;
        opaque += 1;
        if (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200) whiteLine += 1;
        if (data[i] < 20 && data[i + 1] < 20 && data[i + 2] < 20 && a > 200) blackOpaque += 1;
      }
      expect(opaque, `${name} blank`).toBeGreaterThan(48);
      expect(whiteLine, `${name} no line art`).toBeGreaterThan(40);
      expect(blackOpaque, `${name} black baked`).toBe(0);
    }
  });

  it('glyphs stay inset from output edges and extraction confidence passes', () => {
    const metadata = JSON.parse(readFileSync(METADATA, 'utf8')) as {
      icons: Array<{ key: string; confidence: number; edgePixels: number; glyphPixels: number }>;
    };
    expect(metadata.icons).toHaveLength(64);
    for (const item of metadata.icons) {
      expect(item.confidence).toBeGreaterThanOrEqual(0.55);
      expect(item.edgePixels / Math.max(1, item.glyphPixels)).toBeLessThan(0.12);
    }
  });

  it('audit icons match registry labels and have assets', () => {
    for (const name of AUDIT_ICONS) {
      expect(isExperienceLabIconName(name)).toBe(true);
      expect(EXPERIENCE_LAB_ICON_ASSETS[name].confidence).toBeGreaterThanOrEqual(0.55);
    }
  });

  it('ExperienceLabIcon renders img assets (not CSS sprite crops)', () => {
    const src = readFileSync(COMPONENT, 'utf8');
    expect(src).toContain('EXPERIENCE_LAB_ICON_ASSETS');
    expect(src).toContain('<img');
    expect(src).not.toContain('backgroundPosition');
    expect(src).not.toContain('EXPERIENCE_LAB_ICON_RUNTIME_MAP');
    expect(isExperienceLabIconName('blueprint')).toBe(true);
    expect(isExperienceLabIconName('not-an-icon')).toBe(false);
    expect(src).toContain('elab-icon--missing');
  });

  it('supports size tokens, a11y, active glow, and optical scale', () => {
    const src = readFileSync(COMPONENT, 'utf8');
    const css = readFileSync(resolve(ICONS_DIR, 'experience-lab-icon.css'), 'utf8');
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl']) {
      expect(src).toContain(size);
    }
    expect(src).toContain('resolveExperienceLabIconOpticalScale');
    expect(resolveExperienceLabIconOpticalScale('blueprint')).toBeGreaterThan(1);
    expect(css).toContain('drop-shadow');
    expect(css).not.toContain('crisp-edges');
    expect(css).toContain('object-fit: contain');
  });

  it('extraction config uses extracted-transparent-png mode at 256px canvas', () => {
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.mode).toBe('extracted-transparent-png');
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.outputCanvas).toBe(256);
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.iconCount).toBe(64);
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.sourceWidth).toBe(1402);
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

  it('contact sheet and QA doc exist for visual comparison', () => {
    expect(existsSync(resolve(GENERATED_DIR, '_contact-sheet.png'))).toBe(true);
    expect(
      existsSync(resolve(ROOT, 'docs/studio-os/design-system/EXPERIENCE_LAB_EXTRACTED_ICON_QA.md')),
    ).toBe(true);
    expect(existsSync(resolve(ROOT, 'src/pages/admin/studio/experience-lab-icon-qa/page.tsx'))).toBe(true);
  });
});
