const RESEND_API = 'https://api.resend.com/emails';

import { renderEmailTemplate } from './renderTemplate.js';
import type { SendEmailParams, SendEmailResult } from './types.js';
import { assertTemplateType } from './renderTemplate.js';

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
 * Never import this from frontend code — API keys stay on Vercel only.
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

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
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
    const r = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resolveFromAddress(),
        to: [recipientEmail],
        subject: subject.slice(0, 300),
        html,
        text,
        tags: [{ name: 'template', value: templateType }],
      }),
    });

    if (!r.ok) {
      let msg = await r.text();
      try {
        const j = JSON.parse(msg) as { message?: string };
        if (typeof j?.message === 'string') msg = j.message;
      } catch {
        /* keep text */
      }
      return { sent: false, error: msg.slice(0, 500), templateType, recipientEmail };
    }

    let id: string | undefined;
    try {
      const data = (await r.json()) as { id?: string };
      id = data?.id;
    } catch {
      /* optional */
    }

    return { sent: true, id, templateType, recipientEmail };
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
