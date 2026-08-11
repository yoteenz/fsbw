import type { CSSProperties, ReactNode } from 'react';
import type { SlayTip, SlayTipPage } from '../../../content/education/types';
import type { PSATodayEpisode } from '../psa-today/types';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_DETAIL_TYPE } from '../loungeTvTypography';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { LoungeTvSectionDivider } from '../LoungeTvSectionDivider';
import { slayTipDetailCategoryLabel, slayTipRelatedClassMetaLine, slayTipRelatedClassThumbnail } from './slayTipDetailMeta';
import { slayTipPreviewCopy, slayTipPublicTitle, slayTipRevealTitle } from './slayTipContent';

const UNLOCK_VALUE_COPY = 'One focused technique. Yours to keep once unlocked.';

type SlayTipDetailHeaderProps = {
  tip: SlayTip;
  /** When true, show teaser copy under title. */
  showTeaser?: boolean;
};

export function SlayTipDetailHeader({ tip, showTeaser = true }: SlayTipDetailHeaderProps) {
  const category = slayTipDetailCategoryLabel(tip);
  const publicTitle = slayTipPublicTitle(tip);
  const teaser = showTeaser ? slayTipPreviewCopy(tip) : null;

  return (
    <header>
      <p
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_DETAIL_TYPE.eyebrow,
          color: LOUNGE_TV_BRAND_RED,
          letterSpacing: '0.08em',
        }}
      >
        SLAY TIP · {category}
      </p>
      <h1
        style={{
          margin: `${loungeTvGlassCqw(0.5, 1.2, 2.4)} 0 0`,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_DETAIL_TYPE.pageTitle,
          color: LOUNGE_TV_TEXT_WHITE,
          lineHeight: 1.12,
        }}
      >
        {publicTitle}
      </h1>
      {teaser ? (
        <p
          style={{
            margin: `${loungeTvGlassCqw(0.6, 1.4, 2.8)} 0 0`,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: LOUNGE_TV_DETAIL_TYPE.body,
            color: LOUNGE_TV_TEXT_GRAY,
            lineHeight: 1.45,
            maxWidth: '36em',
          }}
        >
          {teaser}
        </p>
      ) : null}
    </header>
  );
}

type SlayTipPreviewProps = {
  src?: string;
  alt?: string;
};

/** Wide cinematic preview — locked-state intrigue only. */
export function SlayTipPreview({ src, alt }: SlayTipPreviewProps) {
  if (!src) return null;

  return (
    <figure
      style={{
        margin: `${loungeTvGlassCqw(0.85, 2, 4)} 0 0`,
        width: '100%',
        aspectRatio: '16 / 9',
        maxHeight: loungeTvGlassCqw(20, 46, 84),
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <img
        src={src}
        alt={alt ?? ''}
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 38%',
          display: 'block',
        }}
      />
    </figure>
  );
}

type SlayTipUnlockProps = {
  ticketLabel: string;
  busy: boolean;
  onRedeem: () => void;
};

export function SlayTipUnlock({ ticketLabel, busy, onRedeem }: SlayTipUnlockProps) {
  return (
    <section
      aria-label="Unlock Slay Tip"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: loungeTvGlassCqw(0.55, 1.3, 2.6),
        paddingLeft: loungeTvGlassCqw(0.75, 1.8, 3.6),
        borderLeft: `2px solid ${LOUNGE_TV_BRAND_RED}`,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_DETAIL_TYPE.sectionTitle,
          color: LOUNGE_TV_TEXT_WHITE,
          letterSpacing: '0.06em',
          lineHeight: 1.2,
        }}
      >
        UNLOCK THE TIP
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_DETAIL_TYPE.cardTitle,
          color: LOUNGE_TV_BRAND_RED,
          letterSpacing: '0.05em',
          lineHeight: 1.15,
        }}
      >
        {ticketLabel}
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: LOUNGE_TV_DETAIL_TYPE.body,
          color: LOUNGE_TV_TEXT_GRAY,
          lineHeight: 1.45,
          maxWidth: '32em',
        }}
      >
        {UNLOCK_VALUE_COPY}
      </p>
      <button
        type="button"
        data-lounge-tv-focusable
        disabled={busy}
        onClick={onRedeem}
        style={unlockBtnStyle(busy)}
      >
        {`USE ${ticketLabel}`}
      </button>
    </section>
  );
}

