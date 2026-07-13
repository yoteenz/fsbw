import { useCallback, useState } from 'react';
import { useBlueprintAuthorWorkflow } from '../../../../hooks/useBlueprintAuthorWorkflow';
import { BlueprintAuthorRequestForm } from './BlueprintAuthorRequestForm';
import { BlueprintAuthorWorkflowShell } from './BlueprintAuthorWorkflowShell';

type Props = {
  topic: string;
  contentPurpose: string;
  environment: string;
  onProceedToAiStudio: () => void;
};

/** Creative Director Studio — Blueprint Author entry before AI Studio. */
export function BlueprintAuthorCreativeDirectorGate({
  topic,
  contentPurpose,
  environment,
  onProceedToAiStudio,
}: Props) {
  const workflow = useBlueprintAuthorWorkflow();
  const [intent, setIntent] = useState(
    () => `${topic.trim() || 'Creative campaign'} — ${contentPurpose} — ${environment.slice(0, 200)}`
  );

  const submit = useCallback(() => {
    workflow.submitRequest({
      source: 'creative-director',
      organizationId: 'frontal-slayer',
      founderIntent: intent,
      roomType: 'campaign-studio',
      stationId: 'creative-director',
      departmentId: 'creative',
      projectId: 'creative-director-studio',
      styleProfileId: 'executive-reception',
    });
  }, [workflow, intent]);

  if (workflow.step === 'idle') {
    return (
      <div
        data-blueprint-cds-gate
        className="mt-4 p-3 border bg-white/70"
        style={{ borderColor: 'rgba(0,0,0,0.12)' }}
      >
        <BlueprintAuthorRequestForm
          value={intent}
          onChange={setIntent}
          onSubmit={submit}
          isLoading={workflow.isAuthoring}
          label="Founder request — Creative Director"
          placeholder="Logo, campaign, packaging, photography, video — describe the creative build…"
        />
      </div>
    );
  }

  return (
    <BlueprintAuthorWorkflowShell
      workflow={workflow}
      renderAfterApproval={
        workflow.isApproved ? (
          <div className="p-3 border bg-white/80" style={{ borderColor: 'rgba(22,163,74,0.3)' }}>
            <p className="text-[8px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: '#16A34A' }}>
              MANUFACTURING APPROVED — PROCEED TO AI STUDIO
            </p>
            <button
              type="button"
              onClick={onProceedToAiStudio}
              className="w-full py-2 text-[7px] font-futura uppercase border"
              style={{ fontWeight: 515, color: '#FFFFFF', background: '#EB1C24', borderColor: '#EB1C24' }}
            >
              PROCEED TO AI STUDIO →
            </button>
          </div>
        ) : null
      }
    />
  );
}
