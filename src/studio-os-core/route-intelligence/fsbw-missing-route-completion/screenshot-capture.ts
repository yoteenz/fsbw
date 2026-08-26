import { COMPOSER_DRAFT_SNAPSHOT_LABEL } from '../constants';
import type {
  ComposerDraftSnapshotRecord,
  PageAuthorshipRecord,
  ViewportClass,
} from '../types';

/** P0.VR.3E composer draft capture — records snapshot intent; browser capture is founder-triggered. */
export function planComposerDraftSnapshots(
  authorship: PageAuthorshipRecord,
  viewports: ViewportClass[] = ['MOBILE', 'TABLET', 'DESKTOP'],
): ComposerDraftSnapshotRecord[] {
  return viewports.map((viewport) => ({
    snapshotId: `${authorship.authorshipId}:${viewport.toLowerCase()}`,
    authorshipId: authorship.authorshipId,
    projectId: authorship.projectId,
    route: authorship.route,
    viewport,
    label: COMPOSER_DRAFT_SNAPSHOT_LABEL,
    capturePath: `public/studio-world/composer-drafts/${authorship.projectId}${authorship.route.replace(/\//g, '_')}/${viewport.toLowerCase()}.webp`,
    status: 'PENDING' as const,
  }));
}

export function markSnapshotCaptured(
  snapshot: ComposerDraftSnapshotRecord,
  capturePath: string,
): ComposerDraftSnapshotRecord {
  return {
    ...snapshot,
    capturePath,
    capturedAt: new Date().toISOString(),
    status: 'CAPTURED',
  };
}

export function markSnapshotFailed(
  snapshot: ComposerDraftSnapshotRecord,
): ComposerDraftSnapshotRecord {
  return { ...snapshot, status: 'FAILED' };
}

export function summarizeSnapshotCapture(snapshots: ComposerDraftSnapshotRecord[]): {
  mobile: number;
  tablet: number;
  desktop: number;
  failed: number;
  pending: number;
} {
  const byVp = (vp: ViewportClass) =>
    snapshots.filter((s) => s.viewport === vp && s.status === 'CAPTURED').length;
  return {
    mobile: byVp('MOBILE'),
    tablet: byVp('TABLET'),
    desktop: byVp('DESKTOP'),
    failed: snapshots.filter((s) => s.status === 'FAILED').length,
    pending: snapshots.filter((s) => s.status === 'PENDING').length,
  };
}
