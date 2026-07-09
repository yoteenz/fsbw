import { FAT_PIPELINE_STAGES } from '../constants';
import type { FatLaunchStackMilestone, FatOutstandingIssue } from '../types';
import { isGenesisFeedbackComplete } from '../genesis-feedback/feedback-engine';
import { listLaunchStackValidationRecords } from '../validation/registry';

/** Launch Stack Progress™ — milestone validation status across the Launch Stack */
export function buildLaunchStackProgress(): FatLaunchStackMilestone[] {
  return listLaunchStackValidationRecords().map((record) => {
    const arch = record.gates.find((g) => g.level === 'architectural');
    const impl = record.gates.find((g) => g.level === 'implementation');
    const founder = record.gates.find((g) => g.level === 'founder-acceptance');

    const architecturePass =
      arch?.status === 'accepted' || arch?.status === 'graduated';
    const implementationPass =
      impl?.status === 'accepted' || impl?.status === 'graduated';
    const genesisFeedbackComplete = isGenesisFeedbackComplete(record.systemId);

    const launchStackComplete =
      architecturePass &&
      implementationPass &&
      (founder?.status === 'accepted' ||
        founder?.status === 'graduated' ||
        founder?.status === 'conditional') &&
      genesisFeedbackComplete;

    return {
      systemId: record.systemId,
      officialName: record.officialName,
      pipelineStage: record.pipelineStage,
      architecturePass,
      implementationPass,
      founderAcceptanceStatus: founder?.status ?? 'pending',
      genesisFeedbackComplete,
      launchStackComplete,
      overallScore: record.overallScore,
    };
  });
}

export function summarizeLaunchStackProgress(): {
  total: number;
  architectureComplete: number;
  implementationComplete: number;
  founderAccepted: number;
  genesisFeedbackComplete: number;
  launchStackComplete: number;
} {
  const milestones = buildLaunchStackProgress();
  return {
    total: milestones.length,
    architectureComplete: milestones.filter((m) => m.architecturePass).length,
    implementationComplete: milestones.filter((m) => m.implementationPass).length,
    founderAccepted: milestones.filter(
      (m) => m.founderAcceptanceStatus === 'accepted' || m.founderAcceptanceStatus === 'graduated'
    ).length,
    genesisFeedbackComplete: milestones.filter((m) => m.genesisFeedbackComplete).length,
    launchStackComplete: milestones.filter((m) => m.launchStackComplete).length,
  };
}

export function listOutstandingIssues(): FatOutstandingIssue[] {
  return listLaunchStackValidationRecords()
    .flatMap((r) => r.outstandingIssues)
    .sort((a, b) => {
      const severityOrder = { critical: 0, major: 1, minor: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
}

export function buildPipelineSummary(): { stage: (typeof FAT_PIPELINE_STAGES)[number]; count: number }[] {
  const milestones = buildLaunchStackProgress();
  const counts = new Map<(typeof FAT_PIPELINE_STAGES)[number], number>();
  for (const stage of FAT_PIPELINE_STAGES) {
    counts.set(stage, 0);
  }
  for (const m of milestones) {
    counts.set(m.pipelineStage, (counts.get(m.pipelineStage) ?? 0) + 1);
  }
  return FAT_PIPELINE_STAGES.map((stage) => ({
    stage,
    count: counts.get(stage) ?? 0,
  }));
}
