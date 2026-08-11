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
import { loungeTvContentDetailHeading, loungeTvDisplayBodyText } from './loungeTvDisplayText';
import { loungeTvTileActionLabel, loungeTvContentIsAccessible } from './loungeTvTicketAccess';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import { getWatchProgress, isPackSaved, togglePackSaved } from '../../utils/loungeTvLibrary';
import { LoungeTvContentPackCard } from './LoungeTvContentPackCard';
import { relatedContentPacks } from './loungeTvContentPack';
import { LOUNGE_TV_DETAIL_TYPE } from './loungeTvTypography';
import { LoungeTvPackEngagementHost } from './engagement/LoungeTvPackEngagementHost';

type LoungeTvContentDetailProps = {
  pack: LoungeContentPack;
  onBack: () => void;
  onPlay: () => void;
  onRead?: () => void;
  onSelectRelated?: (pack: LoungeContentPack) => void;
  unlocks?: LoungeContentUnlock[];
  isUnlocked: (contentId: string) => boolean;
  onToggleSave?: () => void;
  onEngagementRequireSignIn?: () => void;
  isSignedInForEngagement?: boolean;
  engagementUserEmail?: string | null;
  engagementToast?: (message: string) => void;
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
  onEngagementRequireSignIn,
  isSignedInForEngagement = false,
  engagementUserEmail = null,
  engagementToast,
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

  const categoryLine = [pack.category ?? pack.series ?? 'FRONTAL SLAYER TV', durationLabel]
    .filter(Boolean)
    .join(' · ');

  const related = relatedContentPacks(pack).slice(0, 6);

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(1.3, 3.2, 6.5),
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

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: loungeTvGlassCqw(0.5, 1.2, 2.4), alignItems: 'center' }}>
        {pack.isFreePreview ? <LoungeTvBadge label="FREE PREVIEW" textAccent /> : null}
        {pack.isNew ? <LoungeTvBadge label="NEW" accent /> : null}
        {pack.isPremium ? <LoungeTvBadge label="PREMIUM" accent /> : null}
        {!accessible && tile.ticketCost != null && tile.ticketCost > 0 ? (
          <LoungeTvBadge label={`${tile.ticketCost} SLAY TICKET${tile.ticketCost > 1 ? 'S' : ''}`} accent />
        ) : null}
      </div>

      <div>
        {categoryLine ? (
          <p
            style={{
              margin: 0,
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: LOUNGE_TV_DETAIL_TYPE.meta,
              color: LOUNGE_TV_TEXT_GRAY,
              letterSpacing: '0.06em',
            }}
          >
            {categoryLine}
          </p>
        ) : null}
        <h1
          style={{
            margin: `${loungeTvGlassCqw(0.45, 1.1, 2.2)} 0 0`,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_DETAIL_TYPE.pageTitle,
            color: LOUNGE_TV_TEXT_WHITE,
            lineHeight: 1.15,
          }}
        >
          {loungeTvContentDetailHeading(pack)}
        </h1>
        {description ? (
          <p
            style={{
              margin: `${loungeTvGlassCqw(0.55, 1.3, 2.6)} 0 0`,
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: LOUNGE_TV_DETAIL_TYPE.body,
              color: LOUNGE_TV_TEXT_GRAY,
              lineHeight: 1.45,
              maxWidth: '40em',
            }}
          >
            {loungeTvDisplayBodyText(description)}
          </p>
        ) : null}
      </div>

      <LoungeTvPackEngagementHost
        pack={pack}
        variant="bar"
        onRequireSignIn={() => onEngagementRequireSignIn?.()}
        isSignedIn={isSignedInForEngagement}
        userEmail={engagementUserEmail}
        engagementToast={engagementToast}
      />

      {progress?.percent != null && progress.percent > 0 && progress.percent < 100 ? (
        <div
          style={{
            height: loungeTvGlassCqw(0.4, 0.95, 1.9),
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

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: loungeTvGlassCqw(0.7, 1.8, 3.6), alignItems: 'center' }}>
        <LoungeTvCtaButton label={actionLabel} onClick={onPlay} />
        <LoungeTvCtaButton
          label={saved ? 'SAVED' : '+ SAVE'}
          variant="secondary"
          onClick={() => {
            togglePackSaved(pack.id);
            onToggleSave?.();
          }}
        />
        {onRead && (format === 'BOTH' || format === 'READ') ? (
          <LoungeTvCtaButton label="READ GUIDE" variant="tertiary" onClick={onRead} />
        ) : null}
      </div>

      {related.length ? (
        <div data-lounge-tv-rail="detail-related">
          <LoungeTvSectionTitle title="RELATED" />
          <div
            data-lounge-tv-rail-scroll
            style={{ display: 'flex', gap: loungeTvGlassCqw(1.5, 3.5, 7), overflowX: 'auto' }}
          >
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
