import { Link } from 'react-router-dom';
import type {
  OrganizationalApprenticeshipStore,
  OrganizationalApprenticeshipWorkspaceId,
} from '../../../../studio-os-core/organizational-apprenticeship/types';
import { OA_CONNECTED_SYSTEMS } from '../../../../studio-os-core/organizational-apprenticeship/constants';
import {
  adminStudioArrivalExperiencePath,
  adminStudioBrandArchitectPath,
  adminStudioChiefBrandOfficerPath,
  adminStudioChiefExperienceOfficerPath,
  adminStudioChiefDigitalOfficerPath,
  adminStudioChiefGrowthOfficerPath,
  adminStudioChiefOfStaffPath,
  adminStudioChiefTechnologyOfficerPath,
  adminStudioCompanyGenomePath,
  adminStudioCompanyOnboardingIntelligencePath,
  adminStudioDigitalArchitectPath,
  adminStudioExecutiveApprenticeshipFounderCalibrationPath,
  adminStudioExecutiveCouncilPath,
  adminStudioExecutiveFrameworkPath,
  adminStudioExperienceArchitectPath,
  adminStudioFoundersPromisePath,
  adminStudioGrowthArchitectPath,
  adminStudioLeadershipManifestoFrameworkPath,
  adminStudioNdxbookPath,
  adminStudioOrganizationalApprenticeshipPath,
  adminStudioOrganizationalGovernanceSafeguardsPath,
  adminStudioOrganizationalIntelligencePath,
  adminStudioOrganizationalMaturityModelPath,
  adminStudioReaderGraphPath,
  adminStudioRelationshipEnginePath,
  adminStudioStudioInstitutePath,
  adminStudioStudioIntelligencePath,
} from '../../../../utils/adminStudioRoutes';
import {
  ORGANIZATIONAL_APPRENTICESHIP_STYLES,
  OAP,
  actionColor,
  alignmentColor,
  oapDarkHeader,
  oapLabel,
  oapLiveDot,
  oapPanel,
  oapSectionTitle,
  oapValue,
  stageColor,
} from './organizationalApprenticeshipTheme';

type Props = {
  store: OrganizationalApprenticeshipStore;
  onSelectWorkspace: (id: OrganizationalApprenticeshipWorkspaceId) => void;
};

