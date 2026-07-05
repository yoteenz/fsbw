import { Link } from 'react-router-dom';
import type { ExecutiveCouncilStore, ExecutiveCouncilWorkspaceId } from '../../../../studio-os-core/executive-council/types';
import { EC_CONNECTED_SYSTEMS } from '../../../../studio-os-core/executive-council/constants';
import {
  adminStudioChiefBrandOfficerPath,
  adminStudioChiefDigitalOfficerPath,
  adminStudioChiefExperienceOfficerPath,
  adminStudioChiefGrowthOfficerPath,
  adminStudioChiefOfStaffPath,
  adminStudioChiefTechnologyOfficerPath,
  adminStudioCompanyGenomePath,
  adminStudioExecutiveFrameworkPath,
  adminStudioFoundersPromisePath,
  adminStudioLeadershipDnaPath,
  adminStudioLeadershipManifestoFrameworkPath,
  adminStudioReaderGraphPath,
  adminStudioRelationshipEnginePath,
  adminStudioStudioIntelligencePath,
  adminStudioOrganizationalIntelligencePath,
  adminStudioOrganizationalAutonomyFrameworkPath,
  adminStudioOrganizationalDelegationEnginePath,
  adminStudioOrganizationalWorkflowOrchestrationPath,
  adminStudioOrganizationalSelfImprovementPath,
  adminStudioOrganizationalGovernanceSafeguardsPath,
} from '../../../../utils/adminStudioRoutes';
import {
  EC,
  ecDarkHeader,
  ecLabel,
  ecLiveDot,
  ecPanel,
  ecSectionTitle,
  ecValue,
  EXECUTIVE_COUNCIL_STYLES,
  priorityColor,
  scoreColor,
  stanceColor,
  statusColor,
} from './executiveCouncilTheme';

type Props = {
  store: ExecutiveCouncilStore;
  onSelectWorkspace: (id: ExecutiveCouncilWorkspaceId) => void;
};

export function ExecutiveCouncilHeader() {
  return (
    <>
      <style>{EXECUTIVE_COUNCIL_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...ecDarkHeader, borderTop: `3px solid ${EC.gold}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          EXECUTIVE COUNCIL
        </p>
        <p style={{ ...ecLabel, color: '#94A3B8' }}>
          <span style={ecLiveDot} />
          HIGHEST COLLABORATIVE LEADERSHIP BODY · V2.0 · ORGANIZATIONAL WISDOM
        </p>
        <p style={{ ...ecLabel, color: '#CBD5E1', marginTop: 4 }}>
          HEALTHY DISAGREEMENT · RESPECTFUL CHALLENGE · EVIDENCE-BASED REASONING
        </p>
      </header>
    </>
  );
}

export function CouncilDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={ecPanel}>
      <p style={ecSectionTitle}>EXECUTIVE COUNCIL · ORGANIZATIONAL WISDOM</p>
      <p style={{ ...ecLabel, color: EC.gold, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...ecLabel, color: EC.gold, marginTop: 4 }}>{store.companyName} · COUNCIL HEALTH {d.councilHealthPct}%</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['SESSIONS', `${d.activeSessions}`],
          ['PENDING', `${d.pendingDecisions}`],
          ['DISAGREE', `${d.healthyDisagreements}`],
          ['WISDOM', `${d.organizationalWisdomPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: EC.panelBorder }}>
            <p style={{ ...ecValue, fontSize: '12px' }}>{val}</p>
            <p style={ecLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CouncilPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ecPanel}>
      <p style={ecSectionTitle}>COUNCIL PHILOSOPHY · CROSS-FUNCTIONAL STEWARDSHIP</p>
      {store.councilPhilosophy.map((line) => (
        <p key={line} style={{ ...ecLabel, color: EC.slate }}>· {line}</p>
      ))}
      <p style={{ ...ecSectionTitle, marginTop: 12 }}>LEADERSHIP CULTURE</p>
      {store.leadershipCulture.map((line) => (
        <p key={line} style={{ ...ecLabel, color: EC.slate }}>· {line}</p>
      ))}
    </section>
  );
}

export function ExecutiveCouncilOathPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...ecPanel, background: EC.chamberBg }}>
      <p style={ecSectionTitle}>EXECUTIVE COUNCIL OATH · CONSTITUTIONAL PRINCIPLE</p>
      <div className="ec-oath">
        {store.executiveCouncilOath.map((line) => (
          <p key={line} style={{ margin: '4px 0' }}>{line}</p>
        ))}
      </div>
    </section>
  );
}

