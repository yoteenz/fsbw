/** P0.VR.3E — canonical implementation snapshot storage authority. */

import type { ComposerDraftSnapshotRecord, ViewportClass } from '../types';
import {
  COMPOSER_DERIVED_DRAFT_LABEL,
  FAMILY_SOURCE_SNAPSHOT_LABEL,
  P0_VR_3E_SNAPSHOT_AUTHORITY,
} from '../constants';

export type ImplementationSnapshotKind = 'SOURCE_SIBLING' | 'DERIVED_DRAFT';

export type ImplementationSnapshotRecord = ComposerDraftSnapshotRecord & {
  storageAuthority: typeof P0_VR_3E_SNAPSHOT_AUTHORITY;
  snapshotKind: ImplementationSnapshotKind;
  /** Supabase storage bucket path (canonical). */
  supabaseStoragePath: string;
  /** Local repo mirror for dev/preview (non-authoritative duplicate of Supabase when synced). */
  localMirrorPath?: string;
  sourceCommit?: string;
  targetId?: string;
  qaPassed?: boolean;
};

function slugFromRoute(route: string): string {
  return route
    .replace(/^\//, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'root';
}

export function buildSupabaseStoragePath(
  projectId: string,
  route: string,
  viewport: ViewportClass,
  kind: ImplementationSnapshotKind,
): string {
  const kindFolder = kind === 'SOURCE_SIBLING' ? 'family-source' : 'composer-derived';
  return `studio-world/implementation-snapshots/${projectId}/${slugFromRoute(route)}/${kindFolder}/${viewport.toLowerCase()}.webp`;
}

export function buildLocalMirrorPath(
  projectId: string,
  route: string,
  viewport: ViewportClass,
  kind: ImplementationSnapshotKind,
): string {
  const kindFolder = kind === 'SOURCE_SIBLING' ? 'family-source' : 'composer-derived';
  return `public/studio-world/implementation-snapshots/${projectId}/${slugFromRoute(route)}/${kindFolder}/${viewport.toLowerCase()}.webp`;
}

export function planImplementationSnapshot(
  input: {
    snapshotId: string;
    authorshipId: string;
    projectId: string;
    route: string;
    viewport: ViewportClass;
    kind: ImplementationSnapshotKind;
    sourceCommit?: string;
    targetId?: string;
    isSourceSibling?: boolean;
    sourceSiblingId?: string;
  },
): ImplementationSnapshotRecord {
  const label =
    input.kind === 'SOURCE_SIBLING' ? FAMILY_SOURCE_SNAPSHOT_LABEL : COMPOSER_DERIVED_DRAFT_LABEL;
  const supabaseStoragePath = buildSupabaseStoragePath(
    input.projectId,
    input.route,
    input.viewport,
    input.kind,
  );
  const localMirrorPath = buildLocalMirrorPath(
    input.projectId,
    input.route,
    input.viewport,
    input.kind,
  );

  return {
    snapshotId: input.snapshotId,
    authorshipId: input.authorshipId,
    projectId: input.projectId,
    route: input.route,
    viewport: input.viewport,
    label,
    capturePath: supabaseStoragePath,
    status: 'PENDING',
    isSourceSibling: input.isSourceSibling ?? input.kind === 'SOURCE_SIBLING',
    sourceSiblingId: input.sourceSiblingId,
    storageAuthority: P0_VR_3E_SNAPSHOT_AUTHORITY,
    snapshotKind: input.kind,
    supabaseStoragePath,
    localMirrorPath,
    sourceCommit: input.sourceCommit,
    targetId: input.targetId,
  };
}

/** Normalize legacy composer-drafts paths to P0.VR.3E authority. */
export function normalizeSnapshotStoragePath(
  snapshot: ComposerDraftSnapshotRecord,
  kind: ImplementationSnapshotKind,
): ImplementationSnapshotRecord {
  if (snapshot.capturePath?.includes('composer-drafts')) {
    return planImplementationSnapshot({
      snapshotId: snapshot.snapshotId,
      authorshipId: snapshot.authorshipId,
      projectId: snapshot.projectId,
      route: snapshot.route,
      viewport: snapshot.viewport,
      kind,
      isSourceSibling: snapshot.isSourceSibling,
      sourceSiblingId: snapshot.sourceSiblingId,
    });
  }
  return {
    ...snapshot,
    storageAuthority: P0_VR_3E_SNAPSHOT_AUTHORITY,
    snapshotKind: kind,
    supabaseStoragePath: snapshot.capturePath ?? buildSupabaseStoragePath(snapshot.projectId, snapshot.route, snapshot.viewport, kind),
    localMirrorPath: buildLocalMirrorPath(snapshot.projectId, snapshot.route, snapshot.viewport, kind),
  };
}

export function markImplementationSnapshotCaptured(
  snapshot: ImplementationSnapshotRecord,
  options?: { localMirrorPath?: string; capturedAt?: string },
): ImplementationSnapshotRecord {
  return {
    ...snapshot,
    status: 'CAPTURED',
    capturedAt: options?.capturedAt ?? new Date().toISOString(),
    localMirrorPath: options?.localMirrorPath ?? snapshot.localMirrorPath,
    qaPassed: true,
  };
}
