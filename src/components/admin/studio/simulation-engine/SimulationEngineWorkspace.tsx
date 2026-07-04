import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminStudioSimulationEngineState } from '../../../../hooks/useAdminStudioSimulationEngineState';
import {
  SIMULATION_ENGINE_TABS,
  type SimulationEngineTabId,
} from '../../../../utils/adminStudioSimulationEngineDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  SIMULATION_BUILDER_STEPS,
  SIMULATION_DATA_SOURCES,
  SIMULATION_DEPTH_LABELS,
  SIMULATION_TYPE_LABELS,
  TIMELINE_HORIZON_LABELS,
} from '../../../../studio-os-core/simulation-engine/constants';
import {
  adminStudioStudioIntelligencePath,
  adminStudioGovernancePath,
} from '../../../../utils/adminStudioRoutes';

const panelStyle = {
  background: ADMIN_STUDIO_THEME.panelBg,
  borderColor: ADMIN_STUDIO_THEME.panelBorder,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
      {children}
    </p>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-2 border" style={panelStyle}>
      <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {label}
      </p>
      <p
        className="text-[14px] leading-none mt-1"
        style={{
          fontFamily: '"Covered By Your Grace", sans-serif',
          color: accent ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textPrimary,
        }}
      >
        {value}
      </p>
    </div>
  );
}

