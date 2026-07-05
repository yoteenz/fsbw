import { Link } from 'react-router-dom';
import { StudioLivingIndicator } from '../immersion/StudioLivingIndicator';
import { RENDER_PIPELINE_STAGES, RENDER_QUEUE_CONNECTED_SYSTEMS } from '../../../../studio-os-core/render-queue/constants';
import { getStageIndex } from '../../../../studio-os-core/render-queue/store';
import type { RenderIntelligenceAlert, RenderJob, RenderQueueStore } from '../../../../studio-os-core/render-queue/types';
import {
  adminStudioChiefOfStaffPath,
  adminStudioMissionControlPath,
  adminStudioPath,
  adminStudioProductionStudioPath,
  adminStudioPublishingQueuePath,
  adminStudioRenderQueuePath,
  adminStudioScreeningRoomPath,
  adminStudioStudioIntelligencePath,
  adminStudioTalentNetworkPath,
} from '../../../../utils/adminStudioRoutes';
import {
  RQ_ANIMATION_CSS,
  RQ_VISUAL,
  formatElapsed,
  formatEta,
  rqGrace,
  rqLabel,
  rqPanelStyle,
  rqSectionTitle,
  rqValue,
} from './renderQueueTheme';

type Props = {
  store: RenderQueueStore;
  selectedRender: RenderJob | null;
  activeRenders: RenderJob[];
  onSelectRender: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSetPriority: (id: string, high: boolean) => void;
  batchMode: boolean;
  onToggleBatchMode: (v: boolean) => void;
  onToggleBatchSelect: (id: string) => void;
  onRunBatch: () => void;
};

function ProgressBar({ job }: { job: RenderJob }) {
  const active = job.controlState === 'running' && job.stage !== 'ready-for-review' && job.stage !== 'queued';
  return (
    <div className="h-1.5 w-full border overflow-hidden mt-2" style={{ borderColor: 'rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.5)' }}>
      <div
        className={active ? 'rq-progress-active h-full transition-all duration-700 ease-out' : 'h-full transition-all duration-700'}
        style={{
          width: `${job.progressPct}%`,
          background: active ? undefined : job.controlState === 'paused' ? RQ_VISUAL.paused : RQ_VISUAL.success,
        }}
      />
    </div>
  );
}

