import { describe, expect, it } from 'vitest';
import { preloadImage } from './pageLoadReadiness';

describe('pageLoadReadiness', () => {
  it('preloadImage resolves without throwing for empty url', async () => {
    await expect(preloadImage('')).resolves.toBeUndefined();
  });
});
