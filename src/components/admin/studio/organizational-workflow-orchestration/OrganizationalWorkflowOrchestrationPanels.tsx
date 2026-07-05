import { Link } from 'react-router-dom';
import type {
  OrganizationalWorkflowOrchestrationStore,
  OrganizationalWorkflowOrchestrationWorkspaceId,
} from '../../../../studio-os-core/organizational-workflow-orchestration/types';
import { OWF_CONNECTED_SYSTEMS } from '../../../../studio-os-core/organizational-workflow-orchestration/constants';
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
  adminStudioOrganizationalSelfImprovementPath,
  adminStudioOrganizationalGovernanceSafeguardsPath,
  adminStudioReaderGraphPath,
  adminStudioRelationshipEnginePath,
  adminStudioStrategyEnginePath,
  adminStudioStudioIntelligencePath,
} from '../../../../utils/adminStudioRoutes';
import {
  ORGANIZATIONAL_WORKFLOW_ORCHESTRATION_STYLES,
  OWF,
  owfDarkHeader,
  owfLabel,
  owfLiveDot,
  owfPanel,
  owfSectionTitle,
  owfValue,
  scoreColor,
  statusColor,
} from './organizationalWorkflowOrchestrationTheme';

type Props = {
  store: OrganizationalWorkflowOrchestrationStore;
  onSelectWorkspace: (id: OrganizationalWorkflowOrchestrationWorkspaceId) => void;
};

export function OrganizationalWorkflowOrchestrationHeader() {
  return (
    <>
      <style>{ORGANIZATIONAL_WORKFLOW_ORCHESTRATION_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...owfDarkHeader, borderTop: `3px solid ${OWF.sky}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          ORGANIZATIONAL WORKFLOW ORCHESTRATION
        </p>
        <p style={{ ...owfLabel, color: '#94A3B8' }}>
          <span style={owfLiveDot} />
          CROSS-FUNCTIONAL CHOREOGRAPHY · V1.0 · LIVING ORGANIZATION AT WORK
        </p>
        <p style={{ ...owfLabel, color: '#CBD5E1', marginTop: 4 }}>
          COORDINATED TEAMS · NOT DISCONNECTED AUTOMATIONS
        </p>
      </header>
    </>
  );
}

export function OwfDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={{ ...owfPanel, background: OWF.missionBg }}>
      <p style={owfSectionTitle}>WORKFLOW DASHBOARD · LIVING ORGANIZATION</p>
      <p style={{ ...owfLabel, color: OWF.sky, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...owfLabel, color: OWF.sky, marginTop: 4 }}>{store.companyName} · CONFIDENCE {d.organizationalConfidencePct}%</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['ACTIVE', `${d.activeWorkflows}`],
          ['COLLAB', `${d.departmentCollaborations}`],
          ['COMPLETE', `${d.completedInitiatives}`],
          ['HEALTH', `${d.workflowHealthPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: OWF.panelBorder }}>
            <p style={{ ...owfValue, fontSize: '12px' }}>{val}</p>
            <p style={owfLabel}>{label}</p>
          </div>
        ))}
      </div>
      <p style={{ ...owfLabel, color: OWF.sky, marginTop: 8 }}>LEARNING OPPORTUNITIES {d.learningOpportunities}</p>
    </section>
  );
}

export function WorkflowPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={owfPanel}>
      <p style={owfSectionTitle}>WORKFLOW PHILOSOPHY · COLLABORATION NOT TASKS</p>
      {store.workflowPhilosophy.map((line) => (
        <p key={line} style={{ ...owfLabel, color: OWF.sky }}>· {line}</p>
      ))}
    </section>
  );
}

export function WorkflowTypesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={owfPanel}>
      <p style={owfSectionTitle}>WORKFLOW TYPES · ORGANIZATIONAL CAPABILITY</p>
      {store.workflowTypes.map((t) => (
        <div key={t.id} className="py-1">
          <p style={{ ...owfLabel, fontSize: '6px', color: OWF.sky, fontFamily: '"Futura PT Medium"' }}>{t.type.toUpperCase()}</p>
          <p style={owfLabel}>{t.description}</p>
        </div>
      ))}
    </section>
  );
}

