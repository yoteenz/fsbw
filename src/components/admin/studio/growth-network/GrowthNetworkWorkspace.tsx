import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminStudioGrowthNetworkState } from '../../../../hooks/useAdminStudioGrowthNetworkState';
import {
  DEMO_GROWTH_ANALYTICS,
  GROWTH_NETWORK_TABS,
  type GrowthNetworkTabId,
} from '../../../../utils/adminStudioGrowthNetworkDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  DEAL_PIPELINE_LABELS,
  DEAL_PIPELINE_STAGES,
  GROWTH_ROADMAP_LABELS,
  GROWTH_ROADMAP_STAGES,
  OPPORTUNITY_TYPE_LABELS,
  REVENUE_CHANNEL_LABELS,
} from '../../../../studio-os-core/growth-network/constants';
import { roadmapPriorities } from '../../../../studio-os-core/growth-network/growthEngine';
import { getGrowthExecutivesForWorkspace } from '../../../../studio-os-core/growth-network/growthExecutives';
import { adminStudioKnowledgeHubPath, adminStudioMemoryBiblePath } from '../../../../utils/adminStudioRoutes';

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

export function GrowthNetworkWorkspace() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as GrowthNetworkTabId | null) ?? 'overview';
  const [tab, setTab] = useState<GrowthNetworkTabId>(
    GROWTH_NETWORK_TABS.some((t) => t.id === initialTab) ? initialTab : 'overview'
  );

  const {
    profile,
    opportunities,
    recommendations,
    partnerships,
    contracts,
    revenue,
    monthlyRevenue,
    annualRevenue,
    registry,
    serviceProviders,
    updateProfile,
    workspaceId,
  } = useAdminStudioGrowthNetworkState();

  const executives = useMemo(() => getGrowthExecutivesForWorkspace(), []);
  const roadmapPriorityList = profile ? roadmapPriorities(profile.roadmapStage) : [];

  const revenueDiversificationScore = useMemo(() => {
    if (revenue.length === 0) return 0;
    const active = revenue.filter((r) => r.monthlyAmount > 0).length;
    return Math.min(100, Math.round((active / Math.max(revenue.length, 1)) * 100));
  }, [revenue]);

  const selectTab = (id: GrowthNetworkTabId) => {
    setTab(id);
    setSearchParams({ tab: id }, { replace: true });
  };

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        GROWTH PROFILE LOADING — BOOTSTRAP IN PROGRESS
      </p>
    );
  }

  const renderTab = () => {
    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="GROWTH SCORE" value={`${profile.growthScore}`} accent />
              <MetricCard label="ROADMAP STAGE" value={GROWTH_ROADMAP_LABELS[profile.roadmapStage].toUpperCase()} />
              <MetricCard label="MONTHLY REVENUE" value={`$${monthlyRevenue.toLocaleString()}`} />
              <MetricCard label="MATCHED OPPORTUNITIES" value={`${opportunities.length}`} />
            </div>
            <SectionLabel>GROWTH ROADMAP · {GROWTH_ROADMAP_LABELS[profile.roadmapStage].toUpperCase()}</SectionLabel>
            <div className="flex flex-col items-center gap-0">
              {GROWTH_ROADMAP_STAGES.map((stage, i) => (
                <div key={stage} className="w-full flex flex-col items-center">
                  {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
                  <div
                    className="w-full px-2 py-1 text-[6px] font-futura uppercase text-center border"
                    style={{
                      fontWeight: 515,
                      color: stage === profile.roadmapStage ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                      background: stage === profile.roadmapStage ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
                      borderColor: ADMIN_STUDIO_THEME.panelBorder,
                    }}
                  >
                    {GROWTH_ROADMAP_LABELS[stage].toUpperCase()}
                    {stage === profile.roadmapStage ? ' · CURRENT' : ''}
                  </div>
                </div>
              ))}
            </div>
            <SectionLabel>NEXT STAGE PRIORITIES</SectionLabel>
            <ul className="space-y-1">
              {roadmapPriorityList.map((p) => (
                <li key={p} className="text-[6px] font-futura uppercase px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {p}
                </li>
              ))}
            </ul>
            <SectionLabel>TOP RECOMMENDATIONS</SectionLabel>
            {recommendations.slice(0, 3).map((rec) => (
              <div key={rec.id} className="p-2 border mb-2" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {rec.title}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {rec.rationale}
                </p>
              </div>
            ))}
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-2 text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            <div className="p-2 border" style={panelStyle}>
              <p style={{ color: ADMIN_STUDIO_THEME.accent }}>COMPANY OVERVIEW</p>
              <p className="mt-1 normal-case" style={{ lineHeight: 1.4 }}>{profile.companyOverview}</p>
            </div>
            <div className="p-2 border" style={panelStyle}>
              <p>FOUNDER · {profile.founderProfile}</p>
              <p className="mt-1">NICHE · {profile.niche}</p>
              <p className="mt-1">AUDIENCE · {profile.audience}</p>
              <p className="mt-1">TYPE · {profile.companyType.replace(/-/g, ' ')}</p>
            </div>
            <div className="p-2 border" style={panelStyle}>
              <p style={{ color: ADMIN_STUDIO_THEME.accent }}>PRODUCTS & SERVICES</p>
              <p className="mt-1">PRODUCTS · {profile.products.join(' · ') || '—'}</p>
              <p className="mt-1">SERVICES · {profile.services.join(' · ') || '—'}</p>
            </div>
            <div className="p-2 border" style={panelStyle}>
              <p style={{ color: ADMIN_STUDIO_THEME.accent }}>PLATFORMS & ENGAGEMENT</p>
              <p className="mt-1">PLATFORMS · {profile.socialPlatforms.join(' · ') || '—'}</p>
              <p className="mt-1">ENGAGEMENT · {profile.engagementSummary}</p>
              <p className="mt-1">MONTHLY GROWTH · {profile.monthlyGrowth}</p>
            </div>
            <div className="p-2 border" style={panelStyle}>
              <p style={{ color: ADMIN_STUDIO_THEME.accent }}>PARTNERSHIPS & REVENUE</p>
              <p className="mt-1">PARTNERSHIPS · {profile.partnerships.join(' · ') || '—'}</p>
              <p className="mt-1">AFFILIATES · {profile.affiliatePrograms.join(' · ') || '—'}</p>
              <p className="mt-1">CHANNELS · {profile.revenueChannels.map((c) => REVENUE_CHANNEL_LABELS[c]).join(' · ') || '—'}</p>
            </div>
            <div className="p-2 border" style={panelStyle}>
              <p style={{ color: ADMIN_STUDIO_THEME.accent }}>CURRENT GOALS</p>
              {profile.currentGoals.map((g) => (
                <p key={g} className="mt-1">· {g}</p>
              ))}
            </div>
            <div className="p-2 border" style={panelStyle}>
              <p style={{ color: ADMIN_STUDIO_THEME.accent }}>MEMORY BIBLE · GROWTH STRATEGY</p>
              <p className="mt-1 normal-case" style={{ lineHeight: 1.4 }}>{profile.memoryBibleGrowth.growthStrategy}</p>
              <p className="mt-2">PRICING · {profile.memoryBibleGrowth.pricingPhilosophy}</p>
              <button type="button" className="mt-2 underline text-[6px]" style={{ color: '#6366F1' }} onClick={() => navigate(adminStudioMemoryBiblePath())}>
                OPEN MEMORY BIBLE
              </button>
            </div>
          </div>
        );

      case 'registry':
        return (
          <div className="space-y-2">
            <SectionLabel>SEARCHABLE COMPANY REGISTRY · WORKSPACE {workspaceId.toUpperCase()}</SectionLabel>
            {registry.map((entry) => (
              <div key={entry.id} className="p-2 border" style={panelStyle}>
                <div className="flex justify-between items-start">
                  <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {entry.company}
                  </p>
                  {entry.verified ? (
                    <span className="text-[5px] px-1 border" style={{ borderColor: '#6366F1', color: '#6366F1' }}>VERIFIED</span>
                  ) : null}
                </div>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {entry.industry} · {entry.location}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  AUDIENCE · {entry.audienceDemographics}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  PLATFORMS · {entry.platforms.join(' · ')} · {entry.engagement}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  DNA · {entry.companyDna}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ fontWeight: 515, color: entry.discoverable ? ADMIN_STUDIO_THEME.textSecondary : '#9CA3AF' }}>
                  {entry.discoverable ? 'DISCOVERABLE · BRANDS CAN SEARCH' : 'PRIVATE · NOT DISCOVERABLE'}
                </p>
              </div>
            ))}
          </div>
        );

      case 'opportunities':
        return (
          <div className="space-y-2">
            <SectionLabel>OPPORTUNITY ENGINE · MATCHED FOR THIS WORKSPACE</SectionLabel>
            {opportunities.map((opp) => (
              <div key={opp.id} className="p-2 border" style={panelStyle}>
                <div className="flex justify-between">
                  <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {opp.title}
                  </p>
                  <span className="text-[10px]" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.accent }}>
                    {opp.matchScore}%
                  </span>
                </div>
                <p className="text-[5px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {OPPORTUNITY_TYPE_LABELS[opp.type].toUpperCase()} · {opp.brand}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {opp.description}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ fontWeight: 515, color: '#6366F1' }}>
                  WHY · {opp.matchReason}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  VALUE · {opp.estimatedValue} · STAGE · {DEAL_PIPELINE_LABELS[opp.stage].toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        );

      case 'pipeline':
        return (
          <div>
            <SectionLabel>FULL PARTNERSHIP CRM LIFECYCLE</SectionLabel>
            <div className="flex flex-col items-center gap-0 mb-4">
              {DEAL_PIPELINE_STAGES.map((stage, i) => {
                const activePartnership = partnerships.find((p) => p.status === stage);
                const activeOpp = opportunities.find((o) => o.stage === stage);
                const isActive = Boolean(activePartnership || activeOpp);
                return (
                  <div key={stage} className="w-full flex flex-col items-center">
                    {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
                    <div
                      className="w-full px-2 py-1 text-[6px] font-futura uppercase text-center border"
                      style={{
                        fontWeight: 515,
                        color: isActive ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                        background: isActive ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
                        borderColor: ADMIN_STUDIO_THEME.panelBorder,
                      }}
                    >
                      {DEAL_PIPELINE_LABELS[stage].toUpperCase()}
                      {activePartnership ? ` · ${activePartnership.brand}` : activeOpp ? ` · ${activeOpp.brand}` : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'partnerships':
        return (
          <div className="space-y-2">
            {partnerships.length === 0 ? (
              <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                NO ACTIVE PARTNERSHIPS — OPPORTUNITIES MOVE INTO PIPELINE ON QUALIFICATION
              </p>
            ) : null}
            {partnerships.map((p) => (
              <div key={p.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {p.brand} · {p.campaign}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  CONTACT · {p.contact}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  BUDGET · {p.budget} · {p.paymentTerms}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  TIMELINE · {p.timeline}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  DELIVERABLES · {p.deliverables.join(' · ')}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  STATUS · {DEAL_PIPELINE_LABELS[p.status].toUpperCase()}
                </p>
                {p.renewalReminder ? (
                  <p className="text-[5px] font-futura mt-1" style={{ fontWeight: 515, color: '#6366F1' }}>
                    RENEWAL REMINDER · {p.renewalReminder}
                  </p>
                ) : null}
                <p className="text-[5px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {p.notes}
                </p>
              </div>
            ))}
          </div>
        );

      case 'contracts':
        return (
          <div className="space-y-2">
            <SectionLabel>CONTRACT INTELLIGENCE · EDUCATIONAL INSIGHTS ONLY</SectionLabel>
            {contracts.map((c) => (
              <div key={c.id} className="p-2 border space-y-2" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {c.fileName}
                </p>
                {[
                  ['PAYMENT TERMS', c.paymentTerms],
                  ['USAGE RIGHTS', c.usageRights],
                  ['RENEWAL', c.renewalClauses],
                  ['TERMINATION', c.terminationClauses],
                  ['DELIVERABLES', c.deliverables],
                  ['DEADLINES', c.deadlines],
                  ['FLAGGED LANGUAGE', c.flaggedLanguage],
                  ['POTENTIAL RISKS', c.potentialRisks],
                ].map(([label, items]) => (
                  <div key={label as string}>
                    <p className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                      {label as string}
                    </p>
                    {(items as string[]).map((item) => (
                      <p key={item} className="text-[6px] font-futura normal-case ml-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                        · {item}
                      </p>
                    ))}
                  </div>
                ))}
                <p className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  EXCLUSIVITY · {c.exclusivity}
                </p>
                <p className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  CONTENT OWNERSHIP · {c.contentOwnership}
                </p>
                <p className="text-[5px] font-futura uppercase p-1 border" style={{ fontWeight: 515, color: '#9CA3AF', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                  {c.educationalDisclaimer}
                </p>
              </div>
            ))}
          </div>
        );

      case 'revenue':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="MONTHLY" value={`$${monthlyRevenue.toLocaleString()}`} accent />
              <MetricCard label="ANNUAL" value={`$${annualRevenue.toLocaleString()}`} />
              <MetricCard label="DIVERSIFICATION" value={`${revenueDiversificationScore}%`} />
              <MetricCard label="STREAMS" value={`${revenue.length}`} />
            </div>
            {revenue.map((r) => (
              <div key={r.id} className="p-2 border flex justify-between items-center" style={panelStyle}>
                <div>
                  <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {r.label}
                  </p>
                  <p className="text-[5px] font-futura" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {REVENUE_CHANNEL_LABELS[r.channel].toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px]" style={{ fontFamily: '"Covered By Your Grace", sans-serif' }}>
                    ${r.monthlyAmount.toLocaleString()}/mo
                  </p>
                  <p className="text-[5px] font-futura" style={{ fontWeight: 515, color: r.growthRate > 0 ? '#6366F1' : ADMIN_STUDIO_THEME.textSecondary }}>
                    {r.growthRate > 0 ? `+${r.growthRate}%` : '—'} GROWTH
                  </p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-2">
            {Object.entries(DEMO_GROWTH_ANALYTICS)
              .filter(([k]) => k !== 'improvementAreas')
              .map(([key, value]) => (
                <div key={key} className="p-2 border" style={panelStyle}>
                  <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                  </p>
                  <p className="text-[7px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, lineHeight: 1.4 }}>
                    {value as string}
                  </p>
                </div>
              ))}
            <SectionLabel>IMPROVEMENT RECOMMENDATIONS</SectionLabel>
            {DEMO_GROWTH_ANALYTICS.improvementAreas.map((area) => (
              <p key={area} className="text-[6px] font-futura uppercase px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                · {area}
              </p>
            ))}
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-2">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-2 border" style={panelStyle}>
                <div className="flex justify-between">
                  <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {rec.title}
                  </p>
                  <span className="text-[5px] font-futura px-1 border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: rec.priority === 'high' ? '#EB1C24' : ADMIN_STUDIO_THEME.textSecondary }}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-[5px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {rec.category.toUpperCase()}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  WHY · {rec.rationale}
                </p>
              </div>
            ))}
          </div>
        );

      case 'services':
        return (
          <div className="space-y-2">
            <SectionLabel>TRUSTED SERVICE MARKETPLACE</SectionLabel>
            {serviceProviders.map((svc) => (
              <div key={svc.id} className="p-2 border flex justify-between" style={panelStyle}>
                <div>
                  <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {svc.name}
                  </p>
                  <p className="text-[5px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {svc.category.replace(/-/g, ' ').toUpperCase()}
                  </p>
                  <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {svc.specialty}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[8px]" style={{ fontFamily: '"Covered By Your Grace", sans-serif' }}>{svc.rating}</p>
                  {svc.verified ? <p className="text-[5px] font-futura" style={{ color: '#6366F1' }}>VERIFIED</p> : null}
                </div>
              </div>
            ))}
          </div>
        );

      case 'brands':
        return (
          <div className="space-y-2">
            <SectionLabel>BRAND MARKETPLACE · VERIFIED BRANDS DISCOVER COMPANIES</SectionLabel>
            <p className="text-[6px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              SEARCH BY INDUSTRY · LOCATION · AUDIENCE · ENGAGEMENT · PLATFORM · GROWTH · DNA · AVAILABILITY
            </p>
            {registry.filter((e) => e.discoverable).map((entry) => (
              <div key={entry.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {entry.company}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {entry.growthRate} GROWTH · {entry.availability}
                </p>
              </div>
            ))}
            {registry.filter((e) => e.discoverable).length === 0 ? (
              <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: '#9CA3AF' }}>
                NO PUBLIC PROFILES · WORKSPACE OWNERS CONTROL VISIBILITY
              </p>
            ) : null}
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-2">
            <SectionLabel>PRIVACY CONTROLS · NOTHING PUBLIC BY DEFAULT</SectionLabel>
            {(
              [
                ['profileVisible', 'Profile visible to other workspaces'],
                ['discoverableInRegistry', 'Discoverable in company registry'],
                ['publicProfileEnabled', 'Public growth profile'],
                ['allowPartnershipRequests', 'Allow partnership requests'],
                ['allowBrandInvitations', 'Allow brand invitations'],
                ['contactMethodsVisible', 'Show contact methods'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between p-2 border" style={panelStyle}>
                <span className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {label}
                </span>
                <input
                  type="checkbox"
                  checked={profile.privacy[key]}
                  onChange={(e) =>
                    updateProfile({
                      privacy: { ...profile.privacy, [key]: e.target.checked },
                    })
                  }
                />
              </label>
            ))}
          </div>
        );

      case 'executives':
        return (
          <div className="space-y-2">
            <SectionLabel>GROWTH EXECUTIVE TEAM · KNOWLEDGE GRAPH COLLABORATION</SectionLabel>
            {executives.map((exec) => (
              <div key={exec.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {exec.title}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {exec.department.toUpperCase()}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {exec.mandate}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  INHERITS · {exec.inherits.join(' · ')}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ fontWeight: 515, color: '#6366F1' }}>
                  COLLABORATES · {exec.collaboratesWith.join(' · ')}
                </p>
              </div>
            ))}
            <button
              type="button"
              onClick={() => navigate(adminStudioKnowledgeHubPath())}
              className="w-full py-2 text-[6px] font-futura uppercase border"
              style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
            >
              OPEN KNOWLEDGE GRAPH
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-2 mb-3">
        {GROWTH_NETWORK_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[5px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.7)',
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
