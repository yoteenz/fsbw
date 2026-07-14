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
import {
  EXPERIENCE_LAB_ICON_SPRITE_CONFIG,
} from './experience-lab-icon-sprite.config';
import {
  EXPERIENCE_LAB_ICON_ASSETS,
  EXPERIENCE_LAB_ICON_EXTRACTION_VERSION,
  EXPERIENCE_LAB_ICON_BUNDLE_SHA256,
  EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED,
  EXPERIENCE_LAB_ICON_OPTICAL_LOCK_VERSION,
} from './experience-lab-icon-assets.generated';
import { resolveExperienceLabIconOpticalScale, resolveExperienceLabIconOpticalProfile, EXPERIENCE_LAB_ICON_OPTICAL_PROFILE } from './experience-lab-icon-optical-profile';
import {
  EXPERIENCE_LAB_ICON_EXTRACTION_OVERRIDES,
  EXPERIENCE_LAB_ICON_FOUNDER_REPORTED_KEYS,
} from '../../../../scripts/config/experience-lab-icon-extraction-overrides';

const ICONS_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(ICONS_DIR, '../../../..');
const SOURCE = resolve(ROOT, 'src/assets/studio-world/experience-lab/experience-lab-icon-source-labeled.png');
const GENERATED_DIR = resolve(ROOT, 'src/assets/studio-world/experience-lab/icons/generated');
const COMPONENT = resolve(ICONS_DIR, 'ExperienceLabIcon.tsx');
const METADATA = resolve(ICONS_DIR, 'experience-lab-icon-extraction-metadata.generated.json');
const OVERRIDES_MJS = resolve(ROOT, 'scripts/experience-lab-icon-extraction-overrides.mjs');
const V2_SHELL = resolve(ICONS_DIR, '../experience-lab-v2/ExperienceLabV2Shell.tsx');
const LEGACY_PAGE = resolve(ROOT, 'src/pages/admin/studio/experience-lab/page.tsx');
const FIDELITY_DOC = resolve(ROOT, 'docs/studio-os/design-system/EXPERIENCE_LAB_ICON_FIDELITY_REPAIR.md');
const LOCKDOWN_DOC = resolve(ROOT, 'docs/studio-os/design-system/EXPERIENCE_LAB_ICON_SYSTEM_LOCKDOWN.md');
const FAILURE_MANIFEST = resolve(GENERATED_DIR, '_failure-manifest.json');
const OPTICAL_PROFILE = resolve(ICONS_DIR, 'experience-lab-icon-optical-profile.ts');

function iconFilename(key: string) {
  return `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}.png`;
}

function countBottomBandOpaque(file: string) {
  return sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
      const bottomStart = Math.floor(info.height * 0.78);
      let total = 0;
      let bottom = 0;
      for (let y = 0; y < info.height; y += 1) {
        for (let x = 0; x < info.width; x += 1) {
          const a = data[(y * info.width + x) * info.channels + 3];
          if (a > 20) {
            total += 1;
            if (y >= bottomStart) bottom += 1;
          }
        }
      }
      return { total, bottom, ratio: bottom / Math.max(1, total) };
    });
}

