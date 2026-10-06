import { sendEmail } from '../../_lib/email/sendEmail';

export const config = {
  runtime: 'nodejs',
};

type Body = {
  email: string;
  companyName: string;
  activationUrl: string;
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  if (!body.email || !body.activationUrl || !body.companyName) {
    return json({ error: 'Missing fields' }, 400);
  }

  const subject = 'Your AIO Office is ready';
  const html = `
    <p>Hi,</p>
    <p>Your AIO office for <strong>${escapeHtml(body.companyName)}</strong> is ready.</p>
    <p><a href="${escapeAttr(body.activationUrl)}">Activate your AIO office</a></p>
    <p>This link expires in 7 days. If it expires, contact All In One to request a new invite.</p>
  `;

  try {
    await sendEmail({
      to: body.email,
      subject,
      html,
    });
    return json({ ok: true, deliveryStatus: 'INVITE_SENT' }, 200);
  } catch (err) {
    console.error('[migration] activation invite email failed', err);
    return json({ ok: false, deliveryStatus: 'INVITE_FAILED' }, 502);
  }
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, '&quot;');
}
