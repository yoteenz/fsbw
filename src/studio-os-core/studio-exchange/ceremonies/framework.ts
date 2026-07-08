import type { CeremonyRunState } from './schema';
import { getCeremonyTemplate } from './templates';

function ceremonyId(): string {
  return `ceremony-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function startCertificationCeremony(input: {
  licenseId: string;
  certificationId: string;
  templateId: string;
}): CeremonyRunState {
  const template = getCeremonyTemplate(input.templateId);
  if (!template) {
    throw new Error(`Unknown ceremony template: ${input.templateId}`);
  }

  return {
    ceremonyId: ceremonyId(),
    licenseId: input.licenseId,
    certificationId: input.certificationId,
    templateId: input.templateId,
    currentStageIndex: 0,
    completedStageIds: [],
    startedAt: new Date().toISOString(),
  };
}

export function advanceCeremonyStage(run: CeremonyRunState): CeremonyRunState {
  const template = getCeremonyTemplate(run.templateId);
  if (!template) return run;

  const currentStage = template.stages[run.currentStageIndex];
  if (!currentStage) {
    return { ...run, completedAt: run.completedAt ?? new Date().toISOString() };
  }

  const completedStageIds = [...run.completedStageIds, currentStage.id];
  const nextIndex = run.currentStageIndex + 1;
  const nextStage = template.stages[nextIndex];
  const patch: Partial<CeremonyRunState> = {
    completedStageIds,
    currentStageIndex: nextIndex,
  };

  if (currentStage.id === 'mentor-dialogue') {
    patch.mentorDialogue = 'Your mentor acknowledges the discipline you have earned in this profession.';
  }
  if (currentStage.id === 'crystal-credential') {
    patch.crystalCredentialRef = `credential://${run.certificationId}`;
  }
  if (currentStage.id === 'community-celebration') {
    patch.communityAnnouncement = 'The Career World announces your certification to the community.';
  }
  if (currentStage.id === 'professional-memory') {
    patch.professionalMemoryRecordId = `memory://${run.certificationId}`;
  }
  if (!nextStage) {
    patch.completedAt = new Date().toISOString();
  }

  return { ...run, ...patch };
}

export function isCeremonyComplete(run: CeremonyRunState): boolean {
  const template = getCeremonyTemplate(run.templateId);
  if (!template) return false;
  return run.completedStageIds.length >= template.stages.length;
}
