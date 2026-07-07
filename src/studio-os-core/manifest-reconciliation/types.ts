import type { IMPLEMENTATION_STATUS_LABELS, REGISTRY_KINDS } from './constants';

export type ImplementationStatus = keyof typeof IMPLEMENTATION_STATUS_LABELS;
export type RegistryKind = (typeof REGISTRY_KINDS)[number];

export type MasterSpecConstitution = {
  version: string;
  updatedAt: string;
  principles: Array<{ id: string; title: string; summary: string }>;
};

export type MasterSpecVolume = {
  id: string;
  number: number | string;
  title: string;
  summary: string;
  status: ImplementationStatus;
  dependsOn: string[];
  milestoneRange: string | null;
  completionPct: number;
  notes?: string;
  chaptersFile?: string;
};

export type MasterSpecChapter = {
  id: string;
  number: number;
  title: string;
  summary: string;
  status: ImplementationStatus;
  dependsOn: string[];
  milestoneIds: string[];
  completionPct: number;
  volumeId: string;
};

export type MasterSpecMilestone = {
  canonicalId: string;
  name: string;
  internalId: string;
  registryKind: RegistryKind;
  chapterId?: string;
  volumeId: string;
  purpose: string;
  implementationStatus: ImplementationStatus;
  shippedMilestone: string | null;
  moduleId: string | null;
  dependsOn: string[];
  enables: string[];
  relatedSystems?: string[];
  implementationNotes?: string;
};

export type MasterSpecDesignRevision = {
  id: string;
  canonicalId: string;
  title: string;
  purpose: string;
  implementationStatus: ImplementationStatus;
  volumeId: string;
  mergeTargets: string[];
  dependsOn: string[];
  enables: string[];
  aliases?: string[];
  keywords?: string[];
};

export type MilestoneAlias = {
  canonicalId: string;
  shippedId?: string;
  name: string;
  moduleId?: string;
  formerName?: string;
  formerModuleId?: string;
  reason?: string;
};

export type DependencyEdge = {
  from: string;
  to: string;
  type: string;
  note?: string;
};

export type MasterSpecBundle = {
  version: string;
  compiledAt: string;
  sourceRoot: string;
  constitution: MasterSpecConstitution;
  volumes: MasterSpecVolume[];
  chapters: MasterSpecChapter[];
  milestones: MasterSpecMilestone[];
  designRevisions: MasterSpecDesignRevision[];
  milestoneAliases: MilestoneAlias[];
  dependencyEdges: DependencyEdge[];
  stats: {
    volumeCount: number;
    chapterCount: number;
    milestoneCount: number;
    designRevisionCount: number;
    completeCount: number;
    inProgressCount: number;
    plannedCount: number;
    volumeIMilestoneCount: number;
    volumeIChapterCount: number;
    volumeICompleteCount: number;
    volumeIIMilestoneCount: number;
    volumeIIChapterCount: number;
    volumeIICompleteCount: number;
  };
};

export type VolumeReconciliationCoverage = {
  volumeId: string;
  milestoneCount: number;
  completeCount: number;
  chapterCount: number;
  matchedLive: number;
  plannedOnly: number;
};

export type ReconciliationMatch = {
  internalId: string;
  canonicalId: string;
  moduleId: string | null;
  implementationStatus: ImplementationStatus;
  matchedLive: boolean;
  liveRoute?: string;
};

export type ReconciliationReport = {
  compiledAt: string;
  totalManifestMilestones: number;
  matchedLive: number;
  plannedOnly: number;
  orphanedLiveModules: string[];
  idConflicts: Array<{ canonicalId: string; shippedId: string; moduleId: string }>;
  volumeCoverage: VolumeReconciliationCoverage[];
  masterSpecCoveragePct: number;
  manifestAuthoringErrors: number;
  manifestAuthoringWarnings: number;
};

export type ManifestValidationIssue = {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  entityId?: string;
};
