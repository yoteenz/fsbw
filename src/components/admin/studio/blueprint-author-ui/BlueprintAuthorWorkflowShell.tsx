import type { ReactNode } from 'react';
import type { UseBlueprintAuthorWorkflowReturn } from '../../../../hooks/useBlueprintAuthorWorkflow';
import { FounderReviewExperience } from './FounderReviewExperience';

type Props = {
  workflow: UseBlueprintAuthorWorkflowReturn;
  renderAfterApproval?: ReactNode;
  approvalMode?: 'build' | 'preview-only';
};

/**
 * Blueprint Author workflow shell — delegates to Founder Review Experience™.
 */
export function BlueprintAuthorWorkflowShell({ workflow, renderAfterApproval, approvalMode = 'build' }: Props) {
  if (workflow.step === 'idle') return null;

  if (!workflow.bundle || !workflow.summary) {
    return (
      <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
        <p style={{ color: '#eb1c24' }}>Blueprint Author session unavailable.</p>
      </div>
    );
  }

  return <FounderReviewExperience workflow={workflow} renderAfterApproval={renderAfterApproval} approvalMode={approvalMode} />;
}
