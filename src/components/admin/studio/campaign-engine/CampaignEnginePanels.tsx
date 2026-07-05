import { Link } from 'react-router-dom';
import type {
  CampaignDeliverable,
  CampaignEngineStore,
  CampaignRecord,
  CampaignWorkspaceId,
} from '../../../../studio-os-core/campaign-engine/types';
import { CAMPAIGN_BUILDER_STEPS, CAMPAIGN_CONNECTED_SYSTEMS, CAMPAIGN_TYPES } from '../../../../studio-os-core/campaign-engine/constants';
import { adminStudioStrategyEnginePath, adminStudioWorkOrchestrationPath, adminStudioDistributionEnginePath } from '../../../../utils/adminStudioRoutes';
import {
  CAMPAIGN_ENGINE_STYLES,
  CE,
  ceDarkHeader,
  ceLabel,
  ceLiveDot,
  cePanel,
  ceSectionTitle,
  ceValue,
  healthColor,
} from './campaignEngineTheme';

type Props = {
  store: CampaignEngineStore;
  selectedCampaign: CampaignRecord | null;
  workspaceCampaigns: CampaignRecord[];
  campaignDeliverables: CampaignDeliverable[];
  onSelectWorkspace: (id: CampaignWorkspaceId) => void;
  onSelectCampaign: (id: string) => void;
  onSetBuilderStep: (step: number) => void;
};

