/** Shared email hero graphic dimensions (portrait 9:16 for text overlay + full scene). */

export const EMAIL_HERO_WIDTH_PX = 520;

/** Fal `aspect_ratio` — tall 9:16 portrait matching reference design boards. */
export const EMAIL_HERO_ASPECT_RATIO = '9:16';

/** Hero block height at {@link EMAIL_HERO_WIDTH_PX} (9:16). */
export const EMAIL_HERO_HEIGHT_PX = Math.round((EMAIL_HERO_WIDTH_PX * 16) / 9);

/** Spacer below headline overlay — keeps product scene visible in the generated art. */
export const EMAIL_HERO_PRODUCT_ZONE_PX = Math.round(EMAIL_HERO_HEIGHT_PX * 0.62);
