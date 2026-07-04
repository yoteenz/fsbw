import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioTabBar } from '../../../../../components/admin/studio/AdminStudioTabBar';
import { AdminStudioSectionHeading } from '../../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioEditableField } from '../../../../../components/admin/studio/AdminStudioEditableField';
import { AdminStudioProductionFieldGroups } from '../../../../../components/admin/studio/AdminStudioProductionFieldGroups';
import { AdminStudioCreativeWidget } from '../../../../../components/admin/studio/AdminStudioCreativeWidget';
import { useAdminStudioProduction } from '../../../../../hooks/useAdminStudioProductionState';
import {
  PRODUCTION_TABS,
  PRODUCTION_KANBAN_STAGES,
  PRODUCTION_PREPROD_GROUPS,
  PRODUCTION_SCRIPT_GROUPS,
  PRODUCTION_ASSET_GROUPS,
  PRODUCTION_POST_GROUPS,
  PRODUCTION_PACKAGE_GROUPS,
  PRODUCTION_QA_ITEMS,
  type ProductionTabId,
  type ProductionFieldKey,
} from '../../../../../utils/adminStudioProductionDemo';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';

export default function AdminStudioProductionDetailPage() {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProductionTabId>('board');
  const { selectedPack, updateField, moveToStage, toggleQaItem, updateScene, qaPercent } = useAdminStudioProduction(packId);

  if (!packId) return <Navigate to="/admin/studio/production" replace />;
  if (!selectedPack) return <Navigate to="/admin/studio/production" replace />;

  const p = selectedPack;
  const onUpdate = (key: ProductionFieldKey, value: string) => updateField(p.id, key, value);
  const assemblySteps = p.assemblyTimeline.split('\n').map((l) => l.trim()).filter(Boolean);

  return (
    <AdminStudioStageShell
      title={p.title}
      subtitle={`PRODUCTION · ${p.stage.replace(/-/g, ' ').toUpperCase()}`}
      breadcrumbParentLabel="PRODUCTION"
      breadcrumbParentPath="/admin/studio/production"
      onBack={() => navigate('/admin/studio/production')}
    >
      <div className="p-2.5 mb-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: `2px solid ${p.accentHex}` }}>
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{p.topic}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {PRODUCTION_KANBAN_STAGES.map((st) => (
            <button key={st.id} type="button" onClick={() => moveToStage(p.id, st.id)} className="px-1.5 py-0.5 text-[5px] font-futura uppercase border" style={{ fontWeight: 515, color: p.stage === st.id ? '#FFF' : ADMIN_STUDIO_THEME.textSecondary, background: p.stage === st.id ? p.accentHex : 'rgba(255,255,255,0.8)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              {st.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <AdminStudioCreativeWidget label="STAGE" value={p.stage.replace(/-/g, ' ').toUpperCase()} accentHex={p.accentHex} />
        <AdminStudioCreativeWidget label="ASSETS" value={p.analyticsAssetCompletion} accentHex={p.accentHex} />
        <AdminStudioCreativeWidget label="QA" value={`${qaPercent}%`} accentHex={p.accentHex} />
      </div>

      <AdminStudioTabBar tabs={PRODUCTION_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'board' ? (
        <div className="mt-3 space-y-2">
          <AdminStudioSectionHeading>PRODUCTION STAGE</AdminStudioSectionHeading>
          <p className="text-[7px] font-futura uppercase -mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>CURRENT: {p.stage.replace(/-/g, ' ')}</p>
          <AdminStudioEditableField label="PACK TITLE" value={p.title} onChange={(v) => onUpdate('title', v)} accentHex={p.accentHex} />
        </div>
      ) : null}

      {activeTab === 'pre-production' ? (
        <div className="mt-3"><AdminStudioProductionFieldGroups groups={PRODUCTION_PREPROD_GROUPS} pack={p} onUpdate={onUpdate} /></div>
      ) : null}

      {activeTab === 'script' ? (
        <div className="mt-3"><AdminStudioProductionFieldGroups groups={PRODUCTION_SCRIPT_GROUPS} pack={p} onUpdate={onUpdate} /></div>
      ) : null}

      {activeTab === 'storyboard' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>STORYBOARD</AdminStudioSectionHeading>
          {p.scenes.map((scene) => (
            <div key={scene.id} className="p-3 border space-y-2" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${p.accentHex}` }}>
              <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>SCENE {scene.sceneNumber} — {scene.purpose}</p>
              <AdminStudioEditableField label="DIALOGUE" value={scene.dialogue} onChange={(v) => updateScene(p.id, scene.id, { dialogue: v })} accentHex={p.accentHex} />
              <div className="grid grid-cols-2 gap-2">
                <AdminStudioEditableField label="CAMERA" value={scene.camera} onChange={(v) => updateScene(p.id, scene.id, { camera: v })} accentHex={p.accentHex} />
                <AdminStudioEditableField label="STUDIO" value={scene.studio} onChange={(v) => updateScene(p.id, scene.id, { studio: v })} accentHex={p.accentHex} />
                <AdminStudioEditableField label="TALENT" value={scene.talent} onChange={(v) => updateScene(p.id, scene.id, { talent: v })} accentHex={p.accentHex} />
                <AdminStudioEditableField label="LIGHTING" value={scene.lighting} onChange={(v) => updateScene(p.id, scene.id, { lighting: v })} accentHex={p.accentHex} />
                <AdminStudioEditableField label="MOOD" value={scene.mood} onChange={(v) => updateScene(p.id, scene.id, { mood: v })} accentHex={p.accentHex} />
                <AdminStudioEditableField label="STATUS" value={scene.completionStatus} onChange={(v) => updateScene(p.id, scene.id, { completionStatus: v })} accentHex={p.accentHex} />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'shot-list' ? (
        <div className="mt-3 space-y-2">
          {(['shotHero', 'shotWide', 'shotMedium', 'shotCloseUp', 'shotProduct', 'shotCta', 'shotThumbnail', 'shotOutro'] as ProductionFieldKey[]).map((key) => (
            <AdminStudioEditableField key={key} label={key.replace('shot', '').replace(/([A-Z])/g, ' $1').trim().toUpperCase()} value={p[key]} onChange={(v) => onUpdate(key, v)} accentHex={p.accentHex} />
          ))}
        </div>
      ) : null}

      {activeTab === 'assets' ? (
        <div className="mt-3">
          <div className="p-2.5 mb-3 border" style={{ background: ADMIN_STUDIO_THEME.selectedBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>TRACKING ONLY — PROVIDERS NOT CONNECTED</p>
          </div>
          <AdminStudioProductionFieldGroups groups={PRODUCTION_ASSET_GROUPS} pack={p} onUpdate={onUpdate} />
        </div>
      ) : null}

      {activeTab === 'assembly' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>ASSEMBLY TIMELINE</AdminStudioSectionHeading>
          <div className="flex flex-col items-center gap-0">
            {assemblySteps.map((step, i) => {
              if (step === '↓') return <div key={`a-${i}`} className="text-[10px]" style={{ color: p.accentHex }}>↓</div>;
              return (
                <div key={`${step}-${i}`} className="w-full px-3 py-1.5 border text-[7px] font-futura uppercase text-center" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${p.accentHex}`, background: 'rgba(255,255,255,0.75)' }}>{step}</div>
              );
            })}
          </div>
          <AdminStudioEditableField label="EDIT TIMELINE" value={p.assemblyTimeline} onChange={(v) => onUpdate('assemblyTimeline', v)} multiline accentHex={p.accentHex} />
          <AdminStudioEditableField label="MISSING ASSETS" value={p.assemblyMissing} onChange={(v) => onUpdate('assemblyMissing', v)} multiline accentHex={p.accentHex} />
          <AdminStudioEditableField label="COMPLETED ASSETS" value={p.assemblyCompleted} onChange={(v) => onUpdate('assemblyCompleted', v)} multiline accentHex={p.accentHex} />
        </div>
      ) : null}

      {activeTab === 'post' ? (
        <div className="mt-3"><AdminStudioProductionFieldGroups groups={PRODUCTION_POST_GROUPS} pack={p} onUpdate={onUpdate} /></div>
      ) : null}

      {activeTab === 'qa' ? (
        <div className="mt-3 space-y-3">
          <div className="h-2 bg-white/80 border overflow-hidden" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <div className="h-full transition-all" style={{ width: `${qaPercent}%`, background: p.accentHex }} />
          </div>
          <p className="text-[7px] font-futura uppercase text-center" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>QA COMPLETION {qaPercent}%</p>
          {PRODUCTION_QA_ITEMS.map((item) => {
            const done = p.qaChecklist[item.id] ?? false;
            return (
              <button key={item.id} type="button" onClick={() => toggleQaItem(p.id, item.id)} className="w-full flex items-center gap-3 p-3 border text-left" style={{ background: done ? ADMIN_STUDIO_THEME.selectedBg : ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${done ? '#16A34A' : p.accentHex}` }}>
                <span className="w-4 h-4 shrink-0 flex items-center justify-center border text-[8px]" style={{ borderColor: done ? '#16A34A' : ADMIN_STUDIO_THEME.panelBorder, color: done ? '#16A34A' : ADMIN_STUDIO_THEME.textSecondary }}>{done ? '✓' : ''}</span>
                <span className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {activeTab === 'calendar' ? (
        <div className="mt-3 space-y-2">
          <AdminStudioEditableField label="TODAY" value={p.calendarToday} onChange={(v) => onUpdate('calendarToday', v)} accentHex={p.accentHex} />
          <AdminStudioEditableField label="THIS WEEK" value={p.calendarThisWeek} onChange={(v) => onUpdate('calendarThisWeek', v)} multiline accentHex={p.accentHex} />
          <AdminStudioEditableField label="NEXT WEEK" value={p.calendarNextWeek} onChange={(v) => onUpdate('calendarNextWeek', v)} multiline accentHex={p.accentHex} />
          <AdminStudioEditableField label="UPCOMING LAUNCHES" value={p.calendarLaunches} onChange={(v) => onUpdate('calendarLaunches', v)} multiline accentHex={p.accentHex} />
          <AdminStudioEditableField label="CAMPAIGN DEADLINES" value={p.calendarDeadlines} onChange={(v) => onUpdate('calendarDeadlines', v)} multiline accentHex={p.accentHex} />
          <AdminStudioEditableField label="SEASON PREMIERES" value={p.calendarPremieres} onChange={(v) => onUpdate('calendarPremieres', v)} multiline accentHex={p.accentHex} />
        </div>
      ) : null}

      {activeTab === 'team' ? (
        <div className="mt-3 space-y-2">
          <div className="p-2.5 border" style={{ background: 'rgba(235,28,36,0.06)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>TEAM COLLABORATION — ARCHITECTURE ONLY · NOT ACTIVE</p>
          </div>
          <AdminStudioEditableField label="ASSIGNED REVIEWER" value={p.assignedReviewer} onChange={(v) => onUpdate('assignedReviewer', v)} accentHex={p.accentHex} />
          <AdminStudioEditableField label="COMMENTS" value={p.teamComments} onChange={(v) => onUpdate('teamComments', v)} multiline accentHex={p.accentHex} />
          <AdminStudioEditableField label="APPROVALS" value={p.teamApprovals} onChange={(v) => onUpdate('teamApprovals', v)} accentHex={p.accentHex} />
          <AdminStudioEditableField label="REVISION REQUESTS" value={p.teamRevisions} onChange={(v) => onUpdate('teamRevisions', v)} accentHex={p.accentHex} />
        </div>
      ) : null}

      {activeTab === 'package' ? (
        <div className="mt-3"><AdminStudioProductionFieldGroups groups={PRODUCTION_PACKAGE_GROUPS} pack={p} onUpdate={onUpdate} /></div>
      ) : null}

      {activeTab === 'analytics' ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <AdminStudioCreativeWidget label="PROD TIME" value={p.analyticsProdTime} accentHex={p.accentHex} />
          <AdminStudioCreativeWidget label="REVISIONS" value={p.analyticsRevisions} accentHex={p.accentHex} />
          <AdminStudioCreativeWidget label="APPROVAL TIME" value={p.analyticsApprovalTime} accentHex={p.accentHex} />
          <AdminStudioCreativeWidget label="GEN TIME" value={p.analyticsGenTime} accentHex={p.accentHex} />
          <AdminStudioCreativeWidget label="ASSET COMPLETION" value={p.analyticsAssetCompletion} accentHex={p.accentHex} />
          <AdminStudioCreativeWidget label="BOTTLENECK" value={p.analyticsBottleneck} accentHex={p.accentHex} className="col-span-2" />
        </div>
      ) : null}

      <AdminStudioDisclaimerFooter>CONTENT PACK LIFECYCLE · REUSABLE ASSETS · VERSION HISTORY SUPPORTED</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
