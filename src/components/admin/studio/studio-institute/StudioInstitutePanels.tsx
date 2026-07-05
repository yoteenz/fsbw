import { Link } from 'react-router-dom';
import type {
  StudioInstituteStore,
  StudioInstituteWorkspaceId,
} from '../../../../studio-os-core/studio-institute/types';
import { executiveToConciergeTitle } from '../../../../studio-os-core/concierge-layer/mapping';
import { SI_CONNECTED_SYSTEMS } from '../../../../studio-os-core/studio-institute/constants';
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
  adminStudioExperienceArchitectPath,
  adminStudioFoundersPromisePath,
  adminStudioGrowthArchitectPath,
  adminStudioNdxbookPath,
  adminStudioOrganizationalIntelligencePath,
  adminStudioOrganizationalMaturityModelPath,
  adminStudioReaderGraphPath,
  adminStudioRelationshipEnginePath,
  adminStudioStudioInstitutePath,
  adminStudioOrganizationalApprenticeshipPath,
  adminStudioConciergeLayerPath,
  adminStudioStudioIntelligencePath,
} from '../../../../utils/adminStudioRoutes';
import {
  STUDIO_INSTITUTE_STYLES,
  SI,
  certStatusColor,
  priorityColor,
  siDarkHeader,
  siLabel,
  siLiveDot,
  siPanel,
  siSectionTitle,
  siValue,
} from './studioInstituteTheme';

type Props = {
  store: StudioInstituteStore;
  onSelectWorkspace: (id: StudioInstituteWorkspaceId) => void;
};

