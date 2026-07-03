import { BCF_CF_PHOTO_PROMPT_VERSION } from './bcfCfPhotoColors.mjs';

export { BCF_CF_PHOTO_PROMPT_VERSION };

export function buildBcfCfPhotoPrompt(colorName, hexCode) {
  return `Recreate this image on a pure white (#FFFFFF) background but change the hair color to ${colorName} ${hexCode} instead of black. Preserve the exact product type, lace shape, texture, curl/wave pattern, density, silhouette, strand detail, lace detail, lighting, crop, and front-facing product angle. Do not redesign the product. Do not change the background. Do not add text, logos, shadows, props, mannequins, hands, packaging, or extra objects.`;
}
