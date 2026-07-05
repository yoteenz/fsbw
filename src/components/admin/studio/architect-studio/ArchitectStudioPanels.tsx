import { Link } from 'react-router-dom';
import type {
  ArchitectStudioId,
  ArchitectStudioStore,
  ArchitectStudioWorkspaceId,
  SpatialNavMode,
} from '../../../../studio-os-core/architect-studio/types';
import { ARCHITECT_STUDIO_CONNECTED_SYSTEMS } from '../../../../studio-os-core/architect-studio/constants';
import {
  adminStudioBrandArchitectPath,
  adminStudioChiefOfStaffPath,
  adminStudioCompanyGenomePath,
  adminStudioCompanyMaturityEnginePath,
  adminStudioDigitalArchitectPath,
  adminStudioExperienceArchitectPath,
  adminStudioGrowthArchitectPath,
  adminStudioOrganizationalInheritancePath,
} from '../../../../utils/adminStudioRoutes';
import {
  ARCHITECT_STUDIO_STYLES,
  AS,
  asDarkHeader,
  asLabel,
  asLiveDot,
  asPanel,
  asSectionTitle,
  asValue,
  priorityColor,
  scoreColor,
  availabilityColor,
} from './architectStudioTheme';

type Props = {
  store: ArchitectStudioStore;
  onSelectWorkspace: (id: ArchitectStudioWorkspaceId) => void;
  onSetSpatialMode: (mode: SpatialNavMode) => void;
  onFocusStudio: (id: ArchitectStudioId | null) => void;
};

const STUDIO_PATHS: Record<ArchitectStudioId, () => string> = {
  'business-studio': adminStudioCompanyMaturityEnginePath,
  'brand-studio': adminStudioBrandArchitectPath,
  'experience-studio': adminStudioExperienceArchitectPath,
  'digital-studio': adminStudioDigitalArchitectPath,
  'growth-studio': adminStudioGrowthArchitectPath,
};

const STUDIO_GRID: Record<ArchitectStudioId, string> = {
  'business-studio': '1 / 1',
  'brand-studio': '1 / 3',
  'experience-studio': '3 / 1',
  'digital-studio': '3 / 3',
  'growth-studio': '3 / 2',
};

