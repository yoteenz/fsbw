import { loungeTvGlassCqw } from './loungeTvResponsive';
import { LOUNGE_TV_TYPE } from './loungeTvTypography';
import {
  isLoungeTvSilentFocus,
  loungeTvFocusBorderIn,
  loungeTvFocusBorderOut,
  loungeTvFocusGlowIn,
  loungeTvFocusGlowOut,
} from './loungeTvFocusHandlers';
import {
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from './loungeTvTheme';

export type LoungeTvLibraryDestinationDef = {
  id: string;
  title: string;
  description: string;
};

export const LOUNGE_TV_LIBRARY_DESTINATIONS: LoungeTvLibraryDestinationDef[] = [
  {
    id: 'purchased',
    title: 'PURCHASED',
    description: 'Your purchased classes and films.',
  },
  {
    id: 'downloads',
    title: 'DOWNLOADS',
    description: 'Offline viewing.',
  },
  {
    id: 'completed',
    title: 'COMPLETED COURSES',
    description: 'Review finished Masters.',
  },
  {
    id: 'certificates',
    title: 'CERTIFICATES',
    description: 'View earned certificates.',
  },
  {
    id: 'history',
    title: 'WATCH HISTORY',
    description: "Everything you've watched.",
  },
];

type LoungeTvLibraryDestinationListProps = {
  onSelect: (sectionId: string) => void;
};

export function LoungeTvLibraryDestinationList({ onSelect }: LoungeTvLibraryDestinationListProps) {
  return (
    <section data-lounge-tv-rail="library-destinations" style={{ marginTop: loungeTvGlassCqw(1, 3, 6) }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: loungeTvGlassCqw(1, 2.5, 5) }}>
        {LOUNGE_TV_LIBRARY_DESTINATIONS.map((dest) => (
          <button
            key={dest.id}
            type="button"
            data-lounge-tv-focusable
            data-lounge-tv-focus-id={`library-dest-${dest.id}`}
            onClick={() => onSelect(dest.id)}
            onFocusCapture={(e) => {
              if (isLoungeTvSilentFocus(e.currentTarget)) return;
              e.currentTarget.style.transform = 'scale(1.02)';
              loungeTvFocusGlowIn(e);
              loungeTvFocusBorderIn(e);
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              loungeTvFocusGlowOut(e);
              loungeTvFocusBorderOut(e, 'rgba(255,255,255,0.14)');
            }}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: loungeTvGlassCqw(1.4, 3.5, 7),
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.04)',
              cursor: 'pointer',
              transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.2s ease',
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: loungeTvGlassCqw(1, 2.5, 5),
              }}
            >
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: 'block',
                    fontFamily: LOUNGE_TV_FONT_MEDIUM,
                    fontSize: LOUNGE_TV_TYPE.l2,
                    color: LOUNGE_TV_TEXT_WHITE,
                    lineHeight: 1.15,
                  }}
                >
                  {dest.title}
                </span>
                <span
                  style={{
                    display: 'block',
                    marginTop: loungeTvGlassCqw(0.5, 1.2, 2.4),
                    fontFamily: LOUNGE_TV_FONT_BOOK,
                    fontSize: LOUNGE_TV_TYPE.l3,
                    color: LOUNGE_TV_TEXT_GRAY,
                    lineHeight: 1.35,
                  }}
                >
                  {dest.description.toUpperCase()}
                </span>
              </span>
              <span
                aria-hidden
                style={{
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: LOUNGE_TV_TYPE.l2,
                  color: LOUNGE_TV_TEXT_GRAY,
                  flexShrink: 0,
                }}
              >
                {'>'}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
