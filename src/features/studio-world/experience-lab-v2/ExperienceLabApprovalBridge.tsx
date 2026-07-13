import type { ExperienceLabV2ApprovalState, ExperienceLabV2TestMode } from './experience-lab-v2.types';
import { requiresLiveConfirmation } from './experience-lab-v2-test-modes';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

type Props = {
  approval: ExperienceLabV2ApprovalState;
  testMode: ExperienceLabV2TestMode;
  isCompact?: boolean;
  onApprove?: () => void;
  onBlockersOpen?: () => void;
};

/** Illuminated approval bridge — compact on mobile with blocker sheet. */
export function ExperienceLabApprovalBridge({ approval, testMode, isCompact, onApprove, onBlockersOpen }: Props) {
  const handleApprove = () => {
    if (requiresLiveConfirmation(testMode)) {
      if (!window.confirm('CONTROLLED LIVE: Approve and send to Creative Director Studio?')) return;
    }
    onApprove?.();
  };

  const blocked = !approval.canApprove && approval.disabledReasons.length > 0;

  return (
    <section className={`elab-approval-bridge${isCompact ? ' elab-approval-bridge--compact' : ''}`} {...{ [ELAB_V2_COMPOSITION.approvalBridge]: '' }} aria-label="Approval bridge">
      <button
        type="button"
        className="elab-approval-bridge__primary"
        disabled={!approval.canApprove}
        onClick={handleApprove}
      >
        <span className="elab-approval-bridge__glow" aria-hidden />
        <span className="elab-approval-bridge__label">{approval.primaryActionLabel}</span>
        <span className="elab-approval-bridge__arrow">→</span>
      </button>
      <p className="elab-approval-bridge__locks">LOCK BLUEPRINT · LOCK RENDER · LOCK CONSTRUCTION PLAN</p>
      {blocked ? (
        isCompact ? (
          <button type="button" className="elab-approval-bridge__blocker-chip" onClick={onBlockersOpen} {...{ [ELAB_V2_COMPOSITION.blockerSheet]: 'trigger' }}>
            APPROVAL BLOCKED · {approval.disabledReasons.length} REQUIREMENTS
          </button>
        ) : (
          <p className="elab-approval-bridge__blocked">{approval.disabledReasons.join(' · ')}</p>
        )
      ) : null}
    </section>
  );
}
