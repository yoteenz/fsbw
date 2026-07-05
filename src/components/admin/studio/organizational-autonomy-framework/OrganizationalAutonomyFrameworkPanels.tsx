import { Link } from 'react-router-dom';
import type { OrganizationalAutonomyStore, OrganizationalAutonomyWorkspaceId } from '../../../../studio-os-core/organizational-autonomy-framework/types';
import { OAF_CONNECTED_SYSTEMS } from '../../../../studio-os-core/organizational-autonomy-framework/constants';
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
  adminStudioOrganizationalInheritancePath,
  adminStudioOrganizationalIntelligencePath,
  adminStudioOrganizationalDelegationEnginePath,
  adminStudioOrganizationalWorkflowOrchestrationPath,
  adminStudioOrganizationalSelfImprovementPath,
  adminStudioRelationshipEnginePath,
  adminStudioStudioIntelligencePath,
} from '../../../../utils/adminStudioRoutes';
import {
  OAF,
  oafDarkHeader,
  oafLabel,
  oafLiveDot,
  oafPanel,
  oafSectionTitle,
  oafValue,
  levelColor,
  ORGANIZATIONAL_AUTONOMY_FRAMEWORK_STYLES,
  permissionModeColor,
  riskColor,
  scoreColor,
  statusColor,
  trendIcon,
} from './organizationalAutonomyFrameworkTheme';

type Props = {
  store: OrganizationalAutonomyStore;
  onSelectWorkspace: (id: OrganizationalAutonomyWorkspaceId) => void;
};

export function OrganizationalAutonomyHeader() {
  return (
    <>
      <style>{ORGANIZATIONAL_AUTONOMY_FRAMEWORK_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...oafDarkHeader, borderTop: `3px solid ${OAF.teal}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          ORGANIZATIONAL AUTONOMY FRAMEWORK
        </p>
        <p style={{ ...oafLabel, color: '#94A3B8' }}>
          <span style={oafLiveDot} />
          CONSTITUTIONAL AUTONOMY GOVERNANCE · V1.0 · TRUSTED STEWARDSHIP
        </p>
        <p style={{ ...oafLabel, color: '#CBD5E1', marginTop: 4 }}>
          EARNED THROUGH TRUST · ALIGNED WITH FOUNDER INTENT · NEVER SPEED OVER STEWARDSHIP
        </p>
      </header>
    </>
  );
}

export function OafDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={{ ...oafPanel, background: OAF.trustBg }}>
      <p style={oafSectionTitle}>AUTONOMY DASHBOARD · CALM · TRUSTWORTHY · TRANSPARENT</p>
      <p style={{ ...oafLabel, color: OAF.teal, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...oafLabel, color: OAF.teal, marginTop: 4 }}>
        {store.companyName} · LEVEL {d.organizationalAutonomyLevel} · TRUST {d.trustScorePct}%
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['WORKFLOWS', `${d.activeWorkflows}`],
          ['DECISIONS', `${d.recentAutonomousDecisions}`],
          ['PENDING', `${d.pendingApprovals}`],
          ['HEALTH', `${d.workflowHealthPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: OAF.panelBorder }}>
            <p style={{ ...oafValue, fontSize: '12px' }}>{val}</p>
            <p style={oafLabel}>{label}</p>
          </div>
        ))}
      </div>
      <p style={{ ...oafLabel, color: OAF.teal, marginTop: 8 }}>EXECUTIVE CONFIDENCE {d.executiveConfidencePct}%</p>
    </section>
  );
}

export function AutonomyPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oafPanel}>
      <p style={oafSectionTitle}>AUTONOMY PHILOSOPHY · TRUSTED STEWARDSHIP</p>
      {store.autonomyPhilosophy.map((line) => (
        <p key={line} style={{ ...oafLabel, color: OAF.teal }}>· {line}</p>
      ))}
      <p style={{ ...oafSectionTitle, marginTop: 12 }}>FOUNDER-RESERVED · ALWAYS UNDER FOUNDER AUTHORITY</p>
      {store.founderReservedDecisions.map((line) => (
        <p key={line} style={{ ...oafLabel, color: OAF.amber }}>· {line}</p>
      ))}
    </section>
  );
}

export function AutonomyLevelsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oafPanel}>
      <p style={oafSectionTitle}>LEVELS OF AUTONOMY · EARNED THROUGH RELIABILITY</p>
      {store.autonomyLevels.map((l) => (
        <div key={l.level} className="py-2 border-b" style={{ borderColor: OAF.panelBorder }}>
          <p style={{ ...oafLabel, fontSize: '6px', color: levelColor(l.level), fontFamily: '"Futura PT Medium"' }}>
            LEVEL {l.level} · {l.name.toUpperCase()}
          </p>
          <p style={oafLabel}>{l.description}</p>
          <p style={{ ...oafLabel, color: OAF.slate }}>REQUIREMENTS: {l.requirements}</p>
        </div>
      ))}
    </section>
  );
}

