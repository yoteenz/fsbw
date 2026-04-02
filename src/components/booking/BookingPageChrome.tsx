import type { CSSProperties, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BOOKING_BADGE_HEADER_APPOINTMENT_PX,
  BOOKING_BADGE_HEADER_CONSULT_PX,
  bookingPageHeaderBadgeSrc
} from '../../utils/bookingBadges';

export { booking_badge_display_px } from '../../utils/bookingBadges';

/** Premium / standard appointment or consult badge inside the booking card (below crumb title). */
export function BookingTierBadgeImg() {
  const { pathname } = useLocation();
  const src = bookingPageHeaderBadgeSrc(pathname);
  if (!src) return null;
  const p = pathname.toLowerCase();
  const isConsult = p.includes('consult');
  const headerPx = isConsult ? BOOKING_BADGE_HEADER_CONSULT_PX : BOOKING_BADGE_HEADER_APPOINTMENT_PX;
  return (
    <div className="flex justify-center w-full" style={{ margin: '10px 0 0' }}>
      <img
        src={src}
        alt=""
        style={{
          width: `${headerPx}px`,
          height: `${headerPx}px`,
          objectFit: 'contain',
          display: 'block'
        }}
        draggable={false}
      />
    </div>
  );
}

/** Shared typography stacks for booking flows (matches brand + CORE). */
export const bookingFontMedium = '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif';
export const bookingFontBook = '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif';
export const bookingFontScript = '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif';

const ruleGray = '#e5e7eb';

/** Matches brand inner card: optional red uppercase label + optional middle (e.g. tier badge) + gray rule. */
export function BookingCrumbTitle({
  children,
  middle,
  hideRule
}: {
  children?: ReactNode;
  middle?: ReactNode;
  /** When true, omit the gray rule below the badge (e.g. hair appointment Memphis subline). */
  hideRule?: boolean;
}) {
  return (
    <>
      {children != null && children !== false && (
        <p
          style={{
            fontFamily: bookingFontMedium,
            fontSize: '12px',
            color: '#EB1C24',
            margin: '0 0 8px',
            textTransform: 'uppercase',
            fontWeight: 500,
            textAlign: 'center',
            letterSpacing: '0.04em'
          }}
        >
          {children}
        </p>
      )}
      {middle}
      <div
        style={{
          borderBottom: hideRule ? 'none' : `1px solid ${ruleGray}`,
          marginTop: hideRule ? 0 : '12px',
          marginBottom: hideRule ? '28px' : '16px'
        }}
      />
    </>
  );
}

/** Large script headline under the crumb row. */
export function BookingScriptHero({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-center"
      style={{
        fontFamily: bookingFontScript,
        fontSize: '32px',
        lineHeight: 1.15,
        margin: '0 0 10px',
        color: '#EB1C24'
      }}
    >
      {children}
    </p>
  );
}

/** Subline under hero (location, tagline). */
export function BookingHeroSubline({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: bookingFontMedium,
        fontSize: '10px',
        color: '#000',
        textTransform: 'uppercase',
        textAlign: 'center',
        lineHeight: 1.45,
        margin: '0 0 18px',
        letterSpacing: '0.02em'
      }}
    >
      {children}
    </p>
  );
}

/** Section title (accent red or neutral black). */
export function BookingSectionHeading({
  accent,
  align = 'center',
  fontSize = '12px',
  children
}: {
  accent?: boolean;
  align?: 'left' | 'center';
  /** Default 12px; hair appointment uses 11px for SERVICE TYPE / ADD TO YOUR APPOINTMENT. */
  fontSize?: string;
  children: ReactNode;
}) {
  return (
    <p
      style={{
        fontFamily: bookingFontMedium,
        fontSize,
        color: accent ? '#EB1C24' : '#000',
        textTransform: 'uppercase',
        margin: '0 0 14px',
        textAlign: align,
        fontWeight: 500,
        letterSpacing: '0.02em'
      }}
    >
      {children}
    </p>
  );
}

/** Centered body copy (Book for long reads). */
export function BookingBodyParagraph({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <p
      style={{
        fontFamily: bookingFontBook,
        fontSize: '9px',
        color: '#000',
        textTransform: 'uppercase',
        textAlign: 'center',
        lineHeight: 1.55,
        marginTop: 0,
        marginRight: 0,
        marginBottom: '12px',
        marginLeft: 0,
        padding: 0,
        letterSpacing: '0.03em',
        ...style
      }}
    >
      {children}
    </p>
  );
}

/** Muted footnote / helper. */
export function BookingMutedNote({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <p
      style={{
        fontFamily: bookingFontBook,
        fontSize: '8px',
        color: '#808080',
        textTransform: 'uppercase',
        textAlign: 'center',
        margin: '0 0 12px',
        lineHeight: 1.45,
        letterSpacing: '0.02em',
        ...style
      }}
    >
      {children}
    </p>
  );
}

/** Add to bag control — same layout and classes as the NOIR product page add-to-bag button. */
export function NoirStyleAddToBagButton({
  onClick,
  disabled,
  state,
  idleLabel = 'ADD TO BAG',
  /** When true, label stays `idleLabel` in adding/added (e.g. A/C “proceed to checkout”). */
  alwaysShowIdleLabel = false
}: {
  onClick: () => void;
  disabled?: boolean;
  state: 'idle' | 'adding' | 'added';
  /** Default `ADD TO BAG`; appointment/consult use the same string. */
  idleLabel?: string;
  alwaysShowIdleLabel?: boolean;
}) {
  return (
    <div className="w-full" style={{ marginTop: '2px' }}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`border border-black font-futura w-full text-center py-2 text-[11px] font-semibold ${
          state === 'adding'
            ? 'bg-white cursor-not-allowed'
            : state === 'added'
              ? 'bg-white cursor-pointer'
              : 'bg-white cursor-pointer hover:bg-gray-50'
        }`}
        style={{
          borderWidth: '1.3px',
          color: '#EB1C24',
          fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
          backgroundColor: '#FFFFFF'
        }}
      >
        {alwaysShowIdleLabel || state === 'idle' ? (
          idleLabel
        ) : state === 'adding' ? (
          'ADDING...'
        ) : (
          <span className="flex items-center justify-center gap-1">
            <img src="/assets/check.svg" alt="" width={9} height={9} />
            <span style={{ color: '#808080' }}>IN THE BAG</span>
          </span>
        )}
      </button>
    </div>
  );
}

/** Primary CTA — matches common bag / checkout borders. */
export function bookingPrimaryButtonStyle(disabled: boolean): CSSProperties {
  return {
    borderWidth: '1.3px',
    borderStyle: 'solid',
    borderColor: '#000',
    color: '#EB1C24',
    fontFamily: bookingFontMedium,
    backgroundColor: '#FFFFFF',
    width: '100%',
    textAlign: 'center',
    padding: '12px 16px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.85 : 1
  };
}
