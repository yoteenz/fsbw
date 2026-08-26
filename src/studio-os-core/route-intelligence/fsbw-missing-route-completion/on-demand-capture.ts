import {
  COMPOSER_DERIVED_DRAFT_LABEL,
  FAMILY_SOURCE_SNAPSHOT_LABEL,
} from '../constants';
import type {
  ComposerDraftSnapshotRecord,
  FamilySiblingCandidate,
  PageAuthorshipRecord,
  ViewportClass,
} from '../types';
import {
  planImplementationSnapshot,
  markImplementationSnapshotCaptured,
  type ImplementationSnapshotRecord,
} from '../implementation-snapshots/storage';

export type OnDemandSiblingCaptureRequest = {
  sibling: FamilySiblingCandidate;
  projectId: string;
  authorshipId: string;
  viewports?: ViewportClass[];
  forceRecapture?: boolean;
  sourceCommit?: string;
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
      s.storageAuthority === 'P0.VR.3E' &&
      !request.forceRecapture,
  );

  if (existingForSibling.length >= viewports.length) {
    return {
      snapshots: existingForSibling.filter((s) => viewports.includes(s.viewport)),
      reusedExisting: true,
      captureRequired: false,
    };
  }

  const snapshots: ImplementationSnapshotRecord[] = viewports.map((viewport) => {
    const existing = existingForSibling.find((s) => s.viewport === viewport);
    if (existing) {
      return existing as ImplementationSnapshotRecord;
    }
    return planImplementationSnapshot({
      snapshotId: `${request.authorshipId}:source:${request.sibling.siblingId}:${viewport.toLowerCase()}`,
      authorshipId: request.authorshipId,
      projectId: request.projectId,
      route: request.sibling.route,
      viewport,
      kind: 'SOURCE_SIBLING',
      sourceCommit: request.sourceCommit,
      isSourceSibling: true,
      sourceSiblingId: request.sibling.siblingId,
    });
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
  sourceCommit?: string,
  targetId?: string,
): ComposerDraftSnapshotRecord[] {
  return viewports.map((viewport) =>
    planImplementationSnapshot({
      snapshotId: `${authorship.authorshipId}:derived:${viewport.toLowerCase()}`,
      authorshipId: authorship.authorshipId,
      projectId: authorship.projectId,
      route: authorship.route,
      viewport,
      kind: 'DERIVED_DRAFT',
      sourceCommit,
      targetId,
    }),
  );
}

export { markImplementationSnapshotCaptured, FAMILY_SOURCE_SNAPSHOT_LABEL, COMPOSER_DERIVED_DRAFT_LABEL };
