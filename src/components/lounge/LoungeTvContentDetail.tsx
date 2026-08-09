import type { LoungeContentPack } from './loungeTvContentPack';
import { resolveContentPackFormat } from './loungeTvContentPack';
import { contentPackToTile } from './loungeTvContent';
import {
  LoungeTvBackButton,
  LoungeTvBadge,
  LoungeTvCtaButton,
  LoungeTvSectionTitle,
} from './LoungeTvUiPrimitives';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import {
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from './loungeTvTheme';
import { resolvePackArtwork } from './loungeTvArtwork';
import { loungeTvTileActionLabel, loungeTvContentIsAccessible } from './loungeTvTicketAccess';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import { getWatchProgress, isPackSaved, togglePackSaved } from '../../utils/loungeTvLibrary';
import { LoungeTvContentPackCard } from './LoungeTvContentPackCard';
import { relatedContentPacks } from './loungeTvContentPack';

type LoungeTvContentDetailProps = {
  pack: LoungeContentPack;
  onBack: () => void;
  onPlay: () => void;
  onRead?: () => void;
  onSelectRelated?: (pack: LoungeContentPack) => void;
  unlocks?: LoungeContentUnlock[];
  isUnlocked: (contentId: string) => boolean;
  onToggleSave?: () => void;
};

export function LoungeTvContentDetail({
  pack,
  onBack,
  onPlay,
  onRead,
  onSelectRelated,
  unlocks,
  isUnlocked,
  onToggleSave,
}: LoungeTvContentDetailProps) {
  const description = pack.article?.intro ?? pack.subtitle;
  const durationLabel = pack.runtime ?? pack.readTime;
  const tile = contentPackToTile(pack);
  const format = resolveContentPackFormat(pack);
  const poster = resolvePackArtwork(pack, 'hero');
  const progress = getWatchProgress(pack.id);
  const saved = isPackSaved(pack.id);
  const accessible = loungeTvContentIsAccessible(tile, unlocks ?? isUnlocked);
  const actionLabel = accessible
    ? progress && (progress.percent ?? 0) > 0 && (progress.percent ?? 0) < 95
      ? 'RESUME'
      : 'PLAY'
    : loungeTvTileActionLabel(tile, unlocks);

  const related = relatedContentPacks(pack).slice(0, 6);

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(1.5, 4, 8),
        textTransform: 'uppercase',
      }}
    >
      <LoungeTvBackButton onClick={onBack} />

      {poster ? (
        <img
          src={poster}
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

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: loungeTvGlassCqw(0.5, 1.2, 2.4) }}>
        {pack.isNew ? <LoungeTvBadge label="NEW" accent /> : null}
        {pack.isFreePreview ? <LoungeTvBadge label="FREE PREVIEW" /> : null}
        {pack.isPremium ? <LoungeTvBadge label="PREMIUM" accent /> : null}
        {!accessible && tile.ticketCost != null && tile.ticketCost > 0 ? (
          <LoungeTvBadge label={`${tile.ticketCost} SLAY TICKET${tile.ticketCost > 1 ? 'S' : ''}`} accent />
        ) : null}
      </div>

      <div>
        <p
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
            color: LOUNGE_TV_TEXT_GRAY,
            letterSpacing: '0.06em',
          }}
        >
          {pack.category ?? pack.series ?? 'FRONTAL SLAYER TV'}
          {durationLabel ? ` · ${durationLabel}` : ''}
        </p>
        <h1
          style={{
            margin: `${loungeTvGlassCqw(0.4, 1, 2)} 0 0`,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(2, 5, 10),
            color: LOUNGE_TV_TEXT_WHITE,
            lineHeight: 1.15,
          }}
        >
          {pack.title}
        </h1>
        {description ? (
          <p
            style={{
              margin: `${loungeTvGlassCqw(0.6, 1.5, 3)} 0 0`,
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: loungeTvGlassCqw(1.25, 2.8, 5.5),
              color: LOUNGE_TV_TEXT_GRAY,
              lineHeight: 1.4,
              textTransform: 'none',
            }}
          >
            {description}
          </p>
        ) : null}
      </div>

      {progress?.percent != null && progress.percent > 0 && progress.percent < 100 ? (
        <div
          style={{
            height: loungeTvGlassCqw(0.45, 1.1, 2.2),
            background: 'rgba(255,255,255,0.12)',
            width: '100%',
          }}
        >
          <span
            style={{
              display: 'block',
              height: '100%',
              width: `${progress.percent}%`,
              background: '#EB1C24',
            }}
          />
        </div>
      ) : null}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: loungeTvGlassCqw(0.8, 2, 4) }}>
        <LoungeTvCtaButton label={actionLabel} onClick={onPlay} />
        <LoungeTvCtaButton
          label={saved ? 'SAVED' : '+ SAVE'}
          variant="ghost"
          onClick={() => {
            togglePackSaved(pack.id);
            onToggleSave?.();
          }}
        />
        {onRead && (format === 'BOTH' || format === 'READ') ? (
          <LoungeTvCtaButton label="READ GUIDE" variant="ghost" onClick={onRead} />
        ) : null}
      </div>

      {related.length ? (
        <div data-lounge-tv-rail="detail-related">
          <LoungeTvSectionTitle title="RELATED" />
        <div data-lounge-tv-rail-scroll style={{ display: 'flex', gap: loungeTvGlassCqw(1.5, 3.5, 7), overflowX: 'auto' }}>
          {related.map((rel) => (
            <LoungeTvContentPackCard
              key={rel.id}
              pack={rel}
              onSelect={() => (onSelectRelated ? onSelectRelated(rel) : onPlay())}
              isUnlocked={isUnlocked}
              unlocks={unlocks}
            />
          ))}
        </div>
        </div>
      ) : null}
    </div>
  );
}
