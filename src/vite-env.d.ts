/// <reference types="vite/client" />

declare module '*.svg?url' {
  const url: string;
  export default url;
}

export {};

declare global {
  /** Inlined in `vite.config.ts` — changes every deploy so the admin globe iframe URL updates. */
  const __GLOBE_EMBED_BUILD__: string;
}
