import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminStudioBusinessModelEngineState } from '../../../../hooks/useAdminStudioBusinessModelEngineState';
import {
  BME_TABS,
  type BusinessModelEngineTabId,
} from '../../../../utils/adminStudioBusinessModelEngineDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  MEMBERSHIP_TIER_LABELS,
} from '../../../../studio-os-core/business-model-engine/constants';
import {
  adminStudioMarketplacePath,
  adminStudioGrowthNetworkPath,
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

export function BusinessModelEngineWorkspace() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as BusinessModelEngineTabId | null) ?? 'overview';
  const [tab, setTab] = useState<BusinessModelEngineTabId>(
    BME_TABS.some((t) => t.id === initialTab) ? initialTab : 'overview'
  );

  const {
    billing,
    tierCapabilities,
    usageMetrics,
    platformFees,
    payments,
    wallets,
    affiliatePrograms,
    royalties,
    assetListings,
    appEcosystem,
    certifications,
    enterpriseLicenses,
    economics,
    pricingScenarios,
    ecosystemHealth,
  } = useAdminStudioBusinessModelEngineState();

  const selectTab = (id: BusinessModelEngineTabId) => {
    setTab(id);
    setSearchParams({ tab: id }, { replace: true });
  };

  if (!billing) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        BUSINESS MODEL ENGINE LOADING — BOOTSTRAP IN PROGRESS
      </p>
    );
  }

  const renderTab = () => {
    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="MRR" value={`$${economics.mrr.toLocaleString()}`} accent />
              <MetricCard label="ARR" value={`$${economics.arr.toLocaleString()}`} />
              <MetricCard label="WORKSPACE TIER" value={MEMBERSHIP_TIER_LABELS[billing.tier]} />
              <MetricCard label="GROWTH FORECAST" value={`+${economics.growthForecastPct}%`} />
            </div>
            <SectionLabel>ALIGNED INCENTIVES · PLATFORM SUCCEEDS WHEN USERS SUCCEED</SectionLabel>
            <p className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              Diversified revenue: subscriptions, marketplace, royalties, affiliates, enterprise, platform fees — not a billing page alone.
            </p>
          </div>
        );

      case 'membership':
        return (
          <div className="space-y-3">
            <SectionLabel>CURRENT TIER · {MEMBERSHIP_TIER_LABELS[billing.tier]}</SectionLabel>
            <div className="grid grid-cols-2 gap-1">
              <MetricCard label="WORKSPACES" value={`${tierCapabilities.workspaceLimit}`} />
              <MetricCard label="AI / MO" value={`${tierCapabilities.aiGenerationsPerMonth}`} />
              <MetricCard label="AUTOMATIONS" value={`${tierCapabilities.automationLimit}`} />
              <MetricCard label="STORAGE GB" value={`${tierCapabilities.storageGb}`} />
              <MetricCard label="TEAM SEATS" value={`${tierCapabilities.teamSeats}`} />
              <MetricCard label="EXEC AI TEAM" value={`${tierCapabilities.executiveAiTeamSize}`} />
            </div>
            <SectionLabel>CAPABILITY UNLOCKS</SectionLabel>
            <p className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              Marketplace: {tierCapabilities.marketplaceParticipation ? 'YES' : 'NO'} · Analytics: {tierCapabilities.analyticsDepth.toUpperCase()} · API: {tierCapabilities.apiAccess ? 'YES' : 'NO'} · Branding: {tierCapabilities.customBranding ? 'YES' : 'NO'}
            </p>
            <SectionLabel>ALL TIERS</SectionLabel>
            {(Object.keys(MEMBERSHIP_TIER_LABELS) as Array<keyof typeof MEMBERSHIP_TIER_LABELS>).map((t) => (
              <p key={t} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: t === billing.tier ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary }}>
                {MEMBERSHIP_TIER_LABELS[t]}{t === billing.tier ? ' · CURRENT' : ''}
              </p>
            ))}
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-3">
            <MetricCard label="CREDITS REMAINING" value={`${billing.creditsRemaining}`} accent />
            <p className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              Owner: {billing.billingOwner} · Renewal: {billing.renewalDate} · {billing.paymentMethodLabel}
            </p>
            <SectionLabel>UPGRADE HISTORY</SectionLabel>
            {billing.upgradeHistory.map((h) => (
              <p key={h.date} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {h.date} · {MEMBERSHIP_TIER_LABELS[h.from]} → {MEMBERSHIP_TIER_LABELS[h.to]}
              </p>
            ))}
            <SectionLabel>INVOICES</SectionLabel>
            {billing.invoiceIds.map((id) => (
              <p key={id} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                {id.toUpperCase()}
              </p>
            ))}
          </div>
        );

      case 'usage':
        return (
          <div className="space-y-3">
            {usageMetrics.map((u) => (
              <div key={u.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {u.category.replace(/-/g, ' ').toUpperCase()}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {u.used.toLocaleString()} / {u.limit.toLocaleString()} {u.unit} · {u.period}
                </p>
                <div className="w-full h-1 mt-2" style={{ background: ADMIN_STUDIO_THEME.panelBorder }}>
                  <div className="h-1" style={{ width: `${Math.min(100, (u.used / u.limit) * 100)}%`, background: ADMIN_STUDIO_THEME.accent }} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'fees':
        return (
          <div className="space-y-3">
            <SectionLabel>CONFIGURABLE PLATFORM FEES · NOT HARDCODED</SectionLabel>
            {platformFees.map((f) => (
              <div key={f.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {f.channel.replace(/-/g, ' ').toUpperCase()} · {f.rateLabel}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {f.notes}
                </p>
              </div>
            ))}
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-3">
            <SectionLabel>PAYMENT ARCHITECTURE · NO LIVE PROCESSORS IN V1</SectionLabel>
            {payments.map((p) => (
              <div key={p.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {p.type.toUpperCase()} · ${p.amount.toLocaleString()} · {p.status.toUpperCase()}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {p.label}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {p.note}
                </p>
              </div>
            ))}
          </div>
        );

      case 'wallets':
        return (
          <div className="space-y-3">
            {wallets.map((w) => (
              <div key={w.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {w.displayName}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  <MetricCard label="AVAILABLE" value={`$${w.availableBalance.toLocaleString()}`} />
                  <MetricCard label="PENDING" value={`$${w.pendingPayouts.toLocaleString()}`} />
                  <MetricCard label="ROYALTIES" value={`$${w.royalties.toLocaleString()}`} />
                  <MetricCard label="AFFILIATE" value={`$${w.affiliateEarnings.toLocaleString()}`} />
                </div>
              </div>
            ))}
          </div>
        );

      case 'affiliates':
        return (
          <div className="space-y-3">
            {affiliatePrograms.map((a) => (
              <div key={a.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {a.name} · {a.commissionRate}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {a.links} links · {a.clicks.toLocaleString()} clicks · {a.conversions} conversions · ${a.totalPaid.toLocaleString()} paid
                </p>
                <SectionLabel>TOP AFFILIATES</SectionLabel>
                {a.topAffiliates.map((t) => (
                  <p key={t.name} className="text-[6px] font-futura" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {t.name} · {t.conversions} conv · ${t.commission}
                  </p>
                ))}
              </div>
            ))}
          </div>
        );

      case 'royalties':
        return (
          <div className="space-y-3">
            <SectionLabel>RECURRING ROYALTIES · ASSETS REUSED → CREATORS EARN</SectionLabel>
            {royalties.map((r) => (
              <div key={r.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {r.assetName}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {r.assetType.replace(/-/g, ' ').toUpperCase()} · {r.royaltyRate} · {r.licenseCount} licenses
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Lifetime ${r.lifetimeEarnings.toLocaleString()} · Monthly ${r.monthlyEarnings.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        );

      case 'marketplaces':
        return (
          <div className="space-y-3">
            <SectionLabel>BLUEPRINT · CREATIVE · WRITING · AUTOMATION · AI EXECUTIVE</SectionLabel>
            {assetListings.map((l) => (
              <div key={l.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {l.marketplace.toUpperCase()} · {l.title}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {l.author} · {l.price} · ★ {l.rating} · v{l.version} · {l.licenseCount} licenses
                </p>
              </div>
            ))}
            <SectionLabel>APP ECOSYSTEM · FUTURE EXTENSIONS</SectionLabel>
            {appEcosystem.map((a) => (
              <p key={a.id} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {a.type.toUpperCase()} · {a.name} · {a.status.toUpperCase()}
              </p>
            ))}
          </div>
        );

      case 'enterprise':
        return (
          <div className="space-y-3">
            {enterpriseLicenses.map((e) => (
              <div key={e.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {e.organizationName} · ${e.annualValue.toLocaleString()}/yr
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {e.workspaceCount} workspaces · SSO ready: {e.ssoReady ? 'YES' : 'NO'} · Private marketplace: {e.privateMarketplace ? 'YES' : 'NO'}
                </p>
                {e.features.map((f) => (
                  <p key={f} className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {f}
                  </p>
                ))}
              </div>
            ))}
          </div>
        );

      case 'certifications':
        return (
          <div className="space-y-3">
            {certifications.map((c) => (
              <div key={c.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {c.badgeLabel}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {c.holderName} · Issued {c.issuedAt}
                </p>
              </div>
            ))}
          </div>
        );

      case 'economics':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="MRR" value={`$${economics.mrr.toLocaleString()}`} accent />
              <MetricCard label="ARR" value={`$${economics.arr.toLocaleString()}`} />
              <MetricCard label="ARPU" value={`$${economics.arpu}`} />
              <MetricCard label="PLATFORM FEES" value={`$${economics.platformFees.toLocaleString()}`} />
              <MetricCard label="MARKETPLACE" value={`$${economics.marketplaceRevenue.toLocaleString()}`} />
              <MetricCard label="ENTERPRISE" value={`$${economics.enterpriseRevenue.toLocaleString()}`} />
            </div>
            <SectionLabel>PRICING SIMULATOR</SectionLabel>
            {pricingScenarios.map((s) => (
              <div key={s.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {s.label} · ${s.estimatedRevenueImpact.toLocaleString()} impact
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {s.notes}
                </p>
              </div>
            ))}
          </div>
        );

      case 'ecosystem':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="CREATOR SUCCESS" value={`${ecosystemHealth.creatorSuccessScore}%`} accent />
              <MetricCard label="RETENTION" value={`${ecosystemHealth.retentionPct}%`} />
              <MetricCard label="MARKETPLACE LIQUIDITY" value={`${ecosystemHealth.marketplaceLiquidity}%`} />
              <MetricCard label="CHURN" value={`${ecosystemHealth.churnPct}%`} />
              <MetricCard label="AVG EARNINGS" value={`$${ecosystemHealth.averageEarnings}`} />
              <MetricCard label="LTV" value={`$${ecosystemHealth.customerLifetimeValue}`} />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate(adminStudioMarketplacePath())}
                className="flex-1 py-2 text-[7px] font-futura uppercase border"
                style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
              >
                MARKETPLACE
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
        {BME_TABS.map((t) => (
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
