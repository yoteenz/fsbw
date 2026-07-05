import { Link } from 'react-router-dom';
import type { StrategyEngineStore, StrategyProfile, StrategyRecord, Initiative, StrategicBet, WorkspaceStrategyId } from '../../../../studio-os-core/strategy-engine/types';
import { STRATEGY_BUILDER_STEPS, STRATEGY_CONNECTED_SYSTEMS, STRATEGY_TYPES } from '../../../../studio-os-core/strategy-engine/constants';
import {
  adminStudioChiefOfStaffPath,
  adminStudioLeadershipDnaPath,
  adminStudioOrganizationalInheritancePath,
} from '../../../../utils/adminStudioRoutes';
import {
  STRATEGY_ENGINE_STYLES,
  SE,
  healthColor,
  seDarkHeader,
  seLabel,
  seLiveDot,
  sePanel,
  seSectionTitle,
  seValue,
} from './strategyEngineTheme';

type Props = {
  store: StrategyEngineStore;
  activeProfile: StrategyProfile | null;
  selectedStrategy: StrategyRecord | null;
  selectedInitiative: Initiative | null;
  workspaceStrategies: StrategyRecord[];
  workspaceInitiatives: Initiative[];
  workspaceBets: StrategicBet[];
  onSelectWorkspace: (id: WorkspaceStrategyId) => void;
  onSelectStrategy: (id: string) => void;
  onSelectInitiative: (id: string) => void;
  onSetBuilderStep: (step: number) => void;
};

