import { Link } from 'react-router-dom';
import type { OrganizationalDelegationStore, OrganizationalDelegationWorkspaceId } from '../../../../studio-os-core/organizational-delegation-engine/types';
import { ODE_CONNECTED_SYSTEMS } from '../../../../studio-os-core/organizational-delegation-engine/constants';
import {
  adminStudioCampaignEnginePath,
  adminStudioChiefBrandOfficerPath,
  adminStudioChiefDigitalOfficerPath,
  adminStudioChiefExperienceOfficerPath,
  adminStudioChiefGrowthOfficerPath,
  adminStudioChiefOfStaffPath,
  adminStudioChiefTechnologyOfficerPath,
  adminStudioCompanyGenomePath,
  adminStudioCreatorMarketplacePath,
  adminStudioDistributionEnginePath,
  adminStudioExecutiveCouncilPath,
  adminStudioFoundersPromisePath,
  adminStudioOrganizationalAutonomyFrameworkPath,
  adminStudioOrganizationalIntelligencePath,
  adminStudioOrganizationalWorkflowOrchestrationPath,
  adminStudioOrganizationalSelfImprovementPath,
  adminStudioOrganizationalGovernanceSafeguardsPath,
  adminStudioRelationshipEnginePath,
  adminStudioStrategyEnginePath,
  adminStudioStudioIntelligencePath,
} from '../../../../utils/adminStudioRoutes';
import {
  ODE,
  odeDarkHeader,
  odeLabel,
  odeLiveDot,
  odePanel,
  odeSectionTitle,
  odeValue,
  ORGANIZATIONAL_DELEGATION_ENGINE_STYLES,
  scoreColor,
  statusColor,
} from './organizationalDelegationEngineTheme';

type Props = {
  store: OrganizationalDelegationStore;
  onSelectWorkspace: (id: OrganizationalDelegationWorkspaceId) => void;
};

export function OrganizationalDelegationHeader() {
  return (
    <>
      <style>{ORGANIZATIONAL_DELEGATION_ENGINE_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...odeDarkHeader, borderTop: `3px solid ${ODE.violet}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          ORGANIZATIONAL DELEGATION ENGINE
        </p>
        <p style={{ ...odeLabel, color: '#94A3B8' }}>
          <span style={odeLiveDot} />
          OUTCOME-BASED DELEGATION · V1.0 · MANAGEMENT INTO LEADERSHIP
        </p>
        <p style={{ ...odeLabel, color: '#CBD5E1', marginTop: 4 }}>
          FOUNDERS DEFINE OUTCOMES · THE ORGANIZATION DETERMINES HOW
        </p>
      </header>
    </>
  );
}

export function OdeDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={{ ...odePanel, background: ODE.missionBg }}>
      <p style={odeSectionTitle}>DELEGATION DASHBOARD · OUTCOME-ORIENTED</p>
      <p style={{ ...odeLabel, color: ODE.violet, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...odeLabel, color: ODE.violet, marginTop: 4 }}>{store.companyName} · CONFIDENCE {d.organizationalConfidencePct}%</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['ACTIVE', `${d.activeDelegations}`],
          ['COMPLETE', `${d.completedOutcomes}`],
          ['PENDING', `${d.pendingFounderDecisions}`],
          ['HEALTH', `${d.workflowHealthPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: ODE.panelBorder }}>
            <p style={{ ...odeValue, fontSize: '12px' }}>{val}</p>
            <p style={odeLabel}>{label}</p>
          </div>
        ))}
      </div>
      <p style={{ ...odeLabel, color: ODE.violet, marginTop: 8 }}>EXECUTIVE ACCOUNTABILITY {d.executiveAccountabilityPct}%</p>
    </section>
  );
}

export function DelegationPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={odePanel}>
      <p style={odeSectionTitle}>DELEGATION PHILOSOPHY · DEFINE OUTCOMES</p>
      {store.delegationPhilosophy.map((line) => (
        <p key={line} style={{ ...odeLabel, color: ODE.violet }}>· {line}</p>
      ))}
    </section>
  );
}

