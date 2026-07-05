import { Link } from 'react-router-dom';
import type { CompanyGenomeStore, CompanyGenomeWorkspaceId, GenomeZoomLevel } from '../../../../studio-os-core/company-genome/types';
import { COMPANY_GENOME_CONNECTED_SYSTEMS } from '../../../../studio-os-core/company-genome/constants';
import {
  adminStudioBrandArchitectPath,
  adminStudioChiefOfStaffPath,
  adminStudioCompanyMaturityEnginePath,
  adminStudioDigitalArchitectPath,
  adminStudioExperienceArchitectPath,
  adminStudioGrowthArchitectPath,
  adminStudioLeadershipDnaPath,
  adminStudioMemoryBiblePath,
  adminStudioOrganizationalInheritancePath,
  adminStudioReaderGraphPath,
  adminStudioRelationshipEnginePath,
  adminStudioArchitectStudioPath,
} from '../../../../utils/adminStudioRoutes';
import {
  CG,
  COMPANY_GENOME_STYLES,
  cgDarkHeader,
  cgLabel,
  cgLiveDot,
  cgPanel,
  cgSectionTitle,
  cgValue,
  scoreColor,
  trendColor,
} from './companyGenomeTheme';

type Props = {
  store: CompanyGenomeStore;
  onSelectWorkspace: (id: CompanyGenomeWorkspaceId) => void;
  onSetZoomLevel: (level: GenomeZoomLevel) => void;
};

export function CompanyGenomeHeader() {
  return (
    <>
      <style>{COMPANY_GENOME_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...cgDarkHeader, borderTop: `3px solid ${CG.violet}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          COMPANY GENOME
        </p>
        <p style={{ ...cgLabel, color: '#94A3B8' }}>
          <span style={cgLiveDot} />
          LIVING ORGANIZATIONAL GENETICS · THE HEARTBEAT · NOT ANALYTICS
        </p>
        <p style={{ ...cgLabel, color: '#CBD5E1', marginTop: 4 }}>
          WATCH YOUR ORGANIZATION EVOLVE · STRONGER · HEALTHIER · MORE INTELLIGENT
        </p>
      </header>
    </>
  );
}

export function GenomeDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>COMPANY GENOME · LIVING HQ</p>
      <p style={{ ...cgLabel, color: CG.violet, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <p style={{ ...cgLabel, color: CG.violet, marginTop: 4 }}>
        {store.companyName} · ZOOM: {d.activeZoomLevel.replace(/-/g, ' ').toUpperCase()}
      </p>
      <p style={{ ...cgValue, fontSize: '20px', marginTop: 8 }}>{d.unifiedHealthPct}% UNIFIED HEALTH</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['RESILIENCE', `${d.resiliencePct}%`],
          ['MATURITY', `${d.maturityPct}%`],
          ['INNOVATION', `${d.innovationPct}%`],
          ['GROWTH', `${d.growthPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: CG.panelBorder }}>
            <p style={{ ...cgValue, fontSize: '12px' }}>{val}</p>
            <p style={cgLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function GenomePhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>GENOME PHILOSOPHY · LIVING SYSTEM</p>
      {store.genomePhilosophy.map((line) => (
        <p key={line} style={{ ...cgLabel, color: CG.violet }}>· {line}</p>
      ))}
    </section>
  );
}

export function GenomeVisualizationPanel({ store, onSetZoomLevel }: Pick<Props, 'store' | 'onSetZoomLevel'>) {
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>GENOME VISUALIZATION · ZOOM LEVELS</p>
      <p style={{ ...cgLabel, fontSize: '5px', marginBottom: 8 }}>Living interactive structure · not charts · observe the organism</p>
      <div className="flex flex-wrap gap-1">
        {store.zoomLevels.map((z) => (
          <button
            key={z.level}
            type="button"
            onClick={() => onSetZoomLevel(z.level)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.dashboard.activeZoomLevel === z.level ? CG.violet : CG.panelBorder,
              color: store.dashboard.activeZoomLevel === z.level ? CG.violet : CG.gray,
              background: store.dashboard.activeZoomLevel === z.level ? 'rgba(147,51,234,0.06)' : 'white',
            }}
          >
            {z.label}
          </button>
        ))}
      </div>
      <p style={{ ...cgLabel, fontSize: '5px', marginTop: 8, color: CG.violet }}>
        ACTIVE: {store.zoomLevels.find((z) => z.level === store.dashboard.activeZoomLevel)?.description}
      </p>
    </section>
  );
}

