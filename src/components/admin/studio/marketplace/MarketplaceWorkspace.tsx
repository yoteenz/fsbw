import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminStudioMarketplaceState } from '../../../../hooks/useAdminStudioMarketplaceState';
import {
  MARKETPLACE_TABS,
  type MarketplaceTabId,
} from '../../../../utils/adminStudioMarketplaceDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  DEAL_STAGE_LABELS,
  PARTICIPANT_TYPE_LABELS,
  PRICING_MODEL_LABELS,
  VERIFICATION_TYPE_LABELS,
} from '../../../../studio-os-core/marketplace/constants';
import { DEAL_STAGES } from '../../../../studio-os-core/marketplace/constants';
import {
  adminStudioGrowthNetworkPath,
  adminStudioTalentNetworkPath,
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

export function MarketplaceWorkspace() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as MarketplaceTabId | null) ?? 'overview';
  const [tab, setTab] = useState<MarketplaceTabId>(
    MARKETPLACE_TABS.some((t) => t.id === initialTab) ? initialTab : 'overview'
  );

  const {
    participants,
    matches,
    deals,
    activeDeals,
    renewalEligible,
    collaborationHubs,
    payments,
    ecosystemRecommendations,
    verifiedCount,
    avgTrustScore,
    totalDealValue,
  } = useAdminStudioMarketplaceState();

  const selectTab = (id: MarketplaceTabId) => {
    setTab(id);
    setSearchParams({ tab: id }, { replace: true });
  };

  if (participants.length === 0) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MARKETPLACE LOADING — BOOTSTRAP IN PROGRESS
      </p>
    );
  }

  const renderTab = () => {
    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="PARTICIPANTS" value={`${participants.length}`} accent />
              <MetricCard label="AVG TRUST SCORE" value={`${avgTrustScore}`} />
              <MetricCard label="ACTIVE DEALS" value={`${activeDeals.length}`} />
              <MetricCard label="PIPELINE VALUE" value={`$${totalDealValue.toLocaleString()}`} />
            </div>
            <SectionLabel>PROFESSIONAL OPERATING NETWORK · RELATIONSHIP-FIRST</SectionLabel>
            <p className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              Not a freelancer marketplace — Studio OS connects brands, creators, agencies, and professionals for lasting partnerships.
            </p>
            <SectionLabel>TOP MATCHES</SectionLabel>
            {matches.slice(0, 3).map((m) => (
              <p key={m.id} className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, lineHeight: 1.4 }}>
                {m.compatibilityScore}% · {m.targetNeed}
              </p>
            ))}
          </div>
        );

      case 'participants':
        return (
          <div className="space-y-3">
            {participants.map((p) => (
              <div key={p.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {p.displayName} · {PARTICIPANT_TYPE_LABELS[p.participantType]}
                  {p.verified ? ' · ✓ VERIFIED' : ''}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {p.biography}
                </p>
                <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {p.completedProjects} projects · Trust {p.trustScore.overall} · {p.industries.join(', ')}
                </p>
              </div>
            ))}
          </div>
        );

      case 'matching':
        return (
          <div className="space-y-3">
            <SectionLabel>INTELLIGENT MATCHING · COMPATIBILITY + EXPLANATION</SectionLabel>
            <p className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              Signals: Company DNA · Creative DNA · Memory Bible · Knowledge Graph · Growth Network · performance · audience fit · budget · goals
            </p>
            {matches.map((m) => (
              <div key={m.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {m.compatibilityScore}% COMPATIBILITY · {m.targetNeed}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {m.explanation}
                </p>
                <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Signals: {m.signals.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        );

      case 'deal-center':
        return (
          <div className="space-y-3">
            <SectionLabel>DEAL WORKFLOW · DISCOVERY → RENEWAL</SectionLabel>
            <div className="flex flex-col items-center gap-0">
              {DEAL_STAGES.map((stage, i) => (
                <div key={stage} className="w-full flex flex-col items-center">
                  {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
                  <div
                    className="w-full px-2 py-1 text-[6px] font-futura uppercase text-center border"
                    style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.6)' }}
                  >
                    {DEAL_STAGE_LABELS[stage]}
                  </div>
                </div>
              ))}
            </div>
            <SectionLabel>ACTIVE DEALS BY STAGE</SectionLabel>
            {activeDeals.map((d) => (
              <p key={d.id} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                {d.title} · {DEAL_STAGE_LABELS[d.stage]} · ${d.value.toLocaleString()}
              </p>
            ))}
          </div>
        );

      case 'collaboration':
        return (
          <div className="space-y-3">
            {collaborationHubs.map((hub) => {
              const deal = deals.find((d) => d.id === hub.dealId);
              return (
                <div key={hub.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {deal?.title ?? hub.dealId}
                  </p>
                  <SectionLabel>MESSAGES</SectionLabel>
                  {hub.messages.map((msg) => (
                    <p key={msg.id} className="text-[6px] font-futura normal-case mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                      {msg.author}: {msg.body}
                    </p>
                  ))}
                  <SectionLabel>DELIVERABLES</SectionLabel>
                  {hub.deliverables.map((d) => (
                    <p key={d} className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                      {d}
                    </p>
                  ))}
                  <SectionLabel>AI RECOMMENDATIONS</SectionLabel>
                  {hub.aiRecommendations.map((r) => (
                    <p key={r} className="text-[6px] font-futura normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                      {r}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
        );

      case 'trust':
        return (
          <div className="space-y-3">
            {participants.map((p) => (
              <div key={p.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {p.displayName} · TRUST {p.trustScore.overall}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  <MetricCard label="RESPONSIVENESS" value={`${p.trustScore.responsiveness}%`} />
                  <MetricCard label="COMPLETION" value={`${p.trustScore.completionRate}%`} />
                  <MetricCard label="QUALITY" value={`${p.trustScore.quality}%`} />
                  <MetricCard label="REPEAT BUSINESS" value={`${p.trustScore.repeatBusiness}%`} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'verification':
        return (
          <div className="space-y-3">
            <MetricCard label="VERIFIED PARTICIPANTS" value={`${verifiedCount}/${participants.length}`} accent />
            {participants.map((p) => (
              <div key={p.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: p.verified ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary }}>
                  {p.displayName} {p.verified ? '· ✓ VERIFIED' : '· PENDING'}
                </p>
                <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Badges: {p.verificationBadges.map((b) => VERIFICATION_TYPE_LABELS[b]).join(' · ') || 'NONE'}
                </p>
              </div>
            ))}
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-3">
            <SectionLabel>PRICING MODELS · HOURLY · FIXED · RETAINER · COMMISSION · MORE</SectionLabel>
            {participants.map((p) => (
              <div key={p.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {p.displayName} · {PRICING_MODEL_LABELS[p.pricingModel]}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {p.pricingSummary}
                </p>
              </div>
            ))}
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-3">
            <SectionLabel>PAYMENT ARCHITECTURE · NO LIVE PROCESSING IN V1</SectionLabel>
            <p className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              Milestone · escrow · invoices · partial · tips · refunds · payouts — connectors not connected.
            </p>
            {payments.map((pay) => (
              <div key={pay.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {pay.label} · ${pay.amount.toLocaleString()} · {pay.status.toUpperCase()}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {pay.note}
                </p>
              </div>
            ))}
          </div>
        );

      case 'ecosystem':
        return (
          <div className="space-y-3">
            <SectionLabel>BUSINESS ECOSYSTEM · RECOMMEND BEFORE SEARCH</SectionLabel>
            {ecosystemRecommendations.map((r) => {
              const from = participants.find((p) => p.id === r.fromParticipantId);
              return (
                <div key={r.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {from?.displayName} → {PARTICIPANT_TYPE_LABELS[r.toParticipantType]}
                  </p>
                  <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                    {r.need}
                  </p>
                  <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                    {r.recommendation}
                  </p>
                </div>
              );
            })}
          </div>
        );

      case 'relationships':
        return (
          <div className="space-y-3">
            <SectionLabel>LONG-TERM PARTNERSHIPS · RENEWAL-ELIGIBLE DEALS</SectionLabel>
            {renewalEligible.map((d) => (
              <div key={d.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {d.title} · RENEWAL ELIGIBLE
                </p>
                <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {d.relationshipHistory.length} workflow steps · ${d.value.toLocaleString()} value
                </p>
              </div>
            ))}
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-3">
            {participants.flatMap((p) =>
              p.reviews.map((r) => (
                <div key={r.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {p.displayName} · {r.rating}/5 · {r.authorName}
                  </p>
                  <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                    {r.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        );

      case 'deals':
        return (
          <div className="space-y-3">
            {deals.map((d) => {
              const initiator = participants.find((p) => p.id === d.initiatorId);
              const counter = participants.find((p) => p.id === d.counterpartyId);
              return (
                <div key={d.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {d.title}
                  </p>
                  <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {initiator?.displayName} ↔ {counter?.displayName} · {DEAL_STAGE_LABELS[d.stage]} · {PRICING_MODEL_LABELS[d.pricingModel]}
                  </p>
                </div>
              );
            })}
          </div>
        );

      case 'history':
        return (
          <div className="space-y-3">
            {deals.flatMap((d) =>
              d.relationshipHistory.map((h) => (
                <div key={h.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {d.title} · {DEAL_STAGE_LABELS[h.stage]}
                  </p>
                  <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {h.label} · {h.date}
                  </p>
                </div>
              ))
            )}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => navigate(adminStudioTalentNetworkPath())}
                className="flex-1 py-2 text-[7px] font-futura uppercase border"
                style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
              >
                TALENT NETWORK
              </button>
              <button
                type="button"
                onClick={() => navigate(adminStudioGrowthNetworkPath())}
                className="flex-1 py-2 text-[7px] font-futura uppercase border"
                style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
              >
                GROWTH NETWORK
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
        {MARKETPLACE_TABS.map((t) => (
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
