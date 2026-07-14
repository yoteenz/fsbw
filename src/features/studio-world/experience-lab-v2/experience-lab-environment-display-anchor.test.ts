import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ENV_DISPLAY_ANCHOR_PROFILES,
  ENV_DISPLAY_TRANSFORM_VARS,
  isNonFlatDisplayTransform,
} from './experience-lab-environment-display-anchor';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

const V2_DIR = dirname(fileURLToPath(import.meta.url));

function readV2Source(filename: string): string {
  return readFileSync(resolve(V2_DIR, filename), 'utf8');
}

describe('Experience Lab V2 — Environment Display Anchor System (P0 hotfix)', () => {
  const css = readV2Source('experience-lab-v2.css');
  const blueprint = readV2Source('ExperienceLabBlueprintCard.tsx');
  const context = readV2Source('ExperienceLabDynamicContextCard.tsx');
  const anchor = readV2Source('ExperienceLabAnchoredEnvironmentDisplay.tsx');
  const viewport = readV2Source('StudioViewport.tsx');

  it('1. viewport host defines nonzero perspective', () => {
    expect(css).toMatch(/perspective:\s*var\(--env-display-perspective\)/);
    expect(css).toContain('--env-display-perspective: 1600px');
    expect(Number.parseInt(ENV_DISPLAY_ANCHOR_PROFILES.desktop.perspective, 10)).toBeGreaterThan(0);
  });

  it('2. blueprint mobile profile has positive nonzero rotateY', () => {
    const y = ENV_DISPLAY_ANCHOR_PROFILES.mobilePortrait.left.rotateY;
    expect(y).toMatch(/^\d+deg$/);
    expect(Number.parseFloat(y)).toBeGreaterThan(0);
    expect(css).toMatch(/\.elab-app-shell--mobile \.elab-env-display-transform--left[\s\S]*?--display-rotate-y:\s*11deg/);
  });

  it('3. dynamic context mobile profile has negative nonzero rotateY', () => {
    const y = ENV_DISPLAY_ANCHOR_PROFILES.mobilePortrait.right.rotateY;
    expect(y.startsWith('-')).toBe(true);
    expect(Number.parseFloat(y)).toBeLessThan(0);
    expect(css).toMatch(/\.elab-app-shell--mobile \.elab-env-display-transform--right[\s\S]*?--display-rotate-y:\s*-11deg/);
  });

  it('4. blueprint transform origin is left center', () => {
    expect(ENV_DISPLAY_ANCHOR_PROFILES.desktop.left.transformOrigin).toBe('left center');
    expect(css).toMatch(/\.elab-env-display-transform--left[\s\S]*?transform-origin:\s*left center/);
  });

  it('5. dynamic context transform origin is right center', () => {
    expect(ENV_DISPLAY_ANCHOR_PROFILES.desktop.right.transformOrigin).toBe('right center');
    expect(css).toMatch(/\.elab-env-display-transform--right[\s\S]*?transform-origin:\s*right center/);
  });

  it('6–9. desktop, tablet, mobile portrait, mobile landscape retain mirrored rotation', () => {
    for (const profile of ['desktop', 'tablet', 'mobilePortrait', 'mobileLandscape'] as const) {
      const p = ENV_DISPLAY_ANCHOR_PROFILES[profile];
      expect(Number.parseFloat(p.left.rotateY)).toBeGreaterThan(0);
      expect(Number.parseFloat(p.right.rotateY)).toBeLessThan(0);
    }
    expect(css).toContain('.elab-app-shell--desktop');
    expect(css).toContain('.elab-app-shell--tablet');
    expect(css).toContain('.elab-app-shell--mobile');
    expect(css).toMatch(/orientation:\s*landscape/);
  });

  it('10. reduced motion preserves static rotateY', () => {
    const block = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
    expect(block).toContain('.elab-env-display-transform');
    expect(block).not.toMatch(/\.elab-env-display-transform\s*\{[^}]*transform:\s*none/);
    expect(block).not.toContain('.elab-env-display-transform { transform: none');
  });

  it('11–14. hover, focus, expanded, collapsed compose via CSS variables not transform replacement', () => {
    expect(css).toMatch(/\.elab-env-display-transform[\s\S]*?rotateY\(var\(--display-rotate-y\)\)/);
    expect(css).toMatch(/hover[\s\S]*?--display-scale:\s*1\.01/);
    expect(css).toMatch(/hover[\s\S]*?--display-translate-z-extra:\s*14px/);
  });

  it('15. entrance animation composes with anchor transform', () => {
    expect(css).toContain('@keyframes elabEnvDisplayEnterRight');
    expect(css).toMatch(/elabEnvDisplayEnterRight[\s\S]*?rotateY\(var\(--display-rotate-y\)\)/);
    expect(context).toContain('enter');
  });

  it('16. visible glass surface is inside transform owner', () => {
    expect(anchor).toContain('data-env-display-transform-owner');
    expect(anchor).toContain('data-env-display-visible-surface');
    expect(anchor).toContain('elab-env-display-surface');
    expect(blueprint).toContain('ExperienceLabAnchoredEnvironmentDisplay');
    expect(context).toContain('ExperienceLabAnchoredEnvironmentDisplay');
  });

  it('17–18. computed transform matrix helpers detect nonflat mirrored transforms', () => {
    expect(isNonFlatDisplayTransform('rotateY(11deg)')).toBe(true);
    expect(isNonFlatDisplayTransform('none')).toBe(false);
    expect(isNonFlatDisplayTransform('rotateY(-11deg) translateZ(70px)')).toBe(true);
  });

  it('19–20. hitboxes and bounds — surface carries pointer-events; host preserves anchors', () => {
    expect(css).toMatch(/\.elab-env-display-surface[\s\S]*?pointer-events:\s*auto/);
    expect(css).toMatch(/\.elab-viewport__blueprint-card\s*\{[\s\S]*?position:\s*absolute/);
    expect(css).toMatch(/\.elab-viewport__context-card\s*\{[\s\S]*?position:\s*absolute/);
    expect(css).toMatch(/\.elab-viewport__blueprint-card\s*\{[\s\S]*?left:\s*var\(--elab-hud-safe-side\)/);
    expect(css).toMatch(/\.elab-viewport__context-card\s*\{[\s\S]*?right:\s*var\(--elab-hud-safe-side\)/);
  });

  it('21–28. layout preservation — viewport, variants, workbench, orb, docks unchanged', () => {
    const shell = readV2Source('ExperienceLabV2Shell.tsx');
    const workbench = readV2Source('ExperienceLabFounderWorkbench.tsx');
    expect(shell).toContain('ExperienceLabCommandDock');
    expect(shell).not.toContain('ExperienceLabDepartmentDock');
    expect(shell).toContain('ExperienceLabFounderWorkbench');
    expect(workbench).toContain('LivingStudioWorldOrb');
    expect(viewport).toContain('elab-viewport__angles-chrome');
    expect(css).toMatch(/\.elab-viewport__angles-chrome\s+\.elab-view-angles--chrome\s*\{[\s\S]*?width:\s*100%/);
    expect(blueprint).toContain('LEFT_FRONT');
    expect(context).toContain('RIGHT_FRONT');
  });

  it('29. environment package pipeline unchanged', () => {
    expect(readV2Source('experience-lab-environment-package-bridge.ts')).toContain(
      'resolveDesignVariantBlueprintFromPackage',
    );
  });

  it('30. transform CSS variables declared for composition', () => {
    for (const v of ENV_DISPLAY_TRANSFORM_VARS) {
      expect(css).toContain(v);
    }
    expect(ELAB_V2_COMPOSITION.environmentDisplayHost).toBe('data-env-display-host');
    expect(ELAB_V2_COMPOSITION.environmentDisplayTransform).toBe('data-env-display-transform-owner');
    expect(viewport).toContain('ExperienceLabEnvironmentDisplayAnchorDiagnosticOverlay');
  });
});
