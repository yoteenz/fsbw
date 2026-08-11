/**
 * PSA Today education taxonomy — mapping layer (no breaking DB migration).
 *
 * Hierarchy:
 *   contentFamily: PSA_TODAY
 *     → teachingFormat: MASTERY | SLAY_TIP | PSA_ANSWERS | PRODUCT_EDUCATION | CARE_GUIDE | LIVE_LESSON | …
 *       → masteryTrack (when format = MASTERY): LACE | CARE | COLOR | INSTALLATION | STYLING | UPKEEP
 *
 * {@link FRONTAL_SLAYER_ACADEMY_FUTURE_NOTE} — Academy is NOT a teachingFormat; reserved for future enrollment UX.
 */

export const PSA_TODAY_CONTENT_FAMILY = 'PSA_TODAY' as const;

export type PsaTodayContentFamily = typeof PSA_TODAY_CONTENT_FAMILY;

export type PsaTeachingFormat =
  | 'MASTERY'
  | 'SLAY_TIP'
  | 'PSA_ANSWERS'
  | 'PRODUCT_EDUCATION'
  | 'CARE_GUIDE'
  | 'POST_PURCHASE_EDUCATION'
  | 'LIVE_LESSON';

export type PsaMasteryTrackKey =
  | 'LACE'
  | 'CARE'
  | 'COLOR'
  | 'INSTALLATION'
  | 'STYLING'
  | 'UPKEEP';

/** Secondary Learn rails — lower visual weight than Masteries. */
export type PsaLearnSecondaryRail = {
  id: string;
  title: string;
  teachingFormat: PsaTeachingFormat;
};

export const PSA_LEARN_SECONDARY_RAILS: PsaLearnSecondaryRail[] = [
  { id: 'slay-tips', title: 'SLAY TIPS', teachingFormat: 'SLAY_TIP' },
  { id: 'psa-answers', title: 'PSA ANSWERS', teachingFormat: 'PSA_ANSWERS' },
  { id: 'product-education', title: 'PRODUCT EDUCATION', teachingFormat: 'PRODUCT_EDUCATION' },
  { id: 'care-guides', title: 'CARE GUIDES', teachingFormat: 'CARE_GUIDE' },
];

export { FRONTAL_SLAYER_ACADEMY_FUTURE_NOTE } from './hierarchy/masteryTracks';
