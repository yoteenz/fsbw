import { loungeTvGlassCqw } from './loungeTvResponsive';
import { LOUNGE_TV_FONT_BOOK, LOUNGE_TV_TEXT_GRAY } from './loungeTvTheme';

type LoungeTvEmptyStateProps = {
  message: string;
};

/** Readable from TV distance — no illustrations. */
export function LoungeTvEmptyState({ message }: LoungeTvEmptyStateProps) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: LOUNGE_TV_FONT_BOOK,
        fontSize: loungeTvGlassCqw(1.35, 3, 6),
        lineHeight: 1.45,
        color: LOUNGE_TV_TEXT_GRAY,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {message}
    </p>
  );
}
