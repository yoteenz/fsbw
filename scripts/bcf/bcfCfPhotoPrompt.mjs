import { BCF_CF_PHOTO_PROMPT_VERSION } from './bcfCfPhotoColors.mjs';

export { BCF_CF_PHOTO_PROMPT_VERSION };

export function buildBcfCfPhotoPrompt(colorName, hexCode) {
  return `Recreate this image on a pure white (#FFFFFF) background. Change ONLY the hair color to ${colorName} ${hexCode} — every strand must match that exact hue, brightness, and saturation.

Preserve exactly from the reference image:
- product type, lace shape, texture, curl/wave pattern, density, silhouette
- strand detail, lace detail, lighting, crop, and front-facing product angle
- the model's hands holding/presenting the product (same pose, position, finger count, and natural skin tone as reference)
- pure white #FFFFFF background with no gray cast

Do NOT redesign the product. Do NOT remove, crop out, or hide the hands. Do NOT distort hands or change hand skin tone. Do NOT add text, logos, extra shadows, mannequins, packaging, or other props.`;
}
