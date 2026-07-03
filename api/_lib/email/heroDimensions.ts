/** Shared email hero graphic dimensions (520px wide, tall portrait for text overlay). */

export const EMAIL_HERO_WIDTH_PX = 520;

/** Fal `aspect_ratio` — tall portrait so headline + CTA can overlay the upper third. */
export const EMAIL_HERO_ASPECT_RATIO = '2:3';

/** Minimum hero block height at 520px width (2:3). Used for overlay layout + generation. */
export const EMAIL_HERO_HEIGHT_PX = Math.round((EMAIL_HERO_WIDTH_PX * 3) / 2);

/** Spacer below headline overlay — keeps product scene visible in the generated art. */
export const EMAIL_HERO_PRODUCT_ZONE_PX = 300;
