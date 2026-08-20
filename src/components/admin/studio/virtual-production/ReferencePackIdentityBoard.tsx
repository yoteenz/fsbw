/**
 * Reference Pack V1 — Identity review board with direct upload + approve workflow.
 */

import { useCallback, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  REFERENCE_PACK_V1_SLOT_LABELS,
  PROFILE_STRESS_TEST_SLOTS,
} from '../../../../studio-os-core/virtual-production/identity/reference-pack-v1';
import type { ReferencePackSlotLifecycleState } from '../../../../studio-os-core/virtual-production/identity/types';
import type { ReferencePackSlot } from '../../../../studio-os-core/virtual-production/canon/frontal-slayer-canon';
import { buildNiaReferencePackV1SlotStates } from '../../../../studio-os-core/virtual-production/canon/frontal-slayer-canon';
import { OPENART_CHARACTER_AUDIT } from '../../../../studio-os-core/virtual-production/identity/openart-character-audit';
import { IDENTITY_FOUNDATION_BLOCKER } from '../../../../studio-os-core/virtual-production/identity/identity-gate';

export type ReferencePackSlotView = {
  slot: ReferencePackSlot;
  label: string;
  record: {
    state: ReferencePackSlotLifecycleState;
    approvedAssetId?: string;
    approvedMediaUrl?: string;
    candidateAssetId?: string;
    candidateMediaUrl?: string;
    notes?: string;
  };
};

export type ReferencePackBoardData = {
  packId?: string;
  locked?: boolean;
  primaryAnchor?: {
    assetId: string;
    mediaUrl?: string;
    source?: string;
    providerId?: string;
  } | null;
  slots: ReferencePackSlotView[];
  identityGateStatus?: 'blocked' | 'pass';
  rejectedCount?: number;
};

export type ReferencePackIdentityActions = {
  packReady?: boolean;
  busySlot?: ReferencePackSlot | null;
  onUpload: (slot: ReferencePackSlot, file: File, autoApprove?: boolean) => Promise<void>;
  onApprove: (slot: ReferencePackSlot, assetId: string, mediaUrl?: string) => Promise<void>;
  onReject: (slot: ReferencePackSlot, candidateAssetId: string) => Promise<void>;
  onSetAnchor: (assetId: string, mediaUrl?: string) => Promise<void>;
  onLock: () => Promise<void>;
  onUploadFrontAsAnchor?: (file: File) => Promise<void>;
  readyToLock?: boolean;
};

function slotStateClass(state: ReferencePackSlotLifecycleState): string {
  switch (state) {
    case 'approved':
    case 'locked':
      return 'vp-ref-approved';
    case 'candidate':
    case 'qc_required':
      return 'vp-ref-candidate';
    case 'rejected':
      return 'vp-ref-rejected';
    default:
      return 'vp-ref-missing';
  }
}

function buildDemoBoard(): ReferencePackBoardData {
  const states = buildNiaReferencePackV1SlotStates();
  return {
    locked: false,
    primaryAnchor: null,
    identityGateStatus: 'blocked',
    rejectedCount: 0,
    slots: Object.entries(states).map(([slot, record]) => ({
      slot: slot as ReferencePackSlot,
      label: REFERENCE_PACK_V1_SLOT_LABELS[slot as ReferencePackSlot],
      record,
    })),
  };
}

function ReferencePackSlotCard({
  slotView,
  locked,
  busy,
  hasAnchor,
  packReady,
  onUpload,
  onApprove,
  onReject,
  onSetAnchor,
  onCompare,
}: {
  slotView: ReferencePackSlotView;
  locked: boolean;
  busy: boolean;
  hasAnchor: boolean;
  packReady: boolean;
  onUpload: (file: File, autoApprove?: boolean) => void;
  onApprove: () => void;
  onReject: () => void;
  onSetAnchor: () => void;
  onCompare?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { slot, label, record } = slotView;
  const preview = record.approvedMediaUrl ?? record.candidateMediaUrl;
  const canApprove = !locked && record.candidateAssetId && record.state !== 'approved' && record.state !== 'locked';
  const canReject = !locked && record.candidateAssetId && record.state !== 'approved';
  const canSetAnchor =
    !locked &&
    record.approvedAssetId &&
    (record.state === 'approved' || record.state === 'locked');

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file, false);
    e.target.value = '';
  };

  return (
    <article className={`vp-ref-slot ${slotStateClass(record.state)}`} data-slot={slot}>
      <header>
        <span className="vp-ref-label">{label}</span>
        <span className="vp-ref-state">{record.state.replace(/_/g, ' ').toUpperCase()}</span>
      </header>
      <div className="vp-ref-thumb">
        {preview ? <img src={preview} alt={label} /> : <div className="vp-ref-placeholder">MISSING</div>}
      </div>
      {PROFILE_STRESS_TEST_SLOTS.includes(slot) && (
        <p className="vp-ref-note">Profile stress test</p>
      )}
      {!packReady && (
        <p className="vp-ref-note vp-ref-hint">Tap Initialize FS Canon first (header)</p>
      )}
      {packReady && !locked && (
        <div className="vp-ref-actions">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="vp-ref-file-input"
            onChange={handleFile}
            disabled={busy}
          />
          <button
            type="button"
            className="vp-action-btn"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? 'UPLOADING…' : 'UPLOAD'}
          </button>
          {canApprove && (
            <button type="button" className="vp-action-btn vp-action-approve" disabled={busy} onClick={onApprove}>
              APPROVE
            </button>
          )}
          {canReject && (
            <button type="button" className="vp-action-btn vp-action-reject" disabled={busy} onClick={onReject}>
              REJECT
            </button>
          )}
          {canSetAnchor && (
            <button type="button" className="vp-action-btn" disabled={busy} onClick={onSetAnchor}>
              SET ANCHOR
            </button>
          )}
        </div>
      )}
      {hasAnchor && slot !== 'front' && preview && (
        <button type="button" className="vp-action-btn" onClick={onCompare}>
          COMPARE TO ANCHOR →
        </button>
      )}
    </article>
  );
}

