/** Body copy for `/brand/reviews` empty state. */
export type BrandReviewsBlockVariant = 'body' | 'accent' | 'demiGray' | 'mediumGray' | 'bohemy';

export type BrandReviewsBlock = {
  id: string;
  text: string;
  variant: BrandReviewsBlockVariant;
};

export const BRAND_REVIEWS_BLOCKS: BrandReviewsBlock[] = [
  {
    id: 'community',
    text: 'the frontal slayer community is growing.',
    variant: 'bohemy',
  },
  {
    id: 'body',
    text: "YOUR REVIEW COULD BE THE FIRST. SOON YOU'LL FIND REAL REVIEWS, CLIENT TRANSFORMATIONS, UNBOXINGS AND SUCCESS STORIES FROM WOMEN WHO CHOSE LUXURY WITHOUT LIMITS.",
    variant: 'body',
  },
];
