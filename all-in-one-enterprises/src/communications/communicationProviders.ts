import type { CommMessage, CommMessageStatus } from './communicationTypes';

export interface EmailSendRequest {
  to: string;
  subject: string;
  body: string;
  messageId: string;
}

export interface SmsSendRequest {
  to: string;
  body: string;
  messageId: string;
}

export interface ProviderSendResult {
  ok: boolean;
  status: CommMessageStatus;
  providerMessageId?: string;
  error?: string;
  manualRequired?: boolean;
}

export interface EmailProvider {
  readonly name: string;
  isConfigured(): boolean;
  send(request: EmailSendRequest): ProviderSendResult;
}

export interface SmsProvider {
  readonly name: string;
  isConfigured(): boolean;
  send(request: SmsSendRequest): ProviderSendResult;
}

/** Demo email — Sprint 18 integration platform uses DemoEmailAdapter in integrations/adapters */
export class DemoEmailProvider implements EmailProvider {
  readonly name = 'integration-demo-email';

  isConfigured(): boolean {
    return true;
  }

  send(request: EmailSendRequest): ProviderSendResult {
    if (request.body.toLowerCase().includes('fail')) {
      return { ok: false, status: 'failed', error: 'Demo delivery failed' };
    }
    return {
      ok: true,
      status: 'sent',
      providerMessageId: `demo_email_${request.messageId.slice(0, 8)}`,
    };
  }
}

export class DemoSmsProvider implements SmsProvider {
  readonly name = 'integration-demo-sms';

  isConfigured(): boolean {
    return true;
  }

  send(request: SmsSendRequest): ProviderSendResult {
    return {
      ok: true,
      status: 'sent',
      providerMessageId: `demo_sms_${request.messageId.slice(0, 8)}`,
    };
  }
}

export function resolveEmailProvider(mode: 'demo' | 'disabled' | 'provider'): EmailProvider {
  if (mode === 'disabled') return new DemoEmailProvider();
  return new DemoEmailProvider();
}

export function resolveSmsProvider(mode: 'demo' | 'disabled' | 'provider'): SmsProvider {
  if (mode === 'disabled') return new DemoSmsProvider();
  return new DemoSmsProvider();
}

export function portalDeliveryResult(_message: CommMessage): ProviderSendResult {
  return { ok: true, status: 'sent' };
}

export function recordExternalDelivery(messageId: string): ProviderSendResult {
  return { ok: true, status: 'recorded_externally', providerMessageId: `ext_${messageId}` };
}

export interface WebhookHandlerFoundation {
  verifySignature(_payload: string, _signature: string): boolean;
  handleIdempotent(_eventId: string): boolean;
}

export const webhookFoundation: WebhookHandlerFoundation = {
  verifySignature: () => false,
  handleIdempotent: () => true,
};
