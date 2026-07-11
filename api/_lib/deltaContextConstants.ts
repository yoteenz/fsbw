/** Delta Context Capsule — API/build constants (mirror frontend export). */

export const DELTA_CONTEXT_CAPSULE_VERSION = '1.0.0';

export const DELTA_CONTEXT_PERMANENT_LATEST_PATH = '/context-updates/latest';

export const DELTA_CONTEXT_PUBLIC_RELEASE_PATH = '/context-updates/release.json';

export function versionedDeltaContextZipFileName(version: string): string {
  return `StudioOS_ContextUpdate_v${version}.zip`;
}
