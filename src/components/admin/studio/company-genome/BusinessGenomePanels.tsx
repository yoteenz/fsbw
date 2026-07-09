import type {
  BusinessCompanyGenomeStore,
  BusinessSystem,
  BusinessVisualizationId,
} from '../../../../studio-os-core/company-genome/business-types';
import type { FlowTraversal } from '../../../../studio-os-core/company-genome/business-types';
import { BUSINESS_ENGINE_LABELS, BUSINESS_VISUALIZATIONS } from '../../../../studio-os-core/company-genome/business-constants';
import { CG, cgLabel, cgPanel, cgSectionTitle, cgValue, scoreColor } from './companyGenomeTheme';

type BusinessProps = {
  businessStore: BusinessCompanyGenomeStore;
  dashboard: {
    systemCount: number;
    activeSystems: number;
    dependencyCount: number;
    flowCount: number;
    eventCount: number;
    riskCount: number;
    criticalRisks: number;
    automationCount: number;
    aiOpportunityCount: number;
    avgAutomationScore: number;
    avgAiReadiness: number;
  };
  selectedSystem: BusinessSystem | null;
  visualizationFlows: FlowTraversal[];
  onSetVisualization: (id: BusinessVisualizationId) => void;
  onSelectSystem: (systemId: string | null) => void;
};

export function BusinessGenomeDashboardPanel({ businessStore, dashboard }: BusinessProps) {
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>BUSINESS GENOME · LIVING ORGANISM</p>
      <p style={{ ...cgLabel, color: CG.violet, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>
        {businessStore.company.officialName} · {businessStore.company.industry}
      </p>
      <p style={{ ...cgLabel, fontSize: '5px', marginTop: 4 }}>{businessStore.company.thesis}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['SYSTEMS', dashboard.systemCount],
          ['DEPENDENCIES', dashboard.dependencyCount],
          ['FLOWS', dashboard.flowCount],
          ['EVENTS', dashboard.eventCount],
          ['RISKS', dashboard.riskCount],
          ['CRITICAL RISKS', dashboard.criticalRisks],
          ['AUTOMATION', dashboard.automationCount],
          ['AI OPS', dashboard.aiOpportunityCount],
        ].map(([label, val]) => (
          <div key={label as string} className="p-2 border text-center" style={{ borderColor: CG.panelBorder }}>
            <p style={{ ...cgValue, fontSize: '12px' }}>{val}</p>
            <p style={cgLabel}>{label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-3">
        <span style={{ ...cgLabel, color: scoreColor(dashboard.avgAutomationScore) }}>
          AVG AUTOMATION {dashboard.avgAutomationScore}%
        </span>
        <span style={{ ...cgLabel, color: scoreColor(dashboard.avgAiReadiness) }}>
          AVG AI READINESS {dashboard.avgAiReadiness}%
        </span>
      </div>
    </section>
  );
}

export function BusinessVisualizationSelector({ businessStore, onSetVisualization }: BusinessProps) {
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>VISUALIZATION MODES</p>
      <div className="flex flex-wrap gap-1">
        {BUSINESS_VISUALIZATIONS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onSetVisualization(v.id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: businessStore.activeVisualization === v.id ? CG.violet : CG.panelBorder,
              color: businessStore.activeVisualization === v.id ? CG.violet : CG.gray,
              background: businessStore.activeVisualization === v.id ? 'rgba(147,51,234,0.06)' : 'white',
            }}
          >
            {v.label}
          </button>
        ))}
      </div>
      <p style={{ ...cgLabel, fontSize: '5px', marginTop: 8, color: CG.violet }}>
        {BUSINESS_VISUALIZATIONS.find((v) => v.id === businessStore.activeVisualization)?.description}
      </p>
    </section>
  );
}

export function InteractiveGenomePanel({ businessStore, onSelectSystem, selectedSystem }: BusinessProps) {
  const engines = ['desire', 'product', 'client', 'revenue', 'operating'] as const;
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>INTERACTIVE COMPANY GENOME™</p>
      <p style={{ ...cgLabel, fontSize: '5px', marginBottom: 8 }}>
        Five engines · {businessStore.systems.length} systems · tap to inspect
      </p>
      {engines.map((engine) => {
        const systems = businessStore.systems.filter((s) => s.engineClass === engine);
        if (systems.length === 0) return null;
        return (
          <div key={engine} className="mb-2">
            <p style={{ ...cgLabel, color: CG.violet, fontWeight: 515 }}>{BUSINESS_ENGINE_LABELS[engine]}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {systems.map((s) => (
                <button
                  key={s.systemId}
                  type="button"
                  onClick={() => onSelectSystem(s.systemId)}
                  className="text-[5px] font-futura px-2 py-1 border"
                  style={{
                    borderColor: selectedSystem?.systemId === s.systemId ? CG.violet : CG.panelBorder,
                    background: selectedSystem?.systemId === s.systemId ? 'rgba(147,51,234,0.08)' : 'white',
                  }}
                >
                  {s.officialName}
                </button>
              ))}
            </div>
          </div>
        );
      })}
      {selectedSystem && <BusinessSystemDetailCard system={selectedSystem} />}
    </section>
  );
}

