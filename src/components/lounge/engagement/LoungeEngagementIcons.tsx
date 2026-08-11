import type { CSSProperties } from 'react';
import { LOUNGE_TV_BRAND_RED, LOUNGE_TV_TEXT_GRAY, LOUNGE_TV_TEXT_WHITE } from '../loungeTvTheme';

export type LoungeEngagementIconKind = 'helpful' | 'view' | 'comment' | 'bookmark';

export type LoungeEngagementIconState = 'inactive' | 'active' | 'disabled';

type LoungeEngagementIconProps = {
  kind: LoungeEngagementIconKind;
  state?: LoungeEngagementIconState;
  size?: string | number;
  style?: CSSProperties;
};

/**
 * Temporary placeholder icons — swap asset URLs in LOUNGE_ENGAGEMENT_ICON_ASSETS when acrylic PNGs arrive.
 */
export const LOUNGE_ENGAGEMENT_ICON_ASSETS: Record<
  LoungeEngagementIconKind,
  { inactive?: string; active?: string; default?: string }
> = {
  helpful: { inactive: undefined, active: undefined },
  view: { default: undefined },
  comment: { default: undefined },
  bookmark: { inactive: undefined, active: undefined },
};

function PlaceholderGlyph({ kind, active }: { kind: LoungeEngagementIconKind; active: boolean }) {
  const color = kind === 'helpful' && active ? LOUNGE_TV_BRAND_RED : LOUNGE_TV_TEXT_WHITE;
  const stroke = color;

  if (kind === 'helpful') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
        <path
          d="M12 20.5s-7-4.35-7-10a4 4 0 0 1 7-2.5 4 4 0 0 1 7 2.5c0 5.65-7 10-7 10z"
          stroke={active ? LOUNGE_TV_BRAND_RED : stroke}
          strokeWidth="1.6"
          fill={active ? 'rgba(235,28,36,0.22)' : 'none'}
        />
      </svg>
    );
  }

  if (kind === 'view') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
          stroke={stroke}
          strokeWidth="1.6"
        />
        <circle cx="12" cy="12" r="2.5" stroke={stroke} strokeWidth="1.6" />
      </svg>
    );
  }

  if (kind === 'comment') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
        <path
          d="M4 5h16v10H8l-4 4V5z"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinejoin="miter"
        />
      </svg>
    );
  }

  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <path
        d="M6 4h12v16l-6-4-6 4V4z"
        stroke={active ? LOUNGE_TV_BRAND_RED : stroke}
        strokeWidth="1.6"
        fill={active ? 'rgba(235,28,36,0.2)' : 'none'}
      />
    </svg>
  );
}

export function LoungeEngagementIcon({
  kind,
  state = 'inactive',
  size = '11px',
  style,
}: LoungeEngagementIconProps) {
  const active = state === 'active';
  const assets = LOUNGE_ENGAGEMENT_ICON_ASSETS[kind];
  const assetUrl =
    kind === 'view' || kind === 'comment'
      ? assets.default
      : active
        ? assets.active ?? assets.inactive
        : assets.inactive;

  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        opacity: state === 'disabled' ? 0.45 : 1,
        transition: 'opacity 0.15s ease',
        ...style,
      }}
    >
      {assetUrl ? (
        <img src={assetUrl} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      ) : (
        <PlaceholderGlyph kind={kind} active={active} />
      )}
    </span>
  );
}

export const LOUNGE_ENGAGEMENT_COUNT_COLOR = LOUNGE_TV_TEXT_GRAY;
