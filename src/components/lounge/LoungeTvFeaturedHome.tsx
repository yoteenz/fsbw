import { useMemo } from 'react';
import type { LoungeContentPack } from './loungeTvContentPack';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { FEATURED_RAIL_ORDER, packsForFeaturedRail } from './loungeTvStreamingCatalog';
import { LoungeTvFeaturedHero } from './LoungeTvFeaturedHero';
import { LoungeTvContentRow } from './LoungeTvContentRow';

type LoungeTvFeaturedHomeProps = {
  onSelect: (pack: LoungeContentPack) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
};

export function LoungeTvFeaturedHome({
  onSelect,
  onToggleSave,
  isUnlocked,
  unlocks,
}: LoungeTvFeaturedHomeProps) {
  const rails = useMemo(() => {
    return FEATURED_RAIL_ORDER.filter(({ key }) => {
      if (key === 'continue') return packsForFeaturedRail('continue').length > 0;
      return packsForFeaturedRail(key).length > 0;
    });
  }, []);

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(2, 5, 10),
      }}
    >
      <div data-lounge-tv-rail="featured-hero">
        <LoungeTvFeaturedHero onWatch={onSelect} onToggleSave={onToggleSave} />
      </div>

      {rails.map(({ key, title }) => (
        <LoungeTvContentRow
          key={key}
          railId={`featured-${key}`}
          title={title}
          packs={packsForFeaturedRail(key)}
          onSelect={onSelect}
          onToggleSave={onToggleSave}
          isUnlocked={isUnlocked}
          unlocks={unlocks}
          emptyLabel={undefined}
        />
      ))}
    </div>
  );
}

type LoungeTvLessonHubProps = {
  pack: LoungeContentPack;
  onWatch: () => void;
  onRead: () => void;
  onBack: () => void;
};

export function LoungeTvLessonHub({ pack, onWatch, onRead, onBack }: LoungeTvLessonHubProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: loungeTvGlassCqw(1.5, 4, 8), width: '100%' }}>
      <button
        type="button"
        data-lounge-tv-focusable
        onClick={onBack}
        style={{
          alignSelf: 'flex-start',
          margin: 0,
          padding: 0,
          border: 'none',
          background: 'none',
          fontFamily: '"Futura PT Medium", Futura, sans-serif',
          fontSize: loungeTvGlassCqw(1.5, 3.5, 7),
          color: '#EB1C24',
          cursor: 'pointer',
          textTransform: 'uppercase',
        }}
      >
        ← BACK
      </button>

      {pack.heroImage || pack.thumbnail ? (
        <img
          src={pack.heroImage ?? pack.thumbnail}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            aspectRatio: '16 / 9',
            objectFit: 'cover',
            display: 'block',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        />
      ) : null}

      <div>
        <h1
          style={{
            margin: 0,
            fontFamily: '"Futura PT Medium", Futura, sans-serif',
            fontSize: loungeTvGlassCqw(2, 5, 10),
            color: '#ffffff',
            textTransform: 'uppercase',
            lineHeight: 1.2,
          }}
        >
          {pack.title}
        </h1>
        {pack.subtitle ? (
          <p
            style={{
              margin: `${loungeTvGlassCqw(0.6, 1.5, 3)} 0 0`,
              fontFamily: '"Futura PT Book", Futura, sans-serif',
              fontSize: loungeTvGlassCqw(1.35, 3, 6),
              color: '#808080',
              textTransform: 'uppercase',
              lineHeight: 1.35,
            }}
          >
            {pack.subtitle}
          </p>
        ) : null}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: loungeTvGlassCqw(0.8, 2, 4) }}>
        <button
          type="button"
          data-lounge-tv-focusable
          onClick={onWatch}
          style={{
            fontFamily: '"Futura PT Medium", Futura, sans-serif',
            fontSize: loungeTvGlassCqw(1.5, 3.5, 7),
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: `${loungeTvGlassCqw(1, 2.5, 5)} ${loungeTvGlassCqw(1.5, 4, 8)}`,
            background: '#EB1C24',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          WATCH EPISODE
        </button>
        <button
          type="button"
          data-lounge-tv-focusable
          onClick={onRead}
          style={{
            fontFamily: '"Futura PT Medium", Futura, sans-serif',
            fontSize: loungeTvGlassCqw(1.5, 3.5, 7),
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: `${loungeTvGlassCqw(1, 2.5, 5)} ${loungeTvGlassCqw(1.5, 4, 8)}`,
            background: 'transparent',
            color: '#ffffff',
            border: '1px solid #EB1C24',
            cursor: 'pointer',
          }}
        >
          READ GUIDE
        </button>
      </div>
    </div>
  );
}
