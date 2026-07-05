import { Link } from 'react-router-dom';
import type {
  BehaviorIntelligence,
  GraphZoomLevel,
  ReaderGraphStore,
  ReaderProfile,
  ReaderGraphWorkspaceId,
  RelationshipHealth,
} from '../../../../studio-os-core/reader-graph/types';
import {
  GRAPH_ZOOM_LEVELS,
  KNOWLEDGE_INTERESTS,
  READER_GRAPH_CONNECTED_SYSTEMS,
  RELATIONSHIP_PHILOSOPHY,
} from '../../../../studio-os-core/reader-graph/constants';
import {
  adminStudioCampaignEnginePath,
  adminStudioDistributionEnginePath,
  adminStudioStrategyEnginePath,
  adminStudioRelationshipEnginePath,
} from '../../../../utils/adminStudioRoutes';
import {
  READER_GRAPH_STYLES,
  RG,
  healthColor,
  rgDarkHeader,
  rgLabel,
  rgLiveDot,
  rgPanel,
  rgSectionTitle,
  rgValue,
} from './readerGraphTheme';

type Props = {
  store: ReaderGraphStore;
  selectedReader: ReaderProfile | null;
  workspaceReaders: ReaderProfile[];
  readerHealth: RelationshipHealth | null;
  readerTimeline: ReaderGraphStore['timelines'];
  readerInterests: ReaderGraphStore['interests'];
  readerBehavior: BehaviorIntelligence | null;
  readerSignals: ReaderGraphStore['intelligenceSignals'];
  readerRecommendations: ReaderGraphStore['recommendations'];
  onSelectWorkspace: (id: ReaderGraphWorkspaceId) => void;
  onSelectReader: (id: string) => void;
  onSetGraphZoom: (zoom: GraphZoomLevel) => void;
};

export function ReaderGraphHeader() {
  return (
    <>
      <style>{READER_GRAPH_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...rgDarkHeader, borderTop: `3px solid ${RG.rose}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          READER GRAPH
        </p>
        <p style={{ ...rgLabel, color: '#94A3B8' }}>
          <span style={rgLiveDot} />
          DISCOVER → ENGAGE → RETURN → MEMBER → ADVOCATE → PARTNER → MENTOR
        </p>
        <p style={{ ...rgLabel, color: '#CBD5E1', marginTop: 4 }}>
          LIVING RELATIONSHIPS · NOT FOLLOWERS · TRUST · LEARNING · LOYALTY · ADVOCACY
        </p>
      </header>
    </>
  );
}

export function ReaderGraphDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>READER GRAPH · RELATIONSHIP HQ</p>
      <p style={{ ...rgLabel, color: RG.rose, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-3">
        {[
          ['TOTAL READERS', d.totalReaders],
          ['ACTIVE RELATIONSHIPS', d.activeRelationships],
          ['AVG HEALTH', `${d.avgHealthPct}%`],
          ['TOP ADVOCATES', d.topAdvocates],
          ['COMMUNITIES', d.emergingCommunities],
          ['RELATIONSHIP GROWTH', `+${d.relationshipGrowthPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: RG.panelBorder }}>
            <p style={{ ...rgValue, fontSize: '12px' }}>{val}</p>
            <p style={rgLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RelationshipPhilosophyPanel() {
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>RELATIONSHIP PHILOSOPHY</p>
      {RELATIONSHIP_PHILOSOPHY.map((line) => (
        <p key={line} style={rgLabel}>· {line}</p>
      ))}
    </section>
  );
}

export function WorkspaceReaderSelector({ store, onSelectWorkspace }: Pick<Props, 'store' | 'onSelectWorkspace'>) {
  const workspaces: ReaderGraphWorkspaceId[] = ['ndxbook', 'frontal-slayer'];
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>READER GRAPH WORKSPACE</p>
      <div className="flex gap-1 flex-wrap">
        {workspaces.map((ws) => (
          <button
            key={ws}
            type="button"
            onClick={() => onSelectWorkspace(ws)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.activeWorkspaceId === ws ? RG.rose : RG.panelBorder,
              color: store.activeWorkspaceId === ws ? RG.rose : RG.gray,
              background: store.activeWorkspaceId === ws ? 'rgba(225,29,72,0.06)' : 'white',
            }}
          >
            {ws.toUpperCase()}
          </button>
        ))}
      </div>
    </section>
  );
}

