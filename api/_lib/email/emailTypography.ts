import { resolveSiteOrigin } from './brandAssets.js';

/** Brand typography for transactional HTML email (single-quoted — safe inside HTML style="…"). */
export const EMAIL_FONT_GRACE =
  "'Covered By Your Grace', 'Covered By Your Grace Preload', cursive, Georgia, serif";
export const EMAIL_FONT_FUTURA_BOOK = "'Futura PT Book', Futura, 'Trebuchet MS', Arial, sans-serif";
export const EMAIL_FONT_FUTURA_MEDIUM = "'Futura PT Medium', Futura, 'Trebuchet MS', Arial, sans-serif";
export const EMAIL_FONT_FUTURA_DEMI = "'Futura PT Demi', 'Futura PT Medium', Futura, Arial, sans-serif";
export const EMAIL_FONT_BOHEMY = "'Bohemy', cursive, Georgia, serif";

/** Webfont links + @font-face — absolute URLs on SITE_URL for supporting clients. */
export function renderEmailFontFaces(): string {
  const origin = resolveSiteOrigin();
  return `<link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>
  <link href="https://fonts.googleapis.com/css2?family=Covered+By+Your+Grace&display=swap" rel="stylesheet"/>
  <style type="text/css">
@font-face {
  font-family: 'Futura PT Book';
  src: url('${origin}/assets/Futura%20PT%20Book.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Futura PT Medium';
  src: url('${origin}/assets/Futura%20PT%20Medium.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Futura PT Demi';
  src: url('${origin}/assets/fonnts.com-Futura_PT_Demi.otf') format('opentype');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Bohemy';
  src: url('${origin}/assets/Bohemy.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
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
