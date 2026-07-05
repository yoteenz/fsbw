import { Link } from 'react-router-dom';
import type {
  DistributionEngineStore,
  KnowledgeAsset,
  DistributionWorkspaceId,
  PlatformAdaptation,
} from '../../../../studio-os-core/distribution-engine/types';
import {
  AUDIENCE_SEGMENTS,
  CHANNEL_OPTIMIZATION_FIELDS,
  DISTRIBUTION_CONNECTED_SYSTEMS,
  DISTRIBUTION_FORMATS,
  DISTRIBUTION_HIERARCHY_CHAIN,
} from '../../../../studio-os-core/distribution-engine/constants';
import {
  adminStudioCampaignEnginePath,
  adminStudioStrategyEnginePath,
  adminStudioWorkOrchestrationPath,
  adminStudioReaderGraphPath,
} from '../../../../utils/adminStudioRoutes';
import {
  DISTRIBUTION_ENGINE_STYLES,
  DE,
  deDarkHeader,
  deLabel,
  deLiveDot,
  dePanel,
  deSectionTitle,
  deValue,
  healthColor,
} from './distributionEngineTheme';

type Props = {
  store: DistributionEngineStore;
  selectedAsset: KnowledgeAsset | null;
  workspaceAssets: KnowledgeAsset[];
  assetAdaptations: PlatformAdaptation[];
  assetPerformance: DistributionEngineStore['performance'][string] | null;
  onSelectWorkspace: (id: DistributionWorkspaceId) => void;
  onSelectAsset: (id: string) => void;
};

