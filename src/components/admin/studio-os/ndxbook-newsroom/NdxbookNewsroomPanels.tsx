import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { NewsroomStore, ProductionPage } from '../../../../studio-os-core/ndxbook/newsroom/types';
import type { NewsroomPipelineStageId } from '../../../../studio-os-core/ndxbook/newsroom/types';
import { QUALITY_GATE_LAYERS } from '../../../../studio-os-core/ndxbook/newsroom/constants';
import { VOLUME_LABELS } from '../../../../studio-os-core/ndxbook/constants';
import { adminStudioChiefOfStaffPath, adminStudioLeadershipDnaPath, adminStudioStrategyEnginePath, adminStudioCampaignEnginePath } from '../../../../utils/adminStudioRoutes';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import {
  NDXBOOK_NEWSROOM_STYLES,
  NR,
  healthColor,
  nrDarkHeader,
  nrLabel,
  nrLiveDot,
  nrPanel,
  nrSectionTitle,
  nrValue,
  priorityColor,
  severityColor,
} from './ndxbookNewsroomTheme';

type Props = {
  store: NewsroomStore;
  selectedPage: ProductionPage | null;
  workspaceId: string;
  formatTime: (iso: string) => string;
  onSelectPage: (id: string) => void;
  onMovePage: (pageId: string, stageId: NewsroomPipelineStageId) => void;
  onReschedule: (entryId: string, scheduledAt: string) => void;
};

