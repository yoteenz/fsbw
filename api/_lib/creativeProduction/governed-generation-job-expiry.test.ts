import { describe, expect, it } from 'vitest';
import {
  governedGenerationJobExpiryMessage,
  GOVERNED_GENERATION_JOB_STALE_INACTIVITY_MS,
  isGovernedGenerationJobExpired,
  isGovernedGenerationJobTerminal,
} from './governed-generation-job-expiry.js';

describe('governed generation job expiry', () => {
  const now = Date.parse('2026-07-13T01:30:00.000Z');

  it('expires jobs past expires_at', () => {
    expect(
      isGovernedGenerationJobExpired(
        {
          status: 'generating',
          expires_at: '2026-07-13T00:07:58.045Z',
          updated_at: '2026-07-12T22:07:59.057Z',
        },
        now
      )
    ).toBe(true);
  });

  it('expires inactive generating jobs after inactivity window', () => {
    const updatedAt = new Date(now - GOVERNED_GENERATION_JOB_STALE_INACTIVITY_MS - 1000).toISOString();
    expect(
      isGovernedGenerationJobExpired(
        {
          status: 'generating',
          expires_at: '2026-07-13T04:00:00.000Z',
          updated_at: updatedAt,
        },
        now
      )
    ).toBe(true);
  });

  it('does not expire fresh active jobs', () => {
    expect(
      isGovernedGenerationJobExpired(
        {
          status: 'generating',
          expires_at: '2026-07-13T04:00:00.000Z',
          updated_at: '2026-07-13T01:20:00.000Z',
        },
        now
      )
    ).toBe(false);
  });

  it('does not expire terminal jobs', () => {
    expect(
      isGovernedGenerationJobExpired(
        {
          status: 'complete',
          expires_at: '2026-07-12T23:00:00.000Z',
          updated_at: '2026-07-12T20:00:00.000Z',
        },
        now
      )
    ).toBe(false);
  });

  it('returns expiry-specific messages', () => {
    expect(
      governedGenerationJobExpiryMessage({
        status: 'generating',
        expires_at: '2026-07-13T00:07:58.045Z',
        updated_at: '2026-07-12T22:07:59.057Z',
      })
    ).toBe('Generation work order expired — submit again to retry');
  });

  it('recognizes terminal statuses', () => {
    expect(isGovernedGenerationJobTerminal('expired')).toBe(true);
    expect(isGovernedGenerationJobTerminal('generating')).toBe(false);
  });
});
