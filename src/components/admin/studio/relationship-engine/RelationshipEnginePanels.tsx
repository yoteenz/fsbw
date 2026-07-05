import { Link } from 'react-router-dom';
import type {
  LoyaltyIntelligence,
  RelationshipEngineStore,
  RelationshipHealthDetail,
  RelationshipEngineWorkspaceId,
  RelationshipWorkspace,
} from '../../../../studio-os-core/relationship-engine/types';
import {
  COMMUNITY_ENGINE_EXAMPLES,
  NEXT_BEST_ACTION_TYPES,
  RELATIONSHIP_CONNECTED_SYSTEMS,
  RELATIONSHIP_LIFECYCLE_STAGES,
} from '../../../../studio-os-core/relationship-engine/constants';
import {
  adminStudioCampaignEnginePath,
  adminStudioDistributionEnginePath,
  adminStudioReaderGraphPath,
  adminStudioStrategyEnginePath,
  adminStudioCreatorMarketplacePath,
} from '../../../../utils/adminStudioRoutes';
import {
  RELATIONSHIP_ENGINE_STYLES,
  RE,
  healthColor,
  reDarkHeader,
  reLabel,
  reLiveDot,
  rePanel,
  reSectionTitle,
  reValue,
} from './relationshipEngineTheme';

type Props = {
  store: RelationshipEngineStore;
  selectedRelationship: RelationshipWorkspace | null;
  workspaceRelationships: RelationshipWorkspace[];
  relationshipHealth: RelationshipHealthDetail | null;
  relationshipActions: RelationshipEngineStore['nextBestActions'];
  relationshipTimeline: RelationshipEngineStore['timelines'];
  relationshipSignals: RelationshipEngineStore['intelligenceSignals'];
  relationshipLoyalty: LoyaltyIntelligence | null;
  onSelectWorkspace: (id: RelationshipEngineWorkspaceId) => void;
  onSelectRelationship: (id: string) => void;
};

