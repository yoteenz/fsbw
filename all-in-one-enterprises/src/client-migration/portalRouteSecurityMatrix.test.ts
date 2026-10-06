import { describe, expect, it } from 'vitest';
import { evaluatePortalPathAccess } from './portalLifecycleAccess';

const PORTAL = '/all-in-one/portal/vault';
const REVIEW = '/all-in-one/portal/activation/review';
const ACTIVATION = '/all-in-one/office-activation/token';

const LIFECYCLES = [
  'KNOWN_UNMIGRATED',
  'MIGRATION_IN_PROGRESS',
  'MIGRATION_REVIEW_REQUIRED',
  'PREBUILT',
  'INVITED',
  'CLIENT_CONFIRMATION_REQUIRED',
  'ACTIVE',
  'PAUSED',
  'ENDED',
] as const;

describe('portal route security matrix', () => {
  for (const lifecycle of LIFECYCLES) {
    it(`${lifecycle} — portal access`, () => {
      const decision = evaluatePortalPathAccess(lifecycle, PORTAL);
      if (lifecycle === 'ACTIVE') {
        expect(decision).toBe('ALLOW_PORTAL');
      } else if (lifecycle === 'INVITED') {
        expect(decision).toBe('REDIRECT_ACTIVATION');
      } else if (lifecycle === 'CLIENT_CONFIRMATION_REQUIRED') {
        expect(decision).toBe('REDIRECT_ACTIVATION_REVIEW');
      } else {
        expect(decision).toBe('BLOCK_NO_PORTAL');
      }
    });
  }

  it('PREBUILT cannot bypass via activation review URL', () => {
    expect(evaluatePortalPathAccess('PREBUILT', REVIEW)).toBe('BLOCK_NO_PORTAL');
  });

  it('INVITED may use activation route', () => {
    expect(evaluatePortalPathAccess('INVITED', ACTIVATION)).toBe('ALLOW_PORTAL');
  });
});