export function AutonomyGovernancePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oafPanel}>
      <p style={oafSectionTitle}>AUTONOMY GOVERNANCE · CONFIGURABLE CAPABILITIES</p>
      {store.autonomyGovernance.map((g) => (
        <div key={g.id} className="py-2 border-b" style={{ borderColor: OAF.panelBorder }}>
          <p style={{ ...oafLabel, fontSize: '6px', color: levelColor(g.currentLevel), fontFamily: '"Futura PT Medium"' }}>
            {g.capability.toUpperCase()} · LEVEL {g.currentLevel}
          </p>
          <p style={oafLabel}>{g.governance}</p>
        </div>
      ))}
    </section>
  );
}

export function FounderPermissionsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oafPanel}>
      <p style={oafSectionTitle}>FOUNDER PERMISSIONS · ALWAYS ASK · THRESHOLD · AUTOMATIC · NEVER</p>
      {store.founderPermissions.map((p) => (
        <div key={p.id} className="py-2 border-b" style={{ borderColor: OAF.panelBorder }}>
          <p style={{ ...oafLabel, fontSize: '6px', color: permissionModeColor(p.mode), fontFamily: '"Futura PT Medium"' }}>
            {p.domain.toUpperCase()} · {p.mode.replace(/-/g, ' ').toUpperCase()}
            {p.threshold ? ` · ${p.threshold}` : ''}
          </p>
          <p style={oafLabel}>{p.detail}</p>
        </div>
      ))}
    </section>
  );
}

export function TrustEnginePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oafPanel}>
      <p style={oafSectionTitle}>TRUST ENGINE · TRUST OVER TIME</p>
      {store.trustEngine.map((t) => (
        <div key={t.id} className="py-2 border-b" style={{ borderColor: OAF.panelBorder }}>
          <p style={{ ...oafLabel, fontSize: '6px', color: scoreColor(t.score), fontFamily: '"Futura PT Medium"' }}>
            {t.dimension.toUpperCase()} · {t.score}% {trendIcon(t.trend)}
          </p>
          <p style={oafLabel}>{t.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function ExecutiveCoordinationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oafPanel}>
      <p style={oafSectionTitle}>EXECUTIVE COORDINATION · WHEN GOVERNANCE PERMITS</p>
      {store.executiveCoordination.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: OAF.panelBorder }}>
          <p style={{ ...oafLabel, fontSize: '6px', color: statusColor(c.governanceStatus), fontFamily: '"Futura PT Medium"' }}>
            {c.governanceStatus.toUpperCase().replace(/-/g, ' ')}
          </p>
          <p style={{ ...oafLabel, color: OAF.accent }}>{c.trigger}</p>
          <p style={oafLabel}>EXECUTIVES: {c.executives.join(' · ')}</p>
          <p style={oafLabel}>ACTIONS: {c.actions}</p>
        </div>
      ))}
    </section>
  );
}

export function AutonomousWorkflowsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oafPanel}>
      <p style={oafSectionTitle}>AUTONOMOUS WORKFLOWS · HIGH-RISK ALWAYS REQUIRES FOUNDER</p>
      {store.autonomousWorkflows.map((w) => (
        <div key={w.id} className="py-2 border-b" style={{ borderColor: OAF.panelBorder }}>
          <p style={{ ...oafLabel, fontSize: '6px', color: statusColor(w.status), fontFamily: '"Futura PT Medium"' }}>
            {w.workflow.toUpperCase()} · LEVEL {w.autonomyLevel} · {w.status.toUpperCase()} ·{' '}
            <span style={{ color: riskColor(w.risk) }}>{w.risk.toUpperCase()} RISK</span>
          </p>
          <p style={oafLabel}>{w.category}</p>
        </div>
      ))}
    </section>
  );
}

export function AutonomousActionsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oafPanel}>
      <p style={oafSectionTitle}>ORGANIZATIONAL TRANSPARENCY · WHAT · WHY · WHO</p>
      {store.autonomousActions.map((a) => (
        <div key={a.id} className="py-2 border-b" style={{ borderColor: OAF.panelBorder }}>
          <p style={{ ...oafLabel, fontSize: '6px', color: scoreColor(a.confidence), fontFamily: '"Futura PT Medium"' }}>
            {a.action.toUpperCase()} · CONFIDENCE {a.confidence}% · {a.executedAt}
          </p>
          <p style={oafLabel}>REASONING: {a.reasoning}</p>
          <p style={oafLabel}>EXECUTIVES: {a.executives}</p>
          <p style={oafLabel}>EXPECTED: {a.expectedOutcome}</p>
          <p style={{ ...oafLabel, color: OAF.amber }}>ROLLBACK: {a.rollbackPlan}</p>
        </div>
      ))}
    </section>
  );
}