type SlayTipRevealProps = {
  tip: SlayTip;
};

export function SlayTipReveal({ tip }: SlayTipRevealProps) {
  const revealTitle = slayTipRevealTitle(tip);
  if (!revealTitle) return null;

  return (
    <section aria-label="The tip">
      <p
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_DETAIL_TYPE.eyebrow,
          color: LOUNGE_TV_BRAND_RED,
          letterSpacing: '0.08em',
        }}
      >
        THE TIP
      </p>
      <p
        style={{
          margin: `${loungeTvGlassCqw(0.45, 1.1, 2.2)} 0 0`,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_DETAIL_TYPE.sectionTitle,
          color: LOUNGE_TV_TEXT_WHITE,
          lineHeight: 1.2,
        }}
      >
        {revealTitle}
      </p>
    </section>
  );
}

type SlayTipContentProps = {
  page: SlayTipPage;
  coverFallback?: string;
};

export function SlayTipContentPage({ page, coverFallback }: SlayTipContentProps) {
  const image = page.imageUrl ?? coverFallback;

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(0.85, 2, 4),
        textTransform: 'uppercase',
      }}
    >
      {image && page.layout !== 'text-focus' ? (
        <div
          style={{
            width: '100%',
            aspectRatio: page.layout === 'split' ? '16 / 10' : '16 / 9',
            maxHeight: loungeTvGlassCqw(24, 55, 100),
            overflow: 'hidden',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <img
            src={image}
            alt={page.altText ?? ''}
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      ) : null}
      {page.heading ? (
        <h2
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_DETAIL_TYPE.cardTitle,
            color: LOUNGE_TV_TEXT_WHITE,
            lineHeight: 1.2,
          }}
        >
          {page.heading}
        </h2>
      ) : null}
      {page.body ? (
        <p
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: LOUNGE_TV_DETAIL_TYPE.body,
            color: LOUNGE_TV_TEXT_GRAY,
            lineHeight: 1.45,
          }}
        >
          {page.body}
        </p>
      ) : null}
      {page.callout ? (
        <p
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_DETAIL_TYPE.meta,
            color: page.layout === 'warning' ? LOUNGE_TV_BRAND_RED : LOUNGE_TV_TEXT_WHITE,
            lineHeight: 1.4,
            paddingLeft: loungeTvGlassCqw(0.65, 1.5, 3),
            borderLeft: `2px solid ${LOUNGE_TV_BRAND_RED}`,
          }}
        >
          {page.callout}
        </p>
      ) : null}
    </article>
  );
}

export function SlayTipContentNav({
  pageIndex,
  pageCount,
  onPrev,
  onNext,
}: {
  pageIndex: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (pageCount <= 0) return null;

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: loungeTvGlassCqw(0.8, 2, 4),
        flexWrap: 'wrap',
        paddingTop: loungeTvGlassCqw(0.5, 1.2, 2.4),
      }}
      aria-label="Scrapbook navigation"
    >
      <button
        type="button"
        data-lounge-tv-focusable
        disabled={pageIndex <= 0}
        onClick={onPrev}
        style={navBtnStyle(pageIndex <= 0)}
      >
        PREVIOUS
      </button>
      <span
        style={{
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: LOUNGE_TV_DETAIL_TYPE.meta,
          color: LOUNGE_TV_TEXT_GRAY,
        }}
      >
        {pageIndex + 1} / {pageCount}
      </span>
      <button type="button" data-lounge-tv-focusable onClick={onNext} style={navBtnStyle(false)}>
        {pageIndex >= pageCount - 1 ? 'FINISH' : 'NEXT'}
      </button>
    </nav>
  );
}

type SlayTipRelatedContentProps = {
  episode: PSATodayEpisode;
  onViewClass: (episode: PSATodayEpisode) => void;
};

