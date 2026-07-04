import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioTabBar } from '../../../../../components/admin/studio/AdminStudioTabBar';
import { AdminStudioSectionHeading } from '../../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioEditableField } from '../../../../../components/admin/studio/AdminStudioEditableField';
import { AdminStudioCastingFieldGroups } from '../../../../../components/admin/studio/AdminStudioCastingFieldGroups';
import { useAdminStudioCasting } from '../../../../../hooks/useAdminStudioCastingState';
import {
  CASTING_PRODUCTION_TABS,
  CASTING_PRODUCTION_BOARD_GROUPS,
  CASTING_WORKFLOW_STEPS,
  CASTING_ROLE_LIBRARY,
  CASTING_WARDROBE_COLLECTIONS,
  CASTING_EXPRESSION_PRESETS,
  type CastingProductionTabId,
  type CastingProductionStatus,
  type CastingProductionFieldKey,
} from '../../../../../utils/adminStudioCastingDemo';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';

const STATUSES: CastingProductionStatus[] = ['draft', 'casting', 'approved', 'locked', 'filming', 'post', 'scheduled', 'released'];

export default function AdminStudioCastingProductionPage() {
  const { castingId } = useParams<{ castingId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CastingProductionTabId>('board');
  const { selectedProduction, updateProductionField, setProductionStatus, toggleWorkflowStep, isCastApproved } = useAdminStudioCasting(castingId);

  if (!castingId) return <Navigate to="/admin/studio/casting" replace />;
  if (!selectedProduction) return <Navigate to="/admin/studio/casting" replace />;

  const p = selectedProduction;
  const approved = isCastApproved(p);

  const productionValues: Record<string, string> = {
    showName: p.showName,
    episodeTitle: p.episodeTitle,
    episodeNumber: p.episodeNumber,
    studioName: p.studioName,
    requiredRoles: p.requiredRoles,
    selectedTalent: p.selectedTalent,
    backupTalent: p.backupTalent,
    shootDate: p.shootDate,
    publishDate: p.publishDate,
  };

  const onUpdate = (key: string, value: string) => updateProductionField(p.id, key as CastingProductionFieldKey, value);

  return (
    <AdminStudioStageShell
      title={p.showName}
      subtitle={`CASTING · EP ${p.episodeNumber} — ${p.episodeTitle}`}
      breadcrumbParentLabel="CASTING"
      breadcrumbParentPath="/admin/studio/casting"
      onBack={() => navigate('/admin/studio/casting')}
    >
      <div className="p-2.5 mb-3 border" style={{ background: approved ? ADMIN_STUDIO_THEME.selectedBg : ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: `2px solid ${p.accentHex}` }}>
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: approved ? '#16A34A' : ADMIN_STUDIO_THEME.accent }}>
          {approved ? 'CAST APPROVED & LOCKED — READY FOR PIPELINE' : 'CAST PENDING APPROVAL — PRODUCTION BLOCKED'}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {STATUSES.map((st) => (
            <button key={st} type="button" onClick={() => setProductionStatus(p.id, st)} className="px-2 py-0.5 text-[6px] font-futura uppercase border" style={{ fontWeight: 515, color: p.productionStatus === st ? '#FFF' : ADMIN_STUDIO_THEME.textSecondary, background: p.productionStatus === st ? p.accentHex : 'rgba(255,255,255,0.8)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              {st.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <AdminStudioTabBar tabs={CASTING_PRODUCTION_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'board' ? (
        <div className="mt-3">
          <AdminStudioCastingFieldGroups groups={CASTING_PRODUCTION_BOARD_GROUPS} values={productionValues} onUpdate={onUpdate} accentHex={p.accentHex} />
        </div>
      ) : null}

      {activeTab === 'workflow' ? (
        <div className="mt-3 space-y-2">
          <AdminStudioSectionHeading>CASTING WORKFLOW</AdminStudioSectionHeading>
          {CASTING_WORKFLOW_STEPS.map((step) => {
            const done = p.workflowState[step.id];
            return (
              <button key={step.id} type="button" onClick={() => toggleWorkflowStep(p.id, step.id)} className="w-full flex items-center gap-3 p-3 border text-left" style={{ background: done ? ADMIN_STUDIO_THEME.selectedBg : ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${done ? '#16A34A' : p.accentHex}` }}>
                <span className="w-4 h-4 shrink-0 flex items-center justify-center border text-[8px]" style={{ borderColor: done ? '#16A34A' : ADMIN_STUDIO_THEME.panelBorder, color: done ? '#16A34A' : ADMIN_STUDIO_THEME.textSecondary }}>{done ? '✓' : ''}</span>
                <span className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{step.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {activeTab === 'roles' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>ROLE LIBRARY</AdminStudioSectionHeading>
          <div className="flex flex-wrap gap-1.5 -mt-2">
            {CASTING_ROLE_LIBRARY.map((role) => (
              <span key={role} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${p.accentHex}`, background: ADMIN_STUDIO_THEME.panelBg }}>{role}</span>
            ))}
          </div>
          <AdminStudioEditableField label="REQUIRED ROLES" value={p.requiredRoles} onChange={(v) => onUpdate('requiredRoles', v)} multiline accentHex={p.accentHex} />
        </div>
      ) : null}

      {activeTab === 'talent' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioEditableField label="SELECTED TALENT" value={p.selectedTalent} onChange={(v) => onUpdate('selectedTalent', v)} multiline accentHex={p.accentHex} />
          <AdminStudioEditableField label="BACKUP TALENT" value={p.backupTalent} onChange={(v) => onUpdate('backupTalent', v)} multiline accentHex={p.accentHex} />
        </div>
      ) : null}

      {activeTab === 'wardrobe' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>WARDROBE ASSIGNMENT</AdminStudioSectionHeading>
          <div className="flex flex-wrap gap-1.5 -mt-2">
            {CASTING_WARDROBE_COLLECTIONS.map((w) => (
              <button key={w} type="button" onClick={() => onUpdate('wardrobeAssignment', w)} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ fontWeight: 515, color: p.wardrobeAssignment === w ? '#FFF' : ADMIN_STUDIO_THEME.textPrimary, background: p.wardrobeAssignment === w ? p.accentHex : ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>{w}</button>
            ))}
          </div>
          <AdminStudioEditableField label="SELECTED WARDROBE" value={p.wardrobeAssignment} onChange={(v) => onUpdate('wardrobeAssignment', v)} accentHex={p.accentHex} />
        </div>
      ) : null}

      {activeTab === 'expressions' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>EXPRESSION PRESET</AdminStudioSectionHeading>
          <div className="flex flex-wrap gap-1.5 -mt-2">
            {CASTING_EXPRESSION_PRESETS.map((ex) => (
              <button key={ex} type="button" onClick={() => onUpdate('expressionPreset', ex)} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ fontWeight: 515, color: p.expressionPreset === ex ? '#FFF' : ADMIN_STUDIO_THEME.textPrimary, background: p.expressionPreset === ex ? p.accentHex : 'rgba(255,255,255,0.75)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>{ex}</button>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === 'schedule' ? (
        <div className="mt-3">
          <AdminStudioEditableField label="SCHEDULE NOTES" value={p.scheduleNotes} onChange={(v) => onUpdate('scheduleNotes', v)} multiline accentHex={p.accentHex} />
          <div className="grid grid-cols-2 gap-2 mt-2">
            <AdminStudioEditableField label="SHOOT DATE" value={p.shootDate} onChange={(v) => onUpdate('shootDate', v)} accentHex={p.accentHex} />
            <AdminStudioEditableField label="PUBLISH DATE" value={p.publishDate} onChange={(v) => onUpdate('publishDate', v)} accentHex={p.accentHex} />
          </div>
        </div>
      ) : null}

      {activeTab === 'continuity' ? (
        <div className="mt-3">
          <div className="p-2.5 mb-3 border" style={{ background: ADMIN_STUDIO_THEME.selectedBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>AUTO-INHERIT · APPEARANCE · VOICE · WARDROBE · EXPRESSIONS · PERSONALITY · ALWAYS REFERENCE TALENT AGENCY</p>
          </div>
          <AdminStudioEditableField label="CONTINUITY NOTES" value={p.continuityNotes} onChange={(v) => onUpdate('continuityNotes', v)} multiline accentHex={p.accentHex} />
        </div>
      ) : null}

      {activeTab === 'licensing' ? (
        <div className="mt-3">
          <div className="p-2.5 mb-3 border" style={{ background: 'rgba(235,28,36,0.06)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>LICENSING ARCHITECTURE ONLY — NO LEGAL WORKFLOWS YET</p>
          </div>
          <AdminStudioEditableField label="LICENSING NOTES" value={p.licensingNotes} onChange={(v) => onUpdate('licensingNotes', v)} multiline accentHex={p.accentHex} />
        </div>
      ) : null}

      <AdminStudioDisclaimerFooter>PRODUCTION BLOCKED UNTIL CAST APPROVED & LOCKED · REFERENCES TALENT AGENCY</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
