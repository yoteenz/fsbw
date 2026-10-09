import { describe, expect, it } from 'vitest';
import { canReadLayer, legalConflict, trainingView } from './access';
import { AIO_AUTHORITY_BASELINE, AIO_ORGANIZATION_ID } from './aio/scenario';
import {
  attemptLiveAction,
  createSession,
  expertConfirm,
  letMeTakeOver,
  ownerApprove,
  publishTraining,
  recordEvent,
  tryMyWay,
  workspaceFinding,
} from './session';

function session() {
  return createSession({
    id: 'lesson-1',
    organizationId: AIO_ORGANIZATION_ID,
    workflowId: 'operating-authority-application',
    baseline: AIO_AUTHORITY_BASELINE,
  });
}

describe('guided apprenticeship foundation', () => {
  it('does not treat a click as an understood procedure', () => {
    let lesson = letMeTakeOver(session());
    lesson = recordEvent(lesson, { id: 'click-1', kind: 'selected_item', stepId: 'verify', simulated: true });
    expect(lesson.proposed.map((step) => step.title)).toEqual(AIO_AUTHORITY_BASELINE.map((step) => step.title));
    expect(lesson.knowledgeStatus).toBe('interpreted');
  });

  it('asks for a reason before replaying a reorder', () => {
    let lesson = letMeTakeOver(session());
    lesson = recordEvent(lesson, {
      id: 'move-1',
      kind: 'reordered_step',
      stepId: 'verify',
      fromOrder: 3,
      toOrder: 2,
      simulated: true,
    });
    expect(lesson.clarificationRequired).toBe(true);
    expect(tryMyWay(lesson)).toEqual({ blocked: 'clarification_required' });
    lesson = recordEvent(lesson, {
      id: 'why-1',
      kind: 'explained_why',
      aboutEventId: 'move-1',
      reason: 'I verify every name and address before I prepare the application.',
      simulated: true,
    });
    const replay = tryMyWay(lesson);
    expect('blocked' in replay).toBe(false);
    if ('blocked' in replay) return;
    expect(replay.beat).toBe('replay');
    expect(replay.proposed.map((step) => step.id)).toEqual(['collect', 'verify', 'prepare', 'submit']);
    expect(replay.proposed.find((step) => step.id === 'verify')?.reason).toContain('before I prepare');
    expect(replay.baseline.map((step) => step.id)).toEqual(['collect', 'prepare', 'verify', 'submit']);
  });

  it('keeps confirmation, approval, training, and execution separate', () => {
    let lesson = letMeTakeOver(session());
    lesson = recordEvent(lesson, { id: 'move-1', kind: 'reordered_step', fromOrder: 3, toOrder: 2, simulated: true });
    lesson = recordEvent(lesson, { id: 'why-1', kind: 'explained_why', aboutEventId: 'move-1', reason: 'Check first.', simulated: true });
    const replay = tryMyWay(lesson);
    if ('blocked' in replay) throw new Error('replay blocked');
    lesson = expertConfirm(replay, 'yes');
    expect(lesson.knowledgeStatus).toBe('expert_reviewed');
    expect(lesson.workerAuthorized).toBe(false);
    lesson = ownerApprove(lesson);
    expect(lesson.knowledgeStatus).toBe('owner_visible');
    expect(lesson.executionAuthorized).toBe(false);
    expect(lesson.trainingPublished).toBe(false);
    lesson = publishTraining(lesson);
    expect(lesson.knowledgeStatus).toBe('approved_for_training');
    expect(lesson.workerAuthorized).toBe(false);
    expect(attemptLiveAction('submit_filing').allowed).toBe(false);
  });

  it('isolates private knowledge and does not give an AI worker tools', () => {
    let lesson = letMeTakeOver(session());
    lesson = recordEvent(lesson, { id: 'move-1', kind: 'reordered_step', fromOrder: 3, toOrder: 2, simulated: true });
    lesson = recordEvent(lesson, { id: 'why-1', kind: 'explained_why', aboutEventId: 'move-1', reason: 'Check first.', simulated: true });
    const replay = tryMyWay(lesson);
    if ('blocked' in replay) throw new Error('replay blocked');
    lesson = publishTraining(ownerApprove(expertConfirm(replay, 'yes')));
    expect(trainingView({ session: lesson, readerOrganizationId: 'other-co', role: 'founder', privateNote: 'secret' })).toBeNull();
    const staff = trainingView({ session: lesson, readerOrganizationId: AIO_ORGANIZATION_ID, role: 'staff', privateNote: 'secret' });
    expect(staff?.includesPrivate).toBe(false);
    expect(staff?.toolsGranted).toBe(false);
    const ai = trainingView({ session: lesson, readerOrganizationId: AIO_ORGANIZATION_ID, role: 'ai_team_member', privateNote: 'secret' });
    expect(ai?.titles).toEqual([]);
    expect(ai?.toolsGranted).toBe(false);
    expect(canReadLayer({ readerOrganizationId: AIO_ORGANIZATION_ID, noteOrganizationId: AIO_ORGANIZATION_ID, role: 'staff', layer: 'private' })).toBe(false);
  });

  it('flags a legal conflict and a workspace request without changing production', () => {
    const lesson = session();
    expect(legalConflict(lesson, 'submit')).toMatch(/was not removed/);
    const request = workspaceFinding(lesson);
    expect(request?.appliedToProduction).toBe(false);
    expect(request?.status).toBe('founder_review');
  });
});
