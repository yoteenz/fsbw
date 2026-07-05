import type { VisionShareLink } from './types';
import { setVisionShareSessionActive } from './access';
import { launchVisionPresentation } from './launch';
import { clearActiveVisionMode, setActiveVisionMode } from './session';
import { getVisionShareBySlug } from './store';
import { resolveVisionShareFromApi } from '../../utils/visionShareApi';
import { getWorkspaceRegistry } from '../workspace/registry';

function ensureVisionManifestReady(workspaceId: string): void {
  getWorkspaceRegistry().bootstrapVisionEngine?.(workspaceId);
}

/** Activate Vision Share from a resolved link record. */
export function activateVisionShareLink(link: VisionShareLink): boolean {
  ensureVisionManifestReady(link.workspaceId);
  setVisionShareSessionActive(true);
  setActiveVisionMode(link.modeId, link.workspaceId);
  const ok = launchVisionPresentation({
    modeId: link.modeId,
    workspaceId: link.workspaceId,
    presenterMode: link.presenterMode,
    luxuryAudio: true,
  });
  if (!ok) {
    setVisionShareSessionActive(false);
    clearActiveVisionMode();
  }
  return ok;
}

/** Resolve slug from API first, then localStorage fallback (dev/offline). */
export async function resolveVisionShareBySlug(slug: string, password?: string): Promise<VisionShareLink | null> {
  const api = await resolveVisionShareFromApi(slug, password);
  if (api.ok) return api.link;
  if ('notFound' in api && api.notFound) {
    return getVisionShareBySlug(slug) ?? null;
  }
  if ('requiresPassword' in api && api.requiresPassword) {
    return null;
  }
  if ('expired' in api && api.expired) {
    return null;
  }
  return getVisionShareBySlug(slug) ?? null;
}

export type VisionShareResolveState =
  | { status: 'ready'; link: VisionShareLink }
  | { status: 'password'; label?: string }
  | { status: 'not_found' }
  | { status: 'expired' }
  | { status: 'error'; message: string };

export async function bootstrapVisionShareSlug(slug: string, password?: string): Promise<VisionShareResolveState> {
  ensureVisionManifestReady('frontal-slayer');

  const api = await resolveVisionShareFromApi(slug, password);
  if (api.ok) {
    const activated = activateVisionShareLink(api.link);
    return activated ? { status: 'ready', link: api.link } : { status: 'error', message: 'Could not start presentation' };
  }
  if ('requiresPassword' in api && api.requiresPassword) {
    return { status: 'password', label: api.label };
  }
  if ('expired' in api && api.expired) {
    return { status: 'expired' };
  }
  if ('notFound' in api && api.notFound) {
    const local = getVisionShareBySlug(slug);
    if (local) {
      const activated = activateVisionShareLink(local);
      return activated ? { status: 'ready', link: local } : { status: 'error', message: 'Could not start presentation' };
    }
    return { status: 'not_found' };
  }
  return { status: 'error', message: 'error' in api ? api.error : 'Vision Share unavailable' };
}