export function DelegationTypesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={odePanel}>
      <p style={odeSectionTitle}>DELEGATION TYPES · MISSIONS NOT TASKS</p>
      {store.delegationTypes.map((t) => (
        <div key={t.id} className="py-1">
          <p style={{ ...odeLabel, fontSize: '6px', color: ODE.violet, fontFamily: '"Futura PT Medium"' }}>{t.type.toUpperCase()}</p>
          <p style={odeLabel}>{t.description}</p>
        </div>
      ))}
    </section>
  );
}

export function OutcomeDelegationsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={odePanel}>
      <p style={odeSectionTitle}>OUTCOME-BASED DELEGATION · NOT TASKS</p>
      {store.outcomeDelegations.map((o) => (
        <div key={o.id} className="py-2 border-b" style={{ borderColor: ODE.panelBorder }}>
          <p style={{ ...odeLabel, fontSize: '6px', color: statusColor(o.status), fontFamily: '"Futura PT Medium"' }}>
            {o.status.toUpperCase()} · {o.priority.toUpperCase()} PRIORITY
          </p>
          <div className="ode-outcome">{o.outcome}</div>
          <p style={{ ...odeLabel, color: ODE.gray, marginTop: 4 }}>INSTEAD OF: {o.insteadOf}</p>
          {o.successMetrics.map((m) => (
            <p key={m} style={{ ...odeLabel, color: ODE.purple }}>METRIC: {m}</p>
          ))}
        </div>
      ))}
    </section>
  );
}

export function ExecutiveAssignmentPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={odePanel}>
      <p style={odeSectionTitle}>EXECUTIVE ASSIGNMENT · WHY EACH WAS SELECTED</p>
      {store.executiveAssignments.map((a) => (
        <div key={a.id} className="py-2 border-b" style={{ borderColor: ODE.panelBorder }}>
          <p style={{ ...odeLabel, fontSize: '6px', color: ODE.violet, fontFamily: '"Futura PT Medium"' }}>
            OWNER: {a.owner.toUpperCase()}
          </p>
          <p style={odeLabel}>SUPPORTING: {a.supporting.join(' · ')}</p>
          <p style={odeLabel}>ARCHITECTS: {a.architects.join(' · ')}</p>
          <p style={odeLabel}>WORKFLOWS: {a.workflows.join(' · ')}</p>
          <p style={{ ...odeLabel, color: ODE.purple }}>RATIONALE: {a.rationale}</p>
        </div>
      ))}
    </section>
  );
}

export function DelegationPlanningPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={odePanel}>
      <p style={odeSectionTitle}>DELEGATION PLANNING · REVIEW BEFORE EXECUTION</p>
      {store.delegationPlans.map((p) => (
        <div key={p.id} className="py-2 border-b" style={{ borderColor: ODE.panelBorder }}>
          <p style={{ ...odeLabel, fontSize: '6px', color: scoreColor(p.confidence), fontFamily: '"Futura PT Medium"' }}>
            {p.delegation.toUpperCase()} · CONFIDENCE {p.confidence}%
          </p>
          <p style={odeLabel}>STRATEGY: {p.executiveStrategy}</p>
          <p style={odeLabel}>ROADMAP: {p.roadmap}</p>
          <p style={odeLabel}>TIMELINE: {p.timeline}</p>
          <p style={odeLabel}>RISKS: {p.risks.join(' · ')}</p>
          <p style={{ ...odeLabel, color: ODE.amber }}>ALTERNATIVES: {p.alternatives}</p>
        </div>
      ))}
    </section>
  );
}

export function CollaborativeExecutionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={odePanel}>
      <p style={odeSectionTitle}>COLLABORATIVE EXECUTION · EXECUTIVES WORK TOGETHER</p>
      {store.collaborativeExecution.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: ODE.panelBorder }}>
          <p style={{ ...odeLabel, fontSize: '6px', color: statusColor(c.status), fontFamily: '"Futura PT Medium"' }}>
            {c.executive.toUpperCase()} · {c.delegation.toUpperCase()} · {c.status.toUpperCase()}
          </p>
          <p style={odeLabel}>{c.contribution}</p>
        </div>
      ))}
    </section>
  );
}

