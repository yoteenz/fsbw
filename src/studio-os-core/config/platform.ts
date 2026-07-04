/**
 * studio os — central platform identity configuration.
 * Rename platform name/tagline here only; never hardcode elsewhere.
 * studio os is independent from VXD Inc. (VXD owns studio os; workspaces run on it).
 */

export const STUDIO_OS_PLATFORM = {
  name: 'studio os',
  tagline: 'The Operating System for Modern Brands',
  owner: 'VXD Inc.',
} as const;

export type StudioOsPlatformConfig = typeof STUDIO_OS_PLATFORM;
