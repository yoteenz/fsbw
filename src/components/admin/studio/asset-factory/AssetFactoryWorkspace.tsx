import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStudioAssetFactory } from '../../../../hooks/useAdminStudioAssetFactoryState';
import type { BlueprintDefinition } from '../../../../utils/adminStudioBlueprintManagerDemo';
import {
  FACTORY_ACTIVITY_SEED,
  FACTORY_DEPARTMENTS,
  FACTORY_EAD_SUGGESTIONS,
  FACTORY_EXECUTIVE_SEED,
  FACTORY_PERFORMANCE_SEED,
  VARIATION_PRESETS,
  jobStatusColor,
  type AssetFactoryViewMode,
} from '../../../../utils/adminStudioAssetFactoryDemo';
import { ASSET_FACTORY_PROVIDERS, providerStatusColor } from '../../../../utils/adminStudioAssetFactoryProviders';
import { adminStudioAssetDirectorPath, adminStudioBlueprintManagerPath } from '../../../../utils/adminStudioRoutes';
import { AssetFactoryJobInspector, AssetFactoryLiveMap } from './AssetFactoryShared';
import {
  AF_VISUAL,
  ASSET_FACTORY_STYLES,
  afActionBtn,
  afCaption,
  afGrace,
  afPanelStyle,
  afSectionTitle,
} from './assetFactoryTheme';

const VIEW_TABS: Array<{ id: AssetFactoryViewMode; label: string }> = [
  { id: 'executive', label: 'EXECUTIVE' },
  { id: 'floor', label: 'FACTORY FLOOR' },
  { id: 'tour', label: 'FACTORY TOUR' },
];