export function DistributionEngineHeader() {
  return (
    <>
      <style>{DISTRIBUTION_ENGINE_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...deDarkHeader, borderTop: `3px solid ${DE.violet}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          DISTRIBUTION ENGINE
        </p>
        <p style={{ ...deLabel, color: '#94A3B8' }}>
          <span style={deLiveDot} />
          KNOWLEDGE ASSET → STRATEGY → CHANNELS → ADAPTATION → PUBLISHING → LEARNING
        </p>
        <p style={{ ...deLabel, color: '#CBD5E1', marginTop: 4 }}>
          GLOBAL NERVOUS SYSTEM · ONE SOURCE OF TRUTH · KNOWLEDGE LONGEVITY · NOT POSTS
        </p>
      </header>
    </>
  );
}

export function DistributionDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  const h = store.health;
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>DISTRIBUTION ENGINE · GLOBAL HQ</p>
      <p style={{ ...deLabel, color: DE.violet, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-3">
        {[
          ['KNOWLEDGE ASSETS', d.knowledgeAssets],
          ['FORMATS GENERATED', d.formatsGenerated],
          ['SCHEDULED', d.scheduledThisWeek],
          ['EVERGREEN ACTIVE', d.evergreenActive],
          ['DISTRIBUTION HEALTH', `${h.overallPct}%`],
          ['KNOWLEDGE REACH', d.knowledgeReach],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: DE.panelBorder }}>
            <p style={{ ...deValue, fontSize: '12px' }}>{val}</p>
            <p style={deLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function WorkspaceAssetSelector({ store, onSelectWorkspace }: Pick<Props, 'store' | 'onSelectWorkspace'>) {
  const workspaces: DistributionWorkspaceId[] = ['ndxbook', 'frontal-slayer'];
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>DISTRIBUTION WORKSPACE</p>
      <div className="flex gap-1 flex-wrap">
        {workspaces.map((ws) => (
          <button
            key={ws}
            type="button"
            onClick={() => onSelectWorkspace(ws)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.activeWorkspaceId === ws ? DE.violet : DE.panelBorder,
              color: store.activeWorkspaceId === ws ? DE.violet : DE.gray,
              background: store.activeWorkspaceId === ws ? 'rgba(124,58,237,0.06)' : 'white',
            }}
          >
            {ws.toUpperCase()}
          </button>
        ))}
      </div>
    </section>
  );
}

export function DistributionHierarchyPanel() {
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>DISTRIBUTION HIERARCHY</p>
      {DISTRIBUTION_HIERARCHY_CHAIN.map((level, i) => (
        <div key={level.level} className="flex items-start gap-2 py-1">
          <span style={{ ...deLabel, color: DE.violet, fontFamily: '"Futura PT Medium"', minWidth: 12 }}>{i + 1}</span>
          <div>
            <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{level.label}</p>
            <p style={{ ...deLabel, fontSize: '5px' }}>{level.description}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export function KnowledgeAssetsPanel({ workspaceAssets, store, onSelectAsset }: Pick<Props, 'workspaceAssets' | 'store' | 'onSelectAsset'>) {
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>KNOWLEDGE ASSETS · UNIFIED SOURCE OF TRUTH</p>
      {workspaceAssets.map((asset) => (
        <button
          key={asset.id}
          type="button"
          onClick={() => onSelectAsset(asset.id)}
          className="w-full text-left p-2 mb-1 border"
          style={{
            borderColor: store.selectedAssetId === asset.id ? DE.violet : DE.panelBorder,
            background: store.selectedAssetId === asset.id ? 'rgba(124,58,237,0.04)' : 'white',
          }}
        >
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{asset.title}</p>
          <p style={{ ...deLabel, fontSize: '5px' }}>
            {asset.status.toUpperCase()} · VALUE {asset.knowledgeValueScore} · {asset.potentialFormats.length} FORMATS · {asset.campaignLabel ?? '—'}
          </p>
          <p style={{ ...deLabel, fontSize: '5px', color: DE.violet }}>{asset.unifiedSourceOfTruth}</p>
        </button>
      ))}
    </section>
  );
}

export function KnowledgeAdaptationPanel({ selectedAsset }: Pick<Props, 'selectedAsset'>) {
  if (!selectedAsset) return null;
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>KNOWLEDGE ADAPTATION · POTENTIAL FORMATS</p>
      <p style={deLabel}>Founder approves strategy · Studio OS handles execution · every format preserves original knowledge</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {DISTRIBUTION_FORMATS.filter((f) => selectedAsset.potentialFormats.includes(f.id)).map((f) => (
          <span
            key={f.id}
            className="text-[5px] font-futura px-1 py-0.5 border"
            style={{
              borderColor: selectedAsset.approvedFormats.includes(f.id) ? DE.violet : DE.panelBorder,
              background: selectedAsset.approvedFormats.includes(f.id) ? 'rgba(124,58,237,0.08)' : 'white',
            }}
          >
            {f.label}
          </span>
        ))}
      </div>
    </section>
  );
}

export function DistributionIntelligencePanel({ store, selectedAsset }: Pick<Props, 'store' | 'selectedAsset'>) {
  const recs = selectedAsset
    ? store.intelligenceRecs.filter((r) => r.assetId === selectedAsset.id)
    : store.intelligenceRecs;
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>DISTRIBUTION INTELLIGENCE · BEFORE PUBLISHING</p>
      {recs.map((rec) => (
        <div key={rec.id} className="py-2 border-b" style={{ borderColor: DE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: DE.violet }}>
            {rec.confidencePct}% CONFIDENCE
          </p>
          <p style={deLabel}><strong>WHERE:</strong> {rec.where}</p>
          <p style={deLabel}><strong>WHEN:</strong> {rec.when}</p>
          <p style={deLabel}><strong>HOW:</strong> {rec.how}</p>
          <p style={deLabel}><strong>WHY:</strong> {rec.why}</p>
        </div>
      ))}
    </section>
  );
}

export function ChannelOptimizationPanel({ assetAdaptations }: Pick<Props, 'assetAdaptations'>) {
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>CHANNEL OPTIMIZATION · PLATFORM-SPECIFIC VERSIONS</p>
      {Object.entries(CHANNEL_OPTIMIZATION_FIELDS).map(([channel, fields]) => (
        <p key={channel} style={{ ...deLabel, fontSize: '5px' }}>
          {channel.toUpperCase()}: {fields.join(' · ')}
        </p>
      ))}
      {assetAdaptations.map((adapt) => (
        <div key={adapt.id} className="mt-2 p-2 border" style={{ borderColor: DE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>
            {adapt.formatId.replace(/-/g, ' ').toUpperCase()} · {adapt.status.toUpperCase()}
          </p>
          {adapt.hook ? <p style={deLabel}>HOOK: {adapt.hook}</p> : null}
          {adapt.caption ? <p style={deLabel}>CAPTION: {adapt.caption}</p> : null}
          {adapt.title ? <p style={deLabel}>TITLE: {adapt.title}</p> : null}
          {adapt.timing ? <p style={deLabel}>TIMING: {adapt.timing}</p> : null}
          {adapt.tone ? <p style={deLabel}>TONE: {adapt.tone}</p> : null}
          <p style={{ ...deLabel, color: adapt.preservesKnowledge ? DE.green : DE.red }}>
            {adapt.preservesKnowledge ? '✓ PRESERVES KNOWLEDGE' : '⚠ KNOWLEDGE DRIFT RISK'}
          </p>
        </div>
      ))}
    </section>
  );
}

export function DistributionCalendarPanel({ store }: Pick<Props, 'store'>) {
  const statusColors: Record<string, string> = {
    scheduled: DE.violet,
    publishing: '#D97706',
    processing: DE.slate,
    completed: DE.green,
    evergreen: '#059669',
    republishing: DE.violet,
    'future-update': DE.gray,
  };
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>DISTRIBUTION CALENDAR · UNIFIED SCHEDULE</p>
      <p style={deLabel}>Drag-and-drop · bulk scheduling · campaign scheduling · time zone optimization</p>
      {store.calendar.map((entry) => (
        <div key={entry.id} className="py-1 border-b flex justify-between" style={{ borderColor: DE.panelBorder }}>
          <div>
            <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{entry.label}</p>
            <p style={{ ...deLabel, fontSize: '5px' }}>{entry.channelId.toUpperCase()} · {entry.timezone}</p>
          </div>
          <span style={{ ...deLabel, color: statusColors[entry.status] ?? DE.gray, fontFamily: '"Futura PT Medium"' }}>
            {entry.status.replace(/-/g, ' ').toUpperCase()}
          </span>
        </div>
      ))}
    </section>
  );
}

export function EvergreenEnginePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>EVERGREEN ENGINE · KNOWLEDGE LONGEVITY</p>
      {store.evergreen.map((ev) => (
        <div key={ev.id} className="py-1 border-b" style={{ borderColor: DE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{ev.title}</p>
          <p style={deLabel}>
            {ev.action.toUpperCase()} · {ev.confidencePct}% · {ev.projectedLift}
          </p>
          <p style={{ ...deLabel, fontSize: '5px' }}>{ev.reason}</p>
        </div>
      ))}
    </section>
  );
}

export function KnowledgeCollectionsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>KNOWLEDGE COLLECTIONS · BUNDLING</p>
      {store.collections.map((col) => (
        <div key={col.id} className="py-1 border-b" style={{ borderColor: DE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{col.title}</p>
          <p style={deLabel}>
            {col.type.replace(/-/g, ' ').toUpperCase()} · {col.assetCount} ASSETS · {col.status.toUpperCase()}
          </p>
          <p style={{ ...deLabel, fontSize: '5px', color: DE.violet }}>{col.bundlingOpportunity}</p>
        </div>
      ))}
    </section>
  );
}

export function AudienceAdaptationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>AUDIENCE ADAPTATION</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {AUDIENCE_SEGMENTS.map((seg) => (
          <span key={seg} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: DE.panelBorder }}>
            {seg.toUpperCase()}
          </span>
        ))}
      </div>
      {store.audienceSegments.map((seg) => (
        <div key={seg.id} className="py-1 border-b" style={{ borderColor: DE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{seg.label.toUpperCase()}</p>
          <p style={deLabel}>{seg.distributionStrategy}</p>
        </div>
      ))}
    </section>
  );
}

export function CreatorMarketplacePanel({ store, selectedAsset }: Pick<Props, 'store' | 'selectedAsset'>) {
  const recs = selectedAsset
    ? store.creatorRecs.filter((r) => r.assetId === selectedAsset.id)
    : store.creatorRecs;
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>CREATOR MARKETPLACE · PRE-PUBLISH RECOMMENDATIONS</p>
      {recs.map((rec) => (
        <div key={rec.id} className="py-1 border-b" style={{ borderColor: DE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>
            {rec.type.toUpperCase()} · {rec.creatorName} · {rec.fitScore}% FIT
          </p>
          <p style={deLabel}>{rec.reachEstimate}</p>
          <p style={{ ...deLabel, fontSize: '5px' }}>{rec.rationale}</p>
        </div>
      ))}
    </section>
  );
}

export function DistributionSimulationPanel({ store, selectedAsset }: Pick<Props, 'store' | 'selectedAsset'>) {
  const sims = selectedAsset
    ? store.simulations.filter((s) => s.assetId === selectedAsset.id)
    : store.simulations;
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>DISTRIBUTION SIMULATION · BEFORE LAUNCH</p>
      {sims.map((sim) => (
        <div key={sim.id} className="py-2 border-b" style={{ borderColor: DE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: DE.violet }}>
            {sim.strategyLabel} · {sim.confidencePct}%
          </p>
          <div className="grid grid-cols-2 gap-1 mt-1">
            {[['REACH', sim.reach], ['ENGAGEMENT', sim.engagement], ['WATCH TIME', sim.watchTime], ['CTR', sim.clickThrough], ['CONVERSION', sim.conversion], ['READER GROWTH', sim.readerGrowth]].map(([l, v]) => (
              <p key={l} style={{ ...deLabel, fontSize: '5px' }}>{l}: {v}</p>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export function PerformanceIntelligencePanel({ assetPerformance }: Pick<Props, 'assetPerformance'>) {
  if (!assetPerformance) {
    return (
      <section className="p-3 mb-3" style={dePanel}>
        <p style={deSectionTitle}>PERFORMANCE INTELLIGENCE</p>
        <p style={deLabel}>Select a knowledge asset to view operational performance · clarity over vanity metrics</p>
      </section>
    );
  }
  const p = assetPerformance;
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>PERFORMANCE INTELLIGENCE · OPERATIONAL METRICS</p>
      <div className="grid grid-cols-2 gap-1">
        {[['REACH', p.reach], ['VIEWS', p.views], ['WATCH TIME', p.watchTime], ['RETENTION', p.retention], ['COMPLETION', p.completion], ['SHARES', p.shares], ['CLICKS', p.clicks], ['READER GROWTH', p.readerGrowth]].map(([l, v]) => (
          <p key={l} style={deLabel}>{l}: {v}</p>
        ))}
      </div>
      <p style={{ ...deSectionTitle, marginTop: 8 }}>TOP PATTERNS</p>
      {p.topPatterns.map((pat) => (
        <p key={pat} style={deLabel}>· {pat}</p>
      ))}
    </section>
  );
}

export function FeedbackLoopPanel({ store, selectedAsset }: Pick<Props, 'store' | 'selectedAsset'>) {
  const insights = selectedAsset
    ? store.feedback.filter((f) => f.assetId === selectedAsset.id)
    : store.feedback;
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>FEEDBACK LOOP · STUDIO INTELLIGENCE</p>
      {insights.map((fb) => (
        <div key={fb.id} className="py-2 border-b" style={{ borderColor: DE.panelBorder }}>
          <p style={{ ...deSectionTitle, fontSize: '7px' }}>WHAT WORKED</p>
          {fb.worked.map((w) => <p key={w} style={deLabel}>✓ {w}</p>)}
          <p style={{ ...deSectionTitle, fontSize: '7px', marginTop: 4 }}>IMPROVEMENTS</p>
          {fb.improvements.map((i) => <p key={i} style={deLabel}>→ {i}</p>)}
          {fb.updatesFutureRecs ? (
            <p style={{ ...deLabel, color: DE.green, marginTop: 4 }}>✓ UPDATES FUTURE DISTRIBUTION RECOMMENDATIONS</p>
          ) : null}
        </div>
      ))}
    </section>
  );
}

export function DistributionLineagePanel({ store, selectedAsset }: Pick<Props, 'store' | 'selectedAsset'>) {
  const nodes = selectedAsset
    ? store.lineage.filter((l) => l.assetId === selectedAsset.id)
    : store.lineage;
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>DISTRIBUTION LINEAGE · COMPLETE HISTORY</p>
      {nodes.map((node) => (
        <div key={node.id} className="py-1 border-b flex gap-2" style={{ borderColor: DE.panelBorder }}>
          <span style={{ ...deLabel, color: DE.violet, minWidth: 60, fontFamily: '"Futura PT Medium"' }}>
            {node.type.replace(/-/g, ' ').toUpperCase()}
          </span>
          <div>
            <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{node.label}</p>
            {node.performanceNote ? <p style={{ ...deLabel, fontSize: '5px' }}>{node.performanceNote}</p> : null}
          </div>
        </div>
      ))}
    </section>
  );
}

export function CrossCompanyDistributionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>CROSS-COMPANY DISTRIBUTION</p>
      {store.crossCompany.map((xc) => (
        <div key={xc.id} className="py-1 border-b" style={{ borderColor: DE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>
            {xc.topic} · {xc.safe ? 'SAFE' : 'PROTECTED'}
          </p>
          <p style={deLabel}>{xc.recommendation}</p>
          <p style={{ ...deLabel, fontSize: '5px' }}>{xc.identityProtection}</p>
        </div>
      ))}
    </section>
  );
}

export function DistributionHealthPanel({ store }: Pick<Props, 'store'>) {
  const h = store.health;
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>DISTRIBUTION HEALTH · {h.overallPct}%</p>
      <div className="grid grid-cols-2 gap-2">
        {[['EXECUTION VELOCITY', h.executionVelocity], ['CHANNEL EFFICIENCY', h.channelEfficiency], ['FORMAT COVERAGE', h.formatCoverage], ['EVERGREEN UTILIZATION', h.evergreenUtilization], ['KNOWLEDGE LONGEVITY', h.knowledgeLongevity]].map(([l, v]) => (
          <div key={l} className="p-1 border text-center" style={{ borderColor: DE.panelBorder }}>
            <p style={{ ...deValue, fontSize: '11px', color: healthColor(v as number) }}>{v}%</p>
            <p style={{ ...deLabel, fontSize: '5px' }}>{l}</p>
          </div>
        ))}
      </div>
      <p style={{ ...deSectionTitle, marginTop: 8 }}>BOTTLENECKS</p>
      {h.bottlenecks.map((b) => <p key={b} style={deLabel}>⚠ {b}</p>)}
      <p style={{ ...deSectionTitle, marginTop: 8 }}>RECOMMENDATIONS</p>
      {h.recommendations.map((r) => <p key={r} style={deLabel}>→ {r}</p>)}
    </section>
  );
}

export function DistributionStrategiesPanel({ store, selectedAsset }: Pick<Props, 'store' | 'selectedAsset'>) {
  const strategies = selectedAsset
    ? store.strategies.filter((s) => s.assetId === selectedAsset.id)
    : store.strategies;
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>DISTRIBUTION STRATEGIES · FOUNDER APPROVES</p>
      {strategies.map((str) => (
        <div key={str.id} className="py-2 border-b" style={{ borderColor: DE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>
            {str.label} · {str.confidencePct}%
          </p>
          <p style={deLabel}>{str.objective}</p>
          <p style={{ ...deLabel, fontSize: '5px' }}>
            {str.founderApproved ? '✓ FOUNDER APPROVED' : '⏳ AWAITING APPROVAL'} · {str.primaryChannels.join(' · ').toUpperCase()}
          </p>
        </div>
      ))}
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={dePanel}>
      <p style={deSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {DISTRIBUTION_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: DE.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioStrategyEnginePath()} style={{ ...deLabel, color: '#334155', fontSize: '6px' }}>→ STRATEGY ENGINE</Link>
        <Link to={adminStudioCampaignEnginePath()} style={{ ...deLabel, color: '#D97706', fontSize: '6px' }}>→ CAMPAIGN ENGINE</Link>
        <Link to={adminStudioWorkOrchestrationPath()} style={{ ...deLabel, color: '#0891B2', fontSize: '6px' }}>→ WORK ORCHESTRATION</Link>
        <Link to={adminStudioReaderGraphPath()} style={{ ...deLabel, color: '#E11D48', fontSize: '6px' }}>→ READER GRAPH</Link>
      </div>
    </section>
  );
}
