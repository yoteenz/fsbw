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

/** Demo — never claims external delivery */
export class DemoEmailProvider implements EmailProvider {
  readonly name = 'demo';

  isConfigured(): boolean {
    return false;
  }

  send(_request: EmailSendRequest): ProviderSendResult {
    return { ok: false, status: 'demo', manualRequired: true, error: 'No email provider configured — use copy/record externally' };
  }
}

export class DemoSmsProvider implements SmsProvider {
  readonly name = 'demo';

  isConfigured(): boolean {
    return false;
  }

  send(_request: SmsSendRequest): ProviderSendResult {
    return { ok: false, status: 'demo', manualRequired: true, error: 'No SMS provider configured — use copy/record externally' };
  }
}

export function resolveEmailProvider(mode: 'demo' | 'disabled' | 'provider'): EmailProvider {
  if (mode === 'provider') return new DemoEmailProvider();
  return new DemoEmailProvider();
}

export function resolveSmsProvider(_mode: 'demo' | 'disabled' | 'provider'): SmsProvider {
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
