import { Link } from 'react-router-dom';
import type {
  CompanyOnboardingIntelligenceStore,
  CompanyOnboardingIntelligenceWorkspaceId,
} from '../../../../studio-os-core/company-onboarding-intelligence/types';
import { COI_CONNECTED_SYSTEMS } from '../../../../studio-os-core/company-onboarding-intelligence/constants';
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
  adminStudioDigitalArchitectPath,
  adminStudioExecutiveCouncilPath,
  adminStudioExecutiveFrameworkPath,
  adminStudioExperienceArchitectPath,
  adminStudioFounderWalkPath,
  adminStudioFoundersPromisePath,
  adminStudioGrowthArchitectPath,
  adminStudioLeadershipModesPath,
  adminStudioOrganizationalIntelligencePath,
  adminStudioOrganizationalMaturityModelPath,
  adminStudioReaderGraphPath,
  adminStudioRelationshipEnginePath,
  adminStudioStudioIntelligencePath,
} from '../../../../utils/adminStudioRoutes';
import {
  COMPANY_ONBOARDING_INTELLIGENCE_STYLES,
  COI,
  coiDarkHeader,
  coiLabel,
  coiLiveDot,
  coiPanel,
  coiSectionTitle,
  coiValue,
  scoreColor,
  statusColor,
} from './companyOnboardingIntelligenceTheme';

type Props = {
  store: CompanyOnboardingIntelligenceStore;
  onSelectWorkspace: (id: CompanyOnboardingIntelligenceWorkspaceId) => void;
};