export function RelationshipEngineHeader() {
  return (
    <>
      <style>{RELATIONSHIP_ENGINE_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...reDarkHeader, borderTop: `3px solid ${RE.emerald}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          RELATIONSHIP ENGINE
        </p>
        <p style={{ ...reLabel, color: '#94A3B8' }}>
          <span style={reLiveDot} />
          NURTURE · TRUST · ADVOCACY · NOT A CRM · RELATIONSHIP OPERATING SYSTEM
        </p>
        <p style={{ ...reLabel, color: '#CBD5E1', marginTop: 4 }}>
          ACTIVE RELATIONSHIP MANAGEMENT · RELATIONSHIPS AS ORGANIZATIONAL ASSETS
        </p>
      </header>
    </>
  );
}

export function RelationshipDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={rePanel}>
      <p style={reSectionTitle}>RELATIONSHIP ENGINE · ACTIVE HQ</p>
      <p style={{ ...reLabel, color: RE.emerald, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-3">
        {[
          ['ACTIVE RELATIONSHIPS', d.activeRelationships],
          ['AVG HEALTH', `${d.avgHealthPct}%`],
          ['NEXT BEST ACTIONS', d.pendingActions],
          ['COMMUNITY LEADERS', d.communityLeaders],
          ['RECOGNITIONS DUE', d.recognitionsDue],
          ['TRUST TREND', `+${d.trustTrendPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: RE.panelBorder }}>
            <p style={{ ...reValue, fontSize: '12px' }}>{val}</p>
            <p style={reLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function WorkspaceRelationshipSelector({ store, onSelectWorkspace }: Pick<Props, 'store' | 'onSelectWorkspace'>) {
  const workspaces: RelationshipEngineWorkspaceId[] = ['ndxbook', 'frontal-slayer'];
  return (
    <section className="p-3 mb-3" style={rePanel}>
      <p style={reSectionTitle}>RELATIONSHIP WORKSPACE</p>
      <div className="flex gap-1 flex-wrap">
        {workspaces.map((ws) => (
          <button
            key={ws}
            type="button"
            onClick={() => onSelectWorkspace(ws)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.activeWorkspaceId === ws ? RE.emerald : RE.panelBorder,
              color: store.activeWorkspaceId === ws ? RE.emerald : RE.gray,
              background: store.activeWorkspaceId === ws ? 'rgba(5,150,105,0.06)' : 'white',
            }}
          >
            {ws.toUpperCase()}
          </button>
        ))}
      </div>
    </section>
  );
}

export function RelationshipListPanel({ workspaceRelationships, store, onSelectRelationship }: Pick<Props, 'workspaceRelationships' | 'store' | 'onSelectRelationship'>) {
  return (
    <section className="p-3 mb-3" style={rePanel}>
      <p style={reSectionTitle}>RELATIONSHIP WORKSPACES · EVERY PERSON</p>
      {workspaceRelationships.map((rel) => (
        <button
          key={rel.id}
          type="button"
          onClick={() => onSelectRelationship(rel.id)}
          className="w-full text-left p-2 mb-1 border"
          style={{
            borderColor: store.selectedRelationshipId === rel.id ? RE.emerald : RE.panelBorder,
            background: store.selectedRelationshipId === rel.id ? 'rgba(5,150,105,0.04)' : 'white',
          }}
        >
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{rel.displayName}</p>
          <p style={{ ...reLabel, fontSize: '5px' }}>
            {rel.currentStage.replace(/-/g, ' ').toUpperCase()} · HEALTH {rel.relationshipHealthPct}% · TRUST {rel.trustScore}
          </p>
        </button>
      ))}
    </section>
  );
}

export function RelationshipWorkspacePanel({ selectedRelationship }: Pick<Props, 'selectedRelationship'>) {
  if (!selectedRelationship) return null;
  const r = selectedRelationship;
  return (
    <section className="p-3 mb-3" style={rePanel}>
      <p style={reSectionTitle}>RELATIONSHIP WORKSPACE · {r.displayName}</p>
      <p style={reLabel}>STAGE: {r.currentStage.replace(/-/g, ' ').toUpperCase()}</p>
      <div className="grid grid-cols-2 gap-1 mt-2">
        {[['TRUST', r.trustScore], ['ENGAGEMENT', r.engagementScore], ['ADVOCACY', r.advocacyScore], ['COMMUNITY', r.communityScore], ['KNOWLEDGE', r.knowledgeScore], ['HEALTH', r.relationshipHealthPct]].map(([l, v]) => (
          <p key={l} style={reLabel}>{l}: {v}</p>
        ))}
      </div>
      <p style={{ ...reSectionTitle, marginTop: 8, fontSize: '7px' }}>INTERACTION</p>
      <p style={{ ...reLabel, fontSize: '5px' }}>{r.interactionSummary}</p>
      <p style={{ ...reSectionTitle, marginTop: 4, fontSize: '7px' }}>COMMUNICATION</p>
      <p style={{ ...reLabel, fontSize: '5px' }}>{r.communicationSummary}</p>
      <p style={{ ...reSectionTitle, marginTop: 4, fontSize: '7px' }}>CAMPAIGNS</p>
      <p style={{ ...reLabel, fontSize: '5px' }}>{r.campaignParticipation.join(' · ') || '—'}</p>
    </section>
  );
}

export function LifecycleStagesPanel() {
  return (
    <section className="p-3 mb-3" style={rePanel}>
      <p style={reSectionTitle}>RELATIONSHIP LIFECYCLE · CUSTOMIZABLE</p>
      {RELATIONSHIP_LIFECYCLE_STAGES.map((stage, i) => (
        <div key={stage.stage} className="flex items-start gap-2 py-0.5">
          <span style={{ ...reLabel, color: RE.emerald, fontFamily: '"Futura PT Medium"', minWidth: 12 }}>{i + 1}</span>
          <div>
            <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{stage.label}</p>
            <p style={{ ...reLabel, fontSize: '5px' }}>{stage.description}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export function NextBestActionPanel({ relationshipActions, store }: Pick<Props, 'relationshipActions' | 'store'>) {
  const actions = relationshipActions.length > 0 ? relationshipActions : store.nextBestActions.slice(0, 4);
  return (
    <section className="p-3 mb-3" style={rePanel}>
      <p style={reSectionTitle}>NEXT BEST RELATIONSHIP ACTION</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {NEXT_BEST_ACTION_TYPES.slice(0, 6).map((t) => (
          <span key={t} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: RE.panelBorder }}>{t}</span>
        ))}
      </div>
      {actions.map((action) => (
        <div key={action.id} className="py-2 border-b" style={{ borderColor: RE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: RE.emerald }}>
            {action.label} · {action.confidencePct}% · {action.priority.toUpperCase()}
          </p>
          <p style={reLabel}><strong>WHY:</strong> {action.why}</p>
          <p style={reLabel}><strong>IMPACT:</strong> {action.expectedImpact}</p>
        </div>
      ))}
    </section>
  );
}

export function RelationshipHealthPanel({ relationshipHealth }: Pick<Props, 'relationshipHealth'>) {
  if (!relationshipHealth) {
    return (
      <section className="p-3 mb-3" style={rePanel}>
        <p style={reSectionTitle}>RELATIONSHIP HEALTH</p>
        <p style={reLabel}>Quality over transaction volume · select a relationship</p>
      </section>
    );
  }
  const h = relationshipHealth;
  return (
    <section className="p-3 mb-3" style={rePanel}>
      <p style={reSectionTitle}>RELATIONSHIP HEALTH · {h.overallPct}%</p>
      <div className="grid grid-cols-2 gap-1">
        {[['TRUST', h.trust], ['CONSISTENCY', h.consistency], ['ENGAGEMENT', h.engagement], ['COMMUNICATION', h.communication], ['COMMUNITY', h.communityParticipation], ['KNOWLEDGE', h.knowledgeProgression], ['BRAND AFFINITY', h.brandAffinity], ['PURCHASE', h.purchaseBehavior], ['REFERRALS', h.referrals], ['ADVOCACY', h.advocacy]].map(([l, v]) => (
          <p key={l} style={{ ...reLabel, color: healthColor(v as number) }}>{l}: {v}%</p>
        ))}
      </div>
    </section>
  );
}

export function RelationshipTimelinePanel({ relationshipTimeline }: Pick<Props, 'relationshipTimeline'>) {
  return (
    <section className="p-3 mb-3" style={rePanel}>
      <p style={reSectionTitle}>RELATIONSHIP TIMELINE · MILESTONES</p>
      {relationshipTimeline.length === 0 ? (
        <p style={reLabel}>Select a relationship to view timeline</p>
      ) : (
        relationshipTimeline.map((ev) => (
          <div key={ev.id} className="py-1 border-b flex gap-2" style={{ borderColor: RE.panelBorder }}>
            <span style={{ ...reLabel, color: RE.emerald, minWidth: 80, fontFamily: '"Futura PT Medium"', fontSize: '5px' }}>
              {ev.type.replace(/-/g, ' ').toUpperCase()}
            </span>
            <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{ev.label}</p>
          </div>
        ))
      )}
    </section>
  );
}

export function RelationshipIntelligencePanel({ relationshipSignals, store }: Pick<Props, 'relationshipSignals' | 'store'>) {
  const signals = relationshipSignals.length > 0 ? relationshipSignals : store.intelligenceSignals.slice(0, 4);
  return (
    <section className="p-3 mb-3" style={rePanel}>
      <p style={reSectionTitle}>RELATIONSHIP INTELLIGENCE · PROACTIVE</p>
      {signals.map((sig) => (
        <div key={sig.id} className="py-1 border-b" style={{ borderColor: RE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: RE.emerald }}>
            {sig.label} · {sig.confidencePct}%
          </p>
          <p style={{ ...reLabel, fontSize: '5px' }}>{sig.proactiveAction}</p>
        </div>
      ))}
    </section>
  );
}

export function CommunityEnginePanel({ store }: Pick<Props, 'store'>) {
  const communities = store.communities.filter((c) => c.workspaceId === store.activeWorkspaceId);
  return (
    <section className="p-3 mb-3" style={rePanel}>
      <p style={reSectionTitle}>COMMUNITY ENGINE · NATURAL FORMATION</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {COMMUNITY_ENGINE_EXAMPLES.map((ex) => (
          <span key={ex} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: RE.panelBorder }}>{ex.toUpperCase()}</span>
        ))}
      </div>
      {communities.map((comm) => (
        <div key={comm.id} className="py-2 border-b" style={{ borderColor: RE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{comm.label} · {comm.memberCount}</p>
          <p style={reLabel}>{comm.description}</p>
          {comm.recommendations.map((r) => <p key={r} style={{ ...reLabel, fontSize: '5px', color: RE.emerald }}>→ {r}</p>)}
        </div>
      ))}
    </section>
  );
}

export function CommunicationOrchestrationPanel({ store, selectedRelationship }: Pick<Props, 'store' | 'selectedRelationship'>) {
  const comms = selectedRelationship
    ? store.communications.filter((c) => c.relationshipId === selectedRelationship.id)
    : store.communications;
  return (
    <section className="p-3 mb-3" style={rePanel}>
      <p style={reSectionTitle}>COMMUNICATION ORCHESTRATION · NO FATIGUE</p>
      {comms.map((com) => (
        <div key={com.id} className="py-1 border-b" style={{ borderColor: RE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>
            {com.channel.toUpperCase()} · {com.label}
          </p>
          <p style={{ ...reLabel, fontSize: '5px' }}>
            {com.frequency} · FATIGUE {com.fatigueRisk.toUpperCase()} · {com.personalized ? 'PERSONALIZED' : 'STANDARD'}
          </p>
        </div>
      ))}
    </section>
  );
}

export function RecognitionEnginePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={rePanel}>
      <p style={reSectionTitle}>RECOGNITION ENGINE · CELEBRATE RELATIONSHIPS</p>
      {store.recognitions.map((rec) => (
        <div key={rec.id} className="py-1 border-b" style={{ borderColor: RE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>
            {rec.title} · {rec.sent ? 'SENT' : 'DUE'}
          </p>
          <p style={{ ...reLabel, fontSize: '5px' }}>{rec.message}</p>
        </div>
      ))}
    </section>
  );
}

export function LoyaltyIntelligencePanel({ relationshipLoyalty }: Pick<Props, 'relationshipLoyalty'>) {
  if (!relationshipLoyalty) {
    return (
      <section className="p-3 mb-3" style={rePanel}>
        <p style={reSectionTitle}>LOYALTY INTELLIGENCE</p>
        <p style={reLabel}>Relationship intelligence · not simple points · reward long-term value</p>
      </section>
    );
  }
  const l = relationshipLoyalty;
  return (
    <section className="p-3 mb-3" style={rePanel}>
      <p style={reSectionTitle}>LOYALTY INTELLIGENCE · {l.overallLoyaltyPct}%</p>
      <div className="grid grid-cols-2 gap-1">
        {[['PARTICIPATION', l.participation], ['EDUCATION', l.education], ['CONTRIBUTIONS', l.contributions], ['COMMUNITY IMPACT', l.communityImpact], ['REFERRALS', l.referrals], ['ADVOCACY', l.brandAdvocacy]].map(([lbl, v]) => (
          <p key={lbl} style={reLabel}>{lbl}: {v}%</p>
        ))}
      </div>
      <p style={{ ...reLabel, color: RE.emerald, marginTop: 4 }}>REWARD: {l.rewardRecommendation}</p>
    </section>
  );
}

export function PortfolioRelationshipsPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={rePanel}>
      <p style={reSectionTitle}>PORTFOLIO RELATIONSHIPS · CROSS-COMPANY</p>
      {store.portfolio.map((pf) => (
        <div key={pf.id} className="py-2 border-b" style={{ borderColor: RE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{pf.displayName} · {pf.companies.join(' · ')}</p>
          <p style={reLabel}>ROLES: {pf.roles.join(' · ')}</p>
          <p style={{ ...reLabel, fontSize: '5px' }}>LTV: {pf.portfolioValue}</p>
          {pf.opportunities.map((o) => <p key={o} style={{ ...reLabel, fontSize: '5px' }}>→ {o}</p>)}
        </div>
      ))}
    </section>
  );
}

export function CosIntegrationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...rePanel, borderLeft: `4px solid ${RE.emerald}` }}>
      <p style={reSectionTitle}>CHIEF OF STAFF · RELATIONSHIP MONITORING</p>
      {store.cosAlerts.map((alert) => (
        <div key={alert.id} className="py-1 border-b" style={{ borderColor: RE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: alert.urgency === 'critical' ? RE.red : RE.emerald }}>
            {alert.label} · {alert.urgency.toUpperCase()}
          </p>
          <p style={{ ...reLabel, fontSize: '5px' }}>{alert.recommendation}</p>
        </div>
      ))}
    </section>
  );
}

export function RelationshipSimulationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={rePanel}>
      <p style={reSectionTitle}>RELATIONSHIP SIMULATION · BEFORE CAMPAIGNS</p>
      {store.simulations.map((sim) => (
        <div key={sim.id} className="py-2 border-b" style={{ borderColor: RE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: RE.emerald }}>
            {sim.campaignLabel} · {sim.confidencePct}%
          </p>
          <p style={reLabel}>IMPACT: {sim.relationshipImpact}</p>
          <p style={{ ...reLabel, fontSize: '5px' }}>
            TRUST {sim.trustImpact} · RETENTION {sim.retention} · ADVOCACY {sim.advocacy}
          </p>
        </div>
      ))}
    </section>
  );
}

export function InstitutionalLearningPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={rePanel}>
      <p style={reSectionTitle}>INSTITUTIONAL LEARNING · EVERY INTERACTION</p>
      {store.institutionalLearning.map((entry) => (
        <div key={entry.id} className="py-1 border-b" style={{ borderColor: RE.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{entry.title}</p>
          <p style={{ ...reLabel, fontSize: '5px' }}>{entry.detail}</p>
          <p style={{ ...reLabel, fontSize: '5px', color: RE.emerald }}>UPDATES: {entry.updatesSystems.join(' · ')}</p>
        </div>
      ))}
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={rePanel}>
      <p style={reSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {RELATIONSHIP_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: RE.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioReaderGraphPath()} style={{ ...reLabel, color: '#E11D48', fontSize: '6px' }}>→ READER GRAPH</Link>
        <Link to={adminStudioDistributionEnginePath()} style={{ ...reLabel, color: '#7C3AED', fontSize: '6px' }}>→ DISTRIBUTION ENGINE</Link>
        <Link to={adminStudioCampaignEnginePath()} style={{ ...reLabel, color: '#D97706', fontSize: '6px' }}>→ CAMPAIGN ENGINE</Link>
        <Link to={adminStudioStrategyEnginePath()} style={{ ...reLabel, color: '#334155', fontSize: '6px' }}>→ STRATEGY ENGINE</Link>
        <Link to={adminStudioCreatorMarketplacePath()} style={{ ...reLabel, color: '#2563EB', fontSize: '6px' }}>→ CREATOR MARKETPLACE</Link>
      </div>
    </section>
  );
}
