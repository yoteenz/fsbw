import type {
  AdapterExecuteResult,
  AdapterVerifyResult,
  InsurancePartnerAdapter,
  InsuranceSubmitRequest,
} from '../integrationAdapter';
import type { IntegrationCapability, IntegrationConnection } from '../integrationTypes';

export class DemoInsuranceAdapter implements InsurancePartnerAdapter {
  readonly providerSlug = 'demo-insurance';
  readonly adapterVersion = '1.0.0';

  verifyConnection(connection: IntegrationConnection): Promise<AdapterVerifyResult> {
    return Promise.resolve({
      ok: true,
      testResult: 'SUCCESS',
      capabilities: ['WRITE', 'READ'],
      safeMessage: `Demo insurance partner (${connection.environment})`,
    });
  }

  getCapabilities(): IntegrationCapability[] {
    return ['WRITE', 'READ'];
  }

  async execute(): Promise<AdapterExecuteResult> {
    return { status: 'SUCCEEDED' };
  }

  async submitReferral(request: InsuranceSubmitRequest): Promise<AdapterExecuteResult> {
    if (!request.authorized) {
      return {
        status: 'REQUIRES_MANUAL_ACTION',
        safeError: 'Authorization required',
        errorCode: 'BUSINESS_RULE_REJECTION',
      };
    }
    return {
      status: 'SUCCEEDED',
      externalReference: `DEMO-INS-${request.requestId.slice(0, 8).toUpperCase()}`,
      result: {
        partnerStatus: 'Information Received — DEMO PARTNER',
        coverageConfirmed: false,
        label: 'Referral received — not active coverage',
      },
    };
  }

  disconnect(): Promise<{ ok: boolean }> {
    return Promise.resolve({ ok: true });
  }
}

export const demoInsuranceAdapter = new DemoInsuranceAdapter();
