import type { CSSProperties } from 'react';

/** Shared pulsing label — mobile lounge TV + desktop Slay Cinema tap. */
export const LOUNGE_TV_PRESS_PLAY_LABEL_STYLE: CSSProperties = {
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: '#808080',
  lineHeight: 1.2,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  animation: 'lounge-tv-press-play-pulse 1.6s ease-in-out infinite',
};

export const LOUNGE_TV_PRESS_PLAY_LABEL = 'PRESS TO PLAY';