export function ReaderListPanel({ workspaceReaders, store, onSelectReader }: Pick<Props, 'workspaceReaders' | 'store' | 'onSelectReader'>) {
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>READER PROFILES · LIVING RELATIONSHIPS</p>
      {workspaceReaders.map((reader) => (
        <button
          key={reader.id}
          type="button"
          onClick={() => onSelectReader(reader.id)}
          className="w-full text-left p-2 mb-1 border"
          style={{
            borderColor: store.selectedReaderId === reader.id ? RG.rose : RG.panelBorder,
            background: store.selectedReaderId === reader.id ? 'rgba(225,29,72,0.04)' : 'white',
          }}
        >
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{reader.displayName}</p>
          <p style={{ ...rgLabel, fontSize: '5px' }}>
            {reader.relationshipStage.toUpperCase()} · TRUST {reader.trustScore} · ENG {reader.engagementScore} · LTV {reader.lifetimeValue}
          </p>
        </button>
      ))}
    </section>
  );
}

export function ReaderProfilePanel({ selectedReader }: Pick<Props, 'selectedReader'>) {
  if (!selectedReader) return null;
  const r = selectedReader;
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>READER PROFILE · {r.displayName}</p>
      <div className="grid grid-cols-2 gap-1">
        {[['READER', r.readerScore], ['TRUST', r.trustScore], ['ENGAGEMENT', r.engagementScore], ['KNOWLEDGE', r.knowledgeScore], ['COMMUNITY', r.communityScore], ['ADVOCACY', r.advocacyScore]].map(([l, v]) => (
          <p key={l} style={rgLabel}>{l}: {v}</p>
        ))}
      </div>
      <p style={{ ...rgSectionTitle, marginTop: 8, fontSize: '7px' }}>FAVORITES</p>
      <p style={{ ...rgLabel, fontSize: '5px' }}>PAGES: {r.favoritePages.join(' · ') || '—'}</p>
      <p style={{ ...rgLabel, fontSize: '5px' }}>CAMPAIGNS: {r.favoriteCampaigns.join(' · ') || '—'}</p>
      <p style={{ ...rgLabel, fontSize: '5px' }}>PLATFORMS: {r.preferredPlatforms.join(' · ')}</p>
    </section>
  );
}

