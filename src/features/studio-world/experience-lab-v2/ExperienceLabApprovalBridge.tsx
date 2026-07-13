import type { ExperienceLabV2ApprovalState, ExperienceLabV2TestMode } from './experience-lab-v2.types';
import { requiresLiveConfirmation } from './experience-lab-v2-test-modes';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

type Props = {
  approval: ExperienceLabV2ApprovalState;
  testMode: ExperienceLabV2TestMode;
  onApprove?: () => void;
};

/** Illuminated approval bridge between Experience Lab and CDS. */
export function ExperienceLabApprovalBridge({ approval, testMode, onApprove }: Props) {
  const handleApprove = () => {
    if (requiresLiveConfirmation(testMode)) {
      if (!window.confirm('CONTROLLED LIVE: Approve and send to Creative Director Studio?')) return;
    }
    onApprove?.();
  };

  return (
    <section className="elab-approval-bridge" {...{ [ELAB_V2_COMPOSITION.approvalBridge]: '' }} aria-label="Approval bridge">
      <button
        type="button"
        className="elab-approval-bridge__primary"
        disabled={!approval.canApprove}
        onClick={handleApprove}
      >
        <span className="elab-approval-bridge__glow" aria-hidden />
        {approval.primaryActionLabel}
        <span className="elab-approval-bridge__arrow">→</span>
      </button>
      <p className="elab-approval-bridge__locks">
        LOCK BLUEPRINT · LOCK RENDER · LOCK CONSTRUCTION PLAN
      </p>
      {!approval.canApprove && approval.disabledReasons.length ? (
        <p className="elab-approval-bridge__blocked">{approval.disabledReasons.join(' · ')}</p>
      ) : null}
    </section>
  );
}
