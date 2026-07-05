import { Link } from 'react-router-dom';
import type {
  KnowledgeAssetEngineStore,
  KnowledgeAssetProfile,
  KnowledgeAssetWorkspaceId,
  KnowledgeEvolution,
  KnowledgeMaturityMetrics,
  SingleSourceOfTruth,
} from '../../../../studio-os-core/knowledge-asset-engine/types';
import { KNOWLEDGE_ASSET_CONNECTED_SYSTEMS } from '../../../../studio-os-core/knowledge-asset-engine/constants';
import {
  adminStudioCampaignEnginePath,
  adminStudioChiefOfStaffPath,
  adminStudioCompanyMaturityEnginePath,
  adminStudioDistributionEnginePath,
  adminStudioEcosystemMarketplacePath,
  adminStudioOrganizationalInheritancePath,
  adminStudioReaderGraphPath,
  adminStudioRelationshipEnginePath,
  adminStudioStrategyEnginePath,
} from '../../../../utils/adminStudioRoutes';
import {
  KNOWLEDGE_ASSET_ENGINE_STYLES,
  KAE,
  kaeDarkHeader,
  kaeLabel,
  kaeLiveDot,
  kaePanel,
  kaeSectionTitle,
  kaeValue,
  scoreColor,
} from './knowledgeAssetEngineTheme';

type Props = {
  store: KnowledgeAssetEngineStore;
  selectedAsset: KnowledgeAssetProfile | null;
  workspaceAssets: KnowledgeAssetProfile[];
  assetSsot: SingleSourceOfTruth | null;
  assetEvolution: KnowledgeEvolution | null;
  assetMaturity: KnowledgeMaturityMetrics | null;
  assetLineage: KnowledgeAssetEngineStore['lineage'];
  assetRelationships: KnowledgeAssetEngineStore['relationships'];
  assetTransformations: KnowledgeAssetEngineStore['transformations'];
  assetIntelligence: KnowledgeAssetEngineStore['intelligenceRecs'];
  assetRevenue: KnowledgeAssetEngineStore['revenue'][string] | null;
  onSelectWorkspace: (id: KnowledgeAssetWorkspaceId) => void;
  onSelectAsset: (id: string | null) => void;
};

export function KnowledgeAssetEngineHeader() {
  return (
    <>
      <style>{KNOWLEDGE_ASSET_ENGINE_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...kaeDarkHeader, borderTop: `3px solid ${KAE.teal}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          KNOWLEDGE ASSET ENGINE
        </p>
        <p style={{ ...kaeLabel, color: '#94A3B8' }}>
          <span style={kaeLiveDot} />
          FOUNDATIONAL OBJECT MODEL · EVERYTHING IS A KNOWLEDGE ASSET · NOT ISOLATED FILES
        </p>
        <p style={{ ...kaeLabel, color: '#CBD5E1', marginTop: 4 }}>
          LIVING ORGANIZATIONAL INTELLIGENCE · SINGLE SOURCE OF TRUTH · KNOWLEDGE COMPOUNDS FOREVER
        </p>
      </header>
    </>
  );
}

export function KnowledgeDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  const h = store.health;
  return (
    <section className="p-3 mb-3" style={kaePanel}>
      <p style={kaeSectionTitle}>KNOWLEDGE ASSET ENGINE · ACTIVE HQ</p>
      <p style={{ ...kaeLabel, color: KAE.teal, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-3">
        {[
          ['TOTAL ASSETS', d.totalAssets],
          ['CANONICAL', d.canonicalSources],
          ['AVG MATURITY', `${d.avgMaturityPct}%`],
          ['DERIVED', d.derivedFormats],
          ['ACADEMY PATHS', d.academyPaths],
          ['HEALTH', `${d.knowledgeHealthPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: KAE.panelBorder }}>
            <p style={{ ...kaeValue, fontSize: '12px' }}>{val}</p>
            <p style={kaeLabel}>{label}</p>
          </div>
        ))}
      </div>
      <p style={{ ...kaeLabel, marginTop: 8, fontSize: '6px' }}>
        Connected {h.connectedAssetsPct}% · Orphaned {h.orphanedAssets} · Stale {h.staleAssets} · Revenue-generating {h.revenueGenerating}
      </p>
    </section>
  );
}