export function CompanyOnboardingIntelligenceHeader() {
  return (
    <>
      <style>{COMPANY_ONBOARDING_INTELLIGENCE_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...coiDarkHeader, borderTop: `3px solid ${COI.teal}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          COMPANY ONBOARDING INTELLIGENCE
        </p>
        <p style={{ ...coiLabel, color: '#99F6E4' }}>
          <span style={coiLiveDot} />
          INTELLIGENT ONBOARDING · V1.0 · WELCOME TO YOUR HEADQUARTERS
        </p>
        <p style={{ ...coiLabel, color: '#CCFBF1', marginTop: 4 }}>
          DISCOVER THE STORY · FEEL UNDERSTOOD · ARRIVE — NEVER &quot;SETUP COMPLETE&quot;
        </p>
      </header>
    </>
  );
}

export function CoiDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={{ ...coiPanel, background: COI.missionBg }}>
      <p style={coiSectionTitle}>ONBOARDING DASHBOARD · ORGANIZATIONAL WELCOME</p>
      <p style={{ ...coiLabel, color: COI.teal, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...coiLabel, color: COI.teal, marginTop: 4 }}>
        {store.companyName} · {d.journeyLabel} · CONFIDENCE {d.confidenceScorePct}%
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['DISCOVERIES', `${d.discoveriesCount}`],
          ['RECOMMENDATIONS', `${d.recommendationsCount}`],
          ['CAMPUS', d.campusReady ? 'READY' : 'BUILDING'],
          ['ARRIVAL', d.arrivalReady ? 'READY' : 'PREPARING'],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: COI.panelBorder }}>
            <p style={{ ...coiValue, fontSize: '12px' }}>{val}</p>
            <p style={coiLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function OnboardingPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={coiPanel}>
      <p style={coiSectionTitle}>ONBOARDING PHILOSOPHY · UNDERSTANDING BEFORE MANAGEMENT</p>
      {store.onboardingPhilosophy.map((line) => (
        <p key={line} style={{ ...coiLabel, color: COI.teal }}>· {line}</p>
      ))}
    </section>
  );
}

export function OnboardingJourneysPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={coiPanel}>
      <p style={coiSectionTitle}>TWO ONBOARDING JOURNEYS · CONVERGE TO SAME OS</p>
      {store.onboardingJourneys.map((j) => (
        <div key={j.id} className="py-2 border-b" style={{ borderColor: COI.panelBorder }}>
          <p style={{ ...coiLabel, fontSize: '6px', color: j.active ? COI.teal : COI.stone, fontFamily: '"Futura PT Medium"' }}>
            {j.label} {j.active ? '· ACTIVE JOURNEY' : ''}
          </p>
          <p style={coiLabel}>{j.description}</p>
          {j.steps.map((step) => (
            <p key={step} style={{ ...coiLabel, color: COI.stone }}>· {step}</p>
          ))}
        </div>
      ))}
    </section>
  );
}

export function OrganizationalInterviewPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={coiPanel}>
      <p style={coiSectionTitle}>ORGANIZATIONAL INTERVIEW · THOUGHTFUL CONVERSATION</p>
      {store.organizationalInterviews.map((i) => (
        <div key={i.id} className="py-2 border-b" style={{ borderColor: COI.panelBorder }}>
          <p style={{ ...coiLabel, fontSize: '6px', color: statusColor(i.status), fontFamily: '"Futura PT Medium"' }}>
            {i.status.toUpperCase()}
          </p>
          <p style={{ ...coiLabel, color: COI.teal, fontFamily: '"Futura PT Medium"' }}>{i.question}</p>
          {i.response && <p style={coiLabel}>{i.response}</p>}
        </div>
      ))}
    </section>
  );
}

export function OrganizationalDiscoveryPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={coiPanel}>
      <p style={coiSectionTitle}>ORGANIZATIONAL DISCOVERY · TRANSPARENT FINDINGS</p>
      {store.organizationalDiscoveries.map((d) => (
        <div key={d.id} className="py-1 border-b flex justify-between gap-2" style={{ borderColor: COI.panelBorder }}>
          <div>
            <p style={{ ...coiLabel, fontSize: '6px', color: COI.teal, fontFamily: '"Futura PT Medium"' }}>{d.category.toUpperCase()}</p>
            <p style={coiLabel}>{d.finding}</p>
          </div>
          <p style={{ ...coiLabel, color: scoreColor(d.confidence), whiteSpace: 'nowrap' }}>{d.confidence}%</p>
        </div>
      ))}
    </section>
  );
}

export function OnboardingRecommendationsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={coiPanel}>
      <p style={coiSectionTitle}>EXECUTIVE RECOMMENDATIONS · WHY · VALUE · OUTCOME</p>
      {store.onboardingRecommendations.map((r) => (
        <div key={r.id} className="py-2 border-b" style={{ borderColor: COI.panelBorder }}>
          <p style={{ ...coiLabel, fontSize: '6px', color: COI.teal, fontFamily: '"Futura PT Medium"' }}>
            {r.category.toUpperCase()} · {r.recommendation}
          </p>
          <p style={{ ...coiLabel, color: COI.stone }}>WHY: {r.why}</p>
          <p style={coiLabel}>VALUE: {r.value}</p>
          <p style={{ ...coiLabel, color: COI.emerald }}>OUTCOME: {r.outcome}</p>
        </div>
      ))}
    </section>
  );
}

export function OrganizationBlueprintPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={coiPanel}>
      <p style={coiSectionTitle}>ORGANIZATION BLUEPRINT · LIVING FOUNDATION</p>
      {store.organizationBlueprint.map((b) => (
        <div key={b.id} className="py-2 border-b" style={{ borderColor: COI.panelBorder }}>
          <p style={{ ...coiLabel, fontSize: '6px', color: statusColor(b.status), fontFamily: '"Futura PT Medium"' }}>
            {b.section.toUpperCase()} · {b.status.toUpperCase()}
          </p>
          <p style={coiLabel}>{b.content}</p>
        </div>
      ))}
    </section>
  );
}

export function CampusGenerationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={coiPanel}>
      <p style={coiSectionTitle}>CAMPUS GENERATION · HEADQUARTERS THAT FEELS LIKE HOME</p>
      {store.campusGeneration.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: COI.panelBorder }}>
          <p style={{ ...coiLabel, fontSize: '6px', color: COI.teal, fontFamily: '"Futura PT Medium"' }}>{c.element.toUpperCase()}</p>
          <p style={coiLabel}>{c.adaptation}</p>
          <p style={{ ...coiLabel, color: COI.stone }}>FEELING: {c.feeling}</p>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalConfidencePanel({ store }: Pick<Props, 'store'>) {
  const c = store.organizationalConfidence;
  return (
    <section className="p-3 mb-3" style={coiPanel}>
      <p style={coiSectionTitle}>ORGANIZATIONAL CONFIDENCE · CONTINUOUS IMPROVEMENT</p>
      <p style={{ ...coiLabel, color: scoreColor(c.overallScorePct), fontFamily: '"Futura PT Medium"' }}>
        OVERALL {c.overallScorePct}% · KNOWLEDGE {c.knowledgeCompletenessPct}%
      </p>
      <p style={{ ...coiSectionTitle, marginTop: 12 }}>RECOMMENDED INTERVIEWS</p>
      {c.recommendedInterviews.map((i) => <p key={i} style={coiLabel}>· {i}</p>)}
      <p style={{ ...coiSectionTitle, marginTop: 12 }}>RECOMMENDED UPLOADS</p>
      {c.recommendedUploads.map((u) => <p key={u} style={coiLabel}>· {u}</p>)}
      <p style={{ ...coiSectionTitle, marginTop: 12 }}>RECOMMENDED INTEGRATIONS</p>
      {c.recommendedIntegrations.map((i) => <p key={i} style={coiLabel}>· {i}</p>)}
      <p style={{ ...coiSectionTitle, marginTop: 12 }}>RECOMMENDED TRAINING</p>
      {c.recommendedTraining.map((t) => <p key={t} style={coiLabel}>· {t}</p>)}
    </section>
  );
}

export function ChiefOfStaffWelcomePanel({ store }: Pick<Props, 'store'>) {
  const w = store.chiefOfStaffWelcome;
  return (
    <section className="p-3 mb-3" style={{ ...coiPanel, background: COI.missionBg }}>
      <p style={coiSectionTitle}>CHIEF OF STAFF WELCOME · CINEMATIC ARRIVAL</p>
      <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '18px', color: COI.teal, margin: '8px 0' }}>
        {w.headline}
      </p>
      {w.message.map((line) => (
        <p key={line} style={{ ...coiLabel, color: COI.teal, fontSize: '8px', marginTop: 6 }}>{line}</p>
      ))}
      <p style={{ ...coiLabel, color: COI.stone, marginTop: 12, fontStyle: 'italic' }}>{w.arrivalNote}</p>
    </section>
  );
}

export function FounderWalkPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={coiPanel}>
      <p style={coiSectionTitle}>FOUNDER WALK · GUIDED HEADQUARTERS TOUR</p>
      {[...store.founderWalk].sort((a, b) => a.order - b.order).map((step) => (
        <div key={step.id} className="py-2 border-b" style={{ borderColor: COI.panelBorder }}>
          <p style={{ ...coiLabel, fontSize: '6px', color: COI.teal, fontFamily: '"Futura PT Medium"' }}>
            STOP {step.order} · {step.stop.toUpperCase()}
          </p>
          <p style={coiLabel}>{step.introduction}</p>
        </div>
      ))}
      <p style={{ ...coiLabel, color: COI.stone, marginTop: 8 }}>NOT A SOFTWARE TUTORIAL — WALKING THROUGH YOUR COMPANY FOR THE FIRST TIME</p>
    </section>
  );
}

export function RecommendedNextStepsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={coiPanel}>
      <p style={coiSectionTitle}>RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...coiLabel, color: COI.teal }}>· {step}</p>
      ))}
      {store.futureOpportunities.map((opp) => (
        <p key={opp} style={{ ...coiLabel, color: COI.stone }}>FUTURE: {opp}</p>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: CompanyOnboardingIntelligenceWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={coiPanel}>
      <p style={coiSectionTitle}>WORKSPACE · ONBOARDING CONTEXT</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.activeWorkspaceId === id ? COI.teal : COI.panelBorder,
              color: store.activeWorkspaceId === id ? COI.teal : COI.gray,
              background: store.activeWorkspaceId === id ? 'rgba(13,148,136,0.08)' : 'white',
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
    <section className="p-3 mb-3" style={coiPanel}>
      <p style={coiSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {COI_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: COI.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioOrganizationalMaturityModelPath()} style={{ ...coiLabel, color: '#D97706', fontSize: '6px' }}>→ ORGANIZATIONAL MATURITY MODEL</Link>
        <Link to={adminStudioLeadershipModesPath()} style={{ ...coiLabel, color: '#4F46E5', fontSize: '6px' }}>→ LEADERSHIP MODES</Link>
        <Link to={adminStudioOrganizationalIntelligencePath()} style={{ ...coiLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INTELLIGENCE</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...coiLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...coiLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioReaderGraphPath()} style={{ ...coiLabel, color: '#059669', fontSize: '6px' }}>→ READER GRAPH</Link>
        <Link to={adminStudioExecutiveFrameworkPath()} style={{ ...coiLabel, color: '#334155', fontSize: '6px' }}>→ EXECUTIVE FRAMEWORK</Link>
        <Link to={adminStudioExecutiveCouncilPath()} style={{ ...coiLabel, color: '#B45309', fontSize: '6px' }}>→ EXECUTIVE COUNCIL</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...coiLabel, color: '#334155', fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioChiefBrandOfficerPath()} style={{ ...coiLabel, color: '#7C3AED', fontSize: '6px' }}>→ CHIEF BRAND OFFICER</Link>
        <Link to={adminStudioChiefExperienceOfficerPath()} style={{ ...coiLabel, color: '#0891B2', fontSize: '6px' }}>→ CHIEF EXPERIENCE OFFICER</Link>
        <Link to={adminStudioChiefDigitalOfficerPath()} style={{ ...coiLabel, color: '#6366F1', fontSize: '6px' }}>→ CHIEF DIGITAL OFFICER</Link>
        <Link to={adminStudioChiefTechnologyOfficerPath()} style={{ ...coiLabel, color: '#2563EB', fontSize: '6px' }}>→ CHIEF TECHNOLOGY OFFICER</Link>
        <Link to={adminStudioChiefGrowthOfficerPath()} style={{ ...coiLabel, color: '#059669', fontSize: '6px' }}>→ CHIEF GROWTH OFFICER</Link>
        <Link to={adminStudioBrandArchitectPath()} style={{ ...coiLabel, color: '#9333EA', fontSize: '6px' }}>→ BRAND ARCHITECT</Link>
        <Link to={adminStudioExperienceArchitectPath()} style={{ ...coiLabel, color: '#0891B2', fontSize: '6px' }}>→ EXPERIENCE ARCHITECT</Link>
        <Link to={adminStudioDigitalArchitectPath()} style={{ ...coiLabel, color: '#6366F1', fontSize: '6px' }}>→ DIGITAL ARCHITECT</Link>
        <Link to={adminStudioGrowthArchitectPath()} style={{ ...coiLabel, color: '#059669', fontSize: '6px' }}>→ GROWTH ARCHITECT</Link>
        <Link to={adminStudioCampusEvolutionEnginePath()} style={{ ...coiLabel, color: '#CA8A04', fontSize: '6px' }}>→ CAMPUS EVOLUTION ENGINE</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...coiLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioFounderWalkPath()} style={{ ...coiLabel, color: '#CA8A04', fontSize: '6px' }}>→ FOUNDER WALK</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...coiLabel, color: '#6366F1', fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
      </div>
    </section>
  );
}
