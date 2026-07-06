import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizationalGuardianState } from '../../../../hooks/useOrganizationalGuardianState';
import {
  ORGANIZATIONAL_GUARDIAN_ACCENT,
  GUARDIAN_PHILOSOPHY,
  GUARDIAN_PRINCIPLES,
  GUARDIAN_RESPONSIBILITY_LABELS,
  queryOrganizationalGuardian,
  refreshOrganizationalGuardian,
  selectGuardianAlert,
  acknowledgeGuardianAlert,
  escalateGuardianAlert,
  getSelectedAlert,
} from '../../../../studio-os-core/organizational-guardian';
import { adminStudioConfidenceEnginePath, adminStudioDesignComplianceEnginePath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type GuardianTab = 'overview' | 'dashboard' | 'alerts' | 'domains' | 'coordination';

const TABS: { id: GuardianTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'dashboard', label: 'GUARDIAN DASHBOARD™' },
  { id: 'alerts', label: 'GUARDIAN ALERTS' },
  { id: 'domains', label: 'DOMAINS' },
  { id: 'coordination', label: 'COORDINATION' },
];

const SEVERITY_COLOR: Record<string, string> = {
  advisory: '#6366F1',
  attention: '#F59E0B',
  urgent: '#F97316',
  critical: '#EF4444',
};

const STATUS_COLOR: Record<string, string> = {
  healthy: '#10B981',
  watch: '#F59E0B',
  'at-risk': '#EF4444',
};

