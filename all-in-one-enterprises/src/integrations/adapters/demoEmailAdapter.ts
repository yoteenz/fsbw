import type {
  AdapterExecuteResult,
  AdapterVerifyResult,
  EmailProviderAdapter,
  EmailSendAdapterRequest,
} from '../integrationAdapter';
import type { IntegrationCapability, IntegrationConnection } from '../integrationTypes';

export class DemoEmailAdapter implements EmailProviderAdapter {
  readonly providerSlug = 'demo-email';
  readonly adapterVersion = '1.0.0';

  verifyConnection(connection: IntegrationConnection): Promise<AdapterVerifyResult> {
    return Promise.resolve({
      ok: true,
      testResult: 'SUCCESS',
      capabilities: ['MESSAGING', 'WEBHOOK'],
      safeMessage: `Demo email (${connection.environment})`,
    });
  }

  getCapabilities(): IntegrationCapability[] {
    return ['MESSAGING', 'WEBHOOK'];
  }

  async execute(): Promise<AdapterExecuteResult> {
    return { status: 'SUCCEEDED' };
  }

  async sendEmail(request: EmailSendAdapterRequest): Promise<AdapterExecuteResult> {
    if (request.body.toLowerCase().includes('fail')) {
      return { status: 'FAILED', safeError: 'Demo delivery failed', errorCode: 'PROVIDER_UNAVAILABLE' };
    }
    return {
      status: 'SUCCEEDED',
      externalReference: `demo_email_${request.messageId.slice(0, 8)}`,
      result: { delivered: true, label: 'DEMO DELIVERY' },
    };
  }

  disconnect(): Promise<{ ok: boolean }> {
    return Promise.resolve({ ok: true });
  }
}

export const demoEmailAdapter = new DemoEmailAdapter();
