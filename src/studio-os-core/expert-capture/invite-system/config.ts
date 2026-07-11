/**
 * Studio Institute route configuration — migration-ready (no hardcoded FSBW URLs).
 * Override via VITE_STUDIO_INSTITUTE_BASE_PATH, VITE_PUBLIC_APP_ORIGIN, or VITE_PUBLIC_APP_BASE_URL.
 */

export const STUDIO_INSTITUTE_BASE_PATH =
  (import.meta.env.VITE_STUDIO_INSTITUTE_BASE_PATH as string | undefined)?.replace(/\/$/, '') ||
  '/studio-institute';

export function studioInstitutePath(...segments: string[]): string {
  const tail = segments.filter(Boolean).join('/');
  return tail ? `${STUDIO_INSTITUTE_BASE_PATH}/${tail}` : STUDIO_INSTITUTE_BASE_PATH;
}

/** Canonical public origin for absolute invite URLs — never hardcode deployment host. */
export function getPublicAppOrigin(): string {
  const base =
    import.meta.env.VITE_PUBLIC_APP_BASE_URL ??
    import.meta.env.VITE_PUBLIC_APP_ORIGIN ??
    import.meta.env.PUBLIC_APP_BASE_URL;
  if (base) return String(base).replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

export function buildInviteUrl(token: string): string {
  return `${getPublicAppOrigin()}${studioInstitutePath('invite', token)}`;
}

export function buildInvitePreviewUrl(token: string): string {
  const path = `${studioInstitutePath('invite', token)}?preview=owner`;
  const origin = getPublicAppOrigin();
  return origin ? `${origin}${path}` : path;
}

export function isStudioInstitutePath(pathname: string): boolean {
  return pathname === STUDIO_INSTITUTE_BASE_PATH || pathname.startsWith(`${STUDIO_INSTITUTE_BASE_PATH}/`);
}

export const STUDIO_INSTITUTE_ROUTES = {
  home: STUDIO_INSTITUTE_BASE_PATH,
  /** Owner invite management dashboard */
  inviteManager: studioInstitutePath('invites'),
  /** Legacy alias — redirects to inviteManager */
  inviteManagerLegacy: studioInstitutePath('invite'),
  interview: studioInstitutePath('interview'),
  knowledgeVault: studioInstitutePath('knowledge-vault'),
  inviteLanding: (token: string) => studioInstitutePath('invite', token),
} as const;
