import type { CSSProperties } from 'react';

/** Matches `/booking/consultation` hair inspo thumbnails (not the remove control). */
export const BOOKING_CONSULT_HAIR_INSPO_THUMB_OUTER_PX = 88;

export const bookingConsultHairInspoThumbOuterStyle: CSSProperties = {
  width: `${BOOKING_CONSULT_HAIR_INSPO_THUMB_OUTER_PX}px`,
  height: `${BOOKING_CONSULT_HAIR_INSPO_THUMB_OUTER_PX}px`,
  flexShrink: 0,
};

export const bookingConsultHairInspoThumbFrameStyle: CSSProperties = {
  position: 'relative',
  padding: '1px',
  border: '3px solid white',
  boxShadow: '0 0 0 1.1px black',
  boxSizing: 'border-box',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f5f5f5',
  overflow: 'hidden',
};

export const bookingConsultHairInspoThumbImgStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  display: 'block',
};

type Props = { src: string; alt: string; /** e.g. **0.7** = 30% smaller than booking consult upload thumbs */ scale?: number };

/** Read-only hair inspo thumb (Concierge order tracking, etc.). Default size matches `/booking/consultation`. */
export function BookingConsultHairInspoThumb({ src, alt, scale = 1 }: Props) {
  const outerPx = Math.round(BOOKING_CONSULT_HAIR_INSPO_THUMB_OUTER_PX * scale);
  const outerStyle: CSSProperties = {
    ...bookingConsultHairInspoThumbOuterStyle,
    width: `${outerPx}px`,
    height: `${outerPx}px`,
  };
  return (
    <div style={outerStyle}>
      <div style={bookingConsultHairInspoThumbFrameStyle}>
        <img src={src} alt={alt} style={bookingConsultHairInspoThumbImgStyle} loading="lazy" />
      </div>
    </div>
  );
}
