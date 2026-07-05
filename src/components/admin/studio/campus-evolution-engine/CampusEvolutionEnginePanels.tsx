import { Link } from 'react-router-dom';
import type {
  CampusEvolutionStore,
  CampusEvolutionWorkspaceId,
  CampusStageId,
} from '../../../../studio-os-core/campus-evolution-engine/types';
import { CAMPUS_EVOLUTION_CONNECTED_SYSTEMS } from '../../../../studio-os-core/campus-evolution-engine/constants';
import {
  adminStudioArchitectStudioPath,
  adminStudioBrandArchitectPath,
  adminStudioChiefOfStaffPath,
  adminStudioCompanyGenomePath,
  adminStudioCompanyMaturityEnginePath,
  adminStudioDigitalArchitectPath,
  adminStudioExperienceArchitectPath,
  adminStudioGrowthArchitectPath,
  adminStudioOrganizationalInheritancePath,
  adminStudioReaderGraphPath,
  adminStudioRelationshipEnginePath,
} from '../../../../utils/adminStudioRoutes';
import {
  CAMPUS_EVOLUTION_STYLES,
  CE,
  ceDarkHeader,
  ceLabel,
  ceLiveDot,
  cePanel,
  ceSectionTitle,
  ceValue,
  priorityColor,
  scoreColor,
  spaceStatusColor,
} from './campusEvolutionEngineTheme';

type Props = {
  store: CampusEvolutionStore;
  onSelectWorkspace: (id: CampusEvolutionWorkspaceId) => void;
  onFocusStage: (id: CampusStageId) => void;
};

export function CampusEvolutionHeader() {
  return (
    <>
      <style>{CAMPUS_EVOLUTION_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...ceDarkHeader, borderTop: `3px solid ${CE.teal}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          CAMPUS EVOLUTION ENGINE
        </p>
        <p style={{ ...ceLabel, color: '#94A3B8' }}>
          <span style={ceLiveDot} />
          LIVING ARCHITECTURAL GROWTH · WALK THROUGH YOUR COMPANY&apos;S STORY
        </p>
        <p style={{ ...ceLabel, color: '#CBD5E1', marginTop: 4 }}>
          EARN SPACES · ORGANIC EVOLUTION · NEVER STATIC · ALWAYS ALIVE
        </p>
      </header>
    </>
  );
}

export function CampusDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  const stage = store.stages.find((s) => s.id === d.currentStageId);
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>CAMPUS OVERVIEW · SPATIAL NOT SPREADSHEET</p>
      <p style={{ ...ceLabel, color: CE.teal, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...ceLabel, color: CE.teal, marginTop: 4 }}>
        {store.companyName} · {stage?.label ?? d.currentStageId} · {d.stageProgressPct}% STAGE PROGRESS
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['ORG HEALTH', `${d.organizationalHealthPct}%`],
          ['KNOWLEDGE', `${d.knowledgeGrowthPct}%`],
          ['RELATIONSHIPS', `${d.relationshipGrowthPct}%`],
          ['INNOVATION', `${d.innovationPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: CE.panelBorder }}>
            <p style={{ ...ceValue, fontSize: '12px' }}>{val}</p>
            <p style={ceLabel}>{label}</p>
          </div>
        ))}
      </div>
      <p style={{ ...ceLabel, marginTop: 8 }}>
        ACTIVE CONSTRUCTION: {d.activeConstruction} · FUTURE EXPANSION: {d.futureExpansionPct}%
      </p>
    </section>
  );
}

export function CampusPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>CAMPUS PHILOSOPHY · EARN YOUR ENVIRONMENT</p>
      {store.campusPhilosophy.map((line) => (
        <p key={line} style={{ ...ceLabel, color: CE.teal }}>· {line}</p>
      ))}
    </section>
  );
}

export function DayOnePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...cePanel, background: CE.timelineBg }}>
      <p style={ceSectionTitle}>DAY ONE · FOUNDER STUDIO · POSSIBILITY</p>
      <p style={{ ...ceLabel, fontSize: '5px', marginBottom: 8 }}>Every company begins here · minimal · bright · premium · calm</p>
      {store.dayOneSpaces.map((space) => (
        <div key={space.id} className="py-1 border-b" style={{ borderColor: CE.panelBorder }}>
          <p style={{ ...ceLabel, fontSize: '6px', color: CE.teal, fontFamily: '"Futura PT Medium"' }}>{space.label}</p>
          <p style={{ ...ceLabel, fontSize: '5px' }}>{space.purpose}</p>
        </div>
      ))}
    </section>
  );
}

