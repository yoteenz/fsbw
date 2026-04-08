/**
 * Mirror server-backed pending/profile JSON columns into localStorage keys the UI already reads.
 */
import { getUserSubmittedReviewsKey } from '../constants/reviews';
import { getPerUserKey, PER_USER_KEYS } from './perUserStorage';

const SIGNED_FORMS_KEY = 'signedOrderFormsByEmail';

export function persistServerProfileQueuesToLocal(emailRaw: string, profile: Record<string, unknown>): void {
  const email = String(emailRaw || '')
    .trim()
    .toLowerCase();
  if (!email) return;
  try {
    const usr = profile.userSubmittedReviews;
    if (Array.isArray(usr)) {
      localStorage.setItem(getUserSubmittedReviewsKey(email), JSON.stringify(usr));
    }
    const aff = profile.affiliateSubmittedContent;
    if (aff && typeof aff === 'object') {
      localStorage.setItem(getPerUserKey(PER_USER_KEYS.affiliateSubmittedContent, email), JSON.stringify(aff));
    }
    const sof = profile.signedOrderForms;
    if (Array.isArray(sof)) {
      const raw = localStorage.getItem(SIGNED_FORMS_KEY);
      const all: Record<string, unknown[]> = raw ? JSON.parse(raw) : {};
      all[email] = sof as unknown[];
      localStorage.setItem(SIGNED_FORMS_KEY, JSON.stringify(all));
    }
  } catch {
    /* ignore */
  }
}