export function ArchitectStudioHeader() {
  return (
    <>
      <style>{ARCHITECT_STUDIO_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...asDarkHeader, borderTop: `3px solid ${AS.gold}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          ARCHITECT STUDIO
        </p>
        <p style={{ ...asLabel, color: '#94A3B8' }}>
          <span style={asLiveDot} />
          LIVING HEADQUARTERS V1.5 · ARRIVE AT WORK · NOT OPEN SOFTWARE
        </p>
        <p style={{ ...asLabel, color: '#CBD5E1', marginTop: 4 }}>
          ORGANIZATION ALREADY IN MOTION · CALM INTELLIGENCE · PRESENCE
        </p>
      </header>
    </>
  );
}

export function StudioDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={asPanel}>
      <p style={asSectionTitle}>LIVING HEADQUARTERS · INNOVATION HQ</p>
      <p style={{ ...asLabel, color: AS.gold, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...asLabel, color: AS.gold, marginTop: 4 }}>
        {store.companyName} · MODE: {d.activeSpatialMode.replace(/-/g, ' ').toUpperCase()}
      </p>
      <p style={{ ...asValue, fontSize: '20px', marginTop: 8 }}>{d.studioHealthPct}% STUDIO HEALTH</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['PROJECTS', `${d.activeProjects}`],
          ['COLLABORATION', `${d.collaborationScorePct}%`],
          ['INNOVATION', `${d.innovationPct}%`],
          ['GENOME SYNC', `${d.genomeSyncPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: AS.panelBorder }}>
            <p style={{ ...asValue, fontSize: '12px' }}>{val}</p>
            <p style={asLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StudioPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={asPanel}>
      <p style={asSectionTitle}>STUDIO PHILOSOPHY · CREATIVE ENVIRONMENT</p>
      {store.studioPhilosophy.map((line) => (
        <p key={line} style={{ ...asLabel, color: AS.gold }}>· {line}</p>
      ))}
    </section>
  );
}

export function ImmersiveCampusPanel({ store, onSetSpatialMode, onFocusStudio }: Pick<Props, 'store' | 'onSetSpatialMode' | 'onFocusStudio'>) {
  const focused = store.dashboard.focusedStudioId;
  return (
    <section className="p-3 mb-3" style={{ ...asPanel, background: AS.campusBg }}>
      <p style={asSectionTitle}>IMMERSIVE CAMPUS · SPATIAL NAVIGATION</p>
      <p style={{ ...asLabel, fontSize: '5px', marginBottom: 8 }}>
        Walk · zoom · transition · focus · explore — innovation campus, not page navigation
      </p>
      <div className="flex flex-wrap gap-1 mb-3">
        {(['campus', 'studio', 'forum', 'evolution-wall', 'innovation-lab', 'portfolio'] as SpatialNavMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onSetSpatialMode(mode)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.dashboard.activeSpatialMode === mode ? AS.gold : AS.panelBorder,
              color: store.dashboard.activeSpatialMode === mode ? AS.gold : AS.gray,
              background: store.dashboard.activeSpatialMode === mode ? 'rgba(202,138,4,0.08)' : 'white',
            }}
          >
            {mode.replace(/-/g, ' ').toUpperCase()}
          </button>
        ))}
      </div>
      <div className="as-campus-grid">
        {store.studios.map((studio) => (
          <button
            key={studio.id}
            type="button"
            onClick={() => onFocusStudio(studio.id)}
            className="p-2 border text-left"
            style={{
              gridArea: STUDIO_GRID[studio.id],
              borderColor: focused === studio.id ? studio.accentColor : AS.panelBorder,
              borderLeftWidth: 3,
              borderLeftColor: studio.accentColor,
              background: focused === studio.id ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.85)',
            }}
          >
            <p style={{ ...asLabel, fontSize: '6px', color: studio.accentColor, fontFamily: '"Futura PT Medium"' }}>{studio.label}</p>
            <p style={{ ...asLabel, fontSize: '5px' }}>{studio.tagline}</p>
            <p style={{ ...asLabel, fontSize: '5px', color: scoreColor(studio.healthPct) }}>{studio.healthPct}% · {studio.activeProjects} projects</p>
          </button>
        ))}
        <div className="as-forum-center">
          <p style={{ ...asLabel, fontSize: '6px', color: AS.gold, fontFamily: '"Futura PT Medium"' }}>COLLABORATION FORUM</p>
          <p style={{ ...asLabel, fontSize: '5px', maxWidth: 120 }}>Founder · CoS · Intelligence · Architects</p>
          <button
            type="button"
            onClick={() => onSetSpatialMode('forum')}
            className="text-[5px] font-futura px-2 py-0.5 border mt-1"
            style={{ borderColor: AS.gold, color: AS.gold }}
          >
            ENTER FORUM
          </button>
        </div>
      </div>
    </section>
  );
}

