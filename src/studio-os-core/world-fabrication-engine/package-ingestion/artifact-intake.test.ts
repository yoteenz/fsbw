import { describe, expect, it } from 'vitest';
import { resolveFullV2ReviewPackage, FULL_V2_PACKAGE_CANONICAL_NAME } from './artifact-intake';

describe('full V2 package intake', () => {
  it('reports missing when full review zip not present', async () => {
    const result = await resolveFullV2ReviewPackage();
    expect(result.status).toBe('MISSING');
    if (result.status === 'MISSING') {
      expect(result.intakeInstructions).toContain(FULL_V2_PACKAGE_CANONICAL_NAME);
    }
  });
});
