import type { LoungeContentPack } from './loungeTvContentPack';
import {
  contentPacksForFeaturedRow,
  getContentPackById,
} from './loungeTvContentPack';
import { LoungeTvContentPackCard } from './LoungeTvContentPackCard';
import { LoungeTvContentRow } from './LoungeTvContentRow';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import { getWatchProgressMap } from '../../utils/loungeTvLibrary';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import {
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from './loungeTvTheme';

type LoungeTvFeaturedHomeProps = {
  onSelect: (pack: LoungeContentPack) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
};

function continueWatchingPacks(): LoungeContentPack[] {
  const progress = getWatchProgressMap();
  return Object.values(progress)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((row) => getContentPackById(row.packId))
    .filter((p): p is LoungeContentPack => Boolean(p));
}

export function LoungeTvFeaturedHome({
  onSelect,
  onToggleSave,
  isUnlocked,
  unlocks,
}: LoungeTvFeaturedHomeProps) {
  const hero =
    contentPacksForFeaturedRow('hero')[0] ??
    contentPacksForFeaturedRow('new')[0] ??
    null;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: loungeTvGlassCqw(1.5, 4, 8) }}>
      {hero ? (
        <section>
          <LoungeTvContentPackCard
            pack={hero}
            variant="hero"
            onSelect={onSelect}
            onToggleSave={onToggleSave}
            isUnlocked={isUnlocked}
            unlocks={unlocks}
          />
          {hero.subtitle ? (
            <p
              style={{
                margin: `${loungeTvGlassCqw(0.8, 2, 4)} 0 0`,
                fontFamily: LOUNGE_TV_FONT_BOOK,
                fontSize: loungeTvGlassCqw(1.35, 3, 6),
                lineHeight: 1.35,
                color: LOUNGE_TV_TEXT_GRAY,
                textTransform: 'uppercase',
              }}
            >
              {hero.subtitle}
            </p>
          ) : null}
        </section>
      ) : null}

      <LoungeTvContentRow
        title="CONTINUE WATCHING"
        packs={continueWatchingPacks()}
        onSelect={onSelect}
        onToggleSave={onToggleSave}
        isUnlocked={isUnlocked}
        unlocks={unlocks}
        emptyLabel="START A LESSON TO SEE IT HERE."
      />

      <LoungeTvContentRow
        title="NEW THIS WEEK"
        packs={contentPacksForFeaturedRow('new')}
        onSelect={onSelect}
        onToggleSave={onToggleSave}
        isUnlocked={isUnlocked}
        unlocks={unlocks}
      />

      <LoungeTvContentRow
        title="TRENDING LESSONS"
        packs={contentPacksForFeaturedRow('trending')}
        onSelect={onSelect}
        onToggleSave={onToggleSave}
        isUnlocked={isUnlocked}
        unlocks={unlocks}
      />

      <LoungeTvContentRow
        title="PSA RECOMMENDS"
        packs={contentPacksForFeaturedRow('psa-recommends')}
        onSelect={onSelect}
        onToggleSave={onToggleSave}
        isUnlocked={isUnlocked}
        unlocks={unlocks}
      />

      <LoungeTvContentRow
        title="PREMIUM EXCLUSIVES"
        packs={contentPacksForFeaturedRow('premium')}
        onSelect={onSelect}
        onToggleSave={onToggleSave}
        isUnlocked={isUnlocked}
        unlocks={unlocks}
      />
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
        onClick={onBack}
        style={{
          alignSelf: 'flex-start',
          margin: 0,
          padding: 0,
          border: 'none',
          background: 'none',
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
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
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(2, 5, 10),
            color: LOUNGE_TV_TEXT_WHITE,
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
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: loungeTvGlassCqw(1.35, 3, 6),
              color: LOUNGE_TV_TEXT_GRAY,
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
          onClick={onWatch}
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1.5, 3.5, 7),
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: `${loungeTvGlassCqw(1, 2.5, 5)} ${loungeTvGlassCqw(1.5, 4, 8)}`,
            background: '#EB1C24',
            color: LOUNGE_TV_TEXT_WHITE,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          WATCH EPISODE
        </button>
        <button
          type="button"
          onClick={onRead}
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1.5, 3.5, 7),
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: `${loungeTvGlassCqw(1, 2.5, 5)} ${loungeTvGlassCqw(1.5, 4, 8)}`,
            background: 'transparent',
            color: LOUNGE_TV_TEXT_WHITE,
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