export function ArchitectStudiosPanel({ store, onFocusStudio }: Pick<Props, 'store' | 'onFocusStudio'>) {
  const focused = store.dashboard.focusedStudioId;
  return (
    <section className="p-3 mb-3" style={asPanel}>
      <p style={asSectionTitle}>FIVE PRIMARY STUDIOS · CONNECTED ENVIRONMENT</p>
      {store.studios.map((studio) => (
        <div
          key={studio.id}
          className="py-2 border-b flex flex-wrap items-center justify-between gap-2"
          style={{ borderColor: AS.panelBorder, borderLeft: `3px solid ${studio.accentColor}`, paddingLeft: 8 }}
        >
          <div>
            <p style={{ ...asLabel, fontSize: '6px', color: studio.accentColor, fontFamily: '"Futura PT Medium"' }}>{studio.label}</p>
            <p style={{ ...asLabel, fontSize: '5px' }}>{studio.tagline}</p>
            <p style={{ ...asLabel, fontSize: '5px' }}>{studio.architectModule} · {studio.liveDiscussions} live discussions</p>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onFocusStudio(studio.id)}
              className="text-[5px] font-futura px-2 py-1 border"
              style={{
                borderColor: focused === studio.id ? AS.gold : AS.panelBorder,
                color: focused === studio.id ? AS.gold : AS.gray,
              }}
            >
              FOCUS
            </button>
            <Link to={STUDIO_PATHS[studio.id]()} style={{ ...asLabel, color: studio.accentColor, fontSize: '5px', alignSelf: 'center' }}>
              → OPEN
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}

export function CollaborationForumPanel({ store }: Pick<Props, 'store'>) {
  const f = store.collaborationForum;
  return (
    <section className="p-3 mb-3" style={{ ...asPanel, borderLeft: `4px solid ${AS.gold}` }}>
      <p style={asSectionTitle}>CENTRAL COLLABORATION FORUM · EXECUTIVE DESIGN CIRCLE</p>
      <p style={{ ...asLabel, color: AS.gold, fontSize: '6px' }}>{f.summary}</p>
      <p style={{ ...asLabel, marginTop: 4 }}>PENDING DECISIONS: {f.pendingDecisions} · LAST: {f.lastGathering}</p>
      <p style={{ ...asSectionTitle, marginTop: 8, fontSize: '7px' }}>GATHERED NOW</p>
      {f.activeParticipants.map((p) => (
        <p key={p} style={asLabel}>· {p}</p>
      ))}
    </section>
  );
}

export function LivingWorkspacesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={asPanel}>
      <p style={asSectionTitle}>LIVING WORKSPACES · CONTINUOUS MOTION</p>
      {store.livingActivities.map((a) => (
        <div key={a.id} className="py-1 border-b" style={{ borderColor: AS.panelBorder }}>
          <p style={{ ...asLabel, fontSize: '5px', color: AS.gold }}>{a.studioId.replace(/-/g, ' ').toUpperCase()} · {a.activityType}</p>
          <p style={{ ...asLabel, fontSize: '5px' }}>{a.label}</p>
          <p style={{ ...asLabel, fontSize: '5px', color: a.status === 'active' ? AS.green : AS.slate }}>{a.status.toUpperCase()}</p>
        </div>
      ))}
    </section>
  );
}

export function ArchitectCollaborationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={asPanel}>
      <p style={asSectionTitle}>ARCHITECT COLLABORATION · ACTIVE DISCUSSIONS</p>
      {store.architectCollaborations.map((c) => (
        <div key={c.id} className="py-1 border-b" style={{ borderColor: AS.panelBorder }}>
          <p style={{ ...asLabel, fontSize: '5px', color: AS.gold }}>{c.fromArchitect} → {c.toArchitect}</p>
          <p style={{ ...asLabel, fontSize: '5px' }}>{c.topic}</p>
          <p style={{ ...asLabel, fontSize: '5px' }}>{c.status.toUpperCase()}</p>
        </div>
      ))}
    </section>
  );
}

export function EvolutionWallPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...asPanel, background: 'linear-gradient(90deg, rgba(254,243,199,0.2) 0%, white 100%)' }}>
      <p style={asSectionTitle}>COMPANY EVOLUTION WALL · LIVING HISTORY</p>
      {store.evolutionWall.map((e) => (
        <div key={e.id} className="py-1 border-b" style={{ borderColor: AS.panelBorder }}>
          <p style={{ ...asLabel, fontSize: '5px', color: AS.gold }}>{e.date} · {e.category}</p>
          <p style={{ ...asLabel, fontSize: '5px' }}>{e.label}</p>
          {e.genomeImpact && <p style={{ ...asLabel, fontSize: '5px', color: AS.green }}>{e.genomeImpact}</p>}
        </div>
      ))}
    </section>
  );
}

export function InnovationLabPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={asPanel}>
      <p style={asSectionTitle}>INNOVATION LAB · PROTOTYPE BEFORE COMMIT</p>
      {store.innovationLab.map((exp) => (
        <div key={exp.id} className="py-1 border-b" style={{ borderColor: AS.panelBorder }}>
          <p style={{ ...asLabel, fontSize: '5px', color: AS.gold }}>{exp.title} · {exp.phase.toUpperCase()}</p>
          <p style={{ ...asLabel, fontSize: '5px' }}>{exp.status}</p>
        </div>
      ))}
    </section>
  );
}

export function StudioIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={asPanel}>
      <p style={asSectionTitle}>STUDIO INTELLIGENCE · NATURAL GUIDANCE</p>
      {store.intelligenceGuides.map((g) => (
        <div key={g.id} className="py-1 border-b" style={{ borderColor: AS.panelBorder }}>
          <p style={{ ...asLabel, fontSize: '5px', color: priorityColor(g.priority) }}>{g.category} · {g.priority.toUpperCase()}</p>
          <p style={{ ...asLabel, fontSize: '5px' }}>{g.signal}</p>
          <p style={{ ...asLabel, fontSize: '5px', color: AS.gold }}>→ {g.recommendedStudio.replace(/-/g, ' ').toUpperCase()}</p>
        </div>
      ))}
    </section>
  );
}

