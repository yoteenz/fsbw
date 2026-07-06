export type HeadquartersEnvironmentProfile = {
  environmentName: string;
  tagline: string;
  accentHex: string;
};

const PROFILES: Record<string, HeadquartersEnvironmentProfile> = {
  'frontal-slayer': {
    environmentName: 'The Mansion™',
    tagline: 'Executive headquarters · luxury editorial command',
    accentHex: '#EB1C24',
  },
  'ai-media': {
    environmentName: 'Media Command™',
    tagline: 'Publishing headquarters · knowledge at scale',
    accentHex: '#6366F1',
  },
  'ndxbook': {
    environmentName: 'Media Command™',
    tagline: 'Publishing headquarters · knowledge at scale',
    accentHex: '#6366F1',
  },
  default: {
    environmentName: 'Executive Floor™',
    tagline: 'Organization headquarters · Studio OS',
    accentHex: '#EB1C24',
  },
};

export function resolveHeadquartersEnvironment(workspaceId: string): HeadquartersEnvironmentProfile {
  return PROFILES[workspaceId] ?? PROFILES.default;
}

/** Adaptive maturity — sections unlock as org grows (demo thresholds). */
export function resolveHeadquartersMaturity(publishedCount: number, healthScore: number) {
  return {
    showInnovation: publishedCount >= 3 || healthScore >= 60,
    showLegacy: publishedCount >= 1 || healthScore >= 40,
    showFinancial: healthScore >= 50,
    isDayOne: publishedCount === 0 && healthScore < 30,
  };
}
