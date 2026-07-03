import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioChipSelect } from '../../../../components/admin/studio/AdminStudioChipSelect';
import { AdminStudioSingleSelect } from '../../../../components/admin/studio/AdminStudioSingleSelect';
import { AdminStudioGenerationPipeline } from '../../../../components/admin/studio/AdminStudioGenerationPipeline';
import { useAdminStudioAiStudioState } from '../../../../hooks/useAdminStudioAiStudioState';
import { listAdminStudioShows } from '../../../../hooks/useAdminStudioEditableState';
import {
  ADMIN_STUDIO_AI_AUDIENCE_OPTIONS,
  ADMIN_STUDIO_AI_DESIRED_OUTPUTS,
  ADMIN_STUDIO_AI_DISTRIBUTION_TARGETS,
  ADMIN_STUDIO_AI_FEATURED_PRODUCTS,
  ADMIN_STUDIO_AI_MEMBERSHIP_TIER_OPTIONS,
  ADMIN_STUDIO_AI_PROMPT_EXAMPLE,
  ADMIN_STUDIO_AI_PROMPT_PLACEHOLDER,
  ADMIN_STUDIO_AI_REWARD_OPTIONS,
} from '../../../../utils/adminStudioAiStudioDemo';
import { AdminStudioEditableField } from '../../../../components/admin/studio/AdminStudioEditableField';

export default function AdminStudioAiStudioPage() {
  const navigate = useNavigate();
  const shows = listAdminStudioShows();
  const {
    form,
    updateForm,
    toggleMulti,
    pipelinePhase,
    activeStepIndex,
    completedSteps,
    startGeneration,
    resetPipeline,
  } = useAdminStudioAiStudioState();

  const showOptions = shows.map((s) => ({ value: s.id, label: s.name }));
  const isGenerating = pipelinePhase === 'running' || pipelinePhase === 'complete';

  return (
    <AdminStudioStageShell
      title="AI STUDIO"
      subtitle="GENERATE MULTI-CHANNEL CONTENT PACKS — DEMO PIPELINE ONLY"
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      {isGenerating ? (
        <AdminStudioGenerationPipeline
          activeStepIndex={activeStepIndex}
          completedSteps={completedSteps}
          isComplete={pipelinePhase === 'complete'}
          onReset={resetPipeline}
        />
      ) : (
        <>
          <p
            className="text-lg mb-3"
            style={{
              fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
              color: '#EB1C24',
            }}
          >
            CREATIVE BRIEF
          </p>

          <div
            className="mb-4 p-3"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderLeft: '2px solid #EB1C24',
            }}
          >
            <label
              className="block text-[8px] font-futura uppercase mb-2 tracking-wider"
              style={{ fontWeight: 515, color: '#9A9A9A' }}
            >
              YOUR PROMPT
            </label>
            <textarea
              rows={5}
              value={form.prompt}
              onChange={(e) => updateForm('prompt', e.target.value)}
              placeholder={ADMIN_STUDIO_AI_PROMPT_PLACEHOLDER}
              className="w-full bg-transparent border-0 text-white text-[11px] font-futura uppercase outline-none resize-none placeholder:text-white/25"
              style={{
                fontWeight: 515,
                lineHeight: 1.55,
                fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                minHeight: '100px',
              }}
            />
            <p
              className="mt-2 text-[7px] font-futura uppercase"
              style={{ fontWeight: 515, color: '#9A9A9A' }}
            >
              EXAMPLE: &ldquo;{ADMIN_STUDIO_AI_PROMPT_EXAMPLE}&rdquo;
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <AdminStudioSingleSelect
              label="SHOW"
              value={form.showId}
              options={showOptions}
              onChange={(v) => updateForm('showId', v)}
            />
            <AdminStudioSingleSelect
              label="AUDIENCE"
              value={form.audience}
              options={ADMIN_STUDIO_AI_AUDIENCE_OPTIONS}
              onChange={(v) => updateForm('audience', v)}
            />
            <AdminStudioSingleSelect
              label="MEMBERSHIP TIER"
              value={form.membershipTier}
              options={ADMIN_STUDIO_AI_MEMBERSHIP_TIER_OPTIONS}
              onChange={(v) => updateForm('membershipTier', v)}
            />
            <AdminStudioChipSelect
              label="FEATURED PRODUCTS"
              options={ADMIN_STUDIO_AI_FEATURED_PRODUCTS}
              selected={form.featuredProducts}
              onToggle={(item) => toggleMulti('featuredProducts', item)}
            />
            <AdminStudioSingleSelect
              label="REWARD"
              value={form.reward}
              options={ADMIN_STUDIO_AI_REWARD_OPTIONS}
              onChange={(v) => updateForm('reward', v)}
            />
            <AdminStudioEditableField
              label="PUBLISH DATE"
              value={form.publishDate}
              onChange={(v) => updateForm('publishDate', v)}
            />
            <AdminStudioChipSelect
              label="DISTRIBUTION TARGETS"
              options={ADMIN_STUDIO_AI_DISTRIBUTION_TARGETS}
              selected={form.distributionTargets}
              onToggle={(item) => toggleMulti('distributionTargets', item)}
            />
            <AdminStudioChipSelect
              label="DESIRED OUTPUTS"
              options={ADMIN_STUDIO_AI_DESIRED_OUTPUTS}
              selected={form.desiredOutputs}
              onToggle={(item) => toggleMulti('desiredOutputs', item)}
            />
          </div>

          <button
            type="button"
            onClick={startGeneration}
            className="w-full py-4 relative overflow-hidden group transition-transform active:scale-[0.99]"
            style={{
              background: 'linear-gradient(135deg, #EB1C24 0%, #8B0000 50%, #EB1C24 100%)',
              backgroundSize: '200% 200%',
              border: '1px solid rgba(255,255,255,0.25)',
              boxShadow: '0 8px 32px rgba(235,28,36,0.35)',
            }}
          >
            <span
              className="block text-[11px] font-futura uppercase tracking-widest"
              style={{ fontWeight: 515, color: '#FFFFFF' }}
            >
              GENERATE CONTENT PACK
            </span>
            <span
              className="block text-[7px] font-futura uppercase mt-1"
              style={{ fontWeight: 515, color: 'rgba(255,255,255,0.75)' }}
            >
              DEMO PIPELINE · ENDS AS DRAFT
            </span>
          </button>

          <p
            className="mt-4 text-[7px] font-futura uppercase text-center"
            style={{ fontWeight: 515, color: '#9A9A9A' }}
          >
            NO AI INTEGRATION · FRONTEND ARCHITECTURE ONLY
          </p>
        </>
      )}
    </AdminStudioStageShell>
  );
}