export function PersonalizationPanel({ store }: Pick<Props, 'store'>) {
  const p = store.personalization;
  return (
    <section className="p-3 mb-3" style={asPanel}>
      <p style={asSectionTitle}>ENVIRONMENT PERSONALIZATION</p>
      {[
        ['ARCHITECTURE', p.architecture],
        ['LIGHTING', p.lighting],
        ['MATERIALS', p.materials],
        ['AMBIENT SOUND', p.ambientSound],
        ['THEME', p.theme],
      ].map(([label, val]) => (
        <p key={label} style={asLabel}><span style={{ color: AS.gold }}>{label}:</span> {val}</p>
      ))}
    </section>
  );
}

export function PortfolioCampusPanel({ store, onSelectWorkspace }: Pick<Props, 'store' | 'onSelectWorkspace'>) {
  const workspaces: ArchitectStudioWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio-campus'];
  return (
    <section className="p-3 mb-3" style={asPanel}>
      <p style={asSectionTitle}>PORTFOLIO MODE · MULTI-COMPANY CAMPUS</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? AS.gold : AS.panelBorder,
              color: store.activeWorkspaceId === id ? AS.gold : AS.gray,
              background: store.activeWorkspaceId === id ? 'rgba(202,138,4,0.06)' : 'white',
            }}
          >
            {id.replace(/-/g, ' ').toUpperCase()}
          </button>
        ))}
      </div>
      {store.portfolioCampus.map((co) => (
        <div key={co.id} className="py-1 border-b" style={{ borderColor: AS.panelBorder }}>
          <p style={{ ...asLabel, fontSize: '6px', color: AS.gold, fontFamily: '"Futura PT Medium"' }}>{co.name}</p>
          <p style={{ ...asLabel, fontSize: '5px' }}>{co.studioHealthPct}% health · {co.activeArchitects} architects active</p>
        </div>
      ))}
    </section>
  );
}

export function RecommendedNextStepsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={asPanel}>
      <p style={asSectionTitle}>RECOMMENDED NEXT STEPS · CONTEXTUAL GUIDANCE</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...asLabel, color: AS.gold }}>· {step}</p>
      ))}
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={asPanel}>
      <p style={asSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {ARCHITECT_STUDIO_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: AS.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioCompanyMaturityEnginePath()} style={{ ...asLabel, color: '#0369A1', fontSize: '6px' }}>→ BUSINESS STUDIO</Link>
        <Link to={adminStudioBrandArchitectPath()} style={{ ...asLabel, color: '#BE185D', fontSize: '6px' }}>→ BRAND STUDIO</Link>
        <Link to={adminStudioExperienceArchitectPath()} style={{ ...asLabel, color: '#0891B2', fontSize: '6px' }}>→ EXPERIENCE STUDIO</Link>
        <Link to={adminStudioDigitalArchitectPath()} style={{ ...asLabel, color: '#6366F1', fontSize: '6px' }}>→ DIGITAL STUDIO</Link>
        <Link to={adminStudioGrowthArchitectPath()} style={{ ...asLabel, color: '#059669', fontSize: '6px' }}>→ GROWTH STUDIO</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...asLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...asLabel, color: AS.gold, fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioOrganizationalInheritancePath()} style={{ ...asLabel, color: '#4F46E5', fontSize: '6px' }}>→ INHERITANCE</Link>
      </div>
    </section>
  );
}

export function HeadquartersPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  const hq = store.livingHeadquarters;
  return (
    <section className="p-3 mb-3" style={asPanel}>
      <p style={asSectionTitle}>HEADQUARTERS PHILOSOPHY · NEVER PAUSED</p>
      {hq.philosophy.map((line) => (
        <p key={line} style={{ ...asLabel, color: AS.gold }}>· {line}</p>
      ))}
    </section>
  );
}

