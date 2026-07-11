import type { ExpertCaptureSession } from '../types';
import type { ExpertInvite } from './types';
import { deriveInviteStatusFromProgress } from './invite-manager';
import { syncInviteProgress } from './invite-store';

export function buildInviteProgressPatch(
  invite: ExpertInvite,
  session: ExpertCaptureSession,
  extras?: { currentQuestionLabel?: string | null; knowledgeExtractedCount?: number }
): ExpertInvite {
  const answered = session.answers.filter((a) => !a.deleted && !a.skipped);
  const approved = answered.filter((a) => a.status === 'approved' || a.confirmation === 'correct');
  const progressPercent = session.questions.length
    ? Math.round((answered.length / session.questions.length) * 100)
    : 0;
  const startedAt = session.meta.startedAt ? new Date(session.meta.startedAt).getTime() : null;
  const timeSpentMinutes = startedAt ? Math.round((Date.now() - startedAt) / 60000) : invite.timeSpentMinutes;

  const latestAnswer = [...answered].reverse()[0];
  const latestLesson = latestAnswer?.questionText?.slice(0, 120) ?? invite.latestLesson;
  const currentQuestion = session.questions[session.meta.currentQuestionIndex];
  const derivedQuestionLabel = currentQuestion?.text?.slice(0, 120) ?? null;

  return {
    ...invite,
    sessionId: session.meta.id,
    progressPercent,
    currentQuestionLabel: extras?.currentQuestionLabel ?? derivedQuestionLabel ?? invite.currentQuestionLabel,
    currentQuestionIndex: session.meta.currentQuestionIndex,
    timeSpentMinutes,
    lastActiveAt: new Date().toISOString(),
    latestLesson,
    knowledgeExtractedCount: extras?.knowledgeExtractedCount ?? approved.length,
    status: deriveInviteStatusFromProgress(
      invite.status,
      progressPercent,
      session.meta.status === 'completed'
    ),
  };
}

export function syncInviteFromSession(session: ExpertCaptureSession, invite: ExpertInvite): void {
  if (!session.meta.inviteToken || session.meta.inviteToken !== invite.token) return;
  const next = buildInviteProgressPatch(invite, session);
  void syncInviteProgress(next);
}
