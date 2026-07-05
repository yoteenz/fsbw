import { Link } from 'react-router-dom';
import type {
  ExecutiveApprenticeshipStore,
  ExecutiveApprenticeshipWorkspaceId,
} from '../../../../studio-os-core/executive-apprenticeship-founder-calibration/types';
import { EAF_CONNECTED_SYSTEMS } from '../../../../studio-os-core/executive-apprenticeship-founder-calibration/constants';
import {
  adminStudioArrivalExperiencePath,
  adminStudioChiefBrandOfficerPath,
  adminStudioChiefExperienceOfficerPath,
  adminStudioChiefDigitalOfficerPath,
  adminStudioChiefGrowthOfficerPath,
  adminStudioChiefOfStaffPath,
  adminStudioChiefTechnologyOfficerPath,
  adminStudioCompanyGenomePath,
  adminStudioCompanyOnboardingIntelligencePath,
  adminStudioExecutiveApprenticeshipFounderCalibrationPath,
  adminStudioExecutiveCouncilPath,
  adminStudioExecutiveFrameworkPath,
  adminStudioFoundersPromisePath,
  adminStudioLeadershipManifestoFrameworkPath,
  adminStudioOrganizationalIntelligencePath,
  adminStudioOrganizationalMaturityModelPath,
  adminStudioRelationshipEnginePath,
  adminStudioStudioIntelligencePath,
  adminStudioStudioInstitutePath,
  adminStudioOrganizationalApprenticeshipPath,
} from '../../../../utils/adminStudioRoutes';
import {
  EXECUTIVE_APPRENTICESHIP_STYLES,
  EAF,
  alignmentColor,
  actionColor,
  eafDarkHeader,
  eafLabel,
  eafLiveDot,
  eafPanel,
  eafSectionTitle,
  eafValue,
  trustLevelColor,
} from './executiveApprenticeshipTheme';

type Props = {
  store: ExecutiveApprenticeshipStore;
  onSelectWorkspace: (id: ExecutiveApprenticeshipWorkspaceId) => void;
};

