/**
 * Collaboration Intelligence Capsule export constants.
 * Keep in sync with api/_lib/collaborationIntelligenceCapsuleConstants.ts
 */

export const COLLABORATION_INTELLIGENCE_CAPSULE_VERSION = '1.0.0';

export const COLLABORATION_INTELLIGENCE_CAPSULE_DOWNLOAD_BASE =
  '/downloads/collaboration-intelligence-capsules';

export const COLLABORATION_INTELLIGENCE_CAPSULE_PERMANENT_LATEST_PATH =
  '/collaboration-intelligence/latest';

export const COLLABORATION_INTELLIGENCE_CAPSULE_PUBLIC_HUB_PATH =
  '/collaboration-intelligence';

export const COLLABORATION_INTELLIGENCE_CAPSULE_PUBLIC_RELEASE_PATH =
  '/collaboration-intelligence/release.json';

export function versionedCollaborationIntelligenceCapsuleZipFileName(version: string): string {
  return `Collaboration_Intelligence_Capsule_v${version}.zip`;
}
