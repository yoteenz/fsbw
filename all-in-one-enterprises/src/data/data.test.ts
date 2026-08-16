import { describe, expect, it } from 'vitest';
import { validateAioEnvironment, effectiveDataMode, isFrontalSlayerSupabaseUrl } from '../config/env';
import { FRONTAL_SLAYER_SUPABASE_PROJECT_ID } from './constants';
import { PERSISTENCE_INVENTORY } from './persistenceInventory';
import { evaluateDataSystemStatus, AIO_MIGRATION_FILES } from './dataHealth';
import { DemoDocumentStorageProvider } from './storage/documentStorageProvider';
import { createLegacyDataImporter } from './importer/legacyDataImporter';
import { can, canAccessOrganization } from './permissions/serverPermissionService';
import { createDemoSeed } from '../demo/demoSeed';
import { demoServiceRequestRepository } from './repositories/demoRepositories';

describe('environment contract', () => {
  it('defaults to demo mode without Supabase credentials', () => {
    expect(effectiveDataMode()).toBe('demo');
  });

  it('detects Frontal Slayer Supabase URL', () => {
    expect(isFrontalSlayerSupabaseUrl(`https://${FRONTAL_SLAYER_SUPABASE_PROJECT_ID}.supabase.co`)).toBe(true);
    expect(isFrontalSlayerSupabaseUrl('https://dedicated-aio-project.supabase.co')).toBe(false);
  });

  it('validates demo mode without errors', () => {
    const result = validateAioEnvironment();
    expect(result.ok).toBe(true);
  });
});

describe('persistence inventory', () => {
  it('covers all major domains', () => {
    const domains = new Set(PERSISTENCE_INVENTORY.map((e) => e.domain));
    expect(domains.has('IDENTITY')).toBe(true);
    expect(domains.has('CRM')).toBe(true);
    expect(domains.has('AUDIT')).toBe(true);
    expect(PERSISTENCE_INVENTORY.length).toBeGreaterThanOrEqual(14);
  });
});

describe('migration registry', () => {
  it('lists ordered migration files', () => {
    expect(AIO_MIGRATION_FILES.length).toBe(8);
    expect(AIO_MIGRATION_FILES[0]).toContain('identity_foundation');
  });

  it('blocks FS project id in constants', () => {
    expect(FRONTAL_SLAYER_SUPABASE_PROJECT_ID).toBe('hyycomvcaqxxvyrfupes');
  });
});

describe('data system health', () => {
  it('reports architecture ready in demo mode', () => {
    const status = evaluateDataSystemStatus({ contractTestsPassing: true, rlsTestsPassing: true });
    expect(status.architectureReady).toBe(true);
    expect(status.dataMode).toBe('demo');
    expect(status.repositoryContract).toBe('PASSING');
  });
});

describe('document storage demo provider', () => {
  it('prepares and authorizes demo upload/download', async () => {
    const provider = new DemoDocumentStorageProvider();
    const prep = await provider.prepareUpload({
      organizationId: 'client-a',
      documentType: 'insurance_cert',
      classification: 'customer',
      mimeType: 'application/pdf',
      sizeBytes: 1024,
      originalFilename: 'cert.pdf',
    });
    expect(prep.storagePath).toContain('client-a');
    const dl = await provider.getAuthorizedDownload({
      documentId: 'doc-1',
      organizationId: 'client-a',
      actorUserId: 'user-1',
    });
    expect(dl?.url).toContain('demo://');
  });
});

describe('legacy importer', () => {
  it('dry run does not enable production import', async () => {
    const importer = createLegacyDataImporter();
    await expect(importer.import()).rejects.toThrow(/NOT ENABLED/);
    const dry = await importer.dryRun();
    expect(dry.warnings.some((w) => w.code === 'PRODUCTION_IMPORT_DISABLED')).toBe(true);
  });
});

describe('server permissions', () => {
  it('denies org access outside membership', () => {
    const actor = {
      userId: 'u1',
      organizationIds: ['org-a'],
      permissions: new Set(['customers.read']),
      isInternalStaff: false,
    };
    expect(canAccessOrganization(actor, 'org-b')).toBe(false);
    expect(can(actor, 'customers.read')).toBe(true);
  });
});

describe('demo store v20', () => {
  it('seeds with schema version 20', () => {
    const seed = createDemoSeed();
    expect(seed.version).toBe(20);
    expect(seed.dataSystem?.demoSchemaVersion).toBe(20);
  });
});

describe('repository contract (demo)', () => {
  it('loads service requests from demo repository', async () => {
    const requests = await demoServiceRequestRepository.loadAll();
    expect(Array.isArray(requests)).toBe(true);
  });
});