export function ExecutiveApprenticeshipHeader() {
  return (
    <>
      <style>{EXECUTIVE_APPRENTICESHIP_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...eafDarkHeader, borderTop: `3px solid ${EAF.violet}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          EXECUTIVE APPRENTICESHIP & FOUNDER CALIBRATION
        </p>
        <p style={{ ...eafLabel, color: '#DDD6FE' }}>
          <span style={eafLiveDot} />
          EXECUTIVE DEVELOPMENT · V1.0 · TRUST EARNED · NEVER ASSUMED
        </p>
        <p style={{ ...eafLabel, color: '#EDE9FE', marginTop: 4 }}>
          OBSERVE · LEARN · PRACTICE · CALIBRATE · AMPLIFY FOUNDER LEADERSHIP
        </p>
      </header>
    </>
  );
}

export function EafDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={{ ...eafPanel, background: EAF.missionBg }}>
      <p style={eafSectionTitle}>FOUNDER DASHBOARD · EARNED TRUST</p>
      <p style={{ ...eafLabel, color: EAF.violet, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...eafLabel, color: EAF.violet, marginTop: 4 }}>
        {store.companyName} · ORG CONFIDENCE {d.organizationalConfidencePct}% · AVG ALIGNMENT {d.averageAlignmentPct}%
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['EXECUTIVES', `${d.executivesInApprenticeship}`],
          ['ALIGNMENT', `${d.averageAlignmentPct}%`],
          ['LEARNING', d.averageLearningVelocity],
          ['SOFT APPROVAL', `${d.softApprovalsActive}`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: EAF.panelBorder }}>
            <p style={{ ...eafValue, fontSize: '12px' }}>{val}</p>
            <p style={eafLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ApprenticeshipPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eafPanel}>
      <p style={eafSectionTitle}>APPRENTICESHIP PHILOSOPHY · DEVELOPED NOT CONFIGURED</p>
      {store.apprenticeshipPhilosophy.map((line) => (
        <p key={line} style={{ ...eafLabel, color: EAF.violet }}>· {line}</p>
      ))}
    </section>
  );
}

export function FounderCalibrationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eafPanel}>
      <p style={eafSectionTitle}>FOUNDER CALIBRATION · CONTINUOUS LEARNING</p>
      {store.founderCalibration.map((dim) => (
        <div key={dim.id} className="py-2 border-b" style={{ borderColor: EAF.panelBorder }}>
          <p style={{ ...eafLabel, fontSize: '6px', color: alignmentColor(dim.alignmentPct), fontFamily: '"Futura PT Medium"' }}>
            {dim.dimension.toUpperCase()} · {dim.alignmentPct}% · {dim.signalsCaptured} SIGNALS
          </p>
          <p style={eafLabel}>{dim.description}</p>
        </div>
      ))}
    </section>
  );
}

export function ShadowingObservationsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eafPanel}>
      <p style={eafSectionTitle}>EXECUTIVE SHADOWING · SILENT OBSERVATION</p>
      {store.shadowingObservations.map((obs) => (
        <div key={obs.id} className="py-2 border-b" style={{ borderColor: EAF.panelBorder }}>
          <p style={{ ...eafLabel, fontSize: '6px', color: EAF.violet, fontFamily: '"Futura PT Medium"' }}>
            {obs.executive.toUpperCase()} · {obs.context.toUpperCase()}
          </p>
          <p style={eafLabel}><span style={{ color: EAF.slate }}>Observed:</span> {obs.observed}</p>
          <p style={{ ...eafLabel, color: EAF.emerald }}><span style={{ color: EAF.slate }}>Captured:</span> {obs.captured}</p>
        </div>
      ))}
    </section>
  );
}

export function LearningConversationsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eafPanel}>
      <p style={eafSectionTitle}>LEARNING CONVERSATIONS · THOUGHTFUL QUESTIONS</p>
      {store.learningConversations.map((conv) => (
        <div key={conv.id} className="py-2 border-b" style={{ borderColor: EAF.panelBorder }}>
          <p style={{ ...eafLabel, fontSize: '6px', color: EAF.violet, fontFamily: '"Futura PT Medium"' }}>
            {conv.executive.toUpperCase()} · {conv.status.toUpperCase()}
          </p>
          <p style={{ ...eafLabel, fontStyle: 'italic' }}>&quot;{conv.question}&quot;</p>
          {conv.insight && <p style={{ ...eafLabel, color: EAF.emerald, marginTop: 4 }}>Insight: {conv.insight}</p>}
        </div>
      ))}
    </section>
  );
}

export function CalibrationEnginePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eafPanel}>
      <p style={eafSectionTitle}>CALIBRATION ENGINE · ALIGNMENT MEASUREMENT</p>
      {store.calibrationMeasurements.map((m) => (
        <div key={m.id} className="py-2 border-b" style={{ borderColor: EAF.panelBorder }}>
          <p style={{ ...eafLabel, fontSize: '6px', color: alignmentColor(m.alignmentScorePct), fontFamily: '"Futura PT Medium"' }}>
            {m.domain.toUpperCase()} · {m.alignmentScorePct}% ALIGNMENT · {m.confidencePct}% CONFIDENCE · {m.learningVelocity}
          </p>
          <p style={eafLabel}><span style={{ color: EAF.slate }}>More observation:</span> {m.observationNeeded}</p>
        </div>
      ))}
    </section>
  );
}

export function PracticeModePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eafPanel}>
      <p style={eafSectionTitle}>PRACTICE MODE · LEARNING THROUGH COMPARISON</p>
      {store.practiceReviews.map((pr) => (
        <div key={pr.id} className="py-2 border-b" style={{ borderColor: EAF.panelBorder }}>
          <p style={{ ...eafLabel, fontSize: '6px', color: alignmentColor(pr.matchPct), fontFamily: '"Futura PT Medium"' }}>
            {pr.executive.toUpperCase()} · {pr.type.toUpperCase()} · {pr.matchPct}% MATCH
          </p>
          <p style={eafLabel}><span style={{ color: EAF.slate }}>Task:</span> {pr.task}</p>
          <p style={eafLabel}><span style={{ color: EAF.slate }}>Founder:</span> {pr.founderChoice}</p>
          <p style={eafLabel}><span style={{ color: EAF.slate }}>Executive:</span> {pr.executiveRecommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function TrustProgressionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eafPanel}>
      <p style={eafSectionTitle}>TRUST PROGRESSION · AUTHORITY EARNED GRADUALLY</p>
      {store.trustProgressions.map((tp) => (
        <div key={tp.id} className="py-2 border-b" style={{ borderColor: EAF.panelBorder }}>
          <p style={{ ...eafLabel, fontSize: '6px', color: trustLevelColor(tp.currentLevel), fontFamily: '"Futura PT Medium"' }}>
            {tp.executive.toUpperCase()} · {tp.currentLevel.replace(/-/g, ' ').toUpperCase()} · {tp.alignmentPct}% · {tp.reviewsCompleted} REVIEWS
          </p>
          <p style={eafLabel}><span style={{ color: EAF.slate }}>Next level:</span> {tp.nextLevelRequirement}</p>
        </div>
      ))}
    </section>
  );
}

export function SoftApprovalPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...eafPanel, background: EAF.missionBg }}>
      <p style={eafSectionTitle}>SOFT APPROVAL · FOUNDER RETAINS FINAL AUTHORITY</p>
      {store.softApprovalExamples.map((sa) => (
        <div key={sa.id} className="py-2 border-b" style={{ borderColor: EAF.panelBorder }}>
          <p style={{ ...eafLabel, fontSize: '6px', color: EAF.violet, fontFamily: '"Futura PT Medium"' }}>
            {sa.executive.toUpperCase()} · {sa.confidencePct}% CONFIDENCE
          </p>
          <p style={{ ...eafLabel, fontStyle: 'italic' }}>&quot;{sa.statement}&quot;</p>
          <p style={eafLabel}><span style={{ color: EAF.slate }}>Reasoning:</span> {sa.reasoning}</p>
          <p style={eafLabel}><span style={{ color: EAF.slate }}>Historical:</span> {sa.historicalComparisons}</p>
          <p style={eafLabel}><span style={{ color: EAF.slate }}>Evidence:</span> {sa.evidence}</p>
        </div>
      ))}
    </section>
  );
}

export function ChiefOfStaffMentorshipPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eafPanel}>
      <p style={eafSectionTitle}>CHIEF OF STAFF MENTORSHIP · STEWARD OF EXECUTIVE GROWTH</p>
      {store.chiefOfStaffMentorship.map((m) => (
        <div key={m.id} className="py-2 border-b" style={{ borderColor: EAF.panelBorder }}>
          <p style={{ ...eafLabel, fontSize: '6px', color: EAF.violet, fontFamily: '"Futura PT Medium"' }}>
            {m.category.toUpperCase()} · {m.targetExecutive.toUpperCase()}
          </p>
          <p style={eafLabel}>{m.recommendation}</p>
          <p style={{ ...eafLabel, color: EAF.slate }}>{m.rationale}</p>
        </div>
      ))}
    </section>
  );
}

export function LearningLibraryPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eafPanel}>
      <p style={eafSectionTitle}>EXECUTIVE LEARNING LIBRARY · INSTITUTIONAL WISDOM</p>
      {store.learningLibrary.map((item) => (
        <div key={item.id} className="py-2 border-b" style={{ borderColor: EAF.panelBorder }}>
          <p style={{ ...eafLabel, fontSize: '6px', color: EAF.violet, fontFamily: '"Futura PT Medium"' }}>
            {item.category.toUpperCase()}
          </p>
          <p style={eafLabel}>{item.title}</p>
          <p style={{ ...eafLabel, color: EAF.emerald }}>{item.preservedFor}</p>
        </div>
      ))}
    </section>
  );
}

export function ExecutiveGraduationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eafPanel}>
      <p style={eafSectionTitle}>EXECUTIVE GRADUATION · AUTHORITY RECOMMENDATIONS</p>
      {store.executiveGraduations.map((eg) => (
        <div key={eg.id} className="py-2 border-b" style={{ borderColor: EAF.panelBorder }}>
          <p style={{ ...eafLabel, fontSize: '6px', color: actionColor(eg.founderAction), fontFamily: '"Futura PT Medium"' }}>
            {eg.executive.toUpperCase()} · {eg.alignmentPct}% · {eg.founderAction.toUpperCase()}
          </p>
          <p style={eafLabel}>{eg.recommendation}</p>
          <p style={{ ...eafLabel, color: EAF.slate }}>{eg.evidenceBasis}</p>
        </div>
      ))}
    </section>
  );
}

export function FounderDashboardHighlightsPanel({ store }: Pick<Props, 'store'>) {
  const h = store.founderDashboardHighlights;
  return (
    <section className="p-3 mb-3" style={{ ...eafPanel, background: EAF.missionBg }}>
      <p style={eafSectionTitle}>FOUNDER DASHBOARD · CONFIDENCE · TRANSPARENCY · EARNED TRUST</p>
      <p style={{ ...eafSectionTitle, marginTop: 8 }}>EXECUTIVE STRENGTHS</p>
      {h.executiveStrengths.map((s) => (
        <p key={s} style={{ ...eafLabel, color: EAF.emerald }}>· {s}</p>
      ))}
      <p style={{ ...eafSectionTitle, marginTop: 8 }}>RECOMMENDED AUTHORITY CHANGES</p>
      {h.recommendedAuthorityChanges.map((c) => (
        <p key={c} style={eafLabel}>· {c}</p>
      ))}
      <p style={{ ...eafSectionTitle, marginTop: 8 }}>RECENT CALIBRATION IMPROVEMENTS</p>
      {h.recentCalibrationImprovements.map((i) => (
        <p key={i} style={{ ...eafLabel, color: EAF.violet }}>· {i}</p>
      ))}
    </section>
  );
}

export function FutureOpportunitiesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={eafPanel}>
      <p style={eafSectionTitle}>FUTURE VISION · DEEP UNDERSTANDING · NEVER ENDING</p>
      {store.futureOpportunities.map((o) => (
        <p key={o} style={eafLabel}>· {o}</p>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: ExecutiveApprenticeshipWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={eafPanel}>
      <p style={eafSectionTitle}>WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.activeWorkspaceId === id ? EAF.violet : EAF.panelBorder,
              color: store.activeWorkspaceId === id ? EAF.violet : EAF.gray,
              background: store.activeWorkspaceId === id ? 'rgba(124,58,237,0.08)' : 'white',
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
    <section className="p-3 mb-3" style={eafPanel}>
      <p style={eafSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {EAF_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: EAF.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioArrivalExperiencePath()} style={{ ...eafLabel, color: '#0369A1', fontSize: '6px' }}>→ ARRIVAL EXPERIENCE</Link>
        <Link to={adminStudioCompanyOnboardingIntelligencePath()} style={{ ...eafLabel, color: '#0D9488', fontSize: '6px' }}>→ COMPANY ONBOARDING INTELLIGENCE</Link>
        <Link to={adminStudioOrganizationalIntelligencePath()} style={{ ...eafLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INTELLIGENCE</Link>
        <Link to={adminStudioOrganizationalMaturityModelPath()} style={{ ...eafLabel, color: '#D97706', fontSize: '6px' }}>→ ORGANIZATIONAL MATURITY MODEL</Link>
        <Link to={adminStudioExecutiveFrameworkPath()} style={{ ...eafLabel, color: '#334155', fontSize: '6px' }}>→ EXECUTIVE FRAMEWORK</Link>
        <Link to={adminStudioLeadershipManifestoFrameworkPath()} style={{ ...eafLabel, color: '#334155', fontSize: '6px' }}>→ LEADERSHIP MANIFESTO</Link>
        <Link to={adminStudioExecutiveCouncilPath()} style={{ ...eafLabel, color: '#B45309', fontSize: '6px' }}>→ EXECUTIVE COUNCIL</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...eafLabel, color: '#334155', fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioChiefBrandOfficerPath()} style={{ ...eafLabel, color: '#7C3AED', fontSize: '6px' }}>→ CHIEF BRAND OFFICER</Link>
        <Link to={adminStudioChiefExperienceOfficerPath()} style={{ ...eafLabel, color: '#0891B2', fontSize: '6px' }}>→ CHIEF EXPERIENCE OFFICER</Link>
        <Link to={adminStudioChiefDigitalOfficerPath()} style={{ ...eafLabel, color: '#6366F1', fontSize: '6px' }}>→ CHIEF DIGITAL OFFICER</Link>
        <Link to={adminStudioChiefTechnologyOfficerPath()} style={{ ...eafLabel, color: '#2563EB', fontSize: '6px' }}>→ CHIEF TECHNOLOGY OFFICER</Link>
        <Link to={adminStudioChiefGrowthOfficerPath()} style={{ ...eafLabel, color: '#059669', fontSize: '6px' }}>→ CHIEF GROWTH OFFICER</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...eafLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...eafLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...eafLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...eafLabel, color: '#6366F1', fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
        <Link to={adminStudioStudioInstitutePath()} style={{ ...eafLabel, color: '#854D0E', fontSize: '6px' }}>→ STUDIO INSTITUTE</Link>
        <Link to={adminStudioOrganizationalApprenticeshipPath()} style={{ ...eafLabel, color: '#155E75', fontSize: '6px' }}>→ ORGANIZATIONAL APPRENTICESHIP</Link>
        <Link to={adminStudioExecutiveApprenticeshipFounderCalibrationPath()} style={{ ...eafLabel, color: '#7C3AED', fontSize: '6px' }}>→ EXECUTIVE APPRENTICESHIP</Link>
      </div>
    </section>
  );
}
