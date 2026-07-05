import { Link } from 'react-router-dom';
import type { OrganizationalIntelligenceStore, OrganizationalIntelligenceWorkspaceId } from '../../../../studio-os-core/organizational-intelligence/types';
import { OI_CONNECTED_SYSTEMS } from '../../../../studio-os-core/organizational-intelligence/constants';
import {
  adminStudioBrandArchitectPath,
  adminStudioCampaignEnginePath,
  adminStudioChiefBrandOfficerPath,
  adminStudioChiefDigitalOfficerPath,
  adminStudioChiefExperienceOfficerPath,
  adminStudioChiefGrowthOfficerPath,
  adminStudioChiefOfStaffPath,
  adminStudioChiefTechnologyOfficerPath,
  adminStudioCompanyGenomePath,
  adminStudioCreatorMarketplacePath,
  adminStudioDigitalArchitectPath,
  adminStudioDistributionEnginePath,
  adminStudioExecutiveCouncilPath,
  adminStudioExecutiveFrameworkPath,
  adminStudioExperienceArchitectPath,
  adminStudioFoundersPromisePath,
  adminStudioGrowthArchitectPath,
  adminStudioLeadershipManifestoFrameworkPath,
  adminStudioOrganizationalInheritancePath,
  adminStudioReaderGraphPath,
  adminStudioRelationshipEnginePath,
  adminStudioStrategyEnginePath,
  adminStudioStudioIntelligencePath,
  adminStudioOrganizationalAutonomyFrameworkPath,
} from '../../../../utils/adminStudioRoutes';
import {
  OI,
  oiDarkHeader,
  oiLabel,
  oiLiveDot,
  oiPanel,
  oiSectionTitle,
  oiValue,
  ORGANIZATIONAL_INTELLIGENCE_STYLES,
  periodColor,
  priorityColor,
  scoreColor,
  wisdomLevelColor,
} from './organizationalIntelligenceTheme';

type Props = {
  store: OrganizationalIntelligenceStore;
  onSelectWorkspace: (id: OrganizationalIntelligenceWorkspaceId) => void;
};

