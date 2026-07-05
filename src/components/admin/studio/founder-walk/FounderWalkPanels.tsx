import { Link } from 'react-router-dom';
import type { FounderWalkStore, FounderWalkWorkspaceId, TimelineEra } from '../../../../studio-os-core/founder-walk/types';
import { FOUNDER_WALK_CONNECTED_SYSTEMS } from '../../../../studio-os-core/founder-walk/constants';
import {
  adminStudioArchitectStudioPath,
  adminStudioCampusEvolutionEnginePath,
  adminStudioChiefOfStaffPath,
  adminStudioCompanyGenomePath,
  adminStudioLeadershipDnaPath,
  adminStudioOrganizationalInheritancePath,
  adminStudioRelationshipEnginePath,
  adminStudioRemembranceGardenPath,
  adminStudioFoundersPromisePath,
} from '../../../../utils/adminStudioRoutes';
import {
  FOUNDER_WALK_STYLES,
  FW,
  fwDarkHeader,
  fwLabel,
  fwLiveDot,
  fwPanel,
  fwSectionTitle,
  fwValue,
  priorityColor,
} from './founderWalkTheme';

type Props = {
  store: FounderWalkStore;
  onSelectWorkspace: (id: FounderWalkWorkspaceId) => void;
  onSetTimelineEra: (era: TimelineEra) => void;
};

export function FounderWalkHeader() {
  return (
    <>
      <style>{FOUNDER_WALK_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...fwDarkHeader, borderTop: `3px solid ${FW.stone}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          FOUNDER WALK
        </p>
        <p style={{ ...fwLabel, color: '#94A3B8' }}>
          <span style={fwLiveDot} />
          EMOTIONAL SPINE OF THE CAMPUS · LEGACY · NOT TROPHIES
        </p>
        <p style={{ ...fwLabel, color: '#CBD5E1', marginTop: 4 }}>
          PRESERVE THE SOUL · WALK FOR PERSPECTIVE · SHARE WITH FUTURE GENERATIONS
        </p>
      </header>
    </>
  );
}

export function WalkDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={fwPanel}>
      <p style={fwSectionTitle}>FOUNDER WALK · PERSONAL LEGACY</p>
      <p style={{ ...fwLabel, color: FW.stone, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...fwLabel, color: FW.stone, marginTop: 4 }}>
        {store.companyName} · ERA: {d.activeTimelineEra.replace(/-/g, ' ').toUpperCase()}
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['MILESTONES', `${d.pathLengthMilestones}`],
          ['MEMORIES', `${d.preservedMemories}`],
          ['REFLECTION', `${d.reflectionSpaces}`],
          ['LEGACY DEPTH', `${d.legacyDepthPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: FW.panelBorder }}>
            <p style={{ ...fwValue, fontSize: '12px' }}>{val}</p>
            <p style={fwLabel}>{label}</p>
          </div>
        ))}
      </div>
      <p style={{ ...fwLabel, marginTop: 8 }}>LANDSCAPE MATURITY: {d.landscapeMaturityPct}%</p>
    </section>
  );
}

export function WalkPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={fwPanel}>
      <p style={fwSectionTitle}>FOUNDER WALK PHILOSOPHY · LEGACY SYSTEM</p>
      {store.walkPhilosophy.map((line) => (
        <p key={line} style={{ ...fwLabel, color: FW.stone }}>· {line}</p>
      ))}
    </section>
  );
}

export function DayOnePathPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dayOnePath;
  return (
    <section className="p-3 mb-3" style={{ ...fwPanel, background: FW.pathBg }}>
      <p style={fwSectionTitle}>DAY ONE · SINGLE MARBLE PATHWAY</p>
      <p style={{ ...fwLabel, fontSize: '6px', color: FW.stone }}>{d.description}</p>
      <p style={{ ...fwLabel, fontSize: '5px', marginTop: 4 }}>{d.atmosphere}</p>
    </section>
  );
}

