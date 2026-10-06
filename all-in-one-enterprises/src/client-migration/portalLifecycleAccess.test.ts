import { describe, expect, it } from 'vitest';
import { evaluatePortalPathAccess } from './portalLifecycleAccess';

describe('portal lifecycle access', () => {
  it('blocks PREBUILT from full portal', () => {
    expect(evaluatePortalPathAccess('PREBUILT', '/all-in-one/portal')).toBe('BLOCK_NO_PORTAL');
  });

  it('allows ACTIVE portal routes', () => {
    expect(evaluatePortalPathAccess('ACTIVE', '/all-in-one/portal/money')).toBe('ALLOW_PORTAL');
  });

  it('INVITED only allows activation routes', () => {
    expect(evaluatePortalPathAccess('INVITED', '/all-in-one/office-activation/abc')).toBe('ALLOW_PORTAL');
    expect(evaluatePortalPathAccess('INVITED', '/all-in-one/portal')).toBe('REDIRECT_ACTIVATION');
  });

  it('CLIENT_CONFIRMATION_REQUIRED routes to review experience', () => {
    expect(evaluatePortalPathAccess('CLIENT_CONFIRMATION_REQUIRED', '/all-in-one/portal/activation/review')).toBe(
      'ALLOW_PORTAL',
    );
    expect(evaluatePortalPathAccess('CLIENT_CONFIRMATION_REQUIRED', '/all-in-one/portal/vault')).toBe(
      'REDIRECT_ACTIVATION_REVIEW',
    );
  });
});
