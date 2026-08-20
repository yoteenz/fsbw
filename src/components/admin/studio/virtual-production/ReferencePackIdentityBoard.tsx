/**
 * Reference Pack V1 — Identity review board (anchor + 13 slots).
 */

import { useCallback, useMemo, useState } from 'react';
import {
  REFERENCE_PACK_V1_SLOT_LABELS,
  PROFILE_STRESS_TEST_SLOTS,
} from '../../../../studio-os-core/virtual-production/identity/reference-pack-v1';
import type { ReferencePackSlotLifecycleState } from '../../../../studio-os-core/virtual-production/identity/types';
import type { ReferencePackSlot } from '../../../../studio-os-core/virtual-production/canon/frontal-slayer-canon';
import { buildNiaReferencePackV1SlotStates } from '../../../../studio-os-core/virtual-production/canon/frontal-slayer-canon';
import { OPENART_CHARACTER_AUDIT } from '../../../../studio-os-core/virtual-production/identity/openart-character-audit';
import { NIA_IDENTITY_REPO_AUDIT } from '../../../../studio-os-core/virtual-production/identity/identity-audit';
import { IDENTITY_FOUNDATION_BLOCKER } from '../../../../studio-os-core/virtual-production/identity/identity-gate';

export type ReferencePackSlotView = {
  slot: ReferencePackSlot;
  label: string;
  record: {
    state: ReferencePackSlotLifecycleState;
    approvedMediaUrl?: string;
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

export type ReferencePackIdentityBoardProps = {
  board?: ReferencePackBoardData | null;
  loading?: boolean;
  identityGateStatus?: 'blocked' | 'pass';
  onCompareSlot?: (slot: ReferencePackSlot) => void;
};

export function ReferencePackIdentityBoard({
  board: boardProp,
  loading,
  identityGateStatus = 'blocked',
  onCompareSlot,
}: ReferencePackIdentityBoardProps) {
  const board = useMemo(() => {
    const base = boardProp ?? buildDemoBoard();
    if (!base.slots?.length) {
      return { ...buildDemoBoard(), ...base, identityGateStatus };
    }
    return { ...base, identityGateStatus: base.identityGateStatus ?? identityGateStatus };
  }, [boardProp, identityGateStatus]);
  const [compareSlot, setCompareSlot] = useState<ReferencePackSlot | null>(null);
  const [mobileIndex, setMobileIndex] = useState(0);

  const compareTarget = useMemo(() => {
    if (!compareSlot) return null;
    return board.slots.find((s) => s.slot === compareSlot) ?? null;
  }, [board.slots, compareSlot]);

  const handleCompare = useCallback(
    (slot: ReferencePackSlot) => {
      setCompareSlot(slot);
      onCompareSlot?.(slot);
    },
    [onCompareSlot]
  );

  const mobileSlot = board.slots[mobileIndex];

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

      <div className="vp-identity-meta">
        <p>
          <strong>OpenArt character:</strong> {OPENART_CHARACTER_AUDIT.status.toUpperCase()} —{' '}
          {OPENART_CHARACTER_AUDIT.operatorPackage}
        </p>
        <p>
          <strong>Repo audit:</strong> {NIA_IDENTITY_REPO_AUDIT.summary}
        </p>
        {board.rejectedCount != null && board.rejectedCount > 0 && (
          <p>
            <strong>Rejected candidates:</strong> {board.rejectedCount} (provenance preserved)
          </p>
        )}
      </div>

      <div className="vp-anchor-row">
        <h3>PRIMARY IDENTITY ANCHOR</h3>
        <div className="vp-anchor-card">
          {board.primaryAnchor?.mediaUrl ? (
            <img src={board.primaryAnchor.mediaUrl} alt="Primary identity anchor" />
          ) : (
            <div className="vp-ref-placeholder">
              <span>NOT DESIGNATED</span>
              <small>Upload / approve FRONT slot first</small>
            </div>
          )}
          {board.primaryAnchor && (
            <dl className="vp-dl vp-anchor-meta">
              <dt>Asset</dt>
              <dd>{board.primaryAnchor.assetId.slice(0, 8)}…</dd>
              <dt>Provider</dt>
              <dd>{board.primaryAnchor.providerId ?? '—'}</dd>
              <dt>Source</dt>
              <dd>{board.primaryAnchor.source ?? '—'}</dd>
            </dl>
          )}
        </div>
      </div>

      {/* Desktop grid */}
      <div className="vp-ref-grid vp-ref-grid-desktop">
        {board.slots.map((s) => (
          <article
            key={s.slot}
            className={`vp-ref-slot ${slotStateClass(s.record.state)}`}
            data-slot={s.slot}
          >
            <header>
              <span className="vp-ref-label">{s.label}</span>
              <span className="vp-ref-state">{s.record.state.replace(/_/g, ' ').toUpperCase()}</span>
            </header>
            <div className="vp-ref-thumb">
              {s.record.approvedMediaUrl || s.record.candidateMediaUrl ? (
                <img
                  src={s.record.approvedMediaUrl ?? s.record.candidateMediaUrl}
                  alt={s.label}
                />
              ) : (
                <div className="vp-ref-placeholder">MISSING</div>
              )}
            </div>
            {PROFILE_STRESS_TEST_SLOTS.includes(s.slot) && (
              <p className="vp-ref-note">Profile stress test</p>
            )}
            {board.primaryAnchor && s.slot !== 'front' && (
              <button type="button" className="vp-action-btn" onClick={() => handleCompare(s.slot)}>
                COMPARE TO ANCHOR →
              </button>
            )}
          </article>
        ))}
      </div>

      {/* Mobile swipe */}
      <div className="vp-ref-mobile">
        {mobileSlot && (
          <article className={`vp-ref-slot ${slotStateClass(mobileSlot.record.state)}`}>
            <header>
              <span className="vp-ref-label">{mobileSlot.label}</span>
              <span className="vp-ref-state">
                {mobileSlot.record.state.replace(/_/g, ' ').toUpperCase()}
              </span>
            </header>
            <div className="vp-ref-thumb vp-ref-thumb-large">
              {mobileSlot.record.approvedMediaUrl || mobileSlot.record.candidateMediaUrl ? (
                <img
                  src={mobileSlot.record.approvedMediaUrl ?? mobileSlot.record.candidateMediaUrl}
                  alt={mobileSlot.label}
                />
              ) : (
                <div className="vp-ref-placeholder">MISSING</div>
              )}
            </div>
          </article>
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
              {compareTarget.record.approvedMediaUrl || compareTarget.record.candidateMediaUrl ? (
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
        <button type="button" className="vp-seed-btn" disabled={!board.packId || board.locked || loading}>
          LOCK REFERENCE PACK V1
        </button>
        {board.locked && (
          <p className="vp-note">V1 immutable — create Reference Pack V2 for future changes</p>
        )}
        {!board.locked && (
          <p className="vp-note">Requires primary anchor + all 13 slots APPROVED · MANUAL IDENTITY QC</p>
        )}
      </div>

      {loading && <p className="vp-loading">Loading reference pack…</p>}
    </section>
  );
}
