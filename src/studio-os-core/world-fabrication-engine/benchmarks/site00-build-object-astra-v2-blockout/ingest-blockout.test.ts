import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { ingestFabricationAssetPackage } from '../../package-ingestion/ingest-workflow';

const ROOT = join(import.meta.dirname);
const REPORTS = join(ROOT, 'ingestion-reports');

describe('Astra V2 blockout WFE ingestion', () => {
  it('ingests blockout package (expect warnings without GLB)', () => {
    const result = ingestFabricationAssetPackage({
      projectId: 'site00',
      assetId: 'site00_build_object_astra_v2_blockout',
      productionProfileId: 'SITE00_BUILD_OBJECT_ASTRA_V2_BLOCKOUT',
      packageRoot: ROOT,
      outputReportsDir: REPORTS,
    });
    expect(result.outcome).toMatch(/INGESTED/);
    expect(existsSync(join(REPORTS, 'readiness-report.json'))).toBe(true);
    expect(existsSync(join(REPORTS, 'inventory.json'))).toBe(true);
  });
});