export function CouncilChamberPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...ecPanel, background: EC.chamberBg }}>
      <p style={ecSectionTitle}>EXECUTIVE COUNCIL CHAMBER · ARCHITECT STUDIO</p>
      <p style={{ ...ecLabel, color: EC.gold, marginBottom: 8 }}>
        MODERN · MINIMAL · PREMIUM · WARM · PURPOSEFUL · TIMELESS BOARDROOM
      </p>
      {store.councilChamber.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: EC.panelBorder }}>
          <p style={{ ...ecLabel, fontSize: '6px', color: EC.gold, fontFamily: '"Futura PT Medium"' }}>{c.element.toUpperCase()}</p>
          <p style={ecLabel}>{c.description}</p>
          <p style={{ ...ecLabel, color: EC.slate }}>{c.location}</p>
        </div>
      ))}
    </section>
  );
}

export function CouncilResponsibilitiesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ecPanel}>
      <p style={ecSectionTitle}>COUNCIL RESPONSIBILITIES · ELEVATED DECISIONS</p>
      {store.councilResponsibilities.map((r) => (
        <div key={r.id} className="py-2 border-b" style={{ borderColor: EC.panelBorder }}>
          <p style={{ ...ecLabel, fontSize: '6px', color: statusColor(r.status), fontFamily: '"Futura PT Medium"' }}>
            {r.status.toUpperCase()} · {r.category.toUpperCase()}
          </p>
          <p style={{ ...ecLabel, color: EC.accent }}>{r.topic}</p>
          <p style={{ ...ecLabel, color: EC.slate }}>ELEVATED {r.elevatedAt}</p>
        </div>
      ))}
    </section>
  );
}

export function ExecutiveDebatePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ecPanel}>
      <p style={ecSectionTitle}>EXECUTIVE DEBATE · INDEPENDENT EVALUATION</p>
      {store.executiveDebate.map((d) => (
        <div key={d.id} className="py-2 border-b" style={{ borderColor: EC.panelBorder }}>
          <p style={{ ...ecLabel, fontSize: '6px', color: stanceColor(d.stance), fontFamily: '"Futura PT Medium"' }}>
            {d.executive.toUpperCase()} · {d.discipline.toUpperCase()} · {d.stance.toUpperCase()} · {d.confidence}%
          </p>
          <p style={{ ...ecLabel, color: EC.accent }}>{d.perspective}</p>
          <p style={ecLabel}>EVIDENCE: {d.evidence}</p>
          <p style={ecLabel}>CONCERNS: {d.concerns}</p>
          <p style={ecLabel}>ALTERNATIVE: {d.alternative}</p>
        </div>
      ))}
    </section>
  );
}

export function HealthyDisagreementPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ecPanel}>
      <p style={ecSectionTitle}>HEALTHY DISAGREEMENT · CONSTRUCTIVE CHALLENGE</p>
      {store.healthyDisagreements.map((h) => (
        <div key={h.id} className="py-2 border-b" style={{ borderColor: EC.panelBorder }}>
          <p style={{ ...ecLabel, fontSize: '6px', color: EC.gold, fontFamily: '"Futura PT Medium"' }}>
            {h.executives.toUpperCase()} · {h.topic.toUpperCase()}
          </p>
          <p style={ecLabel}>DISAGREEMENT: {h.disagreement}</p>
          <p style={{ ...ecLabel, color: EC.green }}>OUTCOME: {h.outcome}</p>
        </div>
      ))}
    </section>
  );
}

export function CosFacilitationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ecPanel}>
      <p style={ecSectionTitle}>CHIEF OF STAFF FACILITATION · MODERATES · DOES NOT DOMINATE</p>
      {store.cosFacilitation.map((f) => (
        <div key={f.id} className="py-2 border-b" style={{ borderColor: EC.panelBorder }}>
          <p style={{ ...ecLabel, fontSize: '6px', color: statusColor(f.status), fontFamily: '"Futura PT Medium"' }}>
            {f.responsibility.toUpperCase()} · {f.status.toUpperCase()}
          </p>
          <p style={ecLabel}>{f.detail}</p>
        </div>
      ))}
    </section>
  );
}

