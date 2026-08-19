import { describe, expect, it } from 'vitest';
import { CANONICAL_SERVICE_CATALOG } from '../../../src/services/catalog/serviceCatalog';

describe('Authorities & Permits readiness', () => {
  it('includes authority and permit services in catalog', () => {
    const slugs = CANONICAL_SERVICE_CATALOG.map((s) => s.slug);
    expect(slugs.some((s) => /authority|boc|permit|ifta|irp|tag/i.test(s))).toBe(true);
  });

  it('does not mark automatic government filing as a catalog slug', () => {
    const govAuto = CANONICAL_SERVICE_CATALOG.filter((s) => s.slug.includes('auto-filed-gov'));
    expect(govAuto.length).toBe(0);
  });
});