export function SlayTipRelatedContent({ episode, onViewClass }: SlayTipRelatedContentProps) {
  const metaLine = slayTipRelatedClassMetaLine(episode);
  const thumb = slayTipRelatedClassThumbnail(episode);
  const thumbWidth = loungeTvGlassCqw(10, 22, 42);

  return (
    <section aria-label="Go deeper">
      <p
        style={{
          margin: `0 0 ${loungeTvGlassCqw(0.75, 1.8, 3.6)}`,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_DETAIL_TYPE.sectionTitle,
          color: LOUNGE_TV_TEXT_WHITE,
          letterSpacing: '0.06em',
          lineHeight: 1.2,
        }}
      >
        GO DEEPER
      </p>
      <button
        type="button"
        data-lounge-tv-focusable
        onClick={() => onViewClass(episode)}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: loungeTvGlassCqw(1, 2.4, 4.8),
          width: '100%',
          padding: 0,
          margin: 0,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
          textTransform: 'uppercase',
        }}
      >
        {thumb ? (
          <span
            style={{
              flex: `0 0 ${thumbWidth}`,
              width: thumbWidth,
              aspectRatio: '16 / 10',
              overflow: 'hidden',
              display: 'block',
              borderBottom: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <img
              src={thumb}
              alt=""
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </span>
        ) : null}
        <span
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: loungeTvGlassCqw(0.35, 0.85, 1.7),
            paddingTop: loungeTvGlassCqw(0.15, 0.4, 0.8),
          }}
        >
          <span
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_DETAIL_TYPE.cardTitle,
              color: LOUNGE_TV_TEXT_WHITE,
              lineHeight: 1.2,
            }}
          >
            {episode.title}
          </span>
          {metaLine ? (
            <span
              style={{
                fontFamily: LOUNGE_TV_FONT_BOOK,
                fontSize: LOUNGE_TV_DETAIL_TYPE.meta,
                color: LOUNGE_TV_TEXT_GRAY,
                lineHeight: 1.35,
              }}
            >
              {metaLine}
            </span>
          ) : null}
          <span
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_DETAIL_TYPE.ctaSecondary,
              color: LOUNGE_TV_BRAND_RED,
              letterSpacing: '0.05em',
              marginTop: loungeTvGlassCqw(0.25, 0.6, 1.2),
            }}
          >
            {'VIEW CLASS >'}
          </span>
        </span>
      </button>
    </section>
  );
}

export function SlayTipDetailSectionRule({ children }: { children?: ReactNode }) {
  return (
    <>
      <LoungeTvSectionDivider
        marginTop={loungeTvGlassCqw(1.2, 3, 6)}
        marginBottom={loungeTvGlassCqw(1.2, 3, 6)}
      />
      {children}
    </>
  );
}

function navBtnStyle(disabled: boolean): CSSProperties {
  return {
    fontFamily: LOUNGE_TV_FONT_MEDIUM,
    fontSize: LOUNGE_TV_DETAIL_TYPE.ctaSecondary,
    letterSpacing: '0.06em',
    padding: `${loungeTvGlassCqw(0.65, 1.6, 3.2)} ${loungeTvGlassCqw(1.1, 2.6, 5.2)}`,
    background: disabled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.22)',
    color: LOUNGE_TV_TEXT_WHITE,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
  };
}

function unlockBtnStyle(disabled: boolean): CSSProperties {
  return {
    fontFamily: LOUNGE_TV_FONT_MEDIUM,
    fontSize: LOUNGE_TV_DETAIL_TYPE.ctaPrimary,
    letterSpacing: '0.06em',
    marginTop: loungeTvGlassCqw(0.35, 0.85, 1.7),
    padding: `${loungeTvGlassCqw(0.75, 1.8, 3.6)} ${loungeTvGlassCqw(1.2, 3, 6)}`,
    background: LOUNGE_TV_TEXT_WHITE,
    border: 'none',
    color: LOUNGE_TV_BRAND_RED,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
  };
}
