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

type Props = { src: string; alt: string };

/** Read-only hair inspo thumb (Concierge order tracking, etc.). */
export function BookingConsultHairInspoThumb({ src, alt }: Props) {
  return (
    <div style={bookingConsultHairInspoThumbOuterStyle}>
      <div style={bookingConsultHairInspoThumbFrameStyle}>
        <img src={src} alt={alt} style={bookingConsultHairInspoThumbImgStyle} loading="lazy" />
      </div>
    </div>
  );
}
