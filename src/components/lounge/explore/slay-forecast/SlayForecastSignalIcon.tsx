import type { ForecastEditionSignalCategory } from '../../../../content/slay-forecast';

type SlayForecastSignalIconProps = {
  category: ForecastEditionSignalCategory;
  className?: string;
};

/** Abstract monochrome signal glyph — weather-condition inspired. */
export function SlayForecastSignalIcon({ category, className = '' }: SlayForecastSignalIconProps) {
  const shared = {
    className: ['lounge-tv-slay-forecast-signal-icon', className].filter(Boolean).join(' '),
    viewBox: '0 0 20 20',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true as const,
  };

  switch (category) {
    case 'styling':
      return (
        <svg {...shared}>
          <path
            d="M6 14c2.5-4 5-5.5 8-6.5M5 10c2-2.5 4.5-3.5 7-4"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="7.5" cy="7" r="2.2" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case 'texture':
      return (
        <svg {...shared}>
          <path
            d="M3 11c2-1.5 4-2 6-2s4 .5 6 2M3 8c2.5-1.8 5-2.5 7-2.5s4.5.7 7 2.5"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          <path
            d="M4 14c2.2-1 4.5-1.5 6.5-1.5s4.3.5 6.5 1.5"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.65"
          />
        </svg>
      );
    case 'silhouette':
      return (
        <svg {...shared}>
          <circle cx="6" cy="10" r="1.1" fill="currentColor" opacity="0.85" />
          <circle cx="10" cy="8.5" r="0.9" fill="currentColor" opacity="0.65" />
          <circle cx="14" cy="11" r="1.1" fill="currentColor" opacity="0.85" />
          <circle cx="10" cy="13" r="0.75" fill="currentColor" opacity="0.45" />
        </svg>
      );
    case 'color':
      return (
        <svg {...shared}>
          <path
            d="M10 4l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L4.2 8.2l4-.6L10 4z"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg {...shared}>
          <path
            d="M10 4v12M4 10h12"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.7"
          />
          <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
  }
}