export function GeneticLayersPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>GENETIC LAYERS · DNA HEALTH</p>
      {store.geneticLayers.map((l) => (
        <div key={l.id} className="p-2 mb-1 border" style={{ borderColor: CG.panelBorder, borderLeft: `3px solid ${CG.violet}` }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{l.label}</p>
            <span style={{ ...cgValue, fontSize: '10px' }}>{l.healthPct}%</span>
          </div>
          <div className="grid grid-cols-4 gap-1 mt-1">
            {[['MATURITY', l.maturityPct], ['CONF', l.confidencePct], ['GROWTH', l.growthPct]].map(([label, pct]) => (
              <span key={label as string} style={{ ...cgLabel, fontSize: '4px', color: scoreColor(pct as number) }}>{label} {pct}%</span>
            ))}
          </div>
          <p style={{ ...cgLabel, fontSize: '5px' }}>{l.inheritance}</p>
          <p style={{ ...cgLabel, fontSize: '5px', color: CG.slate }}>IMPACT: {l.organizationalImpact}</p>
        </div>
      ))}
    </section>
  );
}

export function GeneticRelationshipsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>GENETIC RELATIONSHIPS · SYSTEM INFLUENCE</p>
      {store.geneticRelationships.map((r) => (
        <div key={r.id} className="py-1 border-b" style={{ borderColor: CG.panelBorder }}>
          <p style={{ ...cgLabel, fontSize: '5px', color: CG.violet }}>
            {r.fromSystem} → {r.toSystem} · {r.strengthPct}%
          </p>
          <p style={{ ...cgLabel, fontSize: '5px' }}>{r.influence}</p>
        </div>
      ))}
    </section>
  );
}

