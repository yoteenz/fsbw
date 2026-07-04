import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioTabBar } from '../../../../../components/admin/studio/AdminStudioTabBar';
import { AdminStudioSectionHeading } from '../../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioEditableField } from '../../../../../components/admin/studio/AdminStudioEditableField';
import { AdminStudioCastingFieldGroups } from '../../../../../components/admin/studio/AdminStudioCastingFieldGroups';
import { AdminStudioCreativeWidget } from '../../../../../components/admin/studio/AdminStudioCreativeWidget';
import { useAdminStudioCasting } from '../../../../../hooks/useAdminStudioCastingState';
import {
  CASTING_TALENT_TABS,
  CASTING_TALENT_PROFILE_GROUPS,
  CASTING_TALENT_SHOW_GROUPS,
  CASTING_TALENT_STUDIO_GROUPS,
  CASTING_TALENT_LICENSING_GROUPS,
  CASTING_WARDROBE_COLLECTIONS,
  CASTING_EXPRESSION_PRESETS,
  type CastingTalentTabId,
  type CastingTalentStatus,
  type CastingTalentFieldKey,
} from '../../../../../utils/adminStudioCastingDemo';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';

const STATUSES: CastingTalentStatus[] = ['available', 'booked', 'filming', 'on-break', 'season-complete', 'retired', 'inactive', 'guest-appearance'];

