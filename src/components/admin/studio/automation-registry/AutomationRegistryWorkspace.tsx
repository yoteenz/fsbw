import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutomationRegistryState } from '../../../../hooks/useAutomationRegistryState';
import {
  AUTOMATION_REGISTRY_ACCENT,
  AUTOMATION_REGISTRY_PHILOSOPHY,
  queryAutomationRegistry,
} from '../../../../studio-os-core/automation-registry';
import { adminStudioEventBusPath, adminStudioMissionControlPath, adminStudioPromptRegistryPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type RegistryTab = 'overview' | 'catalog' | 'dashboard' | 'history' | 'governance' | 'discovery';

const TABS: { id: RegistryTab; label: string }[] = [
  { id: 'overview', label: 'REGISTRY OVERVIEW' },
  { id: 'catalog', label: 'AUTOMATION CATALOG' },
  { id: 'dashboard', label: 'AUTOMATION DASHBOARD' },
  { id: 'history', label: 'EXECUTION HISTORY' },
  { id: 'governance', label: 'GOVERNANCE' },
  { id: 'discovery', label: 'DISCOVERY' },
];

export function AutomationRegistryWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<RegistryTab>('overview');
  const [searchQuery, setSearchQuery] = useState('command');
  const { profile, refresh } = useAutomationRegistryState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        AUTOMATION REGISTRY™ LOADING — TRANSPARENT AUTOMATION
      </p>
    );
  }

  const searchHits = queryAutomationRegistry(searchQuery, 8);

  const getAutomation = (id: string) => profile.automations.find((a) => a.automationId === id);

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 132 · AUTOMATION REGISTRY™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Every automation registered — visible, searchable, auditable. Nothing executes without registration."
        progressPct={profile.registryScore}
        stats={[
          { label: 'REGISTRY', value: `${profile.registryScore}%` },
          { label: 'ACTIVE', value: `${profile.activeCount}` },
          { label: 'TOTAL', value: `${profile.totalAutomations}` },
          { label: 'SUCCESS', value: `${profile.avgSuccessRatePct}%` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.registryScore} size={56} label="AR" accent={AUTOMATION_REGISTRY_ACCENT} />
        <div>
          {AUTOMATION_REGISTRY_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="TRANSPARENT AUTOMATION · TRUST">
        <p className="text-[6px] font-futura" style={{ color: AUTOMATION_REGISTRY_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockRegistryLine}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioPromptRegistryPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: AUTOMATION_REGISTRY_ACCENT, color: AUTOMATION_REGISTRY_ACCENT }}>
        PROMPT REGISTRY →
      </button>
      <button type="button" onClick={() => navigate(adminStudioEventBusPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        EVENT BUS →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SYNC REGISTRY
      </button>
    </ExecutivePageShell>
  );

  const renderCatalog = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="AUTOMATION CATALOG — REGISTERED ASSETS">
        {profile.automations.slice(0, 12).map((a) => (
          <ExecutiveSecondaryCard key={a.automationId} title={`${a.name.toUpperCase()} · ${a.status.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: AUTOMATION_REGISTRY_ACCENT, fontWeight: 515 }}>
              {a.owner} · {a.category} · {a.successRatePct}% success
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {a.description}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Trigger: {a.trigger}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDashboard = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="AUTOMATION DASHBOARD — VISIBILITY">
        {profile.dashboardSections.map((section) => (
          <ExecutiveSecondaryCard key={section.sectionId} title={section.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {section.description}
            </p>
            {section.automationIds.slice(0, 3).map((id) => {
              const a = getAutomation(id);
              if (!a) return null;
              return (
                <p key={id} className="text-[6px] font-futura mb-1" style={{ color: AUTOMATION_REGISTRY_ACCENT, fontWeight: 515 }}>
                  {a.name} · {a.confidencePct}% confidence · {a.riskLevel} risk
                </p>
              );
            })}
          </ExecutiveSecondaryCard>
        ))}
        <ExecutiveSecondaryCard title="RECOMMENDED IMPROVEMENTS">
          {profile.recommendations.slice(0, 4).map((r) => (
            <p key={r.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              <span style={{ color: AUTOMATION_REGISTRY_ACCENT, fontWeight: 515 }}>{r.priority.toUpperCase()}:</span> {r.title}
            </p>
          ))}
        </ExecutiveSecondaryCard>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderHistory = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="EXECUTION HISTORY — AUDIT TRAIL">
        {profile.executionHistory.slice(0, 12).map((e) => (
          <ExecutiveSecondaryCard key={e.executionId} title={e.automationName.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: AUTOMATION_REGISTRY_ACCENT, fontWeight: 515 }}>
              {e.status.toUpperCase()} · {e.durationMs}ms · {e.executedAt.slice(0, 16).replace('T', ' ')}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {e.triggerSummary}{e.approvedBy ? ` · Approved: ${e.approvedBy}` : ''}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderGovernance = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="REGISTRY GOVERNANCE — NOTHING HIDDEN">
        {profile.governanceFindings.slice(0, 10).map((f) => (
          <ExecutiveSecondaryCard key={f.id} title={f.severity.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {f.message}
            </p>
            <p className="text-[6px] font-futura" style={{ color: AUTOMATION_REGISTRY_ACCENT, fontWeight: 515 }}>
              → {f.recommendation}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDiscovery = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="AUTOMATION DISCOVERY">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Try command dock, workflow, email, pulse…"
          className="w-full mb-2 px-2 py-1 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((hit) => (
          <ExecutiveSecondaryCard key={hit.entry.automationId} title={hit.entry.name.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: AUTOMATION_REGISTRY_ACCENT, fontWeight: 515 }}>
              {hit.entry.category} · {hit.entry.status} · {hit.matchReason}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {hit.entry.department} · {hit.entry.owner}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'catalog':
        return renderCatalog();
      case 'dashboard':
        return renderDashboard();
      case 'history':
        return renderHistory();
      case 'governance':
        return renderGovernance();
      case 'discovery':
        return renderDiscovery();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="automation-registry" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? AUTOMATION_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? AUTOMATION_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
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
