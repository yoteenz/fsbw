import bundleJson from './generated/manifest-bundle.json';
import { MANIFEST_BUNDLE_PATH } from './constants';
import type { MasterSpecBundle } from './types';

let cachedBundle: MasterSpecBundle | null = null;
let loadPromise: Promise<MasterSpecBundle | null> | null = null;

function getEmbeddedBundle(): MasterSpecBundle {
  return bundleJson as MasterSpecBundle;
}

export function getMasterSpecBundleSync(): MasterSpecBundle {
  if (cachedBundle) return cachedBundle;
  cachedBundle = getEmbeddedBundle();
  return cachedBundle;
}

export async function loadMasterSpecBundle(force = false): Promise<MasterSpecBundle> {
  if (!force && cachedBundle) return cachedBundle;
  if (!force && loadPromise) return loadPromise.then((b) => b ?? getEmbeddedBundle());

  loadPromise = (async () => {
    if (typeof fetch !== 'undefined' && typeof window !== 'undefined') {
      try {
        const res = await fetch(MANIFEST_BUNDLE_PATH, { cache: 'no-cache' });
        if (res.ok) {
          cachedBundle = (await res.json()) as MasterSpecBundle;
          return cachedBundle;
        }
      } catch {
        /* fall through to embedded */
      }
    }
    cachedBundle = getEmbeddedBundle();
    return cachedBundle;
  })();

  return loadPromise.then((b) => b ?? getEmbeddedBundle());
}

export function clearMasterSpecBundleCache(): void {
  cachedBundle = null;
  loadPromise = null;
}

export function getMilestoneByCanonicalId(bundle: MasterSpecBundle, canonicalId: string) {
  return bundle.milestones.find((m) => m.canonicalId === canonicalId);
}

export function getMilestoneByInternalId(bundle: MasterSpecBundle, internalId: string) {
  return bundle.milestones.find((m) => m.internalId === internalId || m.moduleId === internalId);
}

export function getVolumeById(bundle: MasterSpecBundle, volumeId: string) {
  return bundle.volumes.find((v) => v.id === volumeId);
}
