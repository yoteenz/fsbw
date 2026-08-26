import type { PageAuthorshipRecord, PagePublishStatus } from '../types';

/** Preview-only guard — unapproved composer routes must not appear in production navigation. */
export function isPreviewOnlyPublishStatus(status: PagePublishStatus): boolean {
  return status === 'PREVIEW_ONLY';
}

export function isProductionNavBlocked(authorship: PageAuthorshipRecord): boolean {
  return (
    authorship.publishStatus === 'PREVIEW_ONLY' ||
    authorship.reviewStatus !== 'APPROVED_FOR_RELEASE'
  );
}

export function composerPreviewRoutePath(projectId: string, route: string): string {
  const normalized = route.startsWith('/') ? route : `/${route}`;
  return `/bluprint/preview/${projectId}${normalized}`;
}

export function canExposeRouteInProductionNav(authorship: PageAuthorshipRecord): boolean {
  return !isProductionNavBlocked(authorship);
}
