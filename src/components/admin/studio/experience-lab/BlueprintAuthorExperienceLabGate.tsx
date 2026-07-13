import { useCallback, useState } from 'react';
import type { CreativePreviewCompanyId } from '../../../../studio-os-core/creative-studio-preview';
import { useBlueprintAuthorWorkflow } from '../../../../hooks/useBlueprintAuthorWorkflow';
import { BlueprintAuthorRequestForm } from '../blueprint-author-ui/BlueprintAuthorRequestForm';
import { BlueprintAuthorWorkflowShell } from '../blueprint-author-ui/BlueprintAuthorWorkflowShell';

type Props = {
  companyId: CreativePreviewCompanyId;
  conceptId: 'a' | 'b' | 'c';
  defaultIntent?: string;
  children: React.ReactNode;
};

/**
 * Gates Experience Lab creative render behind Blueprint Author approval.
 * Children (World Compiler preview) render only after founder approves manufacturing.
 */
export function BlueprintAuthorExperienceLabGate({ companyId, conceptId, defaultIntent, children }: Props) {
  const workflow = useBlueprintAuthorWorkflow();
  const [intent, setIntent] = useState(
    defaultIntent ?? `Environmental intelligence preview for ${companyId} concept ${conceptId.toUpperCase()}`
  );

  const submit = useCallback(() => {
    workflow.submitRequest({
      source: 'experience-lab',
      organizationId: companyId,
      founderIntent: intent,
      roomType: 'reception',
      stationId: `xelab-${companyId}-${conceptId}`,
      departmentId: 'executive',
      projectId: 'experience-lab',
    });
  }, [workflow, companyId, conceptId, intent]);

  return (
    <div data-blueprint-xelab-gate>
      {workflow.step === 'idle' ? (
        <div style={{ padding: '0 16px 16px' }}>
          <BlueprintAuthorRequestForm
            value={intent}
            onChange={setIntent}
            onSubmit={submit}
            isLoading={workflow.isAuthoring}
            label="Founder request — Experience Lab"
            placeholder="e.g. Executive reception with landmark, seating, and concierge desk for this environment…"
          />
        </div>
      ) : (
        <BlueprintAuthorWorkflowShell workflow={workflow} renderAfterApproval={workflow.isApproved ? children : null} />
      )}
      {workflow.step === 'idle' ? (
        <p style={{ padding: '0 16px', fontSize: '10px', color: '#9ca3af' }}>
          World Compiler render is locked until Construction Plan approval.
        </p>
      ) : null}
    </div>
  );
}
