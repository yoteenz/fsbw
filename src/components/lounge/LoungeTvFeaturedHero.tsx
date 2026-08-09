import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LoungeContentPack } from './loungeTvContentPack';
import {
  LOUNGE_TV_HERO_ROTATION_MS,
  getFeaturedHeroSlots,
  resolvePosterUrl,
  resolvePreviewUrl,
  packToLoungeVideo,
} from './loungeTvStreamingMedia';
import { LoungeTvVideoPreview } from './LoungeTvVideoPreview';
import { AcrylicMediaPlayPauseControl } from './AcrylicMediaPlayPauseControl';
import { AcrylicMuteControl } from './AcrylicMuteControl';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import {
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_WHITE,
} from './loungeTvTheme';
import { isPackSaved, togglePackSaved } from '../../utils/loungeTvLibrary';

type LoungeTvFeaturedHeroProps = {
  onWatch: (pack: LoungeContentPack) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
};

function heroWatchButtonStyle(): React.CSSProperties {
  return {
    fontFamily: LOUNGE_TV_FONT_MEDIUM,
    fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: `${loungeTvGlassCqw(0.55, 1.3, 2.6)} ${loungeTvGlassCqw(1, 2.4, 4.8)}`,
    background: 'rgba(235, 28, 36, 0.82)',
    color: LOUNGE_TV_TEXT_WHITE,
    border: '1px solid rgba(235, 28, 36, 0.95)',
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

export function LoungeTvFeaturedHero({ onWatch, onToggleSave }: LoungeTvFeaturedHeroProps) {
  const slots = useMemo(() => getFeaturedHeroSlots(), []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotationPaused, setRotationPaused] = useState(false);
  const [previewPaused, setPreviewPaused] = useState(false);
  const [previewMuted, setPreviewMuted] = useState(true);
  const [fadeKey, setFadeKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeSlot = slots[activeIndex] ?? slots[0];
  const activeVideo = activeSlot ? packToLoungeVideo(activeSlot.pack) : null;

  const pauseRotation = useCallback(() => setRotationPaused(true), []);

  const togglePreviewPause = useCallback(() => {
    pauseRotation();
    setPreviewPaused((p) => !p);
  }, [pauseRotation]);

  const togglePreviewMute = useCallback(() => {
    pauseRotation();
    setPreviewMuted((m) => !m);
  }, [pauseRotation]);

  const goToIndex = useCallback(
    (idx: number) => {
      if (!slots.length) return;
      const next = ((idx % slots.length) + slots.length) % slots.length;
      setActiveIndex(next);
      setFadeKey((k) => k + 1);
      pauseRotation();
    },
    [pauseRotation, slots.length]
  );

  useEffect(() => {
    if (rotationPaused || slots.length <= 1) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    timerRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % slots.length);
      setFadeKey((k) => k + 1);
    }, LOUNGE_TV_HERO_ROTATION_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [rotationPaused, slots.length]);

  if (!activeSlot || !activeVideo) return null;

  const previewSrc = resolvePreviewUrl(activeVideo);
  const posterSrc = resolvePosterUrl(activeVideo);
  const saved = isPackSaved(activeSlot.pack.id);

  const eyebrow = heroEyebrowLabel(
    activeSlot.displayCategory ?? activeVideo.category,
    activeSlot.eyebrow
  );
  const title = activeSlot.displayTitle ?? activeVideo.title;
  const description = heroSummaryLine(
    activeSlot.displayDescription ?? activeVideo.description ?? activeVideo.subtitle
  );

  return (
    <section
      aria-label="Featured premiere"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        overflow: 'hidden',
        flexShrink: 0,
      }}
      onPointerDown={pauseRotation}
      onFocus={pauseRotation}
    >
      <div
        key={fadeKey}
        style={{
          position: 'absolute',
          inset: 0,
          animation: 'lounge-tv-hero-crossfade 0.75s ease forwards',
        }}
      >
        <LoungeTvVideoPreview
          src={previewSrc}
          poster={posterSrc}
          active={!previewPaused}
          loop
          muted={previewMuted}
          ariaLabel={`Featured preview: ${title}`}
          objectFit="cover"
        />
      </div>

      <button
        type="button"
        aria-label={previewPaused ? 'Resume featured preview' : 'Pause featured preview'}
        onClick={togglePreviewPause}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 6,
          margin: 0,
          padding: 0,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <AcrylicMediaPlayPauseControl
          paused={previewPaused}
          glyphMode="pause"
          alwaysVisible
          onToggle={togglePreviewPause}
          glyphSize={loungeTvGlassCqw(8.4, 19.5, 39)}
          hitSize={loungeTvGlassCqw(16.5, 36, 72)}
          style={{ pointerEvents: 'auto' }}
        />
      </div>

      <AcrylicMuteControl
        muted={previewMuted}
        glyphSize={loungeTvGlassCqw(2.4, 5.5, 11)}
        hitSize={loungeTvGlassCqw(3.2, 7.5, 15)}
        ariaLabel={previewMuted ? 'Unmute featured preview' : 'Mute featured preview'}
        className="lounge-tv-hero-mute"
        onClick={(e) => {
          e.stopPropagation();
          togglePreviewMute();
        }}
        style={{
          position: 'absolute',
          top: loungeTvGlassCqw(0.8, 2, 4),
          right: loungeTvGlassCqw(0.8, 2, 4),
          zIndex: 12,
        }}
        data-lounge-tv-focusable
      />

      {/* Soft vignette — legibility without a visible panel */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 4,
          background: `
            linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.18) 42%, transparent 68%),
            linear-gradient(to right, rgba(0,0,0,0.38) 0%, transparent 48%),
            radial-gradient(ellipse 90% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.12) 100%)
          `,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: loungeTvGlassCqw(1.2, 3, 6),
          bottom: loungeTvGlassCqw(2.8, 6.5, 13),
          maxWidth: 'min(52%, 20em)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: loungeTvGlassCqw(0.35, 0.75, 1.5),
          textTransform: 'uppercase',
          pointerEvents: 'none',
          zIndex: 10,
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
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </h2>

        {description ? (
          <p
            style={{
              margin: 0,
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: loungeTvGlassCqw(1.1, 2.5, 5),
              lineHeight: 1.3,
              color: 'rgba(255,255,255,0.58)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
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
            marginTop: loungeTvGlassCqw(0.35, 0.85, 1.7),
            pointerEvents: 'auto',
          }}
        >
          <button
            type="button"
            data-lounge-tv-focusable
            data-lounge-tv-action="watch"
            style={heroWatchButtonStyle()}
            onClick={() => {
              pauseRotation();
              onWatch(activeSlot.pack);
            }}
          >
            ▶ WATCH NOW
          </button>
          <button
            type="button"
            data-lounge-tv-focusable
            data-lounge-tv-action="save"
            style={heroListButtonStyle()}
            aria-pressed={saved}
            onClick={() => {
              pauseRotation();
              togglePackSaved(activeSlot.pack.id);
              onToggleSave?.(activeSlot.pack);
            }}
          >
            {saved ? '✓ MY LIST' : '+ MY LIST'}
          </button>
        </div>
      </div>

      {slots.length > 1 ? (
        <div
          role="tablist"
          aria-label="Featured carousel"
          style={{
            position: 'absolute',
            bottom: loungeTvGlassCqw(0.8, 2, 4),
            right: loungeTvGlassCqw(1.2, 3, 6),
            display: 'flex',
            alignItems: 'center',
            gap: loungeTvGlassCqw(0.5, 1.2, 2.4),
            pointerEvents: 'auto',
            zIndex: 11,
          }}
        >
          <span
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.06em',
              marginRight: loungeTvGlassCqw(0.3, 0.8, 1.6),
            }}
          >
            {String(activeIndex + 1).padStart(2, '0')} / {String(slots.length).padStart(2, '0')}
          </span>
          {slots.map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`Featured item ${idx + 1}`}
              data-lounge-tv-focusable
              onClick={() => goToIndex(idx)}
              style={{
                width: loungeTvGlassCqw(0.65, 1.5, 3),
                height: loungeTvGlassCqw(0.65, 1.5, 3),
                padding: 0,
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                background: idx === activeIndex ? LOUNGE_TV_TEXT_WHITE : 'rgba(255,255,255,0.28)',
                transition: 'background 0.25s ease, transform 0.2s ease',
              }}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
