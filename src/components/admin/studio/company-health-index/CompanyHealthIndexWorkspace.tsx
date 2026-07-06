import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyHealthIndexState } from '../../../../hooks/useCompanyHealthIndexState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import { HEALTH_CATEGORIES, COMPANY_HEALTH_PHILOSOPHY } from '../../../../studio-os-core/company-health-index';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type HealthTab = 'overview' | 'categories' | 'weak-areas' | 'priorities';

const TABS: { id: HealthTab; label: string }[] = [
  { id: 'overview', label: 'HEALTH OVERVIEW' },
  { id: 'categories', label: 'ALL CATEGORIES' },
  { id: 'weak-areas', label: 'WEAK AREAS' },
  { id: 'priorities', label: 'PROACTIVE PRIORITIES' },
];

function statusColor(status: string): string {
  if (status === 'excellent' || status === 'healthy') return '#16A34A';
  if (status === 'watch') return '#CA8A04';
  return ADMIN_STUDIO_THEME.accent;
}

export function CompanyHealthIndexWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<HealthTab>('overview');
  const { profile, refresh } = useCompanyHealthIndexState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        COMPANY HEALTH INDEX™ LOADING — MEASURING ORGANIZATIONAL HEALTH
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 97 · EXECUTIVE HEALTH SCORE"
        title={profile.companyName.toUpperCase()}
        subtitle="Revenue alone never defines success — proactive leadership, not reactive management."
        progressPct={profile.executiveHealthScore}
        stats={[
          { label: 'EXECUTIVE', value: `${profile.executiveHealthScore}%` },
          { label: 'STATUS', value: profile.executiveStatus.toUpperCase() },
          { label: 'CATEGORIES', value: String(profile.categoryScores.length) },
          { label: 'WEAK', value: String(profile.weakAreas.length) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.executiveHealthScore} size={56} label="EXECUTIVE" />
        <div>
          {COMPANY_HEALTH_PHILOSOPHY.slice(1, 3).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate(adminStudioMissionControlPath())}
        className="mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        VIEW IN MISSION CONTROL
      </button>
      <button
        type="button"
        onClick={refresh}
        className="px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.accent, color: ADMIN_STUDIO_THEME.accent }}
      >
        REFRESH HEALTH INDEX
      </button>
    </ExecutivePageShell>
  );

  const renderCategories = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`${HEALTH_CATEGORIES.length} HEALTH CATEGORIES · DRILL DOWN`}>
        {profile.categoryScores.map((c) => (
          <div key={c.id} className="flex items-start gap-2 mb-2 pb-2 border-b" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <ExecutiveHealthRing value={c.scorePct} size={36} accent={statusColor(c.status)} />
            <div className="flex-1">
              <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: statusColor(c.status) }}>
                {c.label} · {c.scorePct}% · {c.status.replace(/-/g, ' ').toUpperCase()}
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                {c.signal.slice(0, 100)}
              </p>
            </div>
          </div>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderWeakAreas = () => (
    <ExecutivePageShell>
      {profile.weakAreas.length === 0 ? (
        <ExecutiveSecondaryCard title="NO CRITICAL WEAK AREAS">
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            All categories above threshold — maintain proactive reviews in Mission Control.
          </p>
        </ExecutiveSecondaryCard>
      ) : (
        profile.weakAreas.map((w) => (
          <ExecutiveFocusPanel key={w.id} title={`${w.label.toUpperCase()} · ${w.scorePct}%`}>
            <p className="text-[6px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
              {w.severity.replace(/-/g, ' ').toUpperCase()} — BEFORE IT BECOMES A BUSINESS PROBLEM
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {w.proactiveAction}
            </p>
          </ExecutiveFocusPanel>
        ))
      )}
    </ExecutivePageShell>
  );

  const renderPriorities = () => (
    <ExecutivePageShell>
      {profile.proactivePriorities.map((p, i) => (
        <ExecutiveSecondaryCard key={p} title={`PRIORITY ${i + 1}`}>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {p}
          </p>
        </ExecutiveSecondaryCard>
      ))}
      <ExecutiveSecondaryCard title="SYNCED FROM">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          {profile.syncedSources.join(' · ')}
        </p>
      </ExecutiveSecondaryCard>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'categories':
        return renderCategories();
      case 'weak-areas':
        return renderWeakAreas();
      case 'priorities':
        return renderPriorities();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="company-health-index" className="mb-2" />
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
      {renderTab()}
    </div>
  );
}
