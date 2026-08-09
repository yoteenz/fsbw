import { describe, expect, it } from 'vitest';
import { slayTicketsEarnedForLineItems } from '../../../../api/_lib/slayTickets';
import { isHairPurchaseSlayTicketEarningEnabled } from '../commerce/slayTicketEconomyPolicy';
import { careProfilesFromOrders } from '../care/careOrderParsing';
import {
  resolveCareGuideEntitlementsForOwnedUnits,
  resolveCareGuideEntitlementsFromProfiles,
} from '../care/careEntitlementResolver';
import { buildYourOwnedUnitFromProfile } from '../care/careEntitlementResolver';
import { resolvePsaSeasonAccess } from '../hierarchy/psaSeasonAccessResolver';
import { CARE_MASTERY_CANONICAL_SEASON_ID } from '../hierarchy/care/seasons';
import { PSA_CARE_EPISODE_01 } from '../../psa-today/episode-care-01-intro-to-your-unit';

const hairLine = { name: 'NOIR', productName: 'NOIR', type: 'unit', quantity: 1 };

describe('Slay Ticket economy — prospective hair earning deprecation', () => {
  it('does not earn tickets for new orders after cutoff', () => {
    expect(isHairPurchaseSlayTicketEarningEnabled('2026-08-10T00:00:00.000Z')).toBe(false);
    expect(
      slayTicketsEarnedForLineItems([hairLine], { orderPlacedAt: '2026-08-10T00:00:00.000Z' })
    ).toBe(0);
  });

  it('would have earned tickets before cutoff (historical behavior reference)', () => {
    expect(isHairPurchaseSlayTicketEarningEnabled('2026-01-01T00:00:00.000Z')).toBe(true);
    expect(
      slayTicketsEarnedForLineItems([hairLine], { orderPlacedAt: '2026-01-01T00:00:00.000Z' })
    ).toBe(2);
  });
});

describe('Care Guide entitlement resolver — YOUR UNIT', () => {
  it('parses Build-A-Wig configuration from order line options', () => {
    const profiles = careProfilesFromOrders(
      [
        {
          id: 'ord-1',
          status: 'DELIVERED',
          lineItems: [
            {
              productName: 'BLANCO',
              type: 'unit',
              baseUnitId: 'blanco',
              options: {
                color: 'PLATINUM',
                length: '26"',
                density: '250%',
                styling: 'LAYERS, WAND CURLS',
              },
            },
          ],
        },
      ],
      'user-1'
    );
    expect(profiles).toHaveLength(1);
    expect(profiles[0].configurationSnapshot?.color).toBe('PLATINUM');
    expect(profiles[0].transformationState?.blondeProcessed).toBe(true);
    expect(profiles[0].transformationState?.layered).toBe(true);
  });

  it('does NOT unlock Care Mastery Ep 01 for qualifying unit — guides only', () => {
    const profiles = careProfilesFromOrders(
      [{ id: 'ord-2', status: 'DELIVERED', lineItems: [{ productName: 'NOIR', type: 'unit' }] }],
      'user-1'
    );
    const ents = resolveCareGuideEntitlementsFromProfiles(profiles);
    expect(ents.some((e) => e.contentId === PSA_CARE_EPISODE_01.id)).toBe(false);
    expect(ents.every((e) => e.contentKind === 'care-guide')).toBe(true);
    expect(ents.length).toBeGreaterThan(0);
  });

  it('identifies blonde configuration for future rule matching without creating guides', () => {
    const profile = careProfilesFromOrders(
      [
        {
          id: 'ord-3',
          status: 'DELIVERED',
          lineItems: [{ productName: 'BLANCO', type: 'unit', options: { color: 'PLATINUM' } }],
        },
      ],
      'user-1'
    )[0];
    const unit = buildYourOwnedUnitFromProfile(profile);
    const traits = unit.transformationState.stateTags ?? [];
    expect(traits.some((t) => t.includes('blonde') || t === 'blonde')).toBe(true);
  });

  it('dedupes same guide across two owned units', () => {
    const profiles = careProfilesFromOrders(
      [
        {
          id: 'ord-4',
          status: 'DELIVERED',
          lineItems: [
            { productName: 'NOIR', type: 'unit' },
            { productName: 'BLANCO', type: 'unit', options: { color: 'PLATINUM' } },
          ],
        },
      ],
      'user-1'
    );
    const units = profiles.map((p) => buildYourOwnedUnitFromProfile(p));
    const ents = resolveCareGuideEntitlementsForOwnedUnits(units);
    const universal = ents.filter((e) => e.contentId === 'care-universal-store-unit');
    if (universal.length) {
      expect(universal).toHaveLength(1);
      expect(universal[0].appliesToOwnedUnitIds.length).toBe(2);
    }
  });
});

describe('Care Mastery access — hair purchase does NOT unlock paid education', () => {
  it('qualifying FS hair without season pass → Care Mastery locked / purchasable', () => {
    const access = resolvePsaSeasonAccess({
      seasonId: CARE_MASTERY_CANONICAL_SEASON_ID,
      qualifyingOrderIds: ['ord-1'],
    });
    expect(access.seasonOwned).toBe(false);
    expect(access.hasAccess).toBe(false);
    expect(access.displayState).toBe('purchasable');
    expect(access.canPurchaseSeasonPass).toBe(true);
  });

  it('canonical test: hair purchaser gets guides path separate from mastery', () => {
    const profiles = careProfilesFromOrders(
      [{ id: 'ord-5', status: 'DELIVERED', lineItems: [{ productName: 'NOIR', type: 'unit' }] }],
      'user-1'
    );
    const guideEnts = resolveCareGuideEntitlementsFromProfiles(profiles);
    const masteryAccess = resolvePsaSeasonAccess({
      seasonId: CARE_MASTERY_CANONICAL_SEASON_ID,
      qualifyingOrderIds: [profiles[0].orderId],
    });
    expect(guideEnts.length).toBeGreaterThan(0);
    expect(masteryAccess.hasAccess).toBe(false);
  });
});
