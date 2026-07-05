import { Link } from 'react-router-dom';
import type {
  OrganizationalSelfImprovementStore,
  OrganizationalSelfImprovementWorkspaceId,
} from '../../../../studio-os-core/organizational-self-improvement/types';
import { OSI_CONNECTED_SYSTEMS } from '../../../../studio-os-core/organizational-self-improvement/constants';
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
  adminStudioExperienceArchitectPath,
  adminStudioFoundersPromisePath,
  adminStudioGrowthArchitectPath,
  adminStudioOrganizationalAutonomyFrameworkPath,
  adminStudioOrganizationalDelegationEnginePath,
  adminStudioOrganizationalIntelligencePath,
  adminStudioOrganizationalWorkflowOrchestrationPath,
  adminStudioOrganizationalGovernanceSafeguardsPath,
  adminStudioOrganizationalMaturityModelPath,
  adminStudioReaderGraphPath,
  adminStudioRelationshipEnginePath,
  adminStudioStrategyEnginePath,
  adminStudioStudioIntelligencePath,
} from '../../../../utils/adminStudioRoutes';
import {
  domainStatusColor,
  ORGANIZATIONAL_SELF_IMPROVEMENT_STYLES,
  OSI,
  osiDarkHeader,
  osiLabel,
  osiLiveDot,
  osiPanel,
  osiSectionTitle,
  osiValue,
  scoreColor,
  statusColor,
} from './organizationalSelfImprovementTheme';

type Props = {
  store: OrganizationalSelfImprovementStore;
  onSelectWorkspace: (id: OrganizationalSelfImprovementWorkspaceId) => void;
};

export function OrganizationalSelfImprovementHeader() {
  return (
    <>
      <style>{ORGANIZATIONAL_SELF_IMPROVEMENT_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...osiDarkHeader, borderTop: `3px solid ${OSI.emerald}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          ORGANIZATIONAL SELF-IMPROVEMENT
        </p>
        <p style={{ ...osiLabel, color: '#94A3B8' }}>
          <span style={osiLiveDot} />
          CONTINUOUS EVOLUTION · V1.0 · LEARNING COMPOUNDS EVERY DAY
        </p>
        <p style={{ ...osiLabel, color: '#CBD5E1', marginTop: 4 }}>
          THE ORGANIZATION BECOMES BETTER · NOT BECAUSE FOUNDERS WORK HARDER
        </p>
      </header>
    </>
  );
}

export function OsiDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={{ ...osiPanel, background: OSI.missionBg }}>
      <p style={osiSectionTitle}>IMPROVEMENT DASHBOARD · CONTINUOUSLY EVOLVING</p>
      <p style={{ ...osiLabel, color: OSI.emerald, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...osiLabel, color: OSI.emerald, marginTop: 4 }}>
        {store.companyName} · HEALTH {d.organizationalHealthPct}% · MATURITY {d.maturityScorePct}%
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['RECOMMENDED', `${d.recommendedImprovements}`],
          ['ACTIVE', `${d.activeInitiatives}`],
          ['COMPLETE', `${d.completedImprovements}`],
          ['LEARNING', `${d.learningVelocityPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: OSI.panelBorder }}>
            <p style={{ ...osiValue, fontSize: '12px' }}>{val}</p>
            <p style={osiLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ImprovementPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={osiPanel}>
      <p style={osiSectionTitle}>IMPROVEMENT PHILOSOPHY · CONTINUOUS REFINEMENT</p>
      {store.improvementPhilosophy.map((line) => (
        <p key={line} style={{ ...osiLabel, color: OSI.emerald }}>· {line}</p>
      ))}
    </section>
  );
}

export function ReflectionDomainsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={osiPanel}>
      <p style={osiSectionTitle}>CONTINUOUS REFLECTION · ORGANIZATIONAL DOMAINS</p>
      {store.reflectionDomains.map((d) => (
        <div key={d.id} className="py-1 border-b" style={{ borderColor: OSI.panelBorder }}>
          <p style={{ ...osiLabel, fontSize: '6px', color: domainStatusColor(d.status), fontFamily: '"Futura PT Medium"' }}>
            {d.domain.toUpperCase()} · {d.status.toUpperCase()}
          </p>
          <p style={osiLabel}>{d.insight}</p>
        </div>
      ))}
    </section>
  );
}