export function MorningArrivalPanel({ store }: Pick<Props, 'store'>) {
  const hq = store.livingHeadquarters;
  return (
    <section className="p-3 mb-3 as-lobby-panel" style={asPanel}>
      <p style={asSectionTitle}>MORNING ARRIVAL · HEADQUARTERS LOBBY</p>
      <p style={{ ...asLabel, fontSize: '5px', color: AS.gold, marginBottom: 8 }}>
        You arrive through the lobby · the company is already alive before you interact
      </p>
      {hq.morningArrival.map((scene) => (
        <div key={scene.id} className="py-1 border-b as-ambient-line" style={{ borderColor: AS.panelBorder }}>
          <p style={{ ...asLabel, fontSize: '5px', color: AS.gold, fontFamily: '"Futura PT Medium"' }}>
            {scene.executive} · {scene.studioId.replace(/-/g, ' ').toUpperCase()}
          </p>
          <p style={{ ...asLabel, fontSize: '5px' }}>{scene.activity}</p>
          <p style={{ ...asLabel, fontSize: '5px', color: scoreColor(80) }}>{scene.status.toUpperCase()}</p>
        </div>
      ))}
    </section>
  );
}

export function HeadquartersBriefingPanel({ store }: Pick<Props, 'store'>) {
  const b = store.livingHeadquarters.executiveBriefing;
  return (
    <section className="p-3 mb-3" style={{ ...asPanel, borderLeft: `4px solid ${AS.gold}` }}>
      <p style={asSectionTitle}>HEADQUARTERS BRIEFING · {b.preparedBy.toUpperCase()}</p>
      <p style={{ ...asValue, fontSize: '18px' }}>{b.organizationalHealthPct}% ORGANIZATIONAL HEALTH</p>
      <p style={{ ...asLabel, color: AS.gold, marginTop: 4 }}>RECOMMENDED FOCUS: {b.recommendedFocus}</p>
      <p style={{ ...asLabel, marginTop: 4 }}>FOUNDER WORKLOAD: {b.estimatedFounderWorkload}</p>
      {[
        ['MAJOR WINS', b.majorWins],
        ['MAJOR RISKS', b.majorRisks],
        ['PENDING APPROVALS', b.pendingApprovals],
        ['TODAY\'S PRIORITIES', b.todaysPriorities],
        ['OPPORTUNITIES', b.opportunities],
        ['OVERNIGHT INTELLIGENCE', b.overnightIntelligence],
      ].map(([title, items]) => (
        <div key={title as string} className="mt-2">
          <p style={{ ...asSectionTitle, fontSize: '7px' }}>{title}</p>
          {(items as string[]).map((item) => (
            <p key={item} style={asLabel}>· {item}</p>
          ))}
        </div>
      ))}
      <Link to={adminStudioChiefOfStaffPath()} style={{ ...asLabel, color: AS.gold, fontSize: '6px', display: 'inline-block', marginTop: 8 }}>
        → OPEN CHIEF OF STAFF
      </Link>
    </section>
  );
}

export function ExecutivePresencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={asPanel}>
      <p style={asSectionTitle}>EXECUTIVE PRESENCE · NO IDLE CHARACTERS</p>
      {store.livingHeadquarters.executivePresence.map((exec) => (
        <div key={exec.id} className="py-1 border-b" style={{ borderColor: AS.panelBorder }}>
          <p style={{ ...asLabel, fontSize: '5px', color: AS.gold, fontFamily: '"Futura PT Medium"' }}>
            {exec.name} · {exec.role}
          </p>
          <p style={{ ...asLabel, fontSize: '5px' }}>
            {exec.currentLocation.replace(/-/g, ' ').toUpperCase()} · {exec.currentActivity}
          </p>
          <p style={{ ...asLabel, fontSize: '5px', color: AS.slate }}>→ {exec.movement}</p>
        </div>
      ))}
    </section>
  );
}

export function AmbientActivityPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={asPanel}>
      <p style={asSectionTitle}>AMBIENT ORGANIZATIONAL ACTIVITY · CALM INTELLIGENCE</p>
      {store.livingHeadquarters.ambientActivity.map((a) => (
        <div key={a.id} className="py-1 border-b as-ambient-line" style={{ borderColor: AS.panelBorder }}>
          <p style={{ ...asLabel, fontSize: '5px', color: AS.gold }}>{a.category}</p>
          <p style={{ ...asLabel, fontSize: '5px' }}>{a.label}</p>
        </div>
      ))}
    </section>
  );
}

