import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModelOrchestratorState } from '../../../../hooks/useModelOrchestratorState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  BENCHMARK_DIMENSION_LABELS,
  FAILOVER_STEP_LABELS,
  LOCAL_OFFLINE_CAPABILITY_LABELS,
  MODEL_ORCHESTRATOR_ACCENT,
  MODEL_ORCHESTRATOR_PHILOSOPHY,
  ORCHESTRATOR_PROVIDER_LABELS,
  SWAP_PROTECTED_FEATURE_LABELS,
} from '../../../../studio-os-core/model-orchestrator';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type OrchestratorTab = 'overview' | 'routing' | 'swap' | 'failover' | 'benchmark';

const TABS: { id: OrchestratorTab; label: string }[] = [
  { id: 'overview', label: 'ORCHESTRATOR OVERVIEW' },
  { id: 'routing', label: 'MULTI-MODEL ROUTING' },
  { id: 'swap', label: 'AI SWAP ENGINE™' },
  { id: 'failover', label: 'FAILOVER · OFFLINE' },
  { id: 'benchmark', label: 'BENCHMARKING' },
];

export function ModelOrchestratorWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<OrchestratorTab>('overview');
  const { profile, refresh } = useModelOrchestratorState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MODEL ORCHESTRATOR™ LOADING — AI ABSTRACTION · PROVIDERS INTERCHANGEABLE
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 123 · MODEL ORCHESTRATOR™ & AI SWAP ENGINE™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="AI providers are interchangeable engines — Studio OS remains the operating system. Studio Intelligence™ permanent."
        progressPct={profile.orchestratorScore}
        stats={[
          { label: 'ORCHESTRATOR', value: `${profile.orchestratorScore}%` },
          { label: 'ACTIVE', value: profile.activeProvider.toUpperCase() },
          { label: 'FAILOVER', value: `${profile.failoverHealthPct}%` },
          { label: 'PROTECTED', value: `${profile.swapProtectedFeatures.length}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.failoverHealthPct} size={56} label="FAILOVER" accent={MODEL_ORCHESTRATOR_ACCENT} />
        <div>
          {MODEL_ORCHESTRATOR_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="COMMAND DOCK · ORCHESTRATOR STATUS">
        <p className="text-[6px] font-futura" style={{ color: MODEL_ORCHESTRATOR_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockOrchestratorLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="AI SWAP ENGINE™">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
          {profile.aiSwapEngineLine}
        </p>
      </ExecutiveSecondaryCard>
      <button
        type="button"
        onClick={() => navigate(adminStudioMissionControlPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: MODEL_ORCHESTRATOR_ACCENT, color: MODEL_ORCHESTRATOR_ACCENT }}
      >
        MISSION CONTROL →
      </button>
      <button
        type="button"
        onClick={refresh}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        REFRESH ORCHESTRATOR
      </button>
    </ExecutivePageShell>
  );

  const renderRouting = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="MULTI-MODEL ROUTING · FOUNDER NEVER NEEDS TO KNOW WHICH MODEL ANSWERED">
        {profile.taskRoutes.map((r) => (
          <ExecutiveSecondaryCard key={r.taskType} title={`${r.taskLabel.toUpperCase()} → ${r.providerLabel.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: MODEL_ORCHESTRATOR_ACCENT, fontWeight: 515 }}>
              {r.reason}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Cost: {r.costTier} · Speed: {r.speedTier} · Founder-visible: no
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderSwap = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="AI SWAP ENGINE™ · EVERYTHING CONTINUES AFTER PROVIDER SWITCH">
        {profile.swapProtectedFeatures.map((f) => (
          <ExecutiveSecondaryCard key={f.feature} title={SWAP_PROTECTED_FEATURE_LABELS[f.feature].toUpperCase()}>
            <p className="text-[6px] font-futura" style={{ color: MODEL_ORCHESTRATOR_ACCENT, fontWeight: 515 }}>
              {f.operationalAfterSwap ? 'OPERATIONAL AFTER SWAP' : 'VERIFYING'}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {f.notes}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderFailover = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="FAILOVER · LOCAL + OFFLINE MODELS">
        {profile.failoverPlan.map((s) => (
          <ExecutiveSecondaryCard key={s.step} title={`${FAILOVER_STEP_LABELS[s.step].toUpperCase()} · ${s.status.toUpperCase()}`}>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {s.detail}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <ExecutiveSecondaryCard title="LOCAL + OFFLINE CAPABILITIES">
          {profile.localOfflineCapabilities.map((c) => (
            <p key={c.capability} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {LOCAL_OFFLINE_CAPABILITY_LABELS[c.capability]}:{' '}
              <span style={{ color: c.available ? MODEL_ORCHESTRATOR_ACCENT : ADMIN_STUDIO_THEME.textSecondary }}>
                {c.available ? 'available' : 'standby'}
              </span>{' '}
              — {c.detail}
            </p>
          ))}
        </ExecutiveSecondaryCard>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderBenchmark = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="MODEL BENCHMARKING · LEARNS BEST MODEL PER ORGANIZATION">
        {profile.benchmarkScores.map((b) => (
          <ExecutiveSecondaryCard key={b.dimension} title={BENCHMARK_DIMENSION_LABELS[b.dimension].toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: MODEL_ORCHESTRATOR_ACCENT, fontWeight: 515 }}>
              {b.scorePct}% · preferred: {ORCHESTRATOR_PROVIDER_LABELS[b.preferredProvider]}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {b.insight}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="model-orchestrator" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? MODEL_ORCHESTRATOR_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? MODEL_ORCHESTRATOR_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'routing' && renderRouting()}
      {tab === 'swap' && renderSwap()}
      {tab === 'failover' && renderFailover()}
      {tab === 'benchmark' && renderBenchmark()}
    </div>
  );
}
