import { Link } from 'react-router-dom';
import type {
  OrganizationalMaturityModelStore,
  OrganizationalMaturityModelWorkspaceId,
} from '../../../../studio-os-core/organizational-maturity-model/types';
import { OMM_CONNECTED_SYSTEMS } from '../../../../studio-os-core/organizational-maturity-model/constants';
import {
  adminStudioBrandArchitectPath,
  adminStudioCampusEvolutionEnginePath,
  adminStudioChiefBrandOfficerPath,
  adminStudioChiefDigitalOfficerPath,
  adminStudioChiefExperienceOfficerPath,
  adminStudioChiefGrowthOfficerPath,
  adminStudioChiefOfStaffPath,
  adminStudioChiefTechnologyOfficerPath,
  adminStudioCompanyGenomePath,
  adminStudioCompanyMaturityEnginePath,
  adminStudioDigitalArchitectPath,
  adminStudioExecutiveCouncilPath,
  adminStudioExperienceArchitectPath,
  adminStudioFoundersPromisePath,
  adminStudioGrowthArchitectPath,
  adminStudioOrganizationalAutonomyFrameworkPath,
  adminStudioOrganizationalDelegationEnginePath,
  adminStudioOrganizationalGovernanceSafeguardsPath,
  adminStudioOrganizationalIntelligencePath,
  adminStudioOrganizationalSelfImprovementPath,
  adminStudioOrganizationalWorkflowOrchestrationPath,
  adminStudioLeadershipModesPath,
  adminStudioCompanyOnboardingIntelligencePath,
  adminStudioRelationshipEnginePath,
  adminStudioStudioIntelligencePath,
} from '../../../../utils/adminStudioRoutes';
import {
  ORGANIZATIONAL_MATURITY_MODEL_STYLES,
  OMM,
  actionColor,
  ommDarkHeader,
  ommLabel,
  ommLiveDot,
  ommPanel,
  ommSectionTitle,
  ommValue,
  scoreColor,
  statusColor,
} from './organizationalMaturityModelTheme';

type Props = {
  store: OrganizationalMaturityModelStore;
  onSelectWorkspace: (id: OrganizationalMaturityModelWorkspaceId) => void;
};