export type ReferencePackIdentityBoardProps = {
  board?: ReferencePackBoardData | null;
  loading?: boolean;
  error?: string | null;
  identityGateStatus?: 'blocked' | 'pass';
  actions?: ReferencePackIdentityActions;
};

export function ReferencePackIdentityBoard({
  board: boardProp,
  loading,
  error,
  identityGateStatus = 'blocked',
  actions,
}: ReferencePackIdentityBoardProps) {
  const demoMode = !actions?.packReady;
  const board = useMemo(() => {
    if (boardProp?.slots?.length) {
      return {
        ...boardProp,
        identityGateStatus: boardProp.identityGateStatus ?? identityGateStatus,
      };
    }
    return { ...buildDemoBoard(), identityGateStatus };
  }, [boardProp, identityGateStatus]);

  const [compareSlot, setCompareSlot] = useState<ReferencePackSlot | null>(null);
  const [mobileIndex, setMobileIndex] = useState(0);
  const anchorInputRef = useRef<HTMLInputElement>(null);

  const compareTarget = useMemo(() => {
    if (!compareSlot) return null;
    return board.slots.find((s) => s.slot === compareSlot) ?? null;
  }, [board.slots, compareSlot]);

  const handleAnchorUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && actions?.onUploadFrontAsAnchor) {
        void actions.onUploadFrontAsAnchor(file);
      } else if (file && actions) {
        void actions.onUpload('front', file, true);
      }
      e.target.value = '';
    },
    [actions]
  );

  const mobileSlot = board.slots[mobileIndex];
  const locked = board.locked ?? false;

  return (
    <section className="vp-identity-board" aria-label="Nia Reference Pack V1 identity board">
      <div className="vp-identity-gate-banner" data-status={board.identityGateStatus ?? 'blocked'}>
        <strong>CAMPAIGN 001 IDENTITY GATE</strong>
        <span>
          {board.identityGateStatus === 'pass'
            ? 'PASS — Reference Pack V1 locked'
            : `${IDENTITY_FOUNDATION_BLOCKER} — precision motion blocked`}
        </span>
      </div>

      {demoMode && (
        <p className="vp-note vp-operator-hint">
          <strong>Operator:</strong> Click <em>Initialize FS Canon + Campaign 001</em> in the header, then upload
          images directly to each slot — no Supabase links required.
        </p>
      )}

      {error && <p className="vp-error">{error}</p>}

      <div className="vp-identity-meta">
        <p>
          <strong>OpenArt character:</strong> {OPENART_CHARACTER_AUDIT.status.toUpperCase()} —{' '}
          {OPENART_CHARACTER_AUDIT.operatorPackage}
        </p>
      </div>

      <div className="vp-anchor-row">
        <h3>PRIMARY IDENTITY ANCHOR</h3>
        <div className="vp-anchor-card">
          {board.primaryAnchor?.mediaUrl ? (
            <img src={board.primaryAnchor.mediaUrl} alt="Primary identity anchor" />
          ) : (
            <div className="vp-ref-placeholder">
              <span>NOT DESIGNATED</span>
              <small>Upload + approve 01 FRONT, then SET ANCHOR</small>
              {actions?.packReady && !locked && (
                <>
                  <input
                    ref={anchorInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="vp-ref-file-input"
                    onChange={handleAnchorUpload}
                  />
                  <button
                    type="button"
                    className="vp-seed-btn vp-anchor-upload-btn"
                    onClick={() => anchorInputRef.current?.click()}
                  >
                    UPLOAD FRONT + APPROVE
                  </button>
                </>
              )}
            </div>
          )}
          {board.primaryAnchor && (
            <dl className="vp-dl vp-anchor-meta">
              <dt>Asset</dt>
              <dd>{board.primaryAnchor.assetId.slice(0, 8)}…</dd>
              <dt>Provider</dt>
              <dd>{board.primaryAnchor.providerId ?? '—'}</dd>
            </dl>
          )}
        </div>
      </div>

      <div className="vp-ref-grid vp-ref-grid-desktop">
        {board.slots.map((s) => (
          <ReferencePackSlotCard
            key={s.slot}
            slotView={s}
            locked={locked}
            busy={actions?.busySlot === s.slot}
            hasAnchor={Boolean(board.primaryAnchor?.mediaUrl)}
            packReady={Boolean(actions?.packReady)}
            onUpload={(file, autoApprove) => {
              if (actions) void actions.onUpload(s.slot, file, autoApprove);
            }}
            onApprove={() => {
              if (actions && s.record.candidateAssetId) {
                void actions.onApprove(s.slot, s.record.candidateAssetId, s.record.candidateMediaUrl);
              }
            }}
            onReject={() => {
              if (actions && s.record.candidateAssetId) {
                void actions.onReject(s.slot, s.record.candidateAssetId);
              }
            }}
            onSetAnchor={() => {
              if (actions && s.record.approvedAssetId) {
                void actions.onSetAnchor(s.record.approvedAssetId, s.record.approvedMediaUrl);
              }
            }}
            onCompare={() => setCompareSlot(s.slot)}
          />
        ))}
      </div>

      <div className="vp-ref-mobile">
        {mobileSlot && (
          <ReferencePackSlotCard
            slotView={mobileSlot}
            locked={locked}
            busy={actions?.busySlot === mobileSlot.slot}
            hasAnchor={Boolean(board.primaryAnchor?.mediaUrl)}
            packReady={Boolean(actions?.packReady)}
            onUpload={(file, autoApprove) => {
              if (actions) void actions.onUpload(mobileSlot.slot, file, autoApprove);
            }}
            onApprove={() => {
              if (actions && mobileSlot.record.candidateAssetId) {
                void actions.onApprove(
                  mobileSlot.slot,
                  mobileSlot.record.candidateAssetId,
                  mobileSlot.record.candidateMediaUrl
                );
              }
            }}
            onReject={() => {
              if (actions && mobileSlot.record.candidateAssetId) {
                void actions.onReject(mobileSlot.slot, mobileSlot.record.candidateAssetId);
              }
            }}
            onSetAnchor={() => {
              if (actions && mobileSlot.record.approvedAssetId) {
                void actions.onSetAnchor(
                  mobileSlot.record.approvedAssetId,
                  mobileSlot.record.approvedMediaUrl
                );
              }
            }}
            onCompare={() => setCompareSlot(mobileSlot.slot)}
          />
        )}
        <div className="vp-ref-mobile-nav">
          <button
            type="button"
            disabled={mobileIndex <= 0}
            onClick={() => setMobileIndex((i) => Math.max(0, i - 1))}
          >
            PREV
          </button>
          <span>
            {mobileIndex + 1} / {board.slots.length}
          </span>
          <button
            type="button"
            disabled={mobileIndex >= board.slots.length - 1}
            onClick={() => setMobileIndex((i) => Math.min(board.slots.length - 1, i + 1))}
          >
            NEXT
          </button>
        </div>
      </div>

      {compareTarget && board.primaryAnchor?.mediaUrl && (
        <div className="vp-compare-panel">
          <h4>COMPARE TO ANCHOR — {compareTarget.label}</h4>
          <div className="vp-compare-images">
            <figure>
              <figcaption>ANCHOR</figcaption>
              <img src={board.primaryAnchor.mediaUrl} alt="Anchor" />
            </figure>
            <figure>
              <figcaption>{compareTarget.label}</figcaption>
              {(compareTarget.record.approvedMediaUrl ?? compareTarget.record.candidateMediaUrl) ? (
                <img
                  src={
                    compareTarget.record.approvedMediaUrl ?? compareTarget.record.candidateMediaUrl
                  }
                  alt={compareTarget.label}
                />
              ) : (
                <div className="vp-ref-placeholder">MISSING</div>
              )}
            </figure>
          </div>
          <button type="button" className="vp-action-btn" onClick={() => setCompareSlot(null)}>
            CLOSE COMPARE
          </button>
        </div>
      )}

      <div className="vp-identity-lock-row">
        <button
          type="button"
          className="vp-seed-btn"
          disabled={!actions?.readyToLock || locked || loading}
          onClick={() => actions && void actions.onLock()}
        >
          LOCK REFERENCE PACK V1
        </button>
        {locked && (
          <p className="vp-note">V1 immutable — create Reference Pack V2 for future changes</p>
        )}
        {!locked && (
          <p className="vp-note">
            Upload → Approve all 13 slots → Set anchor → Lock · MANUAL IDENTITY QC
          </p>
        )}
      </div>

      {loading && <p className="vp-loading">Loading reference pack…</p>}
    </section>
  );
}
