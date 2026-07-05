import { Link } from 'react-router-dom';
import type { WorkActivity, WorkOrchestrationStore, WorkPackage } from '../../../../studio-os-core/work-orchestration/types';
import type { WorkOrchestrationWorkspaceId, TimelineZoom } from '../../../../studio-os-core/work-orchestration/types';
import { COS_ORCHESTRATION_RESPONSIBILITIES, WORK_CONNECTED_SYSTEMS, DNA_ACTIVITY_LAYERS } from '../../../../studio-os-core/work-orchestration/constants';
import {
  adminStudioCampaignEnginePath,
  adminStudioChiefOfStaffPath,
  adminStudioStrategyEnginePath,
  adminStudioDistributionEnginePath,
} from '../../../../utils/adminStudioRoutes';
import {
  WORK_ORCHESTRATION_STYLES,
  WO,
  healthColor,
  woDarkHeader,
  woLabel,
  woLiveDot,
  woPanel,
  woSectionTitle,
  woValue,
} from './workOrchestrationTheme';

type Props = {
  store: WorkOrchestrationStore;
  selectedPackage: WorkPackage | null;
  workspacePackages: WorkPackage[];
  packageActivities: WorkActivity[];
  onSelectWorkspace: (id: WorkOrchestrationWorkspaceId) => void;
  onSelectPackage: (id: string) => void;
  onSetTimelineZoom: (zoom: TimelineZoom) => void;
};

export function WorkOrchestrationHeader() {
  return (
    <>
      <style>{WORK_ORCHESTRATION_STYLES}</style>
      <header className="p-3 mb-3" style={{ ...woDarkHeader, borderTop: `3px solid ${WO.cyan}` }}>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: 0 }}>
          WORK ORCHESTRATION
        </p>
        <p style={{ ...woLabel, color: '#94A3B8' }}>
          <span style={woLiveDot} />
          FOUNDERS LEAD OUTCOMES · THE ORGANIZATION ORCHESTRATES WORK
        </p>
        <p style={{ ...woLabel, color: '#CBD5E1', marginTop: 4 }}>
          TASKS ARE IMPLEMENTATION DETAILS · WORK GENERATED FROM STRATEGY · CAMPAIGNS · NEWSROOM · DECISIONS
        </p>
      </header>
    </>
  );
}

