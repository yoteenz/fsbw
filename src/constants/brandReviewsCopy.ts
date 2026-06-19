/** Body copy for `/brand/reviews` empty state — displayed uppercase on the page. */
export type BrandReviewsBlockVariant = 'body' | 'accent' | 'demiGray';

export type BrandReviewsBlock = {
  id: string;
  text: string;
  variant: BrandReviewsBlockVariant;
};

export const BRAND_REVIEWS_BLOCKS: BrandReviewsBlock[] = [
  {
    id: 'headline',
    text: 'YOUR REVIEW COULD BE THE FIRST.',
    variant: 'accent',
  },
  {
    id: 'community',
    text: 'THE FRONTAL SLAYER COMMUNITY IS GROWING.',
    variant: 'demiGray',
  },
  {
    id: 'soon',
    text: "SOON YOU'LL FIND REAL REVIEWS, CLIENT TRANSFORMATIONS, UNBOXINGS AND SUCCESS STORIES FROM WOMEN WHO CHOSE LUXURY WITHOUT LIMITS.",
    variant: 'body',
  },
  {
    id: 'until-then',
    text: 'UNTIL THEN, YOUR REVIEW COULD BECOME THE ONE THAT STARTS IT ALL.',
    variant: 'demiGray',
  },
];
