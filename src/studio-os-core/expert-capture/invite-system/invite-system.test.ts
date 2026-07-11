import { describe, expect, it } from 'vitest';
import { TAX_PREPARATION_PROFILE } from '../profiles';
import { createEmptySession, createAnswerForQuestion } from '../session-storage';
import {
  buildInviteProgressPatch,
  buildInviteUrl,
  createInviteRecord,
  deriveInviteStatusFromProgress,
  generateInviteToken,
  isInviteExpired,
  studioInstitutePath,
} from './index';

describe('Studio Institute Invite System', () => {
  it('generates unpredictable invite tokens', () => {
    const a = generateInviteToken();
    const b = generateInviteToken();
    expect(a).toHaveLength(8);
    expect(b).toHaveLength(8);
    expect(a).not.toBe(b);
    expect(/^[A-Z2-9]+$/.test(a)).toBe(true);
  });

  it('builds migration-ready invite URLs without hardcoded host', () => {
    const path = studioInstitutePath('invite', 'ABC12345');
    expect(path).toBe('/studio-institute/invite/ABC12345');
    expect(buildInviteUrl('ABC12345')).toMatch(/\/studio-institute\/invite\/ABC12345$/);
  });

  it('creates invite records with required fields', () => {
    const invite = createInviteRecord({
      inviteeName: 'Jane Expert',
      businessName: 'Acme Tax LLC',
      role: 'CPA',
      workerBeingCreated: 'Acme Tax Preparation Professional',
      profileId: TAX_PREPARATION_PROFILE.id,
      companyId: TAX_PREPARATION_PROFILE.companyId,
    });
    expect(invite.status).toBe('not_started');
    expect(invite.inviteeName).toBe('Jane Expert');
    expect(invite.token).toHaveLength(8);
  });

  it('detects expired invites', () => {
    const expired = createInviteRecord({
      inviteeName: 'A',
      businessName: 'B',
      role: 'C',
      workerBeingCreated: 'W',
      profileId: TAX_PREPARATION_PROFILE.id,
      companyId: TAX_PREPARATION_PROFILE.companyId,
      expiresAt: '2020-01-01T00:00:00.000Z',
    });
    expect(isInviteExpired(expired)).toBe(true);
  });

  it('derives invite status from session progress', () => {
    expect(deriveInviteStatusFromProgress('not_started', 0, false)).toBe('not_started');
    expect(deriveInviteStatusFromProgress('not_started', 25, false)).toBe('in_progress');
    expect(deriveInviteStatusFromProgress('in_progress', 80, true)).toBe('completed');
    expect(deriveInviteStatusFromProgress('archived', 50, false)).toBe('archived');
  });

  it('syncs invite progress from expert capture session', () => {
    const invite = createInviteRecord({
      inviteeName: 'Jane',
      businessName: 'Acme',
      role: 'CPA',
      workerBeingCreated: 'Worker',
      profileId: TAX_PREPARATION_PROFILE.id,
      companyId: TAX_PREPARATION_PROFILE.companyId,
    });
    const session = createEmptySession({ expertName: 'Jane', expertRole: 'CPA' }, TAX_PREPARATION_PROFILE);
    session.meta.inviteToken = invite.token;
    session.meta.id = 'sess-test-1';
    const q = session.questions[0];
    expect(q).toBeTruthy();
    let answer = createAnswerForQuestion(session, q!);
    answer = { ...answer, status: 'approved', confirmation: 'correct', transcript: 'Answer text' };
    session.answers.push(answer);

    const patched = buildInviteProgressPatch(invite, session);
    expect(patched.sessionId).toBe('sess-test-1');
    expect(patched.progressPercent).toBeGreaterThan(0);
    expect(patched.status).toBe('in_progress');
    expect(patched.currentQuestionLabel).toBeTruthy();
  });
});