export function OrchestrationDashboardPanel({ store }: Pick<Props, 'store'>) {
  const d = store.dashboard;
  return (
    <section className="p-3 mb-3" style={woPanel}>
      <p style={woSectionTitle}>WORK ORCHESTRATION · EXECUTION HQ</p>
      <p style={{ ...woLabel, color: WO.cyan, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{d.summary}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-3">
        {[
          ['WORK PACKAGES', d.activeWorkPackages],
          ['ACTIVITIES', d.totalActivities],
          ['BLOCKED', d.blockedActivities],
          ['AUTOMATED', d.automatedActivities],
          ['FOUNDER LOAD', `${d.founderWorkloadMins}m`],
          ['OPS HEALTH', `${d.operationalHealthPct}%`],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: WO.panelBorder }}>
            <p style={{ ...woValue, fontSize: '12px' }}>{val}</p>
            <p style={woLabel}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function WorkHierarchyPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={woPanel}>
      <p style={woSectionTitle}>WORK HIERARCHY · NOT TASK MANAGEMENT</p>
      <div className="flex flex-col items-center gap-0">
        {store.hierarchyLevels.map((level, i) => (
          <div key={level.level} className="w-full flex flex-col items-center">
            {i > 0 ? <div className="w-px h-2" style={{ background: WO.cyan }} /> : null}
            <div
              className="w-full px-2 py-1 text-[7px] font-futura text-center border"
              style={{
                borderColor: level.level === 'work-package' ? WO.cyan : WO.panelBorder,
                background: level.level === 'work-package' ? 'rgba(8,145,178,0.06)' : 'white',
                fontWeight: 515,
              }}
            >
              {level.label}
              <p style={{ ...woLabel, fontSize: '5px', margin: '2px 0 0' }}>{level.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function WorkPackagesPanel({ workspacePackages, store, onSelectPackage }: Pick<Props, 'workspacePackages' | 'store' | 'onSelectPackage'>) {
  return (
    <section className="p-3 mb-3" style={woPanel}>
      <p style={woSectionTitle}>WORK PACKAGES · NOT 42 TASKS</p>
      {workspacePackages.map((pkg) => (
        <button
          key={pkg.id}
          type="button"
          onClick={() => onSelectPackage(pkg.id)}
          className="w-full text-left p-2 mb-2 border"
          style={{
            borderColor: store.selectedWorkPackageId === pkg.id ? WO.cyan : WO.panelBorder,
            background: store.selectedWorkPackageId === pkg.id ? 'rgba(8,145,178,0.04)' : 'white',
          }}
        >
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{pkg.name}</p>
            <span style={{ fontSize: '8px', color: healthColor(pkg.healthPct) }}>{pkg.healthPct}%</span>
          </div>
          <p style={{ ...woLabel, fontSize: '5px' }}>
            {pkg.activityCount} ACTIVITIES · {pkg.deliverableCount} DELIVERABLES · {pkg.departmentCount} DEPTS
          </p>
          <p style={{ ...woLabel, fontSize: '5px' }}>{pkg.campaignLabel} · ETA {pkg.estimatedCompletion}</p>
        </button>
      ))}
    </section>
  );
}

export function IntelligentWorkGenerationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={woPanel}>
      <p style={woSectionTitle}>INTELLIGENT WORK GENERATION</p>
      {store.generationTemplates.map((t) => (
        <div key={t.id} className="p-2 mb-2 border" style={{ borderColor: WO.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515, color: WO.cyan }}>{t.trigger.toUpperCase()}</p>
          <p style={{ ...woLabel, fontSize: '5px' }}>{t.generatedActivities.join(' · ')}</p>
        </div>
      ))}
    </section>
  );
}

export function CosOrchestrationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={{ ...woPanel, borderLeft: '4px solid #CA8A04' }}>
      <p style={woSectionTitle}>CHIEF OF STAFF · OWNS EXECUTION</p>
      {COS_ORCHESTRATION_RESPONSIBILITIES.map((r) => (
        <p key={r} style={{ ...woLabel, fontSize: '6px' }}>· {r}</p>
      ))}
      <div className="mt-2">
        {store.cosActions.map((a) => (
          <div key={a.id} className="py-1 border-b" style={{ borderColor: WO.panelBorder }}>
            <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{a.action}</p>
            <p style={{ ...woLabel, fontSize: '5px' }}>{a.reason} · {a.status.toUpperCase()}</p>
          </div>
        ))}
      </div>
      <Link to={adminStudioChiefOfStaffPath()} style={{ ...woLabel, color: '#CA8A04', fontSize: '6px', display: 'inline-block', marginTop: 6 }}>
        → OPEN CHIEF OF STAFF
      </Link>
    </section>
  );
}

export function FounderWorkspacePanel({ store }: Pick<Props, 'store'>) {
  const f = store.founderWorkspace;
  return (
    <section className="p-3 mb-3" style={{ ...woPanel, borderLeft: `4px solid ${WO.cyan}` }}>
      <p style={woSectionTitle}>FOUNDER WORKSPACE · NOT A TASK LIST</p>
      <p style={{ ...woValue, fontSize: '12px' }}>{f.briefingSummary}</p>
      <p style={{ ...woLabel, marginTop: 4 }}>ESTIMATED FOUNDER WORKLOAD: {f.estimatedFounderWorkloadMins} MIN</p>
      <div className="mt-2">
        <p style={{ ...woSectionTitle, fontSize: '7px' }}>ORGANIZATIONAL PRIORITIES</p>
        {f.organizationalPriorities.map((p, i) => (
          <p key={i} style={{ ...woLabel, fontSize: '6px', color: WO.cyan }}>→ {p}</p>
        ))}
      </div>
      {f.strategicApprovals.length > 0 ? (
        <div className="mt-2">
          <p style={{ ...woSectionTitle, fontSize: '7px' }}>STRATEGIC APPROVALS</p>
          {f.strategicApprovals.map((a, i) => (
            <p key={i} style={{ ...woLabel, fontSize: '6px', color: WO.gold }}>⚑ {a}</p>
          ))}
        </div>
      ) : null}
      {f.leadershipRequired.length > 0 && !f.leadershipRequired[0]?.startsWith('None') ? (
        <div className="mt-2">
          <p style={{ ...woSectionTitle, fontSize: '7px' }}>LEADERSHIP REQUIRED</p>
          {f.leadershipRequired.map((l, i) => (
            <p key={i} style={{ ...woLabel, fontSize: '6px' }}>{l}</p>
          ))}
        </div>
      ) : (
        <p style={{ ...woLabel, fontSize: '6px', color: WO.green, marginTop: 4 }}>✓ NO LEADERSHIP ITEMS TODAY · ATTENTION PROTECTED</p>
      )}
    </section>
  );
}

export function DependencyEnginePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={woPanel}>
      <p style={woSectionTitle}>DEPENDENCY ENGINE</p>
      {store.dependencies.map((dep) => (
        <div key={dep.id} className="flex items-center gap-1 py-1 border-b" style={{ borderColor: WO.panelBorder }}>
          <span className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{dep.fromLabel}</span>
          <span style={{ color: WO.cyan, fontSize: '8px' }}>→</span>
          <span className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{dep.toLabel}</span>
          <span
            className="ml-auto text-[5px] font-futura px-1 border"
            style={{ borderColor: dep.blocker ? WO.red : WO.panelBorder, color: dep.blocker ? WO.red : WO.gray }}
          >
            {dep.status.toUpperCase()}
          </span>
        </div>
      ))}
    </section>
  );
}

export function CapacityIntelligencePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={woPanel}>
      <p style={woSectionTitle}>CAPACITY INTELLIGENCE</p>
      {store.departmentCapacity.map((dept) => (
        <div key={dept.department} className="p-2 mb-1 border" style={{ borderColor: dept.status === 'overloaded' ? WO.red : WO.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{dept.department.toUpperCase()}</p>
            <span className="text-[5px] font-futura" style={{ color: dept.status === 'overloaded' ? WO.red : dept.status === 'idle' ? WO.gray : WO.green }}>
              {dept.status.toUpperCase()}
            </span>
          </div>
          <div className="flex gap-2 mt-1">
            <span style={{ ...woLabel, fontSize: '5px' }}>LOAD {dept.workloadPct}%</span>
            <span style={{ ...woLabel, fontSize: '5px' }}>AVAIL {dept.availablePct}%</span>
            <span style={{ ...woLabel, fontSize: '5px' }}>ETA {dept.estimatedCompletion}</span>
          </div>
          {dept.conflict ? <p style={{ ...woLabel, fontSize: '5px', color: WO.red }}>⚠ {dept.conflict}</p> : null}
        </div>
      ))}
    </section>
  );
}

export function ExecutiveQueuePanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={woPanel}>
      <p style={woSectionTitle}>ORGANIZATIONAL QUEUE · EXECUTIVE PRIORITIES</p>
      {store.executiveQueues.map((q) => (
        <div key={q.executiveId} className="p-2 mb-1 border" style={{ borderColor: WO.panelBorder }}>
          <p className="text-[7px] font-futura" style={{ fontWeight: 515 }}>{q.executiveTitle.toUpperCase()}</p>
          <p style={{ ...woLabel, fontSize: '5px' }}>TODAY: {q.todayPriorities[0]}</p>
          <p style={{ ...woLabel, fontSize: '5px' }}>ETA {q.estimatedCompletion} · {q.confidencePct}% CONF</p>
        </div>
      ))}
    </section>
  );
}

