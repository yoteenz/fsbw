import type {
  AdapterExecuteResult,
  AdapterVerifyResult,
  FactoringProviderAdapter,
  FactoringSubmitRequest,
} from '../integrationAdapter';
import type { IntegrationCapability, IntegrationConnection } from '../integrationTypes';
import { mapUnknownProviderEnum } from '../integrationAdapter';

export class DemoFactoringAdapter implements FactoringProviderAdapter {
  readonly providerSlug = 'demo-factoring';
  readonly adapterVersion = '1.0.0';

  verifyConnection(connection: IntegrationConnection): Promise<AdapterVerifyResult> {
    return Promise.resolve({
      ok: true,
      testResult: 'SUCCESS',
      capabilities: ['WRITE', 'READ', 'SYNC'],
      safeMessage: `Demo factoring partner (${connection.environment})`,
    });
  }

  getCapabilities(): IntegrationCapability[] {
    return ['WRITE', 'READ', 'SYNC'];
  }

  async execute(): Promise<AdapterExecuteResult> {
    return { status: 'SUCCEEDED' };
  }

  async submitPackage(request: FactoringSubmitRequest): Promise<AdapterExecuteResult> {
    if (!request.authorized) {
      return {
        status: 'REQUIRES_MANUAL_ACTION',
        safeError: 'Customer authorization required before provider submission',
        errorCode: 'BUSINESS_RULE_REJECTION',
      };
    }
    if (request.documents.length === 0) {
      return { status: 'FAILED', safeError: 'Required documents missing', errorCode: 'VALIDATION_ERROR' };
    }
    return {
      status: 'SUCCEEDED',
      externalReference: `DEMO-FAC-${request.submissionId.slice(0, 8).toUpperCase()}`,
      result: { providerStatus: 'Provider Reviewing — DEMO PROVIDER', canonicalStatus: 'partner_review' },
    };
  }

  mapProviderStatus(raw: string): { canonical: string; raw: string } {
    const map: Record<string, string> = {
      funded: 'funded',
      approved: 'approved',
      pending: 'documents_needed',
      reviewing: 'partner_review',
      declined: 'closed',
    };
    const key = raw.toLowerCase();
    return { canonical: map[key] ?? mapUnknownProviderEnum(raw), raw };
  }

  disconnect(): Promise<{ ok: boolean }> {
    return Promise.resolve({ ok: true });
  }
}

export const demoFactoringAdapter = new DemoFactoringAdapter();
