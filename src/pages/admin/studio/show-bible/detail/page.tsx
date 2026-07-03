import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioTabBar } from '../../../../../components/admin/studio/AdminStudioTabBar';
import { AdminStudioSectionHeading } from '../../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioEditableField } from '../../../../../components/admin/studio/AdminStudioEditableField';
import { AdminStudioShowBibleFieldGroups } from '../../../../../components/admin/studio/AdminStudioShowBibleFieldGroups';
import { AdminStudioCreativeWidget } from '../../../../../components/admin/studio/AdminStudioCreativeWidget';
import { useAdminStudioShowBible } from '../../../../../hooks/useAdminStudioShowBibleState';
import {
  SHOW_BIBLE_TABS,
  SHOW_BIBLE_PROFILE_GROUPS,
  SHOW_BIBLE_PERSONALITY_GROUPS,
  SHOW_BIBLE_VISUAL_GROUPS,
  SHOW_BIBLE_AUDIO_GROUPS,
  SHOW_BIBLE_RULES_GROUPS,
  SHOW_BIBLE_PROMPT_GROUPS,
  SHOW_BIBLE_THUMBNAIL_GROUPS,
  SHOW_BIBLE_CTA_GROUPS,
  SHOW_BIBLE_PRODUCTION_CHECKLIST_ITEMS,
  type ShowBibleTabId,
  type ShowBibleSeasonStatus,
} from '../../../../../utils/adminStudioShowBibleDemo';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';

const SEASON_STATUSES: ShowBibleSeasonStatus[] = [
  'draft',
  'in-production',
  'scheduled',
  'released',
  'archived',
];

