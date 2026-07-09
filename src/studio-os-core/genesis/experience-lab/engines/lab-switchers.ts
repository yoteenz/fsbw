import type { XerRuntimeGraph } from '../../experience-runtime/types';
import { XELAB_TEST_SCENARIOS, type XelabLabSwitchers } from '../constants';

/** Apply Experience Lab switcher overrides to assembled runtime graph (non-destructive patch) */
export function applyLabSwitchersToGraph(
  graph: XerRuntimeGraph,
  switchers: XelabLabSwitchers
): XerRuntimeGraph {
  const cssVariables = { ...graph.cssVariables };
  const overrides = [...graph.activeOverrides];
  const brand = { ...graph.brand };

  if (switchers.lightingVariant === 'warm-marble') {
    cssVariables['--xer-ambient-gradient'] = 'linear-gradient(165deg, #faf6f0 0%, #efe4d8 50%, #fff9f5 100%)';
    overrides.push({ overrideId: 'lab-lighting-warm', layer: 'brand', fieldPath: 'lighting', value: 'warm-marble', reason: 'Experience Lab lighting switcher' });
  } else if (switchers.lightingVariant === 'salon-glow') {
    cssVariables['--xer-ambient-gradient'] = 'linear-gradient(165deg, #fffbf7 0%, #fceee4 40%, #fff5ef 100%)';
  } else if (switchers.lightingVariant === 'broadcast-dark') {
    cssVariables['--xer-ambient-gradient'] = 'linear-gradient(165deg, #0b1220 0%, #111827 50%, #0f172a 100%)';
  }

  if (switchers.particleVariant === 'none') {
    brand.particles = 'none';
  } else if (switchers.particleVariant === 'enhanced') {
    brand.particles = `${brand.particles} (enhanced lab)`;
  }

  if (switchers.typographyVariant === 'display-large') {
    brand.typography = { ...brand.typography, displaySize: '24px', bodySize: '15px' };
  } else if (switchers.typographyVariant === 'compact') {
    brand.typography = { ...brand.typography, displaySize: '14px', bodySize: '12px' };
  }

  if (switchers.animationVariant === 'fast') {
    brand.motion = { ...brand.motion, timingMs: 250 };
    cssVariables['--xer-motion-timing'] = '250ms';
  } else if (switchers.animationVariant === 'slow') {
    brand.motion = { ...brand.motion, timingMs: 900 };
    cssVariables['--xer-motion-timing'] = '900ms';
  } else if (switchers.animationVariant === 'reduced') {
    brand.motion = { ...brand.motion, timingMs: 0, entrance: 'none', hover: 'none' };
    cssVariables['--xer-motion-timing'] = '0ms';
  }

  if (switchers.orbVariant === 'minimal') {
    brand.orbOverrides = { ...brand.orbOverrides, glowColor: `${brand.orbOverrides.glowColor}88` };
  } else if (switchers.orbVariant === 'prominent') {
    brand.orbOverrides = { ...brand.orbOverrides, glowColor: brand.colorSystem.primary };
  }

  if (switchers.themeVariant === 'high-contrast') {
    cssVariables['--xer-glass-panel'] = 'rgba(255,255,255,0.95)';
  } else if (switchers.themeVariant === 'soft-wash') {
    cssVariables['--xer-glass-panel'] = 'rgba(255,255,255,0.35)';
  }

  return {
    ...graph,
    brand,
    cssVariables,
    activeOverrides: overrides,
    performance: {
      ...graph.performance,
      overrideCount: overrides.length,
    },
  };
}

export function getScenarioHeroLabel(scenarioId: string): string {
  return XELAB_TEST_SCENARIOS.find((s) => s.scenarioId === scenarioId)?.heroLabel ?? 'Experience Lab preview';
}

export function getScenarioLabel(scenarioId: string): string {
  return XELAB_TEST_SCENARIOS.find((s) => s.scenarioId === scenarioId)?.label ?? 'Experience Lab';
}
