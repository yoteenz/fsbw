import type { SupabaseClient } from '@supabase/supabase-js';
import type { ResolvedPsaSeasonAccess } from '../../src/content/education/types.js';
import { getEducationSeasonById } from '../../src/content/education/hierarchy/catalog.js';
import { resolvePsaSeasonAccess } from '../../src/content/education/hierarchy/psaSeasonAccessResolver.js';
import {
  CARE_MASTERY_CANONICAL_SEASON_ID,
  isCareMasterySeasonId,
} from '../../src/content/education/hierarchy/care/seasons.js';
import {
  carePurchaseProfileQualifiesForCareMasterySeason,
} from '../../src/content/education/care/careMasteryProductEntitlements.js';
import {
  QUALIFYING_PRODUCT_GRANTS_FULL_CARE_SEASON_PASS,
} from '../../src/content/education/care/careEntitlementPolicy.js';
import {
  fetchPsaEntitlementsForUser,
  pickActiveEntitlement,
} from './psaEntitlements.js';
import {
  fetchSeasonPassEntitlementsForUser,
  syncSeasonPassEpisodeGrants,
} from './seasonPassEntitlements.js';
import { syncCareEntitlementsFromOrders } from './careEntitlements.js';
import { getSeasonIdsForPsaEpisode } from '../../src/content/education/hierarchy/psaSeasonAccessResolver.js';

/**
 * Idempotent — legacy path only when QUALIFYING_PRODUCT_GRANTS_FULL_CARE_SEASON_PASS is true.
 * Prospective policy: hair purchases grant Care Guides, not Care Mastery season passes.
 */
export async function syncQualifyingProductCareSeasonPass(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ created: boolean; preservedExisting: boolean }> {
  const season = getEducationSeasonById(CARE_MASTERY_CANONICAL_SEASON_ID);
  if (!season?.accessConfig?.qualifyingProductEntitlementEnabled) {
    return { created: false, preservedExisting: false };
  }

  const profiles = await syncCareEntitlementsFromOrders(supabase, userId);
  const qualifying = profiles.filter(carePurchaseProfileQualifiesForCareMasterySeason);
  if (qualifying.length === 0) {
    return { created: false, preservedExisting: false };
  }

  if (!QUALIFYING_PRODUCT_GRANTS_FULL_CARE_SEASON_PASS) {
    return { created: false, preservedExisting: false };
  }

  const existing = await fetchSeasonPassEntitlementsForUser(
    supabase,
    userId,
    CARE_MASTERY_CANONICAL_SEASON_ID,
  );
  if (existing.length > 0) {
    return { created: false, preservedExisting: true };
  }

  const primaryOrderId = qualifying[0]?.orderId;
  const { error } = await supabase.from('season_pass_entitlements').insert({
    user_id: userId,
    mastery_id: season.masteryId,
    season_id: CARE_MASTERY_CANONICAL_SEASON_ID,
    access_source: 'qualifying-product',
    slay_ticket_cost_at_purchase: 0,
    status: 'active',
  });

  if (error) {
    if (error.code === '23505') {
      return { created: false, preservedExisting: true };
    }
    throw new Error(error.message);
  }

  await syncSeasonPassEpisodeGrants(supabase, userId, CARE_MASTERY_CANONICAL_SEASON_ID);
  void primaryOrderId;
  return { created: true, preservedExisting: false };
}

export async function resolvePsaSeasonAccessForUser(
  supabase: SupabaseClient,
  userId: string,
  seasonId: string,
  options?: { syncQualifying?: boolean },
): Promise<ResolvedPsaSeasonAccess> {
  if (options?.syncQualifying !== false && isCareMasterySeasonId(seasonId)) {
    await syncQualifyingProductCareSeasonPass(supabase, userId);
  }

  const season = getEducationSeasonById(seasonId);
  const passRows = await fetchSeasonPassEntitlementsForUser(supabase, userId, seasonId);
  const seasonPasses = passRows.map((p) => ({
    id: p.id,
    userId: p.userId,
    masteryId: p.masteryId,
    seasonId: p.seasonId,
    acquiredAt: p.acquiredAt,
    accessSource: p.accessSource,
    slayTicketCostAtPurchase: p.slayTicketCostAtPurchase,
    status: p.status,
  }));

  const episodeIds = season?.episodeSlots
    .map((s) => s.psaEpisodeId)
    .filter((id): id is string => Boolean(id));
  const ownedEpisodeIds: string[] = [];
  if (episodeIds?.length) {
    const allEntitlements = await fetchPsaEntitlementsForUser(supabase, userId);
    for (const episodeId of episodeIds) {
      const rows = allEntitlements.filter((e) => e.episodeId === episodeId);
      const active = pickActiveEntitlement(rows);
      if (active) ownedEpisodeIds.push(episodeId);
    }
  }

  return resolvePsaSeasonAccess({
    seasonId,
    seasonPasses,
    ownedEpisodeIds,
  });
}

export async function assertCanPurchaseSeasonPass(
  supabase: SupabaseClient,
  userId: string,
  seasonId: string,
): Promise<{ allowed: boolean; access: ResolvedPsaSeasonAccess; reason?: string }> {
  const access = await resolvePsaSeasonAccessForUser(supabase, userId, seasonId);
  if (access.seasonOwned) {
    return {
      allowed: false,
      access,
      reason: access.complimentary
        ? 'already-included-with-qualifying-purchase'
        : 'already-entitled',
    };
  }
  if (!access.canPurchaseSeasonPass) {
    return { allowed: false, access, reason: 'purchase-not-available' };
  }
  return { allowed: true, access };
}

export async function assertCanPurchaseEpisode(
  supabase: SupabaseClient,
  userId: string,
  episodeId: string,
): Promise<{ allowed: boolean; access?: ResolvedPsaSeasonAccess; reason?: string }> {
  const seasonIds = getSeasonIdsForPsaEpisode(episodeId);
  for (const seasonId of seasonIds) {
    const access = await resolvePsaSeasonAccessForUser(supabase, userId, seasonId);
    if (access.seasonOwned) {
      return {
        allowed: false,
        access,
        reason: access.complimentary
          ? 'already-included-with-qualifying-purchase'
          : 'season-already-owned',
      };
    }
  }
  return { allowed: true };
}