export function DecisionSynthesisPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ecPanel}>
      <p style={ecSectionTitle}>DECISION SYNTHESIS · WHY THE RECOMMENDATION EMERGED</p>
      {store.decisionSynthesis.map((s) => (
        <div key={s.id} className="py-2 border-b" style={{ borderColor: EC.panelBorder }}>
          <p style={{ ...ecLabel, fontSize: '6px', color: EC.gold, fontFamily: '"Futura PT Medium"' }}>
            {s.topic.toUpperCase()} · CONFIDENCE {s.confidence}%
          </p>
          <p style={{ ...ecLabel, color: EC.accent }}>{s.executiveSummary}</p>
          <p style={{ ...ecSectionTitle, marginTop: 8, fontSize: '7px' }}>MAJOR AGREEMENTS</p>
          {s.majorAgreements.map((a) => (
            <p key={a} style={{ ...ecLabel, color: EC.green }}>· {a}</p>
          ))}
          <p style={{ ...ecSectionTitle, marginTop: 8, fontSize: '7px' }}>MAJOR DISAGREEMENTS</p>
          {s.majorDisagreements.map((d) => (
            <p key={d} style={{ ...ecLabel, color: EC.amber }}>· {d}</p>
          ))}
          <p style={{ ...ecSectionTitle, marginTop: 8, fontSize: '7px' }}>RECOMMENDED DECISION</p>
          <p style={{ ...ecLabel, color: EC.gold }}>{s.recommendedDecision}</p>
          <p style={ecLabel}>REASONING: {s.reasoning}</p>
        </div>
      ))}
    </section>
  );
}

export function ExecutiveTransparencyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ecPanel}>
      <p style={ecSectionTitle}>EXECUTIVE TRANSPARENCY · INSPECT INDIVIDUAL REASONING</p>
      {store.executiveTransparency.map((t) => (
        <div key={t.id} className="py-2 border-b" style={{ borderColor: EC.panelBorder }}>
          <p style={{ ...ecLabel, fontSize: '6px', color: EC.slate, fontFamily: '"Futura PT Medium"' }}>
            {t.executive.toUpperCase()} · CONFIDENCE {t.confidence}%
          </p>
          <p style={ecLabel}>REASONING: {t.reasoning}</p>
          <p style={ecLabel}>EVIDENCE: {t.evidence}</p>
          <p style={ecLabel}>HISTORICAL: {t.historicalComparison}</p>
        </div>
      ))}
    </section>
  );
}

export function MeetingModesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ecPanel}>
      <p style={ecSectionTitle}>MEETING MODES · ADAPTIVE PARTICIPANTS</p>
      {store.meetingModes.map((m) => (
        <div key={m.id} className="py-2 border-b" style={{ borderColor: EC.panelBorder }}>
          <p style={{ ...ecLabel, fontSize: '6px', color: EC.gold, fontFamily: '"Futura PT Medium"' }}>{m.mode.toUpperCase()}</p>
          <p style={ecLabel}>{m.description}</p>
          <p style={{ ...ecLabel, color: EC.slate }}>PARTICIPANTS: {m.typicalParticipants.join(' · ')}</p>
        </div>
      ))}
    </section>
  );
}

export function CouncilSimulationsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ecPanel}>
      <p style={ecSectionTitle}>EXECUTIVE SIMULATIONS · BEFORE MAJOR DECISIONS</p>
      {store.councilSimulations.map((s) => (
        <div key={s.id} className="py-2 border-b" style={{ borderColor: EC.panelBorder }}>
          <p style={{ ...ecLabel, fontSize: '6px', color: statusColor(s.status), fontFamily: '"Futura PT Medium"' }}>
            {s.scenario.toUpperCase()} · {s.status.toUpperCase()} · {s.viewpoints} VIEWPOINTS
          </p>
          <p style={{ ...ecLabel, color: EC.green }}>BEST: {s.bestCase}</p>
          <p style={{ ...ecLabel, color: EC.red }}>WORST: {s.worstCase}</p>
          {s.confidence > 0 && (
            <p style={{ ...ecLabel, color: scoreColor(s.confidence) }}>CONFIDENCE {s.confidence}%</p>
          )}
        </div>
      ))}
    </section>
  );
}

export function OrganizationalLearningPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ecPanel}>
      <p style={ecSectionTitle}>ORGANIZATIONAL LEARNING · COMPOUND WISDOM</p>
      {store.organizationalLearning.map((l) => (
        <div key={l.id} className="py-2 border-b" style={{ borderColor: EC.panelBorder }}>
          <p style={{ ...ecLabel, fontSize: '6px', color: EC.gold, fontFamily: '"Futura PT Medium"' }}>
            {l.destination.toUpperCase()} · {l.date}
          </p>
          <p style={ecLabel}>{l.contribution}</p>
        </div>
      ))}
    </section>
  );
}

export function FounderParticipationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ecPanel}>
      <p style={ecSectionTitle}>FOUNDER PARTICIPATION · FINAL DECISION MAKER</p>
      {store.founderParticipation.map((f) => (
        <div key={f.id} className="py-1">
          <p style={{ ...ecLabel, fontSize: '6px', color: EC.gold, fontFamily: '"Futura PT Medium"' }}>{f.action.toUpperCase()}</p>
          <p style={ecLabel}>{f.description}</p>
        </div>
      ))}
    </section>
  );
}

