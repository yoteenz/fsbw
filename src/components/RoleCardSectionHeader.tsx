/**
 * Section title row matching Account → Concierge cards (e.g. PRIORITY MESSAGES, ORDER TRACKING):
 * Futura PT Medium 12px red label, gray bottom rule, brand-tinted icon on the right.
 */
const ROLE_HEADER_ICON_FILTER =
  'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%) drop-shadow(0 0 0.15px #EB1C24) drop-shadow(0 0 0.15px #EB1C24) drop-shadow(0 0 0.1px #EB1C24) drop-shadow(0 0 0.2px #EB1C24)';

export default function RoleCardSectionHeader({
  title,
  className = '',
}: {
  title: string;
  /** e.g. `pr-10` when a close (×) button sits in the top-right of the card */
  className?: string;
}) {
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
        src="/assets/NOIR/account-icon.svg"
        alt=""
        style={{
          width: '19.76px',
          height: '19.76px',
          objectFit: 'contain',
          filter: ROLE_HEADER_ICON_FILTER,
        }}
      />
    </div>
  );
}
