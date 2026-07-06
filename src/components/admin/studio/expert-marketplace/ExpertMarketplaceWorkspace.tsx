import { useState } from 'react';
import { useExpertMarketplaceState } from '../../../../hooks/useExpertMarketplaceState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  DISCOVERY_DIMENSIONS,
  EXPERT_MARKETPLACE_PHILOSOPHY,
  REVENUE_CHANNEL_TYPES,
  formatTrustBadge,
  requiresLicensedReview,
} from '../../../../studio-os-core/expert-marketplace';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
  ExecutiveSecondaryGrid,
} from '../executive-ia';

type MarketplaceTab = 'overview' | 'experts' | 'discover' | 'academy' | 'revenue' | 'trust' | 'audiences';

const TABS: { id: MarketplaceTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'experts', label: 'EXPERT PROFILES' },
  { id: 'discover', label: 'DISCOVERY' },
  { id: 'academy', label: 'ACADEMY CONNECTION' },
  { id: 'revenue', label: 'BUSINESS GROWTH' },
  { id: 'trust', label: 'TRUST & TRANSPARENCY' },
  { id: 'audiences', label: 'MULTI-AUDIENCE' },
];

export function ExpertMarketplaceWorkspace() {
  const [tab, setTab] = useState<MarketplaceTab>('overview');
  const [search, setSearch] = useState('');
  const { profile, publicCatalog, discoveryResults, setQuery, refresh } = useExpertMarketplaceState();

  const handleSearch = () => {
    setQuery({ specialty: search, topic: search, profession: search });
  };

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        EXPERT MARKETPLACE LOADING — SYNCING PROFESSION BRAIN PUBLICATIONS
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <StudioOsBrandTagline systemId="expert-marketplace" />
      <ExecutiveHeroCard
        eyebrow="MILESTONE 92 · EXPERT MARKETPLACE™"
        title={profile.companyName.toUpperCase()}
        subtitle="Share expertise. Expand your legacy."
        stats={[
          { label: 'PUBLISHED', value: String(profile.publishedCount) },
          { label: 'PENDING', value: String(profile.pendingApprovalCount) },
          { label: 'GLOBAL CATALOG', value: String(publicCatalog.length) },
          { label: 'REVENUE CHANNELS', value: String(REVENUE_CHANNEL_TYPES.length) },
        ]}
      />
      <ExecutiveFocusPanel title="MARKETPLACE PHILOSOPHY">
        {EXPERT_MARKETPLACE_PHILOSOPHY.map((line) => (
          <p key={line} className="text-[6px] font-futura normal-case mb-1" style={{ color: '#555', lineHeight: 1.45 }}>
            · {line}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="LONG-TERM VISION">
        <p className="text-[6px] font-futura normal-case" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
          Profession Brain™ becomes the intelligence · Studio Institute™ becomes the classroom · Expert Marketplace™ becomes the bridge · Studio OS becomes the home.
        </p>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderExperts = () => (
    <ExecutiveFocusPanel title="PUBLISHED EXPERT PROFILES">
      {profile.listings.length === 0 ? (
        <p className="text-[6px] font-futura normal-case" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Enable public surfaces in Profession Brain™ to publish expert profiles.
        </p>
      ) : (
        profile.listings.map(({ profile: expert }) => (
          <div key={expert.id} className="mb-4 pb-4 border-b last:border-b-0" style={{ borderColor: '#eee' }}>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
              {expert.expertName}
            </p>
            <p className="text-[6px] font-futura uppercase" style={{ color: '#92704A' }}>
              {expert.organizationName} · {expert.creator} · {expert.yearsExperience} yrs · ★ {expert.rating.toFixed(1)}
            </p>
            <p className="text-[6px] font-futura normal-case mt-1" style={{ color: '#555', lineHeight: 1.45 }}>
              {expert.originNote}
            </p>
            <p className="text-[6px] font-futura uppercase mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {expert.specialties.join(' · ')} · {expert.capabilities.join(' · ')}
            </p>
          </div>
        ))
      )}
    </ExecutiveFocusPanel>
  );

  const renderDiscover = () => (
    <>
      <ExecutiveFocusPanel title="DISCOVER TRUSTED EXPERTS">
        <p className="text-[6px] font-futura normal-case mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Discover by: {DISCOVERY_DIMENSIONS.join(' · ')}
        </p>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Industry · profession · problem to solve…"
          className="w-full p-2 mb-2 text-[7px] font-futura border normal-case"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        <button
          type="button"
          onClick={handleSearch}
          className="w-full py-2 mb-3 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, borderColor: '#92704A', color: '#92704A' }}
        >
          FIND EXPERTS
        </button>
        {discoveryResults.map((expert) => (
          <ExecutiveSecondaryCard key={expert.id} title={expert.expertName}>
            <p className="text-[6px] font-futura normal-case" style={{ color: '#555', lineHeight: 1.45 }}>
              {expert.organizationName} · {expert.knowledgeAreas.slice(0, 3).join(', ')}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </>
  );

  const renderAcademy = () => (
    <ExecutiveFocusPanel title="ACADEMY CONNECTION · ONE SOURCE OF TRUTH">
      {profile.listings.flatMap((l) => l.academyOfferings).map((o) => (
        <div key={o.id} className="mb-2 pb-2 border-b last:border-b-0" style={{ borderColor: '#eee' }}>
          <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: '#92704A' }}>
            {o.type.replace(/-/g, ' ')}
          </p>
          <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
            {o.title}
          </p>
          <p className="text-[6px] font-futura normal-case mt-1" style={{ color: '#555' }}>
            {o.summary}
          </p>
        </div>
      ))}
    </ExecutiveFocusPanel>
  );

  const renderRevenue = () => (
    <ExecutiveSecondaryGrid>
      {REVENUE_CHANNEL_TYPES.map((channel) => (
        <ExecutiveSecondaryCard key={channel} title={channel.replace(/-/g, ' ').toUpperCase()}>
          <p className="text-[6px] font-futura normal-case" style={{ color: '#555', lineHeight: 1.45 }}>
            Monetize preserved expertise via {channel.replace(/-/g, ' ')} — knowledge as valuable as physical products.
          </p>
        </ExecutiveSecondaryCard>
      ))}
    </ExecutiveSecondaryGrid>
  );

  const renderTrust = () => (
    <ExecutiveFocusPanel title="TRUST & TRANSPARENCY">
      {profile.listings.map(({ profile: expert }) => (
        <div key={expert.id} className="mb-3 pb-3 border-b last:border-b-0" style={{ borderColor: '#eee' }}>
          <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
            {expert.expertName}
          </p>
          <p className="text-[6px] font-futura uppercase mt-1" style={{ color: requiresLicensedReview(expert) ? '#B45309' : '#0D9488' }}>
            {formatTrustBadge(expert)}
          </p>
        </div>
      ))}
    </ExecutiveFocusPanel>
  );

  const renderAudiences = () => (
    <ExecutiveFocusPanel title="MULTI-AUDIENCE KNOWLEDGE">
      {profile.listings[0]?.audiences.map((a) => (
        <p key={a.audience} className="text-[6px] font-futura normal-case mb-2" style={{ color: '#555', lineHeight: 1.45 }}>
          <span style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>{a.audience.replace(/-/g, ' ').toUpperCase()}</span>
          {' — '}
          {a.experienceLabel}
        </p>
      )) ?? (
        <p className="text-[6px] font-futura normal-case" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Publish an expert profile to generate multi-audience experiences.
        </p>
      )}
    </ExecutiveFocusPanel>
  );

  return (
    <div className="expert-marketplace-root">
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#92704A' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#92704A' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(146,112,74,0.06)' : 'white',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'experts' && renderExperts()}
      {tab === 'discover' && renderDiscover()}
      {tab === 'academy' && renderAcademy()}
      {tab === 'revenue' && renderRevenue()}
      {tab === 'trust' && renderTrust()}
      {tab === 'audiences' && renderAudiences()}
      <button
        type="button"
        onClick={refresh}
        className="mt-3 w-full py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        SYNC FROM PROFESSION BRAIN
      </button>
    </div>
  );
}
