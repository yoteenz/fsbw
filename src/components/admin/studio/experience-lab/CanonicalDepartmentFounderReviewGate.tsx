import { useEffect, useMemo, useState } from 'react';
import type { CanonicalMainDepartmentId } from '../../../../studio-os-core/canonical-studio-world/canonical-department-registry';
import { getCanonicalDepartmentRecord } from '../../../../studio-os-core/canonical-studio-world/canonical-department-registry';
import { resolveDepartmentCharter } from '../../../../studio-os-core/canonical-studio-world/department-charters';
import { useBlueprintAuthorWorkflow } from '../../../../hooks/useBlueprintAuthorWorkflow';
import { BlueprintAuthorRequestForm } from '../blueprint-author-ui/BlueprintAuthorRequestForm';
import { BlueprintAuthorWorkflowShell } from '../blueprint-author-ui/BlueprintAuthorWorkflowShell';

type Props = {
  departmentId: CanonicalMainDepartmentId | null;
  children?: React.ReactNode;
};

/**
 * Gates canonical department batch generation behind NBP Founder Render approval —
 * same pipeline as Industry Pack HQ Founder Review.
 */
export function CanonicalDepartmentFounderReviewGate({ departmentId, children }: Props) {
  const workflow = useBlueprintAuthorWorkflow();
  const record = departmentId ? getCanonicalDepartmentRecord(departmentId) : null;
  const charter = departmentId ? resolveDepartmentCharter(departmentId) : null;

  const defaultIntent = useMemo(() => {
    if (!record || !charter) return '';
    return `${record.name} — ${charter.mission}`;
  }, [record, charter]);

  const [intent, setIntent] = useState(defaultIntent);

  useEffect(() => {
    setIntent(defaultIntent);
    workflow.reset();
  }, [departmentId]);

  const approvalMatchesSelection =
    workflow.isPreviewApproved &&
    workflow.previewApprovedDepartmentId != null &&
    workflow.previewApprovedDepartmentId === departmentId;

  if (!departmentId || !record) return null;

  return (
    <section style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }} data-canonical-founder-review-gate>
      <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#eb1c24' }}>
        FOUNDER RENDER REVIEW (NBP)
      </p>
      <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#555', lineHeight: 1.5 }}>
        Approve the photoreal full-room Founder Render before queuing batch generation — same gate as Industry Pack HQ
        planning.
      </p>

      {workflow.step === 'idle' ? (
        <div style={{ padding: '0 0 8px' }}>
          <BlueprintAuthorRequestForm
            value={intent}
            onChange={setIntent}
            onSubmit={() => workflow.openCanonicalDepartment(departmentId)}
            isLoading={workflow.isAuthoring}
            label="Canonical department intent"
            placeholder={`e.g. Approve ${record.name} — global Studio World infrastructure…`}
          />
        </div>
      ) : (
        <BlueprintAuthorWorkflowShell workflow={workflow} approvalMode="preview-only" />
      )}

      {!approvalMatchesSelection ? (
        <p style={{ margin: '12px 0 0', padding: 10, background: '#fff7ed', borderRadius: 8, fontSize: '11px', color: '#9a3412' }}>
          Generate and <strong>Approve Preview</strong> the NBP full-room render above before batch queue unlocks.
        </p>
      ) : (
        <p style={{ margin: '12px 0 0', padding: 10, background: '#ecfdf5', borderRadius: 8, fontSize: '11px', color: '#166534' }}>
          Preview approved for {record.name}. Batch generation unlocked.
        </p>
      )}

      {approvalMatchesSelection ? <div style={{ marginTop: 12 }}>{children}</div> : null}
    </section>
  );
}
