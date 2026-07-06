import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePolicyEngineState } from '../../../../hooks/usePolicyEngineState';
import {
  POLICY_ENGINE_ACCENT,
  POLICY_ENGINE_PHILOSOPHY,
  queryPolicyEngine,
} from '../../../../studio-os-core/policy-engine';
import { adminStudioMissionControlPath, adminStudioPromptRegistryPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type EngineTab = 'overview' | 'catalog' | 'hierarchy' | 'enforcement' | 'simulation' | 'discovery';

const TABS: { id: EngineTab; label: string }[] = [
  { id: 'overview', label: 'ENGINE OVERVIEW' },
  { id: 'catalog', label: 'POLICY CATALOG' },
  { id: 'hierarchy', label: 'POLICY HIERARCHY' },
  { id: 'enforcement', label: 'ENFORCEMENT' },
  { id: 'simulation', label: 'SIMULATION' },
  { id: 'discovery', label: 'DISCOVERY' },
];

export function PolicyEngineWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<EngineTab>('overview');
  const [searchQuery, setSearchQuery] = useState('approval');
  const { profile, refresh } = usePolicyEngineState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        POLICY ENGINE™ LOADING — ORGANIZATIONAL LAW
      </p>
    );
  }

  const searchHits = queryPolicyEngine(searchQuery, 8);

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 134 · POLICY ENGINE™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Define policies once — every Concierge, automation, workflow, and department follows automatically."
        progressPct={profile.engineScore}
        stats={[
          { label: 'ENGINE', value: `${profile.engineScore}%` },
          { label: 'ACTIVE', value: `${profile.activeCount}` },
          { label: 'TOTAL', value: `${profile.totalPolicies}` },
          { label: 'COMPLIANCE', value: `${profile.complianceRatePct}%` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.engineScore} size={56} label="PE" accent={POLICY_ENGINE_ACCENT} />
        <div>
          {POLICY_ENGINE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="ORGANIZATIONAL LAW · CONSISTENT BEHAVIOR">
        <p className="text-[6px] font-futura" style={{ color: POLICY_ENGINE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockPolicyLine}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioPromptRegistryPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: POLICY_ENGINE_ACCENT, color: POLICY_ENGINE_ACCENT }}>
        PROMPT REGISTRY →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SYNC POLICIES
      </button>
    </ExecutivePageShell>
  );

  const renderCatalog = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="POLICY CATALOG — CENTRALIZED RULEBOOK">
        {profile.policies.slice(0, 12).map((p) => (
          <ExecutiveSecondaryCard key={p.policyId} title={`${p.name.toUpperCase()} · ${p.level.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: POLICY_ENGINE_ACCENT, fontWeight: 515 }}>
              {p.owner} · {p.category} · priority {p.enforcementPriority}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {p.description}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {p.rules.slice(0, 2).join(' · ')}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderHierarchy = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="POLICY HIERARCHY — LAYERED RULES">
        {profile.hierarchyLayers.map((layer) => (
          <ExecutiveSecondaryCard key={layer.level} title={`${layer.label} · ${layer.policyCount} POLICIES`}>
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {layer.description}
            </p>
            {layer.policyIds.slice(0, 3).map((id) => {
              const p = profile.policies.find((pol) => pol.policyId === id);
              if (!p) return null;
              return (
                <p key={id} className="text-[6px] font-futura mb-1" style={{ color: POLICY_ENGINE_ACCENT, fontWeight: 515 }}>
                  {p.name}
                </p>
              );
            })}
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderEnforcement = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="POLICY ENFORCEMENT — COMPLIANCE BEFORE EXECUTION">
        {profile.enforcementHistory.slice(0, 10).map((e) => (
          <ExecutiveSecondaryCard key={e.enforcementId} title={e.workflowName.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: e.compliant ? POLICY_ENGINE_ACCENT : '#DC2626', fontWeight: 515 }}>
              {e.action.toUpperCase()} · {e.compliant ? 'COMPLIANT' : 'NOT COMPLIANT'} · {e.checkedAt.slice(0, 16).replace('T', ' ')}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {e.explanation}
            </p>
            {!e.compliant && (
              <p className="text-[6px] font-futura" style={{ color: POLICY_ENGINE_ACCENT, fontWeight: 515 }}>
                → {e.recommendations.join(' · ')}
              </p>
            )}
          </ExecutiveSecondaryCard>
        ))}
        <ExecutiveSecondaryCard title="GOVERNANCE FINDINGS">
          {profile.governanceFindings.slice(0, 4).map((f) => (
            <p key={f.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              <span style={{ color: POLICY_ENGINE_ACCENT, fontWeight: 515 }}>{f.severity.toUpperCase()}:</span> {f.message}
            </p>
          ))}
        </ExecutiveSecondaryCard>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderSimulation = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="POLICY SIMULATION — IMPACT BEFORE PUBLISHING">
        {profile.simulationResults.slice(0, 6).map((s) => (
          <ExecutiveSecondaryCard key={s.simulationId} title={`${s.policyName.toUpperCase()} · ${s.riskLevel.toUpperCase()} RISK`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: POLICY_ENGINE_ACCENT, fontWeight: 515 }}>
              {s.affectedDepartments.join(', ')} · {s.affectedEmployees} employees · {s.affectedCustomers} customers
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {s.changeSummary}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Automations: {s.affectedAutomations.join(' · ')}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <ExecutiveSecondaryCard title="RECOMMENDED IMPROVEMENTS">
          {profile.recommendations.slice(0, 4).map((r) => (
            <p key={r.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              <span style={{ color: POLICY_ENGINE_ACCENT, fontWeight: 515 }}>{r.priority.toUpperCase()}:</span> {r.title}
            </p>
          ))}
        </ExecutiveSecondaryCard>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDiscovery = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="POLICY DISCOVERY">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Try approval, privacy, marketplace, publishing…"
          className="w-full mb-2 px-2 py-1 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((hit) => (
          <ExecutiveSecondaryCard key={hit.entry.policyId} title={hit.entry.name.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: POLICY_ENGINE_ACCENT, fontWeight: 515 }}>
              {hit.entry.level} · {hit.entry.category} · {hit.matchReason}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {hit.entry.owner} · {hit.entry.status}
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
      case 'hierarchy':
        return renderHierarchy();
      case 'enforcement':
        return renderEnforcement();
      case 'simulation':
        return renderSimulation();
      case 'discovery':
        return renderDiscovery();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="policy-engine" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? POLICY_ENGINE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? POLICY_ENGINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
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
