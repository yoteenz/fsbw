import { Link } from 'react-router-dom';
import type {
  AssetEvolution,
  CompatibilitySimulation,
  EcosystemMarketplaceStore,
  EcosystemMarketplaceWorkspaceId,
  InheritanceIntegration,
  MarketplaceAssetProfile,
} from '../../../../studio-os-core/ecosystem-marketplace/types';
import {
  ECOSYSTEM_MARKETPLACE_CONNECTED_SYSTEMS,
  LICENSING_LABELS,
} from '../../../../studio-os-core/ecosystem-marketplace/constants';
import {
  adminStudioCampaignEnginePath,
  adminStudioChiefOfStaffPath,
  adminStudioCreatorMarketplacePath,
  adminStudioOrganizationalInheritancePath,
  adminStudioReaderGraphPath,
  adminStudioRelationshipEnginePath,
  adminStudioStrategyEnginePath,
  adminStudioKnowledgeAssetEnginePath,
} from '../../../../utils/adminStudioRoutes';
import {
  ECOSYSTEM_MARKETPLACE_STYLES,
  EM,
  emDarkHeader,
  emLabel,
  emLiveDot,
  emPanel,
  emSectionTitle,
  emValue,
  scoreColor,
} from './ecosystemMarketplaceTheme';

type Props = {
  store: EcosystemMarketplaceStore;
  selectedAsset: MarketplaceAssetProfile | null;
  workspaceAssets: MarketplaceAssetProfile[];
  assetInheritance: InheritanceIntegration | null;
  assetSimulation: CompatibilitySimulation | null;
  assetEvolution: AssetEvolution | null;
  onSelectWorkspace: (id: EcosystemMarketplaceWorkspaceId) => void;
  onSelectAsset: (id: string | null) => void;
};

export function EcosystemMarketplaceHeader() {
  return (
    <>
      <style>{ECOSYSTEM_MARKETPLACE_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...emDarkHeader, borderTop: `3px solid ${EM.indigo}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          ECOSYSTEM MARKETPLACE
        </p>
        <p style={{ ...emLabel, color: '#94A3B8' }}>
          <span style={emLiveDot} />
          ORGANIZATIONAL INTELLIGENCE · NOT AN APP STORE · CAPABILITY OVER FILES
        </p>
        <p style={{ ...emLabel, color: '#CBD5E1', marginTop: 4 }}>
          PUBLISH · LICENSE · INHERIT · COLLABORATE · COMPOUND ORGANIZATIONAL WISDOM
        </p>
      </header>
    </>
  );
}

export function MarketplaceDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={emPanel}>
      <p style={emSectionTitle}>ECOSYSTEM MARKETPLACE · ACTIVE HQ</p>
      <p style={{ ...emLabel, color: EM.indigo, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-3">
        {[
          ['FEATURED', d.featuredAssets],
          ['VERIFIED ORGS', d.verifiedOrgs],
          ['INSTALLED', d.installedAssets],
          ['AVG COMPAT', `${d.avgCompatibility}%`],
          ['CONTRIBUTORS', d.topContributors],
          ['HEALTH', `${d.marketplaceHealthPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: EM.panelBorder }}>
            <p style={{ ...emValue, fontSize: '12px' }}>{val}</p>
            <p style={emLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MarketplacePhilosophyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={emPanel}>
      <p style={emSectionTitle}>MARKETPLACE PHILOSOPHY · ORGANIZATIONAL CAPABILITY</p>
      {store.marketplacePhilosophy.map((line) => (
        <p key={line} style={{ ...emLabel, color: EM.indigo }}>· {line}</p>
      ))}
      <p style={{ ...emLabel, marginTop: 8, fontSize: '6px' }}>
        Organizational genetics · playbooks · creative systems · automation · knowledge assets · training academies
      </p>
    </section>
  );
}

export function WorkspaceSelectorPanel({ store, onSelectWorkspace }: Pick<Props, 'store' | 'onSelectWorkspace'>) {
  const workspaces: EcosystemMarketplaceWorkspaceId[] = ['ndxbook', 'frontal-slayer', 'studio-os'];
  return (
    <section className="p-3 mb-3" style={emPanel}>
      <p style={emSectionTitle}>MARKETPLACE WORKSPACE</p>
      <div className="flex gap-1 flex-wrap">
        {workspaces.map((ws) => (
          <button
            key={ws}
            type="button"
            onClick={() => onSelectWorkspace(ws)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.activeWorkspaceId === ws ? EM.indigo : EM.panelBorder,
              color: store.activeWorkspaceId === ws ? EM.indigo : EM.gray,
              background: store.activeWorkspaceId === ws ? 'rgba(79,70,229,0.06)' : 'white',
            }}
          >
            {ws.toUpperCase()}
          </button>
        ))}
      </div>
    </section>
  );
}

