export type LivingSeason = 'winter' | 'spring' | 'summer' | 'autumn';

export type LivingAtmosphereMode =
  | 'default'
  | 'celebration'
  | 'anniversary'
  | 'launch-day'
  | 'focus-week'
  | 'holiday'
  | 'executive-review'
  | 'emergency';

export type LegacyWallEntry = {
  id: string;
  label: string;
  engravedAt: string;
  category: 'founding' | 'customer' | 'revenue' | 'knowledge' | 'people' | 'innovation' | 'marketplace' | 'expansion' | 'award';
  detail?: string;
};

export type ExecutiveArtifactKind =
  | 'crystal-trophy'
  | 'sculpture'
  | 'award'
  | 'monument'
  | 'innovation-display'
  | 'founder-recognition';

export type ExecutiveArtifact = {
  id: string;
  label: string;
  kind: ExecutiveArtifactKind;
  milestoneId: string;
  unlockedAt: string;
  description: string;
};

export type LivingHeadquartersInput = {
  organizationId: string;
  organizationFoundedAt?: string | null;
  milestoneRecords?: Array<{ id: string; label: string; description: string; recordedAt: string }>;
  pagesPublished?: number;
  knowledgeAssets?: number;
  healthScore?: number;
  supplementalWallEntries?: LegacyWallEntry[];
  /** When false, holiday atmosphere mode is suppressed (Life & Culture Preferences). */
  allowHolidayAtmosphere?: boolean;
  /** When false, seasonal floral/golden effects are suppressed. */
  allowSeasonalEnvironment?: boolean;
};

export type LivingHeadquartersState = {
  season: LivingSeason;
  atmosphereMode: LivingAtmosphereMode;
  atmosphereLabel: string;
  livingMemory: string | null;
  celebrationMessage: string | null;
  legacyWall: LegacyWallEntry[];
  executiveCollection: ExecutiveArtifact[];
  crystalIllumination: boolean;
  floralAccent: boolean;
  frostAccent: boolean;
  goldenHour: boolean;
  commemorativeDisplay: boolean;
  organizationAgeYears: number;
  communicationStyle: import('../life-culture-preferences').CommunicationStyle;
};
