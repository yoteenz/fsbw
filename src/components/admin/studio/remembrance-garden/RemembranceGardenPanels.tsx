import { Link } from 'react-router-dom';
import type { RemembranceGardenStore, RemembranceGardenWorkspaceId } from '../../../../studio-os-core/remembrance-garden/types';
import { REMEMBRANCE_GARDEN_CONNECTED_SYSTEMS } from '../../../../studio-os-core/remembrance-garden/constants';
import {
  adminStudioArchitectStudioPath,
  adminStudioCampusEvolutionEnginePath,
  adminStudioChiefOfStaffPath,
  adminStudioCompanyGenomePath,
  adminStudioFounderWalkPath,
  adminStudioFoundersPromisePath,
  adminStudioLeadershipDnaPath,
  adminStudioOrganizationalInheritancePath,
  adminStudioRelationshipEnginePath,
} from '../../../../utils/adminStudioRoutes';
import {
  REMEMBRANCE_GARDEN_STYLES,
  RG,
  priorityColor,
  privacyColor,
  rgDarkHeader,
  rgLabel,
  rgLiveDot,
  rgPanel,
  rgSectionTitle,
  rgValue,
} from './remembranceGardenTheme';

type Props = {
  store: RemembranceGardenStore;
  onSelectWorkspace: (id: RemembranceGardenWorkspaceId) => void;
  onSetSeason: (season: string) => void;
};

export function RemembranceGardenHeader() {
  return (
    <>
      <style>{REMEMBRANCE_GARDEN_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...rgDarkHeader, borderTop: `3px solid ${RG.sage}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          REMEMBRANCE GARDEN
        </p>
        <p style={{ ...rgLabel, color: '#94A3B8' }}>
          <span style={rgLiveDot} />
          PRESERVE GRATITUDE · HONOR · NOT MOURNING
        </p>
        <p style={{ ...rgLabel, color: '#CBD5E1', marginTop: 4 }}>
          PEACEFUL · HOPEFUL · ALIVE · THE MOST PERSONAL SPACE ON CAMPUS
        </p>
      </header>
    </>
  );
}

export function GardenDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>REMEMBRANCE GARDEN · GRATITUDE PRESERVED</p>
      <p style={{ ...rgLabel, color: RG.sage, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...rgLabel, color: RG.sage, marginTop: 4 }}>
        {store.companyName} · SEASON: {d.activeSeason.toUpperCase()}
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['DEDICATIONS', `${d.dedicationCount}`],
          ['MEMORIES', `${d.preservedMemories}`],
          ['REFLECTION', `${d.reflectionSpaces}`],
          ['GRATITUDE', `${d.gratitudeDepthPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: RG.panelBorder }}>
            <p style={{ ...rgValue, fontSize: '12px' }}>{val}</p>
            <p style={rgLabel}>{label}</p>
          </div>
        ))}
      </div>
      <p style={{ ...rgLabel, marginTop: 8 }}>GARDEN MATURITY: {d.gardenMaturityPct}% · LEGACY LETTERS: {d.legacyLetters}</p>
    </section>
  );
}

export function GardenPhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>GARDEN PHILOSOPHY · GRATITUDE AS ARCHITECTURE</p>
      {store.gardenPhilosophy.map((line) => (
        <p key={line} style={{ ...rgLabel, color: RG.sage }}>· {line}</p>
      ))}
    </section>
  );
}

