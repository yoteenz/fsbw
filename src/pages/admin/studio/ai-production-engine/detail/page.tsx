import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioTabBar } from '../../../../../components/admin/studio/AdminStudioTabBar';
import { AdminStudioSectionHeading } from '../../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioAiProductionFieldGroups } from '../../../../../components/admin/studio/AdminStudioAiProductionFieldGroups';
import { AdminStudioAiProductionLiveMonitor } from '../../../../../components/admin/studio/AdminStudioAiProductionLiveMonitor';
import { AdminStudioCreativeScoreRing } from '../../../../../components/admin/studio/AdminStudioCreativeWidget';
import { useAdminStudioAiProductionEngine } from '../../../../../hooks/useAdminStudioAiProductionEngineState';
import {
  AI_PRODUCTION_TABS,
  AI_PRODUCTION_RESEARCH_GROUPS,
  AI_PRODUCTION_WRITING_GROUPS,
  AI_PRODUCTION_CREATIVE_GROUPS,
  AI_PRODUCTION_VISUAL_GROUPS,
  AI_PRODUCTION_VOICE_GROUPS,
  AI_PRODUCTION_EDITORIAL_GROUPS,
  AI_PRODUCTION_QUALITY_GROUPS,
  AI_PRODUCTION_PUBLISHING_GROUPS,
  AI_PRODUCTION_QUALITY_THRESHOLD,
  type AiProductionTabId,
  type AiProductionFieldKey,
  type AiProductionDepartmentId,
} from '../../../../../utils/adminStudioAiProductionEngineDemo';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';

const TAB_TO_DEPT: Partial<Record<AiProductionTabId, AiProductionDepartmentId>> = {
  research: 'research',
  writing: 'writing',
  creative: 'creative',
  visual: 'visual',
  voice: 'voice',
  editorial: 'editorial',
  'quality-control': 'quality-control',
  publishing: 'publishing',
};