export function NewsroomHeader({ workspaceId }: { workspaceId: string }) {
  return (
    <>
      <style>{NDXBOOK_NEWSROOM_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...nrDarkHeader, borderTop: `3px solid ${NR.accent}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          NEWSROOM
        </p>
        <p style={{ ...nrLabel, color: '#94A3B8' }}>
          <span style={nrLiveDot} />
          PRODUCTION FLOOR · {workspaceId.toUpperCase()} · OPERATIONAL HEARTBEAT
        </p>
        <p style={{ ...nrLabel, color: '#CBD5E1', marginTop: 4 }}>
          IDEAS → ASSETS → KNOWLEDGE · MISSION CONTROL SUMMARIZES · NEWSROOM PRODUCES
        </p>
        <div className="flex gap-0 mt-2">
          <Link to={STUDIO_OS_ROUTES.workspaceDashboard(workspaceId)} style={{ ...nrLabel, color: NR.indigo, fontFamily: '"Futura PT Medium"', marginRight: 12 }}>
            ← MISSION CONTROL
          </Link>
          <Link to={adminStudioChiefOfStaffPath()} style={{ ...nrLabel, color: NR.gold, fontFamily: '"Futura PT Medium"' }}>
            CHIEF OF STAFF →
          </Link>
        </div>
      </header>
    </>
  );
}

export function NewsroomDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={nrPanel}>
      <p style={nrSectionTitle}>NEWSROOM · OPERATIONAL PULSE</p>
      <p style={{ ...nrLabel, color: NR.black, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-4">
        {[
          ['IN PRODUCTION', d.pagesInProduction],
          ['PUBLISHING TODAY', d.pagesPublishingToday],
          ['BOTTLENECKS', d.bottlenecks],
          ['HEALTH', `${d.overallHealthPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: NR.panelBorder }}>
            <p style={{ ...nrValue, fontSize: '14px' }}>{val}</p>
            <p style={nrLabel}>{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 p-2" style={{ background: 'rgba(220,38,38,0.06)', border: `1px solid ${NR.accent}` }}>
        <p style={{ ...nrSectionTitle, color: NR.accent, fontSize: '8px' }}>CoS ORCHESTRATION · {d.cosOrchestrationStatus}</p>
      </div>
    </section>
  );
}

export function ProductionBoardPanel({ store, onSelectPage, onMovePage }: Pick<Props, 'store' | 'onSelectPage' | 'onMovePage'>) {
  const [dragPageId, setDragPageId] = useState<string | null>(null);

  const getPage = (id: string) => store.pages.find((p) => p.id === id);

  return (
    <section className="p-3 mb-3 overflow-x-auto" style={nrPanel}>
      <p style={nrSectionTitle}>PRODUCTION BOARD · VISUAL PIPELINE</p>
      <p style={nrLabel}>Drag pages between stages · Chief of Staff orchestrates priorities</p>
      <div className="flex gap-1 min-w-max pb-2 mt-2">
        {store.pipelineStages.map((stage, i) => (
          <div key={stage.id} className="flex items-start">
            <div
              className="min-w-[88px] max-w-[100px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragPageId) onMovePage(dragPageId, stage.id);
                setDragPageId(null);
              }}
            >
              <div
                className="p-1 mb-1 border text-center"
                style={{
                  borderColor: stage.healthPct < 75 ? NR.gold : NR.panelBorder,
                  background: dragPageId ? 'rgba(99,102,241,0.06)' : 'white',
                }}
              >
                <p style={{ ...nrLabel, color: NR.accent, fontSize: '5px' }}>{stage.label}</p>
                <p style={{ ...nrValue, fontSize: '12px' }}>{stage.pageIds.length}</p>
                <p style={{ ...nrLabel, fontSize: '5px' }}>{stage.assignedExecutive.split(' ')[0]}</p>
                {stage.estimatedCompletionMins > 0 ? (
                  <p style={{ ...nrLabel, fontSize: '5px' }}>ETA {stage.estimatedCompletionMins}M</p>
                ) : null}
              </div>
              <div className="space-y-1">
                {stage.pageIds.map((pid) => {
                  const pg = getPage(pid);
                  if (!pg) return null;
                  return (
                    <button
                      key={pid}
                      type="button"
                      draggable
                      onDragStart={() => setDragPageId(pid)}
                      onDragEnd={() => setDragPageId(null)}
                      onClick={() => onSelectPage(pid)}
                      className="w-full p-1 text-left border cursor-grab active:cursor-grabbing"
                      style={{
                        borderColor: store.selectedPageId === pid ? NR.accent : NR.panelBorder,
                        background: store.selectedPageId === pid ? 'rgba(220,38,38,0.06)' : 'white',
                        opacity: dragPageId === pid ? 0.6 : 1,
                      }}
                    >
                      <p style={{ ...nrLabel, color: priorityColor(pg.priority), fontSize: '5px' }}>{pg.pageLabel.toUpperCase()}</p>
                      <p style={{ ...nrLabel, fontSize: '5px', color: healthColor(pg.health) }}>{pg.confidencePct}% · {pg.health.replace('-', ' ').toUpperCase()}</p>
                    </button>
                  );
                })}
              </div>
            </div>
            {i < store.pipelineStages.length - 1 ? (
              <span style={{ color: NR.gray, fontSize: '8px', padding: '8px 1px 0' }}>↓</span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function PageWorkspacePanel({ selectedPage, store }: Pick<Props, 'selectedPage' | 'store'>) {
  if (!selectedPage) {
    return (
      <section className="p-3 mb-3" style={nrPanel}>
        <p style={nrSectionTitle}>PAGE WORKSPACE</p>
        <p style={nrLabel}>Select a page from the production board</p>
      </section>
    );
  }

  const p = selectedPage;
  const pageExperiments = store.experiments.filter((e) => e.pageId === p.id);
  const pageLineage = store.assetLineage.filter((a) => a.pageId === p.id);

  const sections: [string, string[]][] = [
    ['RESEARCH', p.researchNotes],
    ['KNOWLEDGE SOURCES', p.knowledgeSources],
    ['SCRIPT', p.scriptExcerpt ? [p.scriptExcerpt] : ['—']],
    ['STORYBOARD', [p.storyboardStatus]],
    ['VOICE', [p.voiceStatus]],
    ['HOST', [p.assignedHost ?? 'Unassigned']],
    ['ANIMATION', [p.animationStatus]],
    ['THUMBNAIL', [p.thumbnailStatus]],
    ['CAPTIONS', [p.captionStatus]],
    ['HASHTAGS', p.hashtags.length ? p.hashtags : ['—']],
    ['PLATFORMS', p.platformVersions.map((pl) => pl.toUpperCase())],
    ['APPROVAL HISTORY', p.approvalHistory.length ? p.approvalHistory : ['—']],
    ['EXPERIMENTS', pageExperiments.map((e) => `${e.name} · ${e.status}`)],
    ['ANALYTICS', [p.analyticsSnapshot]],
    ['COMMENTS', p.comments.length ? p.comments : ['—']],
    ['REVISION HISTORY', p.revisionHistory.length ? p.revisionHistory : ['—']],
    ['KNOWLEDGE GRAPH', p.knowledgeGraphNodeIds],
    ['MEMORY REFERENCES', p.memoryReferences.length ? p.memoryReferences : ['—']],
    ['INSTITUTIONAL LEARNINGS', p.institutionalLearnings.length ? p.institutionalLearnings : ['—']],
  ];

  return (
    <section className="p-3 mb-3" style={{ ...nrPanel, borderLeft: `4px solid ${NR.accent}` }}>
      <p style={nrSectionTitle}>PAGE WORKSPACE · ATOMIC UNIT OF PRODUCTION</p>
      <p style={{ ...nrLabel, color: NR.accent, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
        {p.pageLabel.toUpperCase()} · {p.title.toUpperCase()}
      </p>
      <p style={nrLabel}>
        {VOLUME_LABELS[p.volumeId]} · {p.chapter.toUpperCase()} · {p.stageId.replace(/-/g, ' ').toUpperCase()} · {p.confidencePct}% CONF
      </p>
      <div className="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-2">
        {sections.map(([title, items]) => (
          <div key={title} className="p-2 border" style={{ borderColor: NR.panelBorder }}>
            <p style={{ ...nrSectionTitle, fontSize: '7px' }}>{title}</p>
            {items.map((item) => (
              <p key={item} style={{ ...nrLabel, fontSize: '6px' }}>· {item}</p>
            ))}
          </div>
        ))}
      </div>
      {pageLineage.length > 0 ? (
        <>
          <p style={{ ...nrSectionTitle, marginTop: 8 }}>ASSET LINEAGE</p>
          {pageLineage.map((a) => (
            <p key={a.id} style={{ ...nrLabel, fontSize: '6px' }}>
              v{a.version} · {a.assetType.toUpperCase()} · {a.label} · {a.changeNote}
            </p>
          ))}
        </>
      ) : null}
    </section>
  );
}

export function DepartmentLanesPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={nrPanel}>
      <p style={nrSectionTitle}>DEPARTMENT LANES · CAPACITY & HEALTH</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {store.departments.map((d) => (
          <div key={d.id} className="p-2 border" style={{ borderColor: d.healthPct < 80 ? NR.gold : NR.panelBorder }}>
            <p style={{ ...nrLabel, color: NR.indigo, fontFamily: '"Futura PT Medium"', fontSize: '7px' }}>{d.label}</p>
            <p style={nrLabel}>CAPACITY · {d.capacityPct}% · LOAD · {d.currentWorkload}</p>
            <p style={nrLabel}>ETA · {d.estimatedCompletionMins}M · HEALTH · {d.healthPct}%</p>
            <p style={{ ...nrLabel, fontSize: '5px' }}>{d.executiveLead}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function EditorialCalendarPanel({ store, formatTime, onReschedule }: Pick<Props, 'store' | 'formatTime' | 'onReschedule'>) {
  const [dragId, setDragId] = useState<string | null>(null);

  return (
    <section className="p-3 mb-3" style={nrPanel}>
      <p style={nrSectionTitle}>EDITORIAL CALENDAR · DRAG TO RESCHEDULE</p>
      {store.editorialCalendar.map((entry) => (
        <div
          key={entry.id}
          draggable
          onDragStart={() => setDragId(entry.id)}
          onDragEnd={() => setDragId(null)}
          className="p-2 mb-1 border flex items-center gap-2 cursor-grab"
          style={{ borderColor: dragId === entry.id ? NR.accent : NR.panelBorder, opacity: dragId === entry.id ? 0.7 : 1 }}
        >
          <div className="flex-1">
            <p style={{ ...nrLabel, color: NR.black, fontFamily: '"Futura PT Medium"' }}>
              {formatTime(entry.scheduledAt)} · {entry.title.toUpperCase()}
            </p>
            <p style={nrLabel}>
              {entry.view.toUpperCase()} · {VOLUME_LABELS[entry.volumeId]} · {entry.status.replace('-', ' ').toUpperCase()}
            </p>
          </div>
        </div>
      ))}
      <p style={{ ...nrLabel, marginTop: 6 }}>DROP SLOTS</p>
      <div className="flex flex-wrap gap-1 mt-1">
        {[10, 12, 14, 16, 18].map((h) => (
          <button
            key={h}
            type="button"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (!dragId) return;
              const d = new Date();
              d.setHours(h, 0, 0, 0);
              onReschedule(dragId, d.toISOString());
              setDragId(null);
            }}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{ borderColor: NR.panelBorder }}
          >
            {h > 12 ? h - 12 : h}{h >= 12 ? 'PM' : 'AM'}
          </button>
        ))}
      </div>
    </section>
  );
}

export function ActivityWallPanel({ store, formatTime }: Pick<Props, 'store' | 'formatTime'>) {
  return (
    <section className="p-3 mb-3" style={nrPanel}>
      <p style={nrSectionTitle}>ACTIVITY WALL · REAL-TIME FEED</p>
      {store.activityWall.map((ev) => (
        <div key={ev.id} className="py-1 border-b" style={{ borderColor: '#eee' }}>
          <p style={{ ...nrLabel, color: NR.black, fontFamily: '"Futura PT Medium"', fontSize: '7px' }}>
            {ev.message.toUpperCase()}
          </p>
          <p style={{ ...nrLabel, fontSize: '6px' }}>
            {formatTime(ev.timestamp)} · {ev.executive} · {ev.confidencePct}% CONF
            {ev.pageLabel ? ` · ${ev.pageLabel}` : ''}
          </p>
        </div>
      ))}
    </section>
  );
}

export function ProductionIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={nrPanel}>
      <p style={nrSectionTitle}>PRODUCTION INTELLIGENCE · STUDIO OS MONITORING</p>
      {store.productionIntelligence.map((sig) => (
        <div key={sig.id} className="p-2 mb-1 border" style={{ borderColor: severityColor(sig.severity) }}>
          <p style={{ ...nrLabel, color: severityColor(sig.severity), fontFamily: '"Futura PT Medium"' }}>{sig.signal.toUpperCase()}</p>
          <p style={nrLabel}>REC · {sig.recommendation}</p>
          <p style={{ ...nrLabel, fontSize: '6px' }}>{sig.confidencePct}% · {sig.department?.toUpperCase() ?? 'ALL'}</p>
        </div>
      ))}
    </section>
  );
}

export function OrchestrationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...nrPanel, borderLeft: `4px solid ${NR.gold}` }}>
      <p style={nrSectionTitle}>PRODUCTION ORCHESTRATION · CHIEF OF STAFF</p>
      <p style={nrLabel}>Founders manage priorities · CoS orchestrates production automatically</p>
      {store.orchestrationQueue.map((action) => (
        <div key={action.id} className="p-2 mb-1 border" style={{ borderColor: NR.panelBorder }}>
          <p style={{ ...nrLabel, color: NR.indigo, fontFamily: '"Futura PT Medium"' }}>{action.action.toUpperCase()}</p>
          <p style={nrLabel}>{action.rationale}</p>
          <p style={{ ...nrLabel, fontSize: '6px' }}>
            {action.status.toUpperCase()} · {action.target} · CoS {action.chiefOfStaffInitiated ? 'YES' : 'NO'}
          </p>
        </div>
      ))}
      <Link to={adminStudioChiefOfStaffPath()} style={{ ...nrLabel, color: NR.gold, display: 'inline-block', marginTop: 6 }}>
        → OPEN CHIEF OF STAFF
      </Link>
    </section>
  );
}

export function TalentRoutingPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={nrPanel}>
      <p style={nrSectionTitle}>TALENT ROUTING · AUTO-ASSIGNMENT</p>
      {store.talentRouting.map((t) => (
        <div key={t.pageId} className="p-2 mb-1 border" style={{ borderColor: NR.panelBorder }}>
          <p style={{ ...nrLabel, color: NR.accent, fontFamily: '"Futura PT Medium"' }}>{t.pageLabel.toUpperCase()} → {t.recommendedHost.toUpperCase()}</p>
          <p style={nrLabel}>{t.rationale}</p>
          <p style={{ ...nrLabel, fontSize: '6px' }}>{t.confidencePct}% · {t.factors.join(' · ')}</p>
        </div>
      ))}
    </section>
  );
}

