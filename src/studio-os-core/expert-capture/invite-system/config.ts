/**
 * Studio Institute route configuration — migration-ready (no hardcoded FSBW URLs).
 * Override via VITE_STUDIO_INSTITUTE_BASE_PATH and VITE_PUBLIC_APP_ORIGIN.
 */

export const STUDIO_INSTITUTE_BASE_PATH =
  (import.meta.env.VITE_STUDIO_INSTITUTE_BASE_PATH as string | undefined)?.replace(/\/$/, '') ||
  '/studio-institute';

export function studioInstitutePath(...segments: string[]): string {
  const tail = segments.filter(Boolean).join('/');
  return tail ? `${STUDIO_INSTITUTE_BASE_PATH}/${tail}` : STUDIO_INSTITUTE_BASE_PATH;
}

export function getPublicAppOrigin(): string {
  if (import.meta.env.VITE_PUBLIC_APP_ORIGIN) {
    return String(import.meta.env.VITE_PUBLIC_APP_ORIGIN).replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

export function buildInviteUrl(token: string): string {
  return `${getPublicAppOrigin()}${studioInstitutePath('invite', token)}`;
}

export function isStudioInstitutePath(pathname: string): boolean {
  return pathname === STUDIO_INSTITUTE_BASE_PATH || pathname.startsWith(`${STUDIO_INSTITUTE_BASE_PATH}/`);
}

export const STUDIO_INSTITUTE_ROUTES = {
  home: STUDIO_INSTITUTE_BASE_PATH,
  inviteManager: studioInstitutePath('invite'),
  interview: studioInstitutePath('interview'),
  knowledgeVault: studioInstitutePath('knowledge-vault'),
  inviteLanding: (token: string) => studioInstitutePath('invite', token),
} as const;