describe('Experience Lab extracted icon system v2', () => {
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

  it('excludes printed-label safe-zone from founder-reported icons', async () => {
    for (const name of EXPERIENCE_LAB_ICON_FOUNDER_REPORTED_KEYS) {
      const file = resolve(GENERATED_DIR, iconFilename(name));
      const band = await countBottomBandOpaque(file);
      expect(band.ratio, `${name} label band`).toBeLessThan(0.05);
    }
  });

  it('founder-reported icons pass text-contamination and audit checks', () => {
    const metadata = JSON.parse(readFileSync(METADATA, 'utf8')) as {
      icons: Array<{
        key: string;
        auditStatus: string;
        textContamination: { contaminated: boolean };
      }>;
    };
    for (const name of EXPERIENCE_LAB_ICON_FOUNDER_REPORTED_KEYS) {
      const item = metadata.icons.find((i) => i.key === name);
      expect(item, name).toBeTruthy();
      expect(item!.textContamination.contaminated, name).toBe(false);
      expect(['PASS']).toContain(item!.auditStatus);
      expect(EXPERIENCE_LAB_ICON_ASSETS[name].auditStatus).not.toBe('FAIL');
    }
  });

  it('glyphs stay inset from output edges and all 64 icons pass lockdown audit', () => {
    const metadata = JSON.parse(readFileSync(METADATA, 'utf8')) as {
      lockdownCertified?: boolean;
      auditPass?: number;
      auditWarn?: number;
      auditFail?: number;
      icons: Array<{ key: string; confidence: number; edgePixels: number; glyphPixels: number; auditStatus: string; lockdownCertified?: boolean }>;
    };
    expect(metadata.icons).toHaveLength(64);
    let pass = 0;
    let warn = 0;
    let fail = 0;
    for (const item of metadata.icons) {
      expect(item.confidence).toBeGreaterThanOrEqual(0.55);
      expect(item.edgePixels / Math.max(1, item.glyphPixels)).toBeLessThan(0.12);
      expect(item.auditStatus).toBe('PASS');
      if (item.auditStatus === 'PASS') pass += 1;
      if (item.auditStatus === 'WARN') warn += 1;
      if (item.auditStatus === 'FAIL') fail += 1;
      expect(EXPERIENCE_LAB_ICON_ASSETS[item.key as keyof typeof EXPERIENCE_LAB_ICON_ASSETS].auditStatus).toBe('PASS');
    }
    expect(pass).toBe(64);
    expect(warn).toBe(0);
    expect(fail).toBe(0);
    expect(metadata.lockdownCertified).toBe(true);
    expect(EXPERIENCE_LAB_ICON_LOCKDOWN_CERTIFIED).toBe(true);
  });

  it('registers per-icon overrides centrally and keeps them in source cells', () => {
    expect(Object.keys(EXPERIENCE_LAB_ICON_EXTRACTION_OVERRIDES).length).toBeGreaterThanOrEqual(9);
    expect(existsSync(OVERRIDES_MJS)).toBe(true);
    for (const [key, override] of Object.entries(EXPERIENCE_LAB_ICON_EXTRACTION_OVERRIDES)) {
      expect(isExperienceLabIconName(key)).toBe(true);
      const entry = EXPERIENCE_LAB_ICON_REGISTRY[key as keyof typeof EXPERIENCE_LAB_ICON_REGISTRY];
      if (override.sourceRow != null) expect(override.sourceRow).toBe(entry.row);
      if (override.sourceColumn != null) expect(override.sourceColumn).toBe(entry.column);
      if (override.glyphRight != null) {
        const cellW = Math.round(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.sourceWidth / 8);
        expect(override.glyphRight).toBeLessThan(cellW);
      }
    }
  });

  it('optical profiles certify all icons with centering and scale tuning', () => {
    expect(existsSync(OPTICAL_PROFILE)).toBe(true);
    expect(Object.keys(EXPERIENCE_LAB_ICON_OPTICAL_PROFILE)).toHaveLength(64);
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      const profile = resolveExperienceLabIconOpticalProfile(name);
      expect(profile.scale).toBeGreaterThanOrEqual(0.9);
      expect(profile.scale).toBeLessThanOrEqual(1.2);
      expect(profile.opticalScore).toBeGreaterThanOrEqual(0.82);
      expect(profile.certified).toBe(true);
      expect(Math.abs(profile.translateX)).toBeLessThanOrEqual(4);
      expect(Math.abs(profile.translateY)).toBeLessThanOrEqual(4);
    }
    expect(EXPERIENCE_LAB_ICON_OPTICAL_LOCK_VERSION).toBe('experience-lab-icons-v2-locked');
  });

  it('manifest version and bundle hash change after v2 regeneration', () => {
    expect(EXPERIENCE_LAB_ICON_EXTRACTION_VERSION).toBe('experience-lab-icons-v2');
    expect(EXPERIENCE_LAB_ICON_BUNDLE_SHA256).toMatch(/^[a-f0-9]{64}$/);
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.extractionVersion).toBe('experience-lab-icons-v2');
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.bundleSha256).toBe(EXPERIENCE_LAB_ICON_BUNDLE_SHA256);
  });

  it('ExperienceLabIcon renders img assets (not CSS sprite crops)', () => {
    const src = readFileSync(COMPONENT, 'utf8');
    expect(src).toContain('ExperienceLabIconPresentation');
    expect(src).not.toContain('EXPERIENCE_LAB_ICON_ASSETS[name].src');
    expect(src).not.toContain('backgroundPosition');
    expect(src).not.toContain('EXPERIENCE_LAB_ICON_RUNTIME_MAP');
    expect(isExperienceLabIconName('blueprint')).toBe(true);
    expect(isExperienceLabIconName('not-an-icon')).toBe(false);
    expect(src).toContain('elab-icon--missing');
  });

  it('supports size tokens, a11y, active glow, and optical scale', () => {
    const src = readFileSync(COMPONENT, 'utf8');
    const presentation = readFileSync(resolve(ICONS_DIR, 'ExperienceLabIconPresentation.tsx'), 'utf8');
    const presenter = readFileSync(resolve(ICONS_DIR, 'experience-lab-icon-presenter.ts'), 'utf8');
    const css = readFileSync(resolve(ICONS_DIR, 'experience-lab-icon.css'), 'utf8');
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl']) {
      expect(presenter).toContain(size);
    }
    expect(src).toContain('ExperienceLabIconPresentation');
    expect(presentation).toContain('presentExperienceLabIcon');
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

  it('forensic docs, lockdown certification, and QA route exist', () => {
    expect(existsSync(resolve(GENERATED_DIR, '_contact-sheet.png'))).toBe(true);
    expect(existsSync(resolve(ROOT, 'docs/studio-os/design-system/EXPERIENCE_LAB_EXTRACTED_ICON_QA.md'))).toBe(true);
    expect(existsSync(FIDELITY_DOC)).toBe(true);
    expect(existsSync(LOCKDOWN_DOC)).toBe(true);
    expect(existsSync(FAILURE_MANIFEST)).toBe(true);
    const qa = readFileSync(resolve(ROOT, 'src/pages/admin/studio/experience-lab-icon-qa/page.tsx'), 'utf8');
    const appRoutes = readFileSync(resolve(ROOT, 'src/App.tsx'), 'utf8');
    expect(appRoutes).toContain('studio/experience-lab-icon-qa');
    expect(appRoutes).toContain('AdminStudioExperienceLabIconQa');
    expect(qa).toContain('Founder Reported');
    expect(qa).toContain('Text Contamination');
    expect(qa).toContain('FounderOpticalTuner');
    expect(qa).toContain('scores.overall');
  });

  it('metadata records connected-component audit fields for every icon', () => {
    const metadata = JSON.parse(readFileSync(METADATA, 'utf8')) as {
      version: string;
      icons: Array<{
        key: string;
        textContamination: { score: number; bottomRatio: number };
        sourceBounds: { minX: number; minY: number; maxX: number; maxY: number };
      }>;
    };
    expect(metadata.version).toBe('experience-lab-icons-v2-locked');
    for (const item of metadata.icons) {
      expect(item.textContamination.score).toBeGreaterThanOrEqual(0);
      expect(item.sourceBounds.maxY).toBeGreaterThanOrEqual(item.sourceBounds.minY);
      expect(item.sourceBounds.maxX).toBeGreaterThanOrEqual(item.sourceBounds.minX);
    }
  });
});
