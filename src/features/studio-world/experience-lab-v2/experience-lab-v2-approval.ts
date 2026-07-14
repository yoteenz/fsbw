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
    disabledReasons.push('ADMIN PERMISSION REQUIRED');
  }
  if (input.approvalRecorded) {
    disabledReasons.push('APPROVAL ALREADY RECORDED');
  }
  if (!canPerformProductionWrite(input.testMode)) {
    disabledReasons.push(`APPROVAL DISABLED IN ${input.testMode} MODE`);
  }
  if (!input.founderRender) {
    disabledReasons.push('NO FOUNDER RENDER JOB');
  } else {
    if (!canApproveFounderRender(input.founderRender, input.imageLoaded)) {
      if (input.founderRender.status !== 'ready' && input.founderRender.status !== 'approved') {
        disabledReasons.push(`FOUNDER RENDER STATUS: ${input.founderRender.status.toUpperCase()}`);
      }
      if (input.founderRender.isStale) disabledReasons.push('STALE REFERENCE WARNING');
      if (!input.founderRender.previewArtifactUrl) disabledReasons.push('ARTIFACT NOT LOADED');
      if (!input.imageLoaded) disabledReasons.push('IMAGE NOT LOADED');
      if (input.founderRender.blueprintRevision !== input.founderRender.currentBlueprintRevision) {
        disabledReasons.push('BLUEPRINT REVISION MISMATCH');
      }
    }
  }
  if (input.blueprintRevision <= 0) {
    disabledReasons.push('BLUEPRINT REVISION UNAVAILABLE');
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
