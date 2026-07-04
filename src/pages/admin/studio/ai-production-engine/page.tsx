import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioAiProductionDepartmentCard } from '../../../../components/admin/studio/AdminStudioAiProductionDepartmentCard';
import { AdminStudioAiProductionRunCard } from '../../../../components/admin/studio/AdminStudioAiProductionRunCard';
import { AdminStudioAiProductionLiveMonitor } from '../../../../components/admin/studio/AdminStudioAiProductionLiveMonitor';
import { AdminStudioCreativeScoreRing } from '../../../../components/admin/studio/AdminStudioCreativeWidget';
import { useAdminStudioAiProductionEngine } from '../../../../hooks/useAdminStudioAiProductionEngineState';
import {
  ADMIN_STUDIO_AI_PRODUCTION_ENGINE_SUBTITLE,
  AI_PRODUCTION_DEPARTMENTS,
  AI_PRODUCTION_FLOW_STEPS,
  AI_PRODUCTION_INHERITANCE_CHAIN,
  AI_PRODUCTION_QUALITY_THRESHOLD,
} from '../../../../utils/adminStudioAiProductionEngineDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioAiProductionEnginePage() {
  const navigate = useNavigate();
  const { runs, activeRun, addRun, pauseProduction, resumeProduction, advanceDemo } = useAdminStudioAiProductionEngine();
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [monitorRunId, setMonitorRunId] = useState<string | null>(null);

  const monitorRun = runs.find((r) => r.id === monitorRunId) ?? activeRun;

  const handleAdd = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const id = addRun(trimmed);
    setNewTitle('');
    setAdding(false);
    navigate(`/admin/studio/ai-production-engine/${id}`);
  };

  return (
    <AdminStudioStageShell
      title="AI PRODUCTION ENGINE"
      subtitle={ADMIN_STUDIO_AI_PRODUCTION_ENGINE_SUBTITLE}
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          EXECUTION TEAM — CREATIVE DECISIONS ORIGINATE UPSTREAM · PROVIDERS HIDDEN BEHIND DEPARTMENTS
        </p>
        <div className="flex flex-col items-center gap-0">
          {AI_PRODUCTION_INHERITANCE_CHAIN.map((step, i) => (
            <div key={step} className="w-full flex flex-col items-center">
              {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
              <div
                className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border"
                style={{
                  fontWeight: 515,
                  color: step === 'AI PRODUCTION ENGINE' ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                  background: step === 'AI PRODUCTION ENGINE' ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdminStudioSectionHeading>AI TEAM — PRODUCTION DEPARTMENTS</AdminStudioSectionHeading>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {AI_PRODUCTION_DEPARTMENTS.map((dept) => (
          <AdminStudioAiProductionDepartmentCard
            key={dept.id}
            departmentId={dept.id}
            title={dept.title}
            description={dept.description}
            metric={dept.metric}
          />
        ))}
      </div>

      <AdminStudioSectionHeading>PRODUCTION FLOW</AdminStudioSectionHeading>
      <div className="flex flex-col items-center gap-0 mb-4">
        <div className="w-full px-2 py-1 text-[6px] font-futura uppercase text-center border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.7)' }}>
          APPROVED CONTENT PACK
        </div>
        {AI_PRODUCTION_FLOW_STEPS.map((step) => (
          <div key={step.id} className="w-full flex flex-col items-center">
            <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} />
            <div className="w-full px-2 py-1 text-[6px] font-futura uppercase text-center border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.75)' }}>
              {step.label}
            </div>
          </div>
        ))}
        <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} />
        <div className="w-full px-2 py-1 text-[6px] font-futura uppercase text-center border" style={{ fontWeight: 515, color: '#16A34A', borderColor: ADMIN_STUDIO_THEME.panelBorder, background: ADMIN_STUDIO_THEME.selectedBg }}>
          DRAFT COMPLETE
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <AdminStudioCreativeScoreRing label="ACTIVE RUN QUALITY" score={monitorRun.qualityScore} threshold={AI_PRODUCTION_QUALITY_THRESHOLD} />
        <div className="p-2.5 border flex flex-col justify-center" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>ACTIVE RUNS</p>
          <p className="text-[14px] leading-none mt-1" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>
            {runs.filter((r) => r.runStatus === 'running' || r.runStatus === 'paused').length}
          </p>
        </div>
      </div>

      <AdminStudioAiProductionLiveMonitor
        run={monitorRun}
        onDepartmentClick={(deptId) => navigate(`/admin/studio/ai-production-engine/${monitorRun.id}?tab=${deptId}`)}
      />

      <div className="flex gap-2 my-3">
        <button type="button" onClick={() => setMonitorRunId(activeRun.id)} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: monitorRun.id === activeRun.id ? '#FFF' : ADMIN_STUDIO_THEME.textSecondary, background: monitorRun.id === activeRun.id ? ADMIN_STUDIO_THEME.accent : 'rgba(255,255,255,0.7)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          ACTIVE RUN
        </button>
        {monitorRun.runStatus === 'paused' ? (
          <button type="button" onClick={() => resumeProduction(monitorRun.id)} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: '#FFF', background: '#16A34A', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            RESUME
          </button>
        ) : (
          <button type="button" onClick={() => pauseProduction(monitorRun.id)} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            PAUSE
          </button>
        )}
        <button type="button" onClick={() => advanceDemo(monitorRun.id)} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          ADVANCE
        </button>
      </div>

      <AdminStudioSectionHeading>PRODUCTION RUNS</AdminStudioSectionHeading>
      <p className="text-[7px] font-futura uppercase -mt-2 mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {runs.length} RUNS · TAP TO OPEN CONTROL ROOM
      </p>
      <div className="space-y-2 mb-4">
        {runs.map((run) => (
          <AdminStudioAiProductionRunCard
            key={run.id}
            run={run}
            onClick={() => {
              setMonitorRunId(run.id);
              navigate(`/admin/studio/ai-production-engine/${run.id}`);
            }}
          />
        ))}
      </div>

      {adding ? (
        <div className="mb-4 space-y-2">
          <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="APPROVED CONTENT PACK TITLE" className="w-full bg-white border text-black text-[10px] font-futura uppercase px-3 py-2 outline-none" style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.inputBorder }} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setAdding(false)} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>CANCEL</button>
            <button type="button" onClick={handleAdd} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: '#FFF', background: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>START PRODUCTION</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="w-full mb-4 py-2.5 text-[7px] font-futura uppercase border border-dashed" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: `${ADMIN_STUDIO_THEME.accent}66` }}>+ NEW PRODUCTION RUN</button>
      )}

      <div className="flex gap-2">
        <button type="button" onClick={() => navigate('/admin/studio/production')} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>← PRODUCTION</button>
        <button type="button" onClick={() => navigate('/admin/studio/publishing-queue')} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>PUBLISHING QUEUE →</button>
      </div>

      <AdminStudioDisclaimerFooter>PROVIDERS NOT CONNECTED · PUBLISHING MANUAL · DEPARTMENTS ORCHESTRATE ADAPTERS INTERNALLY</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
