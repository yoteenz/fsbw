import { Link } from 'react-router-dom';
import type {
  OrganizationalGovernanceSafeguardsStore,
  OrganizationalGovernanceSafeguardsWorkspaceId,
} from '../../../../studio-os-core/organizational-governance-safeguards/types';
import { OGS_CONNECTED_SYSTEMS } from '../../../../studio-os-core/organizational-governance-safeguards/constants';
import {
  adminStudioChiefBrandOfficerPath,
  adminStudioChiefDigitalOfficerPath,
  adminStudioChiefExperienceOfficerPath,
  adminStudioChiefGrowthOfficerPath,
  adminStudioChiefOfStaffPath,
  adminStudioChiefTechnologyOfficerPath,
  adminStudioCompanyGenomePath,
  adminStudioExecutiveCouncilPath,
  adminStudioExecutiveFrameworkPath,
  adminStudioFoundersPromisePath,
  adminStudioLeadershipManifestoFrameworkPath,
  adminStudioOrganizationalAutonomyFrameworkPath,
  adminStudioOrganizationalDelegationEnginePath,
  adminStudioOrganizationalInheritancePath,
  adminStudioOrganizationalIntelligencePath,
  adminStudioOrganizationalSelfImprovementPath,
  adminStudioOrganizationalWorkflowOrchestrationPath,
  adminStudioRelationshipEnginePath,
  adminStudioStudioIntelligencePath,
} from '../../../../utils/adminStudioRoutes';
import {
  ORGANIZATIONAL_GOVERNANCE_SAFEGUARDS_STYLES,
  OGS,
  ogsDarkHeader,
  ogsLabel,
  ogsLiveDot,
  ogsPanel,
  ogsSectionTitle,
  ogsValue,
  riskColor,
  scoreColor,
  statusColor,
} from './organizationalGovernanceSafeguardsTheme';

type Props = {
  store: OrganizationalGovernanceSafeguardsStore;
  onSelectWorkspace: (id: OrganizationalGovernanceSafeguardsWorkspaceId) => void;
};

