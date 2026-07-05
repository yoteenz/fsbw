import { Link } from 'react-router-dom';
import type { GrowthArchitectStore, GrowthArchitectWorkspaceId } from '../../../../studio-os-core/growth-architect/types';
import { GROWTH_ARCHITECT_CONNECTED_SYSTEMS } from '../../../../studio-os-core/growth-architect/constants';
import {
  adminStudioCampaignEnginePath,
  adminStudioChiefOfStaffPath,
  adminStudioCreatorMarketplacePath,
  adminStudioDigitalArchitectPath,
  adminStudioDistributionEnginePath,
  adminStudioOrganizationalInheritancePath,
  adminStudioReaderGraphPath,
  adminStudioRelationshipEnginePath,
  adminStudioStrategyEnginePath,
} from '../../../../utils/adminStudioRoutes';
import {
  GA,
  GROWTH_ARCHITECT_STYLES,
  gaDarkHeader,
  gaLabel,
  gaLiveDot,
  gaPanel,
  gaSectionTitle,
  gaValue,
  scoreColor,
} from './growthArchitectTheme';

type Props = {
  store: GrowthArchitectStore;
  onSelectWorkspace: (id: GrowthArchitectWorkspaceId) => void;
};

export function GrowthArchitectHeader() {
  return (
    <>
      <style>{GROWTH_ARCHITECT_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...gaDarkHeader, borderTop: `3px solid ${GA.emerald}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          GROWTH ARCHITECT
        </p>
        <p style={{ ...gaLabel, color: '#94A3B8' }}>
          <span style={gaLiveDot} />
          SUSTAINABLE GROWTH OS · COMPOUND VALUE OVER DECADES · NOT GROWTH AT ANY COST
        </p>
        <p style={{ ...gaLabel, color: '#CBD5E1', marginTop: 4 }}>
          INITIATIVES · GTM · ORCHESTRATION · RELATIONSHIP-DRIVEN GROWTH
        </p>
      </header>
    </>
  );
}

export function GrowthDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={gaPanel}>
      <p style={gaSectionTitle}>GROWTH ARCHITECT · ACTIVE HQ</p>
      <p style={{ ...gaLabel, color: GA.emerald, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...gaLabel, color: GA.emerald, marginTop: 4 }}>
        {store.companyName} · LIFECYCLE: {d.lifecycleStage.replace(/-/g, ' ').toUpperCase()}
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-3">
        {[
          ['GROWTH HEALTH', `${d.growthHealthPct}%`],
          ['ACQUISITION', `${d.acquisitionPct}%`],
          ['RETENTION', `${d.retentionPct}%`],
          ['REVENUE', `${d.revenueGrowthPct}%`],
          ['RELATIONSHIPS', `${d.relationshipGrowthPct}%`],
          ['KNOWLEDGE', `${d.knowledgeGrowthPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: GA.panelBorder }}>
            <p style={{ ...gaValue, fontSize: '12px' }}>{val}</p>
            <p style={gaLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function GrowthPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={gaPanel}>
      <p style={gaSectionTitle}>GROWTH PHILOSOPHY · INTENTIONAL OS</p>
      {store.growthPhilosophy.map((line) => (
        <p key={line} style={{ ...gaLabel, color: GA.emerald }}>· {line}</p>
      ))}
    </section>
  );
}

export function GrowthBlueprintPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={gaPanel}>
      <p style={gaSectionTitle}>GROWTH BLUEPRINT · COMPREHENSIVE PILLARS</p>
      {store.blueprintPillars.map((p) => (
        <div key={p.id} className="p-2 mb-1 border" style={{ borderColor: GA.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{p.pillar}</p>
            <span className="text-[5px] font-futura" style={{ color: p.status === 'mature' ? GA.green : p.status === 'active' ? GA.emerald : GA.gray }}>{p.status.toUpperCase()}</span>
          </div>
          <p style={{ ...gaLabel, fontSize: '5px' }}>{p.strategy}</p>
        </div>
      ))}
    </section>
  );
}

export function GrowthLifecyclePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={gaPanel}>
      <p style={gaSectionTitle}>GROWTH LIFECYCLE · IDEA → LEGACY</p>
      {store.lifecycleStages.map((s, i) => (
        <div key={s.id} className="flex gap-2 py-1 items-start">
          {i > 0 && <span style={{ ...gaLabel, color: GA.gray, fontSize: '8px' }}>↓</span>}
          <div className="flex-1 p-1 border" style={{ borderColor: s.current ? GA.emerald : GA.panelBorder, background: s.current ? 'rgba(5,150,105,0.04)' : 'white' }}>
            <p className="text-[7px] font-futura" style={{ fontWeight: 515, color: s.current ? GA.emerald : GA.accent }}>{s.label}</p>
            <p style={{ ...gaLabel, fontSize: '5px' }}>{s.description}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export function GrowthInitiativesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={gaPanel}>
      <p style={gaSectionTitle}>GROWTH INITIATIVE BUILDER · STRATEGY-LINKED</p>
      {store.initiatives.map((i) => (
        <div key={i.id} className="p-2 mb-1 border" style={{ borderColor: GA.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{i.title}</p>
            <span className="text-[5px] font-futura" style={{ color: i.priority === 'critical' ? GA.red : i.priority === 'high' ? GA.emerald : GA.gray }}>{i.priority.toUpperCase()}</span>
          </div>
          <p style={{ ...gaLabel, fontSize: '5px' }}>{i.type} · {i.status.toUpperCase()}</p>
          <p style={{ ...gaLabel, fontSize: '5px', color: GA.emerald }}>→ {i.strategyLink}</p>
        </div>
      ))}
    </section>
  );
}

export function GoToMarketPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={gaPanel}>
      <p style={gaSectionTitle}>GO-TO-MARKET PLANNER</p>
      {store.gtmPlans.map((g) => (
        <div key={g.id} className="p-2 mb-2 border" style={{ borderColor: GA.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515, color: GA.emerald }}>{g.initiative}</p>
          <p style={{ ...gaLabel, fontSize: '5px' }}>POSITIONING: {g.positioning}</p>
          <p style={{ ...gaLabel, fontSize: '5px' }}>AUDIENCE: {g.targetAudience}</p>
          <p style={{ ...gaLabel, fontSize: '5px' }}>CHANNELS: {g.channelStrategy}</p>
          <p style={{ ...gaLabel, fontSize: '5px' }}>MESSAGING: {g.messaging}</p>
          <p style={{ ...gaSectionTitle, fontSize: '6px', marginTop: 4 }}>LAUNCH SEQUENCE</p>
          {g.launchSequence.map((s) => <p key={s} style={{ ...gaLabel, fontSize: '5px' }}>· {s}</p>)}
          <p style={{ ...gaLabel, fontSize: '5px', marginTop: 4 }}>METRICS: {g.successMetrics.join(' · ')} · RISK {g.riskLevel.toUpperCase()}</p>
        </div>
      ))}
    </section>
  );
}

export function GrowthIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={gaPanel}>
      <p style={gaSectionTitle}>GROWTH INTELLIGENCE · STUDIO INTELLIGENCE FEEDS</p>
      {store.intelligenceAlerts.map((a) => (
        <div key={a.id} className="p-2 mb-1 border" style={{ borderColor: GA.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{a.category}</p>
            <span className="text-[5px] font-futura" style={{ color: a.priority === 'critical' ? GA.red : a.priority === 'high' ? GA.emerald : GA.gray }}>{a.priority.toUpperCase()}</span>
          </div>
          <p style={{ ...gaLabel, fontSize: '5px' }}>{a.signal}</p>
          <p style={{ ...gaLabel, fontSize: '5px', color: GA.emerald }}>→ {a.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function GrowthSimulationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={gaPanel}>
      <p style={gaSectionTitle}>GROWTH SIMULATION · BEFORE LAUNCH</p>
      {store.simulations.map((s) => (
        <div key={s.id} className="p-2 mb-2 border" style={{ borderColor: GA.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515, color: GA.emerald }}>{s.label}</p>
          <div className="grid grid-cols-3 gap-1 mt-1">
            {[
              ['MARKET', s.marketResponsePct],
              ['ADOPTION', s.adoptionPct],
              ['CONVERSION', s.conversionPct],
              ['STRAIN', s.operationalStrainPct],
            ].map(([label, pct]) => (
              <div key={label as string} className="text-center">
                <p style={{ ...gaValue, fontSize: '10px', color: scoreColor(100 - (pct as number)) }}>{pct}%</p>
                <p style={{ ...gaLabel, fontSize: '4px' }}>{label}</p>
              </div>
            ))}
          </div>
          <p style={{ ...gaLabel, fontSize: '5px' }}>REVENUE: {s.revenueImpact} · CONFIDENCE {s.confidencePct}%</p>
          {s.recommendations.map((r) => <p key={r} style={{ ...gaLabel, fontSize: '5px', color: GA.slate }}>→ {r}</p>)}
        </div>
      ))}
    </section>
  );
}

export function GrowthOrchestrationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={gaPanel}>
      <p style={gaSectionTitle}>GROWTH ORCHESTRATION · FOUNDER APPROVES · ORG EXECUTES</p>
      {store.orchestration.map((o) => (
        <div key={o.id} className="flex justify-between py-1 border-b" style={{ borderColor: GA.panelBorder }}>
          <div>
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{o.system}</p>
            <p style={{ ...gaLabel, fontSize: '5px' }}>{o.role}</p>
          </div>
          <span className="text-[5px] font-futura" style={{ color: o.status === 'connected' ? GA.green : GA.emerald }}>{o.status.toUpperCase()}</span>
        </div>
      ))}
    </section>
  );
}

export function GrowthExperimentsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={gaPanel}>
      <p style={gaSectionTitle}>GROWTH EXPERIMENTS · KG LEARNING</p>
      {store.experiments.map((e) => (
        <div key={e.id} className="flex justify-between py-1 border-b" style={{ borderColor: GA.panelBorder }}>
          <div>
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{e.type.toUpperCase()}</p>
            <p style={{ ...gaLabel, fontSize: '5px' }}>{e.hypothesis}</p>
          </div>
          <div className="text-right">
            <span className="text-[5px] font-futura" style={{ color: e.status === 'completed' ? GA.green : GA.emerald }}>{e.status.toUpperCase()}</span>
            {e.learningRecorded && <p style={{ ...gaLabel, fontSize: '4px', color: GA.emerald }}>KG ✓</p>}
          </div>
        </div>
      ))}
    </section>
  );
}

export function MarketIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={gaPanel}>
      <p style={gaSectionTitle}>MARKET INTELLIGENCE · PROACTIVE ADJUSTMENTS</p>
      {store.marketIntelligence.map((m) => (
        <div key={m.id} className="p-2 mb-1 border" style={{ borderColor: GA.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{m.category}</p>
            <span className="text-[5px] font-futura" style={{ color: m.urgency === 'critical' ? GA.red : m.urgency === 'act' ? GA.emerald : GA.gray }}>{m.urgency.toUpperCase()}</span>
          </div>
          <p style={{ ...gaLabel, fontSize: '5px' }}>{m.signal}</p>
          <p style={{ ...gaLabel, fontSize: '5px', color: GA.slate }}>→ {m.implication}</p>
        </div>
      ))}
    </section>
  );
}

export function ExpansionArchitectPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={gaPanel}>
      <p style={gaSectionTitle}>EXPANSION ARCHITECT · SUSTAINABLE OPPORTUNITIES</p>
      {store.expansionOpportunities.map((e) => (
        <div key={e.id} className="p-2 mb-1 border" style={{ borderColor: GA.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{e.type}</p>
            <span style={{ ...gaValue, fontSize: '10px' }}>{e.confidencePct}%</span>
          </div>
          <p style={{ ...gaLabel, fontSize: '5px' }}>{e.opportunity}</p>
          <p style={{ ...gaLabel, fontSize: '5px', color: GA.emerald }}>SUSTAINABILITY: {e.sustainability}</p>
        </div>
      ))}
      <p style={{ ...gaSectionTitle, marginTop: 8 }}>FUTURE OPPORTUNITIES</p>
      {store.futureOpportunities.map((o) => (
        <p key={o} style={{ ...gaLabel, fontSize: '5px', color: GA.emerald }}>· {o}</p>
      ))}
    </section>
  );
}

export function LaunchCalendarPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={gaPanel}>
      <p style={gaSectionTitle}>LAUNCH CALENDAR · INITIATIVE PIPELINE</p>
      {store.launchCalendar.map((c) => (
        <div key={c.id} className="flex gap-2 py-1 border-b" style={{ borderColor: GA.panelBorder }}>
          <span style={{ ...gaLabel, color: GA.emerald, minWidth: 48 }}>{c.date}</span>
          <span style={{ ...gaLabel, fontSize: '5px' }}>{c.label}</span>
          <span className="text-[4px] font-futura ml-auto" style={{ color: GA.gray }}>{c.type.toUpperCase()}</span>
        </div>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: GrowthArchitectWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os'];
  return (
    <section className="p-3 mb-3" style={gaPanel}>
      <p style={gaSectionTitle}>GROWTH WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? GA.emerald : GA.panelBorder,
              color: store.activeWorkspaceId === id ? GA.emerald : GA.gray,
              background: store.activeWorkspaceId === id ? 'rgba(5,150,105,0.04)' : 'white',
            }}
          >
            {id.replace(/-/g, ' ').toUpperCase()}
          </button>
        ))}
      </div>
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={gaPanel}>
      <p style={gaSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {GROWTH_ARCHITECT_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: GA.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioDigitalArchitectPath()} style={{ ...gaLabel, color: '#6366F1', fontSize: '6px' }}>→ DIGITAL ARCHITECT</Link>
        <Link to={adminStudioStrategyEnginePath()} style={{ ...gaLabel, color: GA.slate, fontSize: '6px' }}>→ STRATEGY ENGINE</Link>
        <Link to={adminStudioCampaignEnginePath()} style={{ ...gaLabel, color: GA.slate, fontSize: '6px' }}>→ CAMPAIGN ENGINE</Link>
        <Link to={adminStudioDistributionEnginePath()} style={{ ...gaLabel, color: '#2563EB', fontSize: '6px' }}>→ DISTRIBUTION ENGINE</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...gaLabel, color: GA.emerald, fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioReaderGraphPath()} style={{ ...gaLabel, color: '#7C3AED', fontSize: '6px' }}>→ READER GRAPH</Link>
        <Link to={adminStudioCreatorMarketplacePath()} style={{ ...gaLabel, color: '#2563EB', fontSize: '6px' }}>→ CREATOR MARKETPLACE</Link>
        <Link to={adminStudioOrganizationalInheritancePath()} style={{ ...gaLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INHERITANCE</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...gaLabel, color: GA.accent, fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
      </div>
    </section>
  );
}