export function OrganizationalIntelligenceHeader() {
  return (
    <>
      <style>{ORGANIZATIONAL_INTELLIGENCE_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...oiDarkHeader, borderTop: `3px solid ${OI.indigo}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          ORGANIZATIONAL INTELLIGENCE
        </p>
        <p style={{ ...oiLabel, color: '#94A3B8' }}>
          <span style={oiLiveDot} />
          COLLECTIVE MIND OF THE COMPANY · V1.0 · ACCUMULATED WISDOM
        </p>
        <p style={{ ...oiLabel, color: '#CBD5E1', marginTop: 4 }}>
          OBSERVE · LEARN · CONNECT · REFLECT · PREDICT · COMPOUND
        </p>
      </header>
    </>
  );
}

export function OiDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>ORGANIZATIONAL INTELLIGENCE · COLLECTIVE MIND</p>
      <p style={{ ...oiLabel, color: OI.indigo, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...oiLabel, color: OI.indigo, marginTop: 4 }}>{store.companyName} · WISDOM {d.wisdomPct}%</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['LEARNING', `${d.learningVelocityPct}%`],
          ['MATURITY', `${d.knowledgeMaturityPct}%`],
          ['EVENTS', `${d.eventsObserved}`],
          ['MEMORY', `${d.memoryEntries}`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: OI.panelBorder }}>
            <p style={{ ...oiValue, fontSize: '12px' }}>{val}</p>
            <p style={oiLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function IntelligencePhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>INTELLIGENCE PHILOSOPHY · ORGANIZATIONS LEARN LIKE PEOPLE</p>
      {store.intelligencePhilosophy.map((line) => (
        <p key={line} style={{ ...oiLabel, color: OI.indigo }}>· {line}</p>
      ))}
    </section>
  );
}

export function ContinuousLearningPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>CONTINUOUS ORGANIZATIONAL LEARNING · EVERY EVENT</p>
      {store.continuousLearning.map((e) => (
        <div key={e.id} className="py-2 border-b" style={{ borderColor: OI.panelBorder }}>
          <p style={{ ...oiLabel, fontSize: '6px', color: OI.indigo, fontFamily: '"Futura PT Medium"' }}>
            {e.source.toUpperCase()} · {e.category.toUpperCase()} · {e.capturedAt}
          </p>
          <p style={oiLabel}>{e.event}</p>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalReasoningPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>ORGANIZATIONAL REASONING · TRANSPARENT</p>
      {store.organizationalReasoning.map((r) => (
        <div key={r.id} className="py-2 border-b" style={{ borderColor: OI.panelBorder }}>
          <p style={{ ...oiLabel, fontSize: '6px', color: scoreColor(r.confidence), fontFamily: '"Futura PT Medium"' }}>
            {r.question.toUpperCase()} · {r.confidence}%
          </p>
          <p style={oiLabel}>{r.answer}</p>
        </div>
      ))}
    </section>
  );
}

export function CrossSystemIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>CROSS-SYSTEM INTELLIGENCE · NO SYSTEM ALONE</p>
      {store.crossSystemIntelligence.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: OI.panelBorder }}>
          <p style={{ ...oiLabel, fontSize: '6px', color: OI.indigo, fontFamily: '"Futura PT Medium"' }}>
            {c.fromSystem.toUpperCase()} → {c.toSystem.toUpperCase()}
          </p>
          <p style={oiLabel}>{c.insight}</p>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalCuriosityPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>ORGANIZATIONAL CURIOSITY · BETTER THINKING</p>
      {store.organizationalCuriosity.map((q) => (
        <div key={q.id} className="py-2 border-b" style={{ borderColor: OI.panelBorder }}>
          <p style={{ ...oiLabel, fontSize: '6px', color: priorityColor(q.priority), fontFamily: '"Futura PT Medium"' }}>
            {q.category.toUpperCase()} · {q.priority.toUpperCase()}
          </p>
          <p style={{ ...oiLabel, color: OI.accent, fontStyle: 'italic' }}>{q.question}</p>
        </div>
      ))}
    </section>
  );
}

export function DecisionIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>DECISION INTELLIGENCE · BEFORE MAJOR DECISIONS</p>
      {store.decisionIntelligence.map((d) => (
        <div key={d.id} className="py-2 border-b" style={{ borderColor: OI.panelBorder }}>
          <p style={{ ...oiLabel, fontSize: '6px', color: scoreColor(d.confidence), fontFamily: '"Futura PT Medium"' }}>
            {d.decision.toUpperCase()} · CONFIDENCE {d.confidence}%
          </p>
          <p style={oiLabel}>CONTEXT: {d.historicalContext}</p>
          <p style={oiLabel}>EVIDENCE: {d.evidence}</p>
          <p style={oiLabel}>TRADEOFFS: {d.tradeoffs}</p>
          <p style={{ ...oiLabel, color: OI.indigo }}>LONG-TERM: {d.longTermImpact}</p>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalReflectionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>ORGANIZATIONAL REFLECTION · CULTURE OF LEARNING</p>
      {store.organizationalReflection.map((r) => (
        <div key={r.id} className="py-2 border-b" style={{ borderColor: OI.panelBorder }}>
          <p style={{ ...oiLabel, fontSize: '6px', color: periodColor(r.period), fontFamily: '"Futura PT Medium"' }}>
            {r.period.toUpperCase()} · {r.title.toUpperCase()}
          </p>
          {r.lessons.map((l) => (
            <p key={l} style={{ ...oiLabel, color: OI.indigo }}>LESSON: {l}</p>
          ))}
          {r.breakthroughs.map((b) => (
            <p key={b} style={{ ...oiLabel, color: OI.green }}>BREAKTHROUGH: {b}</p>
          ))}
        </div>
      ))}
    </section>
  );
}

export function OrganizationalWisdomPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...oiPanel, background: OI.mindBg }}>
      <p style={oiSectionTitle}>ORGANIZATIONAL WISDOM · INFORMATION → WISDOM</p>
      {store.organizationalWisdom.map((w) => (
        <div key={w.id} className="py-2 border-b" style={{ borderColor: OI.panelBorder }}>
          <p style={{ ...oiLabel, fontSize: '6px', color: wisdomLevelColor(w.level), fontFamily: '"Futura PT Medium"' }}>
            {w.level.toUpperCase()}
          </p>
          <p style={{ ...oiLabel, color: OI.accent }}>{w.example}</p>
          <p style={oiLabel}>{w.context}</p>
        </div>
      ))}
    </section>
  );
}

export function InstitutionalMemoryPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>INSTITUTIONAL MEMORY · NOTHING FORGOTTEN</p>
      {store.institutionalMemory.map((m) => (
        <div key={m.id} className="py-2 border-b" style={{ borderColor: OI.panelBorder }}>
          <p style={{ ...oiLabel, fontSize: '6px', color: OI.indigo, fontFamily: '"Futura PT Medium"' }}>
            {m.category.toUpperCase()} · {m.preservedAt}
          </p>
          <p style={oiLabel}>{m.memory}</p>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalForecastingPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>ORGANIZATIONAL FORECASTING · HONEST UNCERTAINTY</p>
      {store.organizationalForecasting.map((f) => (
        <div key={f.id} className="py-2 border-b" style={{ borderColor: OI.panelBorder }}>
          <p style={{ ...oiLabel, fontSize: '6px', color: scoreColor(f.confidence), fontFamily: '"Futura PT Medium"' }}>
            {f.dimension.toUpperCase()} · {f.confidence}%
          </p>
          <p style={oiLabel}>{f.prediction}</p>
          <p style={{ ...oiLabel, color: OI.amber }}>UNCERTAINTY: {f.uncertainty}</p>
        </div>
      ))}
    </section>
  );
}

export function IntelligenceCenterPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...oiPanel, background: OI.mindBg }}>
      <p style={oiSectionTitle}>INTELLIGENCE CENTER · ARCHITECT STUDIO</p>
      <p style={{ ...oiLabel, color: OI.indigo, marginBottom: 8 }}>
        CALM INTELLIGENCE · LIVING MIND OF THE ORGANIZATION
      </p>
      {store.intelligenceCenter.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: OI.panelBorder }}>
          <p style={{ ...oiLabel, fontSize: '6px', color: OI.indigo, fontFamily: '"Futura PT Medium"' }}>{c.element.toUpperCase()}</p>
          <p style={oiLabel}>{c.description}</p>
          <p style={{ ...oiLabel, color: OI.violet }}>{c.location}</p>
        </div>
      ))}
    </section>
  );
}

export function ExecutiveIntegrationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>EXECUTIVE INTEGRATION · EVERY EXECUTIVE WISER</p>
      {store.executiveIntegration.map((e) => (
        <div key={e.id} className="py-2 border-b" style={{ borderColor: OI.panelBorder }}>
          <p style={{ ...oiLabel, fontSize: '6px', color: OI.indigo, fontFamily: '"Futura PT Medium"' }}>{e.executive.toUpperCase()}</p>
          <p style={oiLabel}>SUPPORT: {e.support}</p>
          <p style={{ ...oiLabel, color: OI.violet }}>{e.insight}</p>
        </div>
      ))}
    </section>
  );
}

export function FounderIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>FOUNDER INTELLIGENCE · THINK MORE DEEPLY</p>
      {store.founderIntelligence.map((f) => (
        <div key={f.id} className="py-2 border-b" style={{ borderColor: OI.panelBorder }}>
          <p style={{ ...oiLabel, fontSize: '6px', color: OI.indigo, fontFamily: '"Futura PT Medium"', fontStyle: 'italic' }}>
            {f.question}
          </p>
          <p style={oiLabel}>{f.insight}</p>
        </div>
      ))}
    </section>
  );
}

export function RecommendedNextStepsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...oiLabel, color: OI.indigo }}>· {step}</p>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: OrganizationalIntelligenceWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>INTELLIGENCE WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? OI.indigo : OI.panelBorder,
              color: store.activeWorkspaceId === id ? OI.indigo : OI.gray,
              background: store.activeWorkspaceId === id ? 'rgba(79,70,229,0.06)' : 'white',
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
    <section className="p-3 mb-3" style={oiPanel}>
      <p style={oiSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {OI_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: OI.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioExecutiveCouncilPath()} style={{ ...oiLabel, color: '#B45309', fontSize: '6px' }}>→ EXECUTIVE COUNCIL</Link>
        <Link to={adminStudioExecutiveFrameworkPath()} style={{ ...oiLabel, color: '#334155', fontSize: '6px' }}>→ EXECUTIVE FRAMEWORK</Link>
        <Link to={adminStudioLeadershipManifestoFrameworkPath()} style={{ ...oiLabel, color: '#4338CA', fontSize: '6px' }}>→ LEADERSHIP MANIFESTO</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...oiLabel, color: '#334155', fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioChiefBrandOfficerPath()} style={{ ...oiLabel, color: '#7C3AED', fontSize: '6px' }}>→ CHIEF BRAND OFFICER</Link>
        <Link to={adminStudioChiefExperienceOfficerPath()} style={{ ...oiLabel, color: '#0891B2', fontSize: '6px' }}>→ CHIEF EXPERIENCE OFFICER</Link>
        <Link to={adminStudioChiefDigitalOfficerPath()} style={{ ...oiLabel, color: '#6366F1', fontSize: '6px' }}>→ CHIEF DIGITAL OFFICER</Link>
        <Link to={adminStudioChiefTechnologyOfficerPath()} style={{ ...oiLabel, color: '#2563EB', fontSize: '6px' }}>→ CHIEF TECHNOLOGY OFFICER</Link>
        <Link to={adminStudioChiefGrowthOfficerPath()} style={{ ...oiLabel, color: '#059669', fontSize: '6px' }}>→ CHIEF GROWTH OFFICER</Link>
        <Link to={adminStudioBrandArchitectPath()} style={{ ...oiLabel, color: '#9333EA', fontSize: '6px' }}>→ BRAND ARCHITECT</Link>
        <Link to={adminStudioExperienceArchitectPath()} style={{ ...oiLabel, color: '#0891B2', fontSize: '6px' }}>→ EXPERIENCE ARCHITECT</Link>
        <Link to={adminStudioDigitalArchitectPath()} style={{ ...oiLabel, color: '#6366F1', fontSize: '6px' }}>→ DIGITAL ARCHITECT</Link>
        <Link to={adminStudioGrowthArchitectPath()} style={{ ...oiLabel, color: '#059669', fontSize: '6px' }}>→ GROWTH ARCHITECT</Link>
        <Link to={adminStudioStrategyEnginePath()} style={{ ...oiLabel, color: '#334155', fontSize: '6px' }}>→ STRATEGY ENGINE</Link>
        <Link to={adminStudioCampaignEnginePath()} style={{ ...oiLabel, color: '#334155', fontSize: '6px' }}>→ CAMPAIGN ENGINE</Link>
        <Link to={adminStudioDistributionEnginePath()} style={{ ...oiLabel, color: '#334155', fontSize: '6px' }}>→ DISTRIBUTION ENGINE</Link>
        <Link to={adminStudioReaderGraphPath()} style={{ ...oiLabel, color: '#059669', fontSize: '6px' }}>→ READER GRAPH</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...oiLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioCreatorMarketplacePath()} style={{ ...oiLabel, color: '#059669', fontSize: '6px' }}>→ CREATOR MARKETPLACE</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...oiLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...oiLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioOrganizationalInheritancePath()} style={{ ...oiLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INHERITANCE</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...oiLabel, color: '#6366F1', fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
        <Link to={adminStudioOrganizationalAutonomyFrameworkPath()} style={{ ...oiLabel, color: '#0D9488', fontSize: '6px' }}>→ ORGANIZATIONAL AUTONOMY FRAMEWORK</Link>
      </div>
    </section>
  );
}
