import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LoungeContentPack } from './loungeTvContentPack';
import {
  LOUNGE_TV_HERO_ROTATION_MS,
  getFeaturedHeroSlots,
  resolvePosterUrl,
  resolvePreviewUrl,
  packToLoungeVideo,
  type LoungeFeaturedHeroSlot,
} from './loungeTvStreamingMedia';
import { LoungeTvVideoPreview } from './LoungeTvVideoPreview';
import { AcrylicMediaPlayPauseControl } from './AcrylicMediaPlayPauseControl';
import { AcrylicMuteControl } from './AcrylicMuteControl';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { loungeTvDisplayTitle } from './loungeTvDisplayText';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_WHITE,
} from './loungeTvTheme';
import { isPackSaved, LOUNGE_TV_LIBRARY_UPDATED_EVENT } from '../../utils/loungeTvLibrary';

type LoungeTvFeaturedHeroProps = {
  onWatch: (pack: LoungeContentPack) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
};

type FeaturedHeroSlot = LoungeFeaturedHeroSlot & { pack: LoungeContentPack };

function heroWatchButtonStyle(): React.CSSProperties {
  return {
    fontFamily: LOUNGE_TV_FONT_MEDIUM,
    fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: `${loungeTvGlassCqw(0.55, 1.3, 2.6)} ${loungeTvGlassCqw(1, 2.4, 4.8)}`,
    background: LOUNGE_TV_TEXT_WHITE,
    color: LOUNGE_TV_BRAND_RED,
    border: `1px solid ${LOUNGE_TV_BRAND_RED}`,
    cursor: 'pointer',
    lineHeight: 1.2,
    transition: 'background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
  };
}

function heroListButtonStyle(): React.CSSProperties {
  return {
    fontFamily: LOUNGE_TV_FONT_MEDIUM,
    fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    padding: `${loungeTvGlassCqw(0.5, 1.2, 2.4)} ${loungeTvGlassCqw(0.85, 2, 4)}`,
    background: 'transparent',
    color: 'rgba(255,255,255,0.72)',
    border: '1px solid rgba(255,255,255,0.22)',
    cursor: 'pointer',
    lineHeight: 1.2,
    transition: 'border-color 0.2s ease, color 0.2s ease',
  };
}

/** Compact one-line hero copy — full descriptions stay in episode detail. */
function heroSummaryLine(text: string | undefined, maxLen = 64): string | undefined {
  if (!text?.trim()) return undefined;
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  const cut = trimmed.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 24 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

/** Eyebrow: CATEGORY · FEATURED PREMIERE (category from slot config). */
function heroEyebrowLabel(category: string, eyebrow?: string): string {
  const cat = category.trim().toUpperCase();
  if (!cat) return eyebrow ?? 'FEATURED PREMIERE';
  return `${cat} · FEATURED PREMIERE`;
}

const FeaturedHeroPreview = memo(function FeaturedHeroPreview({
  slot,
  fadeKey,
  paused,
  muted,
  title,
}: {
  slot: FeaturedHeroSlot;
  fadeKey: number;
  paused: boolean;
  muted: boolean;
  title: string;
}) {
  const video = useMemo(() => packToLoungeVideo(slot.pack), [slot.pack]);
  const previewSrc = resolvePreviewUrl(video);
  const posterSrc = resolvePosterUrl(video);

  return (
    <div
      key={fadeKey}
      className="lounge-tv-hero-preview-layer"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
      }}
    >
      <LoungeTvVideoPreview
        src={previewSrc}
        poster={posterSrc}
        active={!paused}
        loop
        muted={muted}
        ariaLabel={`Featured preview: ${title}`}
        objectFit="cover"
        className="lounge-tv-hero-preview-fade-in"
      />
    </div>
  );
});

function HeroSaveButton({
  pack,
  onToggleSave,
}: {
  pack: LoungeContentPack;
  onToggleSave?: (pack: LoungeContentPack) => void;
}) {
  const [, setRevision] = useState(0);

  useEffect(() => {
    const onLibraryUpdated = () => setRevision((n) => n + 1);
    window.addEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
    return () => window.removeEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
  }, []);

  const saved = isPackSaved(pack.id);

  return (
    <button
      type="button"
      data-lounge-tv-focusable
      data-lounge-tv-action="save"
      style={heroListButtonStyle()}
      aria-pressed={saved}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onToggleSave?.(pack);
      }}
    >
      {saved ? '✓ MY LIST' : '+ MY LIST'}
    </button>
  );
}

