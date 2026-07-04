/**
 * StudioOS — central platform identity configuration.
 * Rename platform name/tagline here only; never hardcode elsewhere.
 * StudioOS is independent from VXD Inc. (VXD owns StudioOS; workspaces run on it).
 */

export const STUDIO_OS_PLATFORM = {
  name: 'StudioOS',
  tagline: 'The Operating System for Modern Brands',
  owner: 'VXD Inc.',
} as const;

export type StudioOsPlatformConfig = typeof STUDIO_OS_PLATFORM;
