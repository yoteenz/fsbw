/**
 * Section title row matching Account → Concierge cards (e.g. PRIORITY MESSAGES, ORDER TRACKING):
 * Futura PT Medium 12px red label, gray bottom rule, native brand-red icon on the right.
 */

const DEFAULT_HEADER_ICON_SRC = '/assets/NOIR/account-icon-red.svg';

export default function RoleCardSectionHeader({
  title,
  className = '',
  iconSrc = DEFAULT_HEADER_ICON_SRC,
}: {
  title: string;
  /** e.g. `pr-10` when a close (×) button sits in the top-right of the card */
  className?: string;
  /** Public path under `public/` (e.g. `/assets/personal-assistant-icon.svg`). */
  iconSrc?: string;
}) {
  const resolvedSrc = iconSrc ?? DEFAULT_HEADER_ICON_SRC;

  return (
    <div
      className={`flex items-center justify-between -mt-1 pb-1 border-b border-gray-200 mb-3${className ? ` ${className}` : ''}`}
    >
      <h2
        style={{
          fontFamily: '"Futura PT Medium"',
          color: '#EB1C24',
          fontSize: '12px',
          fontWeight: '500',
          margin: 0,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </h2>
      <img
        src={resolvedSrc}
        alt=""
        style={{
          width: '19.76px',
          height: '19.76px',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}