export default function AdminStudioShowBibleDetailPage() {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ShowBibleTabId>('profile');

  const {
    selectedShow,
    updateField,
    addSeason,
    updateSeason,
    removeSeason,
    setSeasonStatus,
    toggleChecklistItem,
    getChecklist,
  } = useAdminStudioShowBible(showId);

  if (!showId) {
    return <Navigate to="/admin/studio/show-bible" replace />;
  }

  if (!selectedShow) {
    return <Navigate to="/admin/studio/show-bible" replace />;
  }

  const show = selectedShow;
  const checklist = getChecklist(show.id);

  const structureSteps = show.episodeStructureSteps
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <AdminStudioStageShell
      title={show.showName}
      subtitle="SHOW BIBLE · PRODUCTION PROFILE"
      breadcrumbParentLabel="SHOW BIBLE"
      breadcrumbParentPath="/admin/studio/show-bible"
      onBack={() => navigate('/admin/studio/show-bible')}
    >
      <div
        className="p-2.5 mb-3 border"
        style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: `2px solid ${show.accentHex}` }}
      >
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {show.description}
        </p>
        <p className="mt-1 text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: show.accentHex }}>
          CHECKLIST · {show.checklistApproved}
        </p>
      </div>

      <AdminStudioTabBar tabs={SHOW_BIBLE_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'profile' ? (
        <div className="mt-3">
          <AdminStudioShowBibleFieldGroups groups={SHOW_BIBLE_PROFILE_GROUPS} show={show} onUpdate={(k, v) => updateField(show.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'personality' ? (
        <div className="mt-3">
          <AdminStudioShowBibleFieldGroups groups={SHOW_BIBLE_PERSONALITY_GROUPS} show={show} onUpdate={(k, v) => updateField(show.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'visual' ? (
        <div className="mt-3">
          <AdminStudioShowBibleFieldGroups groups={SHOW_BIBLE_VISUAL_GROUPS} show={show} onUpdate={(k, v) => updateField(show.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'audio' ? (
        <div className="mt-3">
          <AdminStudioShowBibleFieldGroups groups={SHOW_BIBLE_AUDIO_GROUPS} show={show} onUpdate={(k, v) => updateField(show.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'structure' ? (
        <div className="mt-3 space-y-4">
          <AdminStudioSectionHeading>EPISODE STRUCTURE</AdminStudioSectionHeading>
          <p className="text-[7px] font-futura uppercase -mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            REUSABLE TEMPLATE — EVERY EPISODE FOLLOWS THIS FLOW
          </p>
          <div className="flex flex-col items-center gap-0">
            {structureSteps.map((step, i) => {
              const isArrow = step === '↓';
              if (isArrow) {
                return (
                  <div key={`arrow-${i}`} className="text-[10px] font-futura" style={{ color: show.accentHex }}>
                    ↓
                  </div>
                );
              }
              return (
                <div key={`${step}-${i}`} className="w-full flex flex-col items-center">
                  {i > 0 && structureSteps[i - 1] !== '↓' ? (
                    <div className="w-px h-1" style={{ background: ADMIN_STUDIO_THEME.panelBorder }} />
                  ) : null}
                  <div
                    className="w-full px-3 py-1.5 border text-[7px] font-futura uppercase text-center"
                    style={{
                      fontWeight: 515,
                      color: ADMIN_STUDIO_THEME.textPrimary,
                      background: 'rgba(255,255,255,0.75)',
                      borderColor: ADMIN_STUDIO_THEME.panelBorder,
                      borderLeft: `2px solid ${show.accentHex}`,
                    }}
                  >
                    {step}
                  </div>
                </div>
              );
            })}
          </div>
          <AdminStudioEditableField
            label="EDIT STRUCTURE TEMPLATE"
            value={show.episodeStructureSteps}
            onChange={(v) => updateField(show.id, 'episodeStructureSteps', v)}
            multiline
            accentHex={show.accentHex}
          />
        </div>
      ) : null}

      {activeTab === 'segments' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>RECURRING SEGMENTS</AdminStudioSectionHeading>
          <p className="text-[7px] font-futura uppercase -mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            ONE SEGMENT PER LINE — REUSED EVERY EPISODE
          </p>
          {show.recurringSegmentsList.split('\n').filter(Boolean).map((seg, i) => (
            <div
              key={`${seg}-${i}`}
              className="px-3 py-2 border text-[8px] font-futura uppercase"
              style={{
                fontWeight: 515,
                color: ADMIN_STUDIO_THEME.textPrimary,
                borderColor: ADMIN_STUDIO_THEME.panelBorder,
                borderLeft: `2px solid ${show.accentHex}`,
                background: ADMIN_STUDIO_THEME.panelBg,
              }}
            >
              {seg}
            </div>
          ))}
          <AdminStudioEditableField
            label="EDIT RECURRING SEGMENTS"
            value={show.recurringSegmentsList}
            onChange={(v) => updateField(show.id, 'recurringSegmentsList', v)}
            multiline
            accentHex={show.accentHex}
          />
        </div>
      ) : null}

      {activeTab === 'rules' ? (
        <div className="mt-3">
          <AdminStudioShowBibleFieldGroups groups={SHOW_BIBLE_RULES_GROUPS} show={show} onUpdate={(k, v) => updateField(show.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'prompts' ? (
        <div className="mt-3 space-y-3">
          <div
            className="p-2.5 border"
            style={{ background: ADMIN_STUDIO_THEME.selectedBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          >
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              PROMPTS AUTO-INHERIT · BRAND BRAIN · CREATIVE DIRECTOR · EDITORIAL RULES · CAMPAIGNS · PRODUCT KNOWLEDGE
            </p>
          </div>
          <AdminStudioShowBibleFieldGroups groups={SHOW_BIBLE_PROMPT_GROUPS} show={show} onUpdate={(k, v) => updateField(show.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'thumbnail' ? (
        <div className="mt-3">
          <AdminStudioShowBibleFieldGroups groups={SHOW_BIBLE_THUMBNAIL_GROUPS} show={show} onUpdate={(k, v) => updateField(show.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'ctas' ? (
        <div className="mt-3">
          <AdminStudioShowBibleFieldGroups groups={SHOW_BIBLE_CTA_GROUPS} show={show} onUpdate={(k, v) => updateField(show.id, k, v)} />
        </div>
      ) : null}

      {activeTab === 'seasons' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>SEASON MANAGEMENT</AdminStudioSectionHeading>
          <button
            type="button"
            onClick={() => addSeason(show.id)}
            className="w-full py-2 text-[7px] font-futura uppercase border"
            style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.7)' }}
          >
            + ADD EPISODE
          </button>
          {show.seasons.map((ep) => (
            <div
              key={ep.id}
              className="p-3 border space-y-2"
              style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${show.accentHex}` }}
            >
              <div className="flex justify-between items-start gap-2">
                <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
                  S{ep.seasonNumber} · E{ep.episodeNumber} — {ep.title}
                </p>
                <button
                  type="button"
                  onClick={() => removeSeason(show.id, ep.id)}
                  className="text-[6px] font-futura uppercase shrink-0"
                  style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
                >
                  REMOVE
                </button>
              </div>
              <AdminStudioEditableField
                label="EPISODE TITLE"
                value={ep.title}
                onChange={(v) => updateSeason(show.id, ep.id, { title: v })}
                accentHex={show.accentHex}
              />
              <div className="grid grid-cols-2 gap-2">
                <AdminStudioEditableField
                  label="PREMIERE"
                  value={ep.premiereDate}
                  onChange={(v) => updateSeason(show.id, ep.id, { premiereDate: v })}
                  accentHex={show.accentHex}
                />
                <AdminStudioEditableField
                  label="FINALE"
                  value={ep.finaleDate}
                  onChange={(v) => updateSeason(show.id, ep.id, { finaleDate: v })}
                  accentHex={show.accentHex}
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {SEASON_STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSeasonStatus(show.id, ep.id, status)}
                    className="px-2 py-1 text-[6px] font-futura uppercase border"
                    style={{
                      fontWeight: 515,
                      color: ep.status === status ? '#FFFFFF' : ADMIN_STUDIO_THEME.textSecondary,
                      background: ep.status === status ? show.accentHex : 'rgba(255,255,255,0.6)',
                      borderColor: ADMIN_STUDIO_THEME.panelBorder,
                    }}
                  >
                    {status.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'checklist' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>PRODUCTION CHECKLIST</AdminStudioSectionHeading>
          <p className="text-[7px] font-futura uppercase -mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            REQUIRED BEFORE ANY EPISODE GENERATES
          </p>
          {SHOW_BIBLE_PRODUCTION_CHECKLIST_ITEMS.map((item) => {
            const done = checklist[item.id] ?? false;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleChecklistItem(show.id, item.id)}
                className="w-full flex items-center gap-3 p-3 border text-left"
                style={{
                  background: done ? ADMIN_STUDIO_THEME.selectedBg : ADMIN_STUDIO_THEME.panelBg,
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                  borderLeft: `2px solid ${done ? '#16A34A' : show.accentHex}`,
                }}
              >
                <span
                  className="w-4 h-4 shrink-0 flex items-center justify-center border text-[8px]"
                  style={{
                    borderColor: done ? '#16A34A' : ADMIN_STUDIO_THEME.panelBorder,
                    color: done ? '#16A34A' : ADMIN_STUDIO_THEME.textSecondary,
                    background: '#FFFFFF',
                  }}
                >
                  {done ? '✓' : ''}
                </span>
                <span className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {activeTab === 'analytics' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>SHOW ANALYTICS</AdminStudioSectionHeading>
          <div className="grid grid-cols-2 gap-2">
            <AdminStudioCreativeWidget label="VIEWS" value={show.analyticsViews} accentHex={show.accentHex} />
            <AdminStudioCreativeWidget label="COMPLETION" value={show.analyticsCompletion} accentHex={show.accentHex} />
            <AdminStudioCreativeWidget label="AVG WATCH TIME" value={show.analyticsWatchTime} accentHex={show.accentHex} />
            <AdminStudioCreativeWidget label="CTR" value={show.analyticsCtr} accentHex={show.accentHex} />
            <AdminStudioCreativeWidget label="JOURNAL READS" value={show.analyticsJournalReads} accentHex={show.accentHex} />
            <AdminStudioCreativeWidget label="EMAIL OPENS" value={show.analyticsEmailOpens} accentHex={show.accentHex} />
            <AdminStudioCreativeWidget label="MEMBERSHIP CONV" value={show.analyticsMembershipConv} accentHex={show.accentHex} />
            <AdminStudioCreativeWidget label="REVENUE" value={show.analyticsRevenue} accentHex={show.accentHex} />
            <AdminStudioCreativeWidget label="PRODUCTS PURCHASED" value={show.analyticsProducts} accentHex={show.accentHex} className="col-span-2" />
            <AdminStudioCreativeWidget label="TOP EPISODE" value={show.analyticsTopEpisode} accentHex={show.accentHex} className="col-span-2" large />
            <AdminStudioCreativeWidget label="BEST CTA" value={show.analyticsBestCta} accentHex={show.accentHex} className="col-span-2" />
          </div>
          <div className="space-y-2">
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              PERFORMANCE BARS (DEMO)
            </p>
            {[
              { label: 'COMPLETION', val: show.analyticsCompletion },
              { label: 'CTR', val: show.analyticsCtr },
              { label: 'EMAIL OPENS', val: show.analyticsEmailOpens },
            ].map((row) => {
              const pct = parseFloat(row.val.replace('%', '')) || 0;
              return (
                <div key={row.label}>
                  <div className="flex justify-between text-[6px] font-futura uppercase mb-0.5" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    <span>{row.label}</span>
                    <span>{row.val}</span>
                  </div>
                  <div className="h-1.5 bg-white/80 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                    <div className="h-full" style={{ width: `${Math.min(pct, 100)}%`, background: show.accentHex }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => navigate('/admin/studio/show-bible')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← DIRECTORY
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/studio/ai-orchestrator')}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ORCHESTRATOR →
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        SHOW BIBLE REQUIRED BEFORE GENERATION · ALL FIELDS EDITABLE · CMS-READY
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
