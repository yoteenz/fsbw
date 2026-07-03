import { resolveSiteOrigin } from './brandAssets.js';

/** Brand typography for transactional HTML email. */
export const EMAIL_FONT_GRACE =
  '"Covered By Your Grace", "Covered By Your Grace Preload", cursive, Georgia, serif';
export const EMAIL_FONT_FUTURA_BOOK = '"Futura PT Book", Futura, "Trebuchet MS", Arial, sans-serif';
export const EMAIL_FONT_FUTURA_MEDIUM = '"Futura PT Medium", Futura, "Trebuchet MS", Arial, sans-serif';
export const EMAIL_FONT_FUTURA_DEMI = '"Futura PT Demi", "Futura PT Medium", Futura, Arial, sans-serif';
export const EMAIL_FONT_BOHEMY = '"Bohemy", cursive, Georgia, serif';

/** Inline @font-face + Google Grace — absolute URLs on SITE_URL for supporting clients. */
export function renderEmailFontFaces(): string {
  const origin = resolveSiteOrigin();
  return `<style type="text/css">
@import url('https://fonts.googleapis.com/css2?family=Covered+By+Your+Grace&display=swap');
@font-face {
  font-family: 'Futura PT Book';
  src: url('${origin}/assets/Futura%20PT%20Book.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}
@font-face {
  font-family: 'Futura PT Medium';
  src: url('${origin}/assets/Futura%20PT%20Medium.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
}
@font-face {
  font-family: 'Futura PT Demi';
  src: url('${origin}/assets/fonnts.com-Futura_PT_Demi.otf') format('opentype');
  font-weight: 600;
  font-style: normal;
}
@font-face {
  font-family: 'Bohemy';
  src: url('${origin}/assets/Bohemy.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
}
</style>`;
}

/** Uppercase display copy (Futura). */
export function emailUpper(text: string): string {
  return text.toUpperCase();
}

/** Bohemy taglines only — always lowercase. */
export function emailBohemy(text: string): string {
  return text.toLowerCase();
}
