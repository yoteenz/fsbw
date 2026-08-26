/** P0.BRIDGE.1A — regression: on-demand capture return types compile against P0.VR.3E labels */

import { describe, expect, it } from 'vitest';
import {
  captureFamilySiblingOnDemand,
  planDerivedTargetDraftSnapshots,
} from './on-demand-capture.js';
import type { ComposerDraftSnapshotRecord, PageAuthorshipRecord } from '../types.js';

describe('on-demand-capture — TypeScript contract (P0.VR.3E / P0.VR.3L)', () => {
  it('returns ComposerDraftSnapshotRecord[] with P0.VR.3E authority for sibling capture', () => {
    const sibling = {
      siblingId: 's1',
      designScreenId: 's1',
      route: '/admin/studio/character-lab/visual',
      displayName: 'Visual',
      familyId: 'f1',
      score: 80,
      confidence: 'HIGH' as const,
      similarityExplanation: 'test',
      hasSnapshot: false,
      snapshotStale: false,
      captureRequired: true,
    };

    const result = captureFamilySiblingOnDemand(
      {
        sibling,
        projectId: 'studio-world',
        authorshipId: 'auth-1',
        sourceCommit: 'abc123',
      },
      [],
    );

    const snaps: ComposerDraftSnapshotRecord[] = result.snapshots;
    expect(snaps.length).toBe(3);
    expect(snaps.every((s) => s.storageAuthority === 'P0.VR.3E')).toBe(true);
    expect(snaps.every((s) => s.label === 'FAMILY SOURCE · EXISTING IMPLEMENTATION')).toBe(true);
    expect(result.captureRequired).toBe(true);
  });

  it('plans derived draft snapshots with COMPOSER DERIVED DRAFT label', () => {
    const authorship = {
      authorshipId: 'auth-voice',
      projectId: 'studio-world',
      route: '/admin/studio/character-lab/voice',
    } as unknown as PageAuthorshipRecord;

    const snaps: ComposerDraftSnapshotRecord[] = planDerivedTargetDraftSnapshots(authorship, ['MOBILE'], 'abc123');
    expect(snaps[0]?.label).toBe('CURRENT · COMPOSER DERIVED DRAFT');
    expect(snaps[0]?.snapshotKind).toBe('DERIVED_DRAFT');
  });
});
