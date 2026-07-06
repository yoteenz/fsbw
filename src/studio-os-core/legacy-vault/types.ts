import type {
  FAMILY_LEGACY_TYPES,
  FOUNDER_ARCHIVE_TYPES,
  LEGACY_EXPERIENCE_TYPES,
  PRESERVE_CATEGORIES,
  TIME_CAPSULE_TRIGGERS,
  VERSION_HISTORY_TYPES,
} from './constants';

export type PreserveCategory = (typeof PRESERVE_CATEGORIES)[number];
export type VersionHistoryType = (typeof VERSION_HISTORY_TYPES)[number];
export type LegacyExperienceType = (typeof LEGACY_EXPERIENCE_TYPES)[number];
export type FounderArchiveType = (typeof FOUNDER_ARCHIVE_TYPES)[number];
export type FamilyLegacyType = (typeof FAMILY_LEGACY_TYPES)[number];
export type TimeCapsuleTrigger = (typeof TIME_CAPSULE_TRIGGERS)[number];

export type LegacyArchiveEntry = {
  id: string;
  category: PreserveCategory;
  title: string;
  summary: string;
  preservedAt: string;
  sourceModule: string;
  version: number;
  immutable: true;
  mediaType?: 'document' | 'video' | 'photo' | 'audio' | 'blueprint';
};

export type VersionHistoryEntry = {
  id: string;
  versionType: VersionHistoryType;
  label: string;
  versionNumber: number;
  capturedAt: string;
  summary: string;
  supersededBy?: string;
};

export type LegacyExperience = {
  id: string;
  experienceType: LegacyExperienceType;
  title: string;
  description: string;
  entryCount: number;
  immersive: true;
};

export type FounderArchiveEntry = {
  id: string;
  archiveType: FounderArchiveType;
  title: string;
  content: string;
  recordedAt: string;
  private: boolean;
};

export type FamilyLegacyEntry = {
  id: string;
  legacyType: FamilyLegacyType;
  title: string;
  content: string;
  recordedAt: string;
  unlockCondition?: string;
};

export type TimeCapsule = {
  id: string;
  title: string;
  trigger: TimeCapsuleTrigger;
  sealedAt: string;
  openAt?: string;
  status: 'sealed' | 'opened';
  contents: string[];
  founderMessage?: string;
};

export type PreserveMomentSuggestion = {
  id: string;
  message: string;
  suggestedTitle: string;
  category: PreserveCategory;
  detectedAt: string;
};

export type OrganizationLegacyVaultProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  legacyDepthScore: number;
  totalArchiveEntries: number;
  versionHistoryCount: number;
  timeCapsulesSealed: number;
  founderArchiveCount: number;
  archiveEntries: LegacyArchiveEntry[];
  versionHistory: VersionHistoryEntry[];
  legacyExperiences: LegacyExperience[];
  founderArchive: FounderArchiveEntry[];
  familyLegacy: FamilyLegacyEntry[];
  timeCapsules: TimeCapsule[];
  pendingPreserveSuggestions: PreserveMomentSuggestion[];
  syncedSources: string[];
};

export type LegacyVaultStore = {
  version: string;
  profiles: OrganizationLegacyVaultProfile[];
};

export type LegacyVaultDockAdvice = {
  response: string;
  concierge: string;
  preserveSuggestion?: PreserveMomentSuggestion;
  legacyDepthScore?: number;
};