export function AssetFactoryWorkspace() {
  const navigate = useNavigate();
  const {
    viewMode,
    setViewMode,
    jobs,
    selectedJob,
    selectJob,
    approvedBlueprints,
    activity,
    startManufacturing,
    pauseJob,
    resumeJob,
    cancelJob,
    retryJob,
    reprioritizeJob,
    getPlan,
  } = useAdminStudioAssetFactory();

  const [planBlueprint, setPlanBlueprint] = useState<BlueprintDefinition | null>(null);
  const [selectedVariations, setSelectedVariations] = useState<string[]>([]);

  const runningJob = jobs.find((j) => j.status === 'running') ?? selectedJob;
  const metrics = useMemo(() => {
    const m = { ...FACTORY_EXECUTIVE_SEED };
    m.jobsRunning = jobs.filter((j) => j.status === 'running').length;
    m.jobsWaiting = jobs.filter((j) => j.status === 'queued' || j.status === 'waiting').length;
    m.jobsCompleted = jobs.filter((j) => j.status === 'completed').length + FACTORY_EXECUTIVE_SEED.jobsCompleted;
    return m;
  }, [jobs]);

  const plan = planBlueprint ? getPlan(planBlueprint) : null;

  const approveAndManufacture = (tour = true) => {
    if (!planBlueprint || !plan?.eligible) return;
    startManufacturing(planBlueprint, selectedVariations, tour);
    setPlanBlueprint(null);
  };

  return (
    <div>
      <style>{ASSET_FACTORY_STYLES}</style>

      <div style={{ ...afPanelStyle, padding: '10px', marginBottom: '12px' }}>
        <p style={{ ...afGrace, fontSize: '18px' }}>ASSET FACTORY</p>
        <p style={afCaption}>MANUFACTURING CREATIVE SYSTEMS FROM APPROVED BLUEPRINTS · DEMO SIMULATION</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setViewMode(tab.id)}
              style={{
                ...afActionBtn,
                background: viewMode === tab.id ? AF_VISUAL.glow : '#fff',
                borderColor: viewMode === tab.id ? AF_VISUAL.red : AF_VISUAL.black,
              }}
            >
              {tab.label}
            </button>
          ))}
          <button type="button" onClick={() => navigate(adminStudioBlueprintManagerPath())} style={afActionBtn}>
            BLUEPRINT MANAGER
          </button>
        </div>
      </div>

      {/* Blueprint launch */}
      <section style={{ ...afPanelStyle, padding: '12px', marginBottom: '12px' }}>
        <p style={afSectionTitle}>SELECT BLUEPRINT · MANUFACTURE</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {approvedBlueprints.slice(0, 6).map((bp) => (
            <button
              key={bp.id}
              type="button"
              onClick={() => setPlanBlueprint(bp)}
              style={{
                ...afActionBtn,
                borderColor: planBlueprint?.id === bp.id ? AF_VISUAL.red : AF_VISUAL.black,
              }}
            >
              {bp.identity.name}
            </button>
          ))}
        </div>
        {plan ? (
          <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(0,0,0,0.03)' }}>
            <p style={{ ...afCaption, color: AF_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>GENERATION PLAN · {plan.blueprintName}</p>
            <p style={afCaption}>IMAGES: {plan.requiredImages.length} · VIDEOS: {plan.requiredVideos.length} · VARIANTS: {plan.requiredVariants.join(', ')}</p>
            <p style={afCaption}>EST. {plan.estimatedTimeMin} MIN · {plan.estimatedCredits} CREDITS · {plan.estimatedStorageMb} MB · {plan.estimatedCost}</p>
            <p style={afCaption}>DEPENDENCIES: {plan.dependencies.join(' → ')}</p>
            <p style={{ ...afCaption, color: plan.eligible ? AF_VISUAL.pass : AF_VISUAL.red, marginTop: 6 }}>{plan.eligibilityNote}</p>
            <div className="flex flex-wrap gap-1 mt-2 mb-2">
              {VARIATION_PRESETS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() =>
                    setSelectedVariations((prev) =>
                      prev.includes(v.label) ? prev.filter((x) => x !== v.label) : [...prev, v.label]
                    )
                  }
                  style={{
                    ...afActionBtn,
                    fontSize: '7px',
                    background: selectedVariations.includes(v.label) ? AF_VISUAL.glow : '#fff',
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={!plan.eligible} onClick={() => approveAndManufacture(true)} style={afActionBtn}>
                APPROVE · FACTORY TOUR
              </button>
              <button type="button" disabled={!plan.eligible} onClick={() => approveAndManufacture(false)} style={afActionBtn}>
                APPROVE · FLOOR VIEW
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {viewMode === 'executive' && (
        <ExecutiveView metrics={metrics} jobs={jobs} activity={activity} onSelectJob={selectJob} />
      )}

      {viewMode === 'floor' && (
        <FloorView
          jobs={jobs}
          runningJob={runningJob}
          onSelectJob={selectJob}
          onReprioritize={reprioritizeJob}
        />
      )}

      {viewMode === 'tour' && <TourView runningJob={runningJob} />}

      {selectedJob ? (
        <AssetFactoryJobInspector
          job={selectedJob}
          onPause={() => pauseJob(selectedJob.id)}
          onResume={() => resumeJob(selectedJob.id)}
          onRetry={() => retryJob(selectedJob.id)}
          onCancel={() => cancelJob(selectedJob.id)}
        />
      ) : null}

      {runningJob?.status === 'completed' ? (
        <div style={{ ...afPanelStyle, padding: '12px', marginTop: '12px' }}>
          <p style={{ ...afGrace, fontSize: '16px', color: AF_VISUAL.pass }}>PRODUCTION COMPLETE</p>
          <p style={afCaption}>AUTO-POPULATED: ASSET DIRECTOR · MISSION CONTROL · EXECUTIVE AI DIRECTOR · VERSION {runningJob.version}</p>
          <button type="button" onClick={() => navigate(adminStudioAssetDirectorPath())} style={{ ...afActionBtn, marginTop: 8 }}>
            OPEN ASSET DIRECTOR
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ExecutiveView({
  metrics,
  jobs,
  activity,
  onSelectJob,
}: {
  metrics: typeof FACTORY_EXECUTIVE_SEED;
  jobs: ReturnType<typeof useAdminStudioAssetFactory>['jobs'];
  activity: typeof FACTORY_ACTIVITY_SEED;
  onSelectJob: (id: string) => void;
}) {
  const perf = FACTORY_PERFORMANCE_SEED;
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-3">
        {[
          { l: 'FACTORY HEALTH', v: `${metrics.factoryHealth}%` },
          { l: 'RUNNING', v: metrics.jobsRunning },
          { l: 'WAITING', v: metrics.jobsWaiting },
          { l: 'COMPLETED', v: metrics.jobsCompleted },
          { l: 'CREDITS', v: metrics.creditsUsed },
          { l: 'EST. COST', v: metrics.estimatedCost },
          { l: 'QUEUE HEALTH', v: `${metrics.queueHealth}%` },
          { l: 'UTILIZATION', v: `${metrics.factoryUtilization}%` },
        ].map((s) => (
          <div key={s.l} style={{ ...afPanelStyle, padding: '10px', textAlign: 'center' }}>
            <p style={{ ...afGrace, fontSize: '16px', color: AF_VISUAL.red }}>{s.v}</p>
            <p style={{ ...afCaption, fontSize: '7px' }}>{s.l}</p>
          </div>
        ))}
      </div>

      <section style={{ ...afPanelStyle, padding: '12px', marginBottom: '12px' }}>
        <p style={afSectionTitle}>PROVIDER STATUS</p>
        {ASSET_FACTORY_PROVIDERS.map((p) => (
          <div key={p.id} className="flex justify-between py-1" style={{ borderBottom: '1px solid #eee' }}>
            <span style={{ ...afCaption, color: AF_VISUAL.black }}>{p.label}</span>
            <span style={{ ...afCaption, color: providerStatusColor(p.status) }}>{p.status.toUpperCase()}</span>
          </div>
        ))}
      </section>

      <section style={{ ...afPanelStyle, padding: '12px', marginBottom: '12px' }}>
        <p style={afSectionTitle}>QUEUE</p>
        {jobs.length === 0 ? <p style={afCaption}>NO JOBS — SELECT A BLUEPRINT TO MANUFACTURE</p> : null}
        {jobs.map((j) => (
          <button
            key={j.id}
            type="button"
            onClick={() => onSelectJob(j.id)}
            className="w-full text-left py-2"
            style={{ border: 'none', borderBottom: '1px solid #eee', background: 'transparent', cursor: 'pointer' }}
          >
            <p style={{ ...afCaption, color: AF_VISUAL.black }}>{j.blueprintName}</p>
            <p style={{ ...afCaption, color: jobStatusColor(j.status) }}>{j.status.toUpperCase()} · {j.progressPct}% · P{j.priority}</p>
          </button>
        ))}
      </section>

      <section style={{ ...afPanelStyle, padding: '12px', marginBottom: '12px' }}>
        <p style={afSectionTitle}>PERFORMANCE</p>
        <p style={afCaption}>AVG TIME {perf.avgGenerationTime} · QA {perf.avgQaScore}% · SUCCESS {perf.providerSuccessRate}%</p>
        <p style={afCaption}>MANUFACTURED {perf.assetsManufactured} · IMG {perf.imagesGenerated} · VID {perf.videosGenerated}</p>
      </section>

      <section style={{ ...afPanelStyle, padding: '12px' }}>
        <p style={afSectionTitle}>EXECUTIVE AI DIRECTOR · FACTORY</p>
        {FACTORY_EAD_SUGGESTIONS.slice(0, 3).map((s) => (
          <p key={s.id} style={{ ...afCaption, color: AF_VISUAL.black, marginBottom: 4 }}>• {s.title}</p>
        ))}
      </section>

      <footer style={{ ...afPanelStyle, padding: '10px', marginTop: '12px' }}>
        <p style={afSectionTitle}>LIVE ACTIVITY</p>
        <div className="flex gap-3 overflow-x-auto">
          {activity.slice(0, 8).map((a) => (
            <div key={a.id} className="flex-shrink-0 min-w-[160px]" style={{ borderLeft: `2px solid ${AF_VISUAL.red}`, paddingLeft: 8 }}>
              <p style={{ ...afCaption, color: AF_VISUAL.black, fontSize: '8px' }}>{a.text}</p>
              <p style={{ ...afCaption, fontSize: '7px' }}>{a.time}</p>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

function FloorView({
  jobs,
  runningJob,
  onSelectJob,
  onReprioritize,
}: {
  jobs: ReturnType<typeof useAdminStudioAssetFactory>['jobs'];
  runningJob: ReturnType<typeof useAdminStudioAssetFactory>['selectedJob'];
  onSelectJob: (id: string) => void;
  onReprioritize: (id: string, delta: number) => void;
}) {
  const activeId = runningJob?.currentDepartmentId ?? null;
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <section style={{ ...afPanelStyle, padding: '12px' }}>
        <p style={afSectionTitle}>LIVE FACTORY MAP</p>
        <AssetFactoryLiveMap activeDepartmentId={activeId} />
      </section>
      <section style={{ ...afPanelStyle, padding: '12px' }}>
        <p style={afSectionTitle}>DEPARTMENTS · OPERATIONS</p>
        {FACTORY_DEPARTMENTS.map((dept) => {
          const active = dept.id === activeId;
          const job = runningJob;
          return (
            <div
              key={dept.id}
              className={active ? 'af-dept-active' : ''}
              style={{
                ...(active ? { background: AF_VISUAL.glow, border: `2px solid ${AF_VISUAL.red}` } : {}),
                padding: '8px',
                marginBottom: '6px',
                border: active ? undefined : AF_VISUAL.border,
              }}
            >
              <p style={{ ...afCaption, color: active ? AF_VISUAL.red : AF_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>{dept.label}</p>
              <p style={afCaption}>{dept.role}</p>
              {active && job ? (
                <p style={{ ...afCaption, fontSize: '7px' }}>JOB: {job.blueprintName} · {job.progressPct}%</p>
              ) : (
                <p style={{ ...afCaption, fontSize: '7px' }}>IDLE</p>
              )}
            </div>
          );
        })}
      </section>
      <section style={{ ...afPanelStyle, padding: '12px', gridColumn: '1 / -1' }}>
        <p style={afSectionTitle}>QUEUE MANAGER</p>
        {jobs.map((j) => (
          <div key={j.id} className="flex items-center gap-2 py-2" style={{ borderBottom: '1px solid #eee' }}>
            <button type="button" onClick={() => onSelectJob(j.id)} style={{ ...afActionBtn, flex: 1, textAlign: 'left' }}>
              {j.blueprintName} · {j.status}
            </button>
            <button type="button" onClick={() => onReprioritize(j.id, 1)} style={afActionBtn}>↑</button>
            <button type="button" onClick={() => onReprioritize(j.id, -1)} style={afActionBtn}>↓</button>
          </div>
        ))}
      </section>
    </div>
  );
}

function TourView({ runningJob }: { runningJob: ReturnType<typeof useAdminStudioAssetFactory>['selectedJob'] }) {
  const activeIdx = runningJob?.departmentIndex ?? -1;

  if (!runningJob) {
    return (
      <section style={{ ...afPanelStyle, padding: '24px', textAlign: 'center' }}>
        <p style={{ ...afGrace, fontSize: '20px' }}>FACTORY TOUR</p>
        <p style={afCaption}>SELECT A BLUEPRINT · APPROVE · WATCH THE FACILITY MANUFACTURE</p>
      </section>
    );
  }

  const dept = runningJob.currentDepartmentId
    ? FACTORY_DEPARTMENTS.find((d) => d.id === runningJob.currentDepartmentId)
    : null;

  return (
    <section style={{ ...afPanelStyle, padding: '16px', minHeight: '280px' }}>
      <p style={{ ...afGrace, fontSize: '22px' }}>{runningJob.blueprintName}</p>
      <p style={afCaption}>FACTORY TOUR · {runningJob.progressPct}% COMPLETE</p>
      <div className="mt-6 mb-4 h-2 w-full" style={{ background: '#eee' }}>
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${runningJob.progressPct}%`, background: `linear-gradient(90deg, ${AF_VISUAL.red}, #C41E3A)` }}
        />
      </div>
      {dept ? (
        <div className="af-tour-line text-center py-8">
          <p style={{ ...afCaption, color: AF_VISUAL.red, fontSize: '10px' }}>{dept.label}</p>
          <p style={{ ...afGrace, fontSize: '28px', marginTop: '12px' }}>{dept.tourMessage}</p>
        </div>
      ) : runningJob.status === 'completed' ? (
        <p style={{ ...afGrace, fontSize: '28px', textAlign: 'center', color: AF_VISUAL.pass, marginTop: '24px' }}>
          PRODUCTION COMPLETE.
        </p>
      ) : (
        <p style={{ ...afGrace, fontSize: '18px', textAlign: 'center', marginTop: '24px' }}>INITIALIZING…</p>
      )}
      <div className="mt-8 space-y-2">
        {FACTORY_DEPARTMENTS.map((d, i) => (
          <p
            key={d.id}
            style={{
              ...afCaption,
              color: i <= activeIdx ? (i === activeIdx ? AF_VISUAL.red : AF_VISUAL.pass) : AF_VISUAL.gray,
              fontFamily: i === activeIdx ? '"Futura PT Medium"' : '"Futura PT Book"',
            }}
          >
            {i < activeIdx ? '✓' : i === activeIdx ? '→' : '○'} {d.label}
          </p>
        ))}
      </div>
    </section>
  );
}
