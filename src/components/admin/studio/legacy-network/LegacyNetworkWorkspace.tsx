import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLegacyNetworkState } from '../../../../hooks/useLegacyNetworkState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  COMMUNITY_FEATURE_LABELS,
  DISCOVERY_FILTER_LABELS,
  LEGACY_NETWORK_ACCENT,
  LEGACY_NETWORK_PHILOSOPHY,
  REPUTATION_DIMENSION_LABELS,
} from '../../../../studio-os-core/legacy-network';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type LegacyNetworkTab = 'overview' | 'assets' | 'discovery' | 'community';

const TABS: { id: LegacyNetworkTab; label: string }[] = [
  { id: 'overview', label: 'NETWORK OVERVIEW' },
  { id: 'assets', label: 'SHAREABLE ASSETS' },
  { id: 'discovery', label: 'DISCOVERY · ATTRIBUTION' },
  { id: 'community', label: 'COMMUNITY · REPUTATION' },
];

export function LegacyNetworkWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<LegacyNetworkTab>('overview');
  const { profile, refresh } = useLegacyNetworkState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        LEGACY NETWORK™ LOADING — GLOBAL MOVEMENT · PERMISSION-BASED ECOSYSTEM
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 121 · LEGACY NETWORK™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Permission-based global ecosystem — share expertise intentionally. Not a marketplace — a movement."
        progressPct={profile.networkMovementScore}
        stats={[
          { label: 'MOVEMENT', value: `${profile.networkMovementScore}%` },
          { label: 'PUBLISHED', value: `${profile.publishedAssets}` },
          { label: 'DISCOVERED', value: `${profile.discoveredResources}` },
          { label: 'LEGACY', value: `${profile.legacyScorePct}%` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.legacyScorePct} size={56} label="LEGACY" accent={LEGACY_NETWORK_ACCENT} />
        <div>
          {LEGACY_NETWORK_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="COMMAND DOCK · MOVEMENT UPDATES">
        <p className="text-[6px] font-futura" style={{ color: LEGACY_NETWORK_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockLegacyLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="PRESERVE EXPERTISE · BUILD LEGACY">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
          Organizations preserve knowledge. Communities expand knowledge. Future generations inherit knowledge. Studio OS becomes the global home of organizational intelligence.
        </p>
      </ExecutiveSecondaryCard>
      <button
        type="button"
        onClick={() => navigate(adminStudioMissionControlPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: LEGACY_NETWORK_ACCENT, color: LEGACY_NETWORK_ACCENT }}
      >
        MISSION CONTROL →
      </button>
      <button
        type="button"
        onClick={refresh}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        REFRESH LEGACY NETWORK
      </button>
    </ExecutivePageShell>
  );

  const renderAssets = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SHAREABLE ASSETS · OPTIONAL · IP RETAINED · NOTHING AUTOMATIC">
        {profile.publishableAssetsList.map((a) => (
          <ExecutiveSecondaryCard key={a.id} title={`${a.typeLabel.toUpperCase()} · ${a.published ? 'PUBLISHED' : 'READY'}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: LEGACY_NETWORK_ACCENT, fontWeight: 515 }}>
              {a.title}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {a.summary}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Permission required · IP ownership retained · {a.published ? 'Live on network' : 'Publish when ready'}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDiscovery = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="DISCOVERY · PERMANENT ATTRIBUTION ON EVERY CONTRIBUTION">
        <ExecutiveSecondaryCard title="DISCOVERY FILTERS">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(DISCOVERY_FILTER_LABELS).map(([key, label]) => (
              <p key={key} className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                {label}
              </p>
            ))}
          </div>
        </ExecutiveSecondaryCard>
        {profile.discoveredResourcesList.slice(0, 8).map((r) => (
          <ExecutiveSecondaryCard key={r.id} title={`${r.typeLabel.toUpperCase()} · ${r.verified ? 'VERIFIED' : 'COMMUNITY'}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: LEGACY_NETWORK_ACCENT, fontWeight: 515 }}>
              {r.title} — {r.organization}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {r.summary} · {r.rating.toFixed(1)}★ · {r.adoptions} adoptions
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {r.attribution.originalOrganization} · Founder {r.attribution.founder} · v{r.attribution.version} · {r.attribution.license}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderCommunity = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="COMMUNITY · REPUTATION · GLOBAL HEADQUARTERS OF INTELLIGENCE">
        <ExecutiveSecondaryCard title={`REPUTATION · LEGACY ${profile.legacyScorePct}% · TRUST ${profile.communityTrustPct}%`}>
          {profile.reputation.map((r) => (
            <p key={r.dimension} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {REPUTATION_DIMENSION_LABELS[r.dimension]}: <span style={{ color: LEGACY_NETWORK_ACCENT }}>{r.scorePct}%</span> — {r.insight.slice(0, 80)}…
            </p>
          ))}
        </ExecutiveSecondaryCard>
        {profile.communityHighlights.map((h) => (
          <ExecutiveSecondaryCard key={h.id} title={COMMUNITY_FEATURE_LABELS[h.feature].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: LEGACY_NETWORK_ACCENT, fontWeight: 515 }}>
              {h.headline}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {h.detail}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="legacy-network" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? LEGACY_NETWORK_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? LEGACY_NETWORK_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'assets' && renderAssets()}
      {tab === 'discovery' && renderDiscovery()}
      {tab === 'community' && renderCommunity()}
    </div>
  );
}