export function OrganizationalMaturityModelHeader() {
  return (
    <>
      <style>{ORGANIZATIONAL_MATURITY_MODEL_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...ommDarkHeader, borderTop: `3px solid ${OMM.amber}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          ORGANIZATIONAL MATURITY MODEL
        </p>
        <p style={{ ...ommLabel, color: '#FDE68A' }}>
          <span style={ommLiveDot} />
          MASTER PROGRESSION SYSTEM · V1.0 · MATURITY EARNED NOT UNLOCKED
        </p>
        <p style={{ ...ommLabel, color: '#FEF3C7', marginTop: 4 }}>
          THE RIGHT SYSTEMS AT THE RIGHT TIME · IS THE ORGANIZATION READY?
        </p>
      </header>
    </>
  );
}

export function OmmDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={{ ...ommPanel, background: OMM.missionBg }}>
      <p style={ommSectionTitle}>MATURITY DASHBOARD · MASTER PROGRESSION</p>
      <p style={{ ...ommLabel, color: OMM.amber, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...ommLabel, color: OMM.amber, marginTop: 4 }}>
        {store.companyName} · STAGE {d.currentStageLabel} → {d.nextMilestone} · READINESS {d.readinessPct}%
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['MATURITY', `${d.maturityScorePct}%`],
          ['CONFIDENCE', `${d.confidencePct}%`],
          ['AUTONOMY', `L${d.autonomyLevel}`],
          ['CAMPUS', d.campusStage.split('→')[0]?.trim() ?? d.campusStage],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: OMM.panelBorder }}>
            <p style={{ ...ommValue, fontSize: '12px' }}>{val}</p>
            <p style={ommLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MaturityPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ommPanel}>
      <p style={ommSectionTitle}>MATURITY PHILOSOPHY · EARNED NOT UNLOCKED</p>
      {store.maturityPhilosophy.map((line) => (
        <p key={line} style={{ ...ommLabel, color: OMM.amber }}>· {line}</p>
      ))}
    </section>
  );
}

export function OrganizationalStagesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ommPanel}>
      <p style={ommSectionTitle}>ORGANIZATIONAL STAGES · PROGRESSION JOURNEY</p>
      {store.organizationalStages.map((s) => (
        <div key={s.id} className="py-2 border-b" style={{ borderColor: OMM.panelBorder }}>
          <p style={{ ...ommLabel, fontSize: '6px', color: s.current ? OMM.amber : s.completed ? OMM.green : OMM.stone, fontFamily: '"Futura PT Medium"' }}>
            {s.label} {s.current ? '· CURRENT' : s.completed ? '· COMPLETE' : ''}
          </p>
          <p style={ommLabel}>{s.description}</p>
        </div>
      ))}
    </section>
  );
}

export function MaturityDimensionsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ommPanel}>
      <p style={ommSectionTitle}>MATURITY DIMENSIONS · READINESS FACTORS</p>
      {store.maturityDimensions.map((d) => (
        <div key={d.id} className="py-1 border-b flex justify-between" style={{ borderColor: OMM.panelBorder }}>
          <p style={ommLabel}>{d.dimension}</p>
          <p style={{ ...ommLabel, color: scoreColor(d.scorePct), fontFamily: '"Futura PT Medium"' }}>
            {d.scorePct}% · {d.readiness.toUpperCase()}
          </p>
        </div>
      ))}
    </section>
  );
}

export function AdaptiveExperiencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ommPanel}>
      <p style={ommSectionTitle}>ADAPTIVE EXPERIENCE · STUDIO OS ADAPTS TO MATURITY</p>
      {store.adaptiveExperience.map((a) => (
        <div key={a.id} className="py-2 border-b" style={{ borderColor: OMM.panelBorder }}>
          <p style={{ ...ommLabel, fontSize: '6px', color: OMM.amber, fontFamily: '"Futura PT Medium"' }}>{a.area.toUpperCase()}</p>
          <p style={ommLabel}>NOW: {a.currentLevel}</p>
          <p style={{ ...ommLabel, color: OMM.stone }}>ADAPTS: {a.adaptsTo}</p>
        </div>
      ))}
    </section>
  );
}

export function ExecutiveReadinessPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ommPanel}>
      <p style={ommSectionTitle}>EXECUTIVE READINESS · LEADERSHIP AS COMPLEXITY EARNED</p>
      {store.executiveReadiness.map((e) => (
        <div key={e.id} className="py-2 border-b" style={{ borderColor: OMM.panelBorder }}>
          <p style={{ ...ommLabel, fontSize: '6px', color: statusColor(e.status), fontFamily: '"Futura PT Medium"' }}>
            {e.stage.toUpperCase()} · {e.executive.toUpperCase()} · {e.status.toUpperCase()}
          </p>
          <p style={ommLabel}>{e.rationale}</p>
        </div>
      ))}
    </section>
  );
}

export function AutonomyProgressionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ommPanel}>
      <p style={ommSectionTitle}>AUTONOMY PROGRESSION · EARNED THROUGH MATURITY</p>
      {store.autonomyProgression.map((a) => (
        <div key={a.id} className="py-2 border-b" style={{ borderColor: OMM.panelBorder }}>
          <p style={{ ...ommLabel, fontSize: '6px', color: a.current ? OMM.amber : a.earned ? OMM.green : OMM.stone, fontFamily: '"Futura PT Medium"' }}>
            {a.level.toUpperCase()} {a.current ? '· CURRENT' : a.earned ? '· EARNED' : ''}
          </p>
          <p style={ommLabel}>{a.description}</p>
          {a.changeReason && <p style={{ ...ommLabel, color: OMM.stone }}>WHY: {a.changeReason}</p>}
        </div>
      ))}
    </section>
  );
}

export function CampusProgressionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ommPanel}>
      <p style={ommSectionTitle}>CAMPUS PROGRESSION · ENVIRONMENT REFLECTS MATURITY</p>
      {store.campusProgression.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: OMM.panelBorder }}>
          <p style={{ ...ommLabel, fontSize: '6px', color: c.current ? OMM.amber : c.completed ? OMM.green : OMM.stone, fontFamily: '"Futura PT Medium"' }}>
            {c.campus.toUpperCase()} {c.current ? '· CURRENT' : c.completed ? '· COMPLETE' : ''}
          </p>
          <p style={ommLabel}>{c.description}</p>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalAssessmentsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ommPanel}>
      <p style={ommSectionTitle}>ORGANIZATIONAL ASSESSMENTS · CONTINUOUS EVALUATION</p>
      {store.organizationalAssessments.map((a) => (
        <div key={a.id} className="py-2 border-b" style={{ borderColor: OMM.panelBorder }}>
          <p style={{ ...ommLabel, fontSize: '6px', color: scoreColor(a.scorePct), fontFamily: '"Futura PT Medium"' }}>
            {a.domain.toUpperCase()} · {a.scorePct}% · CONF {a.confidence}%
          </p>
          <p style={{ ...ommLabel, color: OMM.green }}>STRENGTH: {a.strength}</p>
          <p style={{ ...ommLabel, color: OMM.amber }}>OPPORTUNITY: {a.opportunity}</p>
        </div>
      ))}
    </section>
  );
}

export function GrowthRoadmapPanel({ store }: Pick<Props, 'store'>) {
  const r = store.growthRoadmap;
  return (
    <section className="p-3 mb-3" style={ommPanel}>
      <p style={ommSectionTitle}>GROWTH ROADMAP · LIVING PROGRESSION</p>
      <p style={{ ...ommLabel, color: OMM.amber, fontFamily: '"Futura PT Medium"' }}>
        {r.currentStage} → {r.nextStage} · READINESS {r.readinessPct}%
      </p>
      <p style={{ ...ommSectionTitle, marginTop: 12 }}>REMAINING REQUIREMENTS</p>
      {r.remainingRequirements.map((req) => (
        <p key={req} style={{ ...ommLabel, color: OMM.stone }}>· {req}</p>
      ))}
      <p style={{ ...ommSectionTitle, marginTop: 12 }}>RECOMMENDED PRIORITIES</p>
      {r.recommendedPriorities.map((p) => (
        <p key={p} style={{ ...ommLabel, color: OMM.amber }}>· {p}</p>
      ))}
      <p style={{ ...ommSectionTitle, marginTop: 12 }}>DEPENDENCIES</p>
      {r.dependencies.map((d) => (
        <p key={d} style={ommLabel}>· {d}</p>
      ))}
      <p style={{ ...ommSectionTitle, marginTop: 12 }}>FUTURE EXECUTIVES</p>
      {r.futureExecutives.map((e) => (
        <p key={e} style={{ ...ommLabel, color: OMM.stone }}>· {e}</p>
      ))}
    </section>
  );
}

export function CompanyOnboardingPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ommPanel}>
      <p style={ommSectionTitle}>COMPANY ONBOARDING · ASSESS EXISTING ORGANIZATIONS</p>
      {store.companyOnboarding.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: OMM.panelBorder }}>
          <p style={{ ...ommLabel, fontSize: '6px', color: OMM.amber, fontFamily: '"Futura PT Medium"' }}>{c.signal.toUpperCase()}</p>
          <p style={ommLabel}>FINDING: {c.finding}</p>
          <p style={{ ...ommLabel, color: OMM.green }}>GENERATED: {c.generated}</p>
        </div>
      ))}
      <p style={{ ...ommLabel, color: OMM.stone, marginTop: 8 }}>FOUNDERS NEVER MANUALLY RECREATE WORK THAT ALREADY EXISTS</p>
    </section>
  );
}

export function OiMaturityIntegrationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ommPanel}>
      <p style={ommSectionTitle}>ORGANIZATIONAL INTELLIGENCE · MATURITY EVALUATION</p>
      {store.oiMaturityIntegration.map((o) => (
        <div key={o.id} className="py-2 border-b" style={{ borderColor: OMM.panelBorder }}>
          <p style={{ ...ommLabel, fontSize: '6px', color: actionColor(o.action), fontFamily: '"Futura PT Medium"' }}>
            {o.action.toUpperCase().replace('-', ' ')}
          </p>
          <p style={ommLabel}>EVAL: {o.evaluation}</p>
          <p style={{ ...ommLabel, color: OMM.amber }}>REC: {o.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function RecommendedNextStepsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ommPanel}>
      <p style={ommSectionTitle}>RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...ommLabel, color: OMM.amber }}>· {step}</p>
      ))}
      {store.futureOpportunities.map((opp) => (
        <p key={opp} style={{ ...ommLabel, color: OMM.stone }}>FUTURE: {opp}</p>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: OrganizationalMaturityModelWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={ommPanel}>
      <p style={ommSectionTitle}>WORKSPACE · MATURITY CONTEXT</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.activeWorkspaceId === id ? OMM.amber : OMM.panelBorder,
              color: store.activeWorkspaceId === id ? OMM.amber : OMM.gray,
              background: store.activeWorkspaceId === id ? 'rgba(217,119,6,0.08)' : 'white',
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
    <section className="p-3 mb-3" style={ommPanel}>
      <p style={ommSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {OMM_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: OMM.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioOrganizationalGovernanceSafeguardsPath()} style={{ ...ommLabel, color: '#475569', fontSize: '6px' }}>→ ORGANIZATIONAL GOVERNANCE & SAFEGUARDS</Link>
        <Link to={adminStudioOrganizationalSelfImprovementPath()} style={{ ...ommLabel, color: '#10B981', fontSize: '6px' }}>→ ORGANIZATIONAL SELF-IMPROVEMENT</Link>
        <Link to={adminStudioOrganizationalWorkflowOrchestrationPath()} style={{ ...ommLabel, color: '#0EA5E9', fontSize: '6px' }}>→ ORGANIZATIONAL WORKFLOW ORCHESTRATION</Link>
        <Link to={adminStudioOrganizationalDelegationEnginePath()} style={{ ...ommLabel, color: '#7C3AED', fontSize: '6px' }}>→ ORGANIZATIONAL DELEGATION ENGINE</Link>
        <Link to={adminStudioOrganizationalAutonomyFrameworkPath()} style={{ ...ommLabel, color: '#0D9488', fontSize: '6px' }}>→ ORGANIZATIONAL AUTONOMY FRAMEWORK</Link>
        <Link to={adminStudioOrganizationalIntelligencePath()} style={{ ...ommLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INTELLIGENCE</Link>
        <Link to={adminStudioExecutiveCouncilPath()} style={{ ...ommLabel, color: '#B45309', fontSize: '6px' }}>→ EXECUTIVE COUNCIL</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...ommLabel, color: '#334155', fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioChiefBrandOfficerPath()} style={{ ...ommLabel, color: '#7C3AED', fontSize: '6px' }}>→ CHIEF BRAND OFFICER</Link>
        <Link to={adminStudioChiefExperienceOfficerPath()} style={{ ...ommLabel, color: '#0891B2', fontSize: '6px' }}>→ CHIEF EXPERIENCE OFFICER</Link>
        <Link to={adminStudioChiefDigitalOfficerPath()} style={{ ...ommLabel, color: '#6366F1', fontSize: '6px' }}>→ CHIEF DIGITAL OFFICER</Link>
        <Link to={adminStudioChiefTechnologyOfficerPath()} style={{ ...ommLabel, color: '#2563EB', fontSize: '6px' }}>→ CHIEF TECHNOLOGY OFFICER</Link>
        <Link to={adminStudioChiefGrowthOfficerPath()} style={{ ...ommLabel, color: '#059669', fontSize: '6px' }}>→ CHIEF GROWTH OFFICER</Link>
        <Link to={adminStudioBrandArchitectPath()} style={{ ...ommLabel, color: '#9333EA', fontSize: '6px' }}>→ BRAND ARCHITECT</Link>
        <Link to={adminStudioExperienceArchitectPath()} style={{ ...ommLabel, color: '#0891B2', fontSize: '6px' }}>→ EXPERIENCE ARCHITECT</Link>
        <Link to={adminStudioDigitalArchitectPath()} style={{ ...ommLabel, color: '#6366F1', fontSize: '6px' }}>→ DIGITAL ARCHITECT</Link>
        <Link to={adminStudioGrowthArchitectPath()} style={{ ...ommLabel, color: '#059669', fontSize: '6px' }}>→ GROWTH ARCHITECT</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...ommLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioCampusEvolutionEnginePath()} style={{ ...ommLabel, color: '#CA8A04', fontSize: '6px' }}>→ CAMPUS EVOLUTION ENGINE</Link>
        <Link to={adminStudioCompanyMaturityEnginePath()} style={{ ...ommLabel, color: '#334155', fontSize: '6px' }}>→ COMPANY MATURITY ENGINE</Link>
        <Link to={adminStudioLeadershipModesPath()} style={{ ...ommLabel, color: '#4F46E5', fontSize: '6px' }}>→ LEADERSHIP MODES</Link>
        <Link to={adminStudioCompanyOnboardingIntelligencePath()} style={{ ...ommLabel, color: '#0D9488', fontSize: '6px' }}>→ COMPANY ONBOARDING INTELLIGENCE</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...ommLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...ommLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...ommLabel, color: '#6366F1', fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
      </div>
    </section>
  );
}