export function FeaturedAssetsPanel({ store, workspaceAssets, onSelectAsset }: Pick<Props, 'store' | 'workspaceAssets' | 'onSelectAsset'>) {
  const featured = workspaceAssets.filter((a) => a.featured);
  return (
    <section className="p-3 mb-3" style={emPanel}>
      <p style={emSectionTitle}>FEATURED ASSETS · ORGANIZATIONAL INTELLIGENCE</p>
      {featured.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => onSelectAsset(a.id)}
          className="w-full text-left py-2 border-b"
          style={{
            borderColor: EM.panelBorder,
            background: store.selectedAssetId === a.id ? 'rgba(79,70,229,0.04)' : 'transparent',
          }}
        >
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: scoreColor(a.performancePct) }}>
            {a.title} · {a.category.replace(/-/g, ' ').toUpperCase()} · ★{a.rating}
          </p>
          <p style={{ ...emLabel, fontSize: '5px' }}>
            {a.organization} · {a.downloads} DL · {a.activeCompanies} COS · {LICENSING_LABELS[a.licensing]}
          </p>
        </button>
      ))}
    </section>
  );
}

export function AssetDiscoveryPanel({ store, workspaceAssets, onSelectAsset }: Pick<Props, 'store' | 'workspaceAssets' | 'onSelectAsset'>) {
  return (
    <section className="p-3 mb-3" style={emPanel}>
      <p style={emSectionTitle}>ASSET LIBRARY · DISCOVER</p>
      {workspaceAssets.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => onSelectAsset(a.id)}
          className="w-full text-left py-2 border-b"
          style={{
            borderColor: EM.panelBorder,
            background: store.selectedAssetId === a.id ? 'rgba(79,70,229,0.04)' : 'transparent',
          }}
        >
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: scoreColor(a.compatibilityPct) }}>
            {a.title} · COMPAT {a.compatibilityPct}%
          </p>
          <p style={{ ...emLabel, fontSize: '5px' }}>
            {a.creatorOrg} · v{a.version} · {a.verified ? '✓ VERIFIED' : 'UNVERIFIED'}
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
    <section className="p-3 mb-3" style={{ ...emPanel, borderLeft: `4px solid ${EM.indigo}` }}>
      <p style={emSectionTitle}>ASSET PROFILE · {a.title}</p>
      <p style={emLabel}>{a.description}</p>
      <div className="grid grid-cols-3 gap-2 my-2">
        {[
          ['RATING', `★${a.rating}`],
          ['PERF', `${a.performancePct}%`],
          ['COMPAT', `${a.compatibilityPct}%`],
          ['DOWNLOADS', a.downloads],
          ['COMPANIES', a.activeCompanies],
          ['MATURITY', `${a.knowledgeMaturityPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="text-center p-1 border" style={{ borderColor: EM.panelBorder }}>
            <p style={{ ...emValue, fontSize: '10px' }}>{val}</p>
            <p style={{ ...emLabel, fontSize: '5px' }}>{label}</p>
          </div>
        ))}
      </div>
      <p style={emLabel}>CREATOR: {a.creatorOrg} · ORG: {a.organization} · v{a.version} · {a.lastUpdated}</p>
      <p style={emLabel}>LICENSE: {LICENSING_LABELS[a.licensing]} · REVIEWS: {a.reviewCount} · {a.inheritanceCompatible ? 'INHERITANCE ✓' : 'NO INHERIT'}</p>
      {a.verificationBadges.length > 0 && (
        <p style={{ ...emLabel, color: EM.indigo }}>VERIFIED: {a.verificationBadges.map((b) => b.replace(/-/g, ' ').toUpperCase()).join(' · ')}</p>
      )}
    </section>
  );
}

export function CategoriesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={emPanel}>
      <p style={emSectionTitle}>MARKETPLACE CATEGORIES</p>
      <div className="flex flex-wrap gap-1">
        {store.categories.map((c) => (
          <span key={c.id} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: EM.panelBorder }}>{c.label}</span>
        ))}
      </div>
    </section>
  );
}

export function InheritanceIntegrationPanel({ assetInheritance, selectedAsset }: Pick<Props, 'assetInheritance' | 'selectedAsset'>) {
  if (!assetInheritance || !selectedAsset) return null;
  const i = assetInheritance;
  return (
    <section className="p-3 mb-3" style={emPanel}>
      <p style={emSectionTitle}>INHERITANCE INTEGRATION · {selectedAsset.title}</p>
      <p style={{ ...emLabel, color: EM.indigo }}>RECOMMENDED: {i.recommendedMode.replace(/-/g, ' ').toUpperCase()} · {i.compatibilityPct}% COMPAT</p>
      <p style={emLabel}>REASONING: {i.reasoning}</p>
      <p style={emLabel}>MODES: {i.modes.map((m) => m.replace(/-/g, ' ').toUpperCase()).join(' · ')}</p>
      {i.partialOptions.map((o) => (
        <p key={o} style={{ ...emLabel, fontSize: '5px' }}>→ {o}</p>
      ))}
      <Link
        to={adminStudioOrganizationalInheritancePath()}
        style={{ ...emLabel, color: EM.indigo, fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8, fontSize: '6px' }}
      >
        → OPEN ORGANIZATIONAL INHERITANCE
      </Link>
    </section>
  );
}

export function CompatibilityCenterPanel({ assetSimulation, selectedAsset }: Pick<Props, 'assetSimulation' | 'selectedAsset'>) {
  if (!assetSimulation || !selectedAsset) return null;
  const s = assetSimulation;
  return (
    <section className="p-3 mb-3" style={emPanel}>
      <p style={emSectionTitle}>COMPATIBILITY CENTER · BEFORE INSTALLATION</p>
      <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: scoreColor(s.confidencePct) }}>
        {s.label} · {s.confidencePct}% · DNA {s.dnaCompatibilityPct}%
      </p>
      <p style={emLabel}>WORKFLOW: {s.workflowConflicts.join(' · ') || 'None'}</p>
      <p style={emLabel}>EXEC OVERLAP: {s.executiveOverlap.join(' · ') || 'None'}</p>
      <p style={emLabel}>DEPT OVERLAP: {s.departmentOverlap.join(' · ') || 'None'}</p>
      <p style={emLabel}>KNOWLEDGE: {s.knowledgeConflicts.join(' · ') || 'None'}</p>
      <p style={emLabel}>AUTOMATION: {s.automationConflicts.join(' · ') || 'None'}</p>
      {s.adjustments.map((a) => (
        <p key={a} style={{ ...emLabel, fontSize: '5px', color: EM.indigo }}>→ {a}</p>
      ))}
      <p style={{ ...emLabel, color: s.readyToInstall ? EM.green : EM.red, marginTop: 4 }}>
        {s.readyToInstall ? 'READY TO INSTALL' : 'ADJUSTMENTS REQUIRED'}
      </p>
    </section>
  );
}

export function AssetEvolutionPanel({ assetEvolution }: Pick<Props, 'assetEvolution'>) {
  if (!assetEvolution) return null;
  const e = assetEvolution;
  return (
    <section className="p-3 mb-3" style={emPanel}>
      <p style={emSectionTitle}>ASSET EVOLUTION · CONTINUOUS IMPROVEMENT</p>
      {e.versions.map((v) => (
        <div key={v.version} className="py-1 border-b" style={{ borderColor: EM.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>v{v.version} · {v.date}</p>
          <p style={{ ...emLabel, fontSize: '5px' }}>{v.summary}</p>
        </div>
      ))}
      <p style={{ ...emLabel, marginTop: 4 }}>CONTRIBUTORS: {e.contributors.join(' · ')}</p>
      <p style={emLabel}>GROWTH: +{e.knowledgeGrowthPct}% · TREND: {e.performanceTrend}</p>
      <p style={{ ...emLabel, color: EM.indigo }}>INTEL: {e.intelligenceRecommendation}</p>
    </section>
  );
}

export function CommunityContributionsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={emPanel}>
      <p style={emSectionTitle}>COMMUNITY CONTRIBUTIONS · REVIEW STANDARDS</p>
      {store.contributions.map((c) => (
        <div key={c.id} className="py-1 border-b" style={{ borderColor: EM.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>
            {c.contributorName} · {c.contributorType.toUpperCase()} · {c.status.toUpperCase()}
          </p>
          <p style={{ ...emLabel, fontSize: '5px' }}>{c.assetTitle} · {c.reviewNotes}</p>
        </div>
      ))}
    </section>
  );
}

export function VerifiedMarketplacePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={emPanel}>
      <p style={emSectionTitle}>VERIFIED MARKETPLACE · TRUST PROGRAMS</p>
      {store.reputations.filter((r) => r.verified).map((r) => (
        <div key={r.orgId} className="py-2 border-b" style={{ borderColor: EM.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: scoreColor(r.trustPct) }}>
            {r.orgName} · TRUST {r.trustPct}% · QUALITY {r.qualityPct}%
          </p>
          <p style={{ ...emLabel, fontSize: '5px' }}>
            INNOVATION {r.innovationPct}% · SHARING {r.knowledgeSharingPct}% · COLLAB {r.collaborationPct}%
          </p>
        </div>
      ))}
    </section>
  );
}

export function CollaborationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={emPanel}>
      <p style={emSectionTitle}>COLLABORATION · SHARED ORGANIZATIONAL ASSETS</p>
      {store.collaborations.map((c) => (
        <div key={c.id} className="py-2 border-b" style={{ borderColor: EM.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: EM.indigo }}>{c.label}</p>
          <p style={emLabel}>{c.organizations.join(' ↔ ')} · {c.sharedAssetType}</p>
          <p style={{ ...emLabel, fontSize: '5px' }}>{c.history}</p>
        </div>
      ))}
    </section>
  );
}

export function MarketplaceIntelligencePanel({ store, selectedAsset }: Pick<Props, 'store' | 'selectedAsset'>) {
  const recs = selectedAsset
    ? store.intelligenceRecs.filter((r) => r.assetId === selectedAsset.id)
    : store.intelligenceRecs;
  return (
    <section className="p-3 mb-3" style={emPanel}>
      <p style={emSectionTitle}>MARKETPLACE INTELLIGENCE · PROACTIVE RECOMMENDATIONS</p>
      {recs.map((r) => (
        <div key={r.id} className="py-2 border-b" style={{ borderColor: EM.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: scoreColor(r.confidencePct) }}>
            {r.label} · {r.type.replace(/-/g, ' ').toUpperCase()} · {r.confidencePct}%
          </p>
          <p style={emLabel}>ROI: {r.expectedRoi} · RISK: {r.riskLevel.toUpperCase()}</p>
          <p style={{ ...emLabel, fontSize: '5px' }}>{r.rationale}</p>
        </div>
      ))}
    </section>
  );
}

export function OrganizationalReputationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={emPanel}>
      <p style={emSectionTitle}>ORGANIZATIONAL REPUTATION · SYSTEM QUALITY</p>
      {store.reputations.map((r) => (
        <div key={r.orgId} className="py-1 border-b" style={{ borderColor: EM.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: scoreColor(r.trustPct) }}>
            {r.orgName} · TRUST {r.trustPct}% · RELIABILITY {r.reliabilityPct}%
          </p>
          <p style={{ ...emLabel, fontSize: '5px' }}>
            QUALITY {r.qualityPct}% · INNOVATION {r.innovationPct}% · PERF {r.assetPerformancePct}%
          </p>
        </div>
      ))}
    </section>
  );
}

export function InstalledAssetsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={emPanel}>
      <p style={emSectionTitle}>INSTALLED ASSETS · ACTIVE LIBRARY</p>
      {store.installedAssets.map((i) => (
        <div key={i.id} className="py-2 border-b" style={{ borderColor: EM.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: scoreColor(i.healthPct) }}>
            {i.title} · HEALTH {i.healthPct}%
          </p>
          <p style={emLabel}>
            {i.inheritanceMode.replace(/-/g, ' ').toUpperCase()} · Installed {i.installedAt} · Sync {i.lastSync}
          </p>
        </div>
      ))}
    </section>
  );
}

export function IndustryCollectionsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={emPanel}>
      <p style={emSectionTitle}>INDUSTRY COLLECTIONS · CURATED STACKS</p>
      {store.industryCollections.map((col) => (
        <div key={col.id} className="py-2 border-b" style={{ borderColor: EM.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: EM.indigo }}>{col.label}</p>
          <p style={emLabel}>{col.industry}</p>
          <p style={{ ...emLabel, fontSize: '5px' }}>{col.description}</p>
          <p style={{ ...emLabel, fontSize: '5px' }}>{col.assetIds.length} assets</p>
        </div>
      ))}
    </section>
  );
}

export function CrossCompanyLearningPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={emPanel}>
      <p style={emSectionTitle}>CROSS-COMPANY LEARNING · ANONYMOUS PATTERNS</p>
      {store.crossCompanyLearnings.map((l) => (
        <div key={l.id} className="py-1 border-b" style={{ borderColor: EM.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>
            {l.category.toUpperCase()} · {l.adoptionCount} adoptions · {l.anonymized ? 'ANONYMIZED' : 'ATTRIBUTED'}
          </p>
          <p style={{ ...emLabel, fontSize: '5px' }}>{l.insight}</p>
        </div>
      ))}
    </section>
  );
}

export function CosIntegrationPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...emPanel, borderLeft: `4px solid ${EM.indigo}` }}>
      <p style={emSectionTitle}>CHIEF OF STAFF · ASSET ACTIVATION APPROVALS</p>
      <p style={emLabel}>
        Marketplace installations evaluated against Leadership DNA · compatibility simulation · founder judgment gates
      </p>
      <Link
        to={adminStudioChiefOfStaffPath()}
        style={{ ...emLabel, color: EM.indigo, fontFamily: '"Futura PT Medium"', display: 'inline-block', marginTop: 8, fontSize: '6px' }}
      >
        → OPEN CHIEF OF STAFF
      </Link>
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={emPanel}>
      <p style={emSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {ECOSYSTEM_MARKETPLACE_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: EM.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioOrganizationalInheritancePath()} style={{ ...emLabel, color: EM.indigo, fontSize: '6px' }}>→ ORGANIZATIONAL INHERITANCE</Link>
        <Link to={adminStudioCreatorMarketplacePath()} style={{ ...emLabel, color: '#2563EB', fontSize: '6px' }}>→ CREATOR MARKETPLACE</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...emLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
        <Link to={adminStudioReaderGraphPath()} style={{ ...emLabel, color: '#E11D48', fontSize: '6px' }}>→ READER GRAPH</Link>
        <Link to={adminStudioStrategyEnginePath()} style={{ ...emLabel, color: '#334155', fontSize: '6px' }}>→ STRATEGY ENGINE</Link>
        <Link to={adminStudioCampaignEnginePath()} style={{ ...emLabel, color: '#D97706', fontSize: '6px' }}>→ CAMPAIGN ENGINE</Link>
        <Link to={adminStudioKnowledgeAssetEnginePath()} style={{ ...emLabel, color: '#0D9488', fontSize: '6px' }}>→ KNOWLEDGE ASSET ENGINE</Link>
      </div>
    </section>
  );
}
