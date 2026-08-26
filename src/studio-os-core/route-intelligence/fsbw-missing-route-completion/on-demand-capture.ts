import { COMPOSER_DERIVED_DRAFT_LABEL, FAMILY_SOURCE_SNAPSHOT_LABEL } from '../constants';
import type {
  ComposerDraftSnapshotRecord,
  FamilySiblingCandidate,
  PageAuthorshipRecord,
  ViewportClass,
} from '../types';

export type OnDemandSiblingCaptureRequest = {
  sibling: FamilySiblingCandidate;
  projectId: string;
  authorshipId: string;
  viewports?: ViewportClass[];
  forceRecapture?: boolean;
};

export type OnDemandSiblingCaptureResult = {
  snapshots: ComposerDraftSnapshotRecord[];
  reusedExisting: boolean;
  captureRequired: boolean;
};

export function captureFamilySiblingOnDemand(
  request: OnDemandSiblingCaptureRequest,
  existingSnapshots: ComposerDraftSnapshotRecord[] = [],
): OnDemandSiblingCaptureResult {
  const viewports = request.viewports ?? ['MOBILE', 'TABLET', 'DESKTOP'];
  const existingForSibling = existingSnapshots.filter(
    (s) =>
      s.route === request.sibling.route &&
      s.isSourceSibling &&
      s.status === 'CAPTURED' &&
      !request.forceRecapture,
  );

  if (existingForSibling.length >= viewports.length) {
    return {
      snapshots: existingForSibling.filter((s) => viewports.includes(s.viewport)),
      reusedExisting: true,
      captureRequired: false,
    };
  }

  const snapshots: ComposerDraftSnapshotRecord[] = viewports.map((viewport) => {
    const existing = existingForSibling.find((s) => s.viewport === viewport);
    if (existing) return existing;
    return {
      snapshotId: `${request.authorshipId}:source:${request.sibling.siblingId}:${viewport.toLowerCase()}`,
      authorshipId: request.authorshipId,
      projectId: request.projectId,
      route: request.sibling.route,
      viewport,
      label: FAMILY_SOURCE_SNAPSHOT_LABEL,
      capturePath: `public/studio-world/composer-drafts/${request.projectId}${request.sibling.route.replace(/\//g, '_')}/source-${viewport.toLowerCase()}.webp`,
      status: 'PENDING',
      sourceSiblingId: request.sibling.siblingId,
      isSourceSibling: true,
    };
  });

  return {
    snapshots,
    reusedExisting: snapshots.every((s) => s.status === 'CAPTURED'),
    captureRequired: snapshots.some((s) => s.status === 'PENDING'),
  };
}

export function planDerivedTargetDraftSnapshots(
  authorship: PageAuthorshipRecord,
  viewports: ViewportClass[] = ['MOBILE', 'TABLET', 'DESKTOP'],
): ComposerDraftSnapshotRecord[] {
  return viewports.map((viewport) => ({
    snapshotId: `${authorship.authorshipId}:derived:${viewport.toLowerCase()}`,
    authorshipId: authorship.authorshipId,
    projectId: authorship.projectId,
    route: authorship.route,
    viewport,
    label: COMPOSER_DERIVED_DRAFT_LABEL,
    capturePath: `public/studio-world/composer-drafts/${authorship.projectId}${authorship.route.replace(/\//g, '_')}/derived-${viewport.toLowerCase()}.webp`,
    status: 'PENDING' as const,
  }));
}
