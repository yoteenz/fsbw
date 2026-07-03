import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { sendEmail } from '../_lib/email/sendEmail.js';
import { getProfileContact } from '../_lib/email/triggers.js';

/** GET /api/admin/users – list auth users (admin only). Paginated via ?page=1&per_page=50 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const supabase = getSupabaseAdmin();

  if (req.method === 'GET') {
    try {
      const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
      const perPage = Math.min(100, Math.max(1, parseInt(String(req.query.per_page || '50'), 10)));
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) return res.status(500).json({ error: error.message });
      const users = (data?.users ?? []).map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        banned_until: u.banned_until,
        email_confirmed_at: u.email_confirmed_at,
      }));
      return res.status(200).json({ users, total: data?.total_count ?? users.length });
    } catch (e) {
      return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
    }
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const action = body.action as string;
    const userId = body.userId as string | undefined;
    const email = body.email as string | undefined;

    if (action === 'disable' && userId) {
      try {
        const { data, error } = await supabase.auth.admin.updateUserById(userId, { ban_duration: '876000h' });
        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ success: true, user: data?.user });
      } catch (e) {
        return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
      }
    }

    if (action === 'enable' && userId) {
      try {
        const { data, error } = await supabase.auth.admin.updateUserById(userId, { ban_duration: 'none' });
        if (error) return res.status(400).json({ error: error.message });
        return res.status(200).json({ success: true, user: data?.user });
      } catch (e) {
        return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
      }
    }

    if (action === 'trigger-password-reset' && (email || userId)) {
      let targetEmail: string | null = (email && String(email).trim()) || null;
      if (!targetEmail && userId) {
        const { data: u } = await supabase.auth.admin.getUserById(userId);
        targetEmail = u?.user?.email ?? null;
      }
      if (!targetEmail) return res.status(400).json({ error: 'User has no email' });
      try {
        const siteUrl = (process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')).replace(/\/$/, '');
        const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: targetEmail,
          options: { redirectTo: `${siteUrl}/sign-in` },
        });
        if (linkErr) return res.status(400).json({ error: linkErr.message });
        const resetLink =
          (linkData as { properties?: { action_link?: string } })?.properties?.action_link || '';
        if (!resetLink) return res.status(500).json({ error: 'Could not generate reset link' });

        let customerName = 'SLAYER';
        if (userId) {
          const contact = await getProfileContact(supabase, userId);
          if (contact) customerName = contact.customerName;
        }

        const mail = await sendEmail({
          templateType: 'password_reset',
          recipientEmail: targetEmail,
          variables: { customerName, resetLink, ctaUrl: resetLink },
        });
        if (!mail.sent) return res.status(503).json({ error: mail.error || 'Email send failed' });
        return res.status(200).json({ success: true, message: 'Password reset email sent' });
      } catch (e) {
        return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
      }
    }

    return res.status(400).json({ error: 'Invalid action or missing userId/email' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
