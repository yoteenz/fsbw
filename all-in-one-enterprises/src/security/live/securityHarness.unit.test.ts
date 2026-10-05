import { describe, expect, it } from 'vitest';
import { toSessionContract } from '../sessionContract';
import { CORE_LIVE_JWT_ENVS, missingJwtEnvs } from './liveSecurityConfig';

describe('Wave 1 security harness (unit)', () => {
  it('session contract excludes tokens', () => {
    const contract = toSessionContract(null);
    expect(contract.authState).toBe('anonymous');
    expect(Object.keys(contract)).not.toContain('accessToken');
    expect(Object.keys(contract)).not.toContain('refreshToken');
  });

  it('lists missing CI JWT env names without faking pass', () => {
    const missing = missingJwtEnvs(CORE_LIVE_JWT_ENVS);
    expect(Array.isArray(missing)).toBe(true);
  });
});
