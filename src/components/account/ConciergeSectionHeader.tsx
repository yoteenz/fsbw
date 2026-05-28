import { BRAND_RED } from '../../constants/brandRedIconFilter';

/**
 * Concierge card section title row — Futura 12px red label, gray bottom rule, native `#EB1C24` icon (no CSS filter).
 * Matches SPECIAL OFFER header treatment (`special-offer2.svg`).
 */
export default function ConciergeSectionHeader({
  title,
  iconSrc,
  iconWidth,
  iconHeight,
  marginBottom = '22px',
  iconTransform,
  iconAlt = '',
}: {
  title: string;
  iconSrc: string;
  iconWidth: number | string;
  iconHeight: number | string;
  marginBottom?: string;
  iconTransform?: string;
  iconAlt?: string;
}) {
  return (
    <div
      className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200"
      style={{ marginBottom }}
    >
      <h2
        style={{
          fontFamily: '"Futura PT Medium"',
          color: BRAND_RED,
          fontSize: '12px',
          fontWeight: '500',
          margin: 0,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </h2>
      <img
        src={iconSrc}
        alt={iconAlt}
        style={{
          width: iconWidth,
          height: iconHeight,
          objectFit: 'contain',
          ...(iconTransform ? { transform: iconTransform } : {}),
        }}
      />
    </div>
  );
}
