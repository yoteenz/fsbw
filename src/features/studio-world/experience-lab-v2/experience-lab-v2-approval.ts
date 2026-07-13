import { canApproveFounderRender, type FounderRenderJobView } from '../../../studio-os-core/founder-render';
import type { ExperienceLabV2ApprovalState, ExperienceLabV2TestMode } from './experience-lab-v2.types';
import { canPerformProductionWrite } from './experience-lab-v2-test-modes';

export function evaluateExperienceLabV2Approval(input: {
  founderRender: FounderRenderJobView | null;
  imageLoaded: boolean;
  blueprintRevision: number;
  testMode: ExperienceLabV2TestMode;
  approvalRecorded: boolean;
  hasAdminPermission: boolean;
}): ExperienceLabV2ApprovalState {
  const disabledReasons: string[] = [];

  if (!input.hasAdminPermission) {
    disabledReasons.push('Admin permission required');
  }
  if (input.approvalRecorded) {
    disabledReasons.push('Approval already recorded');
  }
  if (!canPerformProductionWrite(input.testMode)) {
    disabledReasons.push(`Approval disabled in ${input.testMode} mode`);
  }
  if (!input.founderRender) {
    disabledReasons.push('No Founder Render job');
  } else {
    if (!canApproveFounderRender(input.founderRender, input.imageLoaded)) {
      if (input.founderRender.status !== 'ready' && input.founderRender.status !== 'approved') {
        disabledReasons.push(`Founder Render status: ${input.founderRender.status}`);
      }
      if (input.founderRender.isStale) disabledReasons.push('Stale reference warning');
      if (!input.founderRender.previewArtifactUrl) disabledReasons.push('Artifact not loaded');
      if (!input.imageLoaded) disabledReasons.push('Image not loaded');
      if (input.founderRender.blueprintRevision !== input.founderRender.currentBlueprintRevision) {
        disabledReasons.push('Blueprint revision mismatch');
      }
    }
  }
  if (input.blueprintRevision <= 0) {
    disabledReasons.push('Blueprint revision unavailable');
  }

  const canApprove = disabledReasons.length === 0;

  return {
    canApprove,
    disabledReasons,
    primaryActionLabel: 'APPROVE & SEND TO CREATIVE DIRECTOR STUDIO',
    permitStatus: input.founderRender?.isStale ? 'blocked' : 'clear',
    approvalRecorded: input.approvalRecorded,
  };
}
