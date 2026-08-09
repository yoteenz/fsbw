import type {
  EducationSeason,
  ResolvedPsaSeasonAccess,
  SeasonAccessScope,
  SeasonAccessSource,
  SeasonPassEntitlement,
} from '../types';
import { getEducationSeasonById, getAllEducationSeasons } from './catalog';
import { isCareMasterySeasonId } from './care/seasons';

export type SeasonAccessInput = {
  seasonId: string;
  seasonPasses?: SeasonPassEntitlement[];
  ownedEpisodeIds?: string[];
  qualifyingOrderIds?: string[];
  curriculumPending?: boolean;
};

function mapPassSource(source: SeasonPassEntitlement['accessSource']): SeasonAccessSource {
  if (source === 'qualifying-product') return 'qualifying-product';
  if (source === 'slay-ticket') return 'slay-ticket-season';
  if (source === 'promotion') return 'promotion';
  if (source === 'admin') return 'admin';
  if (source === 'member') return 'member';
  return 'slay-ticket-season';
}

export function resolveSeasonAccessConfig(season: EducationSeason | undefined) {
  return {
    paidEducationEnabled:
      season?.accessConfig?.paidEducationEnabled ??
      (season?.allowSeasonPass || season?.allowEpisodePurchase),
    qualifyingProductEntitlementEnabled:
      season?.accessConfig?.qualifyingProductEntitlementEnabled ?? false,
  };
}

/** Pure resolver — UI/server share the same normalized access shape. Care Mastery is paid-only unless a season pass exists. */
export function resolvePsaSeasonAccess(input: SeasonAccessInput): ResolvedPsaSeasonAccess {
  const season = getEducationSeasonById(input.seasonId);
  const config = resolveSeasonAccessConfig(season);
  const curriculumPending =
    input.curriculumPending ?? season?.curriculumStatus === 'curriculum_pending';

  const activePasses = (input.seasonPasses ?? []).filter(
    (p) => p.seasonId === input.seasonId && p.status === 'active',
  );
  const seasonPass = activePasses[0];
  const seasonOwned = Boolean(seasonPass);
  const qualifyingOrderIds = input.qualifyingOrderIds ?? [];
  const hasQualifyingProduct = qualifyingOrderIds.length > 0;
  const ownedEpisodeIds = new Set(input.ownedEpisodeIds ?? []);

  const episodeOwned =
    ownedEpisodeIds.size > 0 &&
    (season?.episodeSlots.some(
      (s) => s.psaEpisodeId && ownedEpisodeIds.has(s.psaEpisodeId)
    ) ??
      false);

  let accessScope: SeasonAccessScope = 'none';
  if (seasonOwned) accessScope = 'season';
  else if (episodeOwned) accessScope = 'episode';

  let accessSource: SeasonAccessSource | null = null;
  let complimentary = false;
  let grantedAt: string | undefined;
  let purchasedAt: string | undefined;

  if (seasonPass) {
    accessSource = mapPassSource(seasonPass.accessSource);
    complimentary = seasonPass.accessSource === 'qualifying-product';
    grantedAt = seasonPass.acquiredAt;
    if (seasonPass.accessSource === 'slay-ticket' && seasonPass.slayTicketCostAtPurchase) {
      purchasedAt = seasonPass.acquiredAt;
    }
  } else if (episodeOwned) {
    accessSource = 'slay-ticket-episode';
  }

  const hasAccess = seasonOwned || episodeOwned;

  let displayState: ResolvedPsaSeasonAccess['displayState'] = 'locked';
  if (seasonOwned) {
    displayState = complimentary ? 'included-with-purchase' : 'season-pass-active';
  } else if (episodeOwned) {
    displayState = 'owned';
  } else if (curriculumPending) {
    displayState = 'locked';
  } else if (config.paidEducationEnabled) {
    displayState = 'purchasable';
  }

  const canPurchaseSeasonPass = Boolean(
    config.paidEducationEnabled &&
      !seasonOwned &&
      !curriculumPending &&
      season?.allowSeasonPass,
  );

  const canPurchaseEpisode = Boolean(
    config.paidEducationEnabled &&
      !seasonOwned &&
      !curriculumPending &&
      season?.allowEpisodePurchase,
  );

  const blockReason = seasonOwned ? ('already-entitled' as const) : undefined;

  void hasQualifyingProduct;

  return {
    seasonId: input.seasonId,
    hasAccess,
    accessScope,
    accessSource,
    seasonOwned,
    episodeOwned,
    complimentary,
    qualifyingOrderIds: hasQualifyingProduct ? qualifyingOrderIds : undefined,
    purchasedAt,
    grantedAt,
    displayState,
    canPurchaseSeasonPass,
    canPurchaseEpisode,
    blockReason,
    curriculumStatus: season?.curriculumStatus,
  };
}

export function getSeasonIdsForPsaEpisode(episodeId: string): string[] {
  return getAllEducationSeasons()
    .filter((s) => s.episodeSlots.some((slot) => slot.psaEpisodeId === episodeId))
    .map((s) => s.id);
}

export function isDualAccessCareSeason(seasonId: string): boolean {
  if (!isCareMasterySeasonId(seasonId)) return false;
  const season = getEducationSeasonById(seasonId);
  const config = resolveSeasonAccessConfig(season);
  return (
    config.paidEducationEnabled === true && config.qualifyingProductEntitlementEnabled === true
  );
}
