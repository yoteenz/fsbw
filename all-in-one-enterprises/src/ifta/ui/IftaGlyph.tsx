/**
 * IFTA authority glyphs — the filled / badge icons drawn on the approved screens and the ICON / ASSET SHEET
 * (§3 metrics icons, workflow icons, status icons, file / document icons). Hand-drawn SVG; no dependency.
 * Line icons stay in IftaIcon (lucide geometry).
 */
import type { SVGProps } from 'react';

export type IftaGlyphName =
  | 'metric-miles'
  | 'metric-fuel'
  | 'metric-pin'
  | 'metric-coins'
  | 'status-done'
  | 'status-current'
  | 'status-upcoming'
  | 'status-blocked'
  | 'ring-check'
  | 'flag'
  | 'info'
  | 'truck-solid'
  | 'pill-bars'
  | 'bell-solid';

type Props = { name: IftaGlyphName; size?: number } & Omit<SVGProps<SVGSVGElement>, 'name'>;

export function IftaGlyph({ name, size = 24, ...rest }: Props) {
  const common = { width: size, height: size, 'aria-hidden': true as const, focusable: 'false' as const, ...rest };
  switch (name) {
    case 'metric-miles':
      return (
        <svg viewBox="0 0 36 40" {...common}>
          <rect x="1" y="26" width="6" height="13" rx="1.2" fill="currentColor" />
          <rect x="10" y="19" width="6" height="20" rx="1.2" fill="currentColor" />
          <rect x="19" y="11" width="6" height="28" rx="1.2" fill="currentColor" />
          <rect x="28" y="2" width="6" height="37" rx="1.2" fill="currentColor" />
        </svg>
      );
    case 'metric-fuel':
      return (
        <svg viewBox="0 0 36 40" {...common}>
          <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2h13A3.5 3.5 0 0 1 24 5.5V36h1.5a1.5 1.5 0 0 1 0 3h-23a1.5 1.5 0 0 1 0-3H4z" fill="currentColor" />
          <rect x="8" y="7" width="12" height="9" rx="1.4" fill="#fff" />
          <path d="M24 17h3a2.5 2.5 0 0 1 2.5 2.5v10a2 2 0 0 0 4 0V12.6a3 3 0 0 0-.9-2.1L28 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'metric-pin':
      return (
        <svg viewBox="0 0 36 40" {...common}>
          <path d="M18 1C9.7 1 3.5 7.3 3.5 15.2 3.5 25.8 18 39 18 39s14.5-13.2 14.5-23.8C32.5 7.3 26.3 1 18 1z" fill="currentColor" />
          <circle cx="18" cy="15" r="5.6" fill="#fff" />
        </svg>
      );
    case 'metric-coins':
      return (
        <svg viewBox="0 0 36 40" {...common}>
          {[30, 22.5, 15, 7.5].map((y, i) => (
            <g key={y}>
              <path d={`M4 ${y}v4.2c0 2.7 6.3 4.8 14 4.8s14-2.1 14-4.8V${y}`} fill="currentColor" />
              <ellipse cx="18" cy={y} rx="14" ry="4.8" fill="currentColor" stroke="#fff" strokeOpacity={i === 3 ? 0 : 0.55} strokeWidth="1.1" />
            </g>
          ))}
          <ellipse cx="18" cy="7.5" rx="9" ry="2.6" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.1" />
        </svg>
      );
    case 'status-done':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="11" fill="currentColor" />
          <path d="m7 12.4 3.2 3.1L17 8.8" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'status-current':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="10.6" fill="#fff" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 7.6v8.8M7.6 12h8.8" stroke="#1a1a1a" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      );
    case 'status-upcoming':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="10.6" fill="#fff" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="7.8" cy="12" r="1.35" fill="#2a2a2a" />
          <circle cx="12" cy="12" r="1.35" fill="#2a2a2a" />
          <circle cx="16.2" cy="12" r="1.35" fill="#2a2a2a" />
        </svg>
      );
    case 'status-blocked':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="10.6" fill="#fff" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 6.8v6.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="12" cy="16.9" r="1.4" fill="currentColor" />
        </svg>
      );
    case 'ring-check':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="10.4" fill="none" stroke="currentColor" strokeWidth="1.9" />
          <path d="m7.4 12.3 3.1 3 6.1-6.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'flag':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M4.5 2.5v19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M5.5 3.2h13.8l-3 5 3 5H5.5z" fill="currentColor" />
        </svg>
      );
    case 'info':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="10.3" fill="none" stroke="currentColor" strokeWidth="1.9" />
          <path d="M12 10.6v6.2" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
          <circle cx="12" cy="7.3" r="1.35" fill="currentColor" />
        </svg>
      );
    case 'truck-solid':
      return (
        <svg viewBox="0 0 32 24" {...common}>
          <path d="M1 4.5A1.5 1.5 0 0 1 2.5 3h15A1.5 1.5 0 0 1 19 4.5V17H1z" fill="currentColor" />
          <path d="M20 7.5h5.6a1.6 1.6 0 0 1 1.3.66L30.6 13a1.7 1.7 0 0 1 .4 1.1V17H20z" fill="currentColor" />
          <rect x="22" y="9.4" width="4.2" height="3.4" rx=".6" fill="#fff" />
          <circle cx="7" cy="18.5" r="3.2" fill="currentColor" stroke="#fff" strokeWidth="1.4" />
          <circle cx="25" cy="18.5" r="3.2" fill="currentColor" stroke="#fff" strokeWidth="1.4" />
        </svg>
      );
    case 'pill-bars':
      return (
        <svg viewBox="0 0 22 22" {...common}>
          <rect x="2" y="12" width="3.4" height="8" rx=".7" fill="currentColor" />
          <rect x="7.3" y="8" width="3.4" height="12" rx=".7" fill="currentColor" />
          <rect x="12.6" y="4.5" width="3.4" height="15.5" rx=".7" fill="currentColor" />
          <rect x="17.9" y="1.5" width="3.4" height="18.5" rx=".7" fill="currentColor" />
        </svg>
      );
    case 'bell-solid':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 2.2a1.4 1.4 0 0 1 1.4 1.4v.6A6.6 6.6 0 0 1 18.6 10.7v4.1l1.9 2.6a1 1 0 0 1-.8 1.6H4.3a1 1 0 0 1-.8-1.6l1.9-2.6v-4.1a6.6 6.6 0 0 1 5.2-6.5v-.6A1.4 1.4 0 0 1 12 2.2z" fill="currentColor" />
          <path d="M9.6 20a2.5 2.5 0 0 0 4.8 0z" fill="currentColor" />
        </svg>
      );
  }
}

