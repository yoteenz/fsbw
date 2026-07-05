import { Link } from 'react-router-dom';
import type {
  ArrivalExperienceStore,
  ArrivalExperienceWorkspaceId,
} from '../../../../studio-os-core/arrival-experience/types';
import { AE_CONNECTED_SYSTEMS } from '../../../../studio-os-core/arrival-experience/constants';
import {
  adminStudioArrivalExperiencePath,
  adminStudioCampusEvolutionEnginePath,
  adminStudioChiefOfStaffPath,
  adminStudioCompanyGenomePath,
  adminStudioCompanyOnboardingIntelligencePath,
  adminStudioExecutiveApprenticeshipFounderCalibrationPath,
  adminStudioExecutiveCouncilPath,
  adminStudioExecutiveFrameworkPath,
  adminStudioFoundersPromisePath,
  adminStudioOrganizationalIntelligencePath,
  adminStudioOrganizationalMaturityModelPath,
  adminStudioStudioIntelligencePath,
} from '../../../../utils/adminStudioRoutes';
import {
  ARRIVAL_EXPERIENCE_STYLES,
  AE,
  aeDarkHeader,
  aeLabel,
  aeLiveDot,
  aePanel,
  aeSectionTitle,
  aeValue,
  timingColor,
} from './arrivalExperienceTheme';

type Props = {
  store: ArrivalExperienceStore;
  onSelectWorkspace: (id: ArrivalExperienceWorkspaceId) => void;
};

