import type { SupabaseClient } from '@supabase/supabase-js';
import { sendEmailAsync } from './sendEmail.js';
import type { EmailTemplateType, EmailTemplateVariables } from './types.js';

export async function getProfileContact(
  supabase: SupabaseClient,
  userId: string
): Promise<{ email: string; customerName: string } | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('email, first_name, last_name, firstName, lastName')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  const email = String(row.email || '')
    .trim()
    .toLowerCase();
  if (!email) return null;
  const first = String(row.first_name || row.firstName || '').trim();
  const last = String(row.last_name || row.lastName || '').trim();
  const customerName = [first, last].filter(Boolean).join(' ').trim() || 'SLAYER';
  return { email, customerName };
}

export function triggerTransactionalEmail(payload: {
  templateType: EmailTemplateType;
  recipientEmail: string;
  subject?: string;
  variables?: EmailTemplateVariables;
}): void {
  sendEmailAsync(payload);
}

export async function triggerTransactionalEmailForUser(
  supabase: SupabaseClient,
  userId: string,
  templateType: EmailTemplateType,
  variables: EmailTemplateVariables = {},
  subject?: string
): Promise<void> {
  const contact = await getProfileContact(supabase, userId);
  if (!contact) return;
  sendEmailAsync({
    templateType,
    recipientEmail: contact.email,
    subject,
    variables: {
      customerName: contact.customerName,
      ...variables,
    },
  });
}

export function formatEmailDate(isoOrMs?: string | number | Date): string {
  try {
    const d =
      isoOrMs instanceof Date
        ? isoOrMs
        : typeof isoOrMs === 'number'
          ? new Date(isoOrMs)
          : isoOrMs
            ? new Date(isoOrMs)
            : new Date();
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).toUpperCase();
  } catch {
    return new Date().toLocaleDateString('en-US').toUpperCase();
  }
}
