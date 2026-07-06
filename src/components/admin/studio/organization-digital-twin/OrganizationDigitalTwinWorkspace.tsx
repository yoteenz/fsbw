import { useState } from 'react';
import { useOrganizationDigitalTwinState } from '../../../../hooks/useOrganizationDigitalTwinState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  DIGITAL_TWIN_PHILOSOPHY,
  SANDBOX_GUARANTEES,
  TWIN_SCENARIO_LABELS,
  listSuggestedWhatIfScenarios,
} from '../../../../studio-os-core/organization-digital-twin';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type TwinTab = 'overview' | 'what-if' | 'library' | 'sandbox';

const TABS: { id: TwinTab; label: string }[] = [
  { id: 'overview', label: 'TWIN OVERVIEW' },
  { id: 'what-if', label: 'WHAT-IF MODE' },
  { id: 'library', label: 'SIMULATION LIBRARY' },
  { id: 'sandbox', label: 'SAFE SANDBOX' },
];

const ACCENT = '#9333EA';

export function OrganizationDigitalTwinWorkspace() {
  const [tab, setTab] = useState<TwinTab>('overview');
  const [query, setQuery] = useState('');
  const { profile, lastSimulation, refresh, runWhatIf } = useOrganizationDigitalTwinState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        DIGITAL TWIN™ LOADING — MIRRORING ORGANIZATION IN REAL TIME
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
        eyebrow="MILESTONE 103 · ORGANIZATION DIGITAL TWIN"
        title={profile.companyName.toUpperCase()}
        subtitle="Living simulation of the organization — explore the future safely before acting."
        progressPct={profile.twinFidelityScore}
        stats={[
          { label: 'FIDELITY', value: `${profile.twinFidelityScore}%` },
          { label: 'DEPARTMENTS', value: String(profile.snapshot.departmentCount) },
          { label: 'HEADCOUNT', value: String(profile.snapshot.totalHeadcount) },
          { label: 'DIGITAL STAFF', value: String(profile.snapshot.digitalStaffCount) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.snapshot.executiveHealthScore} size={56} label="HEALTH" accent={ACCENT} />
        <ExecutiveHealthRing value={profile.snapshot.pulseScore} size={56} label="PULSE" accent="#0891B2" />
        <div>
          {DIGITAL_TWIN_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveFocusPanel title="ORGANIZATION MIRROR · REAL-TIME SNAPSHOT">
        {profile.snapshot.departments.map((dept) => (
          <ExecutiveSecondaryCard key={dept.id} title={dept.name.toUpperCase()}>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Headcount {dept.headcount} · Digital staff {dept.digitalStaffCount} · Health {dept.healthScore}% · Pulse {dept.pulseScore}%
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <button
        type="button"
        onClick={refresh}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        REFRESH TWIN MIRROR
      </button>
    </ExecutivePageShell>
  );

  const renderWhatIf = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="WHAT-IF MODE · TEST IDEAS BEFORE TESTING REALITY">
        <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Ask any scenario — hiring · expansion · pricing · markets · digital staff · campaigns · operations.
        </p>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "What happens if we hire two dispatchers?"'
          className="w-full min-h-[48px] p-2 text-[7px] font-futura border mb-2"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        <button
          type="button"
          onClick={handleRunWhatIf}
          className="px-2 py-1 text-[6px] font-futura uppercase border mb-3"
          style={{ borderColor: ACCENT, color: ACCENT, background: 'rgba(147,51,234,0.06)' }}
        >
          RUN SANDBOX SIMULATION →
        </button>
        <p className="text-[6px] font-futura mb-1 uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Suggested what-if queries
        </p>
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setQuery(s);
              runWhatIf(s);
              setTab('library');
            }}
            className="block w-full text-left mb-1 px-2 py-1 text-[6px] font-futura border"
            style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
          >
            {s}
          </button>
        ))}
      </ExecutiveFocusPanel>
      {activeSim && (
        <ExecutiveSecondaryCard title={`LATEST · ${activeSim.scenarioLabel.toUpperCase()}`}>
          <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
            Confidence {activeSim.confidenceLevel}% · Sandbox only
          </p>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {activeSim.predictedImpact.slice(0, 180)}
          </p>
        </ExecutiveSecondaryCard>
      )}
    </ExecutivePageShell>
  );

  const renderLibrary = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`SIMULATION LIBRARY · ${profile.simulationHistory.length} SANDBOX RUNS`}>
        {profile.simulationHistory.length === 0 ? (
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            No simulations yet — use What-If Mode to explore decisions safely.
          </p>
        ) : (
          profile.simulationHistory.map((sim) => (
            <ExecutiveSecondaryCard key={sim.id} title={sim.scenarioLabel.toUpperCase()}>
              <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
                {sim.query.slice(0, 100)} · {sim.confidenceLevel}% confidence
              </p>
              <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                <span style={{ color: '#6366F1' }}>Impact:</span> {sim.predictedImpact.slice(0, 120)}
              </p>
              <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                <span style={{ color: '#0891B2' }}>Departments:</span> {sim.departmentsAffected.join(', ')}
              </p>
              <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                <span style={{ color: '#D97706' }}>Revenue:</span> {sim.revenueImplications.slice(0, 100)}
              </p>
              <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                <span style={{ color: '#16A34A' }}>Next step:</span> {sim.recommendedNextSteps[0]}
              </p>
              {sim.risks.slice(0, 2).map((risk) => (
                <p key={risk} className="text-[6px] font-futura" style={{ color: '#DC2626' }}>
                  Risk: {risk}
                </p>
              ))}
            </ExecutiveSecondaryCard>
          ))
        )}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderSandbox = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SAFE SANDBOX · NO REAL WORLD IMPACT">
        {SANDBOX_GUARANTEES.map((line) => (
          <ExecutiveSecondaryCard key={line} title="SANDBOX GUARANTEE">
            <p className="text-[6px] font-futura" style={{ color: '#16A34A' }}>
              ✓ {line}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="SIMULATION CAPABILITIES">
        {Object.entries(TWIN_SCENARIO_LABELS).map(([key, label]) => (
          <p key={key} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {label}
          </p>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveSecondaryCard title="INTELLIGENCE SOURCES">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Estimates derived from: {profile.syncedSources.join(' · ')}
        </p>
      </ExecutiveSecondaryCard>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'what-if':
        return renderWhatIf();
      case 'library':
        return renderLibrary();
      case 'sandbox':
        return renderSandbox();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="organization-digital-twin" className="mb-2" />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(147,51,234,0.06)' : 'white',
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