export function OrganizationalApprenticeshipHeader() {
  return (
    <>
      <style>{ORGANIZATIONAL_APPRENTICESHIP_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...oapDarkHeader, borderTop: `3px solid ${OAP.teal}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          ORGANIZATIONAL APPRENTICESHIP
        </p>
        <p style={{ ...oapLabel, color: '#A5F3FC' }}>
          <span style={oapLiveDot} />
          PERMANENT LEARNING & TRUST-BUILDING · V1.0 · STEWARDSHIP · EARNED TRUST
        </p>
        <p style={{ ...oapLabel, color: '#CFFAFE', marginTop: 4 }}>
          BEFORE LEADING LEARN · BEFORE DECIDING UNDERSTAND · BEFORE ACTING EARN TRUST
        </p>
      </header>
    </>
  );
}

export function OaDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={{ ...oapPanel, background: OAP.missionBg }}>
      <p style={oapSectionTitle}>ORGANIZATIONAL DASHBOARD · GROWTH · HUMILITY · EARNED TRUST</p>
      <p style={{ ...oapLabel, color: OAP.teal, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...oapLabel, color: OAP.teal, marginTop: 4 }}>
        {store.companyName} · ORG CONFIDENCE {d.organizationalConfidencePct}% · AVG ALIGNMENT {d.averageAlignmentPct}%
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ['APPRENTICES', `${d.activeApprentices}`],
          ['ALIGNMENT', `${d.averageAlignmentPct}%`],
          ['VELOCITY', d.averageLearningVelocity],
          ['GRADUATION', `${d.graduationReady}`],
          ['CONFIDENCE', `${d.organizationalConfidencePct}%`],
          ['FUTURE LEADERS', `${d.futureLeadersIdentified}`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: OAP.panelBorder }}>
            <p style={{ ...oapValue, fontSize: '12px' }}>{val}</p>
            <p style={oapLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ApprenticeshipPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oapPanel}>
      <p style={oapSectionTitle}>APPRENTICESHIP PHILOSOPHY · STEWARDSHIP THROUGH OBSERVATION</p>
      {store.apprenticeshipPhilosophy.map((line) => (
        <p key={line} style={{ ...oapLabel, color: OAP.teal }}>· {line}</p>
      ))}
    </section>
  );
}

export function OrganizationalOathPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...oapPanel, background: OAP.missionBg }}>
      <p style={oapSectionTitle}>ORGANIZATIONAL OATH · FIRST PROMISE OF EVERY FUTURE LEADER</p>
      {store.organizationalOath.map((line) => (
        <p key={line} style={{ ...oapLabel, color: OAP.teal, fontStyle: 'italic' }}>{line}</p>
      ))}
    </section>
  );
}

export function OrganizationalApprenticesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oapPanel}>
      <p style={oapSectionTitle}>ORGANIZATIONAL APPRENTICES · EVERY NEW INTELLIGENCE</p>
      {store.organizationalApprentices.map((a) => (
        <div key={a.id} className="py-2 border-b" style={{ borderColor: OAP.panelBorder }}>
          <p style={{ ...oapLabel, fontSize: '6px', color: a.active ? OAP.teal : OAP.slate, fontFamily: '"Futura PT Medium"' }}>
            {a.type.toUpperCase()} · {a.name.toUpperCase()} {a.active ? '· ACTIVE' : '· WHEN APPROPRIATE'}
          </p>
          <p style={oapLabel}>{a.description}</p>
        </div>
      ))}
    </section>
  );
}

export function FounderCalibrationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oapPanel}>
      <p style={oapSectionTitle}>FOUNDER CALIBRATION · UNDERSTANDING NOT IMITATION</p>
      {store.founderCalibration.map((dim) => (
        <div key={dim.id} className="py-2 border-b" style={{ borderColor: OAP.panelBorder }}>
          <p style={{ ...oapLabel, fontSize: '6px', color: alignmentColor(dim.understandingPct), fontFamily: '"Futura PT Medium"' }}>
            {dim.area.toUpperCase()} · {dim.understandingPct}% · {dim.signalsLearned} SIGNALS
          </p>
          <p style={oapLabel}>{dim.description}</p>
        </div>
      ))}
    </section>
  );
}

export function ShadowingObservationsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oapPanel}>
      <p style={oapSectionTitle}>ORGANIZATIONAL SHADOWING · OBSERVE · CAPTURE · LEARN</p>
      {store.shadowingObservations.map((obs) => (
        <div key={obs.id} className="py-2 border-b" style={{ borderColor: OAP.panelBorder }}>
          <p style={{ ...oapLabel, fontSize: '6px', color: OAP.teal, fontFamily: '"Futura PT Medium"' }}>
            {obs.apprentice.toUpperCase()} · {obs.context.toUpperCase()}
          </p>
          <p style={oapLabel}><span style={{ color: OAP.slate }}>Observed:</span> {obs.observed}</p>
          <p style={{ ...oapLabel, color: OAP.emerald }}><span style={{ color: OAP.slate }}>Captured:</span> {obs.captured}</p>
        </div>
      ))}
    </section>
  );
}

export function GuidedLearningPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oapPanel}>
      <p style={oapSectionTitle}>GUIDED LEARNING · THOUGHTFUL QUESTIONS</p>
      {store.guidedLearning.map((q) => (
        <div key={q.id} className="py-2 border-b" style={{ borderColor: OAP.panelBorder }}>
          <p style={{ ...oapLabel, fontSize: '6px', color: OAP.teal, fontFamily: '"Futura PT Medium"' }}>
            {q.apprentice.toUpperCase()} · {q.status.toUpperCase()}
          </p>
          <p style={{ ...oapLabel, fontStyle: 'italic' }}>&quot;{q.question}&quot;</p>
          {q.insight && <p style={{ ...oapLabel, color: OAP.emerald, marginTop: 4 }}>Insight: {q.insight}</p>}
        </div>
      ))}
    </section>
  );
}

export function PracticeEnvironmentPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oapPanel}>
      <p style={oapSectionTitle}>PRACTICE ENVIRONMENT · LEARNING THROUGH COMPARISON</p>
      {store.practiceExercises.map((pr) => (
        <div key={pr.id} className="py-2 border-b" style={{ borderColor: OAP.panelBorder }}>
          <p style={{ ...oapLabel, fontSize: '6px', color: alignmentColor(pr.alignmentPct), fontFamily: '"Futura PT Medium"' }}>
            {pr.apprentice.toUpperCase()} · {pr.type.toUpperCase()} · {pr.alignmentPct}% ALIGNMENT
          </p>
          <p style={oapLabel}><span style={{ color: OAP.slate }}>Task:</span> {pr.task}</p>
          <p style={oapLabel}><span style={{ color: OAP.slate }}>Organization:</span> {pr.organizationalDecision}</p>
          <p style={oapLabel}><span style={{ color: OAP.slate }}>Apprentice:</span> {pr.apprenticeReasoning}</p>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalCalibrationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oapPanel}>
      <p style={oapSectionTitle}>ORGANIZATIONAL CALIBRATION · ALIGNMENT · CONFIDENCE · VELOCITY</p>
      {store.organizationalCalibration.map((m) => (
        <div key={m.id} className="py-2 border-b" style={{ borderColor: OAP.panelBorder }}>
          <p style={{ ...oapLabel, fontSize: '6px', color: alignmentColor(m.alignmentScorePct), fontFamily: '"Futura PT Medium"' }}>
            {m.domain.toUpperCase()} · {m.alignmentScorePct}% · {m.confidencePct}% CONF · {m.learningVelocity}
          </p>
          <p style={oapLabel}><span style={{ color: OAP.slate }}>Mentorship:</span> {m.mentorshipNeeded}</p>
        </div>
      ))}
    </section>
  );
}

export function TrustProgressionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oapPanel}>
      <p style={oapSectionTitle}>TRUST PROGRESSION · AUTHORITY EARNED GRADUALLY</p>
      <p style={{ ...oapLabel, color: OAP.slate, marginBottom: 8 }}>
        OBSERVE → UNDERSTAND → RECOMMEND → CO-CREATE → CO-REVIEW → TRUSTED CONTRIBUTOR → ORGANIZATIONAL STEWARD
      </p>
      {store.trustProgressions.map((tp) => (
        <div key={tp.id} className="py-2 border-b" style={{ borderColor: OAP.panelBorder }}>
          <p style={{ ...oapLabel, fontSize: '6px', color: stageColor(tp.currentStage), fontFamily: '"Futura PT Medium"' }}>
            {tp.apprentice.toUpperCase()} · {tp.currentStage.replace(/-/g, ' ').toUpperCase()} · {tp.alignmentPct}% · {tp.experiencesCompleted} EXPERIENCES
          </p>
          <p style={oapLabel}><span style={{ color: OAP.slate }}>Next stage:</span> {tp.nextStageRequirement}</p>
        </div>
      ))}
    </section>
  );
}

export function ChiefOfStaffMentorshipPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oapPanel}>
      <p style={oapSectionTitle}>CHIEF OF STAFF MENTORSHIP · STEWARD OF APPRENTICESHIP</p>
      {store.chiefOfStaffMentorship.map((m) => (
        <div key={m.id} className="py-2 border-b" style={{ borderColor: OAP.panelBorder }}>
          <p style={{ ...oapLabel, fontSize: '6px', color: OAP.teal, fontFamily: '"Futura PT Medium"' }}>
            {m.category.toUpperCase()} · {m.targetApprentice.toUpperCase()}
          </p>
          <p style={oapLabel}>{m.recommendation}</p>
          <p style={{ ...oapLabel, color: OAP.slate }}>{m.rationale}</p>
        </div>
      ))}
    </section>
  );
}

export function LearningLibraryPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oapPanel}>
      <p style={oapSectionTitle}>ORGANIZATIONAL LEARNING LIBRARY · ACCUMULATED WISDOM</p>
      {store.learningLibrary.map((item) => (
        <div key={item.id} className="py-2 border-b" style={{ borderColor: OAP.panelBorder }}>
          <p style={{ ...oapLabel, fontSize: '6px', color: OAP.teal, fontFamily: '"Futura PT Medium"' }}>
            {item.category.toUpperCase()}
          </p>
          <p style={oapLabel}>{item.title}</p>
          <p style={{ ...oapLabel, color: OAP.emerald }}>{item.preservedFor}</p>
        </div>
      ))}
    </section>
  );
}

export function GraduationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oapPanel}>
      <p style={oapSectionTitle}>GRADUATION · FOUNDER APPROVES · DELAYS · EXPANDS · REDUCES</p>
      {store.graduationRecommendations.map((gr) => (
        <div key={gr.id} className="py-2 border-b" style={{ borderColor: OAP.panelBorder }}>
          <p style={{ ...oapLabel, fontSize: '6px', color: actionColor(gr.founderAction), fontFamily: '"Futura PT Medium"' }}>
            {gr.apprentice.toUpperCase()} · {gr.readinessPct}% · {gr.founderAction.toUpperCase()}
          </p>
          <p style={oapLabel}>{gr.recommendation}</p>
          <p style={{ ...oapLabel, color: OAP.slate }}>{gr.evidenceBasis}</p>
        </div>
      ))}
    </section>
  );
}

export function FounderDashboardHighlightsPanel({ store }: Pick<Props, 'store'>) {
  const h = store.founderDashboardHighlights;
  return (
    <section className="p-3 mb-3" style={{ ...oapPanel, background: OAP.missionBg }}>
      <p style={oapSectionTitle}>FOUNDER DASHBOARD · MENTORSHIP · GRADUATION · FUTURE LEADERS</p>
      <p style={{ ...oapSectionTitle, marginTop: 8 }}>RECOMMENDED MENTORSHIP</p>
      {h.recommendedMentorship.map((s) => (
        <p key={s} style={oapLabel}>· {s}</p>
      ))}
      <p style={{ ...oapSectionTitle, marginTop: 8 }}>GRADUATION READINESS</p>
      {h.graduationReadiness.map((c) => (
        <p key={c} style={{ ...oapLabel, color: OAP.teal }}>· {c}</p>
      ))}
      <p style={{ ...oapSectionTitle, marginTop: 8 }}>FUTURE LEADERS</p>
      {h.futureLeaders.map((l) => (
        <p key={l} style={{ ...oapLabel, color: OAP.emerald }}>· {l}</p>
      ))}
      <p style={{ ...oapSectionTitle, marginTop: 8 }}>RECENT IMPROVEMENTS</p>
      {h.recentImprovements.map((i) => (
        <p key={i} style={{ ...oapLabel, color: OAP.cyan }}>· {i}</p>
      ))}
    </section>
  );
}

export function FutureOpportunitiesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={oapPanel}>
      <p style={oapSectionTitle}>FUTURE VISION · LIFELONG APPRENTICES · PERMANENT TRADITION</p>
      {store.futureOpportunities.map((o) => (
        <p key={o} style={oapLabel}>· {o}</p>
      ))}
      <p style={{ ...oapLabel, color: OAP.teal, marginTop: 8, fontStyle: 'italic' }}>
        Every apprentice eventually becomes a mentor · every mentor remains an apprentice · trust becomes one of the organization&apos;s most valuable assets.
      </p>
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: OrganizationalApprenticeshipWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={oapPanel}>
      <p style={oapSectionTitle}>WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.activeWorkspaceId === id ? OAP.teal : OAP.panelBorder,
              color: store.activeWorkspaceId === id ? OAP.teal : OAP.gray,
              background: store.activeWorkspaceId === id ? 'rgba(21,94,117,0.08)' : 'white',
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
    <section className="p-3 mb-3" style={oapPanel}>
      <p style={oapSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {OA_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: OAP.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioStudioInstitutePath()} style={{ ...oapLabel, color: '#854D0E', fontSize: '6px' }}>→ STUDIO INSTITUTE</Link>
        <Link to={adminStudioCompanyOnboardingIntelligencePath()} style={{ ...oapLabel, color: '#0D9488', fontSize: '6px' }}>→ COMPANY ONBOARDING INTELLIGENCE</Link>
        <Link to={adminStudioOrganizationalIntelligencePath()} style={{ ...oapLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INTELLIGENCE</Link>
        <Link to={adminStudioOrganizationalMaturityModelPath()} style={{ ...oapLabel, color: '#D97706', fontSize: '6px' }}>→ ORGANIZATIONAL MATURITY MODEL</Link>
        <Link to={adminStudioOrganizationalGovernanceSafeguardsPath()} style={{ ...oapLabel, color: '#334155', fontSize: '6px' }}>→ ORGANIZATIONAL GOVERNANCE & SAFEGUARDS</Link>
        <Link to={adminStudioExecutiveFrameworkPath()} style={{ ...oapLabel, color: '#334155', fontSize: '6px' }}>→ EXECUTIVE FRAMEWORK</Link>
        <Link to={adminStudioLeadershipManifestoFrameworkPath()} style={{ ...oapLabel, color: '#334155', fontSize: '6px' }}>→ LEADERSHIP MANIFESTO</Link>
        <Link to={adminStudioExecutiveCouncilPath()} style={{ ...oapLabel, color: '#B45309', fontSize: '6px' }}>→ EXECUTIVE COUNCIL</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...oapLabel, color: '#334155', fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioChiefBrandOfficerPath()} style={{ ...oapLabel, color: '#7C3AED', fontSize: '6px' }}>→ CHIEF BRAND OFFICER</Link>
        <Link to={adminStudioChiefExperienceOfficerPath()} style={{ ...oapLabel, color: '#0891B2', fontSize: '6px' }}>→ CHIEF EXPERIENCE OFFICER</Link>
        <Link to={adminStudioChiefDigitalOfficerPath()} style={{ ...oapLabel, color: '#6366F1', fontSize: '6px' }}>→ CHIEF DIGITAL OFFICER</Link>
        <Link to={adminStudioChiefTechnologyOfficerPath()} style={{ ...oapLabel, color: '#2563EB', fontSize: '6px' }}>→ CHIEF TECHNOLOGY OFFICER</Link>
        <Link to={adminStudioChiefGrowthOfficerPath()} style={{ ...oapLabel, color: '#059669', fontSize: '6px' }}>→ CHIEF GROWTH OFFICER</Link>
        <Link to={adminStudioBrandArchitectPath()} style={{ ...oapLabel, color: '#9333EA', fontSize: '6px' }}>→ BRAND ARCHITECT</Link>
        <Link to={adminStudioExperienceArchitectPath()} style={{ ...oapLabel, color: '#0891B2', fontSize: '6px' }}>→ EXPERIENCE ARCHITECT</Link>
        <Link to={adminStudioDigitalArchitectPath()} style={{ ...oapLabel, color: '#6366F1', fontSize: '6px' }}>→ DIGITAL ARCHITECT</Link>
        <Link to={adminStudioGrowthArchitectPath()} style={{ ...oapLabel, color: '#059669', fontSize: '6px' }}>→ GROWTH ARCHITECT</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...oapLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioReaderGraphPath()} style={{ ...oapLabel, color: '#059669', fontSize: '6px' }}>→ READER GRAPH</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...oapLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...oapLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...oapLabel, color: '#6366F1', fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
        <Link to={adminStudioExecutiveApprenticeshipFounderCalibrationPath()} style={{ ...oapLabel, color: '#7C3AED', fontSize: '6px' }}>→ EXECUTIVE APPRENTICESHIP</Link>
        <Link to={adminStudioArrivalExperiencePath()} style={{ ...oapLabel, color: '#0369A1', fontSize: '6px' }}>→ ARRIVAL EXPERIENCE</Link>
        <Link to={adminStudioNdxbookPath()} style={{ ...oapLabel, color: '#334155', fontSize: '6px' }}>→ NDXBOOK</Link>
        <Link to={adminStudioOrganizationalApprenticeshipPath()} style={{ ...oapLabel, color: '#155E75', fontSize: '6px' }}>→ ORGANIZATIONAL APPRENTICESHIP</Link>
      </div>
    </section>
  );
}