export function DedicationSpacesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...rgPanel, background: RG.gardenBg }}>
      <p style={rgSectionTitle}>DEDICATION SPACES · QUIET PLACES OF APPRECIATION</p>
      <div className="rg-garden-path">
        {store.dedicationSpaces.map((d) => (
          <div key={d.id} className="rg-dedication">
            <p style={{ ...rgLabel, fontSize: '5px', color: RG.sage, fontFamily: '"Futura PT Medium"' }}>
              {d.category} · {d.privacy.toUpperCase()}
            </p>
            <p style={{ ...rgLabel, fontSize: '6px', color: RG.accent }}>{d.honoree}</p>
            <p style={{ ...rgLabel, fontSize: '5px' }}>{d.architecturalElement} · {d.memorialType.replace(/-/g, ' ').toUpperCase()}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MemoryPreservationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>MEMORY PRESERVATION · STORIES BEHIND EACH DEDICATION</p>
      {store.memoryPreservations.map((m) => (
        <div key={m.id} className="py-2 border-b" style={{ borderColor: RG.panelBorder }}>
          <p style={{ ...rgLabel, fontSize: '5px' }}>{m.reflection}</p>
          {m.lifeLesson && <p style={{ ...rgLabel, fontSize: '5px', color: RG.sage }}>LESSON: {m.lifeLesson}</p>}
          {m.quote && <p style={{ ...rgLabel, fontSize: '5px', fontStyle: 'italic' }}>"{m.quote}"</p>}
          {m.hasMedia && <p style={{ ...rgLabel, fontSize: '5px', color: RG.gray }}>+ photos · voice · documents available</p>}
        </div>
      ))}
    </section>
  );
}

export function ReflectionSpacesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...rgPanel, borderLeft: `4px solid ${RG.sage}` }}>
      <p style={rgSectionTitle}>REFLECTION SPACES · PAUSE · NOT PRODUCTIVITY</p>
      {store.reflectionSpaces.map((s) => (
        <div key={s.id} className="py-1 border-b" style={{ borderColor: RG.panelBorder }}>
          <p style={{ ...rgLabel, fontSize: '6px', color: RG.sage, fontFamily: '"Futura PT Medium"' }}>{s.label}</p>
          <p style={{ ...rgLabel, fontSize: '5px' }}>{s.purpose}</p>
          <p style={{ ...rgLabel, fontSize: '5px', color: RG.gray }}>{s.locationInGarden}</p>
        </div>
      ))}
    </section>
  );
}

export function LivingSeasonsPanel({ store, onSetSeason }: Pick<Props, 'store' | 'onSetSeason'>) {
  const seasons = ['spring', 'summer', 'autumn', 'winter'];
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>LIVING SEASONS · THE GARDEN IS ALIVE</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {seasons.map((season) => (
          <button
            key={season}
            type="button"
            onClick={() => onSetSeason(season)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.dashboard.activeSeason === season ? RG.sage : RG.panelBorder,
              color: store.dashboard.activeSeason === season ? RG.sage : RG.gray,
              background: store.dashboard.activeSeason === season ? 'rgba(107,144,128,0.08)' : 'white',
            }}
          >
            {season.toUpperCase()}
          </button>
        ))}
      </div>
      {store.livingSeasons.map((l) => (
        <div key={l.id} className="py-1 border-b" style={{ borderColor: RG.panelBorder }}>
          <p style={{ ...rgLabel, fontSize: '5px', color: RG.sage }}>{l.element} · {l.season} · {l.timeOfDay}</p>
          <p style={{ ...rgLabel, fontSize: '5px' }}>{l.evolution}</p>
        </div>
      ))}
    </section>
  );
}

export function GratitudeMomentsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>GRATITUDE MOMENTS · STUDIO INTELLIGENCE</p>
      {store.gratitudeMoments.map((g) => (
        <div key={g.id} className="py-1 border-b" style={{ borderColor: RG.panelBorder }}>
          <p style={{ ...rgLabel, fontSize: '5px', color: priorityColor(g.priority) }}>{g.priority.toUpperCase()}</p>
          <p style={{ ...rgLabel, fontSize: '5px' }}>{g.signal}</p>
          <p style={{ ...rgLabel, fontSize: '5px', color: RG.sage }}>→ {g.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function LegacyLettersPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...rgPanel, background: 'rgba(246,244,239,0.9)' }}>
      <p style={rgSectionTitle}>LEGACY LETTERS · PRIVATE · SCHEDULED · LEGACY</p>
      {store.legacyLetters.map((l) => (
        <div key={l.id} className="py-2 border-b" style={{ borderColor: RG.panelBorder }}>
          <p style={{ ...rgLabel, fontSize: '6px', color: RG.sage, fontFamily: '"Futura PT Medium"' }}>
            {l.recipient} · {l.unlockPolicy.toUpperCase()} · {l.privacy.toUpperCase()}
          </p>
          <p style={{ ...rgLabel, fontSize: '5px', color: RG.accent }}>{l.subject}</p>
          <p style={{ ...rgLabel, fontSize: '5px', fontStyle: 'italic' }}>{l.excerpt}</p>
        </div>
      ))}
    </section>
  );
}

