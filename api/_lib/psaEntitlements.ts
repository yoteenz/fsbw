import type { SupabaseClient } from '@supabase/supabase-js';
import { unlockLoungeContentWithTickets } from './slayTickets.js';
import { assertCanPurchaseEpisode } from './psaSeasonAccess.js';
import { syncSeasonPassEpisodeGrants } from './seasonPassEntitlements.js';

export type PsaEntitlementRow = {
  id: string;
  user_id: string;
  episode_id: string;
  content_id: string;
  access_source: string;
  redeemed_at: string;
  expires_at: string;
  total_watches: number;
  watches_used: number;
  pending_watch_seconds: number;
  status: string;
  slay_ticket_cost_at_redemption: number | null;
};

export type PsaWatchSessionRow = {
  id: string;
  entitlement_id: string;
  user_id: string;
  episode_id: string;
  started_at: string;
  last_active_at: string;
  actual_watched_seconds: number;
  qualification_threshold_seconds: number;
  qualified: boolean;
  consumed_watch_at: string | null;
  closed_at: string | null;
};

function addCalendarYears(from: Date, years: number): Date {
  const d = new Date(from);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function rowToEntitlement(row: PsaEntitlementRow) {
  const watchesRemaining = Math.max(0, row.total_watches - row.watches_used);
  const expired = new Date(row.expires_at).getTime() <= Date.now();
  let status = row.status as 'active' | 'watches-exhausted' | 'expired' | 'revoked';
  if (expired && status === 'active') status = 'expired';
  if (watchesRemaining <= 0 && status === 'active') status = 'watches-exhausted';

  return {
    id: row.id,
    episodeId: row.episode_id,
    userId: row.user_id,
    contentId: row.content_id,
    accessSource: row.access_source as 'slay-ticket' | 'member' | 'purchase' | 'admin' | 'free' | 'season-pass',
    redeemedAt: row.redeemed_at,
    expiresAt: row.expires_at,
    totalWatches: row.total_watches,
    watchesUsed: row.watches_used,
    watchesRemaining,
    pendingWatchSeconds: Number(row.pending_watch_seconds) || 0,
    status,
    slayTicketCostAtRedemption: row.slay_ticket_cost_at_redemption ?? undefined,
  };
}

function rowToSession(row: PsaWatchSessionRow) {
  return {
    sessionId: row.id,
    episodeId: row.episode_id,
    entitlementId: row.entitlement_id,
    userId: row.user_id,
    startedAt: row.started_at,
    lastActiveAt: row.last_active_at,
    actualWatchedSeconds: Number(row.actual_watched_seconds) || 0,
    qualificationThresholdSeconds: Number(row.qualification_threshold_seconds) || 0,
    qualified: row.qualified,
    consumedWatchAt: row.consumed_watch_at ?? undefined,
    closedAt: row.closed_at ?? undefined,
  };
}

export async function fetchPsaEntitlementsForUser(
  supabase: SupabaseClient,
  userId: string,
  episodeId?: string
) {
  let q = supabase
    .from('psa_episode_entitlements')
    .select('*')
    .eq('user_id', userId)
    .order('redeemed_at', { ascending: false });
  if (episodeId) q = q.eq('episode_id', episodeId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return ((data as PsaEntitlementRow[]) || []).map(rowToEntitlement);
}

export function pickActiveEntitlement(
  entitlements: ReturnType<typeof rowToEntitlement>[]
) {
  const now = Date.now();
  return entitlements.find((e) => {
    if (e.status === 'revoked') return false;
    if (new Date(e.expiresAt).getTime() <= now) return false;
    if (e.watchesRemaining <= 0 && e.status === 'watches-exhausted') return false;
    return e.status === 'active' || (e.watchesRemaining > 0 && new Date(e.expiresAt).getTime() > now);
  });
}

export async function redeemPsaEpisodeEntitlement(
  supabase: SupabaseClient,
  userId: string,
  params: {
    episodeId: string;
    contentId: string;
    ticketCost: number;
    contentTitle?: string;
    includedWatches?: number;
    accessDurationYears?: number;
  }
): Promise<{
  ok: boolean;
  balance: number;
  entitlement?: ReturnType<typeof rowToEntitlement>;
  alreadyActive?: boolean;
  error?: string;
}> {
  const seasonGate = await assertCanPurchaseEpisode(supabase, userId, params.episodeId);
  if (!seasonGate.allowed && seasonGate.access?.seasonOwned) {
    await syncSeasonPassEpisodeGrants(supabase, userId, seasonGate.access.seasonId);
    const existingAfterSync = await fetchPsaEntitlementsForUser(supabase, userId, params.episodeId);
    const activeAfterSync = pickActiveEntitlement(existingAfterSync);
    const balanceRes = await supabase.from('profiles').select('slay_ticket_balance').eq('id', userId).maybeSingle();
    const balance = Math.max(0, Number((balanceRes.data as { slay_ticket_balance?: number } | null)?.slay_ticket_balance) || 0);
    if (activeAfterSync) {
      return { ok: true, balance, entitlement: activeAfterSync, alreadyActive: true };
    }
    return {
      ok: false,
      balance,
      error:
        seasonGate.reason === 'already-included-with-qualifying-purchase'
          ? 'Episode included with your Care Mastery season access'
          : 'Episode already covered by season access',
    };
  }

  const existing = await fetchPsaEntitlementsForUser(supabase, userId, params.episodeId);
  const active = pickActiveEntitlement(existing);
  if (active && active.watchesRemaining > 0 && new Date(active.expiresAt).getTime() > Date.now()) {
    const balanceRes = await supabase.from('profiles').select('slay_ticket_balance').eq('id', userId).maybeSingle();
    const balance = Math.max(0, Number((balanceRes.data as { slay_ticket_balance?: number } | null)?.slay_ticket_balance) || 0);
    return { ok: true, balance, entitlement: active, alreadyActive: true };
  }

  const unlock = await unlockLoungeContentWithTickets(supabase, userId, {
    contentId: params.contentId,
    ticketCost: params.ticketCost,
    accessType: 'rental',
    contentTitle: params.contentTitle,
    expiresAt: addCalendarYears(new Date(), params.accessDurationYears ?? 1).toISOString(),
    forceCatalogCost: true,
  });

  if (!unlock.ok) {
    return { ok: false, balance: unlock.balance, error: unlock.error };
  }

  const redeemedAt = new Date();
  const expiresAt = addCalendarYears(redeemedAt, params.accessDurationYears ?? 1).toISOString();
  const totalWatches = Math.max(1, params.includedWatches ?? 3);

  const { data: inserted, error } = await supabase
    .from('psa_episode_entitlements')
    .insert({
      user_id: userId,
      episode_id: params.episodeId,
      content_id: params.contentId,
      access_source: 'slay-ticket',
      redeemed_at: redeemedAt.toISOString(),
      expires_at: expiresAt,
      total_watches: totalWatches,
      watches_used: 0,
      pending_watch_seconds: 0,
      status: 'active',
      slay_ticket_cost_at_redemption: params.ticketCost,
    })
    .select('*')
    .single();

  if (error || !inserted) {
    return { ok: false, balance: unlock.balance, error: error?.message ?? 'Failed to create entitlement' };
  }

  return { ok: true, balance: unlock.balance, entitlement: rowToEntitlement(inserted as PsaEntitlementRow) };
}

export async function startPsaWatchSession(
  supabase: SupabaseClient,
  userId: string,
  params: {
    episodeId: string;
    entitlementId: string;
    qualificationThresholdSeconds: number;
  }
) {
  const { data: ent, error: entErr } = await supabase
    .from('psa_episode_entitlements')
    .select('*')
    .eq('id', params.entitlementId)
    .eq('user_id', userId)
    .maybeSingle();

  if (entErr || !ent) throw new Error('Entitlement not found');

  const row = ent as PsaEntitlementRow;
  const watchesRemaining = row.total_watches - row.watches_used;
  const expired = new Date(row.expires_at).getTime() <= Date.now();
  if (expired) throw new Error('Access expired');
  if (watchesRemaining <= 0) throw new Error('No watches remaining');

  const { data: openSession } = await supabase
    .from('psa_watch_sessions')
    .select('*')
    .eq('entitlement_id', params.entitlementId)
    .eq('user_id', userId)
    .is('closed_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (openSession) {
    return rowToSession(openSession as PsaWatchSessionRow);
  }

  const { data: created, error } = await supabase
    .from('psa_watch_sessions')
    .insert({
      entitlement_id: params.entitlementId,
      user_id: userId,
      episode_id: params.episodeId,
      qualification_threshold_seconds: params.qualificationThresholdSeconds,
    })
    .select('*')
    .single();

  if (error || !created) throw new Error(error?.message ?? 'Failed to start session');
  return rowToSession(created as PsaWatchSessionRow);
}

export async function syncPsaWatchSessionProgress(
  supabase: SupabaseClient,
  userId: string,
  params: {
    sessionId: string;
    actualWatchedSeconds: number;
    consumeIfQualified?: boolean;
  }
): Promise<{
  session: ReturnType<typeof rowToSession>;
  entitlement: ReturnType<typeof rowToEntitlement>;
  watchConsumed: boolean;
}> {
  const { data: sessionRow, error: sessErr } = await supabase
    .from('psa_watch_sessions')
    .select('*')
    .eq('id', params.sessionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (sessErr || !sessionRow) throw new Error('Session not found');
  const session = sessionRow as PsaWatchSessionRow;

  const { data: entRow, error: entErr } = await supabase
    .from('psa_episode_entitlements')
    .select('*')
    .eq('id', session.entitlement_id)
    .eq('user_id', userId)
    .maybeSingle();

  if (entErr || !entRow) throw new Error('Entitlement not found');
  const ent = entRow as PsaEntitlementRow;

  const pending = Number(ent.pending_watch_seconds) || 0;
  const actual = Math.max(0, params.actualWatchedSeconds);
  const threshold = Number(session.qualification_threshold_seconds) || 0;
  const totalQualifying = pending + actual;
  const alreadyQualified = session.qualified || Boolean(session.consumed_watch_at);

  let watchConsumed = false;

  await supabase
    .from('psa_watch_sessions')
    .update({
      actual_watched_seconds: actual,
      last_active_at: new Date().toISOString(),
      qualified: alreadyQualified || totalQualifying >= threshold,
    })
    .eq('id', params.sessionId)
    .eq('user_id', userId);

  if (
    params.consumeIfQualified &&
    !alreadyQualified &&
    threshold > 0 &&
    totalQualifying >= threshold
  ) {
    const { data: consumed } = await supabase.rpc('psa_consume_watch_if_qualified', {
      p_session_id: params.sessionId,
      p_user_id: userId,
    });

    if (consumed === true) {
      watchConsumed = true;
    } else {
      const watchesUsed = ent.watches_used + 1;
      const watchesRemaining = Math.max(0, ent.total_watches - watchesUsed);
      const nowIso = new Date().toISOString();

      const { error: updErr } = await supabase
        .from('psa_episode_entitlements')
        .update({
          watches_used: watchesUsed,
          pending_watch_seconds: 0,
          status: watchesRemaining <= 0 ? 'watches-exhausted' : 'active',
        })
        .eq('id', ent.id)
        .eq('user_id', userId)
        .eq('watches_used', ent.watches_used);

      if (!updErr) {
        await supabase
          .from('psa_watch_sessions')
          .update({
            qualified: true,
            consumed_watch_at: nowIso,
            actual_watched_seconds: actual,
            last_active_at: nowIso,
          })
          .eq('id', params.sessionId)
          .eq('user_id', userId)
          .is('consumed_watch_at', null);

        watchConsumed = true;
      }
    }
  } else if (!alreadyQualified && totalQualifying < threshold) {
    await supabase
      .from('psa_episode_entitlements')
      .update({ pending_watch_seconds: totalQualifying })
      .eq('id', ent.id)
      .eq('user_id', userId);
  }

  const { data: freshSession } = await supabase
    .from('psa_watch_sessions')
    .select('*')
    .eq('id', params.sessionId)
    .maybeSingle();
  const { data: freshEnt } = await supabase
    .from('psa_episode_entitlements')
    .select('*')
    .eq('id', ent.id)
    .maybeSingle();

  return {
    session: rowToSession((freshSession as PsaWatchSessionRow) ?? session),
    entitlement: rowToEntitlement((freshEnt as PsaEntitlementRow) ?? ent),
    watchConsumed,
  };
}

export async function closePsaWatchSession(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string
) {
  const { data: sessionRow } = await supabase
    .from('psa_watch_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!sessionRow) return null;
  const session = sessionRow as PsaWatchSessionRow;

  if (!session.qualified && !session.consumed_watch_at) {
    const { data: entRow } = await supabase
      .from('psa_episode_entitlements')
      .select('pending_watch_seconds')
      .eq('id', session.entitlement_id)
      .maybeSingle();
    const pending = Number((entRow as { pending_watch_seconds?: number } | null)?.pending_watch_seconds) || 0;
    const total = pending + (Number(session.actual_watched_seconds) || 0);
    await supabase
      .from('psa_episode_entitlements')
      .update({ pending_watch_seconds: total })
      .eq('id', session.entitlement_id)
      .eq('user_id', userId);
  }

  await supabase
    .from('psa_watch_sessions')
    .update({ closed_at: new Date().toISOString(), last_active_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', userId);

  return rowToSession({ ...session, closed_at: new Date().toISOString() });
}

export async function expireStalePsaEntitlements(supabase: SupabaseClient, userId: string) {
  const now = new Date().toISOString();
  await supabase
    .from('psa_episode_entitlements')
    .update({ status: 'expired' })
    .eq('user_id', userId)
    .eq('status', 'active')
    .lt('expires_at', now);
}
