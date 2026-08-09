import { describe, expect, it } from 'vitest';
import type { SeasonPassEntitlement } from '../types';
import { resolvePsaSeasonAccess } from './psaSeasonAccessResolver';
import { CARE_MASTERY_CANONICAL_SEASON_ID } from './care/seasons';
import {
  carePurchaseProfileQualifiesForCareMasterySeason,
  resolveQualifyingOrderIdsForCareMastery,
} from '../care/careMasteryProductEntitlements';

const paidPass = (overrides?: Partial<SeasonPassEntitlement>): SeasonPassEntitlement => ({
  id: 'pass-1',
  userId: 'user-1',
  masteryId: 'mastery-care',
  seasonId: CARE_MASTERY_CANONICAL_SEASON_ID,
  acquiredAt: '2026-01-01T00:00:00.000Z',
  accessSource: 'slay-ticket',
  slayTicketCostAtPurchase: 10,
  status: 'active',
  ...overrides,
});

describe('resolvePsaSeasonAccess — Care Mastery dual-access matrix', () => {
  it('1. No FS hair + no Care purchase → locked (partial curriculum allows commerce)', () => {
    const access = resolvePsaSeasonAccess({ seasonId: CARE_MASTERY_CANONICAL_SEASON_ID });
    expect(access.hasAccess).toBe(false);
    expect(access.seasonOwned).toBe(false);
    expect(access.canPurchaseSeasonPass).toBe(true);
    expect(access.curriculumStatus).toBe('partially_approved');
    expect(access.displayState).toBe('purchasable');
  });

  it('2. No FS hair + purchased Care Season Pass → full season accessible', () => {
    const access = resolvePsaSeasonAccess({
      seasonId: CARE_MASTERY_CANONICAL_SEASON_ID,
      seasonPasses: [paidPass()],
    });
    expect(access.seasonOwned).toBe(true);
    expect(access.accessScope).toBe('season');
    expect(access.accessSource).toBe('slay-ticket-season');
    expect(access.canPurchaseSeasonPass).toBe(false);
    expect(access.blockReason).toBe('already-entitled');
  });

  it('3. No FS hair + purchased individual Care episode → episode scope only', () => {
    const access = resolvePsaSeasonAccess({
      seasonId: CARE_MASTERY_CANONICAL_SEASON_ID,
      ownedEpisodeIds: ['psa-care-ep-01'],
    });
    expect(access.episodeOwned).toBe(false);
    expect(access.seasonOwned).toBe(false);
    expect(access.accessScope).toBe('none');
  });

  it('4. Legacy complimentary season pass still grants full access when present', () => {
    const access = resolvePsaSeasonAccess({
      seasonId: CARE_MASTERY_CANONICAL_SEASON_ID,
      seasonPasses: [
        paidPass({ accessSource: 'qualifying-product', slayTicketCostAtPurchase: undefined }),
      ],
    });
    expect(access.seasonOwned).toBe(true);
    expect(access.complimentary).toBe(true);
    expect(access.displayState).toBe('included-with-purchase');
    expect(access.canPurchaseSeasonPass).toBe(false);
  });

  it('4b. Qualifying FS hair without season pass → Care Mastery remains locked', () => {
    const access = resolvePsaSeasonAccess({
      seasonId: CARE_MASTERY_CANONICAL_SEASON_ID,
      qualifyingOrderIds: ['order-qual-1'],
    });
    expect(access.seasonOwned).toBe(false);
    expect(access.hasAccess).toBe(false);
    expect(access.displayState).toBe('purchasable');
    expect(access.canPurchaseSeasonPass).toBe(true);
  });

  it('5. Existing paid Season Pass preserved when qualifying product appears later', () => {
    const access = resolvePsaSeasonAccess({
      seasonId: CARE_MASTERY_CANONICAL_SEASON_ID,
      seasonPasses: [paidPass({ acquiredAt: '2026-03-01T00:00:00.000Z' })],
      qualifyingOrderIds: ['order-99'],
    });
    expect(access.accessSource).toBe('slay-ticket-season');
    expect(access.complimentary).toBe(false);
    expect(access.seasonOwned).toBe(true);
  });

  it('6. Partial episode + later season pass → season supersedes purchase need', () => {
    const access = resolvePsaSeasonAccess({
      seasonId: CARE_MASTERY_CANONICAL_SEASON_ID,
      seasonPasses: [paidPass()],
      ownedEpisodeIds: ['psa-care-ep-02'],
    });
    expect(access.seasonOwned).toBe(true);
    expect(access.canPurchaseSeasonPass).toBe(false);
  });

  it('7. Complimentary owner cannot purchase season pass (blocked)', () => {
    const access = resolvePsaSeasonAccess({
      seasonId: CARE_MASTERY_CANONICAL_SEASON_ID,
      seasonPasses: [paidPass({ accessSource: 'qualifying-product' })],
    });
    expect(access.canPurchaseSeasonPass).toBe(false);
    expect(access.blockReason).toBe('already-entitled');
  });

  it('qualifying product profile mapping uses product types not SKU strings', () => {
    expect(
      carePurchaseProfileQualifiesForCareMasterySeason({
        id: 'p1',
        userId: 'u1',
        orderId: 'o1',
        orderLineKey: 'k1',
        productName: 'NOIR',
        productType: 'unit',
        grantedAt: '2026-01-01',
        status: 'active',
      }),
    ).toBe(true);
    expect(
      carePurchaseProfileQualifiesForCareMasterySeason({
        id: 'p2',
        userId: 'u1',
        orderId: 'o2',
        orderLineKey: 'k2',
        productName: 'GIFT CARD',
        productType: 'gift-card',
        grantedAt: '2026-01-01',
        status: 'active',
      }),
    ).toBe(false);
    const orderIds = resolveQualifyingOrderIdsForCareMastery([
      {
        id: 'p1',
        userId: 'u1',
        orderId: 'o1',
        orderLineKey: 'k1',
        productName: 'NOIR',
        productType: 'unit',
        grantedAt: '2026-01-01',
        status: 'active',
      },
    ]);
    expect(orderIds).toEqual(['o1']);
  });
});