export function LearningLoopPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oafPanel}>
      <p style={oafSectionTitle}>LEARNING LOOP · STRENGTHENS ORGANIZATIONAL INTELLIGENCE</p>
      {store.learningLoop.map((l) => (
        <div key={l.id} className="py-2 border-b" style={{ borderColor: OAF.panelBorder }}>
          <p style={{ ...oafLabel, fontSize: '6px', color: OAF.teal, fontFamily: '"Futura PT Medium"' }}>{l.action.toUpperCase()}</p>
          <p style={oafLabel}>OUTCOME: {l.outcome}</p>
          <p style={oafLabel}>ACCURACY: {l.accuracy}</p>
          <p style={{ ...oafLabel, color: OAF.teal }}>IMPROVEMENT: {l.improvement}</p>
        </div>
      ))}
    </section>
  );
}

export function AutonomyUpgradesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oafPanel}>
      <p style={oafSectionTitle}>RECOMMENDED AUTONOMY UPGRADES · EARNED NOT ASSUMED</p>
      {store.autonomyUpgrades.map((u) => (
        <div key={u.id} className="py-2 border-b" style={{ borderColor: OAF.panelBorder }}>
          <p style={{ ...oafLabel, fontSize: '6px', color: scoreColor(u.confidence), fontFamily: '"Futura PT Medium"' }}>
            {u.domain.toUpperCase()} · LEVEL {u.currentLevel} → {u.recommendedLevel} · {u.confidence}%
          </p>
          <p style={oafLabel}>{u.rationale}</p>
        </div>
      ))}
    </section>
  );
}

export function RecommendedNextStepsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oafPanel}>
      <p style={oafSectionTitle}>RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...oafLabel, color: OAF.teal }}>· {step}</p>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: OrganizationalAutonomyWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={oafPanel}>
      <p style={oafSectionTitle}>AUTONOMY WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? OAF.teal : OAF.panelBorder,
              color: store.activeWorkspaceId === id ? OAF.teal : OAF.gray,
              background: store.activeWorkspaceId === id ? 'rgba(13,148,136,0.06)' : 'white',
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
    <section className="p-3 mb-3" style={oafPanel}>
      <p style={oafSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {OAF_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: OAF.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioOrganizationalIntelligencePath()} style={{ ...oafLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INTELLIGENCE</Link>
        <Link to={adminStudioExecutiveCouncilPath()} style={{ ...oafLabel, color: '#B45309', fontSize: '6px' }}>→ EXECUTIVE COUNCIL</Link>
        <Link to={adminStudioExecutiveFrameworkPath()} style={{ ...oafLabel, color: '#334155', fontSize: '6px' }}>→ EXECUTIVE FRAMEWORK</Link>
        <Link to={adminStudioLeadershipManifestoFrameworkPath()} style={{ ...oafLabel, color: '#4338CA', fontSize: '6px' }}>→ LEADERSHIP MANIFESTO</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...oafLabel, color: '#334155', fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioChiefBrandOfficerPath()} style={{ ...oafLabel, color: '#7C3AED', fontSize: '6px' }}>→ CHIEF BRAND OFFICER</Link>
        <Link to={adminStudioChiefExperienceOfficerPath()} style={{ ...oafLabel, color: '#0891B2', fontSize: '6px' }}>→ CHIEF EXPERIENCE OFFICER</Link>
        <Link to={adminStudioChiefDigitalOfficerPath()} style={{ ...oafLabel, color: '#6366F1', fontSize: '6px' }}>→ CHIEF DIGITAL OFFICER</Link>
        <Link to={adminStudioChiefTechnologyOfficerPath()} style={{ ...oafLabel, color: '#2563EB', fontSize: '6px' }}>→ CHIEF TECHNOLOGY OFFICER</Link>
        <Link to={adminStudioChiefGrowthOfficerPath()} style={{ ...oafLabel, color: '#059669', fontSize: '6px' }}>→ CHIEF GROWTH OFFICER</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...oafLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...oafLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...oafLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioOrganizationalInheritancePath()} style={{ ...oafLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INHERITANCE</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...oafLabel, color: '#6366F1', fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
        <Link to={adminStudioOrganizationalDelegationEnginePath()} style={{ ...oafLabel, color: '#7C3AED', fontSize: '6px' }}>→ ORGANIZATIONAL DELEGATION ENGINE</Link>
        <Link to={adminStudioOrganizationalWorkflowOrchestrationPath()} style={{ ...oafLabel, color: '#0EA5E9', fontSize: '6px' }}>→ ORGANIZATIONAL WORKFLOW ORCHESTRATION</Link>
        <Link to={adminStudioOrganizationalSelfImprovementPath()} style={{ ...oafLabel, color: '#10B981', fontSize: '6px' }}>→ ORGANIZATIONAL SELF-IMPROVEMENT</Link>
      </div>
    </section>
  );
}
