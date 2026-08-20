import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReferencePackSlot } from '../studio-os-core/virtual-production/canon/frontal-slayer-canon';
import { REFERENCE_PACK_V1_SLOT_LABELS } from '../studio-os-core/virtual-production/identity/reference-pack-v1';
import type { ReferencePackBoardData } from '../components/admin/studio/virtual-production/ReferencePackIdentityBoard';
import {
  approveReferencePackSlotClient,
  getReferencePackBoard,
  lockReferencePackV1Client,
  rejectReferencePackSlotClient,
  setReferencePackAnchorClient,
  uploadReferencePackSlot,
  type ReferencePackBoardResponse,
} from '../services/studio/virtualProduction/api';
import { readFileAsDataUrl } from '../services/studio/assetGeneration/api';

function mapApiBoardToUi(
  res: Awaited<ReturnType<typeof getReferencePackBoard>>
): ReferencePackBoardData | null {
  if (!res.pack?.id) return null;
  return {
    packId: res.pack.id,
    locked: Boolean(res.pack.locked_at),
    primaryAnchor: res.primaryAnchor,
    identityGateStatus: res.campaignIdentityGate?.evaluated?.status ?? 'blocked',
    rejectedCount: res.rejectedCount ?? 0,
    slots: (res.slots ?? []).map((s: ReferencePackBoardResponse['slots'][number]) => ({
      slot: s.slot as ReferencePackSlot,
      label: s.label ?? REFERENCE_PACK_V1_SLOT_LABELS[s.slot as ReferencePackSlot],
      record: {
        state: s.record.state as ReferencePackBoardData['slots'][0]['record']['state'],
        approvedMediaUrl: s.record.approvedMediaUrl,
        candidateMediaUrl: s.record.candidateMediaUrl,
        approvedAssetId: s.record.approvedAssetId,
        candidateAssetId: s.record.candidateAssetId,
        notes: s.record.notes,
      },
    })),
  };
}

export function useReferencePackBoard(orgId = 'frontal-slayer', enabled = true) {
  const [board, setBoard] = useState<ReferencePackBoardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [busySlot, setBusySlot] = useState<ReferencePackSlot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getReferencePackBoard(orgId);
      setBoard(mapApiBoardToUi(res));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load reference pack');
      setBoard(null);
    } finally {
      setLoading(false);
    }
  }, [orgId, enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const uploadSlot = useCallback(
    async (slot: ReferencePackSlot, file: File, autoApprove = false) => {
      if (!board?.packId) throw new Error('Initialize FS Canon + Campaign 001 first');
      setBusySlot(slot);
      setError(null);
      try {
        const imageDataUrl = await readFileAsDataUrl(file);
        await uploadReferencePackSlot({
          orgId,
          packId: board.packId,
          slot,
          imageDataUrl,
          autoApprove,
        });
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed');
        throw e;
      } finally {
        setBusySlot(null);
      }
    },
    [board?.packId, orgId, refresh]
  );

  const uploadFrontAsAnchor = useCallback(
    async (file: File) => {
      if (!board?.packId) throw new Error('Initialize FS Canon + Campaign 001 first');
      setBusySlot('front');
      setError(null);
      try {
        const imageDataUrl = await readFileAsDataUrl(file);
        const res = await uploadReferencePackSlot({
          orgId,
          packId: board.packId,
          slot: 'front',
          imageDataUrl,
          autoApprove: true,
        });
        await setReferencePackAnchorClient({
          orgId,
          packId: board.packId,
          assetId: res.asset.id,
          mediaUrl: res.publicUrl,
        });
        await refresh();
      } finally {
        setBusySlot(null);
      }
    },
    [board?.packId, orgId, refresh]
  );

  const approveSlot = useCallback(
    async (slot: ReferencePackSlot, assetId: string, mediaUrl?: string) => {
      if (!board?.packId) return;
      setBusySlot(slot);
      setError(null);
      try {
        await approveReferencePackSlotClient({
          orgId,
          packId: board.packId,
          slot,
          assetId,
          mediaUrl,
        });
        await refresh();
      } finally {
        setBusySlot(null);
      }
    },
    [board?.packId, orgId, refresh]
  );

  const rejectSlot = useCallback(
    async (slot: ReferencePackSlot, candidateAssetId: string) => {
      if (!board?.packId) return;
      setBusySlot(slot);
      setError(null);
      try {
        await rejectReferencePackSlotClient({
          orgId,
          packId: board.packId,
          slot,
          candidateAssetId,
        });
        await refresh();
      } finally {
        setBusySlot(null);
      }
    },
    [board?.packId, orgId, refresh]
  );

  const setAnchor = useCallback(
    async (assetId: string, mediaUrl?: string) => {
      if (!board?.packId) return;
      setError(null);
      try {
        await setReferencePackAnchorClient({
          orgId,
          packId: board.packId,
          assetId,
          mediaUrl,
        });
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not set anchor');
      }
    },
    [board?.packId, orgId, refresh]
  );

  const lockPack = useCallback(async () => {
    if (!board?.packId) return;
    setError(null);
    try {
      await lockReferencePackV1Client({ orgId, packId: board.packId });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not lock pack');
    }
  }, [board?.packId, orgId, refresh]);

  const readyToLock = useMemo(() => {
    if (!board?.packId || board.locked || !board.primaryAnchor) return false;
    return (
      board.slots.length === 13 &&
      board.slots.every((s) => s.record.state === 'approved' || s.record.state === 'locked')
    );
  }, [board]);

  return {
    board,
    loading,
    busySlot,
    error,
    readyToLock,
    refresh,
    uploadSlot,
    uploadFrontAsAnchor,
    approveSlot,
    rejectSlot,
    setAnchor,
    lockPack,
  };
}
