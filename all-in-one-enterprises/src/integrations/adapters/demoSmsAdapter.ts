import type {
  AdapterExecuteResult,
  AdapterVerifyResult,
  SmsProviderAdapter,
  SmsSendAdapterRequest,
} from '../integrationAdapter';
import type { IntegrationCapability, IntegrationConnection } from '../integrationTypes';

export class DemoSmsAdapter implements SmsProviderAdapter {
  readonly providerSlug = 'demo-sms';
  readonly adapterVersion = '1.0.0';

  verifyConnection(connection: IntegrationConnection): Promise<AdapterVerifyResult> {
    return Promise.resolve({
      ok: true,
      testResult: 'SUCCESS',
      capabilities: ['MESSAGING', 'WEBHOOK'],
      safeMessage: `Demo SMS (${connection.environment})`,
    });
  }

  getCapabilities(): IntegrationCapability[] {
    return ['MESSAGING', 'WEBHOOK'];
  }

  async execute(): Promise<AdapterExecuteResult> {
    return { status: 'SUCCEEDED' };
  }

  async sendSms(request: SmsSendAdapterRequest): Promise<AdapterExecuteResult> {
    return {
      status: 'SUCCEEDED',
      externalReference: `demo_sms_${request.messageId.slice(0, 8)}`,
      result: { delivered: true, label: 'DEMO DELIVERY' },
    };
  }

  async processInbound(body: string): Promise<{ optOut: boolean; reply?: string }> {
    const normalized = body.trim().toUpperCase();
    if (normalized === 'STOP' || normalized === 'UNSUBSCRIBE') {
      return { optOut: true };
    }
    return { optOut: false, reply: 'Demo auto-reply received' };
  }

  disconnect(): Promise<{ ok: boolean }> {
    return Promise.resolve({ ok: true });
  }
}

export const demoSmsAdapter = new DemoSmsAdapter();
