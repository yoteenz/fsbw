import type { SupabaseClient } from '@supabase/supabase-js';
import type { CarePurchaseProfile } from '../../src/content/education/types.js';
import {
  careProfilesFromOrdersWithStatus,
  type CareOrderLike,
} from '../../src/content/education/care/careOrderParsing.js';
import {
  resolveCareGuideEntitlementsFromProfiles,
  type ResolvedCareContentEntitlement,
} from '../../src/content/education/care/careEntitlementResolver.js';
import { buildYourOwnedUnitFromProfile } from '../../src/content/education/care/careEntitlementResolver.js';

type CareEntitlementRow = {
  id: string;
  user_id: string;
  order_id: string;
  order_line_key: string;
  product_name: string;
  product_type: string;
  base_unit_id: string | null;
  texture_family: string | null;
  configuration_snapshot: Record<string, unknown> | null;
  granted_at: string;
  revoked_at: string | null;
  status: string;
};

function rowToProfile(row: CareEntitlementRow): CarePurchaseProfile {
  const snapshot = row.configuration_snapshot as CarePurchaseProfile['configurationSnapshot'] | null;
  return {
    id: row.id,
    userId: row.user_id,
    orderId: row.order_id,
    orderLineKey: row.order_line_key,
    productName: row.product_name,
    productType: row.product_type,
    baseUnitId: row.base_unit_id ?? undefined,
    textureFamily: row.texture_family ?? undefined,
    configurationSnapshot: snapshot ?? undefined,
    grantedAt: row.granted_at,
    status: row.status as CarePurchaseProfile['status'],
  };
}

function collectOrders(active: unknown, past: unknown): CareOrderLike[] {
  const a = Array.isArray(active) ? (active as CareOrderLike[]) : [];
  const p = Array.isArray(past) ? (past as CareOrderLike[]) : [];
  return [...a, ...p];
}

export async function syncCareEntitlementsFromOrders(
  supabase: SupabaseClient,
  userId: string
): Promise<CarePurchaseProfile[]> {
  const { data: ordersRow } = await supabase
    .from('orders')
    .select('active_orders, past_orders')
    .eq('user_id', userId)
    .maybeSingle();

  const orders = collectOrders(
    (ordersRow as { active_orders?: unknown } | null)?.active_orders,
    (ordersRow as { past_orders?: unknown } | null)?.past_orders
  );

  const parsed = careProfilesFromOrdersWithStatus(orders, userId);

  for (const profile of parsed) {
    if (profile.status === 'active') {
      await supabase.from('care_purchase_entitlements').upsert(
        {
          user_id: userId,
          order_id: profile.orderId,
          order_line_key: profile.orderLineKey,
          product_name: profile.productName,
          product_type: profile.productType,
          base_unit_id: profile.baseUnitId ?? null,
          texture_family: profile.textureFamily ?? null,
          configuration_snapshot: profile.configurationSnapshot ?? null,
          status: 'active',
          revoked_at: null,
        },
        { onConflict: 'user_id,order_id,order_line_key' }
      );
    } else {
      await supabase
        .from('care_purchase_entitlements')
        .update({ status: profile.status, revoked_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('order_id', profile.orderId)
        .eq('order_line_key', profile.orderLineKey);
    }
  }

  const { data: rows } = await supabase
    .from('care_purchase_entitlements')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active');

  return ((rows as CareEntitlementRow[]) ?? []).map(rowToProfile);
}

export async function fetchCareAccessForUser(supabase: SupabaseClient, userId: string) {
  const { resolvePsaSeasonAccessForUser } = await import('./psaSeasonAccess.js');
  const profiles = await syncCareEntitlementsFromOrders(supabase, userId);

  const ownedUnits = profiles
    .filter((p) => p.status === 'active')
    .map((p) => buildYourOwnedUnitFromProfile(p));

  const careGuideEntitlements: ResolvedCareContentEntitlement[] =
    resolveCareGuideEntitlementsFromProfiles(profiles);

  const unlockedGuideIds = [
    ...new Set(
      careGuideEntitlements
        .filter((e) => e.contentKind === 'care-guide')
        .map((e) => e.contentId)
    ),
  ];

  const { getAllCareGuides, resolveCareAccessForGuides } = await import(
    '../../src/content/education/care/guides/catalog.js'
  );
  const guides = getAllCareGuides();
  const access = resolveCareAccessForGuides(guides, profiles, careGuideEntitlements);

  const { CARE_MASTERY_CANONICAL_SEASON_ID } = await import(
    '../../src/content/education/hierarchy/care/seasons.js'
  );
  const careMasterySeasonAccess = await resolvePsaSeasonAccessForUser(
    supabase,
    userId,
    CARE_MASTERY_CANONICAL_SEASON_ID,
    { syncQualifying: false },
  );

  return {
    purchaseProfiles: profiles,
    ownedUnits,
    careGuideEntitlements,
    /** @deprecated use careGuideEntitlements */
    careContentEntitlements: careGuideEntitlements,
    unlockedGuideIds,
    /** @deprecated use unlockedGuideIds */
    unlockedLessonIds: unlockedGuideIds,
    access,
    careMasterySeasonAccess,
    guides: guides.map((g) => ({
      id: g.id,
      unlocked: unlockedGuideIds.includes(g.id),
    })),
    /** @deprecated use guides */
    lessons: guides.map((g) => ({
      id: g.id,
      unlocked: unlockedGuideIds.includes(g.id),
    })),
  };
}
