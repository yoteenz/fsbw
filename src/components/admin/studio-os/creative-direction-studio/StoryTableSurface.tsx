import type { ProjectGenomeRecord } from '../../../../studio-os-core/project-genome/store';
import type { useCreativeApprovalPipeline } from '../../../../hooks/useCreativeApprovalPipeline';
import type { SceneStackPipelineProgress } from '../../../../hooks/useSceneStack';
import type { MoodWallInspiration } from '../../../../studio-os-core/studio-objects/living-mood-wall';

type PipelineApi = ReturnType<typeof useCreativeApprovalPipeline>;

type Props = {
  project: ProjectGenomeRecord;
  pipeline: PipelineApi;
  pipelineProgress: SceneStackPipelineProgress;
  stackBusy: boolean;
  moodPins: MoodWallInspiration[];
};

const STAGE_SHORT: Record<string, string> = {
  'environment-shell': 'Environment',
  lighting: 'Lighting',
  architecture: 'Architecture',
  furniture: 'Furniture',
  'hero-objects': 'Hero',
  decor: 'Decor',
  'interactive-objects': 'Interactive',
  'ambient-systems': 'Ambient',
  runtime: 'Runtime',
  'golden-build-review': 'Golden Build',
};

/** Story Table™ — strategy table surface IS the interface. No floating web panel. */
export function StoryTableSurface({
  project,
  pipeline,
  pipelineProgress,
  stackBusy,
  moodPins,
}: Props) {
  const focusStage =
    pipeline.activeReviewStage ??
    pipeline.pendingReviews[0] ??
    pipeline.progress.currentStage ??
    pipeline.stages[0] ??
    null;

  const tableStages = pipeline.stages.slice(0, 4);

  return (
    <div className="cds-story-table__surface" role="region" aria-label="Story Table strategy surface">
      <div className="cds-story-table__surface-sheen" aria-hidden />
      <div className="cds-story-table__surface-grid" aria-hidden />

      <article className="cds-story-table__card cds-story-table__card--branch">
        <p className="cds-story-table__card-kicker">Active direction</p>
        <p className="cds-story-table__card-title">{project.activeBranchName ?? 'Main Direction'}</p>
        <p className="cds-story-table__card-sub">{project.name}</p>
        <div className="cds-story-table__tone-row">
          {project.tone.slice(0, 3).map((t) => (
            <span key={t} className="cds-story-table__tone-tag">
              {t}
            </span>
          ))}
        </div>
      </article>

      {focusStage ? (
        <article className="cds-story-table__card cds-story-table__card--approval">
          <p className="cds-story-table__card-kicker">On the table</p>
          <p className="cds-story-table__card-title">
            {STAGE_SHORT[focusStage.stageId] ?? focusStage.stageId}
          </p>
          <p className="cds-story-table__card-status">{focusStage.status.replace(/-/g, ' ')}</p>
        </article>
      ) : null}

      {stackBusy ? (
        <article className="cds-story-table__card cds-story-table__card--hologram">
          <p className="cds-story-table__card-kicker">Scene assembly</p>
          <p className="cds-story-table__card-title">
            {pipelineProgress.currentLayerLabel ?? 'Stack'} layer
          </p>
          <div className="cds-story-table__holo-bar" aria-hidden>
            <div
              className="cds-story-table__holo-bar-fill"
              style={{
                width: `${Math.max(
                  10,
                  pipelineProgress.layersTotal
                    ? (pipelineProgress.layersComplete / pipelineProgress.layersTotal) * 100
                    : 12
                )}%`,
              }}
            />
          </div>
        </article>
      ) : null}

      <div className="cds-story-table__card-row">
        {tableStages.map((stage, i) => (
          <article
            key={stage.stageId}
            className={`cds-story-table__mini-card${stage.status === 'approved' ? ' is-approved' : ''}${stage.status === 'generating' ? ' is-live' : ''}`}
            style={{ '--card-rot': `${(i - 1.5) * 4}deg` } as React.CSSProperties}
          >
            <span>{STAGE_SHORT[stage.stageId] ?? stage.stageId}</span>
          </article>
        ))}
      </div>

      {moodPins.length > 0 ? (
        <div className="cds-story-table__polaroids">
          {moodPins.slice(0, 3).map((pin, i) => (
            <article
              key={pin.id}
              className="cds-story-table__polaroid"
              style={{ '--pol-rot': `${-6 + i * 5}deg` } as React.CSSProperties}
            >
              <span>{pin.title}</span>
            </article>
          ))}
        </div>
      ) : null}

      <div className="cds-story-table__paper-edge" aria-hidden />
      <div className="cds-story-table__mug" aria-hidden />
    </div>
  );
}
