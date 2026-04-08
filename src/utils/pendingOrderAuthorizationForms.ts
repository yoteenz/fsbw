/**
 * Admin Pending → FORMS tab: unsigned-by-admin submissions (client signed, awaiting approval).
 * Stored inside `signedOrderFormsByEmail` entries with `adminApproved === false` until approved.
 */

import type { StoredSignedOrderForm } from './signedOrderFormsStorage';

export const PENDING_ORDER_FORMS_UPDATED_EVENT = 'pendingOrderAuthorizationFormsUpdated';

function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

/** All non-declined, not-yet-approved form rows across every client email in storage. */
export function listPendingOrderAuthorizationFormsForAdmin(): StoredSignedOrderForm[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('signedOrderFormsByEmail');
    if (!raw) return [];
    const all = JSON.parse(raw) as Record<string, StoredSignedOrderForm[]>;
    const out: StoredSignedOrderForm[] = [];
    for (const list of Object.values(all)) {
      if (!Array.isArray(list)) continue;
      for (const e of list) {
        if (e.summaryOnly) continue;
        if (e.adminDeclined) continue;
        /** Only explicit false (post–workflow submit). Legacy rows omit flag → not pending. */
        if (e.adminApproved !== false) continue;
        out.push(e);
      }
    }
    out.sort((a, b) => b.signedAt - a.signedAt);
    return out;
  } catch {
    return [];
  }
}

export function countPendingOrderAuthorizationFormsForAdmin(): number {
  return listPendingOrderAuthorizationFormsForAdmin().length;
}

/** True when linked order is still PLACED (show “VIEW FORM” vs other pipeline labels). */
export function pendingFormShowsViewFormAction(form: StoredSignedOrderForm): boolean {
  if (!form.orderId) return true;
  const email = normalizeEmail(form.email);
  if (!email || typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(`userOrders_${email}`);
    if (!raw) return true;
    const data = JSON.parse(raw) as { activeOrders?: unknown[]; pastOrders?: unknown[] };
    const lists = [...(data.activeOrders || []), ...(data.pastOrders || [])];
    for (const row of lists) {
      const o = row as Record<string, unknown>;
      if (String(o.id || '') !== form.orderId) continue;
      return String(o.status || '').toUpperCase() === 'PLACED';
    }
  } catch {
    /* ignore */
  }
  return true;
}