export function ActivitiesPanel({ packageActivities }: Pick<Props, 'packageActivities'>) {
  return (
    <section className="p-3 mb-3" style={woPanel}>
      <p style={woSectionTitle}>ACTIVITIES · SMALLEST EXECUTABLE UNIT</p>
      <p style={woLabel}>Founders rarely interact with activities directly · DNA layers inherited automatically</p>
      {packageActivities.map((act) => (
        <div key={act.id} className="py-1 border-b" style={{ borderColor: WO.panelBorder }}>
          <div className="flex justify-between">
            <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{act.title}</p>
            <span className="text-[5px] font-futura" style={{ color: act.status === 'blocked' ? WO.red : act.automated ? WO.cyan : WO.gray }}>
              {act.status.toUpperCase()}
            </span>
          </div>
          <p style={{ ...woLabel, fontSize: '5px' }}>{act.department} · {act.assignedTo}{act.automated ? ' · AUTO' : ''}</p>
          {act.blockerReason ? <p style={{ ...woLabel, fontSize: '5px', color: WO.red }}>BLOCKER: {act.blockerReason}</p> : null}
        </div>
      ))}
      <div className="flex flex-wrap gap-1 mt-2">
        {DNA_ACTIVITY_LAYERS.map((d) => (
          <span key={d} className="text-[4px] font-futura px-1 border" style={{ borderColor: WO.panelBorder }}>{d}</span>
        ))}
      </div>
    </section>
  );
}