export function CampaignEngineHeader() {
  return (
    <>
      <style>{CAMPAIGN_ENGINE_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...ceDarkHeader, borderTop: `3px solid ${CE.amber}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          CAMPAIGN ENGINE
        </p>
        <p style={{ ...ceLabel, color: '#94A3B8' }}>
          <span style={ceLiveDot} />
          STRATEGY → CAMPAIGN → DELIVERABLES → DISTRIBUTION → LEARNING
        </p>
        <p style={{ ...ceLabel, color: '#CBD5E1', marginTop: 4 }}>
          COORDINATED EXECUTION · NOT PROJECT MANAGEMENT · EVERY ASSET BELONGS TO A CAMPAIGN
        </p>
      </header>
    </>
  );
}

export function CampaignDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>CAMPAIGN ENGINE · EXECUTION HQ</p>
      <p style={{ ...ceLabel, color: CE.amber, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-3">
        {[
          ['ACTIVE CAMPAIGNS', d.activeCampaigns],
          ['IN PRODUCTION', d.deliverablesInProduction],
          ['AVG HEALTH', `${d.avgHealthPct}%`],
          ['BUDGET ALLOCATED', d.totalBudgetAllocated],
          ['EXPERIMENTS', d.experimentsRunning],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: CE.panelBorder }}>
            <p style={{ ...ceValue, fontSize: '12px' }}>{val}</p>
            <p style={ceLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function WorkspaceCampaignSelector({ store, onSelectWorkspace }: Pick<Props, 'store' | 'onSelectWorkspace'>) {
  const workspaces: CampaignWorkspaceId[] = ['ndxbook', 'frontal-slayer'];
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>CAMPAIGN WORKSPACE</p>
      <div className="flex flex-wrap gap-1">
        {workspaces.map((ws) => (
          <button
            key={ws}
            type="button"
            onClick={() => onSelectWorkspace(ws)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.activeWorkspaceId === ws ? CE.amber : CE.panelBorder,
              background: store.activeWorkspaceId === ws ? 'rgba(217,119,6,0.08)' : 'white',
              color: store.activeWorkspaceId === ws ? CE.amber : CE.gray,
            }}
          >
            {ws === 'ndxbook' ? 'NDXBOOK' : 'FRONTAL SLAYER'}
          </button>
        ))}
      </div>
    </section>
  );
}

export function CampaignHierarchyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>EXECUTION HIERARCHY</p>
      <div className="flex flex-col items-center gap-0">
        {store.hierarchyLevels.map((level, i) => (
          <div key={level.level} className="w-full flex flex-col items-center">
            {i > 0 ? <div className="w-px h-2" style={{ background: CE.amber }} /> : null}
            <div
              className="w-full px-2 py-1 text-[7px] font-futura text-center border"
              style={{
                borderColor: level.level === 'campaign' ? CE.amber : CE.panelBorder,
                background: level.level === 'campaign' ? 'rgba(217,119,6,0.06)' : 'white',
                fontWeight: 515,
              }}
            >
              {level.label}
              <p style={{ ...ceLabel, fontSize: '5px', margin: '2px 0 0' }}>{level.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CampaignListPanel({ workspaceCampaigns, store, onSelectCampaign }: Pick<Props, 'workspaceCampaigns' | 'store' | 'onSelectCampaign'>) {
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>ACTIVE CAMPAIGNS · {CAMPAIGN_TYPES.length} TYPES SUPPORTED</p>
      {workspaceCampaigns.map((camp) => (
        <button
          key={camp.id}
          type="button"
          onClick={() => onSelectCampaign(camp.id)}
          className="w-full text-left p-2 mb-1 border"
          style={{
            borderColor: store.selectedCampaignId === camp.id ? CE.amber : CE.panelBorder,
            background: store.selectedCampaignId === camp.id ? 'rgba(217,119,6,0.04)' : 'white',
          }}
        >
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{camp.name}</p>
            <span className="text-[5px] font-futura" style={{ color: camp.status === 'active' ? CE.green : CE.gray }}>{camp.status.toUpperCase()}</span>
          </div>
          <p style={{ ...ceLabel, fontSize: '5px' }}>{camp.type.replace(/-/g, ' ').toUpperCase()} · {camp.owner}</p>
          <p style={{ ...ceLabel, fontSize: '5px', color: healthColor(camp.healthPct) }}>HEALTH {camp.healthPct}% · {camp.confidencePct}% CONF</p>
        </button>
      ))}
    </section>
  );
}

export function CampaignWorkspacePanel({ selectedCampaign, store }: Pick<Props, 'selectedCampaign' | 'store'>) {
  if (!selectedCampaign) return null;
  const intel = store.intelligence[selectedCampaign.id];
  const health = store.healthScores[selectedCampaign.id];
  return (
    <section className="p-3 mb-3" style={{ ...cePanel, borderLeft: `4px solid ${CE.amber}` }}>
      <p style={ceSectionTitle}>CAMPAIGN WORKSPACE · {selectedCampaign.name}</p>
      <p style={{ ...ceValue, fontSize: '14px' }}>{selectedCampaign.objective}</p>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {[
          ['STRATEGY', selectedCampaign.relatedStrategyLabel],
          ['INITIATIVE', selectedCampaign.relatedInitiativeLabel],
          ['OWNER', selectedCampaign.owner],
          ['SPONSOR', selectedCampaign.executiveSponsor],
          ['TIMELINE', selectedCampaign.timeline],
          ['BUDGET', `${selectedCampaign.budgetSpent} / ${selectedCampaign.budget}`],
          ['EXPECTED', selectedCampaign.expectedOutcome],
          ['ACTUAL', selectedCampaign.actualOutcome || '—'],
        ].map(([label, val]) => (
          <div key={label} className="p-1 border" style={{ borderColor: CE.panelBorder }}>
            <p style={{ ...ceLabel, fontSize: '5px' }}>{label}</p>
            <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{val}</p>
          </div>
        ))}
      </div>
      {intel ? (
        <div className="mt-2 p-2 border" style={{ borderColor: CE.amber, background: 'rgba(217,119,6,0.04)' }}>
          <p style={{ ...ceSectionTitle, fontSize: '7px' }}>CAMPAIGN INTELLIGENCE · {intel.momentum.toUpperCase()}</p>
          {intel.recommendations.map((r, i) => (
            <p key={i} style={{ ...ceLabel, fontSize: '5px', color: CE.amber }}>→ {r}</p>
          ))}
        </div>
      ) : null}
      {health ? (
        <p className="mt-2 text-[7px] font-futura" style={{ fontWeight: 515, color: healthColor(health.overallPct) }}>
          CAMPAIGN HEALTH {health.overallPct}%
        </p>
      ) : null}
      <Link to={adminStudioStrategyEnginePath()} style={{ ...ceLabel, color: CE.slate, fontSize: '6px', display: 'inline-block', marginTop: 6 }}>
        → STRATEGY ENGINE · {selectedCampaign.relatedStrategyLabel}
      </Link>
    </section>
  );
}

export function DeliverablesPanel({ campaignDeliverables }: Pick<Props, 'campaignDeliverables'>) {
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>DELIVERABLE ORCHESTRATION · NEWSROOM LINKED</p>
      <p style={ceLabel}>Pages · videos · emails · graphics automatically appear in newsroom production</p>
      {campaignDeliverables.map((del) => (
        <div key={del.id} className="flex justify-between py-1 border-b" style={{ borderColor: CE.panelBorder }}>
          <div>
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{del.title}</p>
            <p style={{ ...ceLabel, fontSize: '5px' }}>{del.type.toUpperCase()} · {del.owner}{del.newsroomPageId ? ` · ${del.newsroomPageId}` : ''}</p>
          </div>
          <span className="text-[5px] font-futura px-1 border" style={{ borderColor: del.status === 'in-production' ? CE.amber : CE.panelBorder }}>
            {del.status.toUpperCase()}
          </span>
        </div>
      ))}
    </section>
  );
}

export function CampaignBuilderPanel({ store, onSetBuilderStep }: Pick<Props, 'store' | 'onSetBuilderStep'>) {
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>CAMPAIGN BUILDER</p>
      <p style={ceLabel}>Step {store.builderStep + 1} of {CAMPAIGN_BUILDER_STEPS.length}: {CAMPAIGN_BUILDER_STEPS[store.builderStep]?.toUpperCase()}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {CAMPAIGN_BUILDER_STEPS.map((step, i) => (
          <button
            key={step}
            type="button"
            onClick={() => onSetBuilderStep(i)}
            className="px-1 py-0.5 text-[5px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.builderStep === i ? CE.amber : CE.panelBorder,
              background: store.builderStep === i ? 'rgba(217,119,6,0.1)' : 'white',
              color: store.builderStep === i ? CE.amber : CE.gray,
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </section>
  );
}

export function CampaignCalendarPanel({ store, selectedCampaign }: Pick<Props, 'store' | 'selectedCampaign'>) {
  const entries = selectedCampaign
    ? store.calendar.filter((c) => c.campaignId === selectedCampaign.id)
    : store.calendar;
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>CAMPAIGN CALENDAR</p>
      {entries.map((entry) => (
        <div key={entry.id} className="p-2 mb-1 border" style={{ borderColor: CE.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{entry.title}</p>
          <p style={{ ...ceLabel, fontSize: '5px' }}>{entry.view.toUpperCase()} · {entry.overlapTags.join(' · ')}</p>
        </div>
      ))}
    </section>
  );
}

export function DepartmentCoordinationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>CROSS-DEPARTMENT COORDINATION</p>
      {store.departmentCoordination.map((dept) => (
        <div key={dept.department} className="p-2 mb-1 border" style={{ borderColor: CE.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{dept.department.toUpperCase()}</p>
          <p style={{ ...ceLabel, fontSize: '5px' }}>{dept.responsibilities.join(' · ')}</p>
        </div>
      ))}
    </section>
  );
}

export function CreatorRecommendationsPanel({ store, selectedCampaign }: Pick<Props, 'store' | 'selectedCampaign'>) {
  const recs = selectedCampaign
    ? store.creatorRecommendations.filter((r) => r.campaignId === selectedCampaign.id)
    : store.creatorRecommendations;
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>CREATOR MARKETPLACE · CAMPAIGN MATCHES</p>
      {recs.map((cr) => (
        <div key={cr.id} className="p-2 mb-1 border" style={{ borderColor: CE.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{cr.creatorName}</p>
            <span style={{ fontSize: '8px', color: healthColor(cr.fitScore) }}>{cr.fitScore}% FIT</span>
          </div>
          <p style={{ ...ceLabel, fontSize: '5px' }}>{cr.audienceMatch} · {cr.brandFit}</p>
        </div>
      ))}
    </section>
  );
}

export function CampaignExperimentsPanel({ store, selectedCampaign }: Pick<Props, 'store' | 'selectedCampaign'>) {
  const exps = selectedCampaign
    ? store.experiments.filter((e) => e.campaignId === selectedCampaign.id)
    : store.experiments;
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>CAMPAIGN EXPERIMENTS · STUDIO OS LABS</p>
      {exps.map((exp) => (
        <div key={exp.id} className="py-1 border-b" style={{ borderColor: CE.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{exp.label}</p>
          <p style={{ ...ceLabel, fontSize: '5px' }}>{exp.type.toUpperCase()} · {exp.status.toUpperCase()}{exp.winner ? ` · WINNER: ${exp.winner}` : ''}</p>
        </div>
      ))}
    </section>
  );
}

export function CampaignAnalyticsPanel({ store, selectedCampaign }: Pick<Props, 'store' | 'selectedCampaign'>) {
  if (!selectedCampaign) return null;
  const analytics = store.analytics[selectedCampaign.id];
  if (!analytics) return null;
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>CAMPAIGN ANALYTICS</p>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
        {Object.entries(analytics).slice(0, 8).map(([key, val]) => (
          <div key={key} className="p-1 text-center border" style={{ borderColor: CE.panelBorder }}>
            <p style={{ ...ceValue, fontSize: '10px' }}>{val}</p>
            <p style={{ ...ceLabel, fontSize: '4px' }}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CampaignSimulationPanel({ store, selectedCampaign }: Pick<Props, 'store' | 'selectedCampaign'>) {
  const sim = selectedCampaign ? store.simulations[selectedCampaign.id] : null;
  if (!sim) return null;
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>CAMPAIGN SIMULATION · PRE-LAUNCH</p>
      <p style={{ ...ceLabel, fontSize: '5px' }}>REACH: {sim.expectedReach} · ENGAGEMENT: {sim.expectedEngagement}</p>
      <p style={{ ...ceLabel, fontSize: '5px' }}>BUDGET: {sim.budgetImpact} · CONVERSION: {sim.conversionEstimate}</p>
      <p style={{ ...ceLabel, fontSize: '5px', color: healthColor(sim.confidencePct) }}>{sim.confidencePct}% CONFIDENCE</p>
      {sim.improvements.map((imp, i) => (
        <p key={i} style={{ ...ceLabel, fontSize: '5px' }}>→ {imp}</p>
      ))}
    </section>
  );
}

export function CampaignRetrospectivesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>INSTITUTIONAL LEARNING · RETROSPECTIVES</p>
      {store.retrospectives.map((retro) => (
        <div key={retro.id} className="p-2 mb-2 border" style={{ borderColor: CE.panelBorder }}>
          <p style={{ ...ceSectionTitle, fontSize: '7px' }}>LESSONS</p>
          {retro.lessonsLearned.map((l, i) => (
            <p key={i} style={{ ...ceLabel, fontSize: '5px' }}>· {l}</p>
          ))}
          <p style={{ ...ceSectionTitle, fontSize: '7px', marginTop: 4 }}>PLAYBOOK UPDATES</p>
          {retro.playbookUpdates.map((p, i) => (
            <p key={i} style={{ ...ceLabel, fontSize: '5px', color: CE.green }}>+ {p}</p>
          ))}
        </div>
      ))}
    </section>
  );
}

export function CampaignPlaybooksPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>CAMPAIGN PLAYBOOKS · INHERITANCE</p>
      {store.playbooks.map((pb) => (
        <div key={pb.id} className="py-1 border-b" style={{ borderColor: CE.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{pb.title}</p>
          <p style={{ ...ceLabel, fontSize: '5px' }}>{pb.description}</p>
        </div>
      ))}
      {store.inheritanceOptions.map((opt) => (
        <div key={opt.id} className="p-1 mt-1 border" style={{ borderColor: CE.amber, opacity: 0.9 }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{opt.label}</p>
          <p style={{ ...ceLabel, fontSize: '5px' }}>{opt.description}</p>
        </div>
      ))}
    </section>
  );
}

export function CampaignLineagePanel({ selectedCampaign }: Pick<Props, 'selectedCampaign'>) {
  if (!selectedCampaign) return null;
  return (
    <section className="p-3 mb-3" style={cePanel}>
      <p style={ceSectionTitle}>CAMPAIGN LINEAGE</p>
      <div className="flex flex-col items-center gap-0 text-[6px] font-futura" style={{ fontWeight: 515 }}>
        {['STRATEGY', 'INITIATIVE', 'CAMPAIGN', 'DELIVERABLES', 'DISTRIBUTION', 'ANALYTICS', 'LEARNING'].map((level, i) => (
          <div key={level} className="w-full flex flex-col items-center">
            {i > 0 ? <div className="w-px h-1" style={{ background: CE.amber }} /> : null}
            <div className="w-full px-2 py-1 border text-center" style={{ borderColor: CE.panelBorder, fontSize: '5px' }}>
              {level}
              {level === 'STRATEGY' ? `: ${selectedCampaign.relatedStrategyLabel}` : null}
              {level === 'INITIATIVE' ? `: ${selectedCampaign.relatedInitiativeLabel}` : null}
              {level === 'CAMPAIGN' ? `: ${selectedCampaign.name}` : null}
            </div>
          </div>
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
        {CAMPAIGN_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: CE.panelBorder }}>
            {sys}
          </span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioStrategyEnginePath()} style={{ ...ceLabel, color: '#334155', fontSize: '6px' }}>→ STRATEGY ENGINE</Link>
        <Link to={adminStudioWorkOrchestrationPath()} style={{ ...ceLabel, color: '#0891B2', fontSize: '6px' }}>→ WORK ORCHESTRATION</Link>
        <Link to={adminStudioDistributionEnginePath()} style={{ ...ceLabel, color: '#7C3AED', fontSize: '6px' }}>→ DISTRIBUTION ENGINE</Link>
      </div>
    </section>
  );
}

export function WorkOrchestrationLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cePanel, borderLeft: '4px solid #0891B2' }}>
      <p style={ceSectionTitle}>WORK ORCHESTRATION · INTELLIGENT EXECUTION</p>
      <p style={ceLabel}>Campaigns generate work packages · CoS orchestrates activities · founders lead outcomes not tasks</p>
      <Link
        to={adminStudioWorkOrchestrationPath()}
        style={{ ...ceLabel, color: '#0891B2', fontFamily: '"Futura PT Medium"', fontSize: '6px', display: 'inline-block', marginTop: 6 }}
      >
        → OPEN WORK ORCHESTRATION
      </Link>
    </section>
  );
}

export function DistributionEngineLinkPanel() {
  return (
    <section className="p-3 mb-3" style={{ ...cePanel, borderLeft: '4px solid #7C3AED' }}>
      <p style={ceSectionTitle}>DISTRIBUTION ENGINE · KNOWLEDGE REACH</p>
      <p style={ceLabel}>Deliverables become knowledge assets · multi-platform adaptation · evergreen · institutional learning</p>
      <Link
        to={adminStudioDistributionEnginePath()}
        style={{ ...ceLabel, color: '#7C3AED', fontFamily: '"Futura PT Medium"', fontSize: '6px', display: 'inline-block', marginTop: 6 }}
      >
        → OPEN DISTRIBUTION ENGINE
      </Link>
    </section>
  );
}