export function ActiveWorkflowsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={owfPanel}>
      <p style={owfSectionTitle}>ACTIVE WORKFLOWS · COORDINATED EXECUTION</p>
      {store.activeWorkflows.map((w) => (
        <div key={w.id} className="py-2 border-b" style={{ borderColor: OWF.panelBorder }}>
          <p style={{ ...owfLabel, fontSize: '6px', color: statusColor(w.status), fontFamily: '"Futura PT Medium"' }}>
            {w.status.toUpperCase()} · {w.type.toUpperCase()}
          </p>
          <div className="owf-workflow">{w.name}</div>
          <p style={owfLabel}>OBJECTIVE: {w.objective}</p>
          <p style={owfLabel}>OWNER: {w.executiveOwner} · DEPTS: {w.departments.join(' · ')}</p>
        </div>
      ))}
    </section>
  );
}

export function CrossFunctionalCoordinationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={owfPanel}>
      <p style={owfSectionTitle}>CROSS-FUNCTIONAL ORCHESTRATION · SHARED OUTCOMES</p>
      {store.crossFunctionalCoordination.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: OWF.panelBorder }}>
          <p style={{ ...owfLabel, fontSize: '6px', color: OWF.sky, fontFamily: '"Futura PT Medium"' }}>
            {c.workflow.toUpperCase()}
          </p>
          <p style={owfLabel}>EXECUTIVES: {c.executives.join(' · ')}</p>
          <p style={owfLabel}>ARCHITECTS: {c.architects.join(' · ')}</p>
          <p style={owfLabel}>DEPARTMENTS: {c.departments.join(' · ')}</p>
          <p style={owfLabel}>KNOWLEDGE: {c.knowledgeAssets.join(' · ')}</p>
          <p style={owfLabel}>ORDER: {c.executionOrder}</p>
          <p style={{ ...owfLabel, color: OWF.cyan }}>{c.participantBrief}</p>
        </div>
      ))}
    </section>
  );
}

export function WorkflowIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={owfPanel}>
      <p style={owfSectionTitle}>WORKFLOW INTELLIGENCE · WHY ORGANIZED THIS WAY</p>
      {store.workflowIntelligence.map((w) => (
        <div key={w.id} className="py-2 border-b" style={{ borderColor: OWF.panelBorder }}>
          <p style={{ ...owfLabel, fontSize: '6px', color: scoreColor(w.confidence), fontFamily: '"Futura PT Medium"' }}>
            {w.workflow.toUpperCase()} · CONFIDENCE {w.confidence}%
          </p>
          <p style={owfLabel}>STRATEGY: {w.strategy}</p>
          <p style={owfLabel}>RESPONSIBILITIES: {w.departmentResponsibilities}</p>
          <p style={owfLabel}>DEPENDENCIES: {w.dependencies.join(' · ')}</p>
          <p style={owfLabel}>KNOWLEDGE: {w.knowledgeRequirements.join(' · ')}</p>
          <p style={owfLabel}>RELATIONSHIPS: {w.relationshipOpportunities.join(' · ')}</p>
          <p style={owfLabel}>TIMELINE: {w.timeline} · RESOURCES: {w.resourceAllocation}</p>
          <p style={{ ...owfLabel, color: OWF.amber }}>RATIONALE: {w.organizationRationale}</p>
          <p style={{ ...owfLabel, color: OWF.cyan }}>ALTERNATIVES: {w.alternativePaths}</p>
        </div>
      ))}
    </section>
  );
}

