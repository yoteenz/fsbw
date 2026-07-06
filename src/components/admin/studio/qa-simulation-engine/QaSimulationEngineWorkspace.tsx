import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQaSimulationEngineState } from '../../../../hooks/useQaSimulationEngineState';
import {
  QA_SIMULATION_ENGINE_ACCENT,
  QA_SIMULATION_ENGINE_PHILOSOPHY,
  queryQaSimulationEngine,
  runSimulation,
  canReachProduction,
} from '../../../../studio-os-core/qa-simulation-engine';
import { adminStudioQaInspectorPath, adminStudioQaHeadquartersPath, adminStudioAiRedTeamPath, adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type SimTab = 'overview' | 'simulations' | 'gates' | 'personas';

const TABS: { id: SimTab; label: string }[] = [
  { id: 'overview', label: 'SIMULATION OVERVIEW' },
  { id: 'simulations', label: 'RECENT SIMULATIONS' },
  { id: 'gates', label: 'PRODUCTION GATES' },
  { id: 'personas', label: 'PERSONAS' },
];

const GATE_COLOR: Record<string, string> = {
  cleared: '#10B981',
  conditional: '#F59E0B',
  blocked: '#EF4444',
};

export function QaSimulationEngineWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<SimTab>('overview');
  const [searchQuery, setSearchQuery] = useState('customer');
  const { profile, refresh } = useQaSimulationEngineState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        QA SIMULATION ENGINE™ LOADING — PRACTICE FIELD
      </p>
    );
  }

  const searchHits = queryQaSimulationEngine(searchQuery, profile, 8);
  const productionCleared = canReachProduction(profile);

  const handleRunSimulation = () => {
    runSimulation(profile.organizationId, 'customer', 'book-appointment');
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 144 · QA SIMULATION ENGINE™ · PRE-PRODUCTION PRACTICE FIELD"
        title={profile.companyName.toUpperCase()}
        subtitle="Nothing significant reaches production until Studio OS has experienced it exactly as a real person would."
        progressPct={profile.simulationScore}
        stats={[
          { label: 'SUCCESS', value: `${profile.averageSuccessRate}%` },
          { label: 'PASSED', value: `${profile.simulationsPassed}/${profile.simulationsRun}` },
          { label: 'GATE', value: profile.productionGateStatus.toUpperCase() },
          { label: 'READY', value: productionCleared ? 'YES' : 'NO' },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.simulationScore} size={56} label="QS" accent={QA_SIMULATION_ENGINE_ACCENT} />
        <div>
          {QA_SIMULATION_ENGINE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="PRACTICE FIELD · REHEARSE BEFORE USERS ENCOUNTER IT">
        <p className="text-[6px] font-futura mb-1" style={{ color: QA_SIMULATION_ENGINE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockSimulationLine}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={handleRunSimulation} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: QA_SIMULATION_ENGINE_ACCENT, color: QA_SIMULATION_ENGINE_ACCENT }}>
        RUN CUSTOMER SIMULATION
      </button>
      <button type="button" onClick={() => navigate(adminStudioAiRedTeamPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: QA_SIMULATION_ENGINE_ACCENT, color: QA_SIMULATION_ENGINE_ACCENT }}>
        AI RED TEAM →
      </button>
      <button type="button" onClick={() => navigate(adminStudioQaInspectorPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        QA INSPECTOR →
      </button>
      <button type="button" onClick={() => navigate(adminStudioQaHeadquartersPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        QA HEADQUARTERS →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
    </ExecutivePageShell>
  );

  const renderSimulations = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SIMULATION RESULTS — SUCCESS · FLOWS · ACCESSIBILITY · PERFORMANCE">
        {profile.recentSimulations.map((s) => (
          <ExecutiveSecondaryCard key={s.id} title={`${s.personaLabel.toUpperCase()} · ${s.scenarioLabel.toUpperCase()} · ${s.successRatePct}%`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: QA_SIMULATION_ENGINE_ACCENT, fontWeight: 515 }}>
              {s.status.toUpperCase()} · {s.expectedCompletionMinutes} min · Drop-off risk {s.dropOffRiskPct}%
            </p>
            {s.brokenFlows.length > 0 ? (
              <p className="text-[6px] font-futura mb-1" style={{ color: '#EF4444', lineHeight: 1.45 }}>
                Broken flows: {s.brokenFlows.join(' · ')}
              </p>
            ) : null}
            {s.confusingScreens.length > 0 ? (
              <p className="text-[6px] font-futura mb-1" style={{ color: '#F59E0B', lineHeight: 1.45 }}>
                Confusing: {s.confusingScreens.join(' · ')}
              </p>
            ) : null}
            {s.suggestedImprovements.length > 0 ? (
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                → {s.suggestedImprovements.join(' · ')}
              </p>
            ) : null}
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderGates = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PRODUCTION GATES — NOTHING SIGNIFICANT WITHOUT SIMULATION">
        {profile.productionGates.map((g) => (
          <ExecutiveSecondaryCard key={g.changeType + g.changeLabel} title={`${g.changeLabel.toUpperCase()} · ${g.gateStatus.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: GATE_COLOR[g.gateStatus] ?? QA_SIMULATION_ENGINE_ACCENT, fontWeight: 515 }}>
              {g.simulationsPassed}/{g.simulationsRequired} simulations passed
            </p>
            {g.blockedReason ? (
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {g.blockedReason}
              </p>
            ) : null}
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderPersonas = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SIMULATION PERSONAS — EXPERIENCE AS REAL USERS">
        {['Customer', 'Employee', 'Administrator', 'Expert', 'Marketplace', 'Guest', 'Founder'].map((persona) => (
          <ExecutiveSecondaryCard key={persona} title={persona.toUpperCase()}>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              Simulate {persona.toLowerCase()} journeys — account creation, purchases, onboarding, expert interactions, and automations.
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="qa-simulation-engine" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? QA_SIMULATION_ENGINE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? QA_SIMULATION_ENGINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' ? renderOverview() : null}
      {tab === 'simulations' ? renderSimulations() : null}
      {tab === 'gates' ? renderGates() : null}
      {tab === 'personas' ? renderPersonas() : null}
      <div className="mt-3">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search simulations, gates…"
          className="w-full px-2 py-1 text-[7px] font-futura border mb-2"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'transparent', color: ADMIN_STUDIO_THEME.textPrimary }}
        />
        {searchHits.map((h) => (
          <p key={`${h.type}-${h.id}`} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            <span style={{ color: QA_SIMULATION_ENGINE_ACCENT }}>{h.label}</span> · {h.matchReason}
          </p>
        ))}
      </div>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SYNC QA SIMULATION ENGINE
      </button>
    </div>
  );
}
