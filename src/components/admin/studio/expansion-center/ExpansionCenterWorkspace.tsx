import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpansionCenterState } from '../../../../hooks/useExpansionCenterState';
import { EXPANSION_CENTER_TAGLINE } from '../../../../studio-os-core/industry-architecture';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveCollapsibleSection,
  ExecutiveFocusPanel,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
  ExecutiveSecondaryGrid,
  ExecutiveVisualSummary,
} from '../executive-ia';

const panelStyle = {
  background: ADMIN_STUDIO_THEME.panelBg,
  borderColor: ADMIN_STUDIO_THEME.panelBorder,
};

type ExpansionTab = 'overview' | 'catalog' | 'installed' | 'headquarters';

const TABS: { id: ExpansionTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'catalog', label: 'EXPANSION CATALOG' },
  { id: 'installed', label: 'INSTALLED' },
  { id: 'headquarters', label: 'HQ LAYOUT' },
];

export function ExpansionCenterWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ExpansionTab>('overview');
  const [previewPackId, setPreviewPackId] = useState<string | null>(null);

  const {
    profile,
    industry,
    industries,
    headquartersLayout,
    installedPackIds,
    recommendedPacks,
    availableExpansionPacks,
    installingPackId,
    lastInstalledPackId,
    installPack,
    changeIndustry,
    previewPlan,
    getInstalledPack,
  } = useExpansionCenterState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        EXPANSION CENTER LOADING — INITIALIZING ORGANIZATION ARCHITECTURE
      </p>
    );
  }

  const preview = previewPackId ? previewPlan(previewPackId) : null;
  const lastInstalled = lastInstalledPackId ? getInstalledPack(lastInstalledPackId) : null;

  const renderCatalog = () => (
    <div className="space-y-2">
      {recommendedPacks.length > 0 ? (
        <>
          <p className="text-[7px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
            RECOMMENDED FOR {industry?.label ?? 'YOUR INDUSTRY'}
          </p>
          {recommendedPacks.map((pack) => (
            <PackCard
              key={pack.id}
              name={pack.name}
              tagline={pack.tagline}
              description={pack.description}
              preview={pack.installPreview}
              installing={installingPackId === pack.id}
              onPreview={() => setPreviewPackId(pack.id)}
              onInstall={() => installPack(pack.id)}
              featured
            />
          ))}
        </>
      ) : null}

      <p className="text-[7px] font-futura uppercase mt-3 mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ALL EXPANSION PACKS
      </p>
      {availableExpansionPacks.map((pack) => (
        <PackCard
          key={pack.id}
          name={pack.name}
          tagline={pack.tagline}
          description={pack.description}
          preview={pack.installPreview}
          installing={installingPackId === pack.id}
          onPreview={() => setPreviewPackId(pack.id)}
          onInstall={() => installPack(pack.id)}
        />
      ))}
    </div>
  );

  const renderInstalled = () => (
    <div className="space-y-2">
      {profile.installedPacks.map((record) => {
        const pack = getInstalledPack(record.packId);
        if (!pack) return null;
        return (
          <div key={record.packId} className="p-2 border" style={panelStyle}>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
              {pack.name}
            </p>
            <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              {pack.tagline}
            </p>
            <p className="text-[5px] font-futura mt-1" style={{ color: '#888' }}>
              INSTALLED {new Date(record.installedAt).toLocaleDateString()}
            </p>
          </div>
        );
      })}
    </div>
  );

  const renderHeadquarters = () => (
    <ExecutiveVisualSummary title="CUSTOM HEADQUARTERS · PURPOSE-BUILT">
      <div className="space-y-1">
        {headquartersLayout.map((dept, index) => (
          <div
            key={dept.id}
            className="flex items-center gap-2 px-2 py-1 border"
            style={{
              ...panelStyle,
              borderLeft: index === 0 ? `3px solid ${ADMIN_STUDIO_THEME.accent}` : panelStyle.borderColor,
            }}
          >
            <span style={{ fontSize: '12px' }}>{dept.icon ?? '🏢'}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[7px] font-futura uppercase truncate" style={{ fontWeight: 515 }}>
                {dept.wingLabel ? `${dept.wingLabel} · ` : ''}
                {dept.label}
              </p>
              <p className="text-[5px] font-futura truncate" style={{ color: '#888' }}>
                {dept.description}
              </p>
            </div>
            {dept.moduleId ? (
              <button
                type="button"
                onClick={() => navigate(`/admin/studio/${dept.moduleId}`)}
                className="text-[5px] font-futura uppercase border px-1 py-0.5"
                style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
              >
                OPEN →
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ExecutiveVisualSummary>
  );

  return (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 88 · INDUSTRY ARCHITECTURE"
        title={industry?.label ?? profile.industryId.toUpperCase()}
        subtitle={industry?.tagline ?? EXPANSION_CENTER_TAGLINE}
        stats={[
          { label: 'INSTALLED PACKS', value: String(profile.installedPacks.length) },
          { label: 'HQ DEPARTMENTS', value: String(headquartersLayout.length) },
          { label: 'CONCIERGES', value: String(profile.conciergeRoster.length) },
          { label: 'RECOMMENDED', value: String(recommendedPacks.length) },
        ]}
      />

      <div className="flex gap-1 overflow-x-auto pb-2 mb-3 mt-3" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(235,28,36,0.06)' : 'white',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <div className="space-y-3">
          <ExecutiveFocusPanel title="INDUSTRY ARCHITECTURE">
            <p className="text-[6px] font-futura normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              Every organization begins with an industry selection. Studio OS generates a purpose-built headquarters — only departments relevant to your business.
            </p>
            <label className="block mt-3">
              <span className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                INDUSTRY
              </span>
              <select
                value={profile.industryId}
                onChange={(e) => changeIndustry(e.target.value as typeof profile.industryId)}
                className="w-full mt-1 text-[7px] font-futura uppercase border px-2 py-1"
                style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
              >
                {industries.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.label}
                  </option>
                ))}
              </select>
            </label>
          </ExecutiveFocusPanel>

          <ExecutiveSecondaryGrid>
            <ExecutiveSecondaryCard title="UNIVERSAL MARKETING">
              <p className="text-[6px] font-futura normal-case" style={{ lineHeight: 1.4, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {profile.marketingInsight}
              </p>
              <p className="text-[5px] font-futura mt-2 uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                GOOGLE ADS · META · TIKTOK · SEO · EMAIL · SMS · OFFERS · AUDIENCE INTELLIGENCE
              </p>
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="CREATOR STUDIO EXAMPLE">
              <p className="text-[6px] font-futura normal-case" style={{ lineHeight: 1.4, color: ADMIN_STUDIO_THEME.textSecondary }}>
                A painting company installs Creator Studio — Production, Publishing, and Distribution appear in Headquarters. Nothing else changes.
              </p>
              {!installedPackIds.has('creator-studio') ? (
                <button
                  type="button"
                  onClick={() => installPack('creator-studio')}
                  className="mt-2 w-full py-1.5 text-[6px] font-futura uppercase border"
                  style={{ fontWeight: 515, color: '#fff', background: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
                >
                  INSTALL CREATOR STUDIO →
                </button>
              ) : (
                <p className="text-[6px] font-futura mt-2 uppercase" style={{ color: '#16A34A' }}>
                  ✓ CREATOR STUDIO INSTALLED — HEADQUARTERS EXPANDED
                </p>
              )}
            </ExecutiveSecondaryCard>
          </ExecutiveSecondaryGrid>

          {lastInstalled ? (
            <ExecutiveCollapsibleSection title="LAST INSTALLATION" defaultOpen>
              <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                {lastInstalled.name} ADDED {lastInstalled.outcome.departmentsAdded.length} DEPARTMENTS ·{' '}
                {lastInstalled.outcome.conciergesAdded.length} CONCIERGES
              </p>
            </ExecutiveCollapsibleSection>
          ) : null}
        </div>
      ) : null}

      {tab === 'catalog' ? renderCatalog() : null}
      {tab === 'installed' ? renderInstalled() : null}
      {tab === 'headquarters' ? renderHeadquarters() : null}

      {preview ? (
        <div className="mt-3 p-3 border" style={{ ...panelStyle, borderTop: `3px solid ${ADMIN_STUDIO_THEME.accent}` }}>
          <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
            INSTALL PREVIEW · {preview.packName}
          </p>
          <p className="text-[6px] font-futura mt-2 normal-case" style={{ lineHeight: 1.4, color: ADMIN_STUDIO_THEME.textSecondary }}>
            {preview.previewMessage}
          </p>
          <p className="text-[6px] font-futura mt-2 uppercase" style={{ fontWeight: 515 }}>
            NEW DEPARTMENTS
          </p>
          <p className="text-[5px] font-futura mt-1" style={{ color: '#555', lineHeight: 1.5 }}>
            {preview.previewDepartments.join(' · ')}
          </p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => {
                installPack(preview.packId);
                setPreviewPackId(null);
              }}
              className="flex-1 py-2 text-[6px] font-futura uppercase border"
              style={{ fontWeight: 515, color: '#fff', background: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
            >
              EXPAND HEADQUARTERS →
            </button>
            <button
              type="button"
              onClick={() => setPreviewPackId(null)}
              className="flex-1 py-2 text-[6px] font-futura uppercase border"
              style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
            >
              CANCEL
            </button>
          </div>
        </div>
      ) : null}
    </ExecutivePageShell>
  );
}

function PackCard({
  name,
  tagline,
  description,
  preview,
  installing,
  onPreview,
  onInstall,
  featured,
}: {
  name: string;
  tagline: string;
  description: string;
  preview: string;
  installing: boolean;
  onPreview: () => void;
  onInstall: () => void;
  featured?: boolean;
}) {
  return (
    <div
      className="p-2 border"
      style={{
        ...panelStyle,
        borderColor: featured ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.panelBorder,
      }}
    >
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: featured ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textPrimary }}>
        {name}
      </p>
      <p className="text-[6px] font-futura mt-0.5" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {tagline}
      </p>
      <p className="text-[5px] font-futura mt-1 normal-case" style={{ color: '#666', lineHeight: 1.4 }}>
        {description}
      </p>
      <p className="text-[5px] font-futura mt-1 uppercase" style={{ color: '#888' }}>
        {preview}
      </p>
      <div className="flex gap-1 mt-2">
        <button
          type="button"
          onClick={onPreview}
          className="flex-1 py-1 text-[5px] font-futura uppercase border"
          style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          PREVIEW
        </button>
        <button
          type="button"
          disabled={installing}
          onClick={onInstall}
          className="flex-1 py-1 text-[5px] font-futura uppercase border"
          style={{
            fontWeight: 515,
            color: '#fff',
            background: installing ? '#999' : ADMIN_STUDIO_THEME.accent,
            borderColor: ADMIN_STUDIO_THEME.panelBorder,
          }}
        >
          {installing ? 'INSTALLING…' : 'INSTALL →'}
        </button>
      </div>
    </div>
  );
}
