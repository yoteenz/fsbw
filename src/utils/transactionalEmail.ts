import { getAccessToken } from './api';

const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? '';

async function emailApiFetch(path: string, options: { method?: string; body?: unknown } = {}): Promise<Response> {
  const token = await getAccessToken();
  const url = `${API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

export type EmailTemplateCategory = {
  id: string;
  label: string;
  templates: Array<{ type: string; label: string; description: string }>;
};

export async function fetchEmailTemplateCatalog(): Promise<{
  categories: EmailTemplateCategory[];
  sampleVariables: Record<string, string | number>;
}> {
  const res = await emailApiFetch('/api/email/templates');
  if (res.status === 403) throw new Error('Admin access required');
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function previewEmailTemplate(payload: {
  templateType: string;
  variables?: Record<string, string | number>;
  subject?: string;
}): Promise<{ html: string; subject: string }> {
  const res = await emailApiFetch('/api/email/send', {
    method: 'POST',
    body: { ...payload, recipientEmail: 'preview@frontalslayer.com', preview: true },
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = text.slice(0, 400);
    try {
      const j = JSON.parse(text) as { error?: string };
      if (typeof j?.error === 'string') msg = j.error;
    } catch {
      /* keep text */
    }
    throw new Error(msg);
  }
  const data = (await res.json()) as { html?: string; subject?: string };
  return { html: data.html || '', subject: data.subject || '' };
}

export async function notifyOrderLifecycleEmail(payload: {
  recipientEmail: string;
  templateType?: string;
  orderStatus?: string;
  trackingNumber?: string;
  variables?: Record<string, string | number>;
}): Promise<void> {
  const res = await emailApiFetch('/api/admin/transactional-notify', {
    method: 'POST',
    body: payload,
  });
  if (!res.ok) {
    console.warn('[notifyOrderLifecycleEmail]', await res.text());
  }
}

export async function notifyBackInStockEmails(
  entries: Array<{ email: string; productName: string }>
): Promise<void> {
  if (entries.length === 0) return;
  const res = await emailApiFetch('/api/inventory/back-in-stock-notify', {
    method: 'POST',
    body: { entries },
  });
  if (!res.ok) {
    console.warn('[notifyBackInStockEmails]', await res.text());
  }
}

export async function notifySelfBackInStock(productName: string): Promise<void> {
  const res = await emailApiFetch('/api/client/back-in-stock-notify', {
    method: 'POST',
    body: { productName },
  });
  if (!res.ok) {
    console.warn('[notifySelfBackInStock]', await res.text());
  }
}

export async function notifyRewardsEmail(payload: {
  event: string;
  recipientEmail?: string;
  userId?: string;
  variables?: Record<string, string | number>;
}): Promise<void> {
  const res = await emailApiFetch('/api/admin/rewards-notify', {
    method: 'POST',
    body: payload,
  });
  if (!res.ok) {
    console.warn('[notifyRewardsEmail]', await res.text());
  }
}