export function QualityGatesPanel() {
  return (
    <section className="p-3 mb-3" style={nrPanel}>
      <p style={nrSectionTitle}>QUALITY GATES · DNA VALIDATION</p>
      <p style={nrLabel}>Each stage validates before progression · quality compounds</p>
      {QUALITY_GATE_LAYERS.map((layer) => (
        <p key={layer} style={nrLabel}>· {layer.replace(/-/g, ' ').toUpperCase()}</p>
      ))}
      <Link to={adminStudioLeadershipDnaPath()} style={{ ...nrLabel, color: NR.indigo, display: 'inline-block', marginTop: 6 }}>
        → LEADERSHIP DNA
      </Link>
    </section>
  );
}

export function OperationalDnaPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...nrPanel, borderLeft: `4px solid ${NR.indigo}` }}>
      <p style={nrSectionTitle}>OPERATIONAL DNA · HOW THE COMPANY EXECUTES</p>
      <p style={nrLabel}>Leadership DNA = how founder leads · Operational DNA = how company executes</p>
      {store.operationalDna.map((section) => (
        <div key={section.id} className="mt-2">
          <p style={{ ...nrSectionTitle, fontSize: '8px' }}>{section.title}</p>
          {section.principles.map((pr) => (
            <p key={pr} style={nrLabel}>· {pr}</p>
          ))}
        </div>
      ))}
    </section>
  );
}

