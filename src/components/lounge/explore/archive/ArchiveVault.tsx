import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { ArchiveCampaign } from '../../../../content/archive';
import { getArchiveRestorationSummary } from '../../../../content/archive';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../../loungeTvFocusHandlers';
import { LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_GRAY } from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';
import { ArchiveCampaignSlot } from './ArchiveCampaignSlot';
import { ArchiveVaultShell } from './ArchiveVaultShell';

type ArchiveVaultProps = {
  campaigns: ArchiveCampaign[];
  focusIdPrefix?: string;
  onCampaignOpen?: (campaign: ArchiveCampaign) => void;
  onEnterArchive?: () => void;
};

export function ArchiveVault({
  campaigns,
  focusIdPrefix = 'explore-archive',
  onCampaignOpen,
  onEnterArchive,
}: ArchiveVaultProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(campaigns[0]?.id ?? '');
  const [highlightPosition, setHighlightPosition] = useState(50);
  const summary = getArchiveRestorationSummary(campaigns);

  useEffect(() => {
    if (!campaigns.some((c) => c.id === activeId)) {
      setActiveId(campaigns[0]?.id ?? '');
    }
  }, [campaigns, activeId]);

  const updateHighlightFromSlot = useCallback((campaignId: string) => {
    const track = trackRef.current;
    if (!track) return;
    const slot = track.querySelector<HTMLElement>(`[data-archive-campaign-id="${campaignId}"]`);
    if (!slot) return;
    const trackRect = track.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();
    const center = slotRect.left + slotRect.width / 2;
    const pct = ((center - trackRect.left) / trackRect.width) * 100;
    setHighlightPosition(Math.min(88, Math.max(12, pct)));
  }, []);

  const handleFocus = useCallback(
    (campaign: ArchiveCampaign) => {
      setActiveId(campaign.id);
      updateHighlightFromSlot(campaign.id);
    },
    [updateHighlightFromSlot],
  );

  const handleActivate = useCallback(
    (campaign: ArchiveCampaign) => {
      if (campaign.status !== 'restored') return;
      onCampaignOpen?.(campaign);
    },
    [onCampaignOpen],
  );

  useEffect(() => {
    if (activeId) updateHighlightFromSlot(activeId);
  }, [activeId, campaigns.length, updateHighlightFromSlot]);

  const progressPct =
    summary.totalCount > 0 ? (summary.restoredCount / summary.totalCount) * 100 : 0;

  return (
    <div className="archive-vault" role="group" aria-label="Archive restoration vault">
      <div className="archive-vault__stage">
        <div className="archive-vault__interior">
          <span
            className="archive-vault__glass-highlight"
            aria-hidden
            style={{ '--archive-highlight-x': `${highlightPosition}%` } as CSSProperties}
          />
          <div
            ref={trackRef}
            className="archive-vault__track"
            role="list"
            aria-label="Historical campaigns"
          >
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="archive-vault__track-item"
                data-archive-campaign-id={campaign.id}
                role="listitem"
              >
                <ArchiveCampaignSlot
                  campaign={campaign}
                  active={campaign.id === activeId}
                  focusId={`${focusIdPrefix}-campaign-${campaign.id}`}
                  onFocus={handleFocus}
                  onActivate={handleActivate}
                />
              </div>
            ))}
          </div>
          <span className="archive-vault__edge-mask archive-vault__edge-mask--left" aria-hidden />
          <span className="archive-vault__edge-mask archive-vault__edge-mask--right" aria-hidden />
          {summary.inProgress ? (
            <span className="archive-vault__progress-line" aria-hidden style={{ width: `${progressPct}%` }} />
          ) : null}
        </div>
        <ArchiveVaultShell />
      </div>

      <div className="archive-vault__footer">
        <p
          className="archive-vault__status"
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_TYPE.l4,
            color: LOUNGE_TV_TEXT_GRAY,
            letterSpacing: '0.08em',
          }}
        >
          {summary.inProgress
            ? summary.restoredCount > 0
              ? `ARCHIVE RESTORATION IN PROGRESS · ${summary.restoredCount} OF ${summary.totalCount} CAMPAIGNS RESTORED`
              : 'ARCHIVE RESTORATION IN PROGRESS'
            : `${summary.restoredCount} CAMPAIGNS RESTORED`}
        </p>
        {onEnterArchive ? (
          <button
            type="button"
            className="archive-vault__enter"
            data-lounge-tv-focusable
            data-lounge-tv-focus-id={`${focusIdPrefix}-enter`}
            onClick={onEnterArchive}
            onFocusCapture={loungeTvFocusGlowIn}
            onBlurCapture={loungeTvFocusGlowOut}
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l4,
              letterSpacing: '0.06em',
            }}
          >
            ENTER THE ARCHIVE →
          </button>
        ) : null}
      </div>
    </div>
  );
}
