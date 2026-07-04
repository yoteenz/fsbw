import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminStudioEcosystemState } from '../../../../hooks/useAdminStudioEcosystemState';
import {
  ECOSYSTEM_TABS,
  type EcosystemTabId,
} from '../../../../utils/adminStudioEcosystemDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ECOSYSTEM_CATEGORY_LABELS,
  PUBLISH_STAGE_LABELS,
  PUBLISH_STAGES,
} from '../../../../studio-os-core/ecosystem/constants';
import {
  adminStudioBusinessModelEnginePath,
  adminStudioMarketplacePath,
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

export function EcosystemWorkspace() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as EcosystemTabId | null) ?? 'overview';
  const [tab, setTab] = useState<EcosystemTabId>(
    ECOSYSTEM_TABS.some((t) => t.id === initialTab) ? initialTab : 'overview'
  );

  const {
    assets,
    publishedAssets,
    featuredAssets,
    trendingAssets,
    dependencies,
    reviews,
    installs,
    versions,
    recommendations,
    creators,
    analytics,
    enterpriseLibraries,
    hubCards,
  } = useAdminStudioEcosystemState();

  const selectTab = (id: EcosystemTabId) => {
    setTab(id);
    setSearchParams({ tab: id }, { replace: true });
  };

  if (assets.length === 0) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ECOSYSTEM LOADING — BOOTSTRAP IN PROGRESS
      </p>
    );
  }

  const renderTab = () => {
    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="PUBLISHED ASSETS" value={`${publishedAssets.length}`} accent />
              <MetricCard label="TOTAL DOWNLOADS" value={analytics.totalDownloads.toLocaleString()} />
              <MetricCard label="ACTIVE INSTALLS" value={analytics.activeInstalls.toLocaleString()} />
              <MetricCard label="AVG RATING" value={`${analytics.avgRating}`} />
            </div>
            <SectionLabel>ECOSYSTEM HUB · NOT AN APP STORE</SectionLabel>
            <p className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              Install complete operating systems for specific business models — podcast company, media network, newsletter, SaaS startup.
            </p>
            <SectionLabel>FEATURED & TRENDING</SectionLabel>
            {hubCards.map((c) => (
              <div key={c.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {c.type.replace(/-/g, ' ').toUpperCase()} · {c.title}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {c.subtitle}
                </p>
              </div>
            ))}
          </div>
        );

      case 'categories':
        return (
          <div className="space-y-3">
            <SectionLabel>21 ECOSYSTEM CATEGORIES</SectionLabel>
            {(Object.keys(ECOSYSTEM_CATEGORY_LABELS) as Array<keyof typeof ECOSYSTEM_CATEGORY_LABELS>).map((cat) => {
              const count = assets.filter((a) => a.category === cat).length;
              return (
                <p key={cat} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: count > 0 ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary }}>
                  {ECOSYSTEM_CATEGORY_LABELS[cat]} · {count} assets
                </p>
              );
            })}
          </div>
        );

      case 'publishing':
        return (
          <div className="space-y-3">
            <SectionLabel>PUBLISHING WORKFLOW</SectionLabel>
            <div className="flex flex-col items-center gap-0">
              {PUBLISH_STAGES.map((stage, i) => (
                <div key={stage} className="w-full flex flex-col items-center">
                  {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
                  <div className="w-full px-2 py-1 text-[6px] font-futura uppercase text-center border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.6)' }}>
                    {PUBLISH_STAGE_LABELS[stage]}
                  </div>
                </div>
              ))}
            </div>
            <SectionLabel>ASSETS BY STAGE</SectionLabel>
            {assets.map((a) => (
              <p key={a.id} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {a.title} · {PUBLISH_STAGE_LABELS[a.stage]} · v{a.version}
              </p>
            ))}
          </div>
        );

      case 'review':
        return (
          <div className="space-y-3">
            <SectionLabel>PRE-PUBLICATION REVIEW CHECKLIST</SectionLabel>
            {reviews.map((r) => {
              const asset = assets.find((a) => a.id === r.assetId);
              return (
                <div key={r.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {asset?.title ?? r.assetId}
                  </p>
                  <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    Quality {r.quality} · Docs {r.documentation} · Compat {r.compatibility} · Deps {r.dependencies} · Security {r.security} · License {r.licensing}
                  </p>
                  <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                    {r.studioOsCompatibility}
                  </p>
                </div>
              );
            })}
          </div>
        );

      case 'listings':
        return (
          <div className="space-y-3">
            {publishedAssets.map((a) => (
              <div key={a.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {a.title} · ★ {a.rating} · v{a.version}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {a.description}
                </p>
                <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {a.downloads.toLocaleString()} downloads · {a.favorites} favorites · {a.pricing} · {a.creatorName}
                </p>
              </div>
            ))}
          </div>
        );

      case 'dependencies':
        return (
          <div className="space-y-3">
            <SectionLabel>DEPENDENCY ENGINE · WARN BEFORE INSTALL</SectionLabel>
            {dependencies.map((d) => {
              const asset = assets.find((a) => a.id === d.assetId);
              return (
                <p key={d.id} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {asset?.title} requires {d.label} ({d.requiresModule}) {d.required ? '· REQUIRED' : '· OPTIONAL'}
                </p>
              );
            })}
          </div>
        );

      case 'installation':
        return (
          <div className="space-y-3">
            <SectionLabel>INSTALLATION ENGINE · AUTO CONFIGURE</SectionLabel>
            {installs.map((i) => (
              <div key={i.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {i.assetTitle} · v{i.version} · {i.status.toUpperCase()}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Backup: {i.backupCreated ? 'YES' : 'NO'} · KG updated: {i.kgUpdated ? 'YES' : 'NO'} · Memory Bible: {i.memoryBibleUpdated ? 'YES' : 'NO'}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Dependencies: {i.dependenciesInstalled.join(', ')}
                </p>
              </div>
            ))}
          </div>
        );

      case 'updates':
        return (
          <div className="space-y-3">
            <SectionLabel>UPDATE MANAGER · MAJOR · MINOR · PATCH · ROLLBACK</SectionLabel>
            {versions.map((v) => {
              const asset = assets.find((a) => a.id === v.assetId);
              return (
                <div key={v.id} className="p-2 border" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {asset?.title} · v{v.version} · {v.type.toUpperCase()}
                  </p>
                  <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                    {v.releaseNotes}
                  </p>
                  <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {v.compatibilityMatrix} · {v.publishedAt}
                  </p>
                </div>
              );
            })}
          </div>
        );

      case 'developer':
        return (
          <div className="space-y-3">
            <SectionLabel>DEVELOPER CENTER · SDK · API · SANDBOX</SectionLabel>
            {['SDK Documentation', 'API Explorer', 'Sample Projects', 'Testing Sandbox', 'Debug Tools', 'Publishing Tools', 'Version Manager', 'Analytics', 'API Keys (future)'].map((tool) => (
              <p key={tool} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {tool.toUpperCase()} · ARCHITECTURE READY · CONNECTORS NOT CONNECTED
              </p>
            ))}
          </div>
        );

      case 'creator':
        return (
          <div className="space-y-3">
            <SectionLabel>CREATOR CENTER · PUBLISH · REVENUE · ANALYTICS</SectionLabel>
            {creators.map((c) => (
              <div key={c.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {c.displayName} {c.verified ? '· ✓ VERIFIED' : ''} · Rep {c.reputation}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {c.assetsPublished} assets · {c.totalDownloads.toLocaleString()} downloads · {c.followers} followers
                </p>
                <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {c.badges.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-3">
            <SectionLabel>RECOMMENDATION ENGINE · COMPANY DNA · KG · GOALS</SectionLabel>
            {recommendations.map((r) => (
              <div key={r.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {r.score}% · {r.assetTitle}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {r.explanation}
                </p>
                <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {r.signals.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="DOWNLOADS" value={analytics.totalDownloads.toLocaleString()} accent />
              <MetricCard label="ACTIVE INSTALLS" value={analytics.activeInstalls.toLocaleString()} />
              <MetricCard label="RETENTION" value={`${analytics.retentionPct}%`} />
              <MetricCard label="REVENUE" value={`$${analytics.totalRevenue.toLocaleString()}`} />
              <MetricCard label="RENEWAL" value={`${analytics.renewalPct}%`} />
              <MetricCard label="SATISFACTION" value={`${analytics.satisfactionScore}%`} />
            </div>
            <SectionLabel>TRENDING ASSETS</SectionLabel>
            {trendingAssets.map((a) => (
              <p key={a.id} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                {a.title} · {a.downloads} downloads
              </p>
            ))}
          </div>
        );

      case 'enterprise':
        return (
          <div className="space-y-3">
            <SectionLabel>PRIVATE ECOSYSTEM LIBRARIES</SectionLabel>
            {enterpriseLibraries.map((e) => (
              <div key={e.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {e.organizationName}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {e.privateBlueprints} blueprints · {e.privateExecutives} executives · {e.privateAutomations} automations · Private marketplace: {e.privateMarketplace ? 'YES' : 'NO'}
                </p>
              </div>
            ))}
            <SectionLabel>LICENSE MODELS</SectionLabel>
            {['FREE', 'PAID', 'SUBSCRIPTION', 'ROYALTY', 'ENTERPRISE', 'SEAT-BASED', 'WORKSPACE-BASED', 'CUSTOM'].map((l) => (
              <p key={l} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {l}
              </p>
            ))}
          </div>
        );

      case 'community':
        return (
          <div className="space-y-3">
            <SectionLabel>VERIFIED & FEATURED CREATORS</SectionLabel>
            {creators.filter((c) => c.featured || c.verified).map((c) => (
              <div key={c.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {c.displayName} · {c.followers} followers
                </p>
                <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {c.badges.join(' · ')}
                </p>
              </div>
            ))}
            <SectionLabel>FEATURED ASSETS</SectionLabel>
            {featuredAssets.map((a) => (
              <p key={a.id} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {a.title} · {ECOSYSTEM_CATEGORY_LABELS[a.category]}
              </p>
            ))}
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => navigate(adminStudioBusinessModelEnginePath())} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                BME
              </button>
              <button type="button" onClick={() => navigate(adminStudioMarketplacePath())} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                MARKETPLACE
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
        {ECOSYSTEM_TABS.map((t) => (
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
