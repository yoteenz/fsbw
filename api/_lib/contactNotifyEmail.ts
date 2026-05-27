const RESEND_API = 'https://api.resend.com/emails';

function isValidEmail(e: string): boolean {
  const s = e.trim().toLowerCase();
  if (s.length < 3 || s.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function resolveContactNotifyRecipients(): string[] {
  const explicit =
    process.env.CONTACT_INBOUND_EMAIL?.trim() ||
    process.env.BRAND_CONTACT_NOTIFY_EMAIL?.trim() ||
    '';
  if (explicit && isValidEmail(explicit)) return [explicit.toLowerCase()];

  const adminList = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(isValidEmail);
  if (adminList.length > 0) return adminList;

  return ['kateenaarmstrong@gmail.com'];
}

export async function sendBrandContactNotifyEmail(payload: {
  name: string;
  email: string;
  isOrderRelated: boolean;
  orderNumber: string;
  message: string;
  inquiryId: string;
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false, error: 'RESEND_API_KEY not configured' };
  }

  const from =
    process.env.NEWSLETTER_FROM_EMAIL?.trim() ||
    'Frontal Slayer <onboarding@resend.dev>';

  const to = resolveContactNotifyRecipients();
  const subject = `BRAND CONTACT: ${payload.name}`.slice(0, 300);
  const lines = [
    'NEW CONTACT FORM SUBMISSION',
    '',
    `ID: ${payload.inquiryId}`,
    `NAME: ${payload.name}`,
    `EMAIL: ${payload.email}`,
    `ORDER RELATED: ${payload.isOrderRelated ? 'YES' : 'NO'}`,
    `ORDER NUMBER: ${payload.orderNumber || '—'}`,
    '',
    'MESSAGE:',
    payload.message,
  ];
  const text = lines.join('\n');
  const html = `<pre style="font-family:monospace;font-size:13px;white-space:pre-wrap">${text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')}</pre>`;

  try {
    const r = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, text, html }),
    });
    if (!r.ok) {
      const errText = await r.text();
      return { sent: false, error: errText.slice(0, 500) };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : 'Send failed' };
  }
}
