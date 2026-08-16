import type {
  AdapterExecuteContext,
  AdapterExecuteResult,
  AdapterVerifyResult,
  PaymentProviderAdapter,
  PaymentWebhookPayload,
} from '../integrationAdapter';
import type { IntegrationCapability, IntegrationConnection } from '../integrationTypes';
import { validateMoney } from '../integrationAdapter';

const DEMO_WEBHOOK_SECRET = 'demo_webhook_secret_sha256';

export class DemoPaymentAdapter implements PaymentProviderAdapter {
  readonly providerSlug = 'demo-payment';
  readonly adapterVersion = '1.0.0';

  verifyConnection(connection: IntegrationConnection): Promise<AdapterVerifyResult> {
    return Promise.resolve({
      ok: connection.environment !== 'PRODUCTION',
      testResult: 'SUCCESS',
      capabilities: ['PAYMENT', 'WEBHOOK', 'WRITE'],
      safeMessage: `Demo payment (${connection.environment})`,
    });
  }

  getCapabilities(): IntegrationCapability[] {
    return ['PAYMENT', 'WEBHOOK', 'WRITE'];
  }

  async execute(ctx: AdapterExecuteContext): Promise<AdapterExecuteResult> {
    if (ctx.operationType === 'CREATE_CHECKOUT') {
      return {
        status: 'SUCCEEDED',
        externalReference: `demo_pi_${ctx.idempotencyKey.slice(0, 8)}`,
        result: { checkoutUrl: '/debug/all-in-one/portal/billing', environment: ctx.connection.environment },
      };
    }
    if (ctx.operationType === 'REFUND') {
      return { status: 'SUCCEEDED', externalReference: `demo_ref_${ctx.idempotencyKey.slice(0, 8)}` };
    }
    return { status: 'FAILED', safeError: 'Unsupported payment operation' };
  }

  async processWebhook(payload: PaymentWebhookPayload): Promise<{ ok: boolean; duplicate: boolean; safeError?: string }> {
    const money = validateMoney(payload.amountMinor, payload.currency);
    if (!money.ok) return { ok: false, duplicate: false, safeError: money.error };

    if (payload.signature && payload.signature !== DEMO_WEBHOOK_SECRET) {
      return { ok: false, duplicate: false, safeError: 'Invalid signature' };
    }

    if (payload.eventType === 'DUPLICATE_TEST') {
      return { ok: true, duplicate: true };
    }

    return { ok: true, duplicate: false };
  }

  disconnect(): Promise<{ ok: boolean }> {
    return Promise.resolve({ ok: true });
  }
}

export const demoPaymentAdapter = new DemoPaymentAdapter();
export const DEMO_PAYMENT_WEBHOOK_SECRET = DEMO_WEBHOOK_SECRET;