export function ContinuousReflectionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={osiPanel}>
      <p style={osiSectionTitle}>ORGANIZATIONAL REFLECTION · PROACTIVE RECOMMENDATIONS</p>
      {store.continuousReflection.map((r) => (
        <div key={r.id} className="py-2 border-b" style={{ borderColor: OSI.panelBorder }}>
          <p style={{ ...osiLabel, fontSize: '6px', color: OSI.emerald, fontFamily: '"Futura PT Medium"' }}>
            {r.evaluation.toUpperCase()}
          </p>
          <p style={osiLabel}>STRENGTHS: {r.strengths.join(' · ')}</p>
          <p style={osiLabel}>WEAKNESSES: {r.weaknesses.join(' · ')}</p>
          <p style={osiLabel}>OPPORTUNITIES: {r.opportunities.join(' · ')}</p>
          <p style={osiLabel}>RISKS: {r.risks.join(' · ')}</p>
          <p style={{ ...osiLabel, color: OSI.amber }}>BLIND SPOTS: {r.blindSpots.join(' · ')}</p>
          <div className="osi-improvement">{r.recommendation}</div>
        </div>
      ))}
    </section>
  );
}

export function CrossFunctionalImprovementPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={osiPanel}>
      <p style={osiSectionTitle}>CROSS-FUNCTIONAL IMPROVEMENT · EXECUTIVES TOGETHER</p>
      {store.crossFunctionalImprovements.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: OSI.panelBorder }}>
          <p style={{ ...osiLabel, fontSize: '6px', color: OSI.emerald, fontFamily: '"Futura PT Medium"' }}>
            {c.executive.toUpperCase()} → {c.outsideDiscipline.toUpperCase()}
          </p>
          <div className="osi-improvement">{c.recommendation}</div>
          <p style={{ ...osiLabel, color: OSI.teal, marginTop: 4 }}>{c.rationale}</p>
        </div>
      ))}
    </section>
  );
}

export function ImprovementOpportunitiesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={osiPanel}>
      <p style={osiSectionTitle}>IMPROVEMENT OPPORTUNITIES · WHY NOW · WHY IT MATTERS</p>
      {store.improvementOpportunities.map((o) => (
        <div key={o.id} className="py-2 border-b" style={{ borderColor: OSI.panelBorder }}>
          <p style={{ ...osiLabel, fontSize: '6px', color: statusColor(o.status), fontFamily: '"Futura PT Medium"' }}>
            {o.category.toUpperCase()} · {o.status.toUpperCase()} · CONFIDENCE {o.confidence}%
          </p>
          <div className="osi-improvement">{o.recommendation}</div>
          <p style={osiLabel}>WHY NOW: {o.whyNow}</p>
          <p style={osiLabel}>WHY IT MATTERS: {o.whyItMatters}</p>
          <p style={{ ...osiLabel, color: scoreColor(o.confidence) }}>IMPACT: {o.expectedImpact}</p>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalExperimentsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={osiPanel}>
      <p style={osiSectionTitle}>ORGANIZATIONAL EXPERIMENTS · SAFE PILOTS</p>
      {store.organizationalExperiments.map((e) => (
        <div key={e.id} className="py-2 border-b" style={{ borderColor: OSI.panelBorder }}>
          <p style={{ ...osiLabel, fontSize: '6px', color: statusColor(e.status), fontFamily: '"Futura PT Medium"' }}>
            {e.name.toUpperCase()} · {e.type.toUpperCase()} · {e.status.toUpperCase()}
          </p>
          <p style={osiLabel}>EXECUTIVE: {e.executive} · HYPOTHESIS: {e.hypothesis}</p>
          {e.results && <p style={{ ...osiLabel, color: OSI.green }}>RESULTS: {e.results}</p>}
          {e.lessons.map((l) => (
            <p key={l} style={{ ...osiLabel, color: OSI.emerald }}>LESSON: {l}</p>
          ))}
          <p style={{ ...osiLabel, color: OSI.teal }}>FUTURE: {e.futureRecommendations}</p>
        </div>
      ))}
    </section>
  );
}

export function ImprovementGovernancePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={osiPanel}>
      <p style={osiSectionTitle}>IMPROVEMENT GOVERNANCE · FOUNDER AUTHORITY PRESERVED</p>
      {store.improvementGovernance.map((g) => (
        <div key={g.id} className="py-2 border-b" style={{ borderColor: OSI.panelBorder }}>
          <p style={{ ...osiLabel, fontSize: '6px', color: OSI.emerald, fontFamily: '"Futura PT Medium"' }}>
            {g.domain.toUpperCase()}{g.threshold ? ` · ${g.threshold}` : ''}
          </p>
          <p style={osiLabel}>{g.rule}</p>
        </div>
      ))}
    </section>
  );
}

