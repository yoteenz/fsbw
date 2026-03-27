/**
 * Newsletter eligibility (Account → Settings → newsletter).
 * Profiles expose `notificationNewsletter`; unset defaults to opted-in (matches `fromProfileRow` + app defaults).
 */

export function isNewsletterOptIn(client: Record<string, unknown> | null | undefined): boolean {
  if (!client || typeof client !== 'object') return false;
  const c = client as Record<string, unknown>;
  if (c.notificationNewsletter === false) return false;
  if (c.notificationNewsletter === true) return true;
  if (c.newsletterSubscribed === true) return true;
  try {
    const email = String(c.email || '')
      .trim()
      .toLowerCase();
    if (email && typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(`userNewsletter_${email}`);
      if (raw === 'false' || raw === '0') return false;
      if (raw === 'true' || raw === '1') return true;
      try {
        const parsed = JSON.parse(raw || 'false');
        if (parsed === false || parsed === 'false') return false;
        if (parsed === true || parsed === 'true') return true;
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* ignore */
  }
  return true;
}