export function GeneticEvolutionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>GENETIC EVOLUTION · ORGANIZATIONAL TIMELINE</p>
      {store.evolutionTimeline.map((e) => (
        <div key={e.id} className="flex gap-2 py-1 border-b" style={{ borderColor: CG.panelBorder }}>
          <span style={{ ...cgLabel, color: CG.violet, minWidth: 48 }}>{e.date}</span>
          <div>
            <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{e.label}</p>
            <p style={{ ...cgLabel, fontSize: '5px' }}>{e.category} · {e.impact}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalHealthPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>ORGANIZATIONAL HEALTH · UNIFIED SCORECARD</p>
      {store.healthDimensions.map((h) => (
        <div key={h.id} className="flex justify-between py-0.5">
          <span style={cgLabel}>{h.dimension}</span>
          <span style={{ ...cgLabel, color: scoreColor(h.scorePct) }}>{h.scorePct}%</span>
        </div>
      ))}
    </section>
  );
}

export function GenomeIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>GENOME INTELLIGENCE · PROACTIVE IMPROVEMENTS</p>
      {store.intelligenceAlerts.map((a) => (
        <div key={a.id} className="p-2 mb-1 border" style={{ borderColor: CG.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{a.category}</p>
            <span className="text-[5px] font-futura" style={{ color: a.priority === 'critical' ? CG.red : a.priority === 'high' ? CG.violet : CG.gray }}>{a.priority.toUpperCase()}</span>
          </div>
          <p style={{ ...cgLabel, fontSize: '5px' }}>{a.signal}</p>
          <p style={{ ...cgLabel, fontSize: '5px', color: CG.violet }}>→ {a.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function ResiliencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>ORGANIZATIONAL RESILIENCE · TRENDS</p>
      {store.resilienceMetrics.map((r) => (
        <div key={r.id} className="flex justify-between py-1 border-b" style={{ borderColor: CG.panelBorder }}>
          <span style={cgLabel}>{r.metric}</span>
          <div className="flex gap-2">
            <span style={{ ...cgLabel, color: scoreColor(r.scorePct) }}>{r.scorePct}%</span>
            <span style={{ ...cgLabel, fontSize: '5px', color: trendColor(r.trend) }}>{r.trend.toUpperCase()}</span>
          </div>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalFingerprintPanel({ store }: Pick<Props, 'store'>) {
  const f = store.fingerprint;
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>ORGANIZATIONAL FINGERPRINT · UNIQUE GENOME</p>
      <p style={{ ...cgValue, fontSize: '18px' }}>{f.uniquenessScore}% UNIQUENESS</p>
      <p style={{ ...cgSectionTitle, fontSize: '7px', marginTop: 8 }}>DIFFERENTIATION</p>
      {f.competitiveDifferentiation.map((d) => <p key={d} style={{ ...cgLabel, fontSize: '5px', color: CG.violet }}>· {d}</p>)}
      <p style={{ ...cgSectionTitle, fontSize: '7px', marginTop: 8 }}>GENETIC STRENGTHS</p>
      {f.geneticStrengths.map((s) => <p key={s} style={{ ...cgLabel, fontSize: '5px', color: CG.green }}>· {s}</p>)}
      <p style={{ ...cgSectionTitle, fontSize: '7px', marginTop: 8 }}>RARE CAPABILITIES</p>
      {f.rareCapabilities.map((c) => <p key={c} style={{ ...cgLabel, fontSize: '5px' }}>· {c}</p>)}
      <p style={{ ...cgSectionTitle, fontSize: '7px', marginTop: 8 }}>INSTITUTIONAL ADVANTAGES</p>
      {f.institutionalAdvantages.map((a) => <p key={a} style={{ ...cgLabel, fontSize: '5px', color: CG.slate }}>· {a}</p>)}
    </section>
  );
}

export function GenomeSimulationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>FUTURE SIMULATION · GENOME IMPACT</p>
      {store.simulations.map((s) => (
        <div key={s.id} className="p-2 mb-2 border" style={{ borderColor: CG.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515, color: CG.violet }}>{s.scenario}</p>
          <p style={{ ...cgLabel, fontSize: '5px' }}>{s.genomeImpact}</p>
          <p style={{ ...cgLabel, fontSize: '5px' }}>
            HEALTH {s.healthDeltaPct > 0 ? '+' : ''}{s.healthDeltaPct}% · RESILIENCE +{s.resilienceDeltaPct}% · CONF {s.confidencePct}%
          </p>
          {s.recommendations.map((r) => <p key={r} style={{ ...cgLabel, fontSize: '5px', color: CG.slate }}>→ {r}</p>)}
        </div>
      ))}
    </section>
  );
}

export function CrossCompanyGeneticsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>CROSS-COMPANY GENETICS · PORTFOLIO</p>
      {store.crossCompanyGenetics.map((c) => (
        <div key={c.id} className="p-2 mb-2 border" style={{ borderColor: CG.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{c.company}</p>
            <span style={{ ...cgLabel, color: CG.violet }}>{c.overlapPct}% OVERLAP</span>
          </div>
          <p style={{ ...cgSectionTitle, fontSize: '6px' }}>SHARED</p>
          {c.sharedGenetics.map((g) => <p key={g} style={{ ...cgLabel, fontSize: '5px' }}>· {g}</p>)}
          <p style={{ ...cgSectionTitle, fontSize: '6px' }}>UNIQUE</p>
          {c.uniqueGenetics.map((g) => <p key={g} style={{ ...cgLabel, fontSize: '5px', color: CG.violet }}>· {g}</p>)}
        </div>
      ))}
    </section>
  );
}

export function KnowledgeFlowPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>KNOWLEDGE FLOW · INSTITUTIONAL CIRCULATION</p>
      {store.knowledgeFlow.map((k) => (
        <div key={k.id} className="py-1 border-b" style={{ borderColor: CG.panelBorder }}>
          <p style={{ ...cgLabel, fontSize: '5px', color: CG.violet }}>{k.from} → {k.to} · {k.strengthPct}%</p>
          <p style={{ ...cgLabel, fontSize: '5px' }}>{k.flowType}</p>
        </div>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Pick<Props, 'store' | 'onSelectWorkspace'>) {
  const workspaces: CompanyGenomeWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os', 'portfolio'];
  return (
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>GENOME WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectWorkspace(id)}
            className="text-[5px] font-futura px-2 py-1 border"
            style={{
              borderColor: store.activeWorkspaceId === id ? CG.violet : CG.panelBorder,
              color: store.activeWorkspaceId === id ? CG.violet : CG.gray,
              background: store.activeWorkspaceId === id ? 'rgba(147,51,234,0.04)' : 'white',
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
    <section className="p-3 mb-3" style={cgPanel}>
      <p style={cgSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {COMPANY_GENOME_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: CG.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioCompanyMaturityEnginePath()} style={{ ...cgLabel, color: '#0369A1', fontSize: '6px' }}>→ MATURITY ENGINE</Link>
        <Link to={adminStudioBrandArchitectPath()} style={{ ...cgLabel, color: '#BE185D', fontSize: '6px' }}>→ BRAND ARCHITECT</Link>
        <Link to={adminStudioExperienceArchitectPath()} style={{ ...cgLabel, color: '#0891B2', fontSize: '6px' }}>→ EXPERIENCE ARCHITECT</Link>
        <Link to={adminStudioDigitalArchitectPath()} style={{ ...cgLabel, color: '#6366F1', fontSize: '6px' }}>→ DIGITAL ARCHITECT</Link>
        <Link to={adminStudioGrowthArchitectPath()} style={{ ...cgLabel, color: '#059669', fontSize: '6px' }}>→ GROWTH ARCHITECT</Link>
        <Link to={adminStudioMemoryBiblePath()} style={{ ...cgLabel, color: CG.violet, fontSize: '6px' }}>→ CREATIVE DNA</Link>
        <Link to={adminStudioLeadershipDnaPath()} style={{ ...cgLabel, color: '#CA8A04', fontSize: '6px' }}>→ LEADERSHIP DNA</Link>
        <Link to={adminStudioReaderGraphPath()} style={{ ...cgLabel, color: '#7C3AED', fontSize: '6px' }}>→ READER GRAPH</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...cgLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioOrganizationalInheritancePath()} style={{ ...cgLabel, color: '#4F46E5', fontSize: '6px' }}>→ INHERITANCE</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...cgLabel, color: CG.accent, fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioArchitectStudioPath()} style={{ ...cgLabel, color: '#CA8A04', fontSize: '6px' }}>→ ARCHITECT STUDIO</Link>
      </div>
    </section>
  );
}