export function FamilyHeritagePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...rgPanel, background: 'rgba(232,240,236,0.6)' }}>
      <p style={rgSectionTitle}>FAMILY HERITAGE · VALUES THAT SHAPED THE COMPANY</p>
      {store.familyHeritage.map((f) => (
        <div key={f.id} className="py-1 border-b" style={{ borderColor: RG.panelBorder }}>
          <p style={{ ...rgLabel, fontSize: '6px', color: privacyColor(f.institutionalShare), fontFamily: '"Futura PT Medium"' }}>
            {f.category} · {f.title} · {f.institutionalShare.toUpperCase()}
          </p>
          <p style={{ ...rgLabel, fontSize: '5px' }}>{f.note}</p>
        </div>
      ))}
    </section>
  );
}

export function FutureGenerationsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>FUTURE GENERATIONS · CULTURE THROUGH STORIES</p>
      {store.futureGenerations.map((g) => (
        <div key={g.id} className="py-1 border-b" style={{ borderColor: RG.panelBorder }}>
          <p style={{ ...rgLabel, fontSize: '5px', color: RG.sage }}>{g.category}</p>
          <p style={{ ...rgLabel, fontSize: '5px' }}>{g.insight}</p>
        </div>
      ))}
    </section>
  );
}

export function PortfolioRemembrancePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>PORTFOLIO REMEMBRANCE · INTERCONNECTED GARDENS</p>
      {store.portfolioRemembrance.map((p) => (
        <div key={p.id} className="py-1 border-b" style={{ borderColor: RG.panelBorder }}>
          <p style={{ ...rgLabel, fontSize: '5px', color: RG.sage }}>{p.fromCompany} → {p.toCompany}</p>
          <p style={{ ...rgLabel, fontSize: '5px' }}>{p.sharedInfluence}</p>
        </div>
      ))}
    </section>
  );
}

export function CampusIntegrationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>CAMPUS INTEGRATION · GRATITUDE CONNECTS EVERYTHING</p>
      {store.campusIntegration.map((c) => (
        <div key={c.id} className="py-1 border-b" style={{ borderColor: RG.panelBorder }}>
          <p style={{ ...rgLabel, fontSize: '6px', color: RG.sage, fontFamily: '"Futura PT Medium"' }}>{c.campusLocation}</p>
          <p style={{ ...rgLabel, fontSize: '5px' }}>{c.connection}</p>
        </div>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Pick<Props, 'store' | 'onSelectWorkspace'>) {
  const workspaces: RemembranceGardenWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>GARDEN WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? RG.sage : RG.panelBorder,
              color: store.activeWorkspaceId === id ? RG.sage : RG.gray,
              background: store.activeWorkspaceId === id ? 'rgba(107,144,128,0.06)' : 'white',
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
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>RECOMMENDED NEXT STEPS</p>
      {store.recommendedNextSteps.map((step) => (
        <p key={step} style={{ ...rgLabel, color: RG.sage }}>· {step}</p>
      ))}
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {REMEMBRANCE_GARDEN_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: RG.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioFounderWalkPath()} style={{ ...rgLabel, color: '#78716C', fontSize: '6px' }}>→ FOUNDER WALK</Link>
        <Link to={adminStudioCampusEvolutionEnginePath()} style={{ ...rgLabel, color: '#0D9488', fontSize: '6px' }}>→ CAMPUS EVOLUTION</Link>
        <Link to={adminStudioArchitectStudioPath()} style={{ ...rgLabel, color: '#CA8A04', fontSize: '6px' }}>→ ARCHITECT STUDIO</Link>
        <Link to={adminStudioCompanyGenomePath()} style={{ ...rgLabel, color: '#9333EA', fontSize: '6px' }}>→ COMPANY GENOME</Link>
        <Link to={adminStudioLeadershipDnaPath()} style={{ ...rgLabel, color: '#CA8A04', fontSize: '6px' }}>→ LEADERSHIP DNA</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...rgLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioOrganizationalInheritancePath()} style={{ ...rgLabel, color: '#4F46E5', fontSize: '6px' }}>→ INHERITANCE</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...rgLabel, color: RG.sage, fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioFoundersPromisePath()} style={{ ...rgLabel, color: '#92400E', fontSize: '6px' }}>→ FOUNDER&apos;S PROMISE</Link>
      </div>
    </section>
  );
}
