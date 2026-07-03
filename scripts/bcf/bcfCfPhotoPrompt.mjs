import { BCF_CF_PHOTO_PROMPT_VERSION } from './bcfCfPhotoColors.mjs';

export { BCF_CF_PHOTO_PROMPT_VERSION };

export function buildBcfCfPhotoPrompt(colorName, hexCode) {
  return `Recreate this image on a pure white (#FFFFFF) background. Change ONLY the hair color to ${colorName} ${hexCode}.

COLOR LOCK (critical):
- Every visible strand, highlight, and shadow in the hair must match ${colorName} ${hexCode} exactly — same hue, brightness, and saturation as the swatch.
- Do NOT leave black, brown, copper, or reference-color bleed in the hair.
- Do NOT tint, stain, or color-shift the hands, skin, lace, or background.

HAND LOCK (critical):
- Preserve the model's hands exactly as in the reference: same pose, position, finger count, proportions, and natural skin tone.
- Hands must look anatomically correct — no extra/missing fingers, no melted or warped fingers, no wrong skin color.

Preserve exactly from the reference image:
- product type, lace shape, texture, curl/wave pattern, density, silhouette
- strand detail, lace detail, lighting, crop, and front-facing product angle
- pure white #FFFFFF background with no gray cast

Do NOT redesign the product. Do NOT remove, crop out, or hide the hands. Do NOT distort hands or change hand skin tone. Do NOT add text, logos, extra shadows, mannequins, packaging, or other props.`;
}
