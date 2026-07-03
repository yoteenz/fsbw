import { BCF_CF_PHOTO_PROMPT_VERSION } from './bcfCfPhotoColors.mjs';

export { BCF_CF_PHOTO_PROMPT_VERSION };

export function buildBcfCfPhotoPrompt(colorName, hexCode) {
  return `Recreate this image on a pure white (#FFFFFF) background. Change ONLY the hair color to ${colorName} ${hexCode}.

COLOR LOCK (critical):
- Every visible strand, highlight, and shadow in the hair must match ${colorName} ${hexCode} exactly — same hue, brightness, and saturation as the swatch.
- Do NOT leave black, brown, copper, or reference-color bleed in the hair.
- Do NOT tint, stain, or color-shift the hands, skin, lace, or background.

HAND LOCK (critical — highest priority):
- Copy the reference hands exactly: same pose, position, finger count (five fingers per hand), proportions, and natural human skin tone.
- Hands must look anatomically correct — no extra/missing/fused/melted fingers, no warped joints, no wrong skin color.
- Do NOT color-shift, stain, or tint the hands with hair color — skin must stay natural.
- If hands are visible in the reference, they MUST remain visible in the output with identical anatomy.

Preserve exactly from the reference image:
- product type, lace shape, texture, curl/wave pattern, density, silhouette
- strand detail, lace detail, lighting, crop, and front-facing product angle
- pure white #FFFFFF background with no gray cast

Do NOT redesign the product. Do NOT remove, crop out, or hide the hands. Do NOT distort hands or change hand skin tone. Do NOT add text, logos, extra shadows, mannequins, packaging, or other props.`;
}
