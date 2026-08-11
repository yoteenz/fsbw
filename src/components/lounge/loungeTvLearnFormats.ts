import { LOUNGE_TV_CONTENT_PACKS, type LoungeContentPack } from './loungeTvContentPack';
import type { PsaTeachingFormat } from '../../content/education/psaTodayTaxonomy';

function packsMatchingSeries(series: string): LoungeContentPack[] {
  return LOUNGE_TV_CONTENT_PACKS.filter(
    (p) => p.originalSeries?.toUpperCase() === series.toUpperCase() || p.category?.toUpperCase() === series.toUpperCase(),
  );
}

/** Product walkthroughs — not an Academy / Mastery category. */
export function getProductEducationPacks(): LoungeContentPack[] {
  return LOUNGE_TV_CONTENT_PACKS.filter(
    (p) =>
      p.category === 'Product Education' ||
      p.id === 'baw-academy-intro' ||
      p.learningPathId === 'product-education',
  );
}

export function getPsaAnswersPacks(): LoungeContentPack[] {
  return packsMatchingSeries('PSA ANSWERS');
}

export function getPacksForTeachingFormat(format: PsaTeachingFormat): LoungeContentPack[] {
  switch (format) {
    case 'PSA_ANSWERS':
      return getPsaAnswersPacks();
    case 'PRODUCT_EDUCATION':
      return getProductEducationPacks();
    default:
      return [];
  }
}
