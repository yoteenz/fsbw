/**
 * Studio DNA Capsule™ export constants — shared with admin UI.
 * Keep in sync with api/_lib/studioDnaCapsuleConstants.ts
 */

export const STUDIO_DNA_CAPSULE_FOLDER_NAME = 'StudioOS_StudioDNACapsule_v1.0';

export const STUDIO_DNA_CAPSULE_GENERATOR_VERSION = '1.0.0';

export const STUDIO_DNA_CAPSULE_DOWNLOAD_BASE = '/downloads/studio-dna-capsules';

export const STUDIO_DNA_CAPSULE_LATEST_ALIAS = 'latest.zip';

export const STUDIO_DNA_CAPSULE_LATEST_DOWNLOAD_PATH = `${STUDIO_DNA_CAPSULE_DOWNLOAD_BASE}/${STUDIO_DNA_CAPSULE_LATEST_ALIAS}`;

export function versionedDnaZipFileName(version: string): string {
  return `StudioOS_StudioDNACapsule_v${version}.zip`;
}
