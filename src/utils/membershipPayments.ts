/**
 * Admin-visible membership payment history (initial checkout + future renewals from a payment provider).
 * Stored in localStorage for the same browser as other admin revenue demo data; production should sync from Supabase / Stripe webhooks.
 */

export const ADMIN_MEMBERSHIP_PAYMENTS_KEY = 'adminMembershipPayments';

export type MembershipPaymentKind = 'initial' | 'renewal';

export type MembershipPaymentRecord = {
  id: string;
  createdAt: string;
  userEmail: string;
  subscriptionTier: string;
  amountUsd: number;
  autoRenew: boolean;
  kind: MembershipPaymentKind;
  /** ISO date when the next charge is expected (auto-renew on) or period end */
  nextBillingAt?: string;
  /** Provider reference when integrated (Stripe invoice/subscription id) */
  externalId?: string;
  /** Set when row comes from Supabase (Stripe webhook); omitted for localStorage-only rows */
  source?: 'local' | 'supabase';
};

function safeParse(raw: string | null): MembershipPaymentRecord[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function loadMembershipPayments(): MembershipPaymentRecord[] {
  if (typeof window === 'undefined') return [];
  return safeParse(localStorage.getItem(ADMIN_MEMBERSHIP_PAYMENTS_KEY));
}

/** Same list shape admin revenue uses; newest first. */
export function buildMembershipPaymentsList(): MembershipPaymentRecord[] {
  const list = loadMembershipPayments();
  return [...list].sort((a, b) => {
    const ta = new Date(a.createdAt).getTime();
    const tb = new Date(b.createdAt).getTime();
    return tb - ta;
  });
}

export function recordMembershipPayment(entry: Omit<MembershipPaymentRecord, 'id' | 'createdAt'> & { id?: string }): MembershipPaymentRecord {
  const id = entry.id || `mship-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const createdAt = new Date().toISOString();
  const row: MembershipPaymentRecord = {
    id,
    createdAt,
    userEmail: entry.userEmail,
    subscriptionTier: entry.subscriptionTier,
    amountUsd: entry.amountUsd,
    autoRenew: entry.autoRenew,
    kind: entry.kind,
    nextBillingAt: entry.nextBillingAt,
    externalId: entry.externalId,
    source: 'local',
  };
  if (typeof window === 'undefined') return row;
  const prev = loadMembershipPayments();
  prev.push(row);
  localStorage.setItem(ADMIN_MEMBERSHIP_PAYMENTS_KEY, JSON.stringify(prev));
  try {
    window.dispatchEvent(new CustomEvent('membershipPaymentsUpdated'));
  } catch {
    /* ignore */
  }
  return row;
}

export function membershipPaymentsTotalUsd(list: MembershipPaymentRecord[]): number {
  return list.reduce((s, r) => s + (Number.isFinite(r.amountUsd) ? r.amountUsd : 0), 0);
}

/** Merge Supabase (Stripe) rows with local demo rows; dedupe by Stripe invoice id. Newest first. */
export function mergeMembershipPaymentLists(
  local: MembershipPaymentRecord[],
  remote: MembershipPaymentRecord[]
): MembershipPaymentRecord[] {
  const remoteNorm = remote.map((r) => ({ ...r, source: 'supabase' as const }));
  const extRemote = new Set(remoteNorm.map((r) => r.externalId).filter(Boolean) as string[]);
  const localOnly = local
    .filter((l) => !l.externalId || !extRemote.has(l.externalId))
    .map((l) => ({ ...l, source: (l.source ?? 'local') as 'local' | 'supabase' }));
  const combined = [...remoteNorm, ...localOnly];
  combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return combined;
}
