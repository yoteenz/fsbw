/** Founder's Promise V1.0 — personal north star (Milestone 59.7). */

export type FoundersPromiseWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type PrivacyLevel = 'private' | 'family' | 'executive' | 'organization' | 'public';

export type ReflectiveQuestion = {
  id: string;
  question: string;
  promptContext: string;
  explored: boolean;
};

export type PromiseVersion = {
  id: string;
  version: number;
  label: string;
  excerpt: string;
  date: string;
  format: 'text' | 'audio' | 'video' | 'handwritten';
  isOriginal: boolean;
  changeReason?: string;
};

export type LivingPromiseEvolution = {
  id: string;
  fromVersion: number;
  toVersion: number;
  whatChanged: string;
  whyChanged: string;
  influencingEvent: string;
};

export type OrganizationalAlignmentCheck = {
  id: string;
  decision: string;
  category: string;
  alignmentScore: number;
  reasoning: string;
  potentialConflict?: string;
  recommendedAdjustment?: string;
};

export type ExecutiveAlignment = {
  id: string;
  executive: string;
  alignmentQuestion: string;
  currentAssessment: string;
  status: 'aligned' | 'review' | 'drift';
};

export type PromiseReflectionMoment = {
  id: string;
  trigger: string;
  invitation: string;
  status: 'pending' | 'completed' | 'declined';
};

export type ArchiveEntry = {
  id: string;
  type: 'version' | 'recording' | 'reflection' | 'milestone';
  title: string;
  date: string;
  note: string;
};

export type LegacyInheritanceLetter = {
  id: string;
  recipient: string;
  subject: string;
  excerpt: string;
  privacy: PrivacyLevel;
};

export type CampusInstallation = {
  id: string;
  location: string;
  description: string;
  experience: string;
};

export type FoundersPromiseStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: FoundersPromiseWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    currentVersion: number;
    totalVersions: number;
    alignmentScorePct: number;
    executivesAligned: number;
    reflectionMomentsPending: number;
    archiveEntries: number;
    privacy: PrivacyLevel;
  };
  promisePhilosophy: string[];
  reflectiveQuestions: ReflectiveQuestion[];
  currentPromise: {
    text: string;
    version: number;
    lastRevised: string;
    format: 'text' | 'audio' | 'video' | 'handwritten';
  };
  originalPromise: {
    text: string;
    date: string;
    preserved: boolean;
  };
  promiseVersions: PromiseVersion[];
  livingEvolution: LivingPromiseEvolution[];
  organizationalAlignment: OrganizationalAlignmentCheck[];
  executiveAlignment: ExecutiveAlignment[];
  reflectionMoments: PromiseReflectionMoment[];
  promiseArchive: ArchiveEntry[];
  legacyInheritance: LegacyInheritanceLetter[];
  campusInstallation: CampusInstallation[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
