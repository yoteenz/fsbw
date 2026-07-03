import type { EmailHeroIcon } from './types.js';
import { BRAND_RED } from './brandAssets.js';

/** Inline SVG icons for email clients (no external fetch required for hero). */
const ICONS: Record<EmailHeroIcon, string> = {
  welcome: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="54%" text-anchor="middle" font-family="Georgia,serif" font-size="28" font-weight="700" fill="${BRAND_RED}">FS</text></svg>`,
  fs: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="54%" text-anchor="middle" font-family="Georgia,serif" font-size="28" font-weight="700" fill="${BRAND_RED}">FS</text></svg>`,
  check: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="28" fill="${BRAND_RED}"/><path d="M20 33l8 8 16-18" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  bag: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="22" width="32" height="34" rx="3" fill="#fff" stroke="#111" stroke-width="2"/><path d="M24 22v-6a8 8 0 0116 0v6" fill="none" stroke="#111" stroke-width="2"/><text x="32" y="44" text-anchor="middle" font-size="12" fill="${BRAND_RED}" font-family="Arial,sans-serif">FS</text></svg>`,
  gear: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="10" fill="#ddd" stroke="#111" stroke-width="2"/><path d="M32 8v8M32 48v8M8 32h8M48 32h8M14 14l6 6M44 44l6 6M14 50l6-6M44 20l6-6" stroke="#111" stroke-width="3" stroke-linecap="round"/></svg>`,
  truck: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="24" width="30" height="20" rx="2" fill="${BRAND_RED}"/><rect x="38" y="30" width="16" height="14" rx="2" fill="#111"/><circle cx="20" cy="48" r="6" fill="#111"/><circle cx="46" cy="48" r="6" fill="#111"/></svg>`,
  pin: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 8c-10 0-18 8-18 18 0 14 18 30 18 30s18-16 18-30c0-10-8-18-18-18z" fill="${BRAND_RED}"/><circle cx="32" cy="26" r="7" fill="#fff"/></svg>`,
  hourglass: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M18 10h28l-8 18 8 18H18l8-18-8-18z" fill="none" stroke="#111" stroke-width="3"/><path d="M26 28h12l-6 8-6-8z" fill="${BRAND_RED}"/></svg>`,
  x: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="28" fill="${BRAND_RED}"/><path d="M22 22l20 20M42 22L22 42" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
  diamond: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><polygon points="32,8 54,24 32,56 10,24" fill="#e8f4ff" stroke="#99c" stroke-width="2"/><polygon points="32,8 32,56 10,24" fill="#cce5ff" opacity="0.7"/></svg>`,
  gift: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="28" width="40" height="28" rx="2" fill="#fff" stroke="#111" stroke-width="2"/><rect x="12" y="22" width="40" height="8" fill="${BRAND_RED}"/><path d="M32 22v34M12 30c0-8 8-12 20-12s20 4 20 12" fill="none" stroke="${BRAND_RED}" stroke-width="3"/></svg>`,
  lock: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="28" width="32" height="28" rx="4" fill="${BRAND_RED}"/><path d="M22 28v-8a10 10 0 0120 0v8" fill="none" stroke="#111" stroke-width="3"/></svg>`,
  envelope: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="16" width="48" height="32" rx="3" fill="#fff" stroke="#111" stroke-width="2"/><path d="M8 20l24 18 24-18" fill="none" stroke="${BRAND_RED}" stroke-width="2"/></svg>`,
  heart: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 54S8 38 8 24a12 12 0 0124-4 12 12 0 0124 4c0 14-24 30-24 30z" fill="${BRAND_RED}"/></svg>`,
  crown: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M8 44h48l-6-28-14 14-10-18-10 18L14 16 8 44z" fill="#d4af37" stroke="#111" stroke-width="2"/></svg>`,
  trophy: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M20 16h24v16c0 10-6 16-12 16s-12-6-12-16V16z" fill="#ddd" stroke="#111" stroke-width="2"/><rect x="26" y="48" width="12" height="8" fill="#111"/><rect x="20" y="54" width="24" height="4" fill="${BRAND_RED}"/></svg>`,
  payment: `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="18" width="48" height="32" rx="4" fill="#111"/><rect x="8" y="26" width="48" height="8" fill="${BRAND_RED}"/><rect x="14" y="40" width="16" height="4" fill="#fff" opacity="0.8"/></svg>`,
};

export function heroIconSvg(icon: EmailHeroIcon): string {
  return ICONS[icon] || ICONS.fs;
}
