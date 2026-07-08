import { useState } from 'react';
import type { PipelineStageRecord } from '../../../../studio-os-core/studio-builder';
import type { FounderReviewPath } from '../../../../studio-os-core/studio-builder/types';
import { founderPathLabel } from '../../../../studio-os-core/studio-builder/creative-review';
import type { useCreativeApprovalPipeline } from '../../../../hooks/useCreativeApprovalPipeline';

type PipelineApi = ReturnType<typeof useCreativeApprovalPipeline>;

type Props = {
  stage: PipelineStageRecord;
  pipeline: PipelineApi;
  directorFeedback: string;
  onDirectorFeedbackChange: (value: string) => void;
  onApprove: () => void;
  onRegenerate: (confirmed?: boolean) => void;
  onBranch: () => void;
  busy: boolean;
};

export function CreativeReviewPanel({
  stage,
  pipeline,
  directorFeedback,
  onDirectorFeedbackChange,
  onApprove,
  onRegenerate,
  onBranch,
  busy,
}: Props) {
  const [followUp, setFollowUp] = useState('');
  const [lastAnswer, setLastAnswer] = useState('');
  const review = stage.creativeReview;
  const activeBranch = pipeline.getActiveBranch(stage);
  const path = stage.founderReviewPath;
  const canDecide = stage.status === 'founder-review' && Boolean(path);

  if (stage.status === 'braintrust-review') {
    return (
      <div className="gb-immersive__creative-review">
        <p className="gb-immersive__creative-review-orb">The Braintrust is reviewing {stage.displayName}…</p>
      </div>
    );
  }

  if (!review) return null;

  const onSelectPath = (p: FounderReviewPath) => {
    pipeline.selectFounderReviewPath(stage.stageId, p);
  };

  const onAsk = () => {
    const answer = pipeline.askFollowUp(stage.stageId, followUp);
    if (answer) {
      setLastAnswer(answer);
      setFollowUp('');
    }
  };

  const onSaveNote = () => {
    if (!directorFeedback.trim()) return;
    pipeline.saveDirectorsNote(directorFeedback, stage.stageId);
    onDirectorFeedbackChange('');
  };

  return (
    <div className="gb-immersive__creative-review">
      <p className="gb-immersive__creative-review-label">Creative Review™ · The AI Braintrust</p>
      <pre className="gb-immersive__creative-review-orb">{review.orbIntro}</pre>

      {!path ? (
        <div className="gb-immersive__creative-review-paths">
          <p className="gb-immersive__creative-review-paths-title">Founder Review™ — choose a path</p>
          <button type="button" className="gb-immersive__btn" disabled={busy} onClick={() => onSelectPath('summary')}>
            Summary Review™
          </button>
          <button type="button" className="gb-immersive__btn" disabled={busy} onClick={() => onSelectPath('deep-dive')}>
            Deep Dive™
          </button>
          <button type="button" className="gb-immersive__btn" disabled={busy} onClick={() => onSelectPath('self-review')}>
            Self Review™
          </button>
          <button
            type="button"
            className="gb-immersive__btn"
            disabled={busy}
            onClick={() => onSelectPath('trust-instinct')}
          >
            Trust My Instinct™
          </button>
        </div>
      ) : (
        <>
          <p className="gb-immersive__creative-review-active-path">{founderPathLabel(path)}</p>

          {path === 'summary' || path === 'trust-instinct' ? (
            <pre className="gb-immersive__creative-review-brief">{review.summaryBriefing}</pre>
          ) : null}

          {path === 'deep-dive' ? (
            <div className="gb-immersive__creative-review-specialists">
              {review.specialistReviews.map((sr) => (
                <div key={sr.specialistId} className="gb-immersive__creative-review-specialist">
                  <p className="gb-immersive__creative-review-specialist-role">
                    {sr.role} · {sr.overallScore}/100 · {sr.confidence}% confidence
                  </p>
                  <p>Strengths: {sr.strengths.join(' · ')}</p>
                  {sr.concerns.length > 0 ? <p>Concerns: {sr.concerns.join(' · ')}</p> : null}
                  <p>Rec: {sr.recommendations[0]}</p>
                </div>
              ))}
              <p className="gb-immersive__creative-review-consensus">{review.consensus}</p>
            </div>
          ) : null}

          {path === 'self-review' ? (
            <div className="gb-immersive__creative-review-self">
              <p>Walk the environment. Experience it personally. Return when ready.</p>
              {activeBranch.previewUrl ? (
                <a
                  href={activeBranch.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gb-immersive__preview-link"
                >
                  Open environment for Self Review™ →
                </a>
              ) : null}
            </div>
          ) : null}

          {path === 'trust-instinct' ? (
            <p className="gb-immersive__creative-review-quiet">
              Braintrust report saved to project history. Proceed with your instinct.
            </p>
          ) : null}

          <div className="gb-immersive__creative-review-followup">
            <input
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              placeholder='Ask the Orb: "What concerns you most?"'
              className="gb-immersive__input"
            />
            <button type="button" className="gb-immersive__btn" disabled={busy || !followUp.trim()} onClick={onAsk}>
              Ask Orb
            </button>
            {lastAnswer ? <p className="gb-immersive__creative-review-answer">{lastAnswer}</p> : null}
          </div>

          <textarea
            value={directorFeedback}
            onChange={(e) => onDirectorFeedbackChange(e.target.value)}
            rows={2}
            placeholder="Director's Notes™ — permanent creative direction"
            className="gb-immersive__input"
            style={{ resize: 'none', marginTop: 6 }}
          />
          <button type="button" className="gb-immersive__btn" disabled={busy || !directorFeedback.trim()} onClick={onSaveNote}>
            Save Director&apos;s Notes™
          </button>

          {canDecide ? (
            <div className="gb-immersive__btn-row">
              <button type="button" className="gb-immersive__btn" disabled={busy} onClick={onApprove}>
                Approve™
              </button>
              <button type="button" className="gb-immersive__btn" disabled={busy} onClick={() => onRegenerate(false)}>
                Regenerate™
              </button>
              <button type="button" className="gb-immersive__btn" disabled={busy} onClick={onBranch}>
                Branch™
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