export function StrategyEngineHeader() {
  return (
    <>
      <style>{STRATEGY_ENGINE_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...seDarkHeader, borderTop: `3px solid ${SE.slate}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          STRATEGY ENGINE
        </p>
        <p style={{ ...seLabel, color: '#94A3B8' }}>
          <span style={seLiveDot} />
          DEFINES WHY WORK MATTERS · THE GAME EACH COMPANY IS PLAYING
        </p>
        <p style={{ ...seLabel, color: '#CBD5E1', marginTop: 4 }}>
          STUDIO INTELLIGENCE RECOMMENDS · CHIEF OF STAFF PRIORITIZES · NEWSROOM PRODUCES · STRATEGY DEFINES DIRECTION
        </p>
      </header>
    </>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Pick<Props, 'store' | 'onSelectWorkspace'>) {
  return (
    <section className="p-3 mb-3" style={sePanel}>
      <p style={seSectionTitle}>WORKSPACE STRATEGY PROFILE</p>
      <div className="flex flex-wrap gap-1">
        {store.profiles.map((p) => (
          <button
            key={p.workspaceId}
            type="button"
            onClick={() => onSelectWorkspace(p.workspaceId)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.activeWorkspaceId === p.workspaceId ? SE.slate : SE.panelBorder,
              background: store.activeWorkspaceId === p.workspaceId ? 'rgba(51,65,85,0.08)' : 'white',
              color: store.activeWorkspaceId === p.workspaceId ? SE.slate : SE.gray,
            }}
          >
            {p.workspaceLabel}
          </button>
        ))}
      </div>
    </section>
  );
}

export function StrategyBoardPanel({ store, activeProfile }: Pick<Props, 'store' | 'activeProfile'>) {
  const b = store.board;
  if (!activeProfile) return null;
  return (
    <section className="p-3 mb-3" style={{ ...sePanel, borderLeft: `4px solid ${SE.slate}` }}>
      <p style={seSectionTitle}>STRATEGY BOARD · COMMAND CENTER</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p style={{ ...seValue, fontSize: '16px' }}>{b.currentObjective}</p>
          <p style={seLabel}>CURRENT OBJECTIVE</p>
          <p className="mt-2" style={{ ...seValue, fontSize: '12px', color: healthColor(store.health.overallPct) }}>
            {b.northStarMetric}: {b.northStarProgress}
          </p>
          <p style={seLabel}>NORTH STAR METRIC</p>
        </div>
        <div className="text-right">
          <p style={{ ...seValue, fontSize: '18px', color: healthColor(b.strategyHealthPct) }}>{b.strategyHealthPct}%</p>
          <p style={seLabel}>STRATEGY HEALTH</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-3">
        {[
          ['ACTIVE STRATEGIES', b.activeStrategies.length],
          ['ACTIVE INITIATIVES', b.activeInitiatives.length],
          ['ALIGNMENT', `${store.dashboard.alignmentRatePct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: SE.panelBorder }}>
            <p style={{ ...seValue, fontSize: '12px' }}>{val}</p>
            <p style={seLabel}>{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        <div>
          <p style={{ ...seSectionTitle, fontSize: '7px' }}>RECOMMENDED NEXT MOVES</p>
          {b.recommendedNextMoves.map((m, i) => (
            <p key={i} style={{ ...seLabel, fontSize: '6px', color: SE.slate }}>→ {m}</p>
          ))}
        </div>
        <div>
          <p style={{ ...seSectionTitle, fontSize: '7px' }}>KEY RISKS</p>
          {b.keyRisks.map((r, i) => (
            <p key={i} style={{ ...seLabel, fontSize: '6px', color: SE.gold }}>⚠ {r}</p>
          ))}
        </div>
        <div>
          <p style={{ ...seSectionTitle, fontSize: '7px' }}>KEY OPPORTUNITIES</p>
          {b.keyOpportunities.map((o, i) => (
            <p key={i} style={{ ...seLabel, fontSize: '6px', color: SE.green }}>+ {o}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StrategyProfilePanel({ activeProfile }: Pick<Props, 'activeProfile'>) {
  if (!activeProfile) return null;
  const fields: [string, string][] = [
    ['PRIMARY GOAL', activeProfile.primaryGoal],
    ['TIME HORIZON', activeProfile.timeHorizon],
    ['GROWTH STAGE', activeProfile.growthStage.toUpperCase()],
    ['BUSINESS MODEL', activeProfile.businessModel],
    ['TARGET AUDIENCE', activeProfile.targetAudience],
    ['MARKET POSITION', activeProfile.marketPosition],
    ['COMPETITIVE ANGLE', activeProfile.competitiveAngle],
    ['RISK TOLERANCE', activeProfile.riskTolerance.toUpperCase()],
  ];
  return (
    <section className="p-3 mb-3" style={sePanel}>
      <p style={seSectionTitle}>STRATEGY PROFILE</p>
      <p style={{ ...seLabel, fontSize: '6px', color: SE.slate }}>VISION: {activeProfile.vision}</p>
      <p style={{ ...seLabel, fontSize: '6px', marginBottom: 8 }}>MISSION: {activeProfile.mission}</p>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {fields.map(([label, val]) => (
          <div key={label} className="p-1 border" style={{ borderColor: SE.panelBorder }}>
            <p style={{ ...seLabel, fontSize: '5px' }}>{label}</p>
            <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{val}</p>
          </div>
        ))}
      </div>
      {activeProfile.currentConstraints.length > 0 ? (
        <div className="mt-2">
          <p style={{ ...seSectionTitle, fontSize: '7px' }}>CURRENT CONSTRAINTS</p>
          {activeProfile.currentConstraints.map((c, i) => (
            <p key={i} style={{ ...seLabel, fontSize: '6px' }}>· {c}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function StrategyHierarchyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={sePanel}>
      <p style={seSectionTitle}>STRATEGIC HIERARCHY</p>
      <div className="flex flex-col items-center gap-0">
        {store.hierarchyLevels.map((level, i) => (
          <div key={level.level} className="w-full flex flex-col items-center">
            {i > 0 ? <div className="w-px h-2" style={{ background: SE.slate }} /> : null}
            <div
              className="w-full px-2 py-1 text-[7px] font-futura text-center border"
              style={{
                borderColor: level.level === 'strategy' ? SE.slate : SE.panelBorder,
                background: level.level === 'strategy' ? 'rgba(51,65,85,0.06)' : 'white',
                fontWeight: 515,
              }}
            >
              {level.label}
              <p style={{ ...seLabel, fontSize: '5px', margin: '2px 0 0' }}>{level.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StrategyBuilderPanel({ store, onSetBuilderStep }: Pick<Props, 'store' | 'onSetBuilderStep'>) {
  return (
    <section className="p-3 mb-3" style={sePanel}>
      <p style={seSectionTitle}>STRATEGY BUILDER · GUIDED</p>
      <p style={seLabel}>Step {store.builderStep + 1} of {STRATEGY_BUILDER_STEPS.length}: {STRATEGY_BUILDER_STEPS[store.builderStep]?.toUpperCase()}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {STRATEGY_BUILDER_STEPS.map((step, i) => (
          <button
            key={step}
            type="button"
            onClick={() => onSetBuilderStep(i)}
            className="px-1 py-0.5 text-[5px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.builderStep === i ? SE.slate : SE.panelBorder,
              background: store.builderStep <= i ? (store.builderStep === i ? 'rgba(51,65,85,0.1)' : 'white') : 'rgba(22,163,74,0.06)',
              color: store.builderStep < i ? SE.green : store.builderStep === i ? SE.slate : SE.gray,
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </section>
  );
}

export function InitiativesPanel({ workspaceInitiatives, store, onSelectInitiative }: Pick<Props, 'workspaceInitiatives' | 'store' | 'onSelectInitiative'>) {
  return (
    <section className="p-3 mb-3" style={sePanel}>
      <p style={seSectionTitle}>INITIATIVES · STRATEGY → EXECUTION</p>
      {workspaceInitiatives.map((init) => (
        <button
          key={init.id}
          type="button"
          onClick={() => onSelectInitiative(init.id)}
          className="w-full text-left p-2 mb-1 border"
          style={{
            borderColor: store.selectedInitiativeId === init.id ? SE.slate : SE.panelBorder,
            background: store.selectedInitiativeId === init.id ? 'rgba(51,65,85,0.04)' : 'white',
          }}
        >
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{init.name}</p>
            <span className="text-[5px] font-futura" style={{ color: init.status === 'active' ? SE.green : SE.gray }}>{init.status.toUpperCase()}</span>
          </div>
          <p style={{ ...seLabel, fontSize: '5px' }}>{init.objective} · {init.owner}</p>
          <p style={{ ...seLabel, fontSize: '5px' }}>IMPACT: {init.actualImpact || init.expectedImpact}</p>
        </button>
      ))}
    </section>
  );
}

export function StrategicBetsPanel({ workspaceBets }: Pick<Props, 'workspaceBets'>) {
  return (
    <section className="p-3 mb-3" style={sePanel}>
      <p style={seSectionTitle}>STRATEGIC BETS</p>
      {workspaceBets.map((bet) => (
        <div key={bet.id} className="p-2 mb-2 border" style={{ borderColor: SE.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{bet.hypothesis}</p>
          <p style={{ ...seLabel, fontSize: '5px' }}>
            {bet.status.toUpperCase()} · {bet.confidencePct}% CONFIDENCE
          </p>
          {bet.evidenceFor.length > 0 ? (
            <p style={{ ...seLabel, fontSize: '5px', color: SE.green }}>FOR: {bet.evidenceFor[0]}</p>
          ) : null}
        </div>
      ))}
    </section>
  );
}

export function StrategyHealthPanel({ store }: Pick<Props, 'store'>) {
  const h = store.health;
  const dims: [string, number][] = [
    ['CLARITY', h.clarity],
    ['ALIGNMENT', h.alignment],
    ['EXECUTION', h.executionProgress],
    ['KPI MOVEMENT', h.kpiMovement],
    ['RISK LEVEL', h.riskLevel],
    ['RESOURCE FIT', h.resourceFit],
    ['TIMING', h.timing],
    ['CONFIDENCE', h.confidence],
    ['MARKET SIGNAL', h.marketSignal],
    ['LEARNING VELOCITY', h.learningVelocity],
  ];
  return (
    <section className="p-3 mb-3" style={sePanel}>
      <p style={seSectionTitle}>STRATEGY HEALTH · {h.overallPct}%</p>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-5">
        {dims.map(([label, val]) => (
          <div key={label} className="p-1 text-center border" style={{ borderColor: SE.panelBorder }}>
            <p style={{ fontSize: '10px', fontFamily: '"Covered By Your Grace", sans-serif', color: healthColor(val) }}>{val}</p>
            <p style={{ ...seLabel, fontSize: '4px' }}>{label}</p>
          </div>
        ))}
      </div>
      {h.recommendations.map((r, i) => (
        <p key={i} style={{ ...seLabel, fontSize: '6px', color: SE.slate, marginTop: 4 }}>→ {r}</p>
      ))}
    </section>
  );
}

export function AlignmentPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={sePanel}>
      <p style={seSectionTitle}>STRATEGIC ALIGNMENT · BEFORE WORK BEGINS</p>
      <p style={seLabel}>Does this support the active strategy? Yes → proceed · No → flag for review.</p>
      {store.alignmentChecks.map((c) => (
        <div key={c.id} className="py-1 border-b" style={{ borderColor: SE.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{c.workItem}</p>
            <span className="text-[5px] font-futura px-1 border" style={{ borderColor: c.aligned ? SE.green : SE.red, color: c.aligned ? SE.green : SE.red }}>
              {c.aligned ? 'ALIGNED' : 'REVIEW'}
            </span>
          </div>
          <p style={{ ...seLabel, fontSize: '5px' }}>{c.reason}</p>
        </div>
      ))}
    </section>
  );
}

export function IntelligenceSignalsPanel({ store }: Pick<Props, 'store'>) {
  const signals = store.intelligenceSignals.filter((s) => s.workspaceId === store.activeWorkspaceId);
  return (
    <section className="p-3 mb-3" style={sePanel}>
      <p style={seSectionTitle}>STUDIO INTELLIGENCE · STRATEGY MONITORING</p>
      {signals.map((sig) => (
        <div key={sig.id} className="p-2 mb-1 border" style={{ borderColor: sig.severity === 'critical' ? SE.red : sig.severity === 'warning' ? SE.gold : SE.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{sig.signal}</p>
          <p style={{ ...seLabel, fontSize: '5px', color: SE.slate }}>{sig.recommendation} · {sig.confidencePct}%</p>
        </div>
      ))}
    </section>
  );
}

export function CosIntegrationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...sePanel, borderLeft: `4px solid ${SE.gold}` }}>
      <p style={seSectionTitle}>CHIEF OF STAFF · STRATEGY PRIORITIZATION</p>
      {store.cosPrioritization.map((p) => (
        <div key={p.question} className="mb-2">
          <p className="text-[7px] font-futura" style={{ fontWeight: 515, color: SE.gold }}>{p.question}</p>
          <p style={{ ...seLabel, fontSize: '5px' }}>{p.guidance}</p>
        </div>
      ))}
      <Link to={adminStudioChiefOfStaffPath()} style={{ ...seLabel, color: SE.gold, fontFamily: '"Futura PT Medium"', fontSize: '6px' }}>
        → OPEN CHIEF OF STAFF
      </Link>
    </section>
  );
}

export function DecisionJournalPanel({ store }: Pick<Props, 'store'>) {
  const decisions = store.decisions.filter((d) => d.workspaceId === store.activeWorkspaceId);
  return (
    <section className="p-3 mb-3" style={sePanel}>
      <p style={seSectionTitle}>DECISION JOURNAL · STRATEGY DECISIONS</p>
      {decisions.map((d) => (
        <div key={d.id} className="p-2 mb-1 border" style={{ borderColor: SE.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{d.decision}</p>
          <p style={{ ...seLabel, fontSize: '5px' }}>{d.reasoning}</p>
          <p style={{ ...seLabel, fontSize: '5px', color: SE.green }}>OUTCOME: {d.actualOutcome || d.expectedOutcome}</p>
        </div>
      ))}
      <Link to={adminStudioLeadershipDnaPath()} style={{ ...seLabel, color: SE.slate, fontSize: '6px' }}>
        → LEADERSHIP DNA · DECISION FRAMEWORK
      </Link>
    </section>
  );
}

export function StrategyReviewPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={sePanel}>
      <p style={seSectionTitle}>STRATEGY REVIEWS · RECURRING</p>
      {store.reviews.map((rev) => (
        <div key={rev.id} className="py-1 border-b" style={{ borderColor: SE.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{rev.title}</p>
          <p style={{ ...seLabel, fontSize: '5px' }}>{rev.schedule} · CoS moderates · SI prepares</p>
        </div>
      ))}
    </section>
  );
}

export function SimulationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={sePanel}>
      <p style={seSectionTitle}>SIMULATION · BEFORE MAJOR STRATEGY APPROVAL</p>
      {store.simulations.map((sim) => (
        <div key={sim.id} className="p-2 border" style={{ borderColor: SE.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{sim.label}</p>
          <p style={{ ...seLabel, fontSize: '5px' }}>BEST: {sim.bestCase}</p>
          <p style={{ ...seLabel, fontSize: '5px' }}>EXPECTED: {sim.expectedCase}</p>
          <p style={{ ...seLabel, fontSize: '5px' }}>WORST: {sim.worstCase}</p>
          <p style={{ ...seLabel, fontSize: '5px', color: healthColor(sim.successProbabilityPct) }}>
            {sim.successProbabilityPct}% SUCCESS PROBABILITY
          </p>
        </div>
      ))}
    </section>
  );
}

export function StrategyInheritancePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={sePanel}>
      <p style={seSectionTitle}>STRATEGY INHERITANCE</p>
      {store.inheritanceOptions.map((opt) => (
        <div key={opt.id} className="p-2 mb-1 border" style={{ borderColor: SE.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{opt.label}</p>
          <p style={{ ...seLabel, fontSize: '5px' }}>{opt.description}</p>
        </div>
      ))}
      <Link to={adminStudioOrganizationalInheritancePath()} style={{ ...seLabel, color: SE.slate, fontSize: '6px' }}>
        → ORGANIZATIONAL INHERITANCE
      </Link>
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={sePanel}>
      <p style={seSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {STRATEGY_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: SE.panelBorder }}>
            {sys}
          </span>
        ))}
      </div>
    </section>
  );
}

export function ActiveStrategiesPanel({ workspaceStrategies, store, onSelectStrategy }: Pick<Props, 'workspaceStrategies' | 'store' | 'onSelectStrategy'>) {
  return (
    <section className="p-3 mb-3" style={sePanel}>
      <p style={seSectionTitle}>ACTIVE STRATEGIES · {STRATEGY_TYPES.length} TYPES SUPPORTED</p>
      {workspaceStrategies.map((str) => (
        <button
          key={str.id}
          type="button"
          onClick={() => onSelectStrategy(str.id)}
          className="w-full text-left p-2 mb-1 border"
          style={{
            borderColor: store.selectedStrategyId === str.id ? SE.slate : SE.panelBorder,
            background: store.selectedStrategyId === str.id ? 'rgba(51,65,85,0.04)' : 'white',
          }}
        >
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{str.title}</p>
          <p style={{ ...seLabel, fontSize: '5px' }}>{str.type.replace(/-/g, ' ').toUpperCase()} · {str.approach}</p>
        </button>
      ))}
    </section>
  );
}

export function StrategyLineagePanel({ activeProfile, selectedStrategy, selectedInitiative }: Pick<Props, 'activeProfile' | 'selectedStrategy' | 'selectedInitiative'>) {
  if (!activeProfile) return null;
  return (
    <section className="p-3 mb-3" style={sePanel}>
      <p style={seSectionTitle}>STRATEGY LINEAGE</p>
      <div className="flex flex-col items-center gap-0 text-[6px] font-futura" style={{ fontWeight: 515 }}>
        {['VISION', 'MISSION', 'OBJECTIVE', 'STRATEGY', 'INITIATIVE', 'OUTCOME'].map((level, i) => (
          <div key={level} className="w-full flex flex-col items-center">
            {i > 0 ? <div className="w-px h-1" style={{ background: SE.slate }} /> : null}
            <div className="w-full px-2 py-1 border text-center" style={{ borderColor: SE.panelBorder, fontSize: '5px' }}>
              {level}
              {level === 'VISION' ? `: ${activeProfile.vision.slice(0, 40)}…` : null}
              {level === 'MISSION' ? `: ${activeProfile.mission.slice(0, 40)}…` : null}
              {level === 'OBJECTIVE' ? `: ${activeProfile.companyObjective}` : null}
              {level === 'STRATEGY' && selectedStrategy ? `: ${selectedStrategy.title}` : null}
              {level === 'INITIATIVE' && selectedInitiative ? `: ${selectedInitiative.name}` : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
