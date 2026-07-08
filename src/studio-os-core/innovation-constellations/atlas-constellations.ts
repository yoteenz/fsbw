import type { InnovationUniverse } from './types';

export type AtlasConstellationGlow = {
  constellationId: string;
  title: string;
  spreadIntensity: number;
  evolutionVelocity: string;
  label: string;
};

export function resolveAtlasConstellationGlows(universe: InnovationUniverse): AtlasConstellationGlow[] {
  return universe.constellations
    .filter((c) => c.evolutionVelocity === 'rapid' || c.starCount >= 10)
    .map((c) => ({
      constellationId: c.id,
      title: c.title,
      spreadIntensity: Math.min(100, c.starCount * 4 + (c.evolutionVelocity === 'rapid' ? 25 : 10)),
      evolutionVelocity: c.evolutionVelocity,
      label: `${c.title} — ${c.starCount} stars · ${c.evolutionVelocity} evolution`,
    }));
}

export function formatAtlasConstellationLine(glows: AtlasConstellationGlow[]): string | null {
  if (glows.length === 0) return null;
  const top = [...glows].sort((a, b) => b.spreadIntensity - a.spreadIntensity)[0]!;
  return `Constellations spreading — ${top.label}`;
}
