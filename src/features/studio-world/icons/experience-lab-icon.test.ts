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
import { EXPERIENCE_LAB_ICON_RUNTIME_MAP } from './experience-lab-icon-runtime-map.generated';

const ICONS_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(ICONS_DIR, '../../../..');
const SOURCE = resolve(ROOT, 'src/assets/studio-world/experience-lab/experience-lab-icon-source-labeled.png');
const ATLAS = resolve(ROOT, 'src/assets/studio-world/experience-lab/experience-lab-icon-runtime-atlas.png');
const COMPONENT = resolve(ICONS_DIR, 'ExperienceLabIcon.tsx');
const V2_SHELL = resolve(ICONS_DIR, '../experience-lab-v2/ExperienceLabV2Shell.tsx');
const LEGACY_PAGE = resolve(ROOT, 'src/pages/admin/studio/experience-lab/page.tsx');

describe('Experience Lab labeled icon sprite system', () => {
  let sourceHashBefore: string;

  beforeAll(() => {
    sourceHashBefore = readFileSync(SOURCE).toString('hex').slice(0, 16);
    execSync('node scripts/build-experience-lab-icon-atlas.mjs', { cwd: ROOT, stdio: 'pipe' });
  });

  it('stores the original labeled source sheet unchanged at the canonical path', () => {
    expect(existsSync(SOURCE)).toBe(true);
    const after = readFileSync(SOURCE).toString('hex').slice(0, 16);
    expect(after).toBe(sourceHashBefore);
  });

  it('semantic registry includes exact written source labels for all 64 icons', () => {
    expect(EXPERIENCE_LAB_ICON_NAMES).toHaveLength(64);
    expect(EXPERIENCE_LAB_ICON_REGISTRY.blueprint.sourceLabel).toBe('BLUEPRINT');
    expect(EXPERIENCE_LAB_ICON_REGISTRY.founderRender.sourceLabel).toBe('FOUNDER RENDER');
    expect(EXPERIENCE_LAB_ICON_REGISTRY.cloudSync.sourceLabel).toBe('CLOUD SYNC');
    expect(EXPERIENCE_LAB_ICON_REGISTRY.timeTracking.sourceLabel).toBe('TIME TRACKING');
  });

  it('every mapped icon has valid row/column inside the 8x8 grid', () => {
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      const entry = EXPERIENCE_LAB_ICON_REGISTRY[name];
      expect(entry.row).toBeGreaterThanOrEqual(0);
      expect(entry.row).toBeLessThan(8);
      expect(entry.column).toBeGreaterThanOrEqual(0);
      expect(entry.column).toBeLessThan(8);
    }
  });

  it('measured sprite config matches the labeled source dimensions', () => {
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.sourceWidth).toBe(1402);
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.sourceHeight).toBe(1122);
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.rows).toBe(8);
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.columns).toBe(8);
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.iconCount).toBe(64);
    expect(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.sourceStoragePath).toContain('740E9EB1-6B7B-4C5F-B745-E4621EC45EF3.png');
  });

  it('runtime atlas generation succeeds and preserves white glyph pixels', async () => {
    expect(existsSync(ATLAS)).toBe(true);
    const meta = await sharp(ATLAS).metadata();
    expect(meta.width).toBe(768);
    expect(meta.height).toBe(768);
    expect(meta.hasAlpha).toBe(true);

    const { data, info } = await sharp(ATLAS).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let white = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      if (data[i + 3] > 0 && data[i] > 200) white += 1;
    }
    expect(white).toBeGreaterThan(1000);
  });

  it('runtime atlas excludes baked label regions from source cells', () => {
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      const coord = EXPERIENCE_LAB_ICON_RUNTIME_MAP[name];
      expect(coord.labelStartInCell).toBeGreaterThan(40);
      expect(coord.labelStartInCell).toBeLessThan(EXPERIENCE_LAB_ICON_SPRITE_CONFIG.cellHeight);
    }
  });

  it('ExperienceLabIcon resolves semantic names and fails safely for unknown names', () => {
    const src = readFileSync(COMPONENT, 'utf8');
    expect(isExperienceLabIconName('blueprint')).toBe(true);
    expect(isExperienceLabIconName('not-an-icon')).toBe(false);
    expect(src).toContain('isExperienceLabIconName(name)');
    expect(src).toContain('elab-icon--missing');
    expect(EXPERIENCE_LAB_ICON_RUNTIME_MAP.blueprint.sourceLabel).toBe('BLUEPRINT');
  });

  it('supports required size tokens xs through xl', () => {
    const src = readFileSync(COMPONENT, 'utf8');
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl']) {
      expect(src).toContain(size);
    }
  });

  it('decorative icons are aria-hidden; interactive icons receive accessible labels', () => {
    const src = readFileSync(COMPONENT, 'utf8');
    expect(src).toContain('aria-hidden={decorative ? true : undefined}');
    expect(src).toContain('aria-label={decorative ? undefined : resolveAccessibleName');
  });

  it('active treatment uses non-destructive glow classes', () => {
    const css = readFileSync(resolve(ICONS_DIR, 'experience-lab-icon.css'), 'utf8');
    expect(css).toContain('drop-shadow');
    expect(css).not.toContain('filter: invert');
  });

  it('Experience Lab V2 uses ExperienceLabIcon in workstation surfaces', () => {
    const cmd = readFileSync(resolve(ICONS_DIR, '../experience-lab-v2/ExperienceLabCommandDock.tsx'), 'utf8');
    const viewport = readFileSync(resolve(ICONS_DIR, '../experience-lab-v2/StudioViewport.tsx'), 'utf8');
    const workbench = readFileSync(resolve(ICONS_DIR, '../experience-lab-v2/ExperienceLabFounderWorkbench.tsx'), 'utf8');
    expect(cmd).toContain('ExperienceLabIcon');
    expect(viewport).toContain('ExperienceLabIcon');
    expect(workbench).toContain('ExperienceLabIcon');
  });

  it('legacy Experience Lab route remains unchanged', () => {
    const legacy = readFileSync(LEGACY_PAGE, 'utf8');
    expect(legacy).not.toContain('ExperienceLabIcon');
  });

  it('V2 shell still references legacy-free immersive composition', () => {
    const shell = readFileSync(V2_SHELL, 'utf8');
    expect(shell).toContain('ExperienceLabV2Shell');
    expect(shell).not.toContain('/admin/studio/experience-lab"');
  });
});