export function ArchitecturalProgressionPanel({ store, onFocusStage }: Pick<Props, 'store' | 'onFocusStage'>) {
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>ARCHITECTURAL PROGRESSION · CONTINUITY NOT RELOCATION</p>
      <div className="ce-stage-track">
        {store.stages.map((stage) => (
          <button
            key={stage.id}
            type="button"
            onClick={() => onFocusStage(stage.id)}
            className="ce-stage-step py-1 text-left w-full"
            style={{
              borderLeftColor: stage.current ? CE.teal : stage.progressPct >= 100 ? CE.green : CE.panelBorder,
              opacity: stage.progressPct === 0 && !stage.current ? 0.6 : 1,
            }}
          >
            <p style={{ ...ceLabel, fontSize: '6px', color: stage.current ? CE.teal : CE.accent, fontFamily: '"Futura PT Medium"' }}>
              {stage.label} {stage.current ? '· CURRENT' : ''}
            </p>
            <p style={{ ...ceLabel, fontSize: '5px' }}>{stage.description}</p>
            <p style={{ ...ceLabel, fontSize: '5px', color: scoreColor(stage.progressPct) }}>{stage.progressPct}%</p>
          </button>
        ))}
      </div>
    </section>
  );
}

export function OrganicEvolutionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>ORGANIC EVOLUTION · ACHIEVEMENTS BUILD ARCHITECTURE</p>
      {store.organicEvolution.map((e) => (
        <div key={e.id} className="py-1 border-b" style={{ borderColor: CE.panelBorder }}>
          <p style={{ ...ceLabel, fontSize: '5px', color: CE.teal }}>{e.earnedAt} · {e.category}</p>
          <p style={{ ...ceLabel, fontSize: '5px' }}>{e.achievement}</p>
          <p style={{ ...ceLabel, fontSize: '5px', color: CE.green }}>→ {e.architecturalImpact}</p>
        </div>
      ))}
    </section>
  );
}

export function EarnedSpacesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>LIVING ARCHITECTURE · EARNED SPACES</p>
      {store.earnedSpaces.map((space) => (
        <div key={space.id} className="py-1 border-b" style={{ borderColor: CE.panelBorder, borderLeft: `3px solid ${spaceStatusColor(space.status)}`, paddingLeft: 8 }}>
          <p style={{ ...ceLabel, fontSize: '6px', color: CE.teal, fontFamily: '"Futura PT Medium"' }}>{space.label}</p>
          <p style={{ ...ceLabel, fontSize: '5px' }}>{space.earnedBecause}</p>
          <p style={{ ...ceLabel, fontSize: '5px', color: spaceStatusColor(space.status) }}>{space.status.replace(/-/g, ' ').toUpperCase()}</p>
        </div>
      ))}
    </section>
  );
}

export function CompanyMemoryPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...cePanel, background: 'linear-gradient(90deg, rgba(240,253,250,0.5) 0%, white 100%)' }}>
      <p style={ceSectionTitle}>COMPANY MEMORY · PERMANENT IN ARCHITECTURE</p>
      {store.companyMemory.map((m) => (
        <div key={m.id} className="py-1 border-b" style={{ borderColor: CE.panelBorder }}>
          <p style={{ ...ceLabel, fontSize: '5px', color: CE.teal }}>{m.date} · {m.category}</p>
          <p style={{ ...ceLabel, fontSize: '6px', fontFamily: '"Futura PT Medium"', color: CE.accent }}>{m.title}</p>
          <p style={{ ...ceLabel, fontSize: '5px' }}>{m.architecturalMemorial}</p>
        </div>
      ))}
    </section>
  );
}

export function LivingMuseumPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>LIVING MUSEUM · ORGANIZATIONAL HISTORY</p>
      {store.livingMuseum.map((g) => (
        <div key={g.id} className="py-1 border-b" style={{ borderColor: CE.panelBorder }}>
          <p style={{ ...ceLabel, fontSize: '6px', color: CE.teal, fontFamily: '"Futura PT Medium"' }}>{g.name}</p>
          <p style={{ ...ceLabel, fontSize: '5px' }}>{g.contents}</p>
        </div>
      ))}
    </section>
  );
}

export function BrandInheritancePanel({ store }: Pick<Props, 'store'>) {
  const b = store.brandInheritance;
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>BRAND INHERITANCE · UNMISTAKABLY {b.companyName}</p>
      {[
        ['IDENTITY', b.identity],
        ['MATERIALS', b.materials],
        ['COLORS', b.colors],
        ['ARCHITECTURE', b.architecture],
        ['MOTION', b.motionLanguage],
        ['LIGHTING', b.lighting],
        ['UNIQUENESS', b.uniqueness],
      ].map(([label, val]) => (
        <p key={label as string} style={ceLabel}><span style={{ color: CE.teal }}>{label}:</span> {val}</p>
      ))}
    </section>
  );
}

export function CultureProfilePanel({ store }: Pick<Props, 'store'>) {
  const c = store.cultureProfile;
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>COMPANY CULTURE · ARCHITECTURE COMMUNICATES</p>
      <p style={{ ...ceLabel, color: CE.teal, fontFamily: '"Futura PT Medium"' }}>{c.profile}</p>
      <p style={{ ...ceLabel, marginTop: 4 }}>{c.expression}</p>
      <p style={{ ...ceSectionTitle, fontSize: '7px', marginTop: 8 }}>INFLUENCES</p>
      {c.influences.map((i) => (
        <p key={i} style={ceLabel}>· {i}</p>
      ))}
    </section>
  );
}