export function KnowledgePhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={kaePanel}>
      <p style={kaeSectionTitle}>KNOWLEDGE PHILOSOPHY · UNIFIED MODEL</p>
      {store.knowledgePhilosophy.map((line) => (
        <p key={line} style={{ ...kaeLabel, color: KAE.teal }}>· {line}</p>
      ))}
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Pick<Props, 'store' | 'onSelectWorkspace'>) {
  const workspaces: KnowledgeAssetWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os'];
  return (
    <section className="p-3 mb-3" style={kaePanel}>
      <p style={kaeSectionTitle}>KNOWLEDGE WORKSPACE</p>
      <div className="flex gap-1 flex-wrap">
        {workspaces.map((ws) => (
          <button
            key={ws}
            type="button"
            onClick={() => onSelectWorkspace(ws)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.activeWorkspaceId === ws ? KAE.teal : KAE.panelBorder,
              color: store.activeWorkspaceId === ws ? KAE.teal : KAE.gray,
              background: store.activeWorkspaceId === ws ? 'rgba(13,148,136,0.06)' : 'white',
            }}
          >
            {ws.toUpperCase()}
          </button>
        ))}
      </div>
    </section>
  );
}

export function KnowledgeLibraryPanel({ store, workspaceAssets, onSelectAsset }: Pick<Props, 'store' | 'workspaceAssets' | 'onSelectAsset'>) {
  return (
    <section className="p-3 mb-3" style={kaePanel}>
      <p style={kaeSectionTitle}>KNOWLEDGE LIBRARY · ALL ASSETS</p>
      {workspaceAssets.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => onSelectAsset(a.id)}
          className="w-full text-left py-2 border-b"
          style={{
            borderColor: KAE.panelBorder,
            background: store.selectedAssetId === a.id ? 'rgba(13,148,136,0.04)' : 'transparent',
          }}
        >
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: scoreColor(a.knowledgeScore) }}>
            {a.knowledgeAssetId} · {a.title}
          </p>
          <p style={{ ...kaeLabel, fontSize: '5px' }}>
            {a.assetType.toUpperCase()} · {a.maturityStage.toUpperCase()} · SCORE {a.knowledgeScore}%
          </p>
        </button>
      ))}
    </section>
  );
}

export function AssetProfilePanel({ selectedAsset }: Pick<Props, 'selectedAsset'>) {
  if (!selectedAsset) return null;
  const a = selectedAsset;
  return (
    <section className="p-3 mb-3" style={{ ...kaePanel, borderLeft: `4px solid ${KAE.teal}` }}>
      <p style={kaeSectionTitle}>KNOWLEDGE ASSET PROFILE · {a.knowledgeAssetId}</p>
      <p style={kaeLabel}>{a.description}</p>
      <div className="grid grid-cols-3 gap-2 my-2">
        {[
          ['KNOWLEDGE', a.knowledgeScore],
          ['QUALITY', a.qualityScore],
          ['MATURITY', a.knowledgeMaturityPct],
          ['CONFIDENCE', a.confidencePct],
          ['USAGE', a.usageCount],
          ['STAGE', a.maturityStage.toUpperCase()],
        ].map(([label, val]) => (
          <div key={label} className="text-center p-1 border" style={{ borderColor: KAE.panelBorder }}>
            <p style={{ ...kaeValue, fontSize: typeof val === 'number' ? '11px' : '9px', color: typeof val === 'number' ? scoreColor(val) : KAE.teal }}>{val}</p>
            <p style={{ ...kaeLabel, fontSize: '5px' }}>{label}</p>
          </div>
        ))}
      </div>
      <p style={kaeLabel}>OWNER: {a.owner} · ORG: {a.organization} · ORIGIN: {a.origin}</p>
      <p style={kaeLabel}>TYPE: {a.assetType} · v{a.version} · {a.status.toUpperCase()} · {a.lastUpdated}</p>
      <p style={kaeLabel}>CONTRIBUTORS: {a.contributors.join(' · ')}</p>
      <p style={{ ...kaeLabel, color: KAE.teal }}>POTENTIAL: {a.futurePotential}</p>
    </section>
  );
}

