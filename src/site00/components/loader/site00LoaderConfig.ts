/** Reusable immersive loader configuration for Site 00 production experiences. */

import {
  site00LoaderBackgroundUrl,
  site00LoaderGeometryApngUrl,
  site00LoaderGeometrySourceUrl,
  site00LoaderGeometryWebmUrl,
} from './site00LoaderMedia';

/** Resolve public live-preview asset at runtime (non-loader production assets). */
export function resolveSite00PublicAsset(path: string): string {
  const base = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';
  return `${base}/storage/v1/object/public/live-preview/site00/${path}`;
}

export type Site00LoaderState =
  | 'BOOTSTRAP'
  | 'PREPARING'
  | 'CONNECTING'
  | 'RESOLVING'
  | 'ASSEMBLING'
  | 'READY'
  | 'EXITING';

export type Site00LoaderStage = {
  id: string;
  state: Site00LoaderState;
  label: string;
  /** Target progress 0–100 when this stage completes (monotonic). */
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
  backgroundUrl: string;
  geometryWebmUrl: string;
  geometryApngUrl: string;
  geometrySourceUrl: string;
  stages: Site00LoaderStage[];
};

/** Production Asset Vault loader — boot-critical assets on same-origin /public. */
export const ASSTS_IMMERSIVE_LOADER_CONFIG: Site00ImmersiveLoaderConfig = {
  id: 'assts',
  siteLabel: 'SITE 00',
  experienceTitle: 'PREPARING THE ASSET VAULT',
  experienceSubtitle: 'RESOLVING PRODUCTION ASSETS',
  assemblingLabel: 'ASSEMBLING...',
  tagline: 'EVERYTHING WE BUILD LIVES HERE.',
  footerMark: '00',
  footerLabel: 'SITE 00',
  completionMessage: 'ASSET VAULT READY',
  backgroundUrl: site00LoaderBackgroundUrl(),
  geometryWebmUrl: site00LoaderGeometryWebmUrl(),
  geometryApngUrl: site00LoaderGeometryApngUrl(),
  geometrySourceUrl: site00LoaderGeometrySourceUrl(),
  stages: [
    { id: 'bootstrap', state: 'BOOTSTRAP', label: 'INITIALIZING SITE 00', progress: 8 },
    { id: 'preparing', state: 'PREPARING', label: 'PREPARING THE ASSET VAULT', progress: 22 },
    { id: 'connect', state: 'CONNECTING', label: 'CONNECTING TO ASSET VAULT', progress: 38 },
    { id: 'resolve', state: 'RESOLVING', label: 'RESOLVING PRODUCTION ASSETS', progress: 58 },
    { id: 'assemble', state: 'ASSEMBLING', label: 'ASSEMBLING INTERFACE', progress: 82 },
    { id: 'ready', state: 'READY', label: 'ASSET VAULT READY', progress: 100 },
  ],
};

const CONFIG_BY_ID: Record<string, Site00ImmersiveLoaderConfig> = {
  assts: ASSTS_IMMERSIVE_LOADER_CONFIG,
};

export function getSite00ImmersiveLoaderConfig(id: string): Site00ImmersiveLoaderConfig | null {
  return CONFIG_BY_ID[id] ?? null;
}