export function LoungeTvFeaturedHero({
  onWatch,
  onToggleSave,
}: LoungeTvFeaturedHeroProps) {
  const slots = useMemo(() => getFeaturedHeroSlots(), []);
  const [activeIndex, setActiveIndex] = useState(0);
  /** Autoplay muted on tab enter — user can unmute or pause via hero controls / tap. */
  const [previewPaused, setPreviewPaused] = useState(false);
  const [previewMuted, setPreviewMuted] = useState(true);
  const [fadeKey, setFadeKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragRef = useRef<{ x: number; y: number; swiped: boolean } | null>(null);

  const activeSlot = slots[activeIndex] ?? slots[0];
  const activeVideo = activeSlot ? packToLoungeVideo(activeSlot.pack) : null;

  const togglePreviewPause = useCallback(() => {
    setPreviewPaused((p) => !p);
  }, []);

  const togglePreviewMute = useCallback(() => {
    setPreviewMuted((m) => !m);
  }, []);

  const goToIndex = useCallback(
    (idx: number) => {
      if (!slots.length) return;
      const next = ((idx % slots.length) + slots.length) % slots.length;
      setPreviewPaused(false);
      setPreviewMuted(true);
      setActiveIndex(next);
      setFadeKey((k) => k + 1);
    },
    [slots.length]
  );

  const goNext = useCallback(() => goToIndex(activeIndex + 1), [activeIndex, goToIndex]);
  const goPrev = useCallback(() => goToIndex(activeIndex - 1), [activeIndex, goToIndex]);

  useEffect(() => {
    if (previewPaused || slots.length <= 1) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    timerRef.current = setInterval(() => {
      setPreviewPaused(false);
      setPreviewMuted(true);
      setActiveIndex((i) => (i + 1) % slots.length);
      setFadeKey((k) => k + 1);
    }, LOUNGE_TV_HERO_ROTATION_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [previewPaused, slots.length]);

  const heroPointerDownTargetRef = useRef<Element | null>(null);

  const handleHeroPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    heroPointerDownTargetRef.current = e.target as Element;
    dragRef.current = { x: e.clientX, y: e.clientY, swiped: false };
    if ((e.target as Element).closest?.('.lounge-tv-hero-controls-root, .lounge-tv-hero-carousel-dots')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const handleHeroPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current || dragRef.current.swiped || slots.length <= 1) return;
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.15) {
        dragRef.current.swiped = true;
        if (dx < 0) goNext();
        else goPrev();
      }
    },
    [goNext, goPrev, slots.length]
  );

  const handleHeroPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      const wasTap = !dragRef.current.swiped && Math.abs(dx) < 12 && Math.abs(dy) < 12;
      dragRef.current = null;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      if (wasTap && !(e.target as Element).closest?.('.lounge-tv-hero-controls-root, .lounge-tv-hero-carousel-dots')) {
        if (heroPointerDownTargetRef.current?.closest?.('.lounge-tv-hero-controls-root, .lounge-tv-hero-carousel-dots')) {
          heroPointerDownTargetRef.current = null;
          return;
        }
        togglePreviewPause();
      }
      heroPointerDownTargetRef.current = null;
    },
    [togglePreviewPause]
  );

  const handleHeroPointerCancel = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  if (!activeSlot || !activeVideo) return null;

  const eyebrow = heroEyebrowLabel(
    activeSlot.displayCategory ?? activeVideo.category,
    activeSlot.eyebrow
  );
  const title = activeSlot.displayTitle ?? activeVideo.title;
  const description = heroSummaryLine(
    activeSlot.displayDescription ?? activeVideo.description ?? activeVideo.subtitle
  );

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: loungeTvGlassCqw(0.85, 2, 4),
      }}
    >
      <section
        aria-label="Featured premiere"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            minHeight: loungeTvGlassCqw(52, 115, 200),
            maxHeight: '48cqh',
            overflow: 'hidden',
            touchAction: 'pan-y',
          }}
        >
          <FeaturedHeroPreview
            slot={activeSlot}
            fadeKey={fadeKey}
            paused={previewPaused}
            muted={previewMuted}
            title={title}
          />

          <div
            role="presentation"
            aria-hidden
            onPointerDown={handleHeroPointerDown}
            onPointerMove={handleHeroPointerMove}
            onPointerUp={handleHeroPointerUp}
            onPointerCancel={handleHeroPointerCancel}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 5,
              margin: 0,
              padding: 0,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              touchAction: 'pan-y',
            }}
          />

          <div
            className="lounge-tv-hero-controls-root"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 20,
              pointerEvents: 'none',
              isolation: 'isolate',
            }}
          >
            <div
              className="lounge-tv-hero-play-pause-shell"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <AcrylicMediaPlayPauseControl
                className="lounge-tv-hero-media-control"
                paused={previewPaused}
                persistWhenPaused
                suppressSettling
                onToggle={togglePreviewPause}
                glyphSize="14px"
                hitSize="26px"
                style={{ pointerEvents: 'auto' }}
              />
            </div>

            <div
              className={
                previewMuted || previewPaused
                  ? 'lounge-tv-hero-mute-shell'
                  : 'lounge-tv-hero-mute-shell lounge-tv-hero-mute-shell--hidden'
              }
              aria-hidden={!(previewMuted || previewPaused)}
              style={{
                position: 'absolute',
                top: '7px',
                right: '7px',
                zIndex: 2,
                pointerEvents: previewMuted || previewPaused ? 'auto' : 'none',
              }}
            >
              <AcrylicMuteControl
                muted={previewMuted}
                glyphSize="12px"
                hitSize="18px"
                ariaLabel={previewMuted ? 'Unmute featured preview' : 'Mute featured preview'}
                className="lounge-tv-hero-mute"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePreviewMute();
                }}
                style={{ pointerEvents: 'auto' }}
                data-lounge-tv-focusable
                tabIndex={previewMuted || previewPaused ? 0 : -1}
              />
            </div>
          </div>

          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 4,
              background: `
                linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.12) 38%, transparent 62%),
                linear-gradient(to right, rgba(0,0,0,0.28) 0%, transparent 48%)
              `,
              pointerEvents: 'none',
            }}
          />
        </div>

        <div
          aria-live="polite"
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: loungeTvGlassCqw(0.85, 2, 4),
            textTransform: 'uppercase',
            padding: `${loungeTvGlassCqw(0.55, 1.35, 2.7)} ${loungeTvGlassCqw(1.2, 3, 6)} 0`,
            boxSizing: 'border-box',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: loungeTvGlassCqw(0.35, 0.75, 1.5),
            }}
          >
          <span
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
              letterSpacing: '0.11em',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            {eyebrow.replace(' · FEATURED PREMIERE', '')}
            <span style={{ color: 'rgba(255,255,255,0.35)' }}> · </span>
            <span style={{ color: 'rgba(235, 28, 36, 0.78)' }}>FEATURED PREMIERE</span>
          </span>

          <h2
            style={{
              margin: 0,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.85, 4.2, 8.5),
              lineHeight: 1.12,
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.02em',
            }}
          >
            {loungeTvDisplayTitle(title)}
          </h2>

          {description ? (
            <p
              style={{
                margin: 0,
                fontFamily: LOUNGE_TV_FONT_BOOK,
                fontSize: loungeTvGlassCqw(1.1, 2.5, 5),
                lineHeight: 1.35,
                color: 'rgba(255,255,255,0.58)',
              }}
            >
              {description}
            </p>
          ) : null}

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: loungeTvGlassCqw(0.45, 1.1, 2.2),
              marginTop: loungeTvGlassCqw(0.25, 0.6, 1.2),
            }}
          >
            <button
              type="button"
              data-lounge-tv-focusable
              data-lounge-tv-action="watch"
              style={heroWatchButtonStyle()}
              onClick={() => onWatch(activeSlot.pack)}
            >
              WATCH NOW
            </button>
            <HeroSaveButton pack={activeSlot.pack} onToggleSave={onToggleSave} />
          </div>
          </div>

          {slots.length > 1 ? (
            <div
              role="tablist"
              aria-label="Featured carousel"
              className="lounge-tv-hero-carousel-dots"
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: loungeTvGlassCqw(0.55, 1.3, 2.6),
                marginTop: loungeTvGlassCqw(0.15, 0.35, 0.75),
                pointerEvents: 'auto',
              }}
            >
              {slots.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeIndex}
                  aria-label={`Featured item ${idx + 1} of ${slots.length}`}
                  data-lounge-tv-focusable
                  onClick={() => goToIndex(idx)}
                  style={{
                    width: loungeTvGlassCqw(1.35, 3.2, 6.5),
                    height: loungeTvGlassCqw(1.35, 3.2, 6.5),
                    minWidth: '6px',
                    minHeight: '6px',
                    padding: 0,
                    border:
                      idx === activeIndex
                        ? `0.5px solid ${LOUNGE_TV_BRAND_RED}`
                        : '1px solid rgba(255,255,255,0.28)',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    background: idx === activeIndex ? LOUNGE_TV_TEXT_WHITE : 'rgba(255,255,255,0.28)',
                    transform: idx === activeIndex ? 'scale(1.12)' : 'scale(1)',
                    transition: 'background 0.25s ease, transform 0.2s ease, border-color 0.2s ease',
                    boxShadow: 'none',
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
