import type { PSATodayEpisode } from '../psa-today/types';
import { getPsaTodayEpisodeById } from '../psa-today/psaTodayCatalog';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';

type SlayTipRelatedPsaProps = {
  episodeId: string;
  onViewFullClass: (episode: PSATodayEpisode) => void;
};

export function SlayTipRelatedPsa({ episodeId, onViewFullClass }: SlayTipRelatedPsaProps) {
  const episode = getPsaTodayEpisodeById(episodeId);
  if (!episode) return null;

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(0.8, 2, 4),
        padding: loungeTvGlassCqw(1.2, 3, 6),
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        textTransform: 'uppercase',
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
          color: LOUNGE_TV_TEXT_GRAY,
          letterSpacing: '0.06em',
        }}
      >
        RELATED PSA TODAY
      </p>
      <h3
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
          color: LOUNGE_TV_TEXT_WHITE,
          lineHeight: 1.25,
        }}
      >
        {episode.title}
      </h3>
      <p
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
          color: LOUNGE_TV_TEXT_GRAY,
          lineHeight: 1.4,
        }}
      >
        {episode.shortDescription}
      </p>
      <button
        type="button"
        data-lounge-tv-focusable
        onClick={() => onViewFullClass(episode)}
        style={{
          alignSelf: 'flex-start',
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
          letterSpacing: '0.06em',
          padding: `${loungeTvGlassCqw(0.7, 1.8, 3.6)} ${loungeTvGlassCqw(1.2, 3, 6)}`,
          background: 'rgba(235, 28, 36, 0.15)',
          border: `1px solid ${LOUNGE_TV_BRAND_RED}`,
          color: LOUNGE_TV_TEXT_WHITE,
          cursor: 'pointer',
        }}
      >
        VIEW FULL CLASS
      </button>
    </section>
  );
}
