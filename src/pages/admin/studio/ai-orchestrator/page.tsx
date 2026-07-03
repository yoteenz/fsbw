import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioTabBar } from '../../../../components/admin/studio/AdminStudioTabBar';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioEditableField } from '../../../../components/admin/studio/AdminStudioEditableField';
import { useAdminStudioOrchestrator } from '../../../../hooks/useAdminStudioOrchestratorState';
import {
  ADMIN_STUDIO_ORCHESTRATOR_SUBTITLE,
  APPROVAL_PIPELINE_STATUSES,
  ORCHESTRATOR_ERROR_LABELS,
  type OrchestratorProviderId,
} from '../../../../utils/adminStudioOrchestratorDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

type OrchTab = 'pipeline' | 'adapters' | 'packaging' | 'approval' | 'errors';

const ORCH_TABS: Array<{ id: OrchTab; label: string }> = [
  { id: 'pipeline', label: 'PIPELINE' },
  { id: 'adapters', label: 'ADAPTERS' },
  { id: 'packaging', label: 'PACKAGING' },
  { id: 'approval', label: 'APPROVAL' },
  { id: 'errors', label: 'ERRORS' },
];

export default function AdminStudioAiOrchestratorPage() {
  const navigate = useNavigate();
  const {
    adapterRegistry,
    pipelineSteps,
    adapterStates,
    pack,
    topic,
    pipelineProgress,
    toggleAdapter,
    planGeneration,
    packageDemo,
    retryFailedStep,
    setApproval,
    setTopic,
  } = useAdminStudioOrchestrator();
  const [tab, setTab] = useState<OrchTab>('pipeline');

  return (
    <AdminStudioStageShell
      title="AI ORCHESTRATOR"
      subtitle={ADMIN_STUDIO_ORCHESTRATOR_SUBTITLE}
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      <AdminStudioEditableField label="PACK TOPIC" value={topic} onChange={setTopic} />

      <div className="flex gap-2 my-3">
        <button type="button" onClick={planGeneration} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.7)' }}>
          PLAN GENERATION
        </button>
        <button type="button" onClick={packageDemo} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: '#FFFFFF', background: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          PACKAGE DRAFT
        </button>
      </div>

      <AdminStudioTabBar tabs={ORCH_TABS} activeTab={tab} onTabChange={setTab} />

      {tab === 'pipeline' ? (
        <div className="space-y-3 mt-3">
          <AdminStudioSectionHeading>CONTENT GENERATION PIPELINE</AdminStudioSectionHeading>
          <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            PROGRESS {pipelineProgress}% · NO PROVIDER BYPASS
          </p>
          <div className="flex flex-col items-center gap-0">
            {pipelineSteps.map((step, i) => {
              const packStep = pack?.pipelineStep;
              const idx = pipelineSteps.findIndex((s) => s.id === packStep);
              const isDone = pack ? i < idx : false;
              const isActive = pack ? i === idx : step.id === 'topic';
              return (
                <div key={step.id} className="w-full flex flex-col items-center">
                  {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
                  <div
                    className="w-full px-3 py-1.5 border text-[7px] font-futura uppercase text-center"
                    style={{
                      fontWeight: 515,
                      color: isActive ? ADMIN_STUDIO_THEME.accent : isDone ? '#16A34A' : ADMIN_STUDIO_THEME.textSecondary,
                      background: isActive ? ADMIN_STUDIO_THEME.selectedBg : ADMIN_STUDIO_THEME.panelBg,
                      borderColor: ADMIN_STUDIO_THEME.panelBorder,
                    }}
                  >
                    {isDone ? '✓ ' : ''}{step.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {tab === 'adapters' ? (
        <div className="space-y-2 mt-3">
          <AdminStudioSectionHeading>PROVIDER ADAPTERS</AdminStudioSectionHeading>
          <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            STUDIO → ORCHESTRATOR → ADAPTERS · PROVIDERS INTERCHANGEABLE
          </p>
          {adapterRegistry.map((adapter) => {
            const st = adapterStates[adapter.id];
            return (
              <div key={adapter.id} className="p-3 border bg-white/70" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                <div className="flex justify-between items-start gap-2 mb-1">
                  <p className="text-[9px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>{adapter.label}</p>
                  <button type="button" onClick={() => toggleAdapter(adapter.id as OrchestratorProviderId)} className="text-[6px] font-futura uppercase px-2 py-0.5 border" style={{ fontWeight: 515, color: st.enabled ? '#16A34A' : ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                    {st.enabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
                <p className="text-[6px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{st.statusMessage}</p>
                <p className="text-[6px] font-futura uppercase leading-relaxed" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {adapter.responsibilities.join(' · ')}
                </p>
              </div>
            );
          })}
        </div>
      ) : null}

      {tab === 'packaging' ? (
        <div className="space-y-2 mt-3">
          <AdminStudioSectionHeading>CONTENT PACKAGING</AdminStudioSectionHeading>
          {!pack ? (
            <p className="text-[7px] font-futura uppercase py-4 text-center" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              TAP PLAN GENERATION OR PACKAGE DRAFT
            </p>
          ) : (
            <>
              <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                PACK {pack.packId} · {pack.assets.length} ASSETS · {pack.versions.length} VERSION(S)
              </p>
              {pack.assets.map((asset) => (
                <div key={asset.slotId} className="p-2 border bg-white/60" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                  <div className="flex justify-between">
                    <span className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{asset.label}</span>
                    <span className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{asset.providerId.toUpperCase()} · {asset.status}</span>
                  </div>
                  {asset.preview ? (
                    <p className="text-[6px] font-futura uppercase mt-0.5" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{asset.preview}</p>
                  ) : null}
                </div>
              ))}
              {pack.versions[0] ? (
                <div className="p-2.5 mt-2" style={{ background: ADMIN_STUDIO_THEME.panelBg, border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}` }}>
                  <p className="text-[7px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>VERSION {pack.versions[0].versionNumber}</p>
                  <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                    PROMPT: {pack.versions[0].promptUsed}
                  </p>
                  <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    HISTORY: {pack.versions[0].approvalHistory.join(' → ')}
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {tab === 'approval' ? (
        <div className="space-y-3 mt-3">
          <AdminStudioSectionHeading>APPROVAL PIPELINE</AdminStudioSectionHeading>
          <div className="flex flex-wrap gap-1">
            {APPROVAL_PIPELINE_STATUSES.map((s) => (
              <span key={s.id} className="text-[6px] font-futura uppercase px-2 py-1 border" style={{ fontWeight: 515, color: s.color, borderColor: `${s.color}44`, background: pack?.approvalStatus === s.id ? `${s.color}11` : 'transparent' }}>
                {s.label}
              </span>
            ))}
          </div>
          <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            NEVER AUTO-PUBLISH · CURRENT: {pack?.approvalStatus?.toUpperCase() ?? 'NO PACK'}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {(['needs-review', 'approved', 'scheduled', 'archived'] as const).map((status) => (
              <button key={status} type="button" disabled={!pack} onClick={() => setApproval(status)} className="py-2 text-[7px] font-futura uppercase border bg-white/70 disabled:opacity-40" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                SET {status.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {tab === 'errors' ? (
        <div className="space-y-2 mt-3">
          <AdminStudioSectionHeading>ERROR HANDLING</AdminStudioSectionHeading>
          {(Object.keys(ORCHESTRATOR_ERROR_LABELS) as Array<keyof typeof ORCHESTRATOR_ERROR_LABELS>).map((code) => (
            <div key={code} className="p-2 border bg-white/60" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>{code}</p>
              <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{ORCHESTRATOR_ERROR_LABELS[code]}</p>
            </div>
          ))}
          {pack?.steps.filter((s) => s.status === 'skipped' || s.status === 'failed').map((step) => (
            <button key={step.stepId} type="button" onClick={() => retryFailedStep(step.stepId)} className="w-full py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              RETRY {step.stepId.toUpperCase()}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => navigate('/admin/studio/intelligence-engine')} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          ← INTELLIGENCE
        </button>
        <button type="button" onClick={() => navigate('/admin/studio/creative-director')} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          CREATIVE DIRECTOR
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        ORCHESTRATOR NEVER BYPASSED · PROVIDERS NOT CONNECTED · EMAIL ADAPTER DOES NOT AUTO-SEND
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
