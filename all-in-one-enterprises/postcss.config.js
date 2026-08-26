/**
 * AIO-owned PostCSS boundary (plain CSS only).
 * Prevents Vitest/Vite from walking up to repository-root Frontal Slayer
 * postcss.config.js (tailwindcss + autoprefixer) when AIO node_modules is
 * installed without the monorepo root dependency tree.
 */
export default {
  plugins: {},
};
