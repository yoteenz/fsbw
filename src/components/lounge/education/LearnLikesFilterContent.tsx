import { AcrylicHeartGlyph } from '../AcrylicHeartGlyph';
import { LEARN_ACRYLIC_GLYPH_SIZE } from '../learnAcrylicGlyphSizes';

type LearnLikesFilterContentProps = {
  selected: boolean;
  /** When true, show label beside icon (default: icon only). */
  showLabel?: boolean;
};

/** Heart glyph for LIKES filter pill — same scale as mastery bookmark. */
export function LearnLikesFilterContent({ selected, showLabel = false }: LearnLikesFilterContentProps) {
  return (
    <>
      <span
        className="lounge-tv-learn-browse-filter__likes-glyph"
        style={{ width: LEARN_ACRYLIC_GLYPH_SIZE, height: LEARN_ACRYLIC_GLYPH_SIZE }}
        aria-hidden
      >
        <AcrylicHeartGlyph liked={selected} className="lounge-tv-learn-browse-filter__likes-glyph-img" />
      </span>
      {showLabel ? <span>LIKES</span> : null}
    </>
  );
}

export function renderLearnLikesFilterContent(filter: string, selected: boolean) {
  if (filter === 'LIKES') {
    return <LearnLikesFilterContent selected={selected} />;
  }
  return filter;
}