export function LivingWorkflowPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={owfPanel}>
      <p style={owfSectionTitle}>LIVING WORKFLOW ENGINE · CONTINUOUS ADAPTATION</p>
      {store.livingWorkflowAdaptations.map((a) => (
        <div key={a.id} className="py-2 border-b" style={{ borderColor: OWF.panelBorder }}>
          <p style={{ ...owfLabel, fontSize: '6px', color: OWF.amber, fontFamily: '"Futura PT Medium"' }}>
            {a.workflow.toUpperCase()} · {a.executive.toUpperCase()}
          </p>
          <p style={owfLabel}>TRIGGER: {a.trigger}</p>
          <p style={owfLabel}>ADAPTATION: {a.adaptation}</p>
          <p style={{ ...owfLabel, color: a.objectivePreserved ? OWF.green : OWF.red }}>
            OBJECTIVE {a.objectivePreserved ? 'PRESERVED' : 'AT RISK'}
          </p>
        </div>
      ))}
    </section>
  );
}

export function ChiefOfStaffCoordinationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={owfPanel}>
      <p style={owfSectionTitle}>CHIEF OF STAFF · CONDUCTOR OF EXECUTION</p>
      {store.chiefOfStaffCoordination.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: OWF.panelBorder }}>
          <p style={{ ...owfLabel, fontSize: '6px', color: statusColor(c.status), fontFamily: '"Futura PT Medium"' }}>
            {c.workflow.toUpperCase()} · {c.responsibility.toUpperCase()} · {c.status.toUpperCase()}
          </p>
          <p style={owfLabel}>{c.detail}</p>
        </div>
      ))}
    </section>
  );
}

export function WorkflowTransparencyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={owfPanel}>
      <p style={owfSectionTitle}>WORKFLOW TRANSPARENCY · FOUNDER VISIBILITY</p>
      {store.workflowTransparency.map((t) => (
        <div key={t.id} className="py-2 border-b" style={{ borderColor: OWF.panelBorder }}>
          <p style={{ ...owfLabel, fontSize: '6px', color: scoreColor(t.confidence), fontFamily: '"Futura PT Medium"' }}>
            {t.workflow.toUpperCase()} · HEALTH {t.organizationalHealthPct}% · CONFIDENCE {t.confidence}%
          </p>
          <p style={owfLabel}>MAP: {t.workflowMap}</p>
          <p style={owfLabel}>PARTICIPATION: {t.departmentParticipation}</p>
          <p style={owfLabel}>OWNERSHIP: {t.executiveOwnership}</p>
          <p style={owfLabel}>STATUS: {t.currentStatus}</p>
          <p style={owfLabel}>RISKS: {t.risks.join(' · ')}</p>
          {t.nextMilestones.map((m) => (
            <p key={m} style={{ ...owfLabel, color: OWF.sky }}>MILESTONE: {m}</p>
          ))}
          <p style={{ ...owfLabel, color: OWF.cyan }}>LEARNING: {t.organizationalLearning}</p>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalAdaptationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={owfPanel}>
      <p style={owfSectionTitle}>ORGANIZATIONAL ADAPTATION · SELF-REORGANIZING WORKFLOWS</p>
      {store.organizationalAdaptations.map((a) => (
        <div key={a.id} className="py-2 border-b" style={{ borderColor: OWF.panelBorder }}>
          <p style={{ ...owfLabel, fontSize: '6px', color: OWF.sky, fontFamily: '"Futura PT Medium"' }}>
            {a.workflow.toUpperCase()} · {a.adaptationType.toUpperCase()}
          </p>
          <p style={owfLabel}>{a.description}</p>
          <p style={{ ...owfLabel, color: a.governanceAllowed ? OWF.green : OWF.amber }}>
            {a.governanceAllowed ? 'GOVERNANCE ALLOWS · NO FOUNDER INTERVENTION' : 'FOUNDER REVIEW REQUIRED'}
          </p>
        </div>
      ))}
    </section>
  );
}

export function WorkflowMemoryPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={owfPanel}>
      <p style={owfSectionTitle}>WORKFLOW MEMORY · ACCUMULATED EXPERIENCE</p>
      {store.workflowMemory.map((m) => (
        <div key={m.id} className="py-2 border-b" style={{ borderColor: OWF.panelBorder }}>
          <p style={{ ...owfLabel, fontSize: '6px', color: statusColor(m.outcome === 'success' ? 'complete' : m.outcome === 'failed' ? 'paused' : 'adapting'), fontFamily: '"Futura PT Medium"' }}>
            {m.workflow.toUpperCase()} · {m.outcome.toUpperCase()}
          </p>
          {m.lessons.map((l) => (
            <p key={l} style={{ ...owfLabel, color: OWF.sky }}>LESSON: {l}</p>
          ))}
          <p style={owfLabel}>BOTTLENECKS: {m.bottlenecks.join(' · ')}</p>
          <p style={owfLabel}>COLLABORATION: {m.collaborationNotes}</p>
          <p style={{ ...owfLabel, color: OWF.cyan }}>CUSTOMER: {m.customerOutcome}</p>
        </div>
      ))}
    </section>
  );
}

