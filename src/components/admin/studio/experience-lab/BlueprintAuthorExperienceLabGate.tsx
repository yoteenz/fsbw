import { useCallback, useState } from 'react';
import type { ExperienceLabIndustryPackOptionId } from '../../../../studio-os-core/canonical-studio-world';
import { useBlueprintAuthorWorkflow } from '../../../../hooks/useBlueprintAuthorWorkflow';
import { BlueprintAuthorRequestForm } from '../blueprint-author-ui/BlueprintAuthorRequestForm';
import { BlueprintAuthorWorkflowShell } from '../blueprint-author-ui/BlueprintAuthorWorkflowShell';

type Props = {
  packOptionId: ExperienceLabIndustryPackOptionId;
  industryPackId: string;
  companyHqOrganizationId: string;
  conceptId: 'a' | 'b' | 'c';
  defaultIntent?: string;
  children: React.ReactNode;
};

/**
 * Gates Experience Lab HQ planning behind Blueprint Author approval.
 * Uses Industry Pack + Company HQ org — not deprecated company switcher IDs.
 */
export function BlueprintAuthorExperienceLabGate({
  packOptionId,
  industryPackId,
  companyHqOrganizationId,
  conceptId,
  defaultIntent,
  children,
}: Props) {
  const workflow = useBlueprintAuthorWorkflow();
  const [intent, setIntent] = useState(
    defaultIntent ?? `Industry Pack ${industryPackId} — headquarters planning (${packOptionId})`
  );

  const submit = useCallback(() => {
    workflow.submitRequest({
      source: 'experience-lab',
      organizationId: companyHqOrganizationId,
      founderIntent: intent,
      roomType: 'headquarters',
      stationId: `xelab-pack-${industryPackId}-${conceptId}`,
      departmentId: 'experience-lab',
      projectId: industryPackId,
    });
  }, [workflow, companyHqOrganizationId, industryPackId, packOptionId, conceptId, intent]);

  return (
    <div data-blueprint-xelab-gate data-industry-pack={industryPackId}>
      {workflow.step === 'idle' ? (
        <div style={{ padding: '0 16px 16px' }}>
          <BlueprintAuthorRequestForm
            value={intent}
            onChange={setIntent}
            onSubmit={submit}
            isLoading={workflow.isAuthoring}
            label="Founder request — Industry Pack HQ"
            placeholder="e.g. Approve Hair Brand Pack headquarters — reception, showroom, atelier, content studio…"
          />
        </div>
      ) : (
        <BlueprintAuthorWorkflowShell workflow={workflow} renderAfterApproval={workflow.isApproved ? children : null} />
      )}
      {workflow.step === 'idle' ? (
        <p style={{ padding: '0 16px', fontSize: '10px', color: '#9ca3af' }}>
          HQ manufacturing is locked until entire Industry Pack is approved and handed to Creative Director Studio.
        </p>
      ) : null}
    </div>
  );
}
