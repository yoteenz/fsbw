import { Resend } from 'resend';
import { renderEmailTemplate } from './renderTemplate.js';
import type { SendEmailParams, SendEmailResult } from './types.js';
import { assertTemplateType } from './renderTemplate.js';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  if (!resendClient) resendClient = new Resend(apiKey);
  return resendClient;
}

function isValidEmail(e: string): boolean {
  const s = e.trim().toLowerCase();
  if (s.length < 3 || s.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function resolveFromAddress(): string {
  return (
    process.env.TRANSACTIONAL_FROM_EMAIL?.trim() ||
    process.env.NEWSLETTER_FROM_EMAIL?.trim() ||
    'Frontal Slayer <onboarding@resend.dev>'
  );
}

/**
 * Server-side transactional email sender (Resend).
 * Never import this from frontend code — RESEND_API_KEY stays on Vercel only.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const templateType = assertTemplateType(params.templateType);
  const recipientEmail = String(params.recipientEmail || '')
    .trim()
    .toLowerCase();

  if (!isValidEmail(recipientEmail)) {
    return {
      sent: false,
      error: 'Invalid recipient email',
      templateType,
      recipientEmail,
    };
  }

  const resend = getResendClient();
  if (!resend) {
    return {
      sent: false,
      error: 'RESEND_API_KEY not configured',
      templateType,
      recipientEmail,
    };
  }

  const { html, subject, text } = renderEmailTemplate(
    templateType,
    params.variables || {},
    params.subject
  );

  try {
    const { data, error } = await resend.emails.send({
      from: resolveFromAddress(),
      to: [recipientEmail],
      subject: subject.slice(0, 300),
      html,
      text,
      tags: [{ name: 'template', value: templateType }],
    });

    if (error) {
      return {
        sent: false,
        error: error.message?.slice(0, 500) || 'Send failed',
        templateType,
        recipientEmail,
      };
    }

    return { sent: true, id: data?.id, templateType, recipientEmail };
  } catch (e) {
    return {
      sent: false,
      error: e instanceof Error ? e.message : 'Send failed',
      templateType,
      recipientEmail,
    };
  }
}

/** Fire-and-forget — logs errors but never throws to callers. */
export function sendEmailAsync(params: SendEmailParams): void {
  void sendEmail(params).then((result) => {
    if (!result.sent) {
      console.error('[sendEmail]', result.templateType, result.recipientEmail, result.error);
    }
  });
}

export { renderEmailTemplate } from './renderTemplate.js';
export type { EmailTemplateType, EmailTemplateVariables, SendEmailParams, SendEmailResult } from './types.js';