function BusinessSystemDetailCard({ system }: { system: BusinessSystem }) {
  return (
    <div className="p-2 mt-2 border" style={{ borderColor: CG.panelBorder, borderLeft: `3px solid ${CG.violet}` }}>
      <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{system.officialName}</p>
      <p style={{ ...cgLabel, fontSize: '5px' }}>{system.purpose}</p>
      <p style={{ ...cgLabel, fontSize: '5px' }}>OWNER: {system.owner}</p>
      <p style={{ ...cgLabel, fontSize: '5px' }}>
        STATUS: {system.operationalStatus.toUpperCase()} · REV: {system.revenueImpact.toUpperCase()} · CX: {system.customerImpact.toUpperCase()}
      </p>
      <p style={{ ...cgLabel, fontSize: '5px' }}>
        AUTOMATION {system.automationScore}% · AI {system.aiReadiness}% · EXPANSION {system.expansionReadiness}%
      </p>
      {system.dependencies.length > 0 && (
        <p style={{ ...cgLabel, fontSize: '5px' }}>DEPENDS ON: {system.dependencies.join(', ')}</p>
      )}
      {system.dependents.length > 0 && (
        <p style={{ ...cgLabel, fontSize: '5px' }}>DEPENDENTS: {system.dependents.join(', ')}</p>
      )}
    </div>
  );
}

export function DependencyGraphPanel({ businessStore, onSelectSystem }: BusinessProps) {
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>DEPENDENCY GRAPH™</p>
      {businessStore.dependencies.slice(0, 24).map((d) => {
        const from = businessStore.systems.find((s) => s.systemId === d.fromSystemId);
        const to = businessStore.systems.find((s) => s.systemId === d.toSystemId);
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => onSelectSystem(d.toSystemId)}
            className="w-full text-left py-1 border-b"
            style={{ borderColor: CG.panelBorder }}
          >
            <p style={{ ...cgLabel, fontSize: '5px', color: CG.violet }}>
              {from?.officialName ?? d.fromSystemId} → {to?.officialName ?? d.toSystemId} · {d.strength}%
            </p>
            <p style={{ ...cgLabel, fontSize: '5px' }}>{d.description}</p>
          </button>
        );
      })}
      {businessStore.dependencies.length > 24 && (
        <p style={{ ...cgLabel, fontSize: '5px', marginTop: 4 }}>
          + {businessStore.dependencies.length - 24} more dependencies
        </p>
      )}
    </section>
  );
}