export function ContinuousLearningPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={osiPanel}>
      <p style={osiSectionTitle}>CONTINUOUS LEARNING · EVERY INITIATIVE STRENGTHENS</p>
      {store.continuousLearning.map((l) => (
        <div key={l.id} className="py-2 border-b" style={{ borderColor: OSI.panelBorder }}>
          <p style={{ ...osiLabel, fontSize: '6px', color: OSI.emerald, fontFamily: '"Futura PT Medium"' }}>
            {l.initiative.toUpperCase()}
          </p>
          <p style={{ ...osiLabel, color: OSI.green }}>SUCCEEDED: {l.succeeded.join(' · ')}</p>
          <p style={{ ...osiLabel, color: OSI.red }}>FAILED: {l.failed.join(' · ')}</p>
          <p style={{ ...osiLabel, color: OSI.amber }}>SURPRISED: {l.surprised.join(' · ')}</p>
          <p style={osiLabel}>STANDARD: {l.becomeStandard.join(' · ')}</p>
          <p style={osiLabel}>NEVER REPEAT: {l.neverRepeat.join(' · ')}</p>
          <p style={osiLabel}>COLLABORATION: {l.collaborationNotes}</p>
          <p style={osiLabel}>RELATIONSHIPS: {l.relationshipEvolution}</p>
          <p style={{ ...osiLabel, color: OSI.teal }}>KNOWLEDGE: {l.knowledgeExpansion}</p>
        </div>
      ))}
    </section>
  );
}

export function MaturityDimensionsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={osiPanel}>
      <p style={osiSectionTitle}>ORGANIZATIONAL MATURITY · EVOLUTION OVER YEARS</p>
      {store.maturityDimensions.map((m) => (
        <div key={m.id} className="py-2 border-b" style={{ borderColor: OSI.panelBorder }}>
          <p style={{ ...osiLabel, fontSize: '6px', color: statusColor(m.trend), fontFamily: '"Futura PT Medium"' }}>
            {m.dimension.toUpperCase()} · LEVEL {m.currentLevel}/5 · {m.trend.toUpperCase()}
          </p>
          <p style={osiLabel}>{m.yearsTrajectory}</p>
        </div>
      ))}
    </section>
  );
}

export function ChiefOfStaffImprovementPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={osiPanel}>
      <p style={osiSectionTitle}>CHIEF OF STAFF · IMPROVEMENT COORDINATION</p>
      {store.chiefOfStaffCoordination.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: OSI.panelBorder }}>
          <p style={{ ...osiLabel, fontSize: '6px', color: statusColor(c.status), fontFamily: '"Futura PT Medium"' }}>
            {c.responsibility.toUpperCase()} · {c.status.toUpperCase()}
          </p>
          <p style={osiLabel}>PRIORITY: {c.priority}</p>
          <p style={osiLabel}>{c.detail}</p>
        </div>
      ))}
    </section>
  );
}

