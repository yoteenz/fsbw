/** Reusable immersive loader configuration for Site 00 production experiences. */

/** Resolve public live-preview asset at runtime (avoids hardcoding Supabase host in source). */
export function resolveSite00PublicAsset(path: string): string {
  const base = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';
  return `${base}/storage/v1/object/public/live-preview/site00/${path}`;
}

export type Site00LoaderStage = {
  id: string;
  label: string;
  /** Target progress 0–100 when this stage completes (must be monotonic). */
  progress: number;
};

export type Site00ImmersiveLoaderConfig = {
  id: string;
  siteLabel: string;
  experienceTitle: string;
  experienceSubtitle: string;
  assemblingLabel: string;
  tagline: string;
  footerMark: string;
  footerLabel: string;
  completionMessage: string;
  backgroundPath: string;
  animationPath: string;
  stages: Site00LoaderStage[];
};

/** Production Asset Vault loader — supplied architectural + OpenArt geometry assets. */
export const ASSTS_IMMERSIVE_LOADER_CONFIG: Site00ImmersiveLoaderConfig = {
  id: 'assts',
  siteLabel: 'SITE 00',
  experienceTitle: 'PREPARING THE ASSET VAULT',
  experienceSubtitle: 'RESOLVING PRODUCTION ASSETS',
  assemblingLabel: 'ASSEMBLING…',
  tagline: 'EVERYTHING WE BUILD LIVES HERE.',
  footerMark: '00',
  footerLabel: 'SITE 00',
  completionMessage: 'ASSET VAULT READY',
  backgroundPath: 'E3BCF37B-BFC8-4BDC-8412-496C945C169C.png',
  animationPath: 'openart-output_1786943611255_fc655184.mp4',
  stages: [
    { id: 'boot', label: 'BOOTING SITE 00', progress: 10 },
    { id: 'connect', label: 'CONNECTING TO ASSET VAULT', progress: 25 },
    { id: 'resolve', label: 'RESOLVING PRODUCTION ASSETS', progress: 45 },
    { id: 'sync', label: 'SYNCING LIBRARY', progress: 65 },
    { id: 'visuals', label: 'ASSEMBLING INTERFACE', progress: 80 },
    { id: 'hydrate', label: 'ASSET VAULT READY', progress: 95 },
  ],
};

const CONFIG_BY_ID: Record<string, Site00ImmersiveLoaderConfig> = {
  assts: ASSTS_IMMERSIVE_LOADER_CONFIG,
};

export function getSite00ImmersiveLoaderConfig(id: string): Site00ImmersiveLoaderConfig | null {
  return CONFIG_BY_ID[id] ?? null;
}
