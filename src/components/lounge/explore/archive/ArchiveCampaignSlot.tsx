import type { ArchiveCampaign } from '../../../../content/archive';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../../loungeTvFocusHandlers';
import { LOUNGE_TV_FONT_DEMI, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_GRAY, LOUNGE_TV_TEXT_WHITE } from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';

type ArchiveCampaignSlotProps = {
  campaign: ArchiveCampaign;
  active: boolean;
  focusId: string;
  onFocus: (campaign: ArchiveCampaign) => void;
  onActivate: (campaign: ArchiveCampaign) => void;
};

function statusLabel(status: ArchiveCampaign['status']): string | null {
  if (status === 'restoring') return 'RESTORING';
  if (status === 'sealed') return 'SEALED';
  return null;
}

export function ArchiveCampaignSlot({
  campaign,
  active,
  focusId,
  onFocus,
  onActivate,
}: ArchiveCampaignSlotProps) {
  const disabled = campaign.status !== 'restored';
  const status = statusLabel(campaign.status);

  return (
    <button
      type="button"
      className={`archive-vault__slot archive-vault__slot--${campaign.status}${active ? ' is-active' : ''}`.trim()}
      data-lounge-tv-focusable
      data-lounge-tv-focus-id={focusId}
      aria-label={
        campaign.status === 'restored'
          ? `${campaign.year}${campaign.title ? ` — ${campaign.title}` : ''}`
          : `${campaign.year} — ${status ?? campaign.status}`
      }
      aria-pressed={active}
      disabled={false}
      onClick={() => {
        onFocus(campaign);
        if (active && campaign.status === 'restored') onActivate(campaign);
      }}
      onFocus={(e) => {
        loungeTvFocusGlowIn(e);
        onFocus(campaign);
      }}
      onBlurCapture={loungeTvFocusGlowOut}
    >
      <span className="archive-vault__plate" aria-hidden={disabled && !campaign.thumbnail}>
        {campaign.thumbnail ? (
          <img src={campaign.thumbnail} alt="" loading="lazy" decoding="async" draggable={false} />
        ) : (
          <span className="archive-vault__plate-empty" />
        )}
        <span className="archive-vault__plate-veil" aria-hidden />
        {status ? <span className="archive-vault__plate-status">{status}</span> : null}
      </span>
      <span
        className="archive-vault__year"
        style={{
          fontFamily: active ? LOUNGE_TV_FONT_DEMI : LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_TYPE.l3,
          color: active ? LOUNGE_TV_TEXT_WHITE : LOUNGE_TV_TEXT_GRAY,
          letterSpacing: '0.08em',
        }}
      >
        {campaign.year}
      </span>
    </button>
  );
}
