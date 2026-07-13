import type { ExperienceLabV2ApprovalState, ExperienceLabV2TestMode } from './experience-lab-v2.types';
import { requiresLiveConfirmation } from './experience-lab-v2-test-modes';

type Props = {
  approval: ExperienceLabV2ApprovalState;
  testMode: ExperienceLabV2TestMode;
  onApprove?: () => void;
  onRequestRevision?: () => void;
  onOpenDiagnostics?: () => void;
};

export function ExperienceLabApprovalBar({ approval, testMode, onApprove, onRequestRevision, onOpenDiagnostics }: Props) {
  const needsConfirm = requiresLiveConfirmation(testMode);

  const handleApprove = () => {
    if (needsConfirm) {
      const ok = window.confirm('CONTROLLED LIVE: This action may mutate production. Continue?');
      if (!ok) return;
    }
    onApprove?.();
  };

  return (
    <section className="elab-v2__approval" data-elab-approval-bar>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          className="elab-v2__mode-btn"
          disabled={!approval.canApprove}
          onClick={handleApprove}
          style={{
            borderColor: approval.canApprove ? 'var(--elab-accent)' : undefined,
            color: approval.canApprove ? 'var(--elab-accent)' : undefined,
            fontWeight: 800,
            minHeight: 48,
          }}
        >
          {approval.primaryActionLabel}
        </button>
        <button type="button" className="elab-v2__mode-btn" onClick={onRequestRevision}>
          Request Revision
        </button>
        <button type="button" className="elab-v2__mode-btn" onClick={onOpenDiagnostics}>
          Open Diagnostics
        </button>
        <button type="button" className="elab-v2__mode-btn" disabled>
          Save Draft
        </button>
        <button type="button" className="elab-v2__mode-btn" disabled>
          Export Review Packet
        </button>
      </div>
      {!approval.canApprove && approval.disabledReasons.length ? (
        <p style={{ margin: '8px 0 0', fontSize: 9, color: 'var(--elab-text-muted)' }}>
          Approval blocked: {approval.disabledReasons.join(' · ')}
        </p>
      ) : null}
      <p style={{ margin: '6px 0 0', fontSize: 8, color: 'var(--elab-text-muted)' }}>
        {testMode === 'MOCK' || testMode === 'READ_ONLY' ? 'UI PREVIEW MODE — no production writes' : 'LIVE BACKEND MODE — confirmation required'}
      </p>
    </section>
  );
}