export function SingleSourceOfTruthPanel({ assetSsot, selectedAsset }: Pick<Props, 'assetSsot' | 'selectedAsset'>) {
  if (!assetSsot || !selectedAsset) return null;
  return (
    <section className="p-3 mb-3" style={kaePanel}>
      <p style={kaeSectionTitle}>SINGLE SOURCE OF TRUTH · {assetSsot.canonicalTitle}</p>
      <p style={{ ...kaeLabel, color: KAE.teal, marginBottom: 8 }}>CANONICAL → ALL DERIVED REMAIN CONNECTED</p>
      {assetSsot.derivedAssets.map((d) => (
        <div key={d.id} className="py-1 border-b" style={{ borderColor: KAE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>
            {d.format} · {d.title} · {d.status.toUpperCase()}
          </p>
          <p style={{ ...kaeLabel, fontSize: '5px' }}>Synced {d.lastSynced}</p>
        </div>
      ))}
      <p style={{ ...kaeLabel, color: KAE.teal, marginTop: 8 }}>SYNC: {assetSsot.syncRecommendation}</p>
    </section>
  );
}

export function KnowledgeEvolutionPanel({ assetEvolution }: Pick<Props, 'assetEvolution'>) {
  if (!assetEvolution) return null;
  const e = assetEvolution;
  return (
    <section className="p-3 mb-3" style={kaePanel}>
      <p style={kaeSectionTitle}>KNOWLEDGE EVOLUTION · CONTINUOUS IMPROVEMENT</p>
      {e.versions.map((v) => (
        <div key={v.version} className="py-1 border-b" style={{ borderColor: KAE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>v{v.version} · {v.date} · {v.contributor}</p>
          <p style={{ ...kaeLabel, fontSize: '5px' }}>{v.summary}</p>
        </div>
      ))}
      <p style={kaeLabel}>PERFORMANCE: {e.performanceTrend} · ACCURACY +{e.accuracyImprovementPct}%</p>
      {e.readerInsights.map((i) => <p key={i} style={{ ...kaeLabel, fontSize: '5px' }}>READER: {i}</p>)}
      {e.institutionalLearning.map((l) => <p key={l} style={{ ...kaeLabel, fontSize: '5px', color: KAE.teal }}>LEARNING: {l}</p>)}
    </section>
  );
}

export function KnowledgeLineagePanel({ assetLineage, selectedAsset }: Pick<Props, 'assetLineage' | 'selectedAsset'>) {
  const nodes = selectedAsset ? assetLineage : [];
  if (!nodes.length && !selectedAsset) return null;
  return (
    <section className="p-3 mb-3" style={kaePanel}>
      <p style={kaeSectionTitle}>KNOWLEDGE LINEAGE · HOW KNOWLEDGE SPREADS</p>
      {nodes.map((n) => (
        <div key={n.id} className="py-1 border-b" style={{ borderColor: KAE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: KAE.teal }}>
            {n.relation.toUpperCase()} · {n.label}
          </p>
          <p style={{ ...kaeLabel, fontSize: '5px' }}>{n.targetLabel}</p>
        </div>
      ))}
    </section>
  );
}

export function KnowledgeMaturityPanel({ assetMaturity, store, selectedAsset }: Pick<Props, 'assetMaturity' | 'store' | 'selectedAsset'>) {
  return (
    <section className="p-3 mb-3" style={kaePanel}>
      <p style={kaeSectionTitle}>KNOWLEDGE MATURITY · STAGES</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {store.maturityStages.map((s) => (
          <span
            key={s.stage}
            className="text-[5px] font-futura px-1 py-0.5 border"
            style={{
              borderColor: selectedAsset?.maturityStage === s.stage ? KAE.teal : KAE.panelBorder,
              color: selectedAsset?.maturityStage === s.stage ? KAE.teal : KAE.gray,
            }}
          >
            {s.label}
          </span>
        ))}
      </div>
      {assetMaturity && (
        <div className="grid grid-cols-2 gap-1">
          {[
            ['ACCURACY', assetMaturity.accuracyPct],
            ['ADOPTION', assetMaturity.adoptionPct],
            ['REUSE', assetMaturity.reusePct],
            ['LONGEVITY', assetMaturity.longevityPct],
            ['READER VALUE', assetMaturity.readerValuePct],
            ['ORG IMPORTANCE', assetMaturity.organizationalImportancePct],
          ].map(([label, val]) => (
            <div key={label} className="p-1 border text-center" style={{ borderColor: KAE.panelBorder }}>
              <p style={{ ...kaeValue, fontSize: '10px', color: scoreColor(val as number) }}>{val}%</p>
              <p style={{ ...kaeLabel, fontSize: '5px' }}>{label}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function KnowledgeRelationshipsPanel({ assetRelationships }: Pick<Props, 'assetRelationships'>) {
  if (!assetRelationships.length) return null;
  return (
    <section className="p-3 mb-3" style={kaePanel}>
      <p style={kaeSectionTitle}>KNOWLEDGE RELATIONSHIPS · LIVING NETWORK</p>
      {assetRelationships.map((r) => (
        <div key={r.id} className="py-1 border-b" style={{ borderColor: KAE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>
            {r.type.toUpperCase()} · {r.targetLabel}
          </p>
        </div>
      ))}
    </section>
  );
}

export function KnowledgeTransformationPanel({ assetTransformations }: Pick<Props, 'assetTransformations'>) {
  if (!assetTransformations.length) return null;
  return (
    <section className="p-3 mb-3" style={kaePanel}>
      <p style={kaeSectionTitle}>KNOWLEDGE TRANSFORMATION · ONE ASSET → MANY FORMATS</p>
      {assetTransformations.map((t) => (
        <div key={t.id} className="py-1 border-b" style={{ borderColor: KAE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: t.status === 'complete' ? KAE.green : KAE.teal }}>
            {t.targetFormat.toUpperCase()} · {t.label} · {t.status.toUpperCase()}
          </p>
          <p style={{ ...kaeLabel, fontSize: '5px' }}>{t.preservesSourceOfTruth ? '✓ SSOT PRESERVED' : 'SSOT AT RISK'}</p>
        </div>
      ))}
    </section>
  );
}

export function KnowledgeIntelligencePanel({ assetIntelligence }: Pick<Props, 'assetIntelligence'>) {
  return (
    <section className="p-3 mb-3" style={kaePanel}>
      <p style={kaeSectionTitle}>KNOWLEDGE INTELLIGENCE · STUDIO RECOMMENDATIONS</p>
      {assetIntelligence.map((r) => (
        <div key={r.id} className="py-2 border-b" style={{ borderColor: KAE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: scoreColor(r.confidencePct) }}>
            {r.action.toUpperCase()} · {r.label} · {r.confidencePct}%
          </p>
          <p style={{ ...kaeLabel, fontSize: '5px' }}>{r.rationale}</p>
          <p style={{ ...kaeLabel, color: KAE.teal, fontSize: '5px' }}>IMPACT: {r.expectedImpact}</p>
        </div>
      ))}
    </section>
  );
}

export function KnowledgeRevenuePanel({ assetRevenue }: Pick<Props, 'assetRevenue'>) {
  if (!assetRevenue) return null;
  return (
    <section className="p-3 mb-3" style={kaePanel}>
      <p style={kaeSectionTitle}>KNOWLEDGE MONETIZATION · REVENUE</p>
      <p style={{ ...kaeValue, fontSize: '12px' }}>{assetRevenue.totalRevenue}</p>
      {assetRevenue.channels.map((c) => (
        <p key={c.channel} style={kaeLabel}>{c.channel}: {c.amount}</p>
      ))}
      <p style={kaeLabel}>FORECAST: {assetRevenue.forecast}</p>
      <p style={{ ...kaeLabel, color: KAE.teal }}>POTENTIAL: {assetRevenue.monetizationPotential}</p>
    </section>
  );
}

export function KnowledgeAcademyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={kaePanel}>
      <p style={kaeSectionTitle}>KNOWLEDGE ACADEMY · TEACHABLE BY DEFAULT</p>
      {store.academyPaths.map((p) => (
        <div key={p.id} className="py-2 border-b" style={{ borderColor: KAE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: KAE.teal }}>
            {p.title} · {p.type.replace(/-/g, ' ').toUpperCase()}
          </p>
          <p style={{ ...kaeLabel, fontSize: '5px' }}>{p.description}</p>
          <p style={{ ...kaeLabel, fontSize: '5px' }}>{p.assetIds.length} assets · {p.progressPct}% complete</p>
        </div>
      ))}
    </section>
  );
}

export function ExecutiveIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={kaePanel}>
      <p style={kaeSectionTitle}>EXECUTIVE INTELLIGENCE · EXECUTIVES LEARN FROM ASSETS</p>
      {store.executiveLinks.map((e) => (
        <div key={e.id} className="py-1 border-b" style={{ borderColor: KAE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{e.executiveRole}</p>
          <p style={{ ...kaeLabel, fontSize: '5px' }}>{e.trainingFocus}</p>
          <p style={{ ...kaeLabel, fontSize: '5px' }}>{e.assetIds.length} knowledge assets</p>
        </div>
      ))}
    </section>
  );
}

export function KnowledgeInheritancePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={kaePanel}>
      <p style={kaeSectionTitle}>KNOWLEDGE INHERITANCE · FUTURE COMPANIES</p>
      {store.inheritancePackages.map((p) => (
        <div key={p.id} className="py-2 border-b" style={{ borderColor: KAE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: KAE.teal }}>{p.industry}</p>
          <p style={{ ...kaeLabel, fontSize: '5px' }}>{p.description}</p>
          <p style={{ ...kaeLabel, fontSize: '5px' }}>{p.assetIds.length} assets · {p.preservesEvolution ? 'EVOLUTION PRESERVED ✓' : ''}</p>
        </div>
      ))}
      <Link
        to={adminStudioOrganizationalInheritancePath()}
        style={{ ...kaeLabel, color: KAE.teal, fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8, fontSize: '6px' }}
      >
        → OPEN ORGANIZATIONAL INHERITANCE
      </Link>
    </section>
  );
}

export function KnowledgeHealthPanel({ store }: Pick<Props, 'store'>) {
  const h = store.health;
  return (
    <section className="p-3 mb-3" style={kaePanel}>
      <p style={kaeSectionTitle}>KNOWLEDGE HEALTH · INSTITUTIONAL MEMORY</p>
      <div className="grid grid-cols-2 gap-2">
        {[
          ['OVERALL', `${h.overallPct}%`],
          ['CONNECTED', `${h.connectedAssetsPct}%`],
          ['ORPHANED', h.orphanedAssets],
          ['STALE', h.staleAssets],
          ['AVG MATURITY', `${h.avgMaturityPct}%`],
          ['REVENUE', h.revenueGenerating],
        ].map(([label, val]) => (
          <div key={label} className="p-1 border text-center" style={{ borderColor: KAE.panelBorder }}>
            <p style={{ ...kaeValue, fontSize: '10px' }}>{val}</p>
            <p style={{ ...kaeLabel, fontSize: '5px' }}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AssetTypesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={kaePanel}>
      <p style={kaeSectionTitle}>KNOWLEDGE ASSET TYPES · UNIFIED MODEL</p>
      <div className="flex flex-wrap gap-1">
        {store.assetTypes.map((t) => (
          <span key={t.id} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: KAE.panelBorder }}>{t.label}</span>
        ))}
      </div>
    </section>
  );
}

export function CosIntegrationPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...kaePanel, borderLeft: `4px solid ${KAE.teal}` }}>
      <p style={kaeSectionTitle}>CHIEF OF STAFF · KNOWLEDGE GOVERNANCE</p>
      <p style={kaeLabel}>Knowledge asset approvals · canonical source integrity · institutional memory protection</p>
      <Link
        to={adminStudioChiefOfStaffPath()}
        style={{ ...kaeLabel, color: KAE.teal, fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8, fontSize: '6px' }}
      >
        → OPEN CHIEF OF STAFF
      </Link>
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={kaePanel}>
      <p style={kaeSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {KNOWLEDGE_ASSET_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: KAE.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioDistributionEnginePath()} style={{ ...kaeLabel, color: '#7C3AED', fontSize: '6px' }}>→ DISTRIBUTION ENGINE</Link>
        <Link to={adminStudioReaderGraphPath()} style={{ ...kaeLabel, color: '#E11D48', fontSize: '6px' }}>→ READER GRAPH</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...kaeLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioStrategyEnginePath()} style={{ ...kaeLabel, color: '#334155', fontSize: '6px' }}>→ STRATEGY ENGINE</Link>
        <Link to={adminStudioCampaignEnginePath()} style={{ ...kaeLabel, color: '#D97706', fontSize: '6px' }}>→ CAMPAIGN ENGINE</Link>
        <Link to={adminStudioEcosystemMarketplacePath()} style={{ ...kaeLabel, color: '#4F46E5', fontSize: '6px' }}>→ ECOSYSTEM MARKETPLACE</Link>
        <Link to={adminStudioOrganizationalInheritancePath()} style={{ ...kaeLabel, color: KAE.teal, fontSize: '6px' }}>→ ORGANIZATIONAL INHERITANCE</Link>
        <Link to={adminStudioCompanyMaturityEnginePath()} style={{ ...kaeLabel, color: '#0369A1', fontSize: '6px' }}>→ COMPANY MATURITY ENGINE</Link>
      </div>
    </section>
  );
}