export function LivingPathwayPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...fwPanel, background: FW.pathBg }}>
      <p style={fwSectionTitle}>LIVING PATHWAY · ARCHITECTURAL MEMORIES</p>
      <div className="fw-pathway">
        {store.pathwayMilestones.map((m) => (
          <div key={m.id} className="fw-path-step">
            <p style={{ ...fwLabel, fontSize: '5px', color: FW.stone, fontFamily: '"Futura PT Medium"' }}>
              {m.date} · {m.category}
            </p>
            <p style={{ ...fwLabel, fontSize: '6px', color: FW.accent }}>{m.title}</p>
            <p style={{ ...fwLabel, fontSize: '5px' }}>{m.architecturalMemory} · {m.memoryType.toUpperCase()}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MemoryMarkersPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={fwPanel}>
      <p style={fwSectionTitle}>MEMORY MARKERS · THE STORY BEHIND EACH MILESTONE</p>
      {store.memoryMarkers.map((m) => (
        <div key={m.id} className="py-2 border-b" style={{ borderColor: FW.panelBorder }}>
          <p style={{ ...fwLabel, fontSize: '5px', color: FW.stone }}>WHY: {m.whyItMattered}</p>
          <p style={{ ...fwLabel, fontSize: '5px' }}>LEARNED: {m.whatWasLearned}</p>
          <p style={{ ...fwLabel, fontSize: '5px' }}>WHO: {m.whoMadeItPossible}</p>
          {m.whatAlmostWentWrong && <p style={{ ...fwLabel, fontSize: '5px', color: FW.red }}>ALMOST: {m.whatAlmostWentWrong}</p>}
          <p style={{ ...fwLabel, fontSize: '5px' }}>AFTER: {m.whatChangedAfter}</p>
          <p style={{ ...fwLabel, fontSize: '5px', color: FW.stone, fontStyle: 'italic' }}>ADVICE: {m.futureAdvice}</p>
        </div>
      ))}
    </section>
  );
}

export function ReflectionSpacesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...fwPanel, borderLeft: `4px solid ${FW.stone}` }}>
      <p style={fwSectionTitle}>REFLECTION SPACES · PAUSE AND APPRECIATE</p>
      {store.reflectionSpaces.map((s) => (
        <div key={s.id} className="py-1 border-b" style={{ borderColor: FW.panelBorder }}>
          <p style={{ ...fwLabel, fontSize: '6px', color: FW.stone, fontFamily: '"Futura PT Medium"' }}>{s.label}</p>
          <p style={{ ...fwLabel, fontSize: '5px' }}>{s.purpose}</p>
          <p style={{ ...fwLabel, fontSize: '5px', color: FW.gray }}>{s.locationOnPath}</p>
        </div>
      ))}
    </section>
  );
}

export function LivingLandscapePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={fwPanel}>
      <p style={fwSectionTitle}>LIVING LANDSCAPE · ALWAYS ALIVE</p>
      {store.livingLandscape.map((l) => (
        <div key={l.id} className="py-1 border-b" style={{ borderColor: FW.panelBorder }}>
          <p style={{ ...fwLabel, fontSize: '5px', color: FW.stone }}>{l.element} · {l.season}</p>
          <p style={{ ...fwLabel, fontSize: '5px' }}>{l.evolution}</p>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalConnectionsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={fwPanel}>
      <p style={fwSectionTitle}>ORGANIZATIONAL CONNECTIONS · NOTHING IN ISOLATION</p>
      {store.organizationalConnections.map((c) => (
        <div key={c.id} className="py-1 border-b" style={{ borderColor: FW.panelBorder }}>
          <p style={{ ...fwLabel, fontSize: '5px', color: FW.stone }}>{c.connectedSystem}</p>
          <p style={{ ...fwLabel, fontSize: '5px' }}>{c.connection}</p>
        </div>
      ))}
    </section>
  );
}

export function FutureGenerationsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={fwPanel}>
      <p style={fwSectionTitle}>FUTURE GENERATIONS · HOW THE FOUNDER THOUGHT</p>
      {store.futureGenerations.map((g) => (
        <div key={g.id} className="py-1 border-b" style={{ borderColor: FW.panelBorder }}>
          <p style={{ ...fwLabel, fontSize: '5px', color: FW.stone }}>{g.category}</p>
          <p style={{ ...fwLabel, fontSize: '5px' }}>{g.insight}</p>
        </div>
      ))}
    </section>
  );
}

export function FamilyLegacyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...fwPanel, background: 'rgba(245,245,244,0.8)' }}>
      <p style={fwSectionTitle}>FAMILY LEGACY · PRIVATE UNLESS SHARED</p>
      {store.familyLegacy.map((f) => (
        <div key={f.id} className="py-1 border-b" style={{ borderColor: FW.panelBorder }}>
          <p style={{ ...fwLabel, fontSize: '6px', color: FW.stone, fontFamily: '"Futura PT Medium"' }}>
            {f.title} · {f.visibility.toUpperCase()}
          </p>
          <p style={{ ...fwLabel, fontSize: '5px' }}>{f.note}</p>
        </div>
      ))}
    </section>
  );
}

