import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { authorizeSite00BlockoutPhaseB } from './codex-phase-b-authorization';

describe('authorizeSite00BlockoutPhaseB', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
  });

  it('blocks when paid flag is false', () => {
    const r = authorizeSite00BlockoutPhaseB({ allowPaidGeneration: false });
    expect(r.allowed).toBe(false);
    expect(r.budgetEnforcement).toBe('SOFT_ONLY');
  });

  it('blocks when budget env missing', () => {
    delete process.env.WFE_FOUNDER_AUTHORIZED_BUDGET_USD;
    delete process.env.WFE_BLOCKOUT_PHASE_B_AUTHORIZED;
    const r = authorizeSite00BlockoutPhaseB({ allowPaidGeneration: true });
    expect(r.allowed).toBe(false);
  });

  it('allows when all gates set', () => {
    process.env.WFE_FOUNDER_AUTHORIZED_BUDGET_USD = '15';
    process.env.WFE_BLOCKOUT_PHASE_B_AUTHORIZED = '1';
    const r = authorizeSite00BlockoutPhaseB({ allowPaidGeneration: true });
    expect(r.allowed).toBe(true);
  });
});
