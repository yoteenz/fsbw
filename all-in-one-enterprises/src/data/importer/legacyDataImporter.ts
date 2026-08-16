/**
 * Future-ready legacy data importer — dry-run only in Sprint 20.
 */

export interface ImportValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  recordRef?: string;
}

export interface ImportDryRunResult {
  recordsRead: number;
  recordsValid: number;
  recordsRejected: number;
  duplicates: number;
  warnings: ImportValidationIssue[];
  errors: ImportValidationIssue[];
}

export interface LegacyDataImporter {
  validate(): Promise<ImportValidationIssue[]>;
  transform(): Promise<unknown[]>;
  dryRun(): Promise<ImportDryRunResult>;
  import(): Promise<{ imported: number; skipped: number }>;
  verify(): Promise<boolean>;
}

export class DemoLegacyDataImporter implements LegacyDataImporter {
  async validate(): Promise<ImportValidationIssue[]> {
    return [];
  }

  async transform(): Promise<unknown[]> {
    return [];
  }

  async dryRun(): Promise<ImportDryRunResult> {
    return {
      recordsRead: 0,
      recordsValid: 0,
      recordsRejected: 0,
      duplicates: 0,
      warnings: [{ severity: 'warning', code: 'PRODUCTION_IMPORT_DISABLED', message: 'Production import is NOT ENABLED in Sprint 20' }],
      errors: [],
    };
  }

  async import(): Promise<{ imported: number; skipped: number }> {
    throw new Error('Production import is NOT ENABLED — use dryRun() only');
  }

  async verify(): Promise<boolean> {
    return true;
  }
}

export function createLegacyDataImporter(): LegacyDataImporter {
  return new DemoLegacyDataImporter();
}