export default function AdminStudioCastingTalentPage() {
  const { talentId } = useParams<{ talentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CastingTalentTabId>('profile');
  const { selectedTalent, updateTalentField, setTalentStatus } = useAdminStudioCasting(undefined, talentId);

  if (!talentId) return <Navigate to="/admin/studio/casting" replace />;
  if (!selectedTalent) return <Navigate to="/admin/studio/casting" replace />;

  const t = selectedTalent;
  const talentValues: Record<string, string> = { ...t } as Record<string, string>;
  const onUpdate = (key: string, value: string) => updateTalentField(t.id, key as CastingTalentFieldKey, value);

  return (
    <AdminStudioStageShell
      title={t.name}
      subtitle="CASTING · TALENT MANAGEMENT PROFILE"
      breadcrumbParentLabel="CASTING"
      breadcrumbParentPath="/admin/studio/casting"
      onBack={() => navigate('/admin/studio/casting')}
    >
      <div className="relative mb-3 overflow-hidden border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: `2px solid ${t.accentHex}` }}>
        <img src={t.portraitSrc} alt="" className="w-full h-36 object-cover object-top" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 35%, rgba(255,255,255,0.97) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: t.accentHex }}>{t.role}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {STATUSES.map((st) => (
              <button key={st} type="button" onClick={() => setTalentStatus(t.id, st)} className="px-2 py-0.5 text-[6px] font-futura uppercase border" style={{ fontWeight: 515, color: t.castingStatus === st ? '#FFF' : ADMIN_STUDIO_THEME.textSecondary, background: t.castingStatus === st ? t.accentHex : 'rgba(255,255,255,0.85)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                {st.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <AdminStudioCreativeWidget label="EPISODES" value={t.episodesAppeared} accentHex={t.accentHex} />
        <AdminStudioCreativeWidget label="STUDIOS" value={t.studiosAssigned} accentHex={t.accentHex} />
        <AdminStudioCreativeWidget label="VOICE" value={t.voiceProfileSummary} accentHex={t.accentHex} />
      </div>

      <AdminStudioTabBar tabs={CASTING_TALENT_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'profile' ? (
        <div className="mt-3">
          <AdminStudioCastingFieldGroups groups={CASTING_TALENT_PROFILE_GROUPS} values={talentValues} onUpdate={onUpdate} accentHex={t.accentHex} />
          <button type="button" onClick={() => navigate(`/admin/studio/talent-agency/${t.talentAgencyId}`)} className="w-full mt-3 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>OPEN TALENT AGENCY PROFILE →</button>
        </div>
      ) : null}

      {activeTab === 'shows' ? (
        <div className="mt-3">
          <AdminStudioCastingFieldGroups groups={CASTING_TALENT_SHOW_GROUPS} values={talentValues} onUpdate={onUpdate} accentHex={t.accentHex} />
        </div>
      ) : null}

      {activeTab === 'studios' ? (
        <div className="mt-3">
          <AdminStudioCastingFieldGroups groups={CASTING_TALENT_STUDIO_GROUPS} values={talentValues} onUpdate={onUpdate} accentHex={t.accentHex} />
        </div>
      ) : null}

      {activeTab === 'wardrobe' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>WARDROBE ASSIGNMENTS</AdminStudioSectionHeading>
          <div className="flex flex-wrap gap-1.5 -mt-2">
            {CASTING_WARDROBE_COLLECTIONS.map((w) => (
              <span key={w} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: ADMIN_STUDIO_THEME.panelBg }}>{w}</span>
            ))}
          </div>
          <AdminStudioEditableField label="ASSIGNED WARDROBE" value={t.wardrobeAssignments} onChange={(v) => onUpdate('wardrobeAssignments', v)} multiline accentHex={t.accentHex} />
        </div>
      ) : null}

      {activeTab === 'expressions' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>EXPRESSION PRESETS</AdminStudioSectionHeading>
          <div className="flex flex-wrap gap-1.5 -mt-2">
            {CASTING_EXPRESSION_PRESETS.map((ex) => (
              <span key={ex} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>{ex}</span>
            ))}
          </div>
          <AdminStudioEditableField label="ASSIGNED EXPRESSIONS" value={t.expressionPresets} onChange={(v) => onUpdate('expressionPresets', v)} multiline accentHex={t.accentHex} />
        </div>
      ) : null}

      {activeTab === 'community' ? (
        <div className="mt-3">
          <AdminStudioEditableField label="COMMUNITY STATUS" value={t.communityStatus || 'N/A — AGENCY TALENT'} onChange={(v) => onUpdate('communityStatus', v)} accentHex={t.accentHex} />
        </div>
      ) : null}

      {activeTab === 'schedule' ? (
        <div className="mt-3">
          <AdminStudioEditableField label="PRODUCTION CALENDAR" value={t.scheduleCalendar} onChange={(v) => onUpdate('scheduleCalendar', v)} multiline accentHex={t.accentHex} />
          <AdminStudioEditableField label="AVAILABILITY" value={t.availability} onChange={(v) => onUpdate('availability', v)} accentHex={t.accentHex} />
        </div>
      ) : null}

      {activeTab === 'analytics' ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <AdminStudioCreativeWidget label="EPISODE COUNT" value={t.analyticsEpisodes} accentHex={t.accentHex} />
          <AdminStudioCreativeWidget label="SHOWS" value={t.analyticsShows} accentHex={t.accentHex} />
          <AdminStudioCreativeWidget label="WATCH TIME" value={t.analyticsWatchTime} accentHex={t.accentHex} />
          <AdminStudioCreativeWidget label="ENGAGEMENT" value={t.analyticsEngagement} accentHex={t.accentHex} />
          <AdminStudioCreativeWidget label="CTR" value={t.analyticsCtr} accentHex={t.accentHex} />
          <AdminStudioCreativeWidget label="CONVERSION" value={t.analyticsConversion} accentHex={t.accentHex} />
          <AdminStudioCreativeWidget label="FAVORITES" value={t.analyticsFavorites} accentHex={t.accentHex} className="col-span-2" />
          <AdminStudioCreativeWidget label="MOST SHARED" value={t.analyticsShared} accentHex={t.accentHex} className="col-span-2" />
        </div>
      ) : null}

      {activeTab === 'licensing' ? (
        <div className="mt-3">
          <div className="p-2.5 mb-3 border" style={{ background: 'rgba(235,28,36,0.06)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>ARCHITECTURE ONLY — NO LEGAL WORKFLOWS IMPLEMENTED</p>
          </div>
          <AdminStudioCastingFieldGroups groups={CASTING_TALENT_LICENSING_GROUPS} values={talentValues} onUpdate={onUpdate} accentHex={t.accentHex} />
        </div>
      ) : null}

      <AdminStudioDisclaimerFooter>ALWAYS REFERENCE TALENT AGENCY · NEVER RECREATE TALENT INDEPENDENTLY</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
