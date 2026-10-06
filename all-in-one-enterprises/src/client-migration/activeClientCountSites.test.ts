import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

const CANONICAL_SITES = [
  'office-core/officeCommandCenterService.ts',
  'management/managementQueryLayer.ts',
  'management/managementMetricRegistry.ts',
  'office/pages/ManagementPages.tsx',
  'office/pages/ClientsListPage.tsx',
  'vault/documentVaultMetrics.ts',
];

describe('active client count canonical sites', () => {
  it('six founder surfaces reference canonical active rule', () => {
    for (const rel of CANONICAL_SITES) {
      const text = readFileSync(resolve(ROOT, rel), 'utf8');
      expect(
        text.includes('countActiveClients') ||
          text.includes('countActiveClientsCanonical') ||
          text.includes('isCountedActiveClient') ||
          text.includes('active_customers'),
      ).toBe(true);
    }
  });
});