export function OrganizationalGovernanceSafeguardsHeader() {
  return (
    <>
      <style>{ORGANIZATIONAL_GOVERNANCE_SAFEGUARDS_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...ogsDarkHeader, borderTop: `3px solid ${OGS.slate}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          ORGANIZATIONAL GOVERNANCE & SAFEGUARDS
        </p>
        <p style={{ ...ogsLabel, color: '#94A3B8' }}>
          <span style={ogsLiveDot} />
          CONSTITUTIONAL STEWARDSHIP · V1.0 · INVISIBLE PROTECTION
        </p>
        <p style={{ ...ogsLabel, color: '#CBD5E1', marginTop: 4 }}>
          TRUST PRESERVED · PROGRESS ENABLED CONFIDENTLY
        </p>
      </header>
    </>
  );
}

export function OgsDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={{ ...ogsPanel, background: OGS.missionBg }}>
      <p style={ogsSectionTitle}>GOVERNANCE DASHBOARD · STEWARDSHIP & TRUST</p>
      <p style={{ ...ogsLabel, color: OGS.slate, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...ogsLabel, color: OGS.slate, marginTop: 4 }}>
        {store.companyName} · TRUST {d.organizationalTrustPct}% · RESILIENCE {d.organizationalResiliencePct}%
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['POLICIES', `${d.policyHealthPct}%`],
          ['SAFEGUARDS', `${d.activeSafeguards}`],
          ['PENDING', `${d.pendingApprovals}`],
          ['RISKS', `${d.riskAlerts}`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: OGS.panelBorder }}>
            <p style={{ ...ogsValue, fontSize: '12px' }}>{val}</p>
            <p style={ogsLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function GovernancePhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ogsPanel}>
      <p style={ogsSectionTitle}>GOVERNANCE PHILOSOPHY · WHAT WE REFUSE TO COMPROMISE</p>
      {store.governancePhilosophy.map((line) => (
        <p key={line} style={{ ...ogsLabel, color: OGS.slate }}>· {line}</p>
      ))}
    </section>
  );
}

export function ConstitutionalElementsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ogsPanel}>
      <p style={ogsSectionTitle}>ORGANIZATIONAL CONSTITUTION · HIGHEST GOVERNING DOCUMENT</p>
      {store.constitutionalElements.map((c) => (
        <div key={c.id} className="py-1 border-b" style={{ borderColor: OGS.panelBorder }}>
          <p style={{ ...ogsLabel, fontSize: '6px', color: statusColor(c.status), fontFamily: '"Futura PT Medium"' }}>
            {c.element.toUpperCase()} · {c.status.toUpperCase()}
          </p>
          <p style={ogsLabel}>SOURCE: {c.source}</p>
        </div>
      ))}
      <p style={{ ...ogsLabel, color: OGS.stone, marginTop: 8 }}>EVERY DECISION EVALUATED AGAINST THIS CONSTITUTION</p>
    </section>
  );
}

export function GovernancePoliciesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ogsPanel}>
      <p style={ogsSectionTitle}>GOVERNANCE POLICIES · REUSABLE ORGANIZATIONAL KNOWLEDGE</p>
      {store.governancePolicies.map((p) => (
        <div key={p.id} className="py-2 border-b" style={{ borderColor: OGS.panelBorder }}>
          <p style={{ ...ogsLabel, fontSize: '6px', color: statusColor(p.status), fontFamily: '"Futura PT Medium"' }}>
            {p.domain.toUpperCase()} · {p.status.toUpperCase()}
          </p>
          <div className="ogs-constitution">{p.policy}</div>
        </div>
      ))}
    </section>
  );
}

export function EthicalPrinciplesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ogsPanel}>
      <p style={ogsSectionTitle}>ORGANIZATIONAL ETHICS · DECISION BOUNDARIES</p>
      {store.ethicalPrinciples.map((e) => (
        <div key={e.id} className="py-1">
          <p style={{ ...ogsLabel, fontSize: '6px', color: OGS.slate, fontFamily: '"Futura PT Medium"' }}>{e.category.toUpperCase()}</p>
          <p style={ogsLabel}>{e.principle}</p>
        </div>
      ))}
    </section>
  );
}

export function DecisionSafeguardsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ogsPanel}>
      <p style={ogsSectionTitle}>DECISION SAFEGUARDS · BEFORE EXECUTION</p>
      {store.decisionSafeguards.map((d) => (
        <div key={d.id} className="py-2 border-b" style={{ borderColor: OGS.panelBorder }}>
          <p style={{ ...ogsLabel, fontSize: '6px', color: riskColor(d.riskLevel), fontFamily: '"Futura PT Medium"' }}>
            {d.decision.toUpperCase()} · {d.approvalStatus.toUpperCase()} · RISK {d.riskLevel.toUpperCase()} · CONFIDENCE {d.confidence}%
          </p>
          {d.evaluations.map((ev) => (
            <p key={ev} style={{ ...ogsLabel, color: OGS.slate }}>· {ev}</p>
          ))}
          <p style={{ ...ogsLabel, color: scoreColor(d.confidence), marginTop: 4 }}>ACTION: {d.recommendedAction}</p>
        </div>
      ))}
    </section>
  );
}

export function ExecutiveSafeguardsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ogsPanel}>
      <p style={ogsSectionTitle}>EXECUTIVE SAFEGUARDS · LEADERS AND GUARDIANS</p>
      {store.executiveSafeguards.map((e) => (
        <div key={e.id} className="py-2 border-b" style={{ borderColor: OGS.panelBorder }}>
          <p style={{ ...ogsLabel, fontSize: '6px', color: OGS.slate, fontFamily: '"Futura PT Medium"' }}>
            {e.executive.toUpperCase()} · {e.discipline.toUpperCase()}
          </p>
          <p style={ogsLabel}>PROTECTS: {e.protects}</p>
          <p style={{ ...ogsLabel, color: OGS.green }}>{e.currentStatus}</p>
        </div>
      ))}
    </section>
  );
}

export function RiskIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ogsPanel}>
      <p style={ogsSectionTitle}>RISK INTELLIGENCE · PREVENTATIVE ACTION</p>
      {store.riskIntelligence.map((r) => (
        <div key={r.id} className="py-2 border-b" style={{ borderColor: OGS.panelBorder }}>
          <p style={{ ...ogsLabel, fontSize: '6px', color: riskColor(r.severity), fontFamily: '"Futura PT Medium"' }}>
            {r.riskType.toUpperCase()} · {r.severity.toUpperCase()}
          </p>
          <p style={ogsLabel}>{r.description}</p>
          <p style={{ ...ogsLabel, color: OGS.amber }}>PREVENT: {r.preventativeAction}</p>
        </div>
      ))}
    </section>
  );
}

export function GovernanceSimulationsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ogsPanel}>
      <p style={ogsSectionTitle}>GOVERNANCE SIMULATIONS · UNDERSTAND CONSEQUENCES</p>
      {store.governanceSimulations.map((s) => (
        <div key={s.id} className="py-2 border-b" style={{ borderColor: OGS.panelBorder }}>
          <p style={{ ...ogsLabel, fontSize: '6px', color: scoreColor(s.confidence), fontFamily: '"Futura PT Medium"' }}>
            {s.decision.toUpperCase()} · CONFIDENCE {s.confidence}%
          </p>
          <p style={ogsLabel}>LEGAL: {s.legalImplications}</p>
          <p style={ogsLabel}>ETHICAL: {s.ethicalImplications}</p>
          <p style={ogsLabel}>ORG: {s.organizationalImpact}</p>
          <p style={ogsLabel}>CUSTOMER: {s.customerImpact}</p>
          <p style={ogsLabel}>BRAND: {s.brandImplications}</p>
          <p style={{ ...ogsLabel, color: OGS.stone }}>SCENARIOS: {s.futureScenarios}</p>
        </div>
      ))}
    </section>
  );
}

export function ApprovalFrameworkPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ogsPanel}>
      <p style={ogsSectionTitle}>APPROVAL FRAMEWORK · CONFIGURABLE LEVELS</p>
      {store.approvalLevels.map((a) => (
        <div key={a.id} className="py-2 border-b" style={{ borderColor: OGS.panelBorder }}>
          <p style={{ ...ogsLabel, fontSize: '6px', color: OGS.slate, fontFamily: '"Futura PT Medium"' }}>
            {a.action.toUpperCase()} · {a.level.toUpperCase()}
          </p>
          <p style={{ ...ogsLabel, color: a.autoEscalate ? OGS.amber : OGS.green }}>
            {a.autoEscalate ? 'AUTO-ESCALATE ON HIGH RISK' : 'WITHIN AUTONOMY THRESHOLD'}
          </p>
        </div>
      ))}
    </section>
  );
}

export function GovernanceTransparencyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ogsPanel}>
      <p style={ogsSectionTitle}>ORGANIZATIONAL TRANSPARENCY · NOTHING IS A BLACK BOX</p>
      {store.governanceTransparency.map((t) => (
        <div key={t.id} className="py-2 border-b" style={{ borderColor: OGS.panelBorder }}>
          <p style={{ ...ogsLabel, fontSize: '6px', color: OGS.slate, fontFamily: '"Futura PT Medium"' }}>
            {t.action.toUpperCase()}
          </p>
          <p style={ogsLabel}>REASONING: {t.reasoning}</p>
          <p style={ogsLabel}>EXECUTIVES: {t.executives.join(' · ')}</p>
          <p style={ogsLabel}>PATHWAY: {t.approvalPathway}</p>
          <p style={ogsLabel}>POLICIES: {t.policiesReferenced.join(' · ')}</p>
          <p style={ogsLabel}>EXPECTED: {t.expectedOutcome}</p>
          {t.actualOutcome && <p style={{ ...ogsLabel, color: OGS.green }}>ACTUAL: {t.actualOutcome}</p>}
        </div>
      ))}
    </section>
  );
}

export function ContinuousGovernancePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ogsPanel}>
      <p style={ogsSectionTitle}>CONTINUOUS GOVERNANCE · EVOLVING CONSTITUTION</p>
      {store.continuousGovernance.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: OGS.panelBorder }}>
          <p style={{ ...ogsLabel, fontSize: '6px', color: OGS.slate, fontFamily: '"Futura PT Medium"' }}>
            {c.learningSource.toUpperCase()}
          </p>
          <p style={ogsLabel}>{c.evolution}</p>
          <p style={{ ...ogsLabel, color: c.principlesPreserved ? OGS.green : OGS.red }}>
            PRINCIPLES {c.principlesPreserved ? 'PRESERVED' : 'AT RISK'}
          </p>
        </div>
      ))}
    </section>
  );
}

export function RecommendedNextStepsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ogsPanel}>
      <p style={ogsSectionTitle}>GOVERNANCE RECOMMENDATIONS · NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...ogsLabel, color: OGS.slate }}>· {step}</p>
      ))}
      {store.futureOpportunities.map((opp) => (
        <p key={opp} style={{ ...ogsLabel, color: OGS.stone }}>FUTURE: {opp}</p>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: OrganizationalGovernanceSafeguardsWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={ogsPanel}>
      <p style={ogsSectionTitle}>WORKSPACE · {store.activeWorkspaceId.replace(/-/g, ' ').toUpperCase()}</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-1 py-0.5 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? OGS.slate : OGS.panelBorder,
              color: store.activeWorkspaceId === id ? OGS.slate : OGS.gray,
              background: store.activeWorkspaceId === id ? 'rgba(71,85,105,0.08)' : 'white',
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
    <section className="p-3 mb-3" style={ogsPanel}>
      <p style={ogsSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {OGS_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: OGS.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioOrganizationalSelfImprovementPath()} style={{ ...ogsLabel, color: '#10B981', fontSize: '6px' }}>→ ORGANIZATIONAL SELF-IMPROVEMENT</Link>
        <Link to={adminStudioOrganizationalWorkflowOrchestrationPath()} style={{ ...ogsLabel, color: '#0EA5E9', fontSize: '6px' }}>→ ORGANIZATIONAL WORKFLOW ORCHESTRATION</Link>
        <Link to={adminStudioOrganizationalDelegationEnginePath()} style={{ ...ogsLabel, color: '#7C3AED', fontSize: '6px' }}>→ ORGANIZATIONAL DELEGATION ENGINE</Link>
        <Link to={adminStudioOrganizationalAutonomyFrameworkPath()} style={{ ...ogsLabel, color: '#0D9488', fontSize: '6px' }}>→ ORGANIZATIONAL AUTONOMY FRAMEWORK</Link>
        <Link to={adminStudioOrganizationalIntelligencePath()} style={{ ...ogsLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INTELLIGENCE</Link>
        <Link to={adminStudioExecutiveCouncilPath()} style={{ ...ogsLabel, color: '#B45309', fontSize: '6px' }}>→ EXECUTIVE COUNCIL</Link>
        <Link to={adminStudioExecutiveFrameworkPath()} style={{ ...ogsLabel, color: '#334155', fontSize: '6px' }}>→ EXECUTIVE FRAMEWORK</Link>
        <Link to={adminStudioLeadershipManifestoFrameworkPath()} style={{ ...ogsLabel, color: '#4338CA', fontSize: '6px' }}>→ LEADERSHIP MANIFESTO</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...ogsLabel, color: '#334155', fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioChiefBrandOfficerPath()} style={{ ...ogsLabel, color: '#7C3AED', fontSize: '6px' }}>→ CHIEF BRAND OFFICER</Link>
        <Link to={adminStudioChiefExperienceOfficerPath()} style={{ ...ogsLabel, color: '#0891B2', fontSize: '6px' }}>→ CHIEF EXPERIENCE OFFICER</Link>
        <Link to={adminStudioChiefDigitalOfficerPath()} style={{ ...ogsLabel, color: '#6366F1', fontSize: '6px' }}>→ CHIEF DIGITAL OFFICER</Link>
        <Link to={adminStudioChiefTechnologyOfficerPath()} style={{ ...ogsLabel, color: '#2563EB', fontSize: '6px' }}>→ CHIEF TECHNOLOGY OFFICER</Link>
        <Link to={adminStudioChiefGrowthOfficerPath()} style={{ ...ogsLabel, color: '#059669', fontSize: '6px' }}>→ CHIEF GROWTH OFFICER</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...ogsLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...ogsLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioOrganizationalInheritancePath()} style={{ ...ogsLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INHERITANCE</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...ogsLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...ogsLabel, color: '#6366F1', fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
      </div>
    </section>
  );
}
