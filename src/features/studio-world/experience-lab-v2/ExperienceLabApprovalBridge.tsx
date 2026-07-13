import type { ExperienceLabV2ApprovalState, ExperienceLabV2TestMode } from './experience-lab-v2.types';
import { requiresLiveConfirmation } from './experience-lab-v2-test-modes';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';
import { ExperienceLabIcon } from '../icons/ExperienceLabIcon';
import { FOUNDER_REVIEW_ICONS } from './experience-lab-v2-icon-bindings';

type Props = {
  approval: ExperienceLabV2ApprovalState;
  testMode: ExperienceLabV2TestMode;
  onApprove?: () => void;
  onBlockersOpen?: () => void;
};

const STRIP_ACTIONS = [
  { id: 'approve', label: 'APPROVE', primary: true },
  { id: 'changes', label: 'REQUEST CHANGES' },
  { id: 'draft', label: 'SAVE DRAFT' },
  { id: 'export', label: 'EXPORT' },
] as const;

/** Workstation command strip — compact persistent actions, not webpage CTA. */
export function ExperienceLabApprovalBridge({ approval, testMode, onApprove, onBlockersOpen }: Props) {
  const handleApprove = () => {
    if (requiresLiveConfirmation(testMode)) {
      if (!window.confirm('CONTROLLED LIVE: Approve and send to Creative Director Studio?')) return;
    }
    onApprove?.();
  };

  const blocked = !approval.canApprove && approval.disabledReasons.length > 0;

  return (
    <section className="elab-approval-bridge elab-approval-bridge--strip" {...{ [ELAB_V2_COMPOSITION.approvalBridge]: '' }} aria-label="Approval command strip">
      <div className="elab-approval-bridge__review-controls" aria-label="Founder review playback">
        <button type="button" className="elab-approval-bridge__review-btn" aria-label="Previous">
          <ExperienceLabIcon name={FOUNDER_REVIEW_ICONS.previous} size="xs" decorative />
        </button>
        <button type="button" className="elab-approval-bridge__review-btn" aria-label="Play">
          <ExperienceLabIcon name={FOUNDER_REVIEW_ICONS.playback} size="xs" decorative />
        </button>
        <button type="button" className="elab-approval-bridge__review-btn" aria-label="Pause">
          <ExperienceLabIcon name={FOUNDER_REVIEW_ICONS.pause} size="xs" decorative />
        </button>
        <button type="button" className="elab-approval-bridge__review-btn" aria-label="Next">
          <ExperienceLabIcon name={FOUNDER_REVIEW_ICONS.next} size="xs" decorative />
        </button>
        <button type="button" className="elab-approval-bridge__review-btn" aria-label="Capture">
          <ExperienceLabIcon name={FOUNDER_REVIEW_ICONS.capture} size="xs" decorative />
        </button>
      </div>
      <div className="elab-approval-bridge__actions">
        {STRIP_ACTIONS.map((action) => {
          const isPrimary = action.id === 'approve';
          return (
          <button
            key={action.id}
            type="button"
            className={`elab-approval-bridge__action${isPrimary ? ' elab-approval-bridge__action--primary' : ''}`}
            disabled={isPrimary ? !approval.canApprove : false}
            onClick={isPrimary ? handleApprove : undefined}
          >
            {isPrimary ? approval.primaryActionLabel.split(' ').slice(0, 2).join(' ') || action.label : action.label}
          </button>
          );
        })}
      </div>
      {blocked ? (
        <button type="button" className="elab-approval-bridge__blocker-chip" onClick={onBlockersOpen} {...{ [ELAB_V2_COMPOSITION.blockerSheet]: 'trigger' }}>
          {approval.disabledReasons.length} BLOCKERS
        </button>
      ) : (
        <span className="elab-approval-bridge__locks">LOCK BP · RENDER · PLAN</span>
      )}
    </section>
  );
}
