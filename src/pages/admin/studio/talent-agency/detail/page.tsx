import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioTabBar } from '../../../../../components/admin/studio/AdminStudioTabBar';
import { AdminStudioSectionHeading } from '../../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioEditableField } from '../../../../../components/admin/studio/AdminStudioEditableField';
import { AdminStudioTalentFieldGroups } from '../../../../../components/admin/studio/AdminStudioTalentFieldGroups';
import { AdminStudioCreativeWidget } from '../../../../../components/admin/studio/AdminStudioCreativeWidget';
import { useAdminStudioTalentAgency } from '../../../../../hooks/useAdminStudioTalentAgencyState';
import {
  TALENT_AGENCY_TABS,
  TALENT_PROFILE_GROUPS,
  TALENT_VISUAL_GROUPS,
  TALENT_VOICE_GROUPS,
  TALENT_PERSONALITY_GROUPS,
  TALENT_PROMPT_GROUPS,
  TALENT_RULES_GROUPS,
  TALENT_CONTINUITY_GROUPS,
  TALENT_MANSION_GROUPS,
  type TalentAgencyTabId,
  type TalentStatus,
} from '../../../../../utils/adminStudioTalentAgencyDemo';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';

const STATUSES: TalentStatus[] = ['active', 'in-development', 'archived', 'future'];