export function OrganizationalGuardianWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<GuardianTab>('overview');
  const [searchQuery, setSearchQuery] = useState('brain');
  const { profile, refresh } = useOrganizationalGuardianState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ORGANIZATIONAL GUARDIAN™ LOADING — PROTECTING ORGANIZATIONAL EXCELLENCE
      </p>
    );
  }

  const selected = getSelectedAlert(profile);
  const searchHits = queryOrganizationalGuardian(searchQuery, profile, 8);

  const handleSelectAlert = (id: string) => {
    selectGuardianAlert(profile.organizationId, id);
    refresh();
    setTab('alerts');
  };

  const handleRefresh = () => {
    refreshOrganizationalGuardian(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 153 · ORGANIZATIONAL GUARDIAN™ · HIGHEST OVERSIGHT LAYER"
        title={profile.companyName.toUpperCase()}
        subtitle="The silent protector of every organization — watching not to control, but to protect. A trusted executive advisor, not monitoring software."
        progressPct={profile.guardianScore}
        stats={[
          { label: 'DOMAINS', value: `${profile.domainsMonitored}` },
          { label: 'ALERTS', value: `${profile.activeAlerts}` },
          { label: 'URGENT', value: `${profile.urgentAlerts}` },
          { label: 'SYSTEMS', value: `${profile.systemsCoordinated}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.guardianScore} size={56} label="OG" accent={ORGANIZATIONAL_GUARDIAN_ACCENT} />
        <div>
          {GUARDIAN_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="SILENT PROTECTOR — TRUSTED EXECUTIVE ADVISOR">
        <p className="text-[6px] font-futura" style={{ color: ORGANIZATIONAL_GUARDIAN_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockGuardianLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="GUARDIAN PRINCIPLES">
        {GUARDIAN_PRINCIPLES.map((p) => (
          <p key={p} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {p}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="PRIORITY ALERTS">
        {profile.alerts.slice(0, 3).map((a) => (
          <button key={a.id} type="button" onClick={() => handleSelectAlert(a.id)} className="block w-full text-left mb-2 bg-transparent border-0 cursor-pointer">
            <p className="text-[6px] font-futura" style={{ color: SEVERITY_COLOR[a.severity], fontWeight: 515 }}>
              [{a.severity.toUpperCase()}] {a.title}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              {a.message}
            </p>
          </button>
        ))}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('dashboard')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ORGANIZATIONAL_GUARDIAN_ACCENT, color: ORGANIZATIONAL_GUARDIAN_ACCENT }}>
        GUARDIAN DASHBOARD™ →
      </button>
      <button type="button" onClick={() => navigate(adminStudioConfidenceEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        CONFIDENCE ENGINE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioDesignComplianceEnginePath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        DESIGN COMPLIANCE →
      </button>
    </ExecutivePageShell>
  );

  const renderDashboard = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="GUARDIAN DASHBOARD™ — EXECUTIVE OVERVIEW">
        <div className="grid grid-cols-2 gap-2">
          {profile.dashboardMetrics.map((m) => (
            <ExecutiveSecondaryCard key={m.metric} title={m.label.toUpperCase()}>
              <p className="text-[8px] font-futura mb-1" style={{ color: ORGANIZATIONAL_GUARDIAN_ACCENT, fontWeight: 515 }}>
                {m.score}%
              </p>
              <p className="text-[6px] font-futura mb-1" style={{ color: m.trend === 'declining' ? '#EF4444' : m.trend === 'rising' ? '#10B981' : ADMIN_STUDIO_THEME.textSecondary }}>
                {m.trend === 'rising' ? '↑' : m.trend === 'declining' ? '↓' : '→'} {m.trend}
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {m.summary}
              </p>
            </ExecutiveSecondaryCard>
          ))}
        </div>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderAlerts = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="GUARDIAN ALERTS — PROTECT BEFORE REACTING">
        {(selected ? [selected, ...profile.alerts.filter((a) => a.id !== selected.id)] : profile.alerts).map((a) => (
          <ExecutiveSecondaryCard key={a.id} title={`${a.title.toUpperCase()} · ${a.severity.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ORGANIZATIONAL_GUARDIAN_ACCENT, fontWeight: 515, lineHeight: 1.45 }}>
              {a.message}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: SEVERITY_COLOR[a.severity] }}>
              {a.domainLabel} · {a.status} · Explain before acting
            </p>
            <ExecutiveSecondaryCard title="RECOMMENDATION">
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {a.recommendation}
              </p>
            </ExecutiveSecondaryCard>
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Coordinated: {a.coordinatedSystems.join(' · ')}
            </p>
            {a.status === 'active' ? (
              <div className="flex gap-1">
                <button type="button" onClick={() => { acknowledgeGuardianAlert(profile.organizationId, a.id); refresh(); }} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ORGANIZATIONAL_GUARDIAN_ACCENT, color: ORGANIZATIONAL_GUARDIAN_ACCENT }}>
                  ACKNOWLEDGE
                </button>
                <button type="button" onClick={() => { escalateGuardianAlert(profile.organizationId, a.id); refresh(); }} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: '#EF4444', color: '#EF4444' }}>
                  ESCALATE
                </button>
              </div>
            ) : null}
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDomains = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="15 MONITORED DOMAINS">
        {profile.domainStatuses.map((d) => (
          <ExecutiveSecondaryCard key={d.domain} title={`${d.label.toUpperCase()} · ${d.score}%`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: STATUS_COLOR[d.status], fontWeight: 515 }}>
              {d.status.toUpperCase()} · {d.trend}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {d.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderCoordination = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="GUARDIAN RESPONSIBILITIES">
        {Object.values(GUARDIAN_RESPONSIBILITY_LABELS).map((label) => (
          <p key={label} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {label}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="COORDINATED QA & INTELLIGENCE SYSTEMS">
        {profile.coordinations.map((c) => (
          <ExecutiveSecondaryCard key={c.system} title={c.system.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: c.status === 'escalated' ? '#EF4444' : ORGANIZATIONAL_GUARDIAN_ACCENT }}>
              {c.status.toUpperCase()} · Last sync {new Date(c.lastSync).toLocaleTimeString()}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {c.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="organizational-guardian" />
      <div className="flex flex-wrap gap-1 mb-3 mt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? ORGANIZATIONAL_GUARDIAN_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? ORGANIZATIONAL_GUARDIAN_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
        <button type="button" onClick={handleRefresh} className="px-2 py-1 text-[6px] font-futura uppercase border ml-auto" style={{ borderColor: ORGANIZATIONAL_GUARDIAN_ACCENT, color: ORGANIZATIONAL_GUARDIAN_ACCENT }}>
          SYNC GUARDIAN
        </button>
      </div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search alerts, domains, metrics…"
          className="flex-1 px-2 py-1 text-[6px] font-futura border bg-transparent"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textPrimary }}
        />
      </div>
      {searchHits.length > 0 && searchQuery.trim() ? (
        <ExecutiveSecondaryCard title="SEARCH RESULTS">
          {searchHits.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => h.type === 'alert' && handleSelectAlert(h.id)}
              className="block w-full text-left mb-1 bg-transparent border-0 cursor-pointer"
            >
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                · {h.label} — {h.matchReason}
              </p>
            </button>
          ))}
        </ExecutiveSecondaryCard>
      ) : null}
      {tab === 'overview' && renderOverview()}
      {tab === 'dashboard' && renderDashboard()}
      {tab === 'alerts' && renderAlerts()}
      {tab === 'domains' && renderDomains()}
      {tab === 'coordination' && renderCoordination()}
    </div>
  );
}