export function DynamicPrioritizationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={woPanel}>
      <p style={woSectionTitle}>DYNAMIC PRIORITIZATION</p>
      {store.priorityAdjustments.map((pa) => (
        <div key={pa.id} className="py-1 border-b" style={{ borderColor: WO.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: WO.cyan }}>{pa.source.replace(/-/g, ' ').toUpperCase()}</p>
          <p style={{ ...woLabel, fontSize: '5px' }}>{pa.adjustment}</p>
        </div>
      ))}
    </section>
  );
}

export function TimelineEnginePanel({ store, onSetTimelineZoom }: Pick<Props, 'store' | 'onSetTimelineZoom'>) {
  const zooms: TimelineZoom[] = ['day', 'week', 'month', 'quarter', 'year'];
  return (
    <section className="p-3 mb-3" style={woPanel}>
      <p style={woSectionTitle}>TIMELINE ENGINE</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {zooms.map((z) => (
          <button
            key={z}
            type="button"
            onClick={() => onSetTimelineZoom(z)}
            className="px-2 py-0.5 text-[5px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: store.timelineZoom === z ? WO.cyan : WO.panelBorder,
              background: store.timelineZoom === z ? 'rgba(8,145,178,0.08)' : 'white',
              color: store.timelineZoom === z ? WO.cyan : WO.gray,
            }}
          >
            {z.toUpperCase()}
          </button>
        ))}
      </div>
      {store.timeline.map((entry) => (
        <div key={entry.id} className="pl-2 mb-1 border-l-2" style={{ borderColor: WO.cyan }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{entry.label}</p>
          <p style={{ ...woLabel, fontSize: '5px' }}>{entry.type.toUpperCase()}{entry.department ? ` · ${entry.department}` : ''}</p>
        </div>
      ))}
    </section>
  );
}

export function OperationalHealthPanel({ store }: Pick<Props, 'store'>) {
  const h = store.operationalHealth;
  const dims: [string, number][] = [
    ['VELOCITY', h.executionVelocity],
    ['EFFICIENCY', h.organizationalEfficiency],
    ['DEPT HEALTH', h.departmentHealth],
    ['UTILIZATION', h.resourceUtilization],
    ['BOTTLENECKS', 100 - h.bottleneckScore],
    ['CONFIDENCE', h.executionConfidence],
    ['DELIVERY RISK', 100 - h.deliveryRisk],
  ];
  return (
    <section className="p-3 mb-3" style={woPanel}>
      <p style={woSectionTitle}>OPERATIONAL HEALTH · {h.overallPct}%</p>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
        {dims.map(([label, val]) => (
          <div key={label} className="p-1 text-center border" style={{ borderColor: WO.panelBorder }}>
            <p style={{ fontSize: '10px', fontFamily: '"Covered By Your Grace", sans-serif', color: healthColor(val) }}>{val}</p>
            <p style={{ ...woLabel, fontSize: '4px' }}>{label}</p>
          </div>
        ))}
      </div>
      {h.recommendations.map((r, i) => (
        <p key={i} style={{ ...woLabel, fontSize: '6px', color: WO.cyan, marginTop: 4 }}>→ {r}</p>
      ))}
    </section>
  );
}

export function KnowledgeIntegrationPanel({ store }: Pick<Props, 'store'>) {
  return (
    <section className="p-3 mb-3" style={woPanel}>
      <p style={woSectionTitle}>KNOWLEDGE INTEGRATION · EVERY COMPLETION LEARNS</p>
      {store.knowledgeContributions.map((kc) => (
        <div key={kc.id} className="py-1 border-b" style={{ borderColor: WO.panelBorder }}>
          <p className="text-[6px] font-futura" style={{ fontWeight: 515 }}>{kc.title}</p>
          <p style={{ ...woLabel, fontSize: '5px' }}>{kc.type.replace(/-/g, ' ').toUpperCase()} · {kc.detail}</p>
        </div>
      ))}
    </section>
  );
}

export function ConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={woPanel}>
      <p style={woSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1">
        {WORK_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: WO.panelBorder }}>{sys}</span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...woLabel, color: '#0F172A', fontSize: '6px' }}>→ CHIEF OF STAFF</Link>
        <Link to={adminStudioStrategyEnginePath()} style={{ ...woLabel, color: '#334155', fontSize: '6px' }}>→ STRATEGY ENGINE</Link>
        <Link to={adminStudioCampaignEnginePath()} style={{ ...woLabel, color: '#D97706', fontSize: '6px' }}>→ CAMPAIGN ENGINE</Link>
        <Link to={adminStudioDistributionEnginePath()} style={{ ...woLabel, color: '#7C3AED', fontSize: '6px' }}>→ DISTRIBUTION ENGINE</Link>
      </div>
    </section>
  );
}
