import type { MANUAL_DOCUMENT_TYPES, SYNC_TRIGGER_TYPES } from './constants';

export type ManualDocumentType = (typeof MANUAL_DOCUMENT_TYPES)[number];
export type SyncTriggerType = (typeof SYNC_TRIGGER_TYPES)[number];

export type ManualDocumentSection = {
  id: string;
  type: ManualDocumentType;
  label: string;
  summary: string;
  content: string;
  sourceModule: string;
  lastSyncedAt: string;
  current: boolean;
  searchable: true;
};

export type SearchableAnswer = {
  id: string;
  question: string;
  answer: string;
  sourceDocumentType: ManualDocumentType;
  confidencePct: number;
  keywords: string[];
};

export type LiveSyncEvent = {
  id: string;
  trigger: SyncTriggerType;
  label: string;
  description: string;
  documentsUpdated: string[];
  occurredAt: string;
};

export type OrganizationOperatingManualProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  manualCompletenessScore: number;
  documentsGenerated: number;
  documentsCurrent: number;
  searchableAnswers: number;
  recentSyncEvents: number;
  documents: ManualDocumentSection[];
  searchableQa: SearchableAnswer[];
  syncEvents: LiveSyncEvent[];
  dockManualLine: string;
  singleSourceOfTruth: true;
  syncedSources: string[];
};

export type OrganizationOperatingManualStore = {
  version: string;
  profiles: OrganizationOperatingManualProfile[];
};

export type OrganizationOperatingManualDockAdvice = {
  response: string;
  concierge: string;
  manualCompletenessScore?: number;
  documentsGenerated?: number;
};
