/**
 * Studio World Partner / Agency onboarding — canonical scenario tests.
 */

import { describe, expect, it } from 'vitest';
import {
  generateInvitationToken,
  hashInvitationToken,
  isInvitationExpired,
  assertRoleNotEscalated,
} from './invitation-token';
import {
  isExternalPartnerOrgType,
  resolvePartnerCapabilities,
  isCapabilityBlockedForExternal,
} from './capabilities';
import { FOUNDING_PARTNER_ENTITLEMENT_KEYS, INVITATION_TTL_MS } from './types';
import {
  FIXTURE_ORG_AGENCY,
  FIXTURE_ORG_OWNER,
  FIXTURE_USER_B,
  membershipForUser,
} from '../production-governance/fixtures';
import { resolveBillingOwner } from '../production-governance/governance';

describe('Partner onboarding — invitation security', () => {
  it('generates unique invitation tokens', () => {
    const a = generateInvitationToken();
    const b = generateInvitationToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(20);
  });

  it('stores hash only — raw token never equals hash', () => {
    const token = generateInvitationToken();
    const hash = hashInvitationToken(token);
    expect(hash).not.toBe(token);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('hashInvitationToken is deterministic', () => {
    const token = 'test-token-value';
    expect(hashInvitationToken(token)).toBe(hashInvitationToken(token));
  });

  it('detects expired invitations', () => {
    const past = new Date(Date.now() - 1000).toISOString();
    const future = new Date(Date.now() + 86400000).toISOString();
    expect(isInvitationExpired(past)).toBe(true);
    expect(isInvitationExpired(future)).toBe(false);
  });

  it('blocks role escalation via client payload', () => {
    expect(assertRoleNotEscalated('PRODUCER', 'OWNER').ok).toBe(false);
    expect(assertRoleNotEscalated('PRODUCER', 'PRODUCER').ok).toBe(true);
    expect(assertRoleNotEscalated('ADMIN', undefined).ok).toBe(true);
  });

  it('invitation TTL defaults to 7 days', () => {
    expect(INVITATION_TTL_MS).toBe(7 * 24 * 60 * 60 * 1000);
  });
});

describe('Partner onboarding — Founding Partner entitlements', () => {
  it('includes PLATFORM_ACCESS entitlement key', () => {
    expect(FOUNDING_PARTNER_ENTITLEMENT_KEYS).toContain('PLATFORM_ACCESS');
  });

  it('includes PRODUCTION_ACCESS entitlement key', () => {
    expect(FOUNDING_PARTNER_ENTITLEMENT_KEYS).toContain('PRODUCTION_ACCESS');
  });

  it('includes commercial and image generation keys', () => {
    expect(FOUNDING_PARTNER_ENTITLEMENT_KEYS).toContain('IMAGE_GENERATION');
    expect(FOUNDING_PARTNER_ENTITLEMENT_KEYS).toContain('COMMERCIAL_USE');
  });
});

describe('Partner onboarding — external organization detection', () => {
  it('treats AGENCY, PARTNER, CLIENT_ORG as external', () => {
    expect(isExternalPartnerOrgType('AGENCY')).toBe(true);
    expect(isExternalPartnerOrgType('PARTNER')).toBe(true);
    expect(isExternalPartnerOrgType('CLIENT_ORG')).toBe(true);
  });

  it('does not treat OWNER as external partner', () => {
    expect(isExternalPartnerOrgType('OWNER')).toBe(false);
  });
});

describe('Partner onboarding — external capability fence', () => {
  const externalCaps = resolvePartnerCapabilities('AGENCY', true);
  const ownerCaps = resolvePartnerCapabilities('OWNER', false);

  it('blocks Product Photography for external partners', () => {
    const cap = externalCaps.find((c) => c.routeKey === 'product-photography-generate');
    expect(cap?.state).toBe('BLOCKED_EXTERNAL');
  });

  it('blocks Live Try-On for external partners', () => {
    const cap = externalCaps.find((c) => c.routeKey === 'live-try-on');
    expect(cap?.state).toBe('BLOCKED_EXTERNAL');
  });

  it('blocks Commerce FAL for external partners', () => {
    const cap = externalCaps.find((c) => c.routeKey === 'commerce-fal');
    expect(cap?.state).toBe('BLOCKED_EXTERNAL');
  });

  it('blocks Slay Forecast for external partners', () => {
    const cap = externalCaps.find((c) => c.routeKey === 'slay-forecast');
    expect(cap?.state).toBe('BLOCKED_EXTERNAL');
  });

  it('Virtual Production AVAILABLE for founding partner agency', () => {
    const cap = externalCaps.find((c) => c.routeKey === 'studio-virtual-production');
    expect(cap?.state).toBe('AVAILABLE');
  });

  it('Founder Render POLICY_DEPENDENT for founding partner agency', () => {
    const cap = externalCaps.find((c) => c.routeKey === 'founder-render-generate');
    expect(cap?.state).toBe('POLICY_DEPENDENT');
  });

  it('Studio Builder POLICY_DEPENDENT for founding partner agency', () => {
    const cap = externalCaps.find((c) => c.routeKey === 'studio-builder-generate');
    expect(cap?.state).toBe('POLICY_DEPENDENT');
  });

  it('owner org shows MIGRATION_REQUIRED not BLOCKED_EXTERNAL for unmigrated routes', () => {
    const cap = ownerCaps.find((c) => c.routeKey === 'product-photography-generate');
    expect(cap?.state).toBe('MIGRATION_REQUIRED');
  });

  it('isCapabilityBlockedForExternal identifies REQUIRES_MIGRATION routes', () => {
    expect(isCapabilityBlockedForExternal('product-photography-generate')).toBe(true);
    expect(isCapabilityBlockedForExternal('live-try-on')).toBe(true);
    expect(isCapabilityBlockedForExternal('studio-builder-generate')).toBe(false);
  });
});

describe('Partner onboarding — dual-context billing separation', () => {
  it('same operator can belong to owner org and agency org', () => {
    expect(membershipForUser(FIXTURE_USER_B, FIXTURE_ORG_OWNER.id)).toBeTruthy();
    expect(membershipForUser(FIXTURE_USER_B, FIXTURE_ORG_AGENCY.id)).toBeTruthy();
  });

  it('Frontal Slayer billing owner resolves to owner org', () => {
    const billing = resolveBillingOwner({ organization: FIXTURE_ORG_OWNER });
    expect(billing.organizationSlug).toBe('frontal-slayer');
    expect(billing.billingOwnerId).toBe(FIXTURE_ORG_OWNER.id);
  });

  it('Founding Partner Agency billing owner resolves to agency org', () => {
    const billing = resolveBillingOwner({ organization: FIXTURE_ORG_AGENCY });
    expect(billing.organizationSlug).toBe('founding-partner-agency');
    expect(billing.billingOwnerId).toBe(FIXTURE_ORG_AGENCY.id);
    expect(billing.billingOwnerId).not.toBe(FIXTURE_ORG_OWNER.id);
  });

  it('billing owners differ between contexts for same operator', () => {
    const fsBilling = resolveBillingOwner({ organization: FIXTURE_ORG_OWNER });
    const agencyBilling = resolveBillingOwner({ organization: FIXTURE_ORG_AGENCY });
    expect(fsBilling.billingOwnerId).not.toBe(agencyBilling.billingOwnerId);
  });
});

describe('Partner onboarding — platform vs metered compute', () => {
  it('founding partner capabilities imply complimentary platform tier semantics', () => {
    const caps = resolvePartnerCapabilities('AGENCY', true);
    expect(caps.length).toBe(9);
    expect(caps.some((c) => c.state === 'BLOCKED_EXTERNAL')).toBe(true);
  });

  it('non-founding external partner still fences migration routes', () => {
    const caps = resolvePartnerCapabilities('PARTNER', false);
    const blocked = caps.filter((c) => c.state === 'BLOCKED_EXTERNAL');
    expect(blocked.length).toBe(4);
  });
});

describe('Partner onboarding — tenant isolation expectations', () => {
  it('unrelated org has no membership for collaborator', () => {
    expect(membershipForUser(FIXTURE_USER_B, 'org-c-inaccessible')).toBeNull();
  });

  it('agency org slug is distinct from owner org slug', () => {
    expect(FIXTURE_ORG_AGENCY.slug).not.toBe(FIXTURE_ORG_OWNER.slug);
  });
});
