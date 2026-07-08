/**
 * Innovation Constellations™ — Orb Cosmic Guide.
 */

import type { InnovationConstellation, InnovationStar, FoundersStar } from './types';

export type CosmicGuideLine = {
  id: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
};

function uid(): string {
  return `cosmic-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export const COSMIC_GUIDE_ROLE = 'Cosmic Guide';
export const COSMIC_GUIDE_GREETING =
  'Innovation Constellations™ — explore humanity\'s collective business intelligence as a living universe.';
export const COSMIC_GUIDE_ACCENT = '#6eb5ff';

export function buildCosmicGuideWelcomeLines(): CosmicGuideLine[] {
  return [
    {
      id: uid(),
      message: 'Every innovation is a celestial object — stars brighten as ideas evolve, suns mark industry standards.',
      priority: 'high',
    },
    {
      id: uid(),
      message: 'Zoom from Universe™ into Galaxies™, Constellations™, Solar Systems™, and individual Stars™.',
      priority: 'medium',
    },
    {
      id: uid(),
      message: 'Dark regions reveal Opportunity Map™ whitespace — collaboration before competition.',
      priority: 'medium',
    },
  ];
}

export function buildCosmicGuideConstellationLines(constellation: InnovationConstellation): CosmicGuideLine[] {
  return [
    {
      id: uid(),
      message:
        constellation.evolutionVelocity === 'rapid'
          ? `This constellation has evolved rapidly — ${constellation.starCount} stars active.`
          : `${constellation.title} is ${constellation.evolutionVelocity} — explore influential innovations.`,
      priority: 'high',
    },
    {
      id: uid(),
      message: constellation.opportunityGap
        ? `I've detected a gap you may be uniquely positioned to solve: ${constellation.opportunityGap}.`
        : 'Marketplace leaders and emerging stars connected visually.',
      priority: 'high',
    },
  ];
}

export function buildCosmicGuideStarLines(star: InnovationStar): CosmicGuideLine[] {
  return [
    {
      id: uid(),
      message: `Your latest innovation "${star.title}" is ${star.influenceLabel} — brightness ${star.brightness}%.`,
      priority: 'high',
    },
    {
      id: uid(),
      message:
        star.descendants > 0
          ? `This system has inspired ${star.descendants} derivative innovations.`
          : 'Emerging star — constellation forming around your contribution.',
      priority: 'medium',
    },
  ];
}

export function buildCosmicGuideFounderLines(founderStar: FoundersStar): CosmicGuideLine[] {
  return [
    {
      id: uid(),
      message: `${founderStar.founderName}'s Star™ grows at ${founderStar.growthRate}% — visible mark on the universe.`,
      priority: 'high',
    },
    {
      id: uid(),
      message: `${founderStar.planetarySystems.length} planetary systems orbit your achievements.`,
      priority: 'medium',
    },
  ];
}