export default function AdminStudioAiProductionEngineDetailPage() {
  const { runId } = useParams<{ runId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AiProductionTabId>('monitor');
  const {
    selectedRun,
    updateField,
    pauseProduction,
    resumeProduction,
    regenerateDept,
    approveDept,
    rejectDept,
    skipDept,
    duplicateProduction,
    advanceDemo,
  } = useAdminStudioAiProductionEngine(runId);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && AI_PRODUCTION_TABS.some((t) => t.id === tab)) {
      setActiveTab(tab as AiProductionTabId);
    }
  }, [searchParams]);

  if (!runId) return <Navigate to="/admin/studio/ai-production-engine" replace />;
  if (!selectedRun) return <Navigate to="/admin/studio/ai-production-engine" replace />;

  const r = selectedRun;
  const onUpdate = (key: AiProductionFieldKey, value: string) => updateField(r.id, key, value);
  const currentDept = TAB_TO_DEPT[activeTab];

  return (
    <AdminStudioStageShell
      title={r.title}
      subtitle={`AI PRODUCTION ENGINE · ${r.runStatus.replace('-', ' ').toUpperCase()}`}
      breadcrumbParentLabel="AI PRODUCTION ENGINE"
      breadcrumbParentPath="/admin/studio/ai-production-engine"
      onBack={() => navigate('/admin/studio/ai-production-engine')}
    >
      <div className="p-2.5 mb-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: `2px solid ${r.accentHex}` }}>
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {r.showName} · {r.studioName} · {r.talentName}
        </p>
        <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: r.accentHex }}>
          CURRENT DEPARTMENT: {r.currentDepartment.replace('-', ' ').toUpperCase()}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <AdminStudioCreativeScoreRing label="QUALITY SCORE" score={r.qualityScore} threshold={AI_PRODUCTION_QUALITY_THRESHOLD} />
        <div className="p-2.5 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>PACK REF</p>
          <p className="text-[10px] font-futura uppercase mt-1 truncate" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{r.contentPackRef}</p>
        </div>
      </div>

      {r.qualityRevisionNote ? (
        <div className="p-2.5 mb-3 border" style={{ background: r.qualityScore < AI_PRODUCTION_QUALITY_THRESHOLD ? 'rgba(202,138,4,0.08)' : ADMIN_STUDIO_THEME.selectedBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: r.qualityScore < AI_PRODUCTION_QUALITY_THRESHOLD ? '#CA8A04' : '#16A34A' }}>
            {r.qualityRevisionNote}
          </p>
        </div>
      ) : null}

      <AdminStudioTabBar tabs={AI_PRODUCTION_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'monitor' ? (
        <div className="mt-3">
          <AdminStudioAiProductionLiveMonitor run={r} onDepartmentClick={(id) => setActiveTab(id as AiProductionTabId)} />
        </div>
      ) : null}

      {activeTab === 'research' ? (
        <div className="mt-3"><AdminStudioAiProductionFieldGroups groups={AI_PRODUCTION_RESEARCH_GROUPS} run={r} onUpdate={onUpdate} /></div>
      ) : null}
      {activeTab === 'writing' ? (
        <div className="mt-3"><AdminStudioAiProductionFieldGroups groups={AI_PRODUCTION_WRITING_GROUPS} run={r} onUpdate={onUpdate} /></div>
      ) : null}
      {activeTab === 'creative' ? (
        <div className="mt-3"><AdminStudioAiProductionFieldGroups groups={AI_PRODUCTION_CREATIVE_GROUPS} run={r} onUpdate={onUpdate} /></div>
      ) : null}
      {activeTab === 'visual' ? (
        <div className="mt-3">
          <div className="p-2.5 mb-3 border" style={{ background: ADMIN_STUDIO_THEME.selectedBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>PROMPTS REFERENCE STUDIO LOT · TALENT AGENCY · SHOW BIBLE · BRAND BRAIN</p>
          </div>
          <AdminStudioAiProductionFieldGroups groups={AI_PRODUCTION_VISUAL_GROUPS} run={r} onUpdate={onUpdate} />
        </div>
      ) : null}
      {activeTab === 'voice' ? (
        <div className="mt-3"><AdminStudioAiProductionFieldGroups groups={AI_PRODUCTION_VOICE_GROUPS} run={r} onUpdate={onUpdate} /></div>
      ) : null}
      {activeTab === 'editorial' ? (
        <div className="mt-3"><AdminStudioAiProductionFieldGroups groups={AI_PRODUCTION_EDITORIAL_GROUPS} run={r} onUpdate={onUpdate} /></div>
      ) : null}
      {activeTab === 'quality-control' ? (
        <div className="mt-3"><AdminStudioAiProductionFieldGroups groups={AI_PRODUCTION_QUALITY_GROUPS} run={r} onUpdate={onUpdate} /></div>
      ) : null}
      {activeTab === 'publishing' ? (
        <div className="mt-3">
          <div className="p-2.5 mb-3 border" style={{ background: 'rgba(235,28,36,0.06)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>PUBLISHING MANUAL — NO AUTOMATIC SHIP</p>
          </div>
          <AdminStudioAiProductionFieldGroups groups={AI_PRODUCTION_PUBLISHING_GROUPS} run={r} onUpdate={onUpdate} />
        </div>
      ) : null}

      {activeTab === 'traceability' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>PROMPT TRACEABILITY</AdminStudioSectionHeading>
          {r.promptTraces.map((trace) => (
            <div key={trace.id} className="p-3 border space-y-1" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${r.accentHex}` }}>
              <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{trace.assetLabel}</p>
              <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>PROMPT {trace.promptVersion} · {trace.providerUsed.toUpperCase()} · {trace.generationTime}</p>
              <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>DEPS: {trace.dependencies}</p>
              <p className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>SHOW {trace.relatedShow} · STUDIO {trace.relatedStudio} · TALENT {trace.relatedTalent}</p>
              <p className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>HISTORY: {trace.versionHistory}</p>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'controls' ? (
        <div className="mt-3 space-y-2">
          <AdminStudioSectionHeading>MANUAL CONTROL</AdminStudioSectionHeading>
          <div className="grid grid-cols-2 gap-2">
            {r.runStatus === 'paused' ? (
              <button type="button" onClick={() => resumeProduction(r.id)} className="py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: '#FFF', background: '#16A34A', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>RESUME</button>
            ) : (
              <button type="button" onClick={() => pauseProduction(r.id)} className="py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>PAUSE</button>
            )}
            <button type="button" onClick={() => advanceDemo(r.id)} className="py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>ADVANCE DEMO</button>
            <button
              type="button"
              onClick={() => {
                const dupId = duplicateProduction(r.id);
                if (dupId) navigate(`/admin/studio/ai-production-engine/${dupId}`);
              }}
              className="py-2 text-[7px] font-futura uppercase border col-span-2"
              style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
            >
              DUPLICATE PRODUCTION
            </button>
          </div>
          {currentDept ? (
            <div className="pt-3 space-y-2 border-t" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                DEPARTMENT: {currentDept.replace('-', ' ').toUpperCase()}
              </p>
              <button type="button" onClick={() => regenerateDept(r.id, currentDept)} className="w-full py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>REGENERATE DEPARTMENT</button>
              <div className="flex gap-2">
                <button type="button" onClick={() => approveDept(r.id, currentDept)} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: '#FFF', background: '#16A34A', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>APPROVE</button>
                <button type="button" onClick={() => rejectDept(r.id, currentDept)} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: '#FFF', background: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>REJECT</button>
              </div>
              <button type="button" onClick={() => skipDept(r.id, currentDept)} className="w-full py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>SKIP DEPARTMENT</button>
            </div>
          ) : (
            <p className="text-[7px] font-futura uppercase pt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>SELECT A DEPARTMENT TAB FOR DEPARTMENT CONTROLS</p>
          )}
        </div>
      ) : null}

      {currentDept && activeTab !== 'controls' && activeTab !== 'monitor' && activeTab !== 'traceability' ? (
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => regenerateDept(r.id, currentDept)} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>REGENERATE</button>
          <button type="button" onClick={() => approveDept(r.id, currentDept)} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: '#FFF', background: '#16A34A', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>APPROVE</button>
        </div>
      ) : null}

      <AdminStudioDisclaimerFooter>NO CREATIVE DECISIONS · PROVIDERS INTERCHANGEABLE · MANUAL PUBLISHING ONLY</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
