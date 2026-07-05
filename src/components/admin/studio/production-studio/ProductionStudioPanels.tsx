import { Link } from 'react-router-dom';
import {
  PRODUCTION_PIPELINE_STAGES,
  PRODUCTION_QUEUE_STATUSES,
  PRODUCTION_STUDIO_CONNECTED_SYSTEMS,
} from '../../../../studio-os-core/production-studio/constants';
import type {
  ProductionAsset,
  ProductionJob,
  ProductionQueueStatusId,
  ProductionStudioStore,
} from '../../../../studio-os-core/production-studio/types';
import {
  adminStudioChiefOfStaffPath,
  adminStudioConciergeLayerPath,
  adminStudioKnowledgeHubPath,
  adminStudioMissionControlPath,
  adminStudioNdxbookNewsroomPath,
  adminStudioNdxbookPath,
  adminStudioProductionBuilderPath,
  adminStudioProductionStudioPath,
  adminStudioPublishingQueuePath,
  adminStudioRenderQueuePath,
  adminStudioScreeningRoomPath,
  adminStudioStudioIntelligencePath,
  adminStudioTalentNetworkPath,
} from '../../../../utils/adminStudioRoutes';
import {
  PS_VISUAL,
  psCanvasStyle,
  psGraceAccent,
  psLabel,
  psOverrideInput,
  psPanelStyle,
  psQueueBtn,
  psSectionTitle,
  psValue,
} from './productionStudioTheme';

type PanelProps = {
  store: ProductionStudioStore;
  selectedJob: ProductionJob | null;
  filteredJobs: ProductionJob[];
  onSelectJob: (id: string) => void;
  onSetQueueFilter: (filter: ProductionQueueStatusId | 'all') => void;
  onOverrideAsset: (jobId: string, assetType: ProductionAsset['type'], value: string) => void;
  onResetOverride: (jobId: string, assetType: ProductionAsset['type']) => void;
  onAdvanceStage: (jobId: string) => void;
};

function formatRuntime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ProductionStudioHeader({ store }: { store: ProductionStudioStore }) {
  return (
    <header
      className="p-3 mb-3 relative overflow-hidden"
      style={{
        ...psPanelStyle,
        backgroundImage: `${PS_VISUAL.cinematicGlow}, ${PS_VISUAL.marble}`,
        backgroundSize: 'cover, cover',
      }}
    >
      <p style={psSectionTitle}>PRODUCTION STUDIO · CINEMATIC HEADQUARTERS · V1.0</p>
      <p style={{ ...psGraceAccent, fontSize: '18px', marginBottom: 4 }}>{store.companyName}</p>
      <p style={{ ...psValue, color: PS_VISUAL.gray, fontSize: '7px' }}>{store.dashboard.summary}</p>
      <div className="grid grid-cols-3 gap-2 mt-3 sm:grid-cols-6">
        {[
          { label: 'READY', value: store.dashboard.jobsReady },
          { label: 'IN PRODUCTION', value: store.dashboard.jobsInProduction },
          { label: 'RENDERING', value: store.dashboard.jobsRendering },
          { label: 'NEEDS REVIEW', value: store.dashboard.jobsNeedsReview },
          { label: 'COMPLETED', value: store.dashboard.jobsCompleted },
          { label: 'CONFIDENCE', value: `${store.dashboard.avgConfidencePct}%` },
        ].map((m) => (
          <div key={m.label} className="p-2 border text-center" style={{ borderColor: 'rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.5)' }}>
            <p style={psLabel}>{m.label}</p>
            <p style={{ ...psGraceAccent, fontSize: '16px' }}>{m.value}</p>
          </div>
        ))}
      </div>
    </header>
  );
}

