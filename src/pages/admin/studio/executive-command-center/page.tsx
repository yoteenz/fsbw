import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioTabBar } from '../../../../components/admin/studio/AdminStudioTabBar';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioExecutiveCard } from '../../../../components/admin/studio/AdminStudioExecutiveCard';
import { AdminStudioExecutiveHealthGrid } from '../../../../components/admin/studio/AdminStudioExecutiveHealthGrid';
import { AdminStudioExecutiveOpportunityCard } from '../../../../components/admin/studio/AdminStudioExecutiveOpportunityCard';
import { AdminStudioExecutiveRiskCard } from '../../../../components/admin/studio/AdminStudioExecutiveRiskCard';
import { AdminStudioCreativeScoreRing } from '../../../../components/admin/studio/AdminStudioCreativeWidget';
import { useAdminStudioExecutiveCommandCenter } from '../../../../hooks/useAdminStudioExecutiveCommandCenterState';
import {
  ADMIN_STUDIO_EXECUTIVE_COMMAND_CENTER_SUBTITLE,
  EXECUTIVE_OVERVIEW_CARDS,
  EXECUTIVE_TABS,
  EXECUTIVE_REPORTING_CHAIN,
  EXECUTIVE_CREATIVE_BRIEFING,
  EXECUTIVE_BUSINESS_HEALTH,
  EXECUTIVE_STUDIO_HEALTH,
  EXECUTIVE_AUDIENCE_HEALTH,
  EXECUTIVE_PRODUCT_HEALTH,
  EXECUTIVE_LAUNCH_CAMPAIGNS,
  EXECUTIVE_OPPORTUNITIES,
  EXECUTIVE_RISKS,
  EXECUTIVE_QUICK_ACTIONS,
  EXECUTIVE_TIMELINE,
  EXECUTIVE_RECENT_WINS,
  EXECUTIVE_TODAY_PRIORITIES,
  type ExecutiveTabId,
  type ExecutiveOverviewCardId,
} from '../../../../utils/adminStudioExecutiveCommandCenterDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

const CARD_TAB_MAP: Partial<Record<ExecutiveOverviewCardId, ExecutiveTabId>> = {
  priorities: 'command',
  'creative-briefing': 'command',
  'business-health': 'business',
  'studio-health': 'studio',
  'audience-health': 'audience',
  'launch-status': 'launch',
  revenue: 'business',
  membership: 'business',
  production: 'studio',
  upcoming: 'timeline',
  wins: 'command',
  risks: 'risks',
};

export default function AdminStudioExecutiveCommandCenterPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ExecutiveTabId>('command');
  const { searchQuery, setSearchQuery, searchResults, decisions, setDecisionStatus, pendingDecisionCount } = useAdminStudioExecutiveCommandCenter();
  const briefing = EXECUTIVE_CREATIVE_BRIEFING;

  return (
    <AdminStudioStageShell
      title="THE STUDIO"
      subtitle={ADMIN_STUDIO_EXECUTIVE_COMMAND_CENTER_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/dashboard')}
    >
      <div className="p-3 mb-3 border" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{briefing.greeting}</p>
        <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          EVERY DEPARTMENT REPORTS HERE · UNDERSTAND THE COMPANY IN 60 SECONDS
        </p>
      </div>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="EXECUTIVE SEARCH — PACKS · SHOWS · TALENT · PRODUCTS…"
        className="w-full mb-3 bg-white/90 border text-black text-[9px] font-futura uppercase px-3 py-2.5 outline-none"
        style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.inputBorder }}
      />
      {searchQuery.trim() ? (
        <div className="mb-3 space-y-1 max-h-32 overflow-y-auto">
          {searchResults.length === 0 ? (
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>NO RESULTS</p>
          ) : (
            searchResults.map((r) => (
              <button key={r.id} type="button" onClick={() => navigate(r.route)} className="w-full text-left p-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: ADMIN_STUDIO_THEME.panelBg }}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{r.label}</p>
                <p className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{r.category}</p>
              </button>
            ))
          )}
        </div>
      ) : null}

      <AdminStudioSectionHeading>EXECUTIVE OVERVIEW</AdminStudioSectionHeading>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {EXECUTIVE_OVERVIEW_CARDS.map((card) => (
          <AdminStudioExecutiveCard
            key={card.id}
            title={card.title}
            metric={card.id === 'risks' ? String(EXECUTIVE_RISKS.length) : card.id === 'priorities' ? String(EXECUTIVE_TODAY_PRIORITIES.length) : card.metric}
            description={card.description}
            accentHex={card.accentHex}
            onClick={() => setTab(CARD_TAB_MAP[card.id] ?? 'command')}
          />
        ))}
      </div>

      <AdminStudioTabBar tabs={EXECUTIVE_TABS} activeTab={tab} onTabChange={setTab} />

      {tab === 'command' ? (
        <div className="mt-3 space-y-4">
          <div className="p-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: `2px solid ${ADMIN_STUDIO_THEME.accent}` }}>
            <AdminStudioSectionHeading>CREATIVE BRIEFING</AdminStudioSectionHeading>
            <p className="text-[7px] font-futura uppercase -mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>FROM CREATIVE DIRECTOR</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <AdminStudioCreativeScoreRing label="CONFIDENCE" score={briefing.confidenceScore} />
              <div className="p-2 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>RECOMMENDED SHOW</p>
                <p className="text-[11px] mt-1" style={{ fontFamily: '"Covered By Your Grace", sans-serif' }}>{briefing.recommendedShow}</p>
              </div>
            </div>
            <p className="text-[7px] font-futura uppercase mt-3" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>TOPIC: {briefing.recommendedTopic}</p>
            <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>PRODUCTS: {briefing.recommendedProducts}</p>
            <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>TRENDS: {briefing.trendingOpportunities}</p>
            <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>DEADLINES: {briefing.upcomingDeadlines}</p>
            <div className="flex flex-wrap gap-1 mt-3">
              <button type="button" onClick={() => navigate('/admin/studio/production')} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ fontWeight: 515, color: '#FFF', background: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>START PRODUCTION</button>
              <button type="button" onClick={() => navigate('/admin/studio/content-packs')} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>REVIEW DRAFTS</button>
              <button type="button" onClick={() => navigate('/admin/studio/studio-lot')} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>OPEN STUDIO</button>
              <button type="button" onClick={() => navigate('/admin/studio/publishing-queue')} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>OPEN PUBLISHING</button>
            </div>
          </div>

          <AdminStudioSectionHeading>TODAY'S PRIORITIES</AdminStudioSectionHeading>
          <div className="space-y-1">
            {EXECUTIVE_TODAY_PRIORITIES.map((p) => (
              <div key={p} className="px-3 py-1.5 border text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${ADMIN_STUDIO_THEME.accent}`, background: 'rgba(255,255,255,0.75)' }}>{p}</div>
            ))}
          </div>

          <AdminStudioSectionHeading>RECENT WINS</AdminStudioSectionHeading>
          <div className="space-y-1">
            {EXECUTIVE_RECENT_WINS.map((w) => (
              <div key={w} className="px-3 py-1.5 border text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: '#16A34A', borderColor: ADMIN_STUDIO_THEME.panelBorder, background: ADMIN_STUDIO_THEME.selectedBg }}>{w}</div>
            ))}
          </div>

          <AdminStudioSectionHeading>QUICK ACTIONS</AdminStudioSectionHeading>
          <div className="grid grid-cols-2 gap-2">
            {EXECUTIVE_QUICK_ACTIONS.map((a) => (
              <button key={a.id} type="button" onClick={() => navigate(a.route)} className="py-2 px-2 text-[6px] font-futura uppercase border text-left" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.7)' }}>{a.label}</button>
            ))}
          </div>
        </div>
      ) : null}

      {tab === 'business' ? <div className="mt-3"><AdminStudioExecutiveHealthGrid metrics={EXECUTIVE_BUSINESS_HEALTH} accentHex="#16A34A" /></div> : null}
      {tab === 'studio' ? <div className="mt-3"><AdminStudioExecutiveHealthGrid metrics={EXECUTIVE_STUDIO_HEALTH} accentHex="#2563EB" /></div> : null}
      {tab === 'audience' ? <div className="mt-3"><AdminStudioExecutiveHealthGrid metrics={EXECUTIVE_AUDIENCE_HEALTH} accentHex="#CA8A04" /></div> : null}
      {tab === 'product' ? <div className="mt-3"><AdminStudioExecutiveHealthGrid metrics={EXECUTIVE_PRODUCT_HEALTH} accentHex="#8B0000" /></div> : null}

      {tab === 'launch' ? (
        <div className="mt-3 space-y-3">
          {EXECUTIVE_LAUNCH_CAMPAIGNS.map((c) => (
            <div key={c.id} className="p-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `3px solid ${c.accentHex}` }}>
              <div className="flex justify-between items-start">
                <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{c.title}</p>
                <span className="text-[10px]" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: c.accentHex }}>{c.countdown}</span>
              </div>
              <div className="h-1.5 mt-2 bg-white/80 border overflow-hidden" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                <div className="h-full transition-all" style={{ width: `${c.progress}%`, background: c.accentHex }} />
              </div>
              <p className="text-[5px] font-futura uppercase mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>ASSETS {c.assetsReady} · REMAINING: {c.contentRemaining}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>EMAIL {c.emailStatus} · SOCIAL {c.socialStatus} · WEB {c.websiteStatus} · PROD {c.productionStatus}</p>
            </div>
          ))}
        </div>
      ) : null}

      {tab === 'opportunities' ? (
        <div className="mt-3 space-y-2">
          {EXECUTIVE_OPPORTUNITIES.map((o) => (
            <AdminStudioExecutiveOpportunityCard key={o.id} opportunity={o} />
          ))}
        </div>
      ) : null}

      {tab === 'risks' ? (
        <div className="mt-3 space-y-2">
          {EXECUTIVE_RISKS.map((r) => (
            <AdminStudioExecutiveRiskCard key={r.id} risk={r} />
          ))}
        </div>
      ) : null}

      {tab === 'decisions' ? (
        <div className="mt-3 space-y-2">
          <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{pendingDecisionCount} PENDING DECISIONS</p>
          {decisions.map((d) => (
            <div key={d.id} className="p-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{d.title}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{d.type} · DUE {d.due}</p>
              <div className="flex gap-1 mt-2">
                {(['pending', 'approved', 'rejected'] as const).map((st) => (
                  <button key={st} type="button" onClick={() => setDecisionStatus(d.id, st)} className="flex-1 py-1 text-[5px] font-futura uppercase border" style={{ fontWeight: 515, color: d.status === st ? '#FFF' : ADMIN_STUDIO_THEME.textSecondary, background: d.status === st ? (st === 'approved' ? '#16A34A' : st === 'rejected' ? ADMIN_STUDIO_THEME.accent : '#6B7280') : 'rgba(255,255,255,0.8)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                    {st}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {tab === 'timeline' ? (
        <div className="mt-3 space-y-2">
          {['today', 'week', 'month', 'launch', 'premiere', 'drop'].map((cat) => {
            const items = EXECUTIVE_TIMELINE.filter((t) => t.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <p className="text-[6px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{cat.replace('-', ' ')}</p>
                {items.map((t) => (
                  <div key={t.id} className="px-3 py-1.5 mb-1 border text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${ADMIN_STUDIO_THEME.accent}`, background: 'rgba(255,255,255,0.75)' }}>
                    {t.label} · {t.date}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-4 p-2.5 border" style={{ background: 'rgba(255,255,255,0.5)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[5px] font-futura uppercase text-center" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.6 }}>
          {EXECUTIVE_REPORTING_CHAIN.join(' · ')}
        </p>
      </div>

      <div className="flex gap-2 mt-3">
        <button type="button" onClick={() => navigate('/admin/studio/audience-brain')} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>← AUDIENCE BRAIN</button>
        <button type="button" onClick={() => navigate('/admin/studio/creative-director')} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>CREATIVE DIRECTOR →</button>
      </div>

      <AdminStudioDisclaimerFooter>LIVE EXECUTIVE SUMMARY · DEMO AGGREGATION · CONNECTORS NOT CONNECTED</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