export function DelegationGovernancePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={odePanel}>
      <p style={odeSectionTitle}>DELEGATION GOVERNANCE · INHERITS OAF RULES</p>
      {store.delegationGovernance.map((g) => (
        <div key={g.id} className="py-2 border-b" style={{ borderColor: ODE.panelBorder }}>
          <p style={{ ...odeLabel, fontSize: '6px', color: ODE.violet, fontFamily: '"Futura PT Medium"' }}>
            {g.domain.toUpperCase()}{g.threshold ? ` · ${g.threshold}` : ''}
          </p>
          <p style={odeLabel}>{g.rule}</p>
        </div>
      ))}
    </section>
  );
}

export function DelegationVisibilityPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={odePanel}>
      <p style={odeSectionTitle}>DELEGATION VISIBILITY · OUTCOMES NOT MICROMANAGEMENT</p>
      {store.delegationVisibility.map((v) => (
        <div key={v.id} className="py-2 border-b" style={{ borderColor: ODE.panelBorder }}>
          <p style={{ ...odeLabel, fontSize: '6px', color: scoreColor(v.progressPct), fontFamily: '"Futura PT Medium"' }}>
            {v.delegation.toUpperCase()} · {v.progressPct}% · {v.owner.toUpperCase()}
          </p>
          <p style={odeLabel}>DEPENDENCIES: {v.dependencies}</p>
          <p style={odeLabel}>MILESTONES: {v.milestones.join(' · ')}</p>
          <p style={odeLabel}>EXPECTED: {v.expectedCompletion} · PENDING APPROVALS: {v.pendingApprovals}</p>
          <p style={{ ...odeLabel, color: ODE.purple }}>IMPACT: {v.organizationalImpact}</p>
        </div>
      ))}
    </section>
  );
}

export function DelegationLearningPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={odePanel}>
      <p style={odeSectionTitle}>ORGANIZATIONAL LEARNING · STRENGTHENS OI</p>
      {store.delegationLearning.map((l) => (
        <div key={l.id} className="py-2 border-b" style={{ borderColor: ODE.panelBorder }}>
          <p style={{ ...odeLabel, fontSize: '6px', color: ODE.violet, fontFamily: '"Futura PT Medium"' }}>{l.delegation.toUpperCase()}</p>
          <p style={odeLabel}>RESULTS: {l.results}</p>
          {l.lessons.map((lesson) => (
            <p key={lesson} style={{ ...odeLabel, color: ODE.green }}>LESSON: {lesson}</p>
          ))}
          <p style={odeLabel}>COLLABORATION: {l.collaboration}</p>
          <p style={{ ...odeLabel, color: ODE.purple }}>FUTURE: {l.futureRecommendations}</p>
        </div>
      ))}
    </section>
  );
}

export function ExecutiveAccountabilityPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={odePanel}>
      <p style={odeSectionTitle}>EXECUTIVE ACCOUNTABILITY · IMPROVE NOT PUNISH</p>
      {store.executiveAccountability.map((a) => (
        <div key={a.id} className="py-2 border-b" style={{ borderColor: ODE.panelBorder }}>
          <p style={{ ...odeLabel, fontSize: '6px', color: ODE.violet, fontFamily: '"Futura PT Medium"' }}>{a.executive.toUpperCase()}</p>
          <p style={odeLabel}>
            QUALITY {a.quality}% · TIMELINESS {a.timeliness}% · COLLABORATION {a.collaboration}% · CX {a.customerImpact}% · KNOWLEDGE {a.knowledgeContribution}%
          </p>
        </div>
      ))}
    </section>
  );
}

export function RecommendedDelegationsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={odePanel}>
      <p style={odeSectionTitle}>RECOMMENDED DELEGATIONS</p>
      {store.recommendedDelegations.map((r) => (
        <div key={r.id} className="py-2 border-b" style={{ borderColor: ODE.panelBorder }}>
          <p style={{ ...odeLabel, fontSize: '6px', color: scoreColor(r.confidence), fontFamily: '"Futura PT Medium"' }}>
            CONFIDENCE {r.confidence}%
          </p>
          <div className="ode-outcome">{r.outcome}</div>
          <p style={odeLabel}>{r.rationale}</p>
        </div>
      ))}
    </section>
  );
}

