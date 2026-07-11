import { describe, expect, it } from 'vitest';
import { ALL_IN_ONE_PERMITTING_PROFILE, TAX_PREPARATION_PROFILE } from '../profiles';
import { createEmptySession, createAnswerForQuestion } from '../session-storage';
import {
  buildDefaultInviteMessage,
  buildInvitePreviewUrl,
  buildInviteProgressPatch,
  buildInviteUrl,
  createInviteRecord,
  deriveInviteStatusFromProgress,
  generateInviteToken,
  hashOwnerPassword,
  isInviteExpired,
  regenerateInviteToken,
  resolveInviteAccess,
  resolveInviteEngagementStage,
  displayInviteEngagement,
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
    expect(buildInvitePreviewUrl('ABC12345')).toContain('preview=owner');
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
    expect(invite.accessStatus).toBe('active');
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
    expect(deriveInviteStatusFromProgress('started', 0, false)).toBe('started');
    expect(deriveInviteStatusFromProgress('not_started', 25, false)).toBe('in_progress');
    expect(deriveInviteStatusFromProgress('in_progress', 80, true)).toBe('completed');
    expect(deriveInviteStatusFromProgress('archived', 50, false)).toBe('archived');
  });

  it('reports engagement stage for owner dashboard', () => {
    const invite = createInviteRecord({
      inviteeName: 'Jane',
      businessName: 'Acme',
      role: 'CPA',
      workerBeingCreated: 'Worker',
      profileId: TAX_PREPARATION_PROFILE.id,
      companyId: TAX_PREPARATION_PROFILE.companyId,
    });
    expect(resolveInviteEngagementStage(invite)).toBe('not_opened');
    expect(displayInviteEngagement(invite)).toBe('Not opened');
    invite.linkOpenedAt = new Date().toISOString();
    expect(resolveInviteEngagementStage(invite)).toBe('link_opened');
    invite.interviewStartedAt = new Date().toISOString();
    invite.status = 'started';
    expect(resolveInviteEngagementStage(invite)).toBe('started');
    invite.progressPercent = 10;
    invite.status = 'in_progress';
    expect(resolveInviteEngagementStage(invite)).toBe('in_progress');
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

  it('hashes owner password deterministically', async () => {
    const a = await hashOwnerPassword('my-secret-key');
    const b = await hashOwnerPassword('my-secret-key');
    const c = await hashOwnerPassword('other-key');
    expect(a).toHaveLength(64);
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it('regenerates token and revokes old link while preserving session', () => {
    const invite = createInviteRecord({
      inviteeName: 'Jane',
      businessName: 'Acme',
      role: 'CPA',
      workerBeingCreated: 'Worker',
      profileId: TAX_PREPARATION_PROFILE.id,
      companyId: TAX_PREPARATION_PROFILE.companyId,
    });
    invite.sessionId = 'sess-keep-1';
    invite.progressPercent = 42;
    const next = regenerateInviteToken(invite, 'NEWTOKEN1');
    expect(next.token).toBe('NEWTOKEN1');
    expect(next.sessionId).toBe('sess-keep-1');
    expect(next.progressPercent).toBe(42);
    expect(next.revokedTokens).toContain(invite.token);
    expect(resolveInviteAccess(next, invite.token).ok).toBe(false);
    expect(resolveInviteAccess(next, next.token).ok).toBe(true);
  });
});

describe('Invite sharing messages', () => {
  const baseInput = {
    inviteeName: 'Maria Lopez',
    businessName: 'Lopez Tax Services',
    role: 'EA',
    workerBeingCreated: 'Lopez Tax Preparation Professional',
    profileId: TAX_PREPARATION_PROFILE.id,
    companyId: TAX_PREPARATION_PROFILE.companyId,
  };

  it('builds default message with name and full URL', () => {
    const invite = createInviteRecord(baseInput, 'TAX12345');
    const url = 'https://example.com/studio-institute/invite/TAX12345';
    const msg = buildDefaultInviteMessage(invite, url);
    expect(msg).toContain('Hi Maria Lopez');
    expect(msg).toContain(url);
    expect(msg).toContain('progress saves automatically');
    expect(msg).toContain('you choose to approve');
  });

  it('uses tax-specific profession wording', () => {
    const invite = createInviteRecord(baseInput, 'TAX12345');
    const msg = buildDefaultInviteMessage(invite, 'https://example.com/studio-institute/invite/TAX12345');
    expect(msg.toLowerCase()).toContain('tax preparation workflow');
    expect(msg.toLowerCase()).toContain('document review');
  });

  it('uses permitting-specific profession wording', () => {
    const invite = createInviteRecord(
      {
        ...baseInput,
        profileId: ALL_IN_ONE_PERMITTING_PROFILE.id,
        companyId: ALL_IN_ONE_PERMITTING_PROFILE.companyId,
        workerBeingCreated: 'All In One Permit Professional',
      },
      'PERMIT99'
    );
    const msg = buildDefaultInviteMessage(invite, 'https://example.com/studio-institute/invite/PERMIT99');
    expect(msg.toLowerCase()).toContain('permitting workflow');
    expect(msg.toLowerCase()).toContain('municipality');
  });

  it('prepends optional welcome note', () => {
    const invite = createInviteRecord({ ...baseInput, welcomeNote: 'Looking forward to learning from you.' }, 'TAX12345');
    const msg = buildDefaultInviteMessage(invite, 'https://example.com/x');
    expect(msg.startsWith('Looking forward')).toBe(true);
  });

  it('blocks paused and revoked access calmly', () => {
    const invite = createInviteRecord(baseInput);
    invite.accessStatus = 'paused';
    const paused = resolveInviteAccess(invite);
    expect(paused.ok).toBe(false);
    invite.accessStatus = 'revoked';
    const revoked = resolveInviteAccess(invite);
    expect(revoked.ok).toBe(false);
    if (!revoked.ok) expect(revoked.message).toContain('currently unavailable');
  });
});
