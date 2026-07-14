import { describe, expect, it, beforeEach } from 'vitest';
import {
  studioWorldIconStateEngine,
  renderIconState,
  resolveGlowProfile,
  resolveAnimation,
  resolveInteractionState,
  resolveAccessibilityHints,
  STUDIO_WORLD_ICON_STATES,
  ICON_ANIMATION_PRESETS,
  ICON_STATE_DEVICES,
} from './index';
import {
  registerIcon,
  resetStudioWorldIconRegistry,
  type StudioWorldIconDefinition,
} from '../studio-world-icon-system';

function sampleIcon(id: string): StudioWorldIconDefinition {
  const now = new Date().toISOString();
  return {
    id,
    category: 'workspace',
    displayName: id,
    aliases: [id],
    keywords: ['test'],
    description: 'test',
    version: 'v1',
    certification: 'certified',
    status: 'active',
    strokeWidth: 1,
    cornerRadius: 2,
    opticalWeight: 1,
    designFamily: 'chrome',
    renderStyle: 'raster',
    themeCompatibility: { 'studio-dark': true, 'studio-light': true, 'luxury-gold': true },
    provider: 'local-png',
    defaultAsset: '/studio-os/icons/search.png',
    hoverAsset: null,
    activeAsset: null,
    disabledAsset: null,
    futureAnimatedAsset: null,
    futureVariableAsset: null,
    future3DAsset: null,
    svgPath: null,
    pngPath: '/studio-os/icons/search.png',
    thumbnail: null,
    preview: null,
    stateAssets: {},
    future: {
      supportsAnimation: true,
      supportsMorph: false,
      supportsVariable: false,
      supports3D: false,
      supportsParticles: false,
      supportsGlow: true,
      supportsPhysics: false,
    },
    metadata: {
      author: 'test',
      createdAt: now,
      updatedAt: now,
      tags: ['test'],
      departmentUsage: ['experience-lab'],
      usageCount: 0,
      favorite: false,
      deprecated: false,
      replacement: null,
    },
  };
}

describe('Studio World Icon State Engine', () => {
  beforeEach(() => {
    resetStudioWorldIconRegistry();
    registerIcon(sampleIcon('search'));
  });

  it('defines all procedural states', () => {
    expect(STUDIO_WORLD_ICON_STATES).toContain('generating');
    expect(STUDIO_WORLD_ICON_STATES).toContain('success');
    expect(STUDIO_WORLD_ICON_STATES).toContain('syncing');
    expect(STUDIO_WORLD_ICON_STATES.length).toBeGreaterThanOrEqual(25);
  });

  it('defines animation presets and devices', () => {
    expect(ICON_ANIMATION_PRESETS).toContain('energy-flow');
    expect(ICON_STATE_DEVICES).toContain('visionos');
  });

  it('renders procedural state from one certified asset', () => {
    const output = renderIconState({
      iconId: 'search',
      state: 'active',
      theme: 'studio-dark',
      sizePx: 32,
    });
    expect(output).not.toBeNull();
    expect(output?.assetPath).toBe('/studio-os/icons/search.png');
    expect(output?.state).toBe('active');
    expect(output?.classNames).toContain('swi-icon--active');
    expect(output?.cssVariables['--swi-gold-edge']).toBeDefined();
  });

  it('hover state uses max 150ms transition', () => {
    const anim = resolveAnimation('hover', true, false);
    expect(anim.durationMs).toBeLessThanOrEqual(150);
  });

  it('honors reduced motion', () => {
    const anim = resolveAnimation('generating', true, true);
    expect(anim.preset).toBe('none');
    const output = renderIconState({
      iconId: 'search',
      state: 'generating',
      reducedMotion: true,
    });
    expect(output?.classNames).toContain('swi-icon--reduced-motion');
  });

  it('resolves interaction to hover when default + hovered', () => {
    expect(resolveInteractionState('default', { hovered: true })).toBe('hover');
    expect(resolveInteractionState('loading', { hovered: true })).toBe('loading');
  });

  it('provides accessibility hints for busy states', () => {
    const hints = resolveAccessibilityHints('generating', { label: 'Search' });
    expect(hints.ariaBusy).toBe(true);
    expect(hints.touchTargetMinPx).toBeGreaterThanOrEqual(44);
  });

  it('glow profiles differ per state', () => {
    const hover = resolveGlowProfile('hover');
    const disabled = resolveGlowProfile('disabled');
    expect(hover.intensity).toBeGreaterThan(disabled.intensity);
  });

  it('builds state matrix for regression QA', () => {
    const matrix = studioWorldIconStateEngine.buildStateMatrix(['search'], {
      states: ['default', 'hover', 'active'],
      themes: ['studio-dark'],
      sizes: [24],
      animated: false,
    });
    expect(matrix.cells.length).toBe(3);
    expect(matrix.cells.every((c) => c.render?.assetPath)).toBe(true);
  });
});