export function RenderQueueHeader({ store }: { store: RenderQueueStore }) {
  return (
    <header
      className="p-3 mb-3 relative overflow-hidden rq-ambient studio-glass-sheen studio-living-panel"
      style={{
        ...rqPanelStyle,
        backgroundImage: `${RQ_VISUAL.ambient}, ${RQ_VISUAL.marble}`,
        backgroundSize: 'cover, cover',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="rq-live-pulse inline-block w-2 h-2 rounded-full" style={{ background: RQ_VISUAL.pulse }} />
        <p style={rqSectionTitle}>
          <StudioLivingIndicator label="PROCESSING" state="busy" />
          {' · '}
          RENDER QUEUE · PRODUCTION FLOOR HEARTBEAT · V1.0
        </p>
      </div>
      <p style={{ ...rqGrace, fontSize: '18px' }}>{store.companyName}</p>
      <p style={{ ...rqValue, color: '#808080', fontSize: '7px' }}>{store.dashboard.summary}</p>
      <div className="grid grid-cols-3 gap-2 mt-3 sm:grid-cols-6">
        {[
          { label: 'ACTIVE', value: store.dashboard.activeRenders },
          { label: 'PAUSED', value: store.dashboard.pausedRenders },
          { label: 'QUEUED', value: store.dashboard.queuedCount },
          { label: 'REVIEW', value: store.dashboard.readyForReview },
          { label: 'CONFIDENCE', value: `${store.dashboard.avgConfidencePct}%` },
          { label: 'FLOOR ACTIVITY', value: `${store.dashboard.floorActivityPct}%` },
        ].map((m) => (
          <div key={m.label} className="p-2 border text-center" style={{ borderColor: 'rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.5)' }}>
            <p style={rqLabel}>{m.label}</p>
            <p style={{ ...rqGrace, fontSize: '16px' }}>{m.value}</p>
          </div>
        ))}
      </div>
      <div className="rq-activity-row flex gap-1 mt-3 justify-center">
        <span className="inline-block w-1 h-1 rounded-full" style={{ background: RQ_VISUAL.accent }} />
        <span className="inline-block w-1 h-1 rounded-full" style={{ background: RQ_VISUAL.accent }} />
        <span className="inline-block w-1 h-1 rounded-full" style={{ background: RQ_VISUAL.accent }} />
      </div>
    </header>
  );
}

export function RenderPipelineStrip({ job }: { job: RenderJob | null }) {
  if (!job) return null;
  const currentIdx = getStageIndex(job.stage);
  return (
    <div className="p-3 mb-3 overflow-x-auto" style={rqPanelStyle}>
      <p style={rqSectionTitle}>VISIBLE PRODUCTION PIPELINE</p>
      <div className="flex gap-1 min-w-max">
        {RENDER_PIPELINE_STAGES.map((stage, i) => {
          const done = i < currentIdx;
          const current = i === currentIdx;
          return (
            <div key={stage.id} className="flex flex-col items-center" style={{ minWidth: 64 }}>
              <div
                className={current && job.controlState === 'running' ? 'rq-live-pulse' : ''}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: done ? RQ_VISUAL.success : current ? RQ_VISUAL.accent : '#CBD5E1',
                  boxShadow: current ? `0 0 10px ${RQ_VISUAL.accentSoft}` : undefined,
                }}
              />
              <p style={{ ...rqLabel, fontSize: '5px', marginTop: 4, textAlign: 'center', color: current ? RQ_VISUAL.accent : '#808080', maxWidth: 60 }}>
                {stage.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RenderJobList({
  store,
  activeRenders,
  selectedRender,
  batchMode,
  onSelectRender,
  onToggleBatchSelect,
}: Pick<Props, 'store' | 'activeRenders' | 'selectedRender' | 'batchMode' | 'onSelectRender' | 'onToggleBatchSelect'>) {
  return (
    <aside className="p-3 h-full flex flex-col overflow-hidden" style={rqPanelStyle}>
      <p style={rqSectionTitle}>CENTRALIZED QUEUE</p>
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
        {activeRenders.map((job) => {
          const selected = selectedRender?.id === job.id;
          return (
            <div
              key={job.id}
              className="p-2 border cursor-pointer transition-all duration-300"
              style={{
                borderColor: selected ? RQ_VISUAL.accent : 'rgba(0,0,0,0.08)',
                background: selected ? RQ_VISUAL.accentSoft : 'rgba(255,255,255,0.55)',
              }}
              onClick={() => onSelectRender(job.id)}
              onKeyDown={(e) => e.key === 'Enter' && onSelectRender(job.id)}
              role="button"
              tabIndex={0}
            >
              {batchMode && (
                <input
                  type="checkbox"
                  checked={store.selectedBatchIds.includes(job.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleBatchSelect(job.id);
                  }}
                  className="mb-1"
                />
              )}
              <div className="flex justify-between gap-1">
                <p style={{ ...rqValue, fontFamily: '"Futura PT Medium"', fontSize: '7px' }}>{job.productionTitle}</p>
                {job.priority === 'high' && (
                  <span style={{ ...rqLabel, color: RQ_VISUAL.accent, fontSize: '5px' }}>PRIORITY</span>
                )}
              </div>
              <p style={{ ...rqLabel, marginTop: 2 }}>
                {RENDER_PIPELINE_STAGES.find((s) => s.id === job.stage)?.label} · {job.progressPct}%
              </p>
              <ProgressBar job={job} />
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export function RenderJobDetail({
  job,
  onPause,
  onResume,
  onCancel,
  onDuplicate,
  onSetPriority,
}: Pick<Props, 'selectedRender' | 'onPause' | 'onResume' | 'onCancel' | 'onDuplicate' | 'onSetPriority'> & { job: RenderJob }) {
  const btnStyle = {
    fontFamily: '"Futura PT Medium"',
    fontSize: '6px',
    textTransform: 'uppercase' as const,
    padding: '5px 8px',
    border: RQ_VISUAL.border,
    background: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
  };

  return (
    <main className="p-3 h-full overflow-y-auto" style={{ ...rqPanelStyle, background: RQ_VISUAL.glassDeep }}>
      <p style={rqSectionTitle}>CURRENT RENDER</p>
      <p style={{ ...rqGrace, fontSize: '16px' }}>{job.productionTitle}</p>
      <p style={{ ...rqLabel, marginTop: 4 }}>{job.pageRoute}</p>

      <div className="grid grid-cols-2 gap-2 mt-3 sm:grid-cols-3">
        {[
          { label: 'PROGRESS', value: `${job.progressPct}%` },
          { label: 'ELAPSED', value: formatElapsed(job.elapsedSec) },
          { label: 'EST. COMPLETION', value: formatEta(job.estimatedCompletionSec) },
          { label: 'AI WORKER', value: job.aiWorker },
          { label: 'CONFIDENCE', value: `${job.confidencePct}%` },
          { label: 'STATE', value: job.controlState.toUpperCase() },
        ].map((m) => (
          <div key={m.label} className="p-2 border" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <p style={rqLabel}>{m.label}</p>
            <p style={{ ...rqValue, fontSize: '7px', marginTop: 2 }}>{m.value}</p>
          </div>
        ))}
      </div>

      <ProgressBar job={job} />

      {job.warnings.length > 0 && (
        <div className="mt-3 p-2 border" style={{ borderColor: 'rgba(217,119,6,0.3)', background: 'rgba(217,119,6,0.06)' }}>
          <p style={{ ...rqLabel, color: RQ_VISUAL.warning }}>WARNINGS</p>
          {job.warnings.map((w, i) => (
            <p key={i} style={{ ...rqValue, fontSize: '6px', marginTop: 4, color: RQ_VISUAL.warning }}>
              · {w}
            </p>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {job.controlState === 'paused' ? (
          <button type="button" style={btnStyle} onClick={() => onResume(job.id)}>RESUME</button>
        ) : (
          <button type="button" style={btnStyle} onClick={() => onPause(job.id)}>PAUSE</button>
        )}
        <button type="button" style={btnStyle} onClick={() => onCancel(job.id)}>CANCEL</button>
        <button type="button" style={btnStyle} onClick={() => onDuplicate(job.id)}>DUPLICATE</button>
        <button
          type="button"
          style={{ ...btnStyle, borderColor: RQ_VISUAL.accent, color: RQ_VISUAL.accent }}
          onClick={() => onSetPriority(job.id, job.priority !== 'high')}
        >
          {job.priority === 'high' ? 'NORMAL PRIORITY' : 'PRIORITY RENDERING'}
        </button>
      </div>
    </main>
  );
}

export function RenderIntelligencePanel({ alerts }: { alerts: RenderIntelligenceAlert[] }) {
  return (
    <aside className="p-3 h-full overflow-y-auto" style={rqPanelStyle}>
      <p style={rqSectionTitle}>STUDIO INTELLIGENCE · DELAY EXPLANATIONS</p>
      <p style={{ ...rqLabel, marginBottom: 8 }}>THE FOUNDER NEVER WONDERS WHAT AI IS DOING</p>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="p-2 mb-2 border transition-opacity duration-500"
          style={{
            borderColor: alert.severity === 'warning' ? 'rgba(217,119,6,0.25)' : 'rgba(14,165,233,0.2)',
            background: alert.severity === 'warning' ? 'rgba(217,119,6,0.05)' : RQ_VISUAL.accentSoft,
          }}
        >
          <p style={{ ...rqLabel, color: alert.severity === 'warning' ? RQ_VISUAL.warning : RQ_VISUAL.accent }}>
            {alert.severity === 'warning' ? 'ATTENTION' : 'UPDATE'}
          </p>
          <p style={{ ...rqValue, marginTop: 4, fontSize: '6px' }}>{alert.message}</p>
        </div>
      ))}
      <div className="mt-4 p-2 border" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
        <p style={rqLabel}>EXAMPLE DELAYS</p>
        <p style={{ ...rqValue, fontSize: '6px', marginTop: 4 }}>· Voice rendering slower today.</p>
        <p style={{ ...rqValue, fontSize: '6px', marginTop: 2 }}>· Motion graphics still processing.</p>
        <p style={{ ...rqValue, fontSize: '6px', marginTop: 2 }}>· Thumbnail regenerated — confidence below threshold.</p>
      </div>
    </aside>
  );
}

export function RenderQueueControls({
  batchMode,
  selectedCount,
  onToggleBatchMode,
  onRunBatch,
}: {
  batchMode: boolean;
  selectedCount: number;
  onToggleBatchMode: (v: boolean) => void;
  onRunBatch: () => void;
}) {
  const btnStyle = {
    fontFamily: '"Futura PT Medium"',
    fontSize: '7px',
    textTransform: 'uppercase' as const,
    padding: '6px 10px',
    border: `1.3px solid ${RQ_VISUAL.accent}`,
    color: RQ_VISUAL.accent,
    background: RQ_VISUAL.accentSoft,
    cursor: 'pointer',
  };
  return (
    <div className="flex flex-wrap gap-2 mb-3 p-2 border" style={{ ...rqPanelStyle, borderColor: 'rgba(14,165,233,0.15)' }}>
      <button type="button" style={btnStyle} onClick={() => onToggleBatchMode(!batchMode)}>
        {batchMode ? 'EXIT BATCH MODE' : 'BATCH RENDERING'}
      </button>
      {batchMode && (
        <button type="button" style={btnStyle} onClick={onRunBatch}>
          RUN BATCH ({selectedCount} SELECTED)
        </button>
      )}
    </div>
  );
}

export function RenderQueueConnectedSystems() {
  return (
    <section className="p-3 mb-3" style={rqPanelStyle}>
      <p style={rqSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {RENDER_QUEUE_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: 'rgba(14,165,233,0.2)' }}>
            {sys}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to={adminStudioProductionStudioPath()} style={{ ...rqLabel, fontSize: '6px', color: '#B8860B' }}>→ PRODUCTION STUDIO</Link>
        <Link to={adminStudioRenderQueuePath()} style={{ ...rqLabel, fontSize: '6px', color: RQ_VISUAL.accent }}>→ RENDER QUEUE</Link>
        <Link to={adminStudioScreeningRoomPath()} style={{ ...rqLabel, fontSize: '6px', color: '#C9A962' }}>→ SCREENING ROOM</Link>
        <Link to={adminStudioMissionControlPath()} style={{ ...rqLabel, fontSize: '6px' }}>→ MISSION CONTROL</Link>
        <Link to={adminStudioPublishingQueuePath()} style={{ ...rqLabel, fontSize: '6px', color: '#EB1C24' }}>→ PUBLISHING</Link>
        <Link to={adminStudioPath('ai-production-engine')} style={{ ...rqLabel, fontSize: '6px' }}>→ AI PRODUCTION ENGINE</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...rqLabel, fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
        <Link to={adminStudioTalentNetworkPath()} style={{ ...rqLabel, fontSize: '6px' }}>→ TALENT NETWORK</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...rqLabel, fontSize: '6px' }}>→ CHIEF CONCIERGE</Link>
      </div>
    </section>
  );
}

export function RenderQueueAnimationStyles() {
  return <style>{RQ_ANIMATION_CSS}</style>;
}
