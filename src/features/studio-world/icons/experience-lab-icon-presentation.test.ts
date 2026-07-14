import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXPERIENCE_LAB_ICON_NAMES } from './experience-lab-icon-registry';
import {
  ExperienceLabIconPresentationSystem,
  StudioWorldIconPresentationRegistry,
  STUDIO_WORLD_ICON_PRESENTATION_VERSION,
  resolveStudioWorldIconPresentation,
} from './experience-lab-icon-presentation';
import {
  presentExperienceLabIcon,
  resolveCanonicalIconPresentation,
  resolveIconPresentation,
  SIZE_PX,
} from './experience-lab-icon-presenter';

const ICONS_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(ICONS_DIR, '../../../..');
const COMPONENT = resolve(ICONS_DIR, 'ExperienceLabIcon.tsx');
const PRESENTATION = resolve(ICONS_DIR, 'ExperienceLabIconPresentation.tsx');
const PRESENTER = resolve(ICONS_DIR, 'experience-lab-icon-presenter.ts');
const PRESENTATION_TS = resolve(ICONS_DIR, 'experience-lab-icon-presentation.ts');
const TUNER = resolve(ICONS_DIR, 'FounderOpticalTuner.tsx');
const GENERATED_DIR = resolve(ROOT, 'src/assets/studio-world/experience-lab/icons/generated');
const DOC = resolve(ROOT, 'docs/studio-os/design-system/EXPERIENCE_LAB_ICON_PRESENTATION_SYSTEM.md');

describe('Experience Lab Icon Presentation System', () => {
  it('defines canonical registry for all 64 icons with independent profiles', () => {
    expect(Object.keys(StudioWorldIconPresentationRegistry)).toHaveLength(64);
    for (const name of EXPERIENCE_LAB_ICON_NAMES) {
      const profile = resolveStudioWorldIconPresentation(name);
      expect(profile.scale).toBeGreaterThanOrEqual(0.85);
      expect(profile.scale).toBeLessThanOrEqual(1.45);
      expect(profile.scores.overall).toBeGreaterThanOrEqual(80);
      expect(Math.abs(profile.offsetX)).toBeLessThanOrEqual(6);
      expect(Math.abs(profile.offsetY)).toBeLessThanOrEqual(6);
    }
  });

  it('founder-tuned icons use enhanced presentation values', () => {
    expect(resolveStudioWorldIconPresentation('materials').scale).toBe(1.26);
    expect(resolveStudioWorldIconPresentation('materials').offsetY).toBe(-2);
    expect(resolveStudioWorldIconPresentation('dashboard').scale).toBe(1.34);
    expect(resolveStudioWorldIconPresentation('construction').scale).toBe(1.18);
    expect(resolveStudioWorldIconPresentation('camera').scale).toBe(1.16);
    expect(resolveStudioWorldIconPresentation('analytics').scale).toBe(1.14);
  });

  it('presenter computes optical centering via objectPosition offsets', () => {
    const presented = presentExperienceLabIcon('zoomIn', 'md');
    expect(presented.boxPx).toBeGreaterThan(SIZE_PX.md);
    expect(String(presented.imgStyle.objectPosition)).toContain('calc(50%');
    expect(presented.scores.overall).toBeGreaterThan(0);
  });

  it('ExperienceLabIcon routes through presentation layer (not direct PNG sizing)', () => {
    const iconSrc = readFileSync(COMPONENT, 'utf8');
    const presentationSrc = readFileSync(PRESENTATION, 'utf8');
    expect(iconSrc).toContain('ExperienceLabIconPresentation');
    expect(iconSrc).not.toContain('resolveExperienceLabIconOpticalProfile');
    expect(presentationSrc).toContain('presentExperienceLabIcon');
    expect(presentationSrc).toContain('data-elab-presentation');
  });

  it('supports founder optical mode tuner and comparison overlay', () => {
    const tuner = readFileSync(TUNER, 'utf8');
    expect(tuner).toContain('Founder Optical Mode');
    expect(tuner).toContain('setFounderPresentationOverride');
    expect(tuner).toContain('compareCanonical');
    expect(tuner).toContain('exportFounderPresentationPatchFragment');
    expect(readFileSync(PRESENTER, 'utf8')).toContain('FOUNDER_OPTICAL_STORAGE_KEY');
  });

  it('does not modify extraction PNG assets', () => {
    const before = readFileSync(
      resolve(GENERATED_DIR, 'materials.png'),
    ).length;
    expect(before).toBeGreaterThan(100);
    expect(existsSync(PRESENTATION_TS)).toBe(true);
    expect(readFileSync(PRESENTATION_TS, 'utf8')).toContain(
      'runtime display only (PNG assets frozen)',
    );
  });

  it('exposes ExperienceLabIconPresentationSystem as global canonical renderer', () => {
    expect(ExperienceLabIconPresentationSystem.version).toBe(
      STUDIO_WORLD_ICON_PRESENTATION_VERSION,
    );
    expect(ExperienceLabIconPresentationSystem.registry).toBe(
      StudioWorldIconPresentationRegistry,
    );
    expect(resolveCanonicalIconPresentation('dashboard').scale).toBe(1.34);
    expect(resolveIconPresentation('dashboard').scale).toBe(1.34);
  });

  it('documents presentation system', () => {
    expect(existsSync(DOC)).toBe(true);
  });
});
