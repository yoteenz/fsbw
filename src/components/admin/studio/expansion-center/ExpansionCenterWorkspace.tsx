import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpansionCenterState } from '../../../../hooks/useExpansionCenterState';
import { useMonetizationArchitectureState } from '../../../../hooks/useMonetizationArchitectureState';
import { EXPANSION_CENTER_TAGLINE } from '../../../../studio-os-core/industry-architecture';
import {
  formatMonthlyPayroll,
  THREE_LAYER_ECONOMY,
} from '../../../../studio-os-core/monetization-architecture';
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

type ExpansionTab = 'overview' | 'catalog' | 'installed' | 'workforce' | 'payroll' | 'headquarters';

const TABS: { id: ExpansionTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'catalog', label: 'EXPANSION CATALOG' },
  { id: 'installed', label: 'OWNED DEPARTMENTS' },
  { id: 'workforce', label: 'DIGITAL WORKFORCE' },
  { id: 'payroll', label: 'DIGITAL PAYROLL' },
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

  const {
    payroll,
    growthRecommendations,
    primaryGrowth,
    staffRoster,
    headquartersLabel,
    toggleStaff,
    packPriceLabel,
    packPricing,
    staffForPack,
  } = useMonetizationArchitectureState();

  if (!profile || !payroll) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        EXPANSION CENTER LOADING — INITIALIZING ORGANIZATION ARCHITECTURE
      </p>
    );
  }

  const preview = previewPackId ? previewPlan(previewPackId) : null;
  const lastInstalled = lastInstalledPackId ? getInstalledPack(lastInstalledPackId) : null;

  const renderGrowthRecommendations = () => (
    <ExecutiveFocusPanel title="RECOMMENDED GROWTH">
      {growthRecommendations.length === 0 ? (
        <p className="text-[6px] font-futura normal-case" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          Headquarters is evolving well. Check back as publishing, sales, and scheduling signals change.
        </p>
      ) : (
        growthRecommendations.map((rec) => (
          <div key={rec.id} className="mb-3 pb-3 border-b last:border-b-0" style={{ borderColor: '#eee' }}>
            <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: '#92704A' }}>
              {rec.signal}
            </p>
            <p className="text-[7px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
              RECOMMENDED EXPANSION · {rec.recommendedExpansion}
            </p>
            <p className="text-[6px] font-futura normal-case mt-1" style={{ color: '#555', lineHeight: 1.45 }}>
              {rec.executiveTone}
            </p>
            {rec.packId && !installedPackIds.has(rec.packId) ? (
              <button
                type="button"
                onClick={() => installPack(rec.packId!)}
                className="mt-2 w-full py-1.5 text-[6px] font-futura uppercase border"
                style={{ fontWeight: 515, color: '#fff', background: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
              >
                EXPAND HEADQUARTERS · {packPriceLabel(rec.packId)}
              </button>
            ) : null}
          </div>
        ))
      )}
    </ExecutiveFocusPanel>
  );

  const renderCatalog = () => (
    <div className="space-y-2">
      {recommendedPacks.length > 0 ? (
        <>
          <p className="text-[7px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
            RECOMMENDED FOR {industry?.label ?? 'YOUR ORGANIZATION'}
          </p>
          {recommendedPacks.map((pack) => (
            <PackCard
              key={pack.id}
              name={pack.name}
              tagline={pack.tagline}
              description={pack.description}
              preview={pack.installPreview}
              priceLabel={packPriceLabel(pack.id)}
              installing={installingPackId === pack.id}
              onPreview={() => setPreviewPackId(pack.id)}
              onInstall={() => installPack(pack.id)}
              featured
            />
          ))}
        </>
      ) : null}

      <p className="text-[7px] font-futura uppercase mt-3 mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ALL DEPARTMENT EXPANSIONS · PERMANENT PURCHASE
      </p>
      {availableExpansionPacks.map((pack) => (
        <PackCard
          key={pack.id}
          name={pack.name}
          tagline={pack.tagline}
          description={pack.description}
          preview={pack.installPreview}
          priceLabel={packPriceLabel(pack.id)}
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
        const pricing = packPricing(record.packId);
        const staff = staffForPack(record.packId);
        return (
          <div key={record.packId} className="p-2 border" style={panelStyle}>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
              {pack.name} · OWNED
            </p>
            <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              {pack.tagline}
            </p>
            <p className="text-[5px] font-futura mt-1 uppercase" style={{ color: '#16A34A' }}>
              {packPriceLabel(record.packId)} · PERMANENT WING
            </p>
            {pricing?.expansionWings.length ? (
              <p className="text-[5px] font-futura mt-1" style={{ color: '#888', lineHeight: 1.4 }}>
                {pricing.expansionWings.join(' · ')}
              </p>
            ) : null}
            {staff.length > 0 ? (
              <div className="mt-2 pt-2 border-t" style={{ borderColor: '#eee' }}>
                <p className="text-[5px] font-futura uppercase mb-1" style={{ color: '#92704A' }}>
                  DIGITAL STAFF AVAILABLE
                </p>
                {staff.map(({ staff: member, status }) => (
                  <p key={member!.id} className="text-[5px] font-futura" style={{ color: status === 'active' ? '#16A34A' : '#666' }}>
                    {member!.role} · {status.toUpperCase()}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );

  const renderWorkforce = () => (
    <div className="space-y-2">
      <p className="text-[6px] font-futura normal-case mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
        Digital Staff join your organization — recurring payroll, never AI subscriptions. Pause, upgrade, or expand at any time.
      </p>
      {staffRoster.map(({ staff, status }) => (
        <div key={staff.id} className="p-2 border flex items-start justify-between gap-2" style={panelStyle}>
          <div className="min-w-0">
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515 }}>
              {staff.role}
            </p>
            <p className="text-[5px] font-futura mt-0.5" style={{ color: '#888' }}>
              {staff.departmentLabel} · {staff.description}
            </p>
            <p className="text-[5px] font-futura mt-1 uppercase" style={{ color: status === 'active' ? '#16A34A' : '#666' }}>
              {status}
              {staff.includedInHeadquartersLicense ? ' · INCLUDED IN HQ LICENSE' : ` · ${formatMonthlyPayroll(staff.monthlyPayroll)}/MO`}
            </p>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            {status !== 'active' ? (
              <button
                type="button"
                onClick={() => toggleStaff(staff.id, 'active')}
                className="text-[5px] font-futura uppercase border px-1 py-0.5"
                style={{ fontWeight: 515, color: '#fff', background: '#16A34A', borderColor: ADMIN_STUDIO_THEME.panelBorder }}
              >
                HIRE
              </button>
            ) : (
              <button
                type="button"
                onClick={() => toggleStaff(staff.id, 'paused')}
                className="text-[5px] font-futura uppercase border px-1 py-0.5"
                style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
              >
                PAUSE
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderPayroll = () => (
    <ExecutiveVisualSummary title="DIGITAL PAYROLL · ORGANIZATIONAL INVESTMENT">
      <div className="grid grid-cols-2 gap-2">
        <PayrollStat label="ACTIVE EMPLOYEES" value={String(payroll.activeEmployeeCount)} accent />
        <PayrollStat label="AVAILABLE TO HIRE" value={String(payroll.availableEmployeeCount)} />
        <PayrollStat label="HEADQUARTERS LICENSE" value={formatMonthlyPayroll(payroll.headquartersLicenseMonthly)} />
        <PayrollStat label="DIGITAL PAYROLL" value={formatMonthlyPayroll(payroll.monthlyDigitalPayroll)} accent />
      </div>
      <div className="mt-3 p-2 border" style={{ ...panelStyle, borderTop: `3px solid ${ADMIN_STUDIO_THEME.accent}` }}>
        <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: '#808080' }}>
          TOTAL MONTHLY INVESTMENT
        </p>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', color: ADMIN_STUDIO_THEME.accent, margin: '4px 0 0' }}>
          {formatMonthlyPayroll(payroll.totalMonthlyInvestment)}
        </p>
        <p className="text-[5px] font-futura mt-2 normal-case" style={{ color: '#666', lineHeight: 1.45 }}>
          {headquartersLabel} · leasing premium office space for Mission Control, Command Dock, Registry, and Core Intelligence.
        </p>
      </div>
      <div className="mt-2">
        <p className="text-[6px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: '#92704A' }}>
          THREE-LAYER ECONOMY
        </p>
        {THREE_LAYER_ECONOMY.map((layer) => (
          <p key={layer} className="text-[5px] font-futura" style={{ color: '#555', lineHeight: 1.5 }}>
            {layer}
          </p>
        ))}
      </div>
    </ExecutiveVisualSummary>
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
        eyebrow="MILESTONE 89 · MONETIZATION ARCHITECTURE"
        title={industry?.label ?? profile.industryId.toUpperCase()}
        subtitle={industry?.tagline ?? EXPANSION_CENTER_TAGLINE}
        stats={[
          { label: 'OWNED DEPARTMENTS', value: String(profile.installedPacks.length) },
          { label: 'HQ DEPARTMENTS', value: String(headquartersLayout.length) },
          { label: 'ACTIVE STAFF', value: String(payroll.activeEmployeeCount) },
          { label: 'DIGITAL PAYROLL', value: formatMonthlyPayroll(payroll.monthlyDigitalPayroll) },
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
          {primaryGrowth ? (
            <div className="p-3 border" style={{ ...panelStyle, borderTop: `3px solid #92704A` }}>
              <p className="text-[6px] font-futura uppercase" style={{ color: '#92704A' }}>
                {primaryGrowth.signal}
              </p>
              <p className="text-[7px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                RECOMMENDED EXPANSION · {primaryGrowth.recommendedExpansion}
              </p>
              <p className="text-[6px] font-futura normal-case mt-1" style={{ lineHeight: 1.45, color: '#555' }}>
                {primaryGrowth.executiveTone}
              </p>
            </div>
          ) : null}

          <ExecutiveFocusPanel title="INDUSTRY · ORGANIZATION EVOLUTION">
            <p className="text-[6px] font-futura normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              Organizations are never locked into their original industry. A painting company can add Creator Studio, Marketing Intelligence, and Community — Headquarters simply grows.
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

          {renderGrowthRecommendations()}

          <ExecutiveSecondaryGrid>
            <ExecutiveSecondaryCard title="HEADQUARTERS LICENSE">
              <p className="text-[6px] font-futura normal-case" style={{ lineHeight: 1.4, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {headquartersLabel} · Mission Control · Command Dock · Registry · Security · Core Intelligence.
              </p>
              <p className="text-[8px] font-futura mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                {formatMonthlyPayroll(payroll.headquartersLicenseMonthly)}/MO
              </p>
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="CREATOR STUDIO EXAMPLE">
              <p className="text-[6px] font-futura normal-case" style={{ lineHeight: 1.4, color: ADMIN_STUDIO_THEME.textSecondary }}>
                A painting company permanently expands with Creator Studio — Production, Publishing, and Distribution wings appear. Nothing breaks.
              </p>
              {!installedPackIds.has('creator-studio') ? (
                <button
                  type="button"
                  onClick={() => installPack('creator-studio')}
                  className="mt-2 w-full py-1.5 text-[6px] font-futura uppercase border"
                  style={{ fontWeight: 515, color: '#FFF', background: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
                >
                  EXPAND · {packPriceLabel('creator-studio')}
                </button>
              ) : (
                <p className="text-[6px] font-futura mt-2 uppercase" style={{ color: '#16A34A' }}>
                  ✓ CREATOR STUDIO OWNED — HEADQUARTERS EXPANDED
                </p>
              )}
            </ExecutiveSecondaryCard>
          </ExecutiveSecondaryGrid>

          {lastInstalled ? (
            <ExecutiveCollapsibleSection title="LAST EXPANSION" defaultOpen>
              <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                {lastInstalled.name} · {lastInstalled.outcome.departmentsAdded.length} NEW WINGS ·{' '}
                {lastInstalled.outcome.conciergesAdded.length} STAFF AVAILABLE
              </p>
            </ExecutiveCollapsibleSection>
          ) : null}
        </div>
      ) : null}

      {tab === 'catalog' ? renderCatalog() : null}
      {tab === 'installed' ? renderInstalled() : null}
      {tab === 'workforce' ? renderWorkforce() : null}
      {tab === 'payroll' ? renderPayroll() : null}
      {tab === 'headquarters' ? renderHeadquarters() : null}

      {preview ? (
        <div className="mt-3 p-3 border" style={{ ...panelStyle, borderTop: `3px solid ${ADMIN_STUDIO_THEME.accent}` }}>
          <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
            EXPANSION PREVIEW · {preview.packName}
          </p>
          <p className="text-[6px] font-futura mt-1 uppercase" style={{ color: '#92704A' }}>
            {packPriceLabel(preview.packId)} · PERMANENT DEPARTMENT
          </p>
          <p className="text-[6px] font-futura mt-2 normal-case" style={{ lineHeight: 1.4, color: ADMIN_STUDIO_THEME.textSecondary }}>
            {preview.previewMessage}
          </p>
          <p className="text-[6px] font-futura mt-2 uppercase" style={{ fontWeight: 515 }}>
            NEW WINGS
          </p>
          <p className="text-[5px] font-futura mt-1" style={{ color: '#555', lineHeight: 1.5 }}>
            {preview.previewDepartments.join(' · ')}
          </p>
          <p className="text-[6px] font-futura mt-2 uppercase" style={{ fontWeight: 515 }}>
            DIGITAL STAFF UNLOCKED
          </p>
          <p className="text-[5px] font-futura mt-1" style={{ color: '#555', lineHeight: 1.5 }}>
            {preview.previewConcierges.join(' · ')}
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

function PayrollStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-2 border text-center" style={panelStyle}>
      <p className="text-[5px] font-futura uppercase" style={{ color: '#888' }}>
        {label}
      </p>
      <p className="text-[8px] font-futura mt-1" style={{ fontWeight: 515, color: accent ? ADMIN_STUDIO_THEME.accent : '#333' }}>
        {value}
      </p>
    </div>
  );
}

function PackCard({
  name,
  tagline,
  description,
  preview,
  priceLabel,
  installing,
  onPreview,
  onInstall,
  featured,
}: {
  name: string;
  tagline: string;
  description: string;
  preview: string;
  priceLabel: string;
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
      <p className="text-[6px] font-futura mt-0.5 uppercase" style={{ fontWeight: 515, color: '#92704A' }}>
        {priceLabel}
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
          {installing ? 'EXPANDING…' : 'EXPAND →'}
        </button>
      </div>
    </div>
  );
}