export function KnowledgeProductionPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={nrPanel}>
      <p style={nrSectionTitle}>KNOWLEDGE PRODUCTION · COMPLETED PAGES</p>
      <p style={nrLabel}>Every completed page creates institutional knowledge automatically</p>
      {store.knowledgeOutputs.map((ko) => (
        <div key={ko.pageId} className="p-2 mb-1 border" style={{ borderColor: NR.panelBorder }}>
          <p style={{ ...nrLabel, color: NR.green, fontFamily: '"Futura PT Medium"' }}>{ko.pageLabel.toUpperCase()}</p>
          <p style={nrLabel}>{ko.institutionalKnowledge}</p>
          <p style={{ ...nrLabel, fontSize: '6px' }}>KG · {ko.graphNodesCreated.join(' · ')}</p>
          <p style={{ ...nrLabel, fontSize: '6px' }}>TEMPLATES · {ko.templatesGenerated.join(' · ')}</p>
        </div>
      ))}
    </section>
  );
}

export function StrategyAlignmentPanel({ selectedPage }: Pick<Props, 'selectedPage'>) {
  const conn = selectedPage?.strategyConnection;
  return (
    <section className="p-3 mb-3" style={{ ...nrPanel, borderLeft: `4px solid #334155` }}>
      <p style={nrSectionTitle}>STRATEGY ENGINE · PAGE ALIGNMENT</p>
      <p style={nrLabel}>Every page connects to strategy · initiative · campaign · volume · chapter · expected outcome</p>
      {conn ? (
        <>
          <div className="flex justify-between mt-2">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{conn.strategyLabel}</p>
            <span className="text-[5px] font-futura px-1 border" style={{ borderColor: conn.aligned ? NR.green : NR.red, color: conn.aligned ? NR.green : NR.red }}>
              {conn.aligned ? 'ALIGNED' : 'REVIEW'}
            </span>
          </div>
          <p style={{ ...nrLabel, fontSize: '5px' }}>INITIATIVE: {conn.initiativeLabel} · CAMPAIGN: {conn.campaignId}</p>
          <p style={{ ...nrLabel, fontSize: '5px' }}>VOLUME: {conn.volumeId} · CHAPTER: {conn.chapter}</p>
          <p style={{ ...nrLabel, fontSize: '5px', color: NR.accent }}>EXPECTED: {conn.expectedOutcome}</p>
        </>
      ) : (
        <p style={{ ...nrLabel, color: NR.red, marginTop: 4 }}>NO STRATEGY CONNECTION — FLAG FOR CoS REVIEW BEFORE PRODUCTION</p>
      )}
      <Link to={adminStudioStrategyEnginePath()} style={{ ...nrLabel, color: '#334155', fontSize: '6px', display: 'inline-block', marginTop: 6 }}>
        → OPEN STRATEGY ENGINE
      </Link>
      {conn?.campaignId ? (
        <Link to={adminStudioCampaignEnginePath()} style={{ ...nrLabel, color: '#D97706', fontSize: '6px', display: 'inline-block', marginTop: 4, marginLeft: 8 }}>
          → CAMPAIGN · {conn.campaignId.replace(/-/g, ' ').toUpperCase()}
        </Link>
      ) : null}
    </section>
  );
}

export function CrossCompanyNewsroomPanel() {
  return (
    <section className="p-3 mb-3" style={nrPanel}>
      <p style={nrSectionTitle}>CROSS-COMPANY NEWSROOM · FUTURE</p>
      <p style={nrLabel}>Multiple companies · shared production resources · shared talent · unique DNA per company</p>
      <p style={nrLabel}>· Frontal Slayer photography pipeline → ndxbook thumbnails</p>
      <p style={nrLabel}>· Shared Labs experiments · company-specific Operational DNA</p>
      <p style={nrLabel}>· Institutional knowledge transfers across portfolio</p>
    </section>
  );
}
