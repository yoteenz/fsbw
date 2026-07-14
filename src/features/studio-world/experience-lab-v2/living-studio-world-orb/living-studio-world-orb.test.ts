import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ORB_DIR = dirname(fileURLToPath(import.meta.url));

describe('LivingStudioWorldOrb', () => {
  const component = readFileSync(resolve(ORB_DIR, 'LivingStudioWorldOrb.tsx'), 'utf8');
  const css = readFileSync(resolve(ORB_DIR, 'LivingStudioWorldOrb.module.css'), 'utf8');

  it('declares required animation layers', () => {
    expect(component).toContain('AmbientGlowLayer');
    expect(component).toContain('OuterOrbitRing');
    expect(component).toContain('InnerOrbitRing');
    expect(component).toContain('OrbBase');
    expect(component).toContain('DepthOverlay');
    expect(component).toContain('InternalCore');
    expect(component).toContain('HighlightLayer');
    expect(component).toContain('SurfaceShimmer');
    expect(component).toContain('PulseHalo');
    expect(component).toContain('StatusLayer');
  });

  it('mounts inside approved workbench orb container without layout props', () => {
    expect(component).toContain('elab-founder-wb__nav-orb');
    expect(component).toContain('resolveExperienceLabWorkbenchCenterLogoUrl');
    expect(component).not.toMatch(/width:\s*['"]?\d+px/);
  });

  it('supports reduced motion and visibility pause', () => {
    expect(component).toContain('usePrefersReducedMotion');
    expect(component).toContain('useAnimationPaused');
    expect(css).toContain('.reducedMotion');
    expect(css).toContain('.shellPaused');
  });

  it('uses subtle CSS keyframe animations', () => {
    expect(css).toContain('lswo-breathe');
    expect(css).toContain('lswo-outer-orbit');
    expect(css).toContain('lswo-inner-orbit');
    expect(css).toContain('lswo-pulse-halo');
  });
});
