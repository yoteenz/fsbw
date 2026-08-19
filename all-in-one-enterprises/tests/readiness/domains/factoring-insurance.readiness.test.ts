import { describe, expect, it } from 'vitest';
import { directFactoringEnabled } from '../../../src/factoring/factoringConfig';

describe('Factoring & Insurance readiness', () => {
  it('does not enable direct factoring funding simulation by default', () => {
    expect(directFactoringEnabled).toBe(false);
  });

  it('does not simulate insurer quote API when partner key absent', () => {
    expect(Boolean(process.env.AIO_INSURANCE_PARTNER_API_KEY)).toBe(false);
  });
});
