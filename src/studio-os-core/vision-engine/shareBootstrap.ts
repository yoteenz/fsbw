import { getVisionShareBySlug } from './store';
import { setVisionShareSessionActive } from './access';
import { launchVisionPresentation } from './launch';

/** Activate Vision Share link session from `/vision/:slug` — not a public menu entry. */
export function bootstrapVisionShareFromPath(pathname: string): boolean {
  if (typeof window === 'undefined') return false;
  const match = pathname.match(/^\/vision\/([^/?#]+)/);
  if (!match) return false;

  const slug = decodeURIComponent(match[1]);
  const link = getVisionShareBySlug(slug);
  if (!link) return false;

  if (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now()) {
    return false;
  }

  setVisionShareSessionActive(true);
  return launchVisionPresentation({
    modeId: link.modeId,
    workspaceId: link.workspaceId,
    presenterMode: link.presenterMode,
    luxuryAudio: true,
  });
}