export function WorkflowSimulationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={owfPanel}>
      <p style={owfSectionTitle}>WORKFLOW SIMULATIONS · COMPARE STRATEGIES</p>
      {store.workflowSimulations.map((s) => (
        <div key={s.id} className="py-2 border-b" style={{ borderColor: OWF.panelBorder }}>
          <p style={{ ...owfLabel, fontSize: '6px', color: scoreColor(s.confidence), fontFamily: '"Futura PT Medium"' }}>
            {s.workflow.toUpperCase()} · CONFIDENCE {s.confidence}%
          </p>
          <p style={{ ...owfLabel, color: OWF.green }}>BEST: {s.bestCase}</p>
          <p style={{ ...owfLabel, color: OWF.red }}>WORST: {s.worstCase}</p>
          <p style={owfLabel}>RISKS: {s.organizationalRisks.join(' · ')}</p>
          <p style={owfLabel}>CUSTOMER IMPACT: {s.customerImpact}</p>
          <p style={owfLabel}>RESOURCES: {s.resourceUtilization}</p>
          <p style={owfLabel}>TIMELINE: {s.timelineVariation}</p>
          <p style={{ ...owfLabel, color: OWF.cyan }}>ALTERNATIVE: {s.alternativeModel}</p>
          <p style={owfLabel}>EXECUTIVES: {s.executiveParticipation}</p>
        </div>
      ))}
    </section>
  );
}

export function RecommendedOptimizationsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={owfPanel}>
      <p style={owfSectionTitle}>RECOMMENDED OPTIMIZATIONS</p>
      {store.recommendedOptimizations.map((o) => (
        <div key={o.id} className="py-2 border-b" style={{ borderColor: OWF.panelBorder }}>
          <p style={{ ...owfLabel, fontSize: '6px', color: scoreColor(o.confidence), fontFamily: '"Futura PT Medium"' }}>
            {o.workflow.toUpperCase()} · CONFIDENCE {o.confidence}%
          </p>
          <p style={owfLabel}>{o.optimization}</p>
          <p style={{ ...owfLabel, color: OWF.cyan }}>{o.rationale}</p>
        </div>
      ))}
    </section>
  );
}