export function RecommendedNextStepsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={osiPanel}>
      <p style={osiSectionTitle}>FUTURE OPPORTUNITIES · RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...osiLabel, color: OSI.emerald }}>· {step}</p>
      ))}
      {store.futureOpportunities.map((opp) => (
        <p key={opp} style={{ ...osiLabel, color: OSI.teal }}>FUTURE: {opp}</p>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: OrganizationalSelfImprovementWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={osiPanel}>
      <p style={osiSectionTitle}>WORKSPACE · {store.activeWorkspaceId.replace(/-/g, ' ').toUpperCase()}</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-1 py-0.5 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? OSI.emerald : OSI.panelBorder,
              color: store.activeWorkspaceId === id ? OSI.emerald : OSI.gray,
              background: store.activeWorkspaceId === id ? 'rgba(16,185,129,0.08)' : 'white',
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
    <section className="p-3 mb-3" style={osiPanel}>
      <p style={osiSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {OSI_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: OSI.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioOrganizationalGovernanceSafeguardsPath()} style={{ ...osiLabel, color: '#475569', fontSize: '6px' }}>→ ORGANIZATIONAL GOVERNANCE & SAFEGUARDS</Link>
        <Link to={adminStudioOrganizationalMaturityModelPath()} style={{ ...osiLabel, color: '#D97706', fontSize: '6px' }}>→ ORGANIZATIONAL MATURITY MODEL</Link>
        <Link to={adminStudioOrganizationalWorkflowOrchestrationPath()} style={{ ...osiLabel, color: '#0EA5E9', fontSize: '6px' }}>→ ORGANIZATIONAL WORKFLOW ORCHESTRATION</Link>
        <Link to={adminStudioOrganizationalDelegationEnginePath()} style={{ ...osiLabel, color: '#7C3AED', fontSize: '6px' }}>→ ORGANIZATIONAL DELEGATION ENGINE</Link>
        <Link to={adminStudioOrganizationalAutonomyFrameworkPath()} style={{ ...osiLabel, color: '#0D9488', fontSize: '6px' }}>→ ORGANIZATIONAL AUTONOMY FRAMEWORK</Link>
        <Link to={adminStudioOrganizationalIntelligencePath()} style={{ ...osiLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INTELLIGENCE</Link>
        <Link to={adminStudioExecutiveCouncilPath()} style={{ ...osiLabel, color: '#B45309', fontSize: '6px' }}>→ EXECUTIVE COUNCIL</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...osiLabel, color: '#334155', fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioChiefBrandOfficerPath()} style={{ ...osiLabel, color: '#7C3AED', fontSize: '6px' }}>→ CHIEF BRAND OFFICER</Link>
        <Link to={adminStudioChiefExperienceOfficerPath()} style={{ ...osiLabel, color: '#0891B2', fontSize: '6px' }}>→ CHIEF EXPERIENCE OFFICER</Link>
        <Link to={adminStudioChiefDigitalOfficerPath()} style={{ ...osiLabel, color: '#6366F1', fontSize: '6px' }}>→ CHIEF DIGITAL OFFICER</Link>
        <Link to={adminStudioChiefTechnologyOfficerPath()} style={{ ...osiLabel, color: '#2563EB', fontSize: '6px' }}>→ CHIEF TECHNOLOGY OFFICER</Link>
        <Link to={adminStudioChiefGrowthOfficerPath()} style={{ ...osiLabel, color: '#059669', fontSize: '6px' }}>→ CHIEF GROWTH OFFICER</Link>
        <Link to={adminStudioBrandArchitectPath()} style={{ ...osiLabel, color: '#9333EA', fontSize: '6px' }}>→ BRAND ARCHITECT</Link>
        <Link to={adminStudioExperienceArchitectPath()} style={{ ...osiLabel, color: '#0891B2', fontSize: '6px' }}>→ EXPERIENCE ARCHITECT</Link>
        <Link to={adminStudioDigitalArchitectPath()} style={{ ...osiLabel, color: '#6366F1', fontSize: '6px' }}>→ DIGITAL ARCHITECT</Link>
        <Link to={adminStudioGrowthArchitectPath()} style={{ ...osiLabel, color: '#059669', fontSize: '6px' }}>→ GROWTH ARCHITECT</Link>
        <Link to={adminStudioStrategyEnginePath()} style={{ ...osiLabel, color: '#334155', fontSize: '6px' }}>→ STRATEGY ENGINE</Link>
        <Link to={adminStudioCampaignEnginePath()} style={{ ...osiLabel, color: '#334155', fontSize: '6px' }}>→ CAMPAIGN ENGINE</Link>
        <Link to={adminStudioDistributionEnginePath()} style={{ ...osiLabel, color: '#334155', fontSize: '6px' }}>→ DISTRIBUTION ENGINE</Link>
        <Link to={adminStudioReaderGraphPath()} style={{ ...osiLabel, color: '#059669', fontSize: '6px' }}>→ READER GRAPH</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...osiLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioCreatorMarketplacePath()} style={{ ...osiLabel, color: '#059669', fontSize: '6px' }}>→ CREATOR MARKETPLACE</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...osiLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...osiLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...osiLabel, color: '#6366F1', fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
      </div>
    </section>
  );
}
