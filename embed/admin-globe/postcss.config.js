/**
 * Local PostCSS config so Vite does not walk up to the monorepo root and load
 * `postcss.config.js` (Tailwind) — the embed has no tailwind dependency.
 */
export default {
  plugins: {},
};
