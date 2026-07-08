import { useMemo, useState } from 'react';
import type { PipelineStageRecord, RegenerationImpact } from '../../../../studio-os-core/studio-builder';
import { useCreativeApprovalPipeline } from '../../../../hooks/useCreativeApprovalPipeline';
import type { PipelineStageId } from '../../../../studio-os-core/studio-builder/pipeline-definition';

type Props = {
  departmentId: string;
  projectId: string;
  workspaceId?: string;
  setDisplayName: string;
};

const STATUS_LABEL: Record<string, string> = {
  locked: 'Locked',
  preparing: 'Preparing',
  ready: 'Ready',
  generating: 'Generating',
  review: 'Ready for Review',
  approved: 'Approved',
  failed: 'Failed',
};

export function CreativeApprovalPipelinePanel({
  departmentId,
  projectId,
  workspaceId,
  setDisplayName,
}: Props) {
  const pipeline = useCreativeApprovalPipeline(departmentId, projectId, workspaceId);
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

  const activeBranch = focusStage ? pipeline.getActiveBranch(focusStage) : null;
  const isGenerating = focusStage?.status === 'generating';
  const canStart = focusStage?.status === 'ready' || focusStage?.status === 'failed';
  const canReview = focusStage?.status === 'review';
  const isGoldenReview = focusStage?.stageId === 'golden-build-review';

  const onStart = async () => {
    if (!focusStage) return;
    setBusy(true);
    try {
      if (isGoldenReview) {
        pipeline.completeGoldenBuildReview(focusStage.stageId);
        return;
      }
      await pipeline.startStage(focusStage.stageId);
    } finally {
      setBusy(false);
    }
  };

  const onApprove = () => {
    if (!focusStage) return;
    if (isGoldenReview) {
      pipeline.completeGoldenBuildReview(focusStage.stageId);
      return;
    }
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
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="gb-immersive__pipeline">
      <p className="gb-immersive__object-label">Creative Approval Pipeline™</p>
      <p className="gb-immersive__pipeline-sub">
        {setDisplayName} · {pipeline.progress.completed}/{pipeline.progress.total} stages · {pipeline.progress.percent}%
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
              {stage.displayName} — Ready for Review. Tap to Continue.
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

          {activeBranch?.previewUrl ? (
            <a
              href={activeBranch.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gb-immersive__preview-link"
            >
              Stage preview →
            </a>
          ) : null}

          {focusStage.preparedPrompt && focusStage.status === 'locked' ? (
            <p className="gb-immersive__pipeline-prep">Next stage prompts prepared.</p>
          ) : null}

          <textarea
            value={directorFeedback}
            onChange={(e) => setDirectorFeedback(e.target.value)}
            rows={2}
            placeholder='Director feedback: "Warmer." "Less marble." "More futuristic."'
            className="gb-immersive__input"
            style={{ resize: 'none', marginTop: 6 }}
          />

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
              {canStart || isGoldenReview ? (
                <button type="button" className="gb-immersive__btn" disabled={busy || isGenerating} onClick={onStart}>
                  {isGenerating
                    ? 'Generating…'
                    : isGoldenReview
                      ? 'Start Walkthrough Review'
                      : `Generate ${focusStage.displayName}`}
                </button>
              ) : null}
              {canReview ? (
                <>
                  <button type="button" className="gb-immersive__btn" disabled={busy} onClick={onApprove}>
                    Approve™
                  </button>
                  <button type="button" className="gb-immersive__btn" disabled={busy} onClick={() => onRegenerate(false)}>
                    Regenerate™
                  </button>
                  <button type="button" className="gb-immersive__btn" disabled={busy} onClick={onBranch}>
                    Branch™
                  </button>
                </>
              ) : null}
              {focusStage.status === 'approved' && !isGoldenReview ? (
                <button type="button" className="gb-immersive__btn" disabled={busy} onClick={() => onRegenerate(false)}>
                  Regenerate Approved™
                </button>
              ) : null}
            </div>
          )}

          {focusStage.error ? <p className="gb-immersive__pipeline-error">{focusStage.error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
