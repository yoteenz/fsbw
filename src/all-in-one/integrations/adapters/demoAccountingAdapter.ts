import type {
  AccountingExportRequest,
  AccountingProviderAdapter,
  AdapterExecuteResult,
  AdapterVerifyResult,
} from '../integrationAdapter';
import type { IntegrationCapability, IntegrationConnection } from '../integrationTypes';

export class DemoAccountingAdapter implements AccountingProviderAdapter {
  readonly providerSlug = 'demo-accounting';
  readonly adapterVersion = '1.0.0';

  verifyConnection(connection: IntegrationConnection): Promise<AdapterVerifyResult> {
    return Promise.resolve({
      ok: true,
      testResult: 'SUCCESS',
      capabilities: ['FINANCIAL', 'WRITE', 'SYNC'],
      safeMessage: `Demo accounting export (${connection.environment})`,
    });
  }

  getCapabilities(): IntegrationCapability[] {
    return ['FINANCIAL', 'WRITE', 'SYNC'];
  }

  async execute(): Promise<AdapterExecuteResult> {
    return { status: 'SUCCEEDED' };
  }

  async exportInvoice(request: AccountingExportRequest): Promise<AdapterExecuteResult> {
    if (!request.mappingVersion || request.mappingVersion === 'missing') {
      return {
        status: 'FAILED',
        safeError: 'Accounting mapping missing — configure finance mappings before export',
        errorCode: 'VALIDATION_ERROR',
      };
    }
    return {
      status: 'SUCCEEDED',
      externalReference: `DEMO-ACCT-INV-${request.invoiceId.slice(0, 8).toUpperCase()}`,
      result: { exportedAt: new Date().toISOString(), label: 'DEMO EXPORT' },
    };
  }

  disconnect(): Promise<{ ok: boolean }> {
    return Promise.resolve({ ok: true });
  }
}

export const demoAccountingAdapter = new DemoAccountingAdapter();
