import { describe, expect, it } from 'vitest';
import { isProviderConfigured, resolveEffectiveLookupMethod } from '../../../src/business-formation/businessNameRegistry/stateCapabilities';

describe('Business Formation readiness', () => {
  it('honestly reports registry provider configuration', () => {
    expect(typeof isProviderConfigured()).toBe('boolean');
  });

  it('uses demo lookup in demo mode without claiming live filing', () => {
    expect(resolveEffectiveLookupMethod('TN', true)).toBe('demo');
  });
});
