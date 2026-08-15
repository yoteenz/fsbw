import type { PaymentProviderMode, PaymentStatus } from './billingTypes';
import type { CurrencyCode } from './money';

export interface PaymentIntentInput {
  invoiceId: string;
  organizationId: string;
  amountMinor: number;
  currency: CurrencyCode;
  idempotencyKey: string;
}

export interface PaymentIntentResult {
  provider: 'demo' | 'stripe_future' | 'disabled';
  clientSecret?: string;
  demoMode: boolean;
  error?: string;
}

export interface PaymentProviderResult {
  success: boolean;
  status: PaymentStatus;
  providerPaymentId?: string;
  methodDisplay?: string;
  failureMessage?: string;
}

export interface PaymentProvider {
  mode: PaymentProviderMode;
  createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntentResult>;
  confirmDemoPayment(input: PaymentIntentInput, outcome: 'success' | 'failure' | 'cancel'): Promise<PaymentProviderResult>;
}

export function getPaymentProviderMode(): PaymentProviderMode {
  const mode = import.meta.env.VITE_AIO_PAYMENT_MODE as PaymentProviderMode | undefined;
  if (mode === 'provider') return 'provider';
  if (mode === 'disabled') return 'disabled';
  return 'demo';
}

class DemoPaymentProvider implements PaymentProvider {
  mode: PaymentProviderMode = 'demo';

  async createPaymentIntent(_input: PaymentIntentInput): Promise<PaymentIntentResult> {
    return {
      provider: 'demo',
      demoMode: true,
    };
  }

  async confirmDemoPayment(
    _input: PaymentIntentInput,
    outcome: 'success' | 'failure' | 'cancel',
  ): Promise<PaymentProviderResult> {
    if (outcome === 'cancel') {
      return { success: false, status: 'cancelled', failureMessage: 'Payment cancelled.' };
    }
    if (outcome === 'failure') {
      return {
        success: false,
        status: 'failed',
        failureMessage: 'Payment could not be completed. Please try again.',
      };
    }
    return {
      success: true,
      status: 'succeeded',
      providerPaymentId: `demo_pay_${crypto.randomUUID().slice(0, 8)}`,
      methodDisplay: 'Demo Payment · Simulated',
    };
  }
}

class DisabledPaymentProvider implements PaymentProvider {
  mode: PaymentProviderMode = 'disabled';

  async createPaymentIntent(): Promise<PaymentIntentResult> {
    return { provider: 'disabled', demoMode: false, error: 'Online payment not yet available.' };
  }

  async confirmDemoPayment(): Promise<PaymentProviderResult> {
    return { success: false, status: 'failed', failureMessage: 'Online payment not yet available.' };
  }
}

class ProviderPaymentProvider implements PaymentProvider {
  mode: PaymentProviderMode = 'provider';

  async createPaymentIntent(): Promise<PaymentIntentResult> {
    return {
      provider: 'stripe_future',
      demoMode: false,
      error: 'Payment provider not configured. Use demo mode for review.',
    };
  }

  async confirmDemoPayment(): Promise<PaymentProviderResult> {
    return { success: false, status: 'failed', failureMessage: 'Provider mode requires server configuration.' };
  }
}

export function getPaymentProvider(): PaymentProvider {
  const mode = getPaymentProviderMode();
  if (mode === 'provider') return new ProviderPaymentProvider();
  if (mode === 'disabled') return new DisabledPaymentProvider();
  return new DemoPaymentProvider();
}