function FlowMapPanel({ title, flows }: { title: string; flows: FlowTraversal[] }) {
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>{title}</p>
      {flows.map(({ flow, systems, missingSystemIds }) => (
        <div key={flow.id} className="mb-2 p-2 border" style={{ borderColor: CG.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{flow.name}</p>
          <p style={{ ...cgLabel, fontSize: '5px' }}>{flow.description}</p>
          <div className="flex flex-wrap items-center gap-1 mt-1">
            {flow.steps.map((step, i) => {
              const sys = systems.find((s) => s.systemId === step.systemId);
              return (
                <span key={`${flow.id}-${i}`} className="flex items-center gap-1">
                  {i > 0 && <span style={{ ...cgLabel, color: CG.violet }}>→</span>}
                  <span
                    className="text-[5px] font-futura px-1 py-0.5 border"
                    style={{ borderColor: CG.panelBorder }}
                  >
                    {sys?.officialName ?? step.systemId}
                  </span>
                </span>
              );
            })}
          </div>
          {missingSystemIds.length > 0 && (
            <p style={{ ...cgLabel, fontSize: '5px', color: '#EB1C24' }}>
              Missing: {missingSystemIds.join(', ')}
            </p>
          )}
        </div>
      ))}
      {flows.length === 0 && <p style={cgLabel}>No flows mapped for this visualization.</p>}
    </section>
  );
}

export function RevenueFlowMapPanel(props: BusinessProps) {
  const flows = props.visualizationFlows.filter((f) => f.flow.flowType === 'revenue');
  return <FlowMapPanel title="REVENUE FLOW MAP" flows={flows} />;
}

export function CustomerJourneyGraphPanel(props: BusinessProps) {
  const flows = props.visualizationFlows.filter((f) => f.flow.flowType === 'customer');
  return <FlowMapPanel title="CUSTOMER JOURNEY GRAPH" flows={flows} />;
}

export function FounderWorkflowMapPanel(props: BusinessProps) {
  const flows = props.visualizationFlows.filter((f) => f.flow.flowType === 'founder');
  return <FlowMapPanel title="FOUNDER WORKFLOW MAP" flows={flows} />;
}

export function AutomationOpportunityMapPanel({ businessStore }: BusinessProps) {
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>AUTOMATION OPPORTUNITY MAP</p>
      {businessStore.automationOpportunities.map((o) => (
        <div key={o.id} className="p-2 mb-1 border" style={{ borderColor: CG.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{o.title}</p>
            <span style={{ ...cgValue, fontSize: '10px' }}>{o.priority}</span>
          </div>
          <p style={{ ...cgLabel, fontSize: '5px' }}>{o.automationShape}</p>
          <p style={{ ...cgLabel, fontSize: '5px', color: CG.slate }}>IMPACT: {o.estimatedImpact}</p>
        </div>
      ))}
    </section>
  );
}

export function OperationalRiskMapPanel({ businessStore }: BusinessProps) {
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>OPERATIONAL RISK MAP</p>
      {businessStore.risks.map((r) => (
        <div key={r.id} className="p-2 mb-1 border" style={{ borderColor: CG.panelBorder, borderLeft: `3px solid ${r.severity === 'critical' ? '#EB1C24' : CG.violet}` }}>
          <div className="flex justify-between">
            <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{r.title}</p>
            <span style={{ ...cgLabel, color: r.severity === 'critical' ? '#EB1C24' : CG.violet }}>{r.severity.toUpperCase()}</span>
          </div>
          <p style={{ ...cgLabel, fontSize: '5px' }}>{r.description}</p>
          <p style={{ ...cgLabel, fontSize: '5px', color: CG.slate }}>CONTROL: {r.recommendedControl}</p>
        </div>
      ))}
    </section>
  );
}

export function AiOpportunityMapPanel({ businessStore }: BusinessProps) {
  const horizons = ['near-term', 'mid-term', 'long-term'] as const;
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>AI OPPORTUNITY MAP</p>
      {horizons.map((h) => {
        const items = businessStore.aiOpportunities.filter((o) => o.horizon === h);
        if (items.length === 0) return null;
        return (
          <div key={h} className="mb-2">
            <p style={{ ...cgLabel, color: CG.violet }}>{h.toUpperCase()}</p>
            {items.map((o) => (
              <div key={o.id} className="py-1 border-b" style={{ borderColor: CG.panelBorder }}>
                <div className="flex justify-between">
                  <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{o.title}</p>
                  <span style={{ ...cgLabel, color: scoreColor(o.readinessScore) }}>{o.readinessScore}%</span>
                </div>
                <p style={{ ...cgLabel, fontSize: '5px' }}>{o.description}</p>
              </div>
            ))}
          </div>
        );
      })}
    </section>
  );
}

export function BusinessEventsPanel({ businessStore }: BusinessProps) {
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>BUSINESS EVENT REGISTRY™</p>
      {businessStore.events.map((e) => (
        <div key={e.eventId} className="py-1 border-b" style={{ borderColor: CG.panelBorder }}>
          <p style={{ ...cgLabel, fontSize: '5px', color: CG.violet }}>
            {e.name} · {e.category.toUpperCase()}
          </p>
          <p style={{ ...cgLabel, fontSize: '5px' }}>{e.description}</p>
          <p style={{ ...cgLabel, fontSize: '5px' }}>
            PRODUCER: {e.producerSystemId} · CONSUMERS: {e.consumerSystemIds.join(', ')}
          </p>
        </div>
      ))}
    </section>
  );
}

export function GrowthLoopPanel({ businessStore }: BusinessProps) {
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>GROWTH LOOP</p>
      <p style={{ ...cgLabel, fontSize: '5px', color: CG.violet }}>{businessStore.company.growthLoop}</p>
    </section>
  );
}

export function renderBusinessVisualization(props: BusinessProps) {
  switch (props.businessStore.activeVisualization) {
    case 'dependency-graph':
      return <DependencyGraphPanel {...props} />;
    case 'revenue-flow':
      return <RevenueFlowMapPanel {...props} />;
    case 'customer-journey':
      return <CustomerJourneyGraphPanel {...props} />;
    case 'founder-workflow':
      return <FounderWorkflowMapPanel {...props} />;
    case 'automation-map':
      return <AutomationOpportunityMapPanel {...props} />;
    case 'risk-map':
      return <OperationalRiskMapPanel {...props} />;
    case 'ai-opportunity-map':
      return <AiOpportunityMapPanel {...props} />;
    case 'interactive-genome':
    default:
      return <InteractiveGenomePanel {...props} />;
  }
}
