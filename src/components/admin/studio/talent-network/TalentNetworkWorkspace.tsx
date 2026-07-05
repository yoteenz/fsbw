import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminStudioTalentNetworkState } from '../../../../hooks/useAdminStudioTalentNetworkState';
import {
  TALENT_NETWORK_TABS,
  type TalentNetworkTabId,
} from '../../../../utils/adminStudioTalentNetworkDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  CASTING_ROLE_LABELS,
  TALENT_TYPE_LABELS,
  WARDROBE_CATEGORY_LABELS,
} from '../../../../studio-os-core/talent-network/constants';
import {
  adminStudioGrowthNetworkPath,
  adminStudioKnowledgeHubPath,
  adminStudioMemoryBiblePath,
} from '../../../../utils/adminStudioRoutes';

const panelStyle = {
  background: ADMIN_STUDIO_THEME.panelBg,
  borderColor: ADMIN_STUDIO_THEME.panelBorder,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
      {children}
    </p>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-2 border" style={panelStyle}>
      <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {label}
      </p>
      <p
        className="text-[14px] leading-none mt-1"
        style={{
          fontFamily: '"Covered By Your Grace", sans-serif',
          color: accent ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textPrimary,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function TalentRow({ name, type, score, status }: { name: string; type: string; score: number; status: string }) {
  return (
    <div className="p-2 border mb-1 flex justify-between items-center" style={panelStyle}>
      <div>
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
          {name}
        </p>
        <p className="text-[6px] font-futura uppercase mt-0.5" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {type} · {status}
        </p>
      </div>
      <p className="text-[12px]" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>
        {score}
      </p>
    </div>
  );
}

export function TalentNetworkWorkspace() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TalentNetworkTabId | null) ?? 'overview';
  const [tab, setTab] = useState<TalentNetworkTabId>(
    TALENT_NETWORK_TABS.some((t) => t.id === initialTab) ? initialTab : 'overview'
  );

  const {
    talents,
    aiTalents,
    humanTalents,
    wardrobes,
    castings,
    activeCastings,
    auditionCastings,
    seriesAssignments,
    audienceIntel,
    characterVersions,
    contracts,
    growthRecommendations,
    onboardingDrafts,
    avgTalentScore,
    totalEarnings,
    totalViews,
  } = useAdminStudioTalentNetworkState();

  const selectTab = (id: TalentNetworkTabId) => {
    setTab(id);
    setSearchParams({ tab: id }, { replace: true });
  };

  const topTalents = [...talents].sort((a, b) => b.talentScore.overall - a.talentScore.overall);

  const renderTab = () => {
    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="REGISTERED TALENT" value={`${talents.length}`} accent />
              <MetricCard label="AVG TALENT SCORE" value={`${avgTalentScore}`} />
              <MetricCard label="AI PRESENTERS" value={`${aiTalents.length}`} />
              <MetricCard label="HUMAN TALENT" value={`${humanTalents.length}`} />
            </div>
            <SectionLabel>TOP TALENT · OPEN PERFORMANCE TAB FOR FULL REGISTRY</SectionLabel>
            {topTalents.slice(0, 8).map((t) => (
              <TalentRow
                key={t.id}
                name={t.displayName}
                type={TALENT_TYPE_LABELS[t.talentType]}
                score={t.talentScore.overall}
                status={t.status.toUpperCase()}
              />
            ))}
            {topTalents.length > 8 ? (
              <button
                type="button"
                onClick={() => selectTab('performance')}
                className="w-full py-2 text-[6px] font-futura uppercase border"
                style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
              >
                VIEW ALL {topTalents.length} TALENT → PERFORMANCE
              </button>
            ) : null}
            <SectionLabel>TOP GROWTH RECOMMENDATIONS</SectionLabel>
            {growthRecommendations.slice(0, 2).map((r) => (
              <p key={r.id} className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {r.recommendation}
              </p>
            ))}
          </div>
        );

      case 'active-productions':
        return (
          <div className="space-y-3">
            <SectionLabel>CONFIRMED & IN-PRODUCTION CASTINGS</SectionLabel>
            {activeCastings.map((c) => {
              const talent = talents.find((t) => t.id === c.talentId);
              return (
                <div key={c.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {c.productionTitle}
                  </p>
                  <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {talent?.displayName ?? c.talentId} · {CASTING_ROLE_LABELS[c.role]} · {c.status.toUpperCase()}
                  </p>
                </div>
              );
            })}
            <SectionLabel>RECURRING SERIES HOSTS</SectionLabel>
            {seriesAssignments.filter((s) => s.recurring).map((s) => {
              const talent = talents.find((t) => t.id === s.talentId);
              return (
                <p key={s.id} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {s.showName} · {talent?.displayName} · {s.episodeIds.length} eps
                </p>
              );
            })}
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-3">
            {[...talents]
              .sort((a, b) => b.talentScore.overall - a.talentScore.overall)
              .map((t) => (
                <div key={t.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {t.displayName} · SCORE {t.talentScore.overall}
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    <MetricCard label="RETENTION" value={`${t.talentScore.viewerRetention}%`} />
                    <MetricCard label="ENGAGEMENT" value={`${t.talentScore.engagement}%`} />
                    <MetricCard label="BRAND FIT" value={`${t.talentScore.brandFit}%`} />
                    <MetricCard label="REVENUE GEN" value={`${t.talentScore.revenueGeneration}%`} />
                  </div>
                </div>
              ))}
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="TOTAL VIEWS" value={totalViews.toLocaleString()} accent />
              <MetricCard label="AVG RETENTION" value={`${Math.round(talents.reduce((s, t) => s + t.performance.retention, 0) / talents.length * 100)}%`} />
            </div>
            <SectionLabel>PER-TALENT METRICS</SectionLabel>
            {talents.map((t) => (
              <div key={t.id} className="p-2 border mb-2" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {t.displayName}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {t.performance.views.toLocaleString()} views · {t.performance.followers.toLocaleString()} followers · sentiment {Math.round(t.performance.sentiment * 100)}%
                </p>
              </div>
            ))}
            <SectionLabel>AUDIENCE INTELLIGENCE</SectionLabel>
            {audienceIntel.map((intel) => {
              const talent = talents.find((t) => t.id === intel.talentId);
              return (
                <div key={intel.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {talent?.displayName}
                  </p>
                  <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                    Best demo: {intel.bestDemographics} · Platforms: {intel.bestPlatforms.join(', ')}
                  </p>
                </div>
              );
            })}
          </div>
        );

      case 'wardrobe':
        return (
          <div className="space-y-3">
            <SectionLabel>REUSABLE WARDROBES · CROSS-PRODUCTION</SectionLabel>
            {wardrobes.map((w) => (
              <div key={w.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {w.name} · {WARDROBE_CATEGORY_LABELS[w.category]}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {w.description}
                </p>
                <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {w.assignedTalentIds.length} talent assigned · {w.reusable ? 'REUSABLE' : 'SINGLE USE'}
                </p>
              </div>
            ))}
          </div>
        );

      case 'contracts':
        return (
          <div className="space-y-3">
            {contracts.map((c) => {
              const talent = talents.find((t) => t.id === c.talentId);
              return (
                <div key={c.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {c.title}
                  </p>
                  <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {talent?.displayName} · {c.rate}
                  </p>
                  <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                    Exclusivity: {c.exclusivity} · Usage: {c.usageRights}
                  </p>
                  {c.renewalDate ? (
                    <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                      Renewal: {c.renewalDate}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        );

      case 'earnings':
        return (
          <div className="space-y-3">
            <MetricCard label="NETWORK TALENT REVENUE" value={`$${totalEarnings.toLocaleString()}`} accent />
            {talents.map((t) => {
              const total = t.performance.revenue + t.performance.affiliateRevenue + t.performance.sponsorshipRevenue;
              return (
                <div key={t.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {t.displayName} · ${total.toLocaleString()}
                  </p>
                  <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    Direct ${t.performance.revenue} · Affiliate ${t.performance.affiliateRevenue} · Sponsor ${t.performance.sponsorshipRevenue}
                  </p>
                </div>
              );
            })}
          </div>
        );

      case 'campaigns':
        return (
          <div className="space-y-3">
            <SectionLabel>SERIES · SHOW · CAMPAIGN ASSIGNMENTS</SectionLabel>
            {seriesAssignments.map((s) => {
              const talent = talents.find((t) => t.id === s.talentId);
              return (
                <div key={s.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {s.showName} · {talent?.displayName}
                  </p>
                  <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {s.seriesName ?? 'Ongoing'} · {s.recurring ? 'RECURRING HOST' : 'GUEST'}
                    {s.campaign ? ` · ${s.campaign}` : ''}
                  </p>
                </div>
              );
            })}
          </div>
        );

      case 'availability':
        return (
          <div className="space-y-3">
            {talents.map((t) => (
              <div key={t.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {t.displayName}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {t.availability}
                </p>
                <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Score availability factor: {t.talentScore.availability}%
                </p>
              </div>
            ))}
          </div>
        );

      case 'growth':
        return (
          <div className="space-y-3">
            <SectionLabel>GROWTH NETWORK · TALENT RECOMMENDATIONS</SectionLabel>
            {growthRecommendations.map((r) => (
              <div key={r.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {Math.round(r.confidence * 100)}% CONFIDENCE
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {r.recommendation}
                </p>
                <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {r.context}
                </p>
              </div>
            ))}
            <button
              type="button"
              onClick={() => navigate(adminStudioGrowthNetworkPath())}
              className="w-full py-2 text-[7px] font-futura uppercase border"
              style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
            >
              OPEN GROWTH NETWORK →
            </button>
          </div>
        );

      case 'auditions':
        return (
          <div className="space-y-3">
            <SectionLabel>OPEN AUDITIONS · CASTING PIPELINE</SectionLabel>
            {auditionCastings.map((c) => {
              const talent = talents.find((t) => t.id === c.talentId);
              return (
                <div key={c.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {c.productionTitle}
                  </p>
                  <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {talent?.displayName} · {CASTING_ROLE_LABELS[c.role]} · AUDITION
                  </p>
                </div>
              );
            })}
            <SectionLabel>HUMAN ONBOARDING · SAME WORKFLOW</SectionLabel>
            {onboardingDrafts.map((o) => (
              <div key={o.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {o.displayName} · {o.verificationStatus.toUpperCase()}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {o.bio} · {o.rates}
                </p>
                <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Niche: {o.niche} · Goals: {o.goals.join(', ')}
                </p>
              </div>
            ))}
          </div>
        );

      case 'casting':
        return (
          <div className="space-y-3">
            <SectionLabel>ALL CASTING ASSIGNMENTS</SectionLabel>
            {castings.map((c) => {
              const talent = talents.find((t) => t.id === c.talentId);
              return (
                <div key={c.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {c.productionTitle}
                  </p>
                  <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {talent?.displayName} · {CASTING_ROLE_LABELS[c.role]} · {c.status.toUpperCase()}
                  </p>
                </div>
              );
            })}
          </div>
        );

      case 'history':
        return (
          <div className="space-y-3">
            <SectionLabel>CHARACTER EVOLUTION · VERSION HISTORY (NO OVERWRITES)</SectionLabel>
            {characterVersions.map((v) => {
              const talent = talents.find((t) => t.id === v.talentId);
              return (
                <div key={v.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {talent?.displayName} · v{v.version} · {v.label}
                  </p>
                  <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                    Appearance: {v.appearanceSnapshot}
                  </p>
                  <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                    Voice: {v.voiceSnapshot} · DNA {v.creativeDnaVersion}
                  </p>
                </div>
              );
            })}
          </div>
        );

      case 'versioning':
        return (
          <div className="space-y-3">
            <SectionLabel>AI PERSONALITY VERSIONS · CREATIVE DNA LINKS</SectionLabel>
            {aiTalents.map((t) => {
              const versions = characterVersions.filter((v) => v.talentId === t.id);
              return (
                <div key={t.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {t.displayName} · {versions.length} VERSIONS
                  </p>
                  {t.aiProfile ? (
                    <p className="text-[6px] font-futura normal-case mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                      Current DNA {t.aiProfile.creativeDnaVersion} · {t.aiProfile.voiceModel} · {t.aiProfile.imageModel}
                    </p>
                  ) : null}
                  {versions.map((v) => (
                    <p key={v.id} className="text-[6px] font-futura uppercase py-1 border-t" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                      v{v.version} · {v.createdAt.slice(0, 10)}
                    </p>
                  ))}
                </div>
              );
            })}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate(adminStudioMemoryBiblePath())}
                className="flex-1 py-2 text-[7px] font-futura uppercase border"
                style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
              >
                MEMORY BIBLE
              </button>
              <button
                type="button"
                onClick={() => navigate(adminStudioKnowledgeHubPath())}
                className="flex-1 py-2 text-[7px] font-futura uppercase border"
                style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
              >
                KNOWLEDGE GRAPH
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-3">
        {TALENT_NETWORK_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              fontWeight: 515,
              color: tab === t.id ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
              borderColor: ADMIN_STUDIO_THEME.panelBorder,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {renderTab()}
    </div>
  );
}
