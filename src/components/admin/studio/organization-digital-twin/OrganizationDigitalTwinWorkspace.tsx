import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizationDigitalTwinState } from '../../../../hooks/useOrganizationDigitalTwinState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  DIGITAL_TWIN_ACCENT,
  DIGITAL_TWIN_PHILOSOPHY,
  SANDBOX_GUARANTEES,
  TWIN_EXAMPLE_QUERIES,
  TWIN_SCENARIO_LABELS,
  TWIN_TEST_CATEGORIES,
  TWIN_TEST_CATEGORY_LABELS,
  listSuggestedWhatIfScenarios,
} from '../../../../studio-os-core/organization-digital-twin';
import { adminStudioQaSimulationEnginePath, adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type TwinTab = 'overview' | 'sandbox' | 'what-if' | 'library' | 'intelligence-tests';

const TABS: { id: TwinTab; label: string }[] = [
  { id: 'overview', label: 'TWIN OVERVIEW' },
  { id: 'sandbox', label: 'SANDBOX REPLICA' },
  { id: 'what-if', label: 'WHAT-IF MODE' },
  { id: 'library', label: 'SIMULATION LIBRARY' },
  { id: 'intelligence-tests', label: 'STUDIO INTELLIGENCE TESTS' },
];

const RISK_COLOR: Record<string, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#EF4444',
};

export function OrganizationDigitalTwinWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TwinTab>('overview');
  const [query, setQuery] = useState('');
  const { profile, lastSimulation, refresh, runWhatIf } = useOrganizationDigitalTwinState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        DIGITAL TWIN™ LOADING — BUILDING SANDBOX REPLICA
      </p>
    );
  }

  const suggestions = listSuggestedWhatIfScenarios(profile);
  const activeSim = lastSimulation ?? profile.simulationHistory[0] ?? null;

  const handleRunWhatIf = () => {
    const q = query.trim();
    if (!q) return;
    runWhatIf(q);
    setTab('library');
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 145 · DIGITAL TWIN™ V2.0 · PRACTICE BEFORE PERFORM"
        title={profile.companyName.toUpperCase()}
        subtitle="Complete sandbox replica where Studio Intelligence™ safely tests ideas before they affect the real business."
        progressPct={profile.twinFidelityScore}
        stats={[
          { label: 'FIDELITY', value: `${profile.twinFidelityScore}%` },
          { label: 'REPLICAS', value: `${profile.sandboxReplicas.length}` },
          { label: 'SIMULATIONS', value: `${profile.simulationHistory.length}` },
          { label: 'DEPARTMENTS', value: String(profile.snapshot.departmentCount) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.snapshot.executiveHealthScore} size={56} label="HEALTH" accent={DIGITAL_TWIN_ACCENT} />
        <ExecutiveHealthRing value={profile.snapshot.pulseScore} size={56} label="PULSE" accent="#0891B2" />
        <div>
          {DIGITAL_TWIN_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="STUDIO OS PRACTICES BEFORE IT PERFORMS">
        <p className="text-[6px] font-futura mb-1" style={{ color: DIGITAL_TWIN_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockTwinLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="ORGANIZATION MIRROR · REAL-TIME SNAPSHOT">
        {profile.snapshot.departments.map((dept) => (
          <ExecutiveSecondaryCard key={dept.id} title={dept.name.toUpperCase()}>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Headcount {dept.headcount} · Digital staff {dept.digitalStaffCount} · Health {dept.healthScore}% · Pulse {dept.pulseScore}%
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => navigate(adminStudioQaSimulationEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: DIGITAL_TWIN_ACCENT, color: DIGITAL_TWIN_ACCENT }}>
        QA SIMULATION ENGINE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        REFRESH DIGITAL TWIN
      </button>
    </ExecutivePageShell>
  );

  const renderSandbox = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SANDBOX REPLICA — EVERY ORGANIZATION AUTOMATICALLY RECEIVES">
        {profile.sandboxReplicas.map((replica) => (
          <ExecutiveSecondaryCard key={replica.componentId} title={`${replica.label.toUpperCase()} · ${replica.fidelityPct}% · ${replica.status.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: DIGITAL_TWIN_ACCENT, fontWeight: 515 }}>
              {replica.entityCount} entities · synced {new Date(replica.lastSyncedAt).toLocaleDateString()}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {replica.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="SANDBOX GUARANTEES">
        {SANDBOX_GUARANTEES.map((line) => (
          <ExecutiveSecondaryCard key={line} title="GUARANTEE">
            <p className="text-[6px] font-futura" style={{ color: '#16A34A' }}>✓ {line}</p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderWhatIf = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="WHAT-IF MODE · STUDIO INTELLIGENCE TESTS SAFELY">
        <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Ask any scenario — approval steps · integrations · AI models · payroll · traffic surges · workflows · permissions.
        </p>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "What happens if Instagram disconnects?"'
          className="w-full min-h-[48px] p-2 text-[7px] font-futura border mb-2"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        <button type="button" onClick={handleRunWhatIf} className="px-2 py-1 text-[6px] font-futura uppercase border mb-3" style={{ borderColor: DIGITAL_TWIN_ACCENT, color: DIGITAL_TWIN_ACCENT, background: 'rgba(147,51,234,0.06)' }}>
          RUN SANDBOX SIMULATION →
        </button>
        <p className="text-[6px] font-futura mb-1 uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>Example simulations</p>
        {TWIN_EXAMPLE_QUERIES.map((s) => (
          <button key={s} type="button" onClick={() => { setQuery(s); runWhatIf(s); setTab('library'); }} className="block w-full text-left mb-1 px-2 py-1 text-[6px] font-futura border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
            {s}
          </button>
        ))}
        <p className="text-[6px] font-futura mb-1 mt-2 uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>More suggestions</p>
        {suggestions.slice(5).map((s) => (
          <button key={s} type="button" onClick={() => { setQuery(s); runWhatIf(s); setTab('library'); }} className="block w-full text-left mb-1 px-2 py-1 text-[6px] font-futura border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
            {s}
          </button>
        ))}
      </ExecutiveFocusPanel>
      {activeSim && (
        <ExecutiveSecondaryCard title={`LATEST · ${activeSim.scenarioLabel.toUpperCase()}`}>
          <p className="text-[6px] font-futura mb-1" style={{ color: RISK_COLOR[activeSim.riskLevel] ?? DIGITAL_TWIN_ACCENT, fontWeight: 515 }}>
            Risk {activeSim.riskLevel.toUpperCase()} · Confidence {activeSim.confidenceLevel}%
            {activeSim.productionGateRequired ? ' · Production gate required' : ''}
          </p>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>{activeSim.expectedOutcome.slice(0, 180)}</p>
        </ExecutiveSecondaryCard>
      )}
    </ExecutivePageShell>
  );

  const renderLibrary = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`SIMULATION LIBRARY · ${profile.simulationHistory.length} SANDBOX RUNS`}>
        {profile.simulationHistory.length === 0 ? (
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>No simulations yet — use What-If Mode to explore decisions safely.</p>
        ) : (
          profile.simulationHistory.map((sim) => (
            <ExecutiveSecondaryCard key={sim.id} title={`${sim.scenarioLabel.toUpperCase()} · RISK ${sim.riskLevel.toUpperCase()}`}>
              <p className="text-[6px] font-futura mb-1" style={{ color: DIGITAL_TWIN_ACCENT }}>{sim.query.slice(0, 100)} · {sim.confidenceLevel}% confidence</p>
              <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}><span style={{ color: '#6366F1' }}>Expected:</span> {sim.expectedOutcome.slice(0, 120)}</p>
              <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}><span style={{ color: '#0891B2' }}>Departments:</span> {sim.affectedDepartments.join(', ')}</p>
              {sim.unexpectedSideEffects.slice(0, 2).map((fx) => (
                <p key={fx} className="text-[6px] font-futura mb-1" style={{ color: '#D97706' }}>Side effect: {fx}</p>
              ))}
              <p className="text-[6px] font-futura mb-1" style={{ color: '#16A34A' }}><span style={{ fontWeight: 515 }}>Rollback:</span> {sim.rollbackPlan.slice(0, 100)}</p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>→ {sim.recommendedNextSteps[0]}</p>
            </ExecutiveSecondaryCard>
          ))
        )}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderIntelligenceTests = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="STUDIO INTELLIGENCE™ — SAFE TEST CATEGORIES">
        {TWIN_TEST_CATEGORIES.map((cat) => (
          <ExecutiveSecondaryCard key={cat} title={TWIN_TEST_CATEGORY_LABELS[cat].toUpperCase()}>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              Test {TWIN_TEST_CATEGORY_LABELS[cat].toLowerCase()} in sandbox before Studio Intelligence recommends to production.
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="SCENARIO TYPES">
        {Object.entries(TWIN_SCENARIO_LABELS).slice(0, 12).map(([key, label]) => (
          <p key={key} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>· {label}</p>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveSecondaryCard title="INTELLIGENCE SOURCES">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>Estimates derived from: {profile.syncedSources.join(' · ')}</p>
      </ExecutiveSecondaryCard>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'sandbox': return renderSandbox();
      case 'what-if': return renderWhatIf();
      case 'library': return renderLibrary();
      case 'intelligence-tests': return renderIntelligenceTests();
      default: return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="organization-digital-twin" className="mb-2" />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border" style={{ fontWeight: 515, borderColor: tab === t.id ? DIGITAL_TWIN_ACCENT : ADMIN_STUDIO_THEME.panelBorder, color: tab === t.id ? DIGITAL_TWIN_ACCENT : ADMIN_STUDIO_THEME.textSecondary, background: tab === t.id ? 'rgba(147,51,234,0.06)' : 'white' }}>
            {t.label}
          </button>
        ))}
      </div>
      {renderTab()}
    </div>
  );
}