export function ArrivalExperienceHeader() {
  return (
    <>
      <style>{ARRIVAL_EXPERIENCE_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...aeDarkHeader, borderTop: `3px solid ${AE.sky}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          ARRIVAL EXPERIENCE
        </p>
        <p style={{ ...aeLabel, color: '#BAE6FD' }}>
          <span style={aeLiveDot} />
          CEREMONIAL HEADQUARTERS WELCOME · V1.0 · YOUR ORGANIZATION HAS A HOME
        </p>
        <p style={{ ...aeLabel, color: '#E0F2FE', marginTop: 4 }}>
          QUIET CONFIDENCE · CINEMATIC · MEANINGFUL — NEVER &quot;SETUP COMPLETE&quot;
        </p>
      </header>
    </>
  );
}

export function AeDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={{ ...aePanel, background: AE.missionBg }}>
      <p style={aeSectionTitle}>ARRIVAL DASHBOARD · HEADQUARTERS LIVE</p>
      <p style={{ ...aeLabel, color: AE.sky, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...aeLabel, color: AE.sky, marginTop: 4 }}>
        {store.companyName} · PHASE {store.arrivalPhase.toUpperCase()} · SEQUENCE {d.sequenceProgressPct}%
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['EXECUTIVES', `${d.executivesIntroduced}`],
          ['TOUR STOPS', `${d.tourStopsComplete}`],
          ['HEADQUARTERS', d.headquartersLive ? 'LIVE' : 'AWAKENING'],
          ['ARRIVAL', d.arrivalComplete ? 'HOME' : 'IN PROGRESS'],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: AE.panelBorder }}>
            <p style={{ ...aeValue, fontSize: '12px' }}>{val}</p>
            <p style={aeLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ArrivalPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={aePanel}>
      <p style={aeSectionTitle}>ARRIVAL PHILOSOPHY · MEMORABLE BEGINNINGS</p>
      {store.arrivalPhilosophy.map((line) => (
        <p key={line} style={{ ...aeLabel, color: AE.sky }}>· {line}</p>
      ))}
    </section>
  );
}

export function ArrivalSequencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={aePanel}>
      <p style={aeSectionTitle}>ARRIVAL SEQUENCE · CAMPUS COMING ALIVE</p>
      {store.arrivalSequence.map((step) => (
        <div key={step.id} className="py-2 border-b" style={{ borderColor: AE.panelBorder }}>
          <p style={{ ...aeLabel, fontSize: '6px', color: AE.sky, fontFamily: '"Futura PT Medium"' }}>
            {step.order}. {step.phase.toUpperCase()} · {step.atmosphere}
          </p>
          <p style={aeLabel}>{step.description}</p>
        </div>
      ))}
    </section>
  );
}

export function ChiefOfStaffArrivalWelcomePanel({ store }: Pick<Props, 'store'>) {
  const w = store.chiefOfStaffWelcome;
  return (
    <section className="p-3 mb-3" style={{ ...aePanel, background: AE.missionBg }}>
      <p style={aeSectionTitle}>CHIEF OF STAFF WELCOME · PERSONAL GREETING</p>
      <p style={{ ...aeValue, fontSize: '14px', fontFamily: '"Covered By Your Grace", sans-serif', color: AE.sky }}>
        {w.headline}
      </p>
      {w.message.map((line) => (
        <p key={line} style={{ ...aeLabel, color: AE.slate, marginTop: 6, fontSize: '8px' }}>{line}</p>
      ))}
      <p style={{ ...aeLabel, color: AE.amber, marginTop: 8, fontSize: '6px' }}>TONE: {w.tone}</p>
      <p style={{ ...aeLabel, color: AE.sky, marginTop: 4, fontStyle: 'italic' }}>{w.closingNote}</p>
    </section>
  );
}

export function ExecutiveIntroductionsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={aePanel}>
      <p style={aeSectionTitle}>EXECUTIVE INTRODUCTIONS · MEET IN THEIR WORKSPACE</p>
      {store.executiveIntroductions.map((exec) => (
        <div key={exec.id} className="py-2 border-b" style={{ borderColor: AE.panelBorder }}>
          <p style={{ ...aeLabel, fontSize: '6px', color: AE.sky, fontFamily: '"Futura PT Medium"' }}>
            {exec.executive.toUpperCase()} · {exec.workspace.toUpperCase()}
          </p>
          <p style={aeLabel}><span style={{ color: AE.slate }}>Purpose:</span> {exec.purpose}</p>
          <p style={aeLabel}><span style={{ color: AE.slate }}>Responsibilities:</span> {exec.responsibilities}</p>
          <p style={aeLabel}><span style={{ color: AE.slate }}>Philosophy:</span> {exec.leadershipPhilosophy}</p>
          <p style={aeLabel}><span style={{ color: AE.slate }}>Compass:</span> {exec.executiveCompass}</p>
          <p style={{ ...aeLabel, color: AE.emerald }}><span style={{ color: AE.slate }}>Supports founder:</span> {exec.founderSupport}</p>
        </div>
      ))}
    </section>
  );
}

export function HeadquartersTourPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={aePanel}>
      <p style={aeSectionTitle}>HEADQUARTERS TOUR · LIVING CAMPUS EXPLORATION</p>
      {store.headquartersTour.map((stop) => (
        <div key={stop.id} className="py-2 border-b" style={{ borderColor: AE.panelBorder }}>
          <p style={{ ...aeLabel, fontSize: '6px', color: AE.sky, fontFamily: '"Futura PT Medium"' }}>
            STOP {stop.order} · {stop.stop.toUpperCase()}
          </p>
          <p style={aeLabel}>{stop.introduction}</p>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalRevealPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={aePanel}>
      <p style={aeSectionTitle}>ORGANIZATIONAL REVEAL · INTENTIONAL DISCOVERY</p>
      {store.organizationalReveal.map((item) => (
        <div key={item.id} className="py-2 border-b" style={{ borderColor: AE.panelBorder }}>
          <p style={{ ...aeLabel, fontSize: '6px', color: timingColor(item.timing), fontFamily: '"Futura PT Medium"' }}>
            {item.element.toUpperCase()} · {item.timing.toUpperCase()} REVEAL
          </p>
          <p style={aeLabel}>{item.reveal}</p>
        </div>
      ))}
    </section>
  );
}

export function EnvironmentalStorytellingPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={aePanel}>
      <p style={aeSectionTitle}>ENVIRONMENTAL STORYTELLING · HEADQUARTERS IDENTITY</p>
      {store.environmentalStorytelling.map((story) => (
        <div key={story.id} className="py-2 border-b" style={{ borderColor: AE.panelBorder }}>
          <p style={{ ...aeLabel, fontSize: '6px', color: AE.sky, fontFamily: '"Futura PT Medium"' }}>
            {story.signal.toUpperCase()} · {story.atmosphere}
          </p>
          <p style={aeLabel}>{story.expression}</p>
        </div>
      ))}
    </section>
  );
}

export function FirstExecutiveBriefingPanel({ store }: Pick<Props, 'store'>) {
  const b = store.firstExecutiveBriefing;
  return (
    <section className="p-3 mb-3" style={{ ...aePanel, background: AE.missionBg }}>
      <p style={aeSectionTitle}>FIRST EXECUTIVE BRIEFING · WHERE THE ORGANIZATION STANDS</p>
      <p style={{ ...aeLabel, color: AE.sky, fontFamily: '"Futura PT Medium"' }}>MATURITY: {b.organizationalMaturity}</p>
      <p style={{ ...aeSectionTitle, marginTop: 8 }}>CURRENT PRIORITIES</p>
      {b.currentPriorities.map((p) => (
        <p key={p} style={aeLabel}>· {p}</p>
      ))}
      <p style={{ ...aeSectionTitle, marginTop: 8 }}>RECOMMENDED EXECUTIVES</p>
      <p style={aeLabel}>{b.recommendedExecutives.join(' · ')}</p>
      <p style={{ ...aeSectionTitle, marginTop: 8 }}>RECOMMENDED ARCHITECTS</p>
      <p style={aeLabel}>{b.recommendedArchitects.join(' · ')}</p>
      <p style={{ ...aeSectionTitle, marginTop: 8 }}>IMMEDIATE OPPORTUNITIES</p>
      {b.immediateOpportunities.map((o) => (
        <p key={o} style={aeLabel}>· {o}</p>
      ))}
      <p style={{ ...aeSectionTitle, marginTop: 8 }}>ORGANIZATIONAL STRENGTHS</p>
      {b.organizationalStrengths.map((s) => (
        <p key={s} style={{ ...aeLabel, color: AE.emerald }}>· {s}</p>
      ))}
      <p style={{ ...aeSectionTitle, marginTop: 8 }}>NEXT MILESTONE</p>
      <p style={aeLabel}>{b.nextMilestone}</p>
      <p style={{ ...aeSectionTitle, marginTop: 8 }}>TODAY&apos;S SUGGESTED FOCUS</p>
      <p style={{ ...aeLabel, color: AE.sky, fontFamily: '"Futura PT Medium"' }}>{b.todaysFocus}</p>
    </section>
  );
}

export function ArrivalMemoryPanel({ store }: Pick<Props, 'store'>) {
  const m = store.arrivalMemory;
  return (
    <section className="p-3 mb-3" style={aePanel}>
      <p style={aeSectionTitle}>ARRIVAL MEMORY · PRESERVED FOR FUTURE GENERATIONS</p>
      <p style={aeLabel}><span style={{ color: AE.slate }}>Arrival date:</span> {m.arrivalDate}</p>
      <p style={aeLabel}><span style={{ color: AE.slate }}>Organization&apos;s first day:</span> {m.organizationFirstDay}</p>
      <p style={aeLabel}><span style={{ color: AE.slate }}>Initial maturity:</span> {m.initialMaturity}</p>
      <p style={aeLabel}><span style={{ color: AE.slate }}>First executive team:</span> {m.firstExecutiveTeam.join(' · ')}</p>
      <p style={aeLabel}><span style={{ color: AE.slate }}>First roadmap:</span> {m.firstRoadmap}</p>
      <p style={aeLabel}><span style={{ color: AE.slate }}>Founder&apos;s first vision:</span> {m.foundersFirstVision}</p>
      <p style={{ ...aeLabel, color: AE.sky, marginTop: 8, fontStyle: 'italic' }}>{m.preservedNote}</p>
    </section>
  );
}

export function FinalMessagePanel({ store }: Pick<Props, 'store'>) {
  const f = store.finalMessage;
  return (
    <section className="p-3 mb-3" style={{ ...aePanel, background: AE.missionBg, borderLeft: `4px solid ${AE.sky}` }}>
      <p style={aeSectionTitle}>WELCOME HOME · FINAL MESSAGE FROM CHIEF OF STAFF</p>
      <p style={{ ...aeValue, fontSize: '16px', fontFamily: '"Covered By Your Grace", sans-serif', color: AE.sky }}>
        {f.headline}
      </p>
      <p style={{ ...aeLabel, color: AE.slate, marginTop: 8, fontSize: '9px' }}>{f.message}</p>
    </section>
  );
}

export function FutureOpportunitiesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={aePanel}>
      <p style={aeSectionTitle}>FUTURE VISION · ARRIVAL EVOLUTION</p>
      {store.futureOpportunities.map((o) => (
        <p key={o} style={aeLabel}>· {o}</p>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Props) {
  const workspaces: ArrivalExperienceWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={aePanel}>
      <p style={aeSectionTitle}>WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.activeWorkspaceId === id ? AE.sky : AE.panelBorder,
              color: store.activeWorkspaceId === id ? AE.sky : AE.gray,
              background: store.activeWorkspaceId === id ? 'rgba(3,105,161,0.08)' : 'white',
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
    <section className="p-3 mb-3" style={aePanel}>
      <p style={aeSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {AE_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: AE.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioCompanyOnboardingIntelligencePath()} style={{ ...aeLabel, color: '#0D9488', fontSize: '6px' }}>→ COMPANY ONBOARDING INTELLIGENCE</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...aeLabel, color: '#334155', fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...aeLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioOrganizationalMaturityModelPath()} style={{ ...aeLabel, color: '#D97706', fontSize: '6px' }}>→ ORGANIZATIONAL MATURITY MODEL</Link>
        <Link to={adminStudioExecutiveFrameworkPath()} style={{ ...aeLabel, color: '#334155', fontSize: '6px' }}>→ EXECUTIVE FRAMEWORK</Link>
        <Link to={adminStudioExecutiveCouncilPath()} style={{ ...aeLabel, color: '#B45309', fontSize: '6px' }}>→ EXECUTIVE COUNCIL</Link>
        <Link to={adminStudioOrganizationalIntelligencePath()} style={{ ...aeLabel, color: '#4F46E5', fontSize: '6px' }}>→ ORGANIZATIONAL INTELLIGENCE</Link>
        <Link to={adminStudioCampusEvolutionEnginePath()} style={{ ...aeLabel, color: '#CA8A04', fontSize: '6px' }}>→ CAMPUS EVOLUTION ENGINE</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...aeLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...aeLabel, color: '#6366F1', fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
        <Link to={adminStudioExecutiveApprenticeshipFounderCalibrationPath()} style={{ ...aeLabel, color: '#7C3AED', fontSize: '6px' }}>→ EXECUTIVE APPRENTICESHIP</Link>
        <Link to={adminStudioArrivalExperiencePath()} style={{ ...aeLabel, color: '#0369A1', fontSize: '6px' }}>→ ARRIVAL EXPERIENCE</Link>
      </div>
    </section>
  );
}
