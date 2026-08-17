import { describe, expect, it } from 'vitest';
import { createDemoSeed } from '../demo/demoSeed';
import { computeDocumentVaultMetrics, computeMigrationDashboardMetrics } from '../vault/documentVaultMetrics';
import { categoriesForTaxonomyGroup } from '../vault/vaultTaxonomy';
import { documentRepository } from '../repositories/documentRepository';
import { createMigrationBatch } from '../demo/archiveMigrationActions';
import { saveDemoStore } from '../demo/demoStore';

describe('document vault metrics', () => {
  it('computes totals from real document records', () => {
    const store = createDemoSeed();
    const docs = documentRepository.listForOffice('client-a', store);
    const metrics = computeDocumentVaultMetrics(docs);
    expect(metrics.total).toBeGreaterThan(0);
    expect(metrics.current).toBeLessThanOrEqual(metrics.total);
  });

  it('filters documents by taxonomy group categories', () => {
    const cats = categoriesForTaxonomyGroup('insurance');
    expect(cats).toContain('insurance');
  });
});

describe('migration dashboard', () => {
  it('returns zero progress when no migration work started', () => {
    const store = createDemoSeed();
    const metrics = computeMigrationDashboardMetrics({
      clients: store.clients,
      documents: store.documents,
      batches: [],
    });
    expect(metrics.clientsDigitized).toBe(0);
    expect(metrics.percentComplete).toBe(0);
  });
});

describe('archive migration workflow', () => {
  it('creates batch scoped to client', () => {
    saveDemoStore(createDemoSeed());
    const batch = createMigrationBatch('client-b', 'staff-2');
    expect(batch.clientId).toBe('client-b');
    expect(batch.organizationId).toBe('client-b');
    expect(batch.state).toBe('uploading');
  });

  it('denies cross-client document listing in portal repository', () => {
    const store = createDemoSeed();
    const aDocs = documentRepository.listForOrganization('client-a', store);
    const bDocs = documentRepository.listForOrganization('client-b', store);
    expect(aDocs.every((d) => d.organizationId === 'client-a')).toBe(true);
    expect(bDocs.every((d) => d.organizationId === 'client-b')).toBe(true);
    expect(aDocs.some((d) => bDocs.some((b) => b.id === d.id))).toBe(false);
  });
});

describe('document visibility', () => {
  it('portal list excludes internal-only records', () => {
    const store = createDemoSeed();
    const portalDocs = documentRepository.listForOrganization('client-a', store);
    expect(portalDocs.every((d) => d.visibility === 'customer')).toBe(true);
  });
});