export function StudioInstituteHeader() {
  return (
    <>
      <style>{STUDIO_INSTITUTE_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...siDarkHeader, borderTop: `3px solid ${SI.bronze}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          STUDIO INSTITUTE
        </p>
        <p style={{ ...siLabel, color: '#FDE68A' }}>
          <span style={siLiveDot} />
          PERMANENT LEARNING INSTITUTION · V1.0 · ORGANIZATIONAL WISDOM COMPOUNDING
        </p>
        <p style={{ ...siLabel, color: '#FEF3C7', marginTop: 4 }}>
          EXTRAORDINARY ORGANIZATIONS ARE LEARNED BEFORE THEY ARE BUILT
        </p>
      </header>
    </>
  );
}

export function SiDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={{ ...siPanel, background: SI.missionBg }}>
      <p style={siSectionTitle}>INSTITUTE DASHBOARD · LEARNING IN MOTION</p>
      <p style={{ ...siLabel, color: SI.bronze, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...siLabel, color: SI.bronze, marginTop: 4, fontStyle: 'italic' }}>{store.instituteMotto}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-5">
        {[
          ['LEARNERS', `${d.activeLearners}`],
          ['SCHOOLS', `${d.schoolsActive}`],
          ['CONCIERGE MENTORS', `${d.facultyMembers}`],
          ['CERTIFIED', `${d.certificationsEarned}`],
          ['CONTRIBUTIONS', `${d.knowledgeContributions}`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: SI.panelBorder }}>
            <p style={{ ...siValue, fontSize: '12px' }}>{val}</p>
            <p style={siLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function InstitutePhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={siPanel}>
      <p style={siSectionTitle}>INSTITUTE PHILOSOPHY · CULTURE NOT TRAINING</p>
      {store.institutePhilosophy.map((line) => (
        <p key={line} style={{ ...siLabel, color: SI.bronze }}>· {line}</p>
      ))}
    </section>
  );
}

export function LearningCommunitiesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={siPanel}>
      <p style={siSectionTitle}>LEARNING COMMUNITIES · PERSONALIZED JOURNEYS</p>
      {store.learningCommunities.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: SI.panelBorder }}>
          <p style={{ ...siLabel, fontSize: '6px', color: c.active ? SI.bronze : SI.slate, fontFamily: '"Futura PT Medium"' }}>
            {c.role.toUpperCase()} {c.active ? '· ACTIVE' : '· WHEN APPROPRIATE'}
          </p>
          <p style={siLabel}>{c.description}</p>
          <p style={{ ...siLabel, color: SI.emerald }}>{c.personalizedJourney}</p>
        </div>
      ))}
    </section>
  );
}

export function SchoolsOfExcellencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={siPanel}>
      <p style={siSectionTitle}>SCHOOLS OF EXCELLENCE · DEDICATED DISCIPLINES</p>
      {store.schoolsOfExcellence.map((school) => (
        <div key={school.id} className="py-2 border-b" style={{ borderColor: SI.panelBorder }}>
          <p style={{ ...siLabel, fontSize: '6px', color: SI.bronze, fontFamily: '"Futura PT Medium"' }}>
            {school.name.toUpperCase()} · {school.status.toUpperCase()}
          </p>
          <p style={siLabel}>{school.focus}</p>
          <p style={{ ...siLabel, color: SI.slate }}>{school.disciplines.join(' · ')}</p>
        </div>
      ))}
    </section>
  );
}

export function ConciergeMentorsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={siPanel}>
      <p style={siSectionTitle}>CONCIERGE MENTORS · PERSONAL MENTORSHIP · NOT CLASSES</p>
      {store.executiveFaculty.map((fac) => (
        <div key={fac.id} className="py-2 border-b" style={{ borderColor: SI.panelBorder }}>
          <p style={{ ...siLabel, fontSize: '6px', color: SI.bronze, fontFamily: '"Futura PT Medium"' }}>
            {executiveToConciergeTitle(fac.executive).toUpperCase()} · MENTOR
          </p>
          <p style={{ ...siLabel, fontSize: '5px', color: SI.slate }}>Represents {fac.executive}</p>
          <p style={siLabel}>Teaches: {fac.teaches.join(' · ')}</p>
          <p style={{ ...siLabel, color: SI.emerald }}>Source: {fac.source}</p>
        </div>
      ))}
    </section>
  );
}

/** @deprecated Use ConciergeMentorsPanel — executive faculty data unchanged */
export const ExecutiveFacultyPanel = ConciergeMentorsPanel;

export function OrganizationFirstEducationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={siPanel}>
      <p style={siSectionTitle}>ORGANIZATION-FIRST EDUCATION · THE ORG IS THE TEXTBOOK</p>
      {store.organizationFirstLessons.map((lesson) => (
        <div key={lesson.id} className="py-2 border-b" style={{ borderColor: SI.panelBorder }}>
          <p style={{ ...siLabel, fontSize: '6px', color: SI.bronze, fontFamily: '"Futura PT Medium"' }}>
            {lesson.source.toUpperCase()} · {lesson.category.toUpperCase()}
          </p>
          <p style={siLabel}>{lesson.title}</p>
          <p style={{ ...siLabel, color: SI.emerald }}>Why: {lesson.teachesWhy}</p>
        </div>
      ))}
    </section>
  );
}

export function AdaptiveCurriculumPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={siPanel}>
      <p style={siSectionTitle}>ADAPTIVE CURRICULUM · PERSONALIZED PATHS</p>
      {store.adaptiveLearningPaths.map((path) => (
        <div key={path.id} className="py-2 border-b" style={{ borderColor: SI.panelBorder }}>
          <p style={{ ...siLabel, fontSize: '6px', color: SI.bronze, fontFamily: '"Futura PT Medium"' }}>
            {path.learner.toUpperCase()} · {path.role.toUpperCase()} · {path.maturityStage}
          </p>
          <p style={siLabel}>Modules: {path.modules.join(' · ')}</p>
          <p style={siLabel}>Gaps: {path.knowledgeGaps.join(' · ')}</p>
          <p style={{ ...siLabel, color: SI.emerald }}>Aspirations: {path.aspirations}</p>
        </div>
      ))}
    </section>
  );
}

export function ImmersiveLearningPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={siPanel}>
      <p style={siSectionTitle}>IMMERSIVE LEARNING · EXPERIENTIAL NOT INSTRUCTIONAL</p>
      {store.immersiveLearning.map((mod) => (
        <div key={mod.id} className="py-2 border-b" style={{ borderColor: SI.panelBorder }}>
          <p style={{ ...siLabel, fontSize: '6px', color: SI.bronze, fontFamily: '"Futura PT Medium"' }}>
            {mod.type.toUpperCase()} {mod.experiential ? '· EXPERIENTIAL' : ''}
          </p>
          <p style={siLabel}>{mod.title}</p>
          <p style={{ ...siLabel, color: SI.slate }}>{mod.description}</p>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalCertificationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={siPanel}>
      <p style={siSectionTitle}>ORGANIZATIONAL CERTIFICATION · DEMONSTRATED WISDOM</p>
      {store.organizationalCertifications.map((cert) => (
        <div key={cert.id} className="py-2 border-b" style={{ borderColor: SI.panelBorder }}>
          <p style={{ ...siLabel, fontSize: '6px', color: certStatusColor(cert.status), fontFamily: '"Futura PT Medium"' }}>
            {cert.name.toUpperCase()} · {cert.category.toUpperCase()} · {cert.status.toUpperCase()}
          </p>
          <p style={siLabel}>Requirement: {cert.requirement}</p>
          <p style={{ ...siLabel, color: SI.emerald }}>Demonstrates: {cert.demonstrates}</p>
        </div>
      ))}
    </section>
  );
}

export function KnowledgeCompoundingPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={siPanel}>
      <p style={siSectionTitle}>KNOWLEDGE COMPOUNDING · WISDOM ACCUMULATES</p>
      {store.knowledgeCompounding.map((kc) => (
        <div key={kc.id} className="py-2 border-b" style={{ borderColor: SI.panelBorder }}>
          <p style={{ ...siLabel, fontSize: '6px', color: SI.bronze, fontFamily: '"Futura PT Medium"' }}>
            {kc.lesson.toUpperCase()} → {kc.contributesTo.toUpperCase()}
          </p>
          <p style={siLabel}>{kc.benefit}</p>
        </div>
      ))}
    </section>
  );
}

export function InstituteCampusPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...siPanel, background: SI.missionBg }}>
      <p style={siSectionTitle}>STUDIO INSTITUTE CAMPUS · CENTER FOR ORGANIZATIONAL EXCELLENCE</p>
      {store.instituteCampus.map((space) => (
        <div key={space.id} className="py-2 border-b" style={{ borderColor: SI.panelBorder }}>
          <p style={{ ...siLabel, fontSize: '6px', color: SI.bronze, fontFamily: '"Futura PT Medium"' }}>
            {space.space.toUpperCase()} · {space.atmosphere}
          </p>
          <p style={siLabel}>{space.purpose}</p>
        </div>
      ))}
    </section>
  );
}

export function DailyLearningPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={siPanel}>
      <p style={siSectionTitle}>DAILY LEARNING · ORGANIZATIONAL INTELLIGENCE RECOMMENDS</p>
      {store.dailyLearning.map((rec) => (
        <div key={rec.id} className="py-2 border-b" style={{ borderColor: SI.panelBorder }}>
          <p style={{ ...siLabel, fontSize: '6px', color: priorityColor(rec.priority), fontFamily: '"Futura PT Medium"' }}>
            {rec.type.toUpperCase()} · {rec.priority.toUpperCase()} · {rec.recommendedFor}
          </p>
          <p style={siLabel}>{rec.title}</p>
        </div>
      ))}
    </section>
  );
}

export function NdxbookIntegrationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={siPanel}>
      <p style={siSectionTitle}>NDXBOOK INTEGRATION · PUBLISHING ENGINE OF THE INSTITUTE</p>
      {store.ndxbookIntegration.map((flow) => (
        <div key={flow.id} className="py-2 border-b" style={{ borderColor: SI.panelBorder }}>
          <p style={{ ...siLabel, fontSize: '6px', color: SI.bronze, fontFamily: '"Futura PT Medium"' }}>
            {flow.flow.toUpperCase()} → {flow.destination.toUpperCase()}
          </p>
          <p style={siLabel}>{flow.description}</p>
        </div>
      ))}
    </section>
  );
}

export function FutureOpportunitiesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={siPanel}>
      <p style={siSectionTitle}>FUTURE VISION · WORLD&apos;S GREATEST ORGANIZATIONAL LEARNING INSTITUTION</p>
      {store.futureOpportunities.map((o) => (
        <p key={o} style={siLabel}>· {o}</p>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: StudioInstituteWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={siPanel}>
      <p style={siSectionTitle}>WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.activeWorkspaceId === id ? SI.bronze : SI.panelBorder,
              color: store.activeWorkspaceId === id ? SI.bronze : SI.gray,
              background: store.activeWorkspaceId === id ? 'rgba(133,77,14,0.08)' : 'white',
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
    <section className="p-3 mb-3" style={siPanel}>
      <p style={siSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {SI_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: SI.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioExecutiveApprenticeshipFounderCalibrationPath()} style={{ ...siLabel, color: '#7C3AED', fontSize: '6px' }}>→ EXECUTIVE APPRENTICESHIP</Link>
        <Link to={adminStudioOrganizationalIntelligencePath()} style={{ ...siLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INTELLIGENCE</Link>
        <Link to={adminStudioExecutiveCouncilPath()} style={{ ...siLabel, color: '#B45309', fontSize: '6px' }}>→ EXECUTIVE COUNCIL</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...siLabel, color: '#334155', fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioChiefBrandOfficerPath()} style={{ ...siLabel, color: '#7C3AED', fontSize: '6px' }}>→ CHIEF BRAND OFFICER</Link>
        <Link to={adminStudioChiefExperienceOfficerPath()} style={{ ...siLabel, color: '#0891B2', fontSize: '6px' }}>→ CHIEF EXPERIENCE OFFICER</Link>
        <Link to={adminStudioChiefDigitalOfficerPath()} style={{ ...siLabel, color: '#6366F1', fontSize: '6px' }}>→ CHIEF DIGITAL OFFICER</Link>
        <Link to={adminStudioChiefTechnologyOfficerPath()} style={{ ...siLabel, color: '#2563EB', fontSize: '6px' }}>→ CHIEF TECHNOLOGY OFFICER</Link>
        <Link to={adminStudioChiefGrowthOfficerPath()} style={{ ...siLabel, color: '#059669', fontSize: '6px' }}>→ CHIEF GROWTH OFFICER</Link>
        <Link to={adminStudioBrandArchitectPath()} style={{ ...siLabel, color: '#9333EA', fontSize: '6px' }}>→ BRAND ARCHITECT</Link>
        <Link to={adminStudioExperienceArchitectPath()} style={{ ...siLabel, color: '#0891B2', fontSize: '6px' }}>→ EXPERIENCE ARCHITECT</Link>
        <Link to={adminStudioDigitalArchitectPath()} style={{ ...siLabel, color: '#6366F1', fontSize: '6px' }}>→ DIGITAL ARCHITECT</Link>
        <Link to={adminStudioGrowthArchitectPath()} style={{ ...siLabel, color: '#059669', fontSize: '6px' }}>→ GROWTH ARCHITECT</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...siLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioReaderGraphPath()} style={{ ...siLabel, color: '#059669', fontSize: '6px' }}>→ READER GRAPH</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...siLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioCompanyOnboardingIntelligencePath()} style={{ ...siLabel, color: '#0D9488', fontSize: '6px' }}>→ COMPANY ONBOARDING INTELLIGENCE</Link>
        <Link to={adminStudioOrganizationalMaturityModelPath()} style={{ ...siLabel, color: '#D97706', fontSize: '6px' }}>→ ORGANIZATIONAL MATURITY MODEL</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...siLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...siLabel, color: '#6366F1', fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
        <Link to={adminStudioArrivalExperiencePath()} style={{ ...siLabel, color: '#0369A1', fontSize: '6px' }}>→ ARRIVAL EXPERIENCE</Link>
        <Link to={adminStudioNdxbookPath()} style={{ ...siLabel, color: '#334155', fontSize: '6px' }}>→ NDXBOOK</Link>
        <Link to={adminStudioStudioInstitutePath()} style={{ ...siLabel, color: '#854D0E', fontSize: '6px' }}>→ STUDIO INSTITUTE</Link>
        <Link to={adminStudioConciergeLayerPath()} style={{ ...siLabel, color: '#92704A', fontSize: '6px' }}>→ CONCIERGE LAYER</Link>
        <Link to={adminStudioOrganizationalApprenticeshipPath()} style={{ ...siLabel, color: '#155E75', fontSize: '6px' }}>→ ORGANIZATIONAL APPRENTICESHIP</Link>
      </div>
    </section>
  );
}