export function RecommendedNextStepsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={owfPanel}>
      <p style={owfSectionTitle}>RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...owfLabel, color: OWF.sky }}>· {step}</p>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: OrganizationalWorkflowOrchestrationWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={owfPanel}>
      <p style={owfSectionTitle}>WORKSPACE · {store.activeWorkspaceId.replace(/-/g, ' ').toUpperCase()}</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-1 py-0.5 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? OWF.sky : OWF.panelBorder,
              color: store.activeWorkspaceId === id ? OWF.sky : OWF.gray,
              background: store.activeWorkspaceId === id ? 'rgba(14,165,233,0.08)' : 'white',
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
    <section className="p-3 mb-3" style={owfPanel}>
      <p style={owfSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {OWF_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: OWF.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioOrganizationalDelegationEnginePath()} style={{ ...owfLabel, color: '#7C3AED', fontSize: '6px' }}>→ ORGANIZATIONAL DELEGATION ENGINE</Link>
        <Link to={adminStudioOrganizationalSelfImprovementPath()} style={{ ...owfLabel, color: '#10B981', fontSize: '6px' }}>→ ORGANIZATIONAL SELF-IMPROVEMENT</Link>
        <Link to={adminStudioOrganizationalGovernanceSafeguardsPath()} style={{ ...owfLabel, color: '#475569', fontSize: '6px' }}>→ ORGANIZATIONAL GOVERNANCE & SAFEGUARDS</Link>
        <Link to={adminStudioOrganizationalAutonomyFrameworkPath()} style={{ ...owfLabel, color: '#0D9488', fontSize: '6px' }}>→ ORGANIZATIONAL AUTONOMY FRAMEWORK</Link>
        <Link to={adminStudioOrganizationalIntelligencePath()} style={{ ...owfLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INTELLIGENCE</Link>
        <Link to={adminStudioExecutiveCouncilPath()} style={{ ...owfLabel, color: '#B45309', fontSize: '6px' }}>→ EXECUTIVE COUNCIL</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...owfLabel, color: '#334155', fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioChiefBrandOfficerPath()} style={{ ...owfLabel, color: '#7C3AED', fontSize: '6px' }}>→ CHIEF BRAND OFFICER</Link>
        <Link to={adminStudioChiefExperienceOfficerPath()} style={{ ...owfLabel, color: '#0891B2', fontSize: '6px' }}>→ CHIEF EXPERIENCE OFFICER</Link>
        <Link to={adminStudioChiefDigitalOfficerPath()} style={{ ...owfLabel, color: '#6366F1', fontSize: '6px' }}>→ CHIEF DIGITAL OFFICER</Link>
        <Link to={adminStudioChiefTechnologyOfficerPath()} style={{ ...owfLabel, color: '#2563EB', fontSize: '6px' }}>→ CHIEF TECHNOLOGY OFFICER</Link>
        <Link to={adminStudioChiefGrowthOfficerPath()} style={{ ...owfLabel, color: '#059669', fontSize: '6px' }}>→ CHIEF GROWTH OFFICER</Link>
        <Link to={adminStudioBrandArchitectPath()} style={{ ...owfLabel, color: '#9333EA', fontSize: '6px' }}>→ BRAND ARCHITECT</Link>
        <Link to={adminStudioExperienceArchitectPath()} style={{ ...owfLabel, color: '#0891B2', fontSize: '6px' }}>→ EXPERIENCE ARCHITECT</Link>
        <Link to={adminStudioDigitalArchitectPath()} style={{ ...owfLabel, color: '#6366F1', fontSize: '6px' }}>→ DIGITAL ARCHITECT</Link>
        <Link to={adminStudioGrowthArchitectPath()} style={{ ...owfLabel, color: '#059669', fontSize: '6px' }}>→ GROWTH ARCHITECT</Link>
        <Link to={adminStudioStrategyEnginePath()} style={{ ...owfLabel, color: '#334155', fontSize: '6px' }}>→ STRATEGY ENGINE</Link>
        <Link to={adminStudioCampaignEnginePath()} style={{ ...owfLabel, color: '#334155', fontSize: '6px' }}>→ CAMPAIGN ENGINE</Link>
        <Link to={adminStudioDistributionEnginePath()} style={{ ...owfLabel, color: '#334155', fontSize: '6px' }}>→ DISTRIBUTION ENGINE</Link>
        <Link to={adminStudioReaderGraphPath()} style={{ ...owfLabel, color: '#059669', fontSize: '6px' }}>→ READER GRAPH</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...owfLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioCreatorMarketplacePath()} style={{ ...owfLabel, color: '#059669', fontSize: '6px' }}>→ CREATOR MARKETPLACE</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...owfLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...owfLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...owfLabel, color: '#6366F1', fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
      </div>
    </section>
  );
}
