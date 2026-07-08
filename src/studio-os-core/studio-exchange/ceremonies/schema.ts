import type { CeremonyStageId } from '../types';

export type CeremonyStageDefinition = {
  id: CeremonyStageId;
  label: string;
  narrativeBeat: string;
  durationSeconds: number;
};

export type CeremonyTemplate = {
  id: string;
  displayName: string;
  stages: CeremonyStageDefinition[];
};

export type CeremonyRunState = {
  ceremonyId: string;
  licenseId: string;
  certificationId: string;
  templateId: string;
  currentStageIndex: number;
  completedStageIds: CeremonyStageId[];
  startedAt: string;
  completedAt?: string;
  mentorDialogue?: string;
  crystalCredentialRef?: string;
  communityAnnouncement?: string;
  professionalMemoryRecordId?: string;
};
