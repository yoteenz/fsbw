import type { SupabaseClient } from '@supabase/supabase-js';
import { unlockLoungeContentWithTickets } from './slayTickets.js';
import {
  fetchPsaEntitlementsForUser,
  pickActiveEntitlement,
  type PsaEntitlementRow,
} from './psaEntitlements.js';
import { getEducationSeasonById } from '../../src/content/education/hierarchy/catalog.js';
import { PSA_TODAY_EPISODES } from '../../src/content/psa-today/index.js';
import {
  isEpisodeFullLessonReleased,
  resolveEpisodeGrantDate,
} from '../../src/content/education/hierarchy/releaseResolver.js';
import { resolvePsaWatchPolicy } from '../../src/components/lounge/psa-today/psaWatchPolicy.js';
import {
  assertCanPurchaseSeasonPass,
  syncQualifyingProductCareSeasonPass,
} from './psaSeasonAccess.js';

export type SeasonPassRow = {
  id: string;
  user_id: string;
  mastery_id: string;
  season_id: string;
  acquired_at: string;
  access_source: string;
  slay_ticket_cost_at_purchase: number | null;
  status: string;
};

function addCalendarYears(from: Date, years: number): Date {
  const d = new Date(from);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function rowToSeasonPass(row: SeasonPassRow) {
  return {
    id: row.id,
    userId: row.user_id,
    masteryId: row.mastery_id,
    seasonId: row.season_id,
    acquiredAt: row.acquired_at,
    accessSource: row.access_source as 'slay-ticket' | 'member' | 'promotion' | 'admin' | 'qualifying-product',
    slayTicketCostAtPurchase: row.slay_ticket_cost_at_purchase ?? undefined,
    status: row.status as 'active' | 'revoked' | 'refunded',
  };
}

export async function fetchSeasonPassEntitlementsForUser(
  supabase: SupabaseClient,
  userId: string,
  seasonId?: string
) {
  let q = supabase
    .from('season_pass_entitlements')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('acquired_at', { ascending: false });
  if (seasonId) q = q.eq('season_id', seasonId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return ((data as SeasonPassRow[]) ?? []).map(rowToSeasonPass);
}

export async function redeemSeasonPassEntitlement(
  supabase: SupabaseClient,
  userId: string,
  params: {
    seasonId: string;
    ticketCost: number;
    accessSource?: 'slay-ticket' | 'member' | 'promotion' | 'admin' | 'qualifying-product';
  }
) {
  const season = getEducationSeasonById(params.seasonId);
  if (!season) return { ok: false as const, error: 'Season not found' };
  if (!season.allowSeasonPass) return { ok: false as const, error: 'Season Pass not available' };

  await syncQualifyingProductCareSeasonPass(supabase, userId);

  const purchaseGate = await assertCanPurchaseSeasonPass(supabase, userId, params.seasonId);
  if (!purchaseGate.allowed) {
    const existing = await fetchSeasonPassEntitlementsForUser(supabase, userId, params.seasonId);
    if (existing.length > 0) {
      const balanceRes = await supabase
        .from('profiles')
        .select('slay_ticket_balance')
        .eq('id', userId)
        .maybeSingle();
      const balance = Math.max(
        0,
        Number((balanceRes.data as { slay_ticket_balance?: number } | null)?.slay_ticket_balance) || 0,
      );
      return {
        ok: true as const,
        balance,
        seasonPass: existing[0],
        alreadyActive: true,
        blockedDuplicatePurchase: true,
        blockReason: purchaseGate.reason,
      };
    }
    return {
      ok: false as const,
      error:
        purchaseGate.reason === 'already-included-with-qualifying-purchase'
          ? 'Care Mastery already included with your qualifying purchase'
          : 'Season Pass not available',
    };
  }

  const existing = await fetchSeasonPassEntitlementsForUser(supabase, userId, params.seasonId);
  if (existing.length > 0) {
    const balanceRes = await supabase
      .from('profiles')
      .select('slay_ticket_balance')
      .eq('id', userId)
      .maybeSingle();
    const balance = Math.max(
      0,
      Number((balanceRes.data as { slay_ticket_balance?: number } | null)?.slay_ticket_balance) || 0
    );
    return { ok: true as const, balance, seasonPass: existing[0], alreadyActive: true };
  }

  const ticketCost = Math.max(0, Math.floor(params.ticketCost));
  if (ticketCost > 0) {
    const balanceRes = await supabase
      .from('profiles')
      .select('slay_ticket_balance')
      .eq('id', userId)
      .maybeSingle();
    const balance = Math.max(
      0,
      Number((balanceRes.data as { slay_ticket_balance?: number } | null)?.slay_ticket_balance) || 0
    );
    if (balance < ticketCost) return { ok: false as const, balance, error: 'Insufficient Slay Tickets' };

    const nextBalance = balance - ticketCost;
    await supabase.from('profiles').update({ slay_ticket_balance: nextBalance }).eq('id', userId);
    await supabase.from('slay_ticket_transactions').insert({
      user_id: userId,
      type: 'used',
      amount: -ticketCost,
      source: 'education_season_pass',
      description: `SEASON PASS · ${season.title} (-${ticketCost})`,
      related_content_id: season.id,
    });
  }

  const acquiredAt = new Date().toISOString();
  const { data: inserted, error } = await supabase
    .from('season_pass_entitlements')
    .insert({
      user_id: userId,
      mastery_id: season.masteryId,
      season_id: season.id,
      acquired_at: acquiredAt,
      access_source: params.accessSource ?? 'slay-ticket',
      slay_ticket_cost_at_purchase: ticketCost,
      status: 'active',
    })
    .select('*')
    .single();

  if (error || !inserted) {
    return { ok: false as const, error: error?.message ?? 'Failed to create Season Pass' };
  }

  const seasonPass = rowToSeasonPass(inserted as SeasonPassRow);
  const sync = await syncSeasonPassEpisodeGrants(supabase, userId, season.id);

  const balanceRes = await supabase
    .from('profiles')
    .select('slay_ticket_balance')
    .eq('id', userId)
    .maybeSingle();
  const balance = Math.max(
    0,
    Number((balanceRes.data as { slay_ticket_balance?: number } | null)?.slay_ticket_balance) || 0
  );

  return {
    ok: true as const,
    balance,
    seasonPass,
    grantedEpisodeIds: sync.grantedEpisodeIds,
  };
}

async function grantEpisodeFromSeasonPass(
  supabase: SupabaseClient,
  userId: string,
  params: {
    episodeId: string;
    contentId: string;
    seasonPassAcquiredAt: string;
    episodeReleaseAt?: string;
    contentTitle?: string;
    includedWatches?: number;
    accessDurationYears?: number;
  }
) {
  const existing = await fetchPsaEntitlementsForUser(supabase, userId, params.episodeId);
  const active = pickActiveEntitlement(existing);
  if (active && active.watchesRemaining > 0 && new Date(active.expiresAt).getTime() > Date.now()) {
    return { granted: false as const, entitlement: active };
  }

  const grantedAtIso = resolveEpisodeGrantDate({
    seasonPassAcquiredAt: params.seasonPassAcquiredAt,
    episodeReleaseAt: params.episodeReleaseAt,
  });
  const grantedAt = new Date(grantedAtIso);
  const expiresAt = addCalendarYears(
    grantedAt,
    params.accessDurationYears ?? 1
  ).toISOString();
  const totalWatches = Math.max(1, params.includedWatches ?? 3);

  await unlockLoungeContentWithTickets(supabase, userId, {
    contentId: params.contentId,
    ticketCost: 0,
    accessType: 'rental',
    expiresAt,
    contentTitle: params.contentTitle,
  });

  const { data: inserted, error } = await supabase
    .from('psa_episode_entitlements')
    .insert({
      user_id: userId,
      episode_id: params.episodeId,
      content_id: params.contentId,
      access_source: 'season-pass',
      redeemed_at: grantedAtIso,
      expires_at: expiresAt,
      total_watches: totalWatches,
      watches_used: 0,
      pending_watch_seconds: 0,
      status: 'active',
      slay_ticket_cost_at_redemption: 0,
    })
    .select('*')
    .single();

  if (error || !inserted) {
    throw new Error(error?.message ?? 'Failed to grant episode from Season Pass');
  }

  const fresh = await fetchPsaEntitlementsForUser(supabase, userId, params.episodeId);
  const entitlement = pickActiveEntitlement(fresh);
  return { granted: true as const, entitlement };
}

/**
 * Idempotent resolver — grants released Episode access for active Season Pass holders.
 * Call on season page, episode page, library load, entitlement refresh (no cron required yet).
 */
export async function syncSeasonPassEpisodeGrants(
  supabase: SupabaseClient,
  userId: string,
  seasonId?: string
) {
  const passes = await fetchSeasonPassEntitlementsForUser(supabase, userId, seasonId);
  const grantedEpisodeIds: string[] = [];

  for (const pass of passes) {
    const season = getEducationSeasonById(pass.seasonId);
    if (!season) continue;

    for (const slot of season.episodeSlots) {
      if (!slot.psaEpisodeId) continue;
      const episode = PSA_TODAY_EPISODES.find((ep) => ep.id === slot.psaEpisodeId);
      if (!episode) continue;
      if (!isEpisodeFullLessonReleased(episode)) continue;

      const policy = resolvePsaWatchPolicy(episode);
      const contentId = episode.linkedContentPackId ?? episode.id;
      const result = await grantEpisodeFromSeasonPass(supabase, userId, {
        episodeId: episode.id,
        contentId,
        seasonPassAcquiredAt: pass.acquiredAt,
        episodeReleaseAt: episode.releaseAt,
        contentTitle: episode.title,
        includedWatches: policy.includedWatches,
        accessDurationYears: policy.accessDurationYears,
      });
      if (result.granted) grantedEpisodeIds.push(episode.id);
    }
  }

  return { grantedEpisodeIds };
}

export async function fetchSeasonPassStateForUser(
  supabase: SupabaseClient,
  userId: string
) {
  await syncQualifyingProductCareSeasonPass(supabase, userId);
  await syncSeasonPassEpisodeGrants(supabase, userId);
  const passes = await fetchSeasonPassEntitlementsForUser(supabase, userId);
  return { seasonPasses: passes };
}