export function CouncilIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ecPanel}>
      <p style={ecSectionTitle}>COUNCIL INTELLIGENCE · STUDIO INTELLIGENCE RECOMMENDATIONS</p>
      {store.councilIntelligence.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: EC.panelBorder }}>
          <p style={{ ...ecLabel, fontSize: '6px', color: priorityColor(c.priority), fontFamily: '"Futura PT Medium"' }}>
            {c.category.toUpperCase()} · {c.priority.toUpperCase()}
          </p>
          <p style={ecLabel}>{c.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function RecommendedNextStepsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={ecPanel}>
      <p style={ecSectionTitle}>RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...ecLabel, color: EC.gold }}>· {step}</p>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: ExecutiveCouncilWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={ecPanel}>
      <p style={ecSectionTitle}>COUNCIL WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? EC.gold : EC.panelBorder,
              color: store.activeWorkspaceId === id ? EC.gold : EC.gray,
              background: store.activeWorkspaceId === id ? 'rgba(180,83,9,0.06)' : 'white',
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
    <section className="p-3 mb-3" style={ecPanel}>
      <p style={ecSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {EC_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: EC.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioExecutiveFrameworkPath()} style={{ ...ecLabel, color: '#334155', fontSize: '6px' }}>→ EXECUTIVE FRAMEWORK</Link>
        <Link to={adminStudioLeadershipManifestoFrameworkPath()} style={{ ...ecLabel, color: '#4338CA', fontSize: '6px' }}>→ LEADERSHIP MANIFESTO</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...ecLabel, color: '#334155', fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioChiefBrandOfficerPath()} style={{ ...ecLabel, color: '#7C3AED', fontSize: '6px' }}>→ CHIEF BRAND OFFICER</Link>
        <Link to={adminStudioChiefExperienceOfficerPath()} style={{ ...ecLabel, color: '#0891B2', fontSize: '6px' }}>→ CHIEF EXPERIENCE OFFICER</Link>
        <Link to={adminStudioChiefDigitalOfficerPath()} style={{ ...ecLabel, color: '#6366F1', fontSize: '6px' }}>→ CHIEF DIGITAL OFFICER</Link>
        <Link to={adminStudioChiefTechnologyOfficerPath()} style={{ ...ecLabel, color: '#2563EB', fontSize: '6px' }}>→ CHIEF TECHNOLOGY OFFICER</Link>
        <Link to={adminStudioChiefGrowthOfficerPath()} style={{ ...ecLabel, color: '#059669', fontSize: '6px' }}>→ CHIEF GROWTH OFFICER</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...ecLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...ecLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioLeadershipDnaPath()} style={{ ...ecLabel, color: '#CA8A04', fontSize: '6px' }}>→ LEADERSHIP DNA</Link>
        <Link to={adminStudioReaderGraphPath()} style={{ ...ecLabel, color: '#059669', fontSize: '6px' }}>→ READER GRAPH</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...ecLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...ecLabel, color: '#6366F1', fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
        <Link to={adminStudioOrganizationalIntelligencePath()} style={{ ...ecLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INTELLIGENCE</Link>
        <Link to={adminStudioOrganizationalAutonomyFrameworkPath()} style={{ ...ecLabel, color: '#0D9488', fontSize: '6px' }}>→ ORGANIZATIONAL AUTONOMY FRAMEWORK</Link>
        <Link to={adminStudioOrganizationalDelegationEnginePath()} style={{ ...ecLabel, color: '#7C3AED', fontSize: '6px' }}>→ ORGANIZATIONAL DELEGATION ENGINE</Link>
        <Link to={adminStudioOrganizationalWorkflowOrchestrationPath()} style={{ ...ecLabel, color: '#0EA5E9', fontSize: '6px' }}>→ ORGANIZATIONAL WORKFLOW ORCHESTRATION</Link>
        <Link to={adminStudioOrganizationalSelfImprovementPath()} style={{ ...ecLabel, color: '#10B981', fontSize: '6px' }}>→ ORGANIZATIONAL SELF-IMPROVEMENT</Link>
        <Link to={adminStudioOrganizationalGovernanceSafeguardsPath()} style={{ ...ecLabel, color: '#475569', fontSize: '6px' }}>→ ORGANIZATIONAL GOVERNANCE & SAFEGUARDS</Link>
      </div>
    </section>
  );
}