export function ProductionStudioQueuePanel({
  store,
  selectedJob,
  filteredJobs,
  onSelectJob,
  onSetQueueFilter,
}: Pick<PanelProps, 'store' | 'selectedJob' | 'filteredJobs' | 'onSelectJob' | 'onSetQueueFilter'>) {
  return (
    <aside className="p-3 h-full flex flex-col" style={psPanelStyle}>
      <p style={psSectionTitle}>PRODUCTION QUEUE</p>
      <div className="flex flex-wrap gap-1 mb-3">
        <button type="button" style={psQueueBtn(store.queueFilter === 'all')} onClick={() => onSetQueueFilter('all')}>
          ALL
        </button>
        {PRODUCTION_QUEUE_STATUSES.map((s) => (
          <button
            key={s.id}
            type="button"
            style={psQueueBtn(store.queueFilter === s.id)}
            onClick={() => onSetQueueFilter(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredJobs.map((job) => {
          const active = selectedJob?.id === job.id;
          return (
            <button
              key={job.id}
              type="button"
              onClick={() => onSelectJob(job.id)}
              className="w-full text-left p-2 mb-2 border transition-opacity"
              style={{
                borderColor: active ? PS_VISUAL.accent : 'rgba(0,0,0,0.08)',
                background: active ? PS_VISUAL.accentSoft : 'rgba(255,255,255,0.55)',
              }}
            >
              <p style={{ ...psLabel, color: active ? PS_VISUAL.accent : PS_VISUAL.gray }}>{job.queueStatus.replace(/-/g, ' ').toUpperCase()}</p>
              <p style={{ ...psValue, fontFamily: '"Futura PT Medium"', fontSize: '7px', marginTop: 2 }}>{job.pageTitle}</p>
              <p style={{ ...psLabel, marginTop: 4 }}>{formatRuntime(job.estimatedRuntimeSec)} · {job.pipelineStage.replace(/-/g, ' ').toUpperCase()}</p>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export function ProductionStudioCanvas({
  selectedJob,
  onAdvanceStage,
}: Pick<PanelProps, 'selectedJob' | 'onAdvanceStage'>) {
  if (!selectedJob) {
    return (
      <main className="p-6 flex items-center justify-center h-full" style={psCanvasStyle}>
        <p style={{ ...psValue, color: PS_VISUAL.gray }}>SELECT A PRODUCTION FROM THE QUEUE</p>
      </main>
    );
  }

  const stageIdx = PRODUCTION_PIPELINE_STAGES.findIndex((s) => s.id === selectedJob.pipelineStage);

  return (
    <main className="p-3 h-full flex flex-col overflow-hidden" style={psCanvasStyle}>
      <div className="flex justify-between items-start mb-3 gap-2">
        <div>
          <p style={psSectionTitle}>PRODUCTION CANVAS</p>
          <p style={{ ...psGraceAccent, fontSize: '16px' }}>{selectedJob.pageTitle}</p>
          <p style={{ ...psLabel, marginTop: 4 }}>{selectedJob.pageRoute}</p>
        </div>
        <div className="text-right">
          <p style={psLabel}>EST. RUNTIME</p>
          <p style={{ ...psGraceAccent, fontSize: '20px' }}>{formatRuntime(selectedJob.estimatedRuntimeSec)}</p>
        </div>
      </div>

      {/* Pipeline timeline */}
      <div className="mb-3 p-2 border overflow-x-auto" style={{ borderColor: 'rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.4)' }}>
        <p style={{ ...psLabel, marginBottom: 6 }}>PRODUCTION PIPELINE</p>
        <div className="flex gap-1 min-w-max">
          {PRODUCTION_PIPELINE_STAGES.map((stage, i) => {
            const done = i < stageIdx;
            const current = i === stageIdx;
            return (
              <div key={stage.id} className="flex flex-col items-center" style={{ minWidth: 52 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: done ? PS_VISUAL.stageReady : current ? PS_VISUAL.stageActive : PS_VISUAL.stagePending,
                    boxShadow: current ? `0 0 8px ${PS_VISUAL.accentSoft}` : undefined,
                  }}
                />
                <p style={{ ...psLabel, fontSize: '5px', marginTop: 4, textAlign: 'center', color: current ? PS_VISUAL.accent : PS_VISUAL.gray }}>
                  {stage.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scene cards + waveform row */}
      <div className="grid grid-cols-1 gap-3 mb-3 flex-1 min-h-0 lg:grid-cols-2">
        <div className="p-2 border overflow-y-auto" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <p style={{ ...psLabel, marginBottom: 6 }}>SCENE CARDS · TIMELINE</p>
          {selectedJob.scenes.map((scene, i) => (
            <div key={scene.id} className="p-2 mb-2 border" style={{ background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(184,134,11,0.2)' }}>
              <div className="flex justify-between">
                <p style={{ ...psValue, fontFamily: '"Futura PT Medium"', fontSize: '7px' }}>{i + 1}. {scene.label}</p>
                <p style={psLabel}>{scene.durationSec}s</p>
              </div>
              <p style={{ ...psLabel, marginTop: 4 }}>{scene.visualNote}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <div className="p-2 border flex-1" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <p style={{ ...psLabel, marginBottom: 6 }}>VOICE WAVEFORM · {selectedJob.voiceProfile}</p>
            <div className="flex items-end gap-0.5 h-16">
              {selectedJob.waveform.map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${Math.max(12, h)}%`,
                    background: `linear-gradient(to top, ${PS_VISUAL.accent}, ${PS_VISUAL.champagne})`,
                    borderRadius: 1,
                    opacity: 0.85,
                  }}
                />
              ))}
            </div>
            <p style={{ ...psLabel, marginTop: 6 }}>HOST · {selectedJob.hostName}</p>
          </div>

          <div className="p-2 border" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <p style={{ ...psLabel, marginBottom: 4 }}>THUMBNAIL PREVIEW</p>
            <div
              className="aspect-video flex items-center justify-center border"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${PS_VISUAL.accentSoft} 100%)`,
                borderColor: 'rgba(184,134,11,0.25)',
              }}
            >
              <p style={{ ...psLabel, textAlign: 'center', padding: 8 }}>{selectedJob.thumbnailPreview}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform versions + notes */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="p-2 border" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <p style={{ ...psLabel, marginBottom: 4 }}>PLATFORM VERSIONS</p>
          {selectedJob.platformVersions.map((pv) => (
            <div key={pv.platform} className="flex justify-between mb-1">
              <span style={psValue}>{pv.platform}</span>
              <span style={psLabel}>{pv.aspect} · {formatRuntime(pv.runtimeSec)} · {pv.status.toUpperCase()}</span>
            </div>
          ))}
        </div>
        <div className="p-2 border" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <p style={{ ...psLabel, marginBottom: 4 }}>PRODUCTION NOTES</p>
          {selectedJob.productionNotes.map((note, i) => (
            <p key={i} style={{ ...psLabel, marginBottom: 2, color: PS_VISUAL.black, fontFamily: '"Futura PT Book"', fontSize: '6px' }}>
              · {note}
            </p>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onAdvanceStage(selectedJob.id)}
        className="mt-3 w-full py-2 border uppercase"
        style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '8px',
          borderColor: PS_VISUAL.accent,
          color: PS_VISUAL.accent,
          background: PS_VISUAL.accentSoft,
        }}
      >
        ADVANCE PIPELINE STAGE →
      </button>
    </main>
  );
}

export function ProductionStudioIntelligencePanel({
  selectedJob,
  onOverrideAsset,
  onResetOverride,
}: Pick<PanelProps, 'selectedJob' | 'onOverrideAsset' | 'onResetOverride'>) {
  if (!selectedJob) {
    return (
      <aside className="p-3 h-full" style={psPanelStyle}>
        <p style={psSectionTitle}>STUDIO INTELLIGENCE</p>
        <p style={{ ...psValue, color: PS_VISUAL.gray }}>Select a production to view recommendations.</p>
      </aside>
    );
  }

  const intel = selectedJob.intelligence;

  return (
    <aside className="p-3 h-full flex flex-col overflow-hidden" style={psPanelStyle}>
      <p style={psSectionTitle}>STUDIO INTELLIGENCE</p>
      <p style={{ ...psLabel, marginBottom: 8 }}>FOUNDER OVERRIDE · ANY AI DECISION</p>

      <div className="space-y-2 mb-3 overflow-y-auto flex-1 min-h-0">
        {[
          { label: 'HOOK IMPROVEMENT', value: intel.hookImprovement },
          { label: 'THUMBNAIL', value: intel.thumbnailRecommendation },
          { label: 'VOICE', value: intel.voiceRecommendation },
        ].map((rec) => (
          <div key={rec.label} className="p-2 border" style={{ borderColor: 'rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.5)' }}>
            <p style={psLabel}>{rec.label}</p>
            <p style={{ ...psValue, marginTop: 4 }}>{rec.value}</p>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 border text-center" style={{ borderColor: 'rgba(184,134,11,0.2)' }}>
            <p style={psLabel}>RETENTION</p>
            <p style={{ ...psGraceAccent, fontSize: '18px' }}>{intel.estimatedRetentionPct}%</p>
          </div>
          <div className="p-2 border text-center" style={{ borderColor: 'rgba(184,134,11,0.2)' }}>
            <p style={psLabel}>CONFIDENCE</p>
            <p style={{ ...psGraceAccent, fontSize: '18px' }}>{intel.confidenceScore}</p>
          </div>
        </div>

        <div className="p-2 border" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <p style={psLabel}>PREDICTED PERFORMANCE</p>
          <p style={{ ...psValue, marginTop: 4, color: PS_VISUAL.accent }}>{intel.predictedPerformance}</p>
        </div>

        {intel.productionRecommendations.map((rec, i) => (
          <p key={i} style={{ ...psLabel, color: PS_VISUAL.black, fontFamily: '"Futura PT Book"', fontSize: '6px' }}>
            → {rec}
          </p>
        ))}

        <p style={{ ...psSectionTitle, marginTop: 12 }}>ASSET OVERRIDES</p>
        {selectedJob.assets.slice(0, 6).map((asset) => {
          const display = asset.founderOverride ?? asset.aiValue;
          return (
            <div key={asset.type} className="p-2 mb-2 border" style={{ borderColor: asset.status === 'overridden' ? PS_VISUAL.accent : 'rgba(0,0,0,0.06)' }}>
              <div className="flex justify-between mb-1">
                <p style={psLabel}>{asset.type.replace(/-/g, ' ').toUpperCase()}</p>
                <span style={{ ...psLabel, color: asset.status === 'overridden' ? PS_VISUAL.accent : PS_VISUAL.gray }}>
                  {asset.status.toUpperCase()}
                </span>
              </div>
              <input
                type="text"
                defaultValue={display}
                style={psOverrideInput}
                onBlur={(e) => {
                  if (e.target.value !== asset.aiValue) {
                    onOverrideAsset(selectedJob.id, asset.type, e.target.value);
                  }
                }}
              />
              {asset.founderOverride && (
                <button
                  type="button"
                  onClick={() => onResetOverride(selectedJob.id, asset.type)}
                  style={{ ...psLabel, marginTop: 4, color: PS_VISUAL.red, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  RESET TO AI
                </button>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export function ProductionStudioConnectedSystemsPanel() {
  return (
    <section className="p-3 mb-3" style={psPanelStyle}>
      <p style={psSectionTitle}>CONNECTED SYSTEMS</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {PRODUCTION_STUDIO_CONNECTED_SYSTEMS.map((sys) => (
          <span key={sys} className="text-[5px] font-futura px-1 py-0.5 border" style={{ borderColor: 'rgba(184,134,11,0.25)', background: 'rgba(255,255,255,0.5)' }}>
            {sys}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to={adminStudioMissionControlPath()} style={{ ...psLabel, color: PS_VISUAL.black, fontSize: '6px' }}>→ MISSION CONTROL</Link>
        <Link to={adminStudioNdxbookNewsroomPath()} style={{ ...psLabel, color: '#0F172A', fontSize: '6px' }}>→ NEWSROOM</Link>
        <Link to={adminStudioPublishingQueuePath()} style={{ ...psLabel, color: PS_VISUAL.red, fontSize: '6px' }}>→ PUBLISHING</Link>
        <Link to={adminStudioNdxbookPath()} style={{ ...psLabel, color: '#6366F1', fontSize: '6px' }}>→ LIBRARY</Link>
        <Link to={adminStudioStudioIntelligencePath()} style={{ ...psLabel, color: '#4F46E5', fontSize: '6px' }}>→ STUDIO INTELLIGENCE</Link>
        <Link to={adminStudioKnowledgeHubPath()} style={{ ...psLabel, color: '#854D0E', fontSize: '6px' }}>→ KNOWLEDGE GRAPH</Link>
        <Link to={adminStudioTalentNetworkPath()} style={{ ...psLabel, color: '#059669', fontSize: '6px' }}>→ TALENT NETWORK</Link>
        <Link to={adminStudioConciergeLayerPath()} style={{ ...psLabel, color: '#92704A', fontSize: '6px' }}>→ CONCIERGE LAYER</Link>
        <Link to={adminStudioChiefOfStaffPath()} style={{ ...psLabel, color: '#0F172A', fontSize: '6px' }}>→ CHIEF CONCIERGE</Link>
        <Link to={adminStudioProductionBuilderPath()} style={{ ...psLabel, color: PS_VISUAL.accent, fontSize: '6px' }}>→ PRODUCTION BUILDER</Link>
        <Link to={adminStudioProductionStudioPath()} style={{ ...psLabel, color: PS_VISUAL.accent, fontSize: '6px' }}>→ PRODUCTION STUDIO</Link>
        <Link to={adminStudioRenderQueuePath()} style={{ ...psLabel, color: '#0EA5E9', fontSize: '6px' }}>→ RENDER QUEUE</Link>
        <Link to={adminStudioScreeningRoomPath()} style={{ ...psLabel, color: '#C9A962', fontSize: '6px' }}>→ SCREENING ROOM</Link>
      </div>
    </section>
  );
}

export function ProductionStudioPhilosophyPanel({ store }: { store: ProductionStudioStore }) {
  return (
    <section className="p-3 mb-3" style={psPanelStyle}>
      <p style={psSectionTitle}>STUDIO PHILOSOPHY</p>
      {store.philosophy.map((line, i) => (
        <p key={i} style={{ ...psValue, marginBottom: 4, color: PS_VISUAL.gray }}>
          · {line}
        </p>
      ))}
    </section>
  );
}

export function ProductionStudioAssetsPanel({ selectedJob }: { selectedJob: ProductionJob | null }) {
  if (!selectedJob) return null;
  return (
    <section className="p-3 mb-3" style={psPanelStyle}>
      <p style={psSectionTitle}>AUTO-GENERATED PRODUCTION ASSETS</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {selectedJob.assets.map((asset) => (
          <div key={asset.type} className="p-2 border" style={{ borderColor: 'rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.55)' }}>
            <p style={psLabel}>{asset.type.replace(/-/g, ' ').toUpperCase()}</p>
            <p style={{ ...psLabel, marginTop: 2, color: asset.status === 'ready' ? PS_VISUAL.stageReady : asset.status === 'overridden' ? PS_VISUAL.accent : PS_VISUAL.gray }}>
              {asset.status.toUpperCase()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