/** File-type tile (asset sheet §5 FILE TYPE BADGES): PDF red · XLS green · CSV blue · DOC grey — from the real file name. */
export function IftaFileBadge({ fileName, size = 28 }: { fileName: string; size?: number }) {
  const ext = (fileName.split('.').pop() ?? '').toLowerCase();
  const kind = ext === 'pdf' ? 'pdf' : ext === 'csv' ? 'csv' : ext === 'xls' || ext === 'xlsx' ? 'xls' : ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'heic' ? 'img' : 'doc';
  const fill = { pdf: '#E8463C', csv: '#2F7BEA', xls: '#1E9E5A', img: '#7B7F87', doc: '#6B7079' }[kind];
  const label = { pdf: 'PDF', csv: 'CSV', xls: 'XLS', img: 'IMG', doc: 'DOC' }[kind];
  return (
    <svg className={`ifta-file ifta-file--${kind}`} width={size} height={size} viewBox="0 0 28 32" aria-hidden="true" focusable="false">
      <path d="M3 2.5A2.5 2.5 0 0 1 5.5 0H18l7 7v22.5a2.5 2.5 0 0 1-2.5 2.5h-17A2.5 2.5 0 0 1 3 29.5z" fill={fill} />
      <path d="M18 0v5a2 2 0 0 0 2 2h5z" fill="#fff" fillOpacity=".45" />
      <text x="14" y="23" textAnchor="middle" fontSize="7.4" fontWeight="700" fill="#fff" fontFamily="Inter, system-ui, sans-serif" letterSpacing=".3">
        {label}
      </text>
    </svg>
  );
}