export default function AdminStudioTalentAgencyDetailPage() {
  const { talentId } = useParams<{ talentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TalentAgencyTabId>('profile');
  const [newPromptLabel, setNewPromptLabel] = useState('');
  const [newPromptBody, setNewPromptBody] = useState('');

  const {
    selectedTalent,
    updateField,
    setStatus,
    addPromptVersion,
    wardrobeSearch,
    setWardrobeSearch,
    filteredWardrobe,
  } = useAdminStudioTalentAgency(talentId);

  if (!talentId) return <Navigate to="/admin/studio/talent-agency" replace />;
  if (!selectedTalent) return <Navigate to="/admin/studio/talent-agency" replace />;

  const t = selectedTalent;
  const assignments = t.showAssignments.split('\n').map((l) => l.trim()).filter(Boolean);
  const expressions = t.expressionLibrary.split('\n').filter(Boolean);
  const poses = t.poseLibrary.split('\n').filter(Boolean);

  const handleAddPromptVersion = () => {
    const label = newPromptLabel.trim() || `v${t.promptVersions.length + 1}`;
    const body = newPromptBody.trim() || t.promptImage;
    addPromptVersion(t.id, label, body);
    setNewPromptLabel('');
    setNewPromptBody('');
  };

  return (
    <AdminStudioStageShell
      title={t.name}
      subtitle="TALENT AGENCY · PRODUCTION CAST PROFILE"
      breadcrumbParentLabel="TALENT AGENCY"
      breadcrumbParentPath="/admin/studio/talent-agency"
      onBack={() => navigate('/admin/studio/talent-agency')}
    >
      <div
        className="relative mb-3 overflow-hidden border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: `2px solid ${t.accentHex}` }}
      >
        <img src={t.portraitSrc} alt="" className="w-full h-40 object-cover object-top opacity-95" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(255,255,255,0.97) 100%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p
            className="text-[10px] leading-tight"
            style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}
          >
            {t.role}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {STATUSES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatus(t.id, st)}
                className="px-2 py-0.5 text-[6px] font-futura uppercase border"
                style={{
                  fontWeight: 515,
                  color: t.status === st ? '#FFFFFF' : ADMIN_STUDIO_THEME.textSecondary,
                  background: t.status === st ? t.accentHex : 'rgba(255,255,255,0.85)',
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                {st.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <AdminStudioCreativeWidget label="VOICE" value={t.voiceProfileSummary} accentHex={t.accentHex} />
        <AdminStudioCreativeWidget label="WARDROBE" value={t.wardrobeCount} accentHex={t.accentHex} />
        <AdminStudioCreativeWidget label="SETS" value={t.environmentCount} accentHex={t.accentHex} />
      </div>

      <AdminStudioTabBar tabs={TALENT_AGENCY_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'profile' ? (
        <div className="mt-3">
          <AdminStudioTalentFieldGroups groups={TALENT_PROFILE_GROUPS} talent={t} onUpdate={(k, v) => updateField(t.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'visual' ? (
        <div className="mt-3">
          <AdminStudioTalentFieldGroups groups={TALENT_VISUAL_GROUPS} talent={t} onUpdate={(k, v) => updateField(t.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'voice' ? (
        <div className="mt-3">
          <AdminStudioTalentFieldGroups groups={TALENT_VOICE_GROUPS} talent={t} onUpdate={(k, v) => updateField(t.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'personality' ? (
        <div className="mt-3">
          <AdminStudioTalentFieldGroups groups={TALENT_PERSONALITY_GROUPS} talent={t} onUpdate={(k, v) => updateField(t.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'wardrobe' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>WARDROBE LIBRARY</AdminStudioSectionHeading>
          <input
            type="text"
            value={wardrobeSearch}
            onChange={(e) => setWardrobeSearch(e.target.value)}
            placeholder="SEARCH WARDROBE..."
            className="w-full bg-white border text-black text-[10px] font-futura uppercase px-3 py-2 outline-none"
            style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.inputBorder }}
          />
          {filteredWardrobe.map((w) => (
            <div
              key={w.id}
              className="p-3 border"
              style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${t.accentHex}` }}
            >
              <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
                {w.name}
              </p>
              <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
                {w.outfit} · {w.shoes} · {w.hairStyle}
              </p>
              <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: t.accentHex }}>
                {w.colorPalette}
              </p>
            </div>
          ))}
          <AdminStudioEditableField
            label="WARDROBE COLLECTIONS (ONE PER LINE)"
            value={t.wardrobeLibrary}
            onChange={(v) => updateField(t.id, 'wardrobeLibrary', v)}
            multiline
            accentHex={t.accentHex}
          />
        </div>
      ) : null}

      {activeTab === 'expressions' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>EXPRESSION LIBRARY</AdminStudioSectionHeading>
          <div className="flex flex-wrap gap-1.5 -mt-2">
            {expressions.map((expr) => (
              <span
                key={expr}
                className="px-2 py-1 text-[6px] font-futura uppercase border"
                style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${t.accentHex}`, background: ADMIN_STUDIO_THEME.panelBg }}
              >
                {expr}
              </span>
            ))}
          </div>
          <AdminStudioEditableField
            label="EDIT EXPRESSIONS (ONE PER LINE)"
            value={t.expressionLibrary}
            onChange={(v) => updateField(t.id, 'expressionLibrary', v)}
            multiline
            accentHex={t.accentHex}
          />
        </div>
      ) : null}

      {activeTab === 'poses' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>POSE LIBRARY</AdminStudioSectionHeading>
          <div className="flex flex-wrap gap-1.5 -mt-2">
            {poses.map((pose) => (
              <span
                key={pose}
                className="px-2 py-1 text-[6px] font-futura uppercase border"
                style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.75)' }}
              >
                {pose}
              </span>
            ))}
          </div>
          <AdminStudioEditableField
            label="EDIT POSES (ONE PER LINE)"
            value={t.poseLibrary}
            onChange={(v) => updateField(t.id, 'poseLibrary', v)}
            multiline
            accentHex={t.accentHex}
          />
        </div>
      ) : null}

      {activeTab === 'assignments' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>SHOW ASSIGNMENTS</AdminStudioSectionHeading>
          <p className="text-[7px] font-futura uppercase -mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            WHERE THIS TALENT APPEARS
          </p>
          <div className="relative pl-4">
            <div className="absolute left-1.5 top-0 bottom-0 w-px" style={{ background: t.accentHex }} />
            {assignments.map((item, i) => (
              <div key={`${item}-${i}`} className="relative mb-2 pl-3">
                <div
                  className="absolute left-0 top-1.5 w-2 h-2 rounded-full border"
                  style={{ background: '#FFFFFF', borderColor: t.accentHex }}
                />
                <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
          <AdminStudioEditableField
            label="EDIT ASSIGNMENTS (ONE PER LINE)"
            value={t.showAssignments}
            onChange={(v) => updateField(t.id, 'showAssignments', v)}
            multiline
            accentHex={t.accentHex}
          />
        </div>
      ) : null}

      {activeTab === 'prompts' ? (
        <div className="mt-3 space-y-4">
          <div className="p-2.5 border" style={{ background: ADMIN_STUDIO_THEME.selectedBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              AI PROVIDERS INHERIT TALENT PROFILE — NEVER RECREATE CHARACTER INDEPENDENTLY
            </p>
          </div>
          <AdminStudioTalentFieldGroups groups={TALENT_PROMPT_GROUPS} talent={t} onUpdate={(k, v) => updateField(t.id, k, v)} />
          <AdminStudioSectionHeading>PROMPT VERSION HISTORY</AdminStudioSectionHeading>
          {t.promptVersions.map((pv) => (
            <div key={pv.id} className="p-3 border mb-2" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${t.accentHex}` }}>
              <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
                {pv.label} · {pv.createdAt}
              </p>
              <p className="mt-1 text-[7px] font-futura uppercase line-clamp-3" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {pv.body}
              </p>
            </div>
          ))}
          <AdminStudioEditableField label="NEW VERSION LABEL" value={newPromptLabel} onChange={setNewPromptLabel} accentHex={t.accentHex} />
          <AdminStudioEditableField label="NEW VERSION BODY" value={newPromptBody} onChange={setNewPromptBody} multiline accentHex={t.accentHex} />
          <button
            type="button"
            onClick={handleAddPromptVersion}
            className="w-full py-2 text-[7px] font-futura uppercase border"
            style={{ fontWeight: 515, color: '#FFFFFF', background: t.accentHex, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          >
            SAVE PROMPT VERSION
          </button>
        </div>
      ) : null}

      {activeTab === 'rules' ? (
        <div className="mt-3">
          <AdminStudioTalentFieldGroups groups={TALENT_RULES_GROUPS} talent={t} onUpdate={(k, v) => updateField(t.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'continuity' ? (
        <div className="mt-3 space-y-3">
          <div className="p-2.5 border" style={{ background: ADMIN_STUDIO_THEME.selectedBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              RECOGNIZABLE ACROSS PROVIDER · ENVIRONMENT · EPISODE · CAMPAIGN · PLATFORM
            </p>
          </div>
          <AdminStudioTalentFieldGroups groups={TALENT_CONTINUITY_GROUPS} talent={t} onUpdate={(k, v) => updateField(t.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'mansion' ? (
        <div className="mt-3 space-y-3">
          <div className="p-2.5 border" style={{ background: 'rgba(235,28,36,0.06)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
              FUTURE DESKTOP MANSION — DESIGN RELATIONSHIPS ONLY · NOT ACTIVE
            </p>
          </div>
          <AdminStudioTalentFieldGroups groups={TALENT_MANSION_GROUPS} talent={t} onUpdate={(k, v) => updateField(t.id, k, v)} />
          {t.mansionRoom ? (
            <div className="flex flex-col items-center gap-0 p-3 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: ADMIN_STUDIO_THEME.panelBg }}>
              <div className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                {t.name}
              </div>
              <div className="text-[10px]" style={{ color: t.accentHex }}>↓</div>
              <div className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border" style={{ fontWeight: 515, color: t.accentHex, background: ADMIN_STUDIO_THEME.selectedBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                {t.mansionFloor} · {t.mansionRoom}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => navigate('/admin/studio/talent-agency')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← ROSTER
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/studio/studio-lot')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          STUDIO LOT →
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        ONE MASTER TALENT PROFILE · VERSION CONTROLLED · PROVIDERS NOT CONNECTED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