export function ReaderJourneyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>READER JOURNEY · CUSTOMIZABLE STAGES</p>
      {store.journeyStages.map((stage, i) => (
        <div key={stage.stage} className="flex items-start gap-2 py-0.5">
          <span style={{ ...rgLabel, color: RG.rose, fontFamily: '"Futura PT Medium"', minWidth: 12 }}>{i + 1}</span>
          <div>
            <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{stage.label}</p>
            <p style={{ ...rgLabel, fontSize: '5px' }}>{stage.description}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export function GraphVisualizationPanel({ store, onSetGraphZoom }: Pick<Props, 'store' | 'onSetGraphZoom'>) {
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>RELATIONSHIP GRAPH · INTERACTIVE</p>
      <div className="flex gap-1 flex-wrap mb-2">
        {GRAPH_ZOOM_LEVELS.map((z) => (
          <button
            key={z.id}
            type="button"
            onClick={() => onSetGraphZoom(z.id)}
            className="px-1 py-0.5 text-[5px] font-futura border"
            style={{
              borderColor: store.graphZoom === z.id ? RG.rose : RG.panelBorder,
              color: store.graphZoom === z.id ? RG.rose : RG.gray,
            }}
          >
            {z.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {store.graphNodes.map((node) => (
          <span
            key={node.id}
            className="text-[5px] font-futura px-1 py-0.5 border"
            style={{
              borderColor: node.type === 'reader' ? RG.rose : RG.panelBorder,
              fontSize: `${Math.max(5, Math.min(8, node.size / 15))}px`,
            }}
          >
            {node.label} ({node.connections.length})
          </span>
        ))}
      </div>
    </section>
  );
}

export function KnowledgeInterestsPanel({ readerInterests }: Pick<Props, 'readerInterests'>) {
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>KNOWLEDGE INTERESTS · EVOLUTION</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {KNOWLEDGE_INTERESTS.map((i) => (
          <span key={i.id} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: RG.panelBorder }}>
            {i.label}
          </span>
        ))}
      </div>
      {readerInterests.map((int) => (
        <div key={int.id} className="py-1 border-b flex justify-between" style={{ borderColor: RG.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{int.label}</p>
          <span style={{ ...rgLabel, color: int.trend === 'rising' ? RG.green : RG.gray }}>
            {int.strengthPct}% · {int.trend.toUpperCase()}
          </span>
        </div>
      ))}
    </section>
  );
}

export function BehaviorIntelligencePanel({ readerBehavior }: Pick<Props, 'readerBehavior'>) {
  if (!readerBehavior) {
    return (
      <section className="p-3 mb-3" style={rgPanel}>
        <p style={rgSectionTitle}>BEHAVIOR INTELLIGENCE</p>
        <p style={rgLabel}>Select a reader to view behavior patterns · connected back to strategy</p>
      </section>
    );
  }
  const b = readerBehavior;
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>BEHAVIOR INTELLIGENCE</p>
      <p style={rgLabel}>READING: {b.readingHabits}</p>
      <p style={rgLabel}>WATCH: {b.watchHabits}</p>
      <p style={rgLabel}>COMPLETION: {b.completionBehavior}</p>
      <p style={rgLabel}>SHARING: {b.sharingBehavior}</p>
      <p style={{ ...rgLabel, color: RG.rose, marginTop: 4 }}>STRATEGY: {b.strategyConnection}</p>
    </section>
  );
}

export function RelationshipHealthPanel({ readerHealth }: Pick<Props, 'readerHealth'>) {
  if (!readerHealth) {
    return (
      <section className="p-3 mb-3" style={rgPanel}>
        <p style={rgSectionTitle}>RELATIONSHIP HEALTH</p>
        <p style={rgLabel}>Not vanity metrics · trust · consistency · advocacy · knowledge depth</p>
      </section>
    );
  }
  const h = readerHealth;
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>RELATIONSHIP HEALTH · {h.overallPct}%</p>
      <div className="grid grid-cols-2 gap-1">
        {[['ENGAGEMENT', h.engagement], ['TRUST', h.trust], ['CONSISTENCY', h.consistency], ['RECENCY', h.recency], ['GROWTH', h.growth], ['ADVOCACY', h.advocacy], ['KNOWLEDGE DEPTH', h.knowledgeDepth], ['BRAND AFFINITY', h.brandAffinity], ['COMMUNITY', h.communityInvolvement]].map(([l, v]) => (
          <p key={l} style={{ ...rgLabel, color: healthColor(v as number) }}>{l}: {v}%</p>
        ))}
      </div>
    </section>
  );
}

export function ReaderTimelinePanel({ readerTimeline }: Pick<Props, 'readerTimeline'>) {
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>READER TIMELINE · RELATIONSHIP MILESTONES</p>
      {readerTimeline.length === 0 ? (
        <p style={rgLabel}>Select a reader to view relationship timeline</p>
      ) : (
        readerTimeline.map((ev) => (
          <div key={ev.id} className="py-1 border-b flex gap-2" style={{ borderColor: RG.panelBorder }}>
            <span style={{ ...rgLabel, color: RG.rose, minWidth: 80, fontFamily: '"Futura PT Medium"', fontSize: '5px' }}>
              {ev.type.replace(/-/g, ' ').toUpperCase()}
            </span>
            <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{ev.label}</p>
          </div>
        ))
      )}
    </section>
  );
}

export function CommunityClustersPanel({ store }: Pick<Props, 'store'>) {
  const communities = store.communities.filter((c) => c.workspaceId === store.activeWorkspaceId);
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>COMMUNITY CLUSTERS · INTELLIGENT GROUPS</p>
      {communities.map((comm) => (
        <div key={comm.id} className="py-2 border-b" style={{ borderColor: RG.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{comm.label} · {comm.memberCount} MEMBERS</p>
          <p style={rgLabel}>{comm.description}</p>
          <p style={{ ...rgLabel, fontSize: '5px', color: RG.rose }}>{comm.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function ReaderIntelligencePanel({ readerSignals, store }: Pick<Props, 'readerSignals' | 'store'>) {
  const signals = readerSignals.length > 0 ? readerSignals : store.intelligenceSignals.slice(0, 4);
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>READER INTELLIGENCE · STUDIO INTELLIGENCE</p>
      {signals.map((sig) => (
        <div key={sig.id} className="py-1 border-b" style={{ borderColor: RG.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: RG.rose }}>
            {sig.label} · {sig.confidencePct}%
          </p>
          <p style={{ ...rgLabel, fontSize: '5px' }}>{sig.engagementStrategy}</p>
        </div>
      ))}
    </section>
  );
}

export function RelationshipRecommendationsPanel({ readerRecommendations, store }: Pick<Props, 'readerRecommendations' | 'store'>) {
  const recs = readerRecommendations.length > 0 ? readerRecommendations : store.recommendations.slice(0, 4);
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>RELATIONSHIP RECOMMENDATIONS · LONG-TERM VALUE</p>
      {recs.map((rec) => (
        <div key={rec.id} className="py-1 border-b" style={{ borderColor: RG.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>
            {rec.type.replace(/-/g, ' ').toUpperCase()} · {rec.label}
          </p>
          <p style={rgLabel}>{rec.rationale}</p>
          <p style={{ ...rgLabel, fontSize: '5px', color: RG.rose }}>{rec.longTermValue}</p>
        </div>
      ))}
    </section>
  );
}

export function CrossCompanyRelationshipsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>CROSS-COMPANY RELATIONSHIPS · PORTFOLIO</p>
      {store.crossCompany.map((xc) => (
        <div key={xc.id} className="py-2 border-b" style={{ borderColor: RG.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{xc.displayName} · {xc.companies.join(' · ')}</p>
          <p style={rgLabel}>{xc.crossBrandBehavior}</p>
          <p style={{ ...rgLabel, fontSize: '5px' }}>LTV: {xc.portfolioLifetimeValue}</p>
          {xc.opportunities.map((o) => <p key={o} style={{ ...rgLabel, fontSize: '5px' }}>→ {o}</p>)}
        </div>
      ))}
    </section>
  );
}

export function CreatorMarketplacePanel({ store, selectedReader }: Pick<Props, 'store' | 'selectedReader'>) {
  const opps = selectedReader
    ? store.creatorOpportunities.filter((o) => o.readerId === selectedReader.id)
    : store.creatorOpportunities;
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>CREATOR MARKETPLACE · TALENT PIPELINE</p>
      {opps.map((opp) => (
        <div key={opp.id} className="py-1 border-b" style={{ borderColor: RG.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>
            {opp.type.toUpperCase()} · {opp.label} · {opp.fitScore}% FIT
          </p>
          <p style={{ ...rgLabel, fontSize: '5px' }}>{opp.rationale}</p>
        </div>
      ))}
    </section>
  );
}

export function RelationshipSimulationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>RELATIONSHIP SIMULATION · BEFORE CAMPAIGNS</p>
      {store.simulations.map((sim) => (
        <div key={sim.id} className="py-2 border-b" style={{ borderColor: RG.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: RG.rose }}>
            {sim.campaignLabel} · {sim.confidencePct}%
          </p>
          <p style={rgLabel}>IMPACT: {sim.relationshipImpact}</p>
          <p style={{ ...rgLabel, fontSize: '5px' }}>
            ENGAGEMENT {sim.engagement} · RETENTION {sim.retention} · ADVOCACY {sim.advocacy} · TRUST {sim.trust}
          </p>
        </div>
      ))}
    </section>
  );
}

export function PrivacyControlsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>PRIVACY · FOUNDER CONTROLS</p>
      <p style={rgLabel}>Relationship intelligence respects platform permissions and user consent</p>
      {store.privacyControls.map((pc) => (
        <div key={pc.id} className="py-1 border-b flex justify-between" style={{ borderColor: RG.panelBorder }}>
          <div>
            <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{pc.label}</p>
            <p style={{ ...rgLabel, fontSize: '5px' }}>{pc.description}</p>
          </div>
          <span style={{ ...rgLabel, color: pc.enabled ? RG.green : RG.gray, fontFamily: '"Futura PT Medium"' }}>
            {pc.enabled ? 'ON' : 'OFF'}
          </span>
        </div>
      ))}
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={rgPanel}>
      <p style={rgSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {READER_GRAPH_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: RG.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioDistributionEnginePath()} style={{ ...rgLabel, color: '#7C3AED', fontSize: '6px' }}>→ DISTRIBUTION ENGINE</Link>
        <Link to={adminStudioCampaignEnginePath()} style={{ ...rgLabel, color: '#D97706', fontSize: '6px' }}>→ CAMPAIGN ENGINE</Link>
        <Link to={adminStudioStrategyEnginePath()} style={{ ...rgLabel, color: '#334155', fontSize: '6px' }}>→ STRATEGY ENGINE</Link>
        <Link to={adminStudioRelationshipEnginePath()} style={{ ...rgLabel, color: '#059669', fontSize: '6px' }}>→ RELATIONSHIP ENGINE</Link>
      </div>
    </section>
  );
}