export function SimulationEngineWorkspace() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as SimulationEngineTabId | null) ?? 'overview';
  const [tab, setTab] = useState<SimulationEngineTabId>(
    SIMULATION_ENGINE_TABS.some((t) => t.id === initialTab) ? initialTab : 'overview'
  );

  const {
    simulations,
    scenarios,
    riskAnalyses,
    financialSims,
    marketingSims,
    contentSims,
    organizationSims,
    marketplaceSims,
    timelineProjections,
    decisionReports,
    executiveContributions,
    library,
    learningLoops,
    intelligenceRecommendations,
    dashboard,
  } = useAdminStudioSimulationEngineState();

  const selectTab = (id: SimulationEngineTabId) => {
    setTab(id);
    setSearchParams({ tab: id }, { replace: true });
  };

  if (simulations.length === 0) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SIMULATION ENGINE LOADING — BOOTSTRAP IN PROGRESS
      </p>
    );
  }

  const pricingSim = simulations.find((s) => s.id === 'sim-pricing-q3') ?? simulations[0];

  const renderTab = () => {
    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="ACTIVE" value={`${dashboard.activeSimulations}`} accent />
              <MetricCard label="COMPLETED" value={`${dashboard.completedSimulations}`} />
              <MetricCard label="SAVED SCENARIOS" value={`${dashboard.savedScenarios}`} />
              <MetricCard label="HIGHEST CONFIDENCE" value={`${dashboard.highestConfidenceModel}%`} accent />
              <MetricCard label="HISTORICAL COMPARE" value={`${dashboard.historicalComparisons}`} />
              <MetricCard label="RECOMMENDED" value={`${dashboard.recommendedSimulations}`} />
            </div>
            <SectionLabel>NOT PREDICTIONS · EXPLORE TRADEOFFS · FOUNDER DECIDES</SectionLabel>
            <p className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              Safest place to experiment with business decisions virtually before committing real time, money, or risk.
            </p>
            <SectionLabel>INTELLIGENCE-RECOMMENDED SIMULATIONS</SectionLabel>
            {intelligenceRecommendations.map((r) => (
              <p key={r.id} className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, lineHeight: 1.4 }}>
                {r.confidence}% · {SIMULATION_TYPE_LABELS[r.suggestedSimulationType]} · {r.reason}
              </p>
            ))}
          </div>
        );

      case 'builder':
        return (
          <div className="space-y-3">
            <SectionLabel>5-STEP SIMULATION BUILDER</SectionLabel>
            <div className="flex flex-col items-center gap-0">
              {SIMULATION_BUILDER_STEPS.map((step, i) => (
                <div key={step} className="w-full flex flex-col items-center">
                  {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
                  <div className="w-full px-2 py-1 text-[6px] font-futura uppercase text-center border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.6)' }}>
                    {i + 1}. {step.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
            <SectionLabel>DATA SOURCES · NEVER GUARANTEED</SectionLabel>
            {SIMULATION_DATA_SOURCES.map((s) => (
              <p key={s} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {s.toUpperCase()}
              </p>
            ))}
          </div>
        );

      case 'types':
        return (
          <div className="space-y-3">
            <SectionLabel>24+ SIMULATION TYPES</SectionLabel>
            {(Object.keys(SIMULATION_TYPE_LABELS) as Array<keyof typeof SIMULATION_TYPE_LABELS>).map((type) => {
              const count = simulations.filter((s) => s.type === type).length;
              return (
                <p key={type} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: count > 0 ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary }}>
                  {SIMULATION_TYPE_LABELS[type]} · {count} simulations
                </p>
              );
            })}
          </div>
        );

      case 'scenarios':
        return (
          <div className="space-y-3">
            <SectionLabel>SCENARIO COMPARISON · {pricingSim.title}</SectionLabel>
            {scenarios.filter((s) => s.simulationId === pricingSim.id).map((s) => (
              <div key={s.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: s.recommended ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary }}>
                  {s.label} · {s.confidence}% {s.recommended ? '· ✓ RECOMMENDED' : ''}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Revenue {s.projectedRevenue} · Conv {s.projectedConversion} · Retention {s.projectedRetention} · Profit {s.projectedProfit}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Growth {s.projectedGrowth} · CAC {s.customerAcquisition}
                </p>
              </div>
            ))}
          </div>
        );

      case 'risk':
        return (
          <div className="space-y-3">
            <SectionLabel>RISK ANALYSIS · BEST · EXPECTED · WORST</SectionLabel>
            {riskAnalyses.map((r) => (
              <div key={r.simulationId} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  Confidence {r.confidenceScore}% · NOT A GUARANTEE
                </p>
                <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>Best: {r.bestCase}</p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>Expected: {r.expectedCase}</p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>Worst: {r.worstCase}</p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Mitigation: {r.mitigationStrategies.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        );

      case 'financial':
        return (
          <div className="space-y-3">
            <SectionLabel>FINANCIAL SIMULATOR</SectionLabel>
            {financialSims.map((f) => (
              <div key={f.simulationId} className="p-2 border" style={panelStyle}>
                <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Cash flow {f.cashFlow} · Profit {f.profit} · Runway {f.runway} · Burn {f.burnRate}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Rev growth {f.revenueGrowth} · Subs {f.subscriptionGrowth} · Marketplace {f.marketplaceRevenue} · Team {f.teamCosts}
                </p>
              </div>
            ))}
          </div>
        );

      case 'marketing':
        return (
          <div className="space-y-3">
            <SectionLabel>MARKETING SIMULATOR</SectionLabel>
            {marketingSims.map((m) => (
              <div key={m.simulationId} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {m.campaignPerformance}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Reach {m.reach} · Engagement {m.engagement} · Conv {m.conversions} · ROAS {m.roas} · CAC {m.cac}
                </p>
              </div>
            ))}
          </div>
        );

      case 'content':
        return (
          <div className="space-y-3">
            <SectionLabel>CONTENT SIMULATOR · HISTORICAL EXPERIMENTS</SectionLabel>
            {contentSims.map((c) => (
              <div key={c.simulationId} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {c.publishingFrequency} · {c.hookVariation}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Pillars: {c.contentPillars.join(', ')} · Platform {c.platformSelection}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Basis: {c.historicalBasis.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        );

      case 'organization':
        return (
          <div className="space-y-3">
            <SectionLabel>ORGANIZATION SIMULATOR</SectionLabel>
            {organizationSims.map((o) => (
              <div key={o.simulationId} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {o.hiringPlan}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Cost {o.estimatedCost} · Efficiency {o.efficiencyGain} · Speed {o.deliverySpeed} · Complexity {o.operationalComplexity}
                </p>
              </div>
            ))}
          </div>
        );

      case 'marketplace':
        return (
          <div className="space-y-3">
            <SectionLabel>MARKETPLACE SIMULATOR</SectionLabel>
            {marketplaceSims.map((m) => (
              <div key={m.simulationId} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {m.brandDeals}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Impact {m.revenueImpact} · Creators {m.creatorPartnerships}
                </p>
              </div>
            ))}
          </div>
        );

      case 'timeline':
        return (
          <div className="space-y-3">
            <SectionLabel>TIMELINE PROJECTIONS</SectionLabel>
            {(Object.keys(TIMELINE_HORIZON_LABELS) as Array<keyof typeof TIMELINE_HORIZON_LABELS>).map((h) => {
              const proj = timelineProjections.find((t) => t.horizon === h);
              return (
                <div key={h} className="p-2 border" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: proj ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary }}>
                    {TIMELINE_HORIZON_LABELS[h]} {proj ? `· ${proj.confidence}%` : '· —'}
                  </p>
                  {proj ? (
                    <>
                      <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                        Revenue {proj.revenueProjection} · Growth {proj.growthProjection}
                      </p>
                      <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                        {proj.milestones.join(' · ')}
                      </p>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        );

      case 'decision':
        return (
          <div className="space-y-3">
            <SectionLabel>DECISION SUPPORT · EXECUTIVE SUMMARY</SectionLabel>
            {decisionReports.map((d) => (
              <div key={d.simulationId} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {d.confidenceScore}% confidence · FOUNDER DECIDES
                </p>
                <p className="text-[6px] font-futura normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {d.executiveSummary}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Actions: {d.recommendedActions.join(' · ')}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Alternatives: {d.alternativeScenarios.join(' · ')}
                </p>
              </div>
            ))}
            <SectionLabel>EXECUTIVE AI CONTRIBUTIONS</SectionLabel>
            {executiveContributions.map((e) => (
              <p key={`${e.simulationId}-${e.executiveRole}`} className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {e.executiveName} ({e.confidence}%): {e.contribution}
              </p>
            ))}
          </div>
        );

      case 'library':
        return (
          <div className="space-y-3">
            <SectionLabel>SIMULATION LIBRARY · DUPLICATE · FORK · TEMPLATE</SectionLabel>
            {library.map((l) => (
              <div key={l.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {l.title} · v{l.version} {l.templateReady ? '· TEMPLATE' : ''}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {SIMULATION_TYPE_LABELS[l.type]} {l.forkedFrom ? `· Forked from ${l.forkedFrom}` : ''}
                </p>
              </div>
            ))}
            <SectionLabel>ALL SIMULATIONS</SectionLabel>
            {simulations.map((s) => (
              <p key={s.id} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {s.title} · {SIMULATION_DEPTH_LABELS[s.depth]} · {s.status.toUpperCase()} · {s.confidence > 0 ? `${s.confidence}%` : '—'}
              </p>
            ))}
          </div>
        );

      case 'learning':
        return (
          <div className="space-y-3">
            <SectionLabel>LEARNING LOOP · PREDICTED VS ACTUAL</SectionLabel>
            {learningLoops.map((l) => (
              <div key={l.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {l.accuracyPct}% accuracy · +{l.confidenceImprovement} confidence improvement
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Predicted: {l.predictedOutcome}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Actual: {l.actualOutcome}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Wrong assumptions: {l.incorrectAssumptions.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-3">
        {SIMULATION_ENGINE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              fontWeight: 515,
              color: tab === t.id ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
              borderColor: ADMIN_STUDIO_THEME.panelBorder,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {renderTab()}

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => navigate(adminStudioStudioIntelligencePath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← STUDIO INTELLIGENCE
        </button>
        <button
          type="button"
          onClick={() => navigate(adminStudioGovernancePath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          GOVERNANCE →
        </button>
      </div>
    </div>
  );
}
