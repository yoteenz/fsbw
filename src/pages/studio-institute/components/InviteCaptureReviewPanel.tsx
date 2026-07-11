/**
 * Owner review panel — view interview answers, play recordings, download submissions.
 */
import { useCallback, useEffect, useState } from 'react';
import type { ExpertInvite } from '../../../studio-os-core/expert-capture/invite-system';
import {
  downloadOwnerCaptureExport,
  fetchOwnerInviteCaptureReview,
  type OwnerCaptureAnswerItem,
  type OwnerInviteCaptureReview,
} from '../../../studio-os-core/expert-capture/invite-system/invite-capture-api';
import { InviteApiError } from '../../../studio-os-core/expert-capture/invite-system/invite-store';
import { siStyles, SiBtn } from '../studio-institute-styles';

function formatBytes(bytes: number | null): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AnswerMediaPlayer({ answer }: { answer: OwnerCaptureAnswerItem }) {
  const playable = answer.media.filter((m) => m.playbackUrl && m.uploadStatus === 'uploaded');
  if (!playable.length) {
    const pending = answer.media.filter((m) => m.uploadStatus !== 'uploaded');
    if (pending.length) {
      return (
        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#d97706' }}>
          Recording upload pending ({pending.length} file{pending.length === 1 ? '' : 's'})
        </p>
      );
    }
    if (answer.transcript) {
      return (
        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b' }}>
          Transcript only — no uploaded recording file yet.
        </p>
      );
    }
    return null;
  }

  return (
    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {playable.map((m) => {
        const isAudio = (m.mimeType ?? '').startsWith('audio');
        return (
          <div key={m.id} style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
            {isAudio ? (
              <audio controls preload="metadata" src={m.playbackUrl!} style={{ width: '100%' }} />
            ) : (
              <video controls preload="metadata" src={m.playbackUrl!} style={{ width: '100%', maxHeight: 280, borderRadius: 8 }} />
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6, fontSize: 12, color: '#64748b' }}>
              <span>{formatBytes(m.byteSize)}</span>
              {m.isPartial ? <span style={{ color: '#d97706' }}>Partial recording</span> : null}
              <a href={m.playbackUrl!} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
                Open recording
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function InviteCaptureReviewPanel({ invite, onClose }: { invite: ExpertInvite; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<OwnerInviteCaptureReview | null>(null);
  const [expandedAnswerId, setExpandedAnswerId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOwnerInviteCaptureReview(invite.id);
      setReview(data);
      if (!data.ok && data.error) setError(data.error);
    } catch (e) {
      setReview(null);
      setError(e instanceof InviteApiError ? e.message : 'Could not load captured work.');
    } finally {
      setLoading(false);
    }
  }, [invite.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const session = review?.session;
  const answers = session?.answers ?? [];

  return (
    <div
      style={{
        ...siStyles.card,
        marginTop: 12,
        border: '1px solid #cbd5e1',
        background: '#f8fafc',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Captured work — {invite.inviteeName}</h3>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b' }}>
            View interview submissions, play recordings, and download exports.
          </p>
        </div>
        <SiBtn onClick={onClose}>Close</SiBtn>
      </div>

      {loading ? <p style={{ fontSize: 14, color: '#64748b' }}>Loading saved interview…</p> : null}

      {!loading && error && !session ? (
        <div style={{ padding: 12, borderRadius: 8, background: '#fff7ed', color: '#9a3412', fontSize: 14 }}>
          {error}
          {invite.progressPercent > 0 ? (
            <p style={{ margin: '8px 0 0', fontSize: 13 }}>
              Invite shows {invite.progressPercent}% progress — the session may still be syncing. Try Refresh in a moment.
            </p>
          ) : null}
        </div>
      ) : null}

      {!loading && session ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 14 }}>
            <Stat label="Progress" value={`${session.progressPercent}%`} />
            <Stat label="Answers" value={String(session.answerCount)} />
            <Stat label="Recorded" value={String(session.recordedCount)} />
            <Stat label="Approved" value={String(session.approvedCount)} />
          </div>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b' }}>
            Status: {session.status}
            {session.lastSavedAt ? ` · Last saved ${new Date(session.lastSavedAt).toLocaleString()}` : ''}
            {invite.currentQuestionLabel ? ` · Current: ${invite.currentQuestionLabel}` : ''}
          </p>

          <div style={siStyles.btnRow}>
            <SiBtn
              primary
              onClick={() => {
                if (review) downloadOwnerCaptureExport(review, `${invite.inviteeName}-${invite.id}`);
              }}
            >
              Download submissions (JSON)
            </SiBtn>
            <SiBtn onClick={() => void load()}>Refresh</SiBtn>
          </div>

          {answers.length === 0 ? (
            <p style={{ marginTop: 14, fontSize: 14, color: '#64748b' }}>
              Session exists but no answers are stored yet.
            </p>
          ) : (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {answers.map((answer, index) => {
                const expanded = expandedAnswerId === answer.id;
                return (
                  <div
                    key={answer.id || `ans-${index}`}
                    style={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: 14,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedAnswerId(expanded ? null : answer.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        border: 'none',
                        background: 'transparent',
                        padding: 0,
                        cursor: 'pointer',
                        font: 'inherit',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                            Q{index + 1}. {answer.questionText || 'Untitled question'}
                          </p>
                          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                            {answer.skipped ? 'Skipped' : answer.status}
                            {answer.recordedAt ? ` · ${new Date(answer.recordedAt).toLocaleString()}` : ''}
                          </p>
                        </div>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>{expanded ? '▲' : '▼'}</span>
                      </div>
                    </button>

                    {expanded ? (
                      <div style={{ marginTop: 12 }}>
                        {answer.transcript ? (
                          <div style={{ marginBottom: 10 }}>
                            <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: '#475569' }}>Transcript</p>
                            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: '#334155', whiteSpace: 'pre-wrap' }}>
                              {answer.transcript}
                            </p>
                          </div>
                        ) : null}
                        {answer.aiUnderstanding ? (
                          <div style={{ marginBottom: 10 }}>
                            <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: '#475569' }}>AI understanding</p>
                            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: '#334155' }}>{answer.aiUnderstanding}</p>
                          </div>
                        ) : null}
                        <AnswerMediaPlayer answer={answer} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px' }}>
      <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
      <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 600 }}>{value}</p>
    </div>
  );
}