export function RecommendedNextStepsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={odePanel}>
      <p style={odeSectionTitle}>RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...odeLabel, color: ODE.violet }}>· {step}</p>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: OrganizationalDelegationWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={odePanel}>
      <p style={odeSectionTitle}>DELEGATION WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? ODE.violet : ODE.panelBorder,
              color: store.activeWorkspaceId === id ? ODE.violet : ODE.gray,
              background: store.activeWorkspaceId === id ? 'rgba(124,58,237,0.06)' : 'white',
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
    <section className="p-3 mb-3" style={odePanel}>
      <p style={odeSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {ODE_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: ODE.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioOrganizationalAutonomyFrameworkPath()} style={{ ...odeLabel, color: '#0D9488', fontSize: '6px' }}>→ ORGANIZATIONAL AUTONOMY FRAMEWORK</Link>
        <Link to={adminStudioOrganizationalWorkflowOrchestrationPath()} style={{ ...odeLabel, color: '#0EA5E9', fontSize: '6px' }}>→ ORGANIZATIONAL WORKFLOW ORCHESTRATION</Link>
        <Link to={adminStudioOrganizationalSelfImprovementPath()} style={{ ...odeLabel, color: '#10B981', fontSize: '6px' }}>→ ORGANIZATIONAL SELF-IMPROVEMENT</Link>
        <Link to={adminStudioOrganizationalGovernanceSafeguardsPath()} style={{ ...odeLabel, color: '#475569', fontSize: '6px' }}>→ ORGANIZATIONAL GOVERNANCE & SAFEGUARDS</Link>
        <Link to={adminStudioOrganizationalIntelligencePath()} style={{ ...odeLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INTELLIGENCE</Link>
        <Link to={adminStudioExecutiveCouncilPath()} style={{ ...odeLabel, color: '#B45309', fontSize: '6px' }}>→ EXECUTIVE COUNCIL</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...odeLabel, color: '#334155', fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioChiefBrandOfficerPath()} style={{ ...odeLabel, color: '#7C3AED', fontSize: '6px' }}>→ CHIEF BRAND OFFICER</Link>
        <Link to={adminStudioChiefExperienceOfficerPath()} style={{ ...odeLabel, color: '#0891B2', fontSize: '6px' }}>→ CHIEF EXPERIENCE OFFICER</Link>
        <Link to={adminStudioChiefDigitalOfficerPath()} style={{ ...odeLabel, color: '#6366F1', fontSize: '6px' }}>→ CHIEF DIGITAL OFFICER</Link>
        <Link to={adminStudioChiefTechnologyOfficerPath()} style={{ ...odeLabel, color: '#2563EB', fontSize: '6px' }}>→ CHIEF TECHNOLOGY OFFICER</Link>
        <Link to={adminStudioChiefGrowthOfficerPath()} style={{ ...odeLabel, color: '#059669', fontSize: '6px' }}>→ CHIEF GROWTH OFFICER</Link>
        <Link to={adminStudioStrategyEnginePath()} style={{ ...odeLabel, color: '#334155', fontSize: '6px' }}>→ STRATEGY ENGINE</Link>
        <Link to={adminStudioCampaignEnginePath()} style={{ ...odeLabel, color: '#334155', fontSize: '6px' }}>→ CAMPAIGN ENGINE</Link>
        <Link to={adminStudioDistributionEnginePath()} style={{ ...odeLabel, color: '#334155', fontSize: '6px' }}>→ DISTRIBUTION ENGINE</Link>
        <Link to={adminStudioCreatorMarketplacePath()} style={{ ...odeLabel, color: '#059669', fontSize: '6px' }}>→ CREATOR MARKETPLACE</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...odeLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...odeLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...odeLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...odeLabel, color: '#6366F1', fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
      </div>
    </section>
  );
}