export function ExecutiveConversationsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...asPanel, background: 'rgba(254,243,199,0.15)' }}>
      <p style={asSectionTitle}>OVERHEARD CONVERSATIONS · PURPOSEFUL INTELLIGENCE</p>
      {store.livingHeadquarters.overheardConversations.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: AS.panelBorder }}>
          <p style={{ ...asLabel, fontSize: '5px', color: AS.slate }}>{c.speakers}</p>
          <p style={{ ...asLabel, fontSize: '6px', color: AS.accent, fontStyle: 'italic' }}>{c.snippet}</p>
          <p style={{ ...asLabel, fontSize: '5px' }}>{c.context}</p>
        </div>
      ))}
    </section>
  );
}

export function LivingArchitecturePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={asPanel}>
      <p style={asSectionTitle}>LIVING ARCHITECTURE · EVOLVING HQ</p>
      {store.livingHeadquarters.livingArchitecture.map((entry) => (
        <div key={entry.id} className="py-1 border-b" style={{ borderColor: AS.panelBorder }}>
          <p style={{ ...asLabel, fontSize: '5px', color: AS.gold }}>{entry.visibleSince} · {entry.trigger}</p>
          <p style={{ ...asLabel, fontSize: '5px' }}>{entry.change}</p>
        </div>
      ))}
    </section>
  );
}

export function ExecutiveAvailabilityPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={asPanel}>
      <p style={asSectionTitle}>EXECUTIVE AVAILABILITY · NATURAL ACTIVITY</p>
      {store.livingHeadquarters.executiveAvailability.map((a) => (
        <div key={a.id} className="py-1 border-b flex justify-between gap-2" style={{ borderColor: AS.panelBorder }}>
          <p style={{ ...asLabel, fontSize: '5px', fontFamily: '"Futura PT Medium"' }}>{a.executive}</p>
          <p style={{ ...asLabel, fontSize: '5px', color: availabilityColor(a.state) }}>{a.state.replace(/-/g, ' ').toUpperCase()}</p>
          <p style={{ ...asLabel, fontSize: '5px', flex: 1, textAlign: 'right' }}>{a.detail}</p>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalRhythmPanel({ store }: Pick<Props, 'store'>) {
  const r = store.livingHeadquarters.organizationalRhythm;
  return (
    <section className="p-3 mb-3" style={asPanel}>
      <p style={asSectionTitle}>ORGANIZATIONAL RHYTHM · TEMPO</p>
      <p style={{ ...asValue, fontSize: '16px' }}>{r.label}</p>
      <p style={{ ...asLabel, color: AS.gold, marginTop: 4 }}>{r.description}</p>
      <p style={{ ...asLabel, marginTop: 4 }}>ENERGY: {r.energyPct}%</p>
    </section>
  );
}

export function HeadquartersCulturePanel({ store }: Pick<Props, 'store'>) {
  const c = store.livingHeadquarters.headquartersCulture;
  return (
    <section className="p-3 mb-3" style={asPanel}>
      <p style={asSectionTitle}>HEADQUARTERS CULTURE · COMPANY IDENTITY</p>
      <p style={{ ...asLabel, color: AS.gold, fontFamily: '"Futura PT Medium"' }}>{c.profile}</p>
      <p style={{ ...asLabel, marginTop: 4 }}>{c.expression}</p>
      <p style={{ ...asSectionTitle, fontSize: '7px', marginTop: 8 }}>INHERITED FROM</p>
      {c.inheritedFrom.map((src) => (
        <p key={src} style={asLabel}>· {src}</p>
      ))}
    </section>
  );
}

export function MemorySpacesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...asPanel, background: 'linear-gradient(90deg, rgba(254,243,199,0.25) 0%, white 100%)' }}>
      <p style={asSectionTitle}>MEMORY SPACES · ORGANIZATIONAL HISTORY</p>
      {store.livingHeadquarters.memorySpaces.map((m) => (
        <div key={m.id} className="py-1 border-b" style={{ borderColor: AS.panelBorder }}>
          <p style={{ ...asLabel, fontSize: '5px', color: AS.gold }}>{m.date} · {m.category}</p>
          <p style={{ ...asLabel, fontSize: '6px', fontFamily: '"Futura PT Medium"', color: AS.accent }}>{m.title}</p>
          <p style={{ ...asLabel, fontSize: '5px' }}>{m.significance}</p>
        </div>
      ))}
    </section>
  );
}
