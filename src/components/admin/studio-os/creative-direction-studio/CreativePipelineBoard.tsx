import { useEffect, useMemo, useState } from 'react';
import type { PipelineStageRecord, RegenerationImpact } from '../../../../studio-os-core/studio-builder';
import type { useCreativeApprovalPipeline } from '../../../../hooks/useCreativeApprovalPipeline';
import type { PipelineStageId } from '../../../../studio-os-core/studio-builder/pipeline-definition';
import { CreativeReviewPanel } from '../department-vertical-slice/CreativeReviewPanel';

type PipelineApi = ReturnType<typeof useCreativeApprovalPipeline>;

type Props = {
  pipeline: PipelineApi;
  setDisplayName: string;
  onReviewModeChange?: (active: boolean) => void;
};

const STATUS_LABEL: Record<string, string> = {
  locked: 'Locked',
  preparing: 'Preparing',
  ready: 'Ready',
  generating: 'Generating',
  'braintrust-review': 'Braintrust Review',
  'founder-review': 'Founder Review',
  approved: 'Approved',
  failed: 'Failed',
};

/** Wall-mounted Creative Pipeline™ — same logic as panel, physical board presentation. */
export function CreativePipelineBoard({ pipeline, setDisplayName, onReviewModeChange }: Props) {
  const [directorFeedback, setDirectorFeedback] = useState('');
  const [activeStageId, setActiveStageId] = useState<PipelineStageId | null>(null);
  const [impact, setImpact] = useState<RegenerationImpact | null>(null);
  const [busy, setBusy] = useState(false);

  const focusStage = useMemo(() => {
    if (activeStageId) {
      return pipeline.stages.find((s) => s.stageId === activeStageId) ?? pipeline.progress.currentStage;
    }
    return (
      pipeline.pendingReviews[0] ??
      pipeline.progress.currentStage ??
      pipeline.stages.find((s) => s.status === 'ready') ??
      null
    );
  }, [activeStageId, pipeline.pendingReviews, pipeline.progress.currentStage, pipeline.stages]);

  const reviewMode = Boolean(
    focusStage?.reviewMode ||
      focusStage?.status === 'braintrust-review' ||
      focusStage?.status === 'founder-review'
  );

  useEffect(() => {
    onReviewModeChange?.(reviewMode);
  }, [onReviewModeChange, reviewMode]);

  const isGenerating = focusStage?.status === 'generating';
  const canStart = focusStage?.status === 'ready' || focusStage?.status === 'failed';
  const inCreativeReview =
    focusStage?.status === 'braintrust-review' || focusStage?.status === 'founder-review';
  const isGoldenReview = focusStage?.stageId === 'golden-build-review';

  const onStart = async () => {
    if (!focusStage) return;
    setBusy(true);
    try {
      await pipeline.startStage(focusStage.stageId);
    } finally {
      setBusy(false);
    }
  };

  const onApprove = () => {
    if (!focusStage) return;
    pipeline.approveStage(focusStage.stageId);
    setDirectorFeedback('');
    setImpact(null);
  };

  const onRegenerate = async (confirmed = false) => {
    if (!focusStage) return;
    setBusy(true);
    try {
      const result = await pipeline.regenerateStage(focusStage.stageId, directorFeedback, confirmed);
      if (result && 'needsConfirmation' in result && result.needsConfirmation) {
        setImpact(result.impact);
        return;
      }
      setImpact(null);
      setDirectorFeedback('');
    } finally {
      setBusy(false);
    }
  };

  const onBranch = async () => {
    if (!focusStage) return;
    setBusy(true);
    try {
      await pipeline.branchStage(focusStage.stageId, directorFeedback);
      setImpact(null);
      setDirectorFeedback('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="gb-immersive__pipeline">
      <p className="gb-immersive__object-label">Creative Pipeline™</p>
      <p className="gb-immersive__pipeline-sub">
        {setDisplayName} · {pipeline.progress.completed}/{pipeline.progress.total} stages ·{' '}
        {pipeline.progress.percent}%
      </p>

      {pipeline.pendingReviews.length > 0 ? (
        <div className="gb-immersive__pipeline-notice">
          {pipeline.pendingReviews.map((stage) => (
            <button
              key={stage.stageId}
              type="button"
              className="gb-immersive__pipeline-notice-btn"
              onClick={() => {
                setActiveStageId(stage.stageId);
                pipeline.dismissNotification(stage.stageId);
              }}
            >
              {stage.displayName} — Braintrust review complete. Tap to Continue.
            </button>
          ))}
        </div>
      ) : null}

      <div className="gb-immersive__pipeline-list">
        {pipeline.stages.map((stage: PipelineStageRecord) => (
          <button
            key={stage.stageId}
            type="button"
            className={`gb-immersive__pipeline-row${focusStage?.stageId === stage.stageId ? ' is-active' : ''}${stage.status === 'approved' ? ' is-done' : ''}${stage.status === 'locked' ? ' is-locked' : ''}`}
            onClick={() => setActiveStageId(stage.stageId)}
          >
            <span className="gb-immersive__pipeline-order">{String(stage.order).padStart(2, '0')}</span>
            <span className="gb-immersive__pipeline-name">{stage.displayName}</span>
            <span className="gb-immersive__pipeline-status">{STATUS_LABEL[stage.status] ?? stage.status}</span>
            {stage.branches.length > 1 ? (
              <span className="gb-immersive__pipeline-branches">{stage.branches.length} branches</span>
            ) : null}
          </button>
        ))}
      </div>

      {focusStage ? (
        <div className="gb-immersive__pipeline-detail">
          <p className="gb-immersive__pipeline-detail-title">
            Stage {focusStage.order}: {focusStage.displayName}
          </p>

          {focusStage.branches.length > 1 ? (
            <div className="gb-immersive__btn-row">
              {focusStage.branches.map((branch) => (
                <button
                  key={branch.id}
                  type="button"
                  className={`gb-immersive__btn${focusStage.activeBranchId === branch.id ? ' is-selected' : ''}`}
                  onClick={() => pipeline.selectBranch(focusStage.stageId, branch.id)}
                >
                  {branch.label}
                </button>
              ))}
            </div>
          ) : null}

          {inCreativeReview ? (
            <CreativeReviewPanel
              stage={focusStage}
              pipeline={pipeline}
              directorFeedback={directorFeedback}
              onDirectorFeedbackChange={setDirectorFeedback}
              onApprove={onApprove}
              onRegenerate={onRegenerate}
              onBranch={onBranch}
              busy={busy}
            />
          ) : (
            <>
              {focusStage.preparedPrompt && focusStage.status === 'locked' ? (
                <p className="gb-immersive__pipeline-prep">Next stage prompts prepared.</p>
              ) : null}

              {impact ? (
                <div className="gb-immersive__pipeline-warning">
                  <p>This change may affect:</p>
                  <ul>
                    {impact.downstreamImpact.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                  <p>Affected stages: {impact.affectedStages.map((s) => s.displayName).join(', ')}</p>
                  <div className="gb-immersive__btn-row">
                    <button type="button" className="gb-immersive__btn" onClick={() => onRegenerate(true)} disabled={busy}>
                      Continue
                    </button>
                    <button type="button" className="gb-immersive__btn" onClick={() => setImpact(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="gb-immersive__btn-row">
                  {canStart ? (
                    <button type="button" className="gb-immersive__btn" disabled={busy || isGenerating} onClick={onStart}>
                      {isGenerating
                        ? 'Generating…'
                        : isGoldenReview
                          ? 'Begin Golden Build™ Review'
                          : `Generate ${focusStage.displayName}`}
                    </button>
                  ) : null}
                  {focusStage.status === 'approved' && !isGoldenReview ? (
                    <button type="button" className="gb-immersive__btn" disabled={busy} onClick={() => onRegenerate(false)}>
                      Regenerate Approved™
                    </button>
                  ) : null}
                </div>
              )}
            </>
          )}

          {focusStage.error ? <p className="gb-immersive__pipeline-error">{focusStage.error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