export function PortfolioCampusPanel({ store, onSelectWorkspace }: Pick<Props, 'store' | 'onSelectWorkspace'>) {
  const workspaces: CampusEvolutionWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>PORTFOLIO CAMPUS · SHARED DISTRICTS</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? CE.teal : CE.panelBorder,
              color: store.activeWorkspaceId === id ? CE.teal : CE.gray,
              background: store.activeWorkspaceId === id ? 'rgba(13,148,136,0.06)' : 'white',
            }}
          >
            {id.replace(/-/g, ' ').toUpperCase()}
          </button>
        ))}
      </div>
      {store.portfolioDistricts.map((d) => (
        <div key={d.id} className="py-1 border-b" style={{ borderColor: CE.panelBorder }}>
          <p style={{ ...ceLabel, fontSize: '6px', color: CE.teal, fontFamily: '"Futura PT Medium"' }}>{d.label}</p>
          <p style={{ ...ceLabel, fontSize: '5px' }}>{d.sharedBy.join(' · ')}</p>
          <p style={{ ...ceLabel, fontSize: '5px' }}>{d.purpose}</p>
        </div>
      ))}
    </section>
  );
}

export function CampusIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>CAMPUS INTELLIGENCE · ANTICIPATE NEEDS</p>
      {store.campusIntelligence.map((rec) => (
        <div key={rec.id} className="py-1 border-b" style={{ borderColor: CE.panelBorder }}>
          <p style={{ ...ceLabel, fontSize: '5px', color: priorityColor(rec.priority) }}>{rec.category} · {rec.priority.toUpperCase()}</p>
          <p style={{ ...ceLabel, fontSize: '5px' }}>{rec.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function LivingEnvironmentPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>LIVING ENVIRONMENT · NEVER FINISHED</p>
      {store.livingEnvironment.map((e) => (
        <div key={e.id} className="py-1 border-b" style={{ borderColor: CE.panelBorder }}>
          <p style={{ ...ceLabel, fontSize: '5px', color: CE.teal }}>{e.eventType}</p>
          <p style={{ ...ceLabel, fontSize: '5px' }}>{e.label}</p>
          <p style={{ ...ceLabel, fontSize: '5px', color: spaceStatusColor(e.status === 'complete' ? 'active' : e.status === 'active' ? 'under-construction' : 'planned') }}>
            {e.status.toUpperCase()}
          </p>
        </div>
      ))}
    </section>
  );
}

export function ArchitecturalSimulationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>ARCHITECTURAL SIMULATION · PREVIEW TOMORROW</p>
      {store.simulations.map((sim) => (
        <div key={sim.id} className="py-2 border-b" style={{ borderColor: CE.panelBorder }}>
          <p style={{ ...ceValue, fontSize: '12px' }}>{sim.horizon}</p>
          <p style={{ ...ceLabel, fontSize: '5px', color: CE.teal }}>{sim.scenario}</p>
          <p style={{ ...ceLabel, fontSize: '5px' }}>{sim.campusPreview}</p>
          <p style={{ ...ceLabel, fontSize: '5px', color: CE.slate }}>Shaped by: {sim.shapedBy}</p>
        </div>
      ))}
    </section>
  );
}

export function RecommendedNextStepsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...ceLabel, color: CE.teal }}>· {step}</p>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Pick<Props, 'store' | 'onSelectWorkspace'>) {
  const workspaces: CampusEvolutionWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>CAMPUS WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? CE.teal : CE.panelBorder,
              color: store.activeWorkspaceId === id ? CE.teal : CE.gray,
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
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {CAMPUS_EVOLUTION_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: CE.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioArchitectStudioPath()} style={{ ...ceLabel, color: '#CA8A04', fontSize: '6px' }}>→ ARCHITECT STUDIO</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...ceLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioCompanyMaturityEnginePath()} style={{ ...ceLabel, color: '#0369A1', fontSize: '6px' }}>→ BUSINESS ARCHITECT</Link>
        <Link to={adminStudioBrandArchitectPath()} style={{ ...ceLabel, color: '#BE185D', fontSize: '6px' }}>→ BRAND ARCHITECT</Link>
        <Link to={adminStudioExperienceArchitectPath()} style={{ ...ceLabel, color: '#0891B2', fontSize: '6px' }}>→ EXPERIENCE ARCHITECT</Link>
        <Link to={adminStudioDigitalArchitectPath()} style={{ ...ceLabel, color: '#6366F1', fontSize: '6px' }}>→ DIGITAL ARCHITECT</Link>
        <Link to={adminStudioGrowthArchitectPath()} style={{ ...ceLabel, color: '#059669', fontSize: '6px' }}>→ GROWTH ARCHITECT</Link>
        <Link to={adminStudioReaderGraphPath()} style={{ ...ceLabel, color: '#7C3AED', fontSize: '6px' }}>→ READER GRAPH</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...ceLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...ceLabel, color: CE.teal, fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioOrganizationalInheritancePath()} style={{ ...ceLabel, color: '#4F46E5', fontSize: '6px' }}>→ INHERITANCE</Link>
      </div>
    </section>
  );
}