export function PortfolioLegacyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={fwPanel}>
      <p style={fwSectionTitle}>PORTFOLIO LEGACY · INTERCONNECTED WALKS</p>
      {store.portfolioLegacy.map((p) => (
        <div key={p.id} className="py-1 border-b" style={{ borderColor: FW.panelBorder }}>
          <p style={{ ...fwLabel, fontSize: '5px', color: FW.stone }}>{p.fromCompany} → {p.toCompany}</p>
          <p style={{ ...fwLabel, fontSize: '5px' }}>{p.influence}</p>
        </div>
      ))}
    </section>
  );
}

export function MemoryIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={fwPanel}>
      <p style={fwSectionTitle}>MEMORY INTELLIGENCE · PRESERVE BEFORE FORGOTTEN</p>
      {store.memoryIntelligence.map((rec) => (
        <div key={rec.id} className="py-1 border-b" style={{ borderColor: FW.panelBorder }}>
          <p style={{ ...fwLabel, fontSize: '5px', color: priorityColor(rec.priority) }}>{rec.priority.toUpperCase()}</p>
          <p style={{ ...fwLabel, fontSize: '5px' }}>{rec.signal}</p>
          <p style={{ ...fwLabel, fontSize: '5px', color: FW.stone }}>→ {rec.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function FounderTimelinePanel({ store, onSetTimelineEra }: Pick<Props, 'store' | 'onSetTimelineEra'>) {
  const eras: TimelineEra[] = ['day-one', 'year-one', 'year-five', 'year-ten', 'year-twenty', 'future'];
  return (
    <section className="p-3 mb-3" style={fwPanel}>
      <p style={fwSectionTitle}>FOUNDER TIMELINE · MOVE THROUGH TIME</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {eras.map((era) => (
          <button
            key={era}
            type="button"
            onClick={() => onSetTimelineEra(era)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.dashboard.activeTimelineEra === era ? FW.stone : FW.panelBorder,
              color: store.dashboard.activeTimelineEra === era ? FW.stone : FW.gray,
              background: store.dashboard.activeTimelineEra === era ? 'rgba(120,113,108,0.08)' : 'white',
            }}
          >
            {era.replace(/-/g, ' ').toUpperCase()}
          </button>
        ))}
      </div>
      <p style={{ ...fwLabel, fontSize: '5px', color: FW.stone }}>
        Watch the path evolve across decades · active: {store.dashboard.activeTimelineEra.replace(/-/g, ' ').toUpperCase()}
      </p>
    </section>
  );
}

export function CampusIntegrationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={fwPanel}>
      <p style={fwSectionTitle}>CAMPUS INTEGRATION · CENTRAL THREAD</p>
      {store.campusIntegration.map((c) => (
        <div key={c.id} className="py-1 border-b" style={{ borderColor: FW.panelBorder }}>
          <p style={{ ...fwLabel, fontSize: '6px', color: FW.stone, fontFamily: '"Futura PT Medium"' }}>{c.campusLocation}</p>
          <p style={{ ...fwLabel, fontSize: '5px' }}>{c.connection}</p>
        </div>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Pick<Props, 'store' | 'onSelectWorkspace'>) {
  const workspaces: FounderWalkWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={fwPanel}>
      <p style={fwSectionTitle}>WALK WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? FW.stone : FW.panelBorder,
              color: store.activeWorkspaceId === id ? FW.stone : FW.gray,
              background: store.activeWorkspaceId === id ? 'rgba(120,113,108,0.06)' : 'white',
            }}
          >
            {id.replace(/-/g, ' ').toUpperCase()}
          </button>
        ))}
      </div>
    </section>
  );
}

export function RecommendedNextStepsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={fwPanel}>
      <p style={fwSectionTitle}>RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...fwLabel, color: FW.stone }}>· {step}</p>
      ))}
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={fwPanel}>
      <p style={fwSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {FOUNDER_WALK_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: FW.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioCampusEvolutionEnginePath()} style={{ ...fwLabel, color: '#0D9488', fontSize: '6px' }}>→ CAMPUS EVOLUTION</Link>
        <Link to={adminStudioArchitectStudioPath()} style={{ ...fwLabel, color: '#CA8A04', fontSize: '6px' }}>→ ARCHITECT STUDIO</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...fwLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioLeadershipDnaPath()} style={{ ...fwLabel, color: '#CA8A04', fontSize: '6px' }}>→ LEADERSHIP DNA</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...fwLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioOrganizationalInheritancePath()} style={{ ...fwLabel, color: '#4F46E5', fontSize: '6px' }}>→ INHERITANCE</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...fwLabel, color: FW.stone, fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioRemembranceGardenPath()} style={{ ...fwLabel, color: '#6B9080', fontSize: '6px' }}>→ REMEMBRANCE GARDEN</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...fwLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
      </div>
    </section>
  );
}
