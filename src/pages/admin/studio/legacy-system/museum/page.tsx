import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioTabBar } from '../../../../../components/admin/studio/AdminStudioTabBar';
import { AdminStudioSectionHeading } from '../../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioLegacyPlaque } from '../../../../../components/admin/studio/AdminStudioLegacyPlaque';
import { AdminStudioLegacyAwardCard } from '../../../../../components/admin/studio/AdminStudioLegacyAwardCard';
import { AdminStudioLegacyCareerCard } from '../../../../../components/admin/studio/AdminStudioLegacyCareerCard';
import { AdminStudioLegacyVaultItem } from '../../../../../components/admin/studio/AdminStudioLegacyVaultItem';
import { AdminStudioLegacyTimeCapsuleCard } from '../../../../../components/admin/studio/AdminStudioLegacyTimeCapsuleCard';
import { useAdminStudioLegacySystem } from '../../../../../hooks/useAdminStudioLegacySystemState';
import { isAdminFounderAccount, getCurrentUser } from '../../../../../utils/adminAuth';
import {
  LEGACY_MUSEUM_TABS,
  LEGACY_ARCHIVE_RECORDS,
  LEGACY_HALL_OF_FAME,
  LEGACY_AWARD_CATEGORIES,
  LEGACY_TALENT_CAREERS,
  LEGACY_SHOW_HISTORIES,
  LEGACY_STUDIO_HISTORIES,
  LEGACY_CAMPAIGN_HISTORIES,
  LEGACY_COMMUNITY_ENTRIES,
  LEGACY_VAULT_OF_FIRSTS,
  LEGACY_TIME_CAPSULES,
  LEGACY_TIMELINE_EVENTS,
  LEGACY_ANNIVERSARY_COLLECTIONS,
  LEGACY_ANNUAL_REVIEWS,
  LEGACY_DOCUMENTARIES,
  LEGACY_BEHIND_SCENES,
  LEGACY_KEYS,
  type LegacyMuseumTabId,
  type FounderPredictionStatus,
} from '../../../../../utils/adminStudioLegacySystemDemo';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';

const PREDICTION_STATUS_COLORS: Record<FounderPredictionStatus, string> = {
  planned: '#6B7280',
  'in-progress': '#2563EB',
  achieved: '#16A34A',
  archived: '#8B0000',
};

export default function AdminStudioLegacySystemMuseumPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<LegacyMuseumTabId>('archives');
  const { journal, predictions, letters, updateJournalNote, setPredictionStatus } = useAdminStudioLegacySystem();
  const isFounder = isAdminFounderAccount(getCurrentUser());

  const visibleTabs = LEGACY_MUSEUM_TABS.filter((t) => !t.founderOnly || isFounder);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && LEGACY_MUSEUM_TABS.some((t) => t.id === tab)) {
      const match = LEGACY_MUSEUM_TABS.find((t) => t.id === tab);
      if (!match?.founderOnly || isFounder) {
        setActiveTab(tab as LegacyMuseumTabId);
      }
    }
  }, [searchParams, isFounder]);

  return (
    <AdminStudioStageShell
      title="THE MUSEUM"
      subtitle="THE LEGACY SYSTEM · EVERY STORY DESERVES TO BE REMEMBERED"
      breadcrumbParentLabel="LEGACY SYSTEM"
      breadcrumbParentPath="/admin/studio/legacy-system"
      onBack={() => navigate('/admin/studio/legacy-system')}
    >
      <div className="p-2.5 mb-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: '2px solid #8B0000' }}>
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          MUSEUM-QUALITY PRESENTATION · GLASS DISPLAY CASES · COMPLETE TRACEABILITY
        </p>
      </div>

      <AdminStudioTabBar tabs={visibleTabs} activeTab={activeTab} onTabChange={setActiveTab} accentHex="#8B0000" />

      {activeTab === 'archives' ? (
        <div className="mt-3 space-y-2">
          <AdminStudioSectionHeading>THE ARCHIVES</AdminStudioSectionHeading>
          <p className="text-[6px] font-futura uppercase -mt-2 mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            MASTER HISTORICAL RECORD · REFERENCES ORIGINAL MODULE RECORDS
          </p>
          {LEGACY_ARCHIVE_RECORDS.map((r) => (
            <div key={r.id} className="p-2.5 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              <div className="flex justify-between">
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{r.title}</p>
                <span className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{r.date}</span>
              </div>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{r.category} · REF: {r.sourceRef}</p>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'hall-of-fame' ? (
        <div className="mt-3 grid grid-cols-1 gap-3">
          <AdminStudioSectionHeading>HALL OF FAME</AdminStudioSectionHeading>
          {LEGACY_HALL_OF_FAME.map((e) => (
            <AdminStudioLegacyPlaque key={e.id} entry={e} />
          ))}
        </div>
      ) : null}

      {activeTab === 'awards' ? (
        <div className="mt-3 space-y-2">
          <AdminStudioSectionHeading>STUDIO AWARDS 2026</AdminStudioSectionHeading>
          <p className="text-[6px] font-futura uppercase -mt-2 mb-2" style={{ fontWeight: 515, color: '#CA8A04' }}>FRONTAL SLAYER STUDIOS ANNUAL CEREMONY</p>
          {LEGACY_AWARD_CATEGORIES.map((a) => (
            <AdminStudioLegacyAwardCard key={a.id} award={a} />
          ))}
        </div>
      ) : null}

      {activeTab === 'talent' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>TALENT CAREERS</AdminStudioSectionHeading>
          {LEGACY_TALENT_CAREERS.map((c) => (
            <AdminStudioLegacyCareerCard key={c.id} career={c} />
          ))}
        </div>
      ) : null}

      {activeTab === 'shows' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>SHOW HISTORY</AdminStudioSectionHeading>
          {LEGACY_SHOW_HISTORIES.map((s) => (
            <div key={s.id} className="p-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: '3px solid #2563EB' }}>
              <p className="text-[9px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{s.title}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>PREMIERE {s.premiereDate} · {s.seasons} SEASONS · {s.episodes} EPISODES</p>
              <div className="grid grid-cols-2 gap-1 mt-2">
                <p className="text-[5px] font-futura uppercase p-1 border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>COMPLETION {s.avgCompletion}%</p>
                <p className="text-[5px] font-futura uppercase p-1 border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>RATING {s.audienceRating}/5</p>
              </div>
              <p className="text-[5px] font-futura uppercase mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>MOST WATCHED: {s.mostWatched}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>INTRO: {s.introEvolution}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>VISUAL: {s.visualEvolution}</p>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'studios' ? (
        <div className="mt-3 space-y-2">
          <AdminStudioSectionHeading>STUDIO HISTORY</AdminStudioSectionHeading>
          {LEGACY_STUDIO_HISTORIES.map((s) => (
            <div key={s.id} className="p-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{s.name}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>CREATED {s.createdDate} · {s.version}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>LIGHTING: {s.lightingUpdates}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>CAMERA: {s.cameraUpdates}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: '#16A34A' }}>{s.productionsFilmed} PRODUCTIONS FILMED</p>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'campaigns' ? (
        <div className="mt-3 space-y-2">
          <AdminStudioSectionHeading>CAMPAIGN HISTORY</AdminStudioSectionHeading>
          {LEGACY_CAMPAIGN_HISTORIES.map((c) => (
            <div key={c.id} className="p-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `3px solid ${ADMIN_STUDIO_THEME.accent}` }}>
              <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{c.title}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>LAUNCH {c.launchDate} · GOAL: {c.goal}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>REACH {c.audienceReach} · MEMBERS {c.membershipGrowth} · REVENUE {c.revenueInfluence}</p>
              <p className="text-[5px] font-futura uppercase mt-2 px-2 py-1 border" style={{ fontWeight: 515, color: '#CA8A04', borderColor: ADMIN_STUDIO_THEME.panelBorder, background: ADMIN_STUDIO_THEME.selectedBg }}>
                LESSON: {c.lessonsLearned}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'community' ? (
        <div className="mt-3 space-y-2">
          <AdminStudioSectionHeading>COMMUNITY LEGACY</AdminStudioSectionHeading>
          {LEGACY_COMMUNITY_ENTRIES.map((e) => (
            <div key={e.id} className="p-3 border text-center" style={{ background: 'linear-gradient(180deg, rgba(147,51,234,0.04) 0%, rgba(255,255,255,0.9) 100%)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              <p className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: '#9333EA' }}>{e.category}</p>
              <p className="text-[12px] mt-1" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>{e.name}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>{e.story}</p>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'vault' ? (
        <div className="mt-3 space-y-2">
          <AdminStudioSectionHeading>VAULT OF FIRSTS</AdminStudioSectionHeading>
          <p className="text-[6px] font-futura uppercase -mt-2 mb-2" style={{ fontWeight: 515, color: '#1F2937' }}>PERMANENTLY LOCKED · NEVER EDITABLE · NEVER REPLACEABLE</p>
          {LEGACY_VAULT_OF_FIRSTS.map((v) => (
            <AdminStudioLegacyVaultItem key={v.id} item={v} />
          ))}
        </div>
      ) : null}

      {activeTab === 'capsules' ? (
        <div className="mt-3 space-y-2">
          <AdminStudioSectionHeading>TIME CAPSULES</AdminStudioSectionHeading>
          {LEGACY_TIME_CAPSULES.map((c) => (
            <AdminStudioLegacyTimeCapsuleCard key={c.id} capsule={c} />
          ))}
        </div>
      ) : null}

      {activeTab === 'timeline' ? (
        <div className="mt-3 space-y-1">
          <AdminStudioSectionHeading>LEGACY TIMELINE</AdminStudioSectionHeading>
          {LEGACY_TIMELINE_EVENTS.map((e) => (
            <div key={e.id} className="px-3 py-1.5 border flex justify-between" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: '2px solid #8B0000', background: 'rgba(255,255,255,0.75)' }}>
              <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{e.label}</p>
              <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{e.date}</p>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'anniversaries' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>ANNIVERSARY COLLECTIONS</AdminStudioSectionHeading>
          {LEGACY_ANNIVERSARY_COLLECTIONS.map((y) => (
            <div key={y.id} className="p-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: '2px solid #D97706' }}>
              <p className="text-[14px]" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>{y.title}</p>
              <p className="text-[7px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: '#D97706' }}>{y.subtitle}</p>
              <p className="text-[5px] font-futura uppercase mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{y.itemCount > 0 ? `${y.itemCount} ARTIFACTS` : 'COLLECTION PENDING'} · {y.highlight}</p>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'founder-journal' && isFounder ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>FOUNDER JOURNAL</AdminStudioSectionHeading>
          <p className="text-[6px] font-futura uppercase -mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>PRIVATE · FOUNDER EYES ONLY</p>
          {journal.map((e) => (
            <div key={e.id} className="p-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{e.milestone}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{e.date} · {e.association}</p>
              <textarea
                value={e.note}
                onChange={(ev) => updateJournalNote(e.id, ev.target.value)}
                rows={3}
                className="w-full mt-2 bg-white/90 border text-black text-[8px] font-futura uppercase p-2 outline-none resize-none"
                style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.inputBorder }}
              />
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'predictions' && isFounder ? (
        <div className="mt-3 space-y-2">
          <AdminStudioSectionHeading>FOUNDER PREDICTIONS</AdminStudioSectionHeading>
          {predictions.map((p) => (
            <div key={p.id} className="p-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{p.prediction}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>RECORDED {p.recordedDate} · TARGET {p.targetYear}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {(['planned', 'in-progress', 'achieved', 'archived'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setPredictionStatus(p.id, st)}
                    className="px-2 py-1 text-[5px] font-futura uppercase border"
                    style={{
                      fontWeight: 515,
                      color: p.status === st ? '#FFF' : ADMIN_STUDIO_THEME.textSecondary,
                      background: p.status === st ? PREDICTION_STATUS_COLORS[st] : 'rgba(255,255,255,0.8)',
                      borderColor: ADMIN_STUDIO_THEME.panelBorder,
                    }}
                  >
                    {st.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'letters' && isFounder ? (
        <div className="mt-3 space-y-2">
          <AdminStudioSectionHeading>LEGACY LETTERS</AdminStudioSectionHeading>
          {letters.map((l) => (
            <div key={l.id} className="p-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>🔒 {l.title}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>OPENS {l.sealedUntil} · {l.openIn}</p>
              <p className="text-[6px] font-futura uppercase mt-2 italic" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>"{l.preview}…"</p>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'annual-reviews' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>ANNUAL REVIEWS</AdminStudioSectionHeading>
          {LEGACY_ANNUAL_REVIEWS.map((r) => (
            <div key={r.id} className="p-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: '2px solid #16A34A' }}>
              <p className="text-[12px]" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>{r.title}</p>
              <div className="grid grid-cols-2 gap-1 mt-2">
                <p className="text-[5px] font-futura uppercase p-1 border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>PRODUCTS {r.productsReleased}</p>
                <p className="text-[5px] font-futura uppercase p-1 border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>CAMPAIGNS {r.campaigns}</p>
                <p className="text-[5px] font-futura uppercase p-1 border" style={{ fontWeight: 515, color: '#16A34A', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>REVENUE {r.revenueGrowth}</p>
                <p className="text-[5px] font-futura uppercase p-1 border" style={{ fontWeight: 515, color: '#16A34A', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>MEMBERS {r.membershipGrowth}</p>
              </div>
              <p className="text-[5px] font-futura uppercase mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>MOST WATCHED: {r.mostWatched} · BEST PRODUCT: {r.bestProduct}</p>
              <p className="text-[5px] font-futura uppercase mt-2 px-2 py-1 border" style={{ fontWeight: 515, color: '#CA8A04', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>LESSON: {r.biggestLesson}</p>
              <p className="text-[5px] font-futura uppercase mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>FOUNDER: {r.founderReflection}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>CD: {r.creativeDirectorReflection}</p>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'documentary' ? (
        <div className="mt-3 space-y-2">
          <AdminStudioSectionHeading>DOCUMENTARY MODE</AdminStudioSectionHeading>
          {LEGACY_DOCUMENTARIES.map((d) => (
            <div key={d.id} className="p-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              <p className="text-[9px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{d.title}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{d.chapters} CHAPTERS · {d.duration}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>{d.description}</p>
              <button type="button" className="mt-2 px-2 py-1 text-[5px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>PLAY DOCUMENTARY →</button>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'behind-scenes' ? (
        <div className="mt-3 space-y-2">
          <AdminStudioSectionHeading>BEHIND THE SCENES</AdminStudioSectionHeading>
          {LEGACY_BEHIND_SCENES.map((b) => (
            <div key={b.id} className="p-2.5 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              <p className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{b.category}</p>
              <p className="text-[7px] font-futura uppercase mt-0.5" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{b.title}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: b.status === 'REJECTED' ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary }}>{b.status} · {b.date}</p>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'keys' ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <AdminStudioSectionHeading>LEGACY KEYS</AdminStudioSectionHeading>
          {LEGACY_KEYS.map((k) => (
            <div key={k.id} className="p-3 border text-center col-span-1" style={{ background: 'linear-gradient(180deg, rgba(139,0,0,0.06) 0%, rgba(255,255,255,0.92) 100%)', borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: '2px solid #8B0000' }}>
              <p className="text-[18px]">🗝️</p>
              <p className="text-[7px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: '#8B0000' }}>{k.title}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>UNLOCKED {k.unlockedDate}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>{k.description}</p>
            </div>
          ))}
        </div>
      ) : null}

      <AdminStudioDisclaimerFooter>PERMANENT MEMORY · REFERENCES ORIGINAL RECORDS · DEMO ARCHIVE</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
