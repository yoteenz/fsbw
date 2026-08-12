import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ForecastBroadcastPhase, ForecastEdition } from '../../../../content/slay-forecast/editionTypes';
import type { SlayForecastBroadcastPackage } from '../../../../content/slay-forecast/broadcastContinuityRegistry';
import {
  buildBroadcastTimeline,
  getVisibleBeats,
  resolveBroadcastPhase,
  resolvePlayerVisualState,
} from '../../../../content/slay-forecast';
import { SLAY_FORECAST_STUDIO_POSTER } from '../../../../constants/slayForecastBroadcast';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../../loungeTvFocusHandlers';
import { SlayForecastAcrylicControl } from './SlayForecastAcrylicControl';
import { SlayForecastBroadcastOverlays } from './SlayForecastBroadcastOverlays';
import { SlayForecastBrandBug } from './SlayForecastBrandBug';
import {
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_WHITE,
} from '../../loungeTvTheme';

type SequencePhase = 'idle' | 'opening' | 'resting' | 'closing' | 'complete';

export type SlayForecastSequencePlayerHandle = {
  replay: () => void;
  start: () => void;
};

type SlayForecastSequencePlayerProps = {
  edition: ForecastEdition;
  broadcastPackage: SlayForecastBroadcastPackage;
  autoplayOnMount?: boolean;
  focusIdPrefix?: string;
  compact?: boolean;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function mapSequenceToPhase(
  sequencePhase: SequencePhase,
  elapsedSec: number,
  timeline: ReturnType<typeof buildBroadcastTimeline>,
): ForecastBroadcastPhase {
  if (sequencePhase === 'idle') return 'idle';
  if (sequencePhase === 'complete') return 'end';
  if (sequencePhase === 'closing') return 'closing';
  if (sequencePhase === 'opening') return 'opening';
  return resolveBroadcastPhase(elapsedSec, timeline);
}

export const SlayForecastSequencePlayer = forwardRef<
  SlayForecastSequencePlayerHandle,
  SlayForecastSequencePlayerProps
>(function SlayForecastSequencePlayer(
  {
    edition,
    broadcastPackage,
    autoplayOnMount = true,
    focusIdPrefix = 'slay-forecast-sequence',
    compact = false,
  },
  ref,
) {
  const openingRef = useRef<HTMLVideoElement>(null);
  const restingRef = useRef<HTMLVideoElement>(null);
  const closingRef = useRef<HTMLVideoElement>(null);
  const broadcastStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const prefersReducedMotion = usePrefersReducedMotion();
  const [sequencePhase, setSequencePhase] = useState<SequencePhase>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [needsUserPlay, setNeedsUserPlay] = useState(false);

  const packageTimeline = broadcastPackage.broadcastTimeline;
  const crossfadeMs = packageTimeline.seamCrossfadeMs ?? 90;

  const timeline = useMemo(
    () =>
      buildBroadcastTimeline(edition, {
        openingEnd: packageTimeline.openingEnd,
        closingStart: packageTimeline.closingStart,
        signals: packageTimeline.signals,
      }),
    [edition, packageTimeline],
  );

  const broadcastPhase = mapSequenceToPhase(sequencePhase, elapsedSec, timeline);
  const visualState = resolvePlayerVisualState(hasStarted, broadcastPhase);
  const visibleBeats = useMemo(
    () => getVisibleBeats(elapsedSec, broadcastPhase, timeline),
    [broadcastPhase, elapsedSec, timeline],
  );

  const showPosterBlur = visualState === 'poster' || visualState === 'ended';
  const isPlaying = visualState.startsWith('playing_');
  const showAcrylicPlay = visualState === 'poster';
  const showAcrylicReplay =
    (visualState === 'ended' || (prefersReducedMotion && hasStarted));
  const showAcrylicControls = showAcrylicPlay || showAcrylicReplay;

  const stopTicker = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    if (broadcastStartRef.current == null) return;
    const elapsed = (performance.now() - broadcastStartRef.current) / 1000;
    setElapsedSec(elapsed);
    if (elapsed >= timeline.closingStart && sequencePhase === 'resting') {
      setSequencePhase('closing');
      void closingRef.current?.play().catch(() => undefined);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [sequencePhase, timeline.closingStart]);

  const startTicker = useCallback(() => {
    stopTicker();
    broadcastStartRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [stopTicker, tick]);

  const resetAll = useCallback(() => {
    stopTicker();
    broadcastStartRef.current = null;
    setElapsedSec(0);
    setSequencePhase('idle');
    setHasStarted(false);
    setNeedsUserPlay(false);
    for (const videoRef of [openingRef, restingRef, closingRef]) {
      const v = videoRef.current;
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
    }
  }, [stopTicker]);

  const playSequence = useCallback(async () => {
    resetAll();
    setHasStarted(true);
    if (prefersReducedMotion) {
      setSequencePhase('complete');
      setElapsedSec(timeline.closingEnd);
      return;
    }
    setSequencePhase('opening');
    startTicker();
    try {
      await openingRef.current?.play();
    } catch {
      setNeedsUserPlay(true);
    }
  }, [prefersReducedMotion, resetAll, startTicker, timeline.closingEnd]);

  useImperativeHandle(
    ref,
    () => ({
      replay: () => void playSequence(),
      start: () => void playSequence(),
    }),
    [playSequence],
  );

  useEffect(() => {
    if (autoplayOnMount) void playSequence();
    return () => stopTicker();
  }, [autoplayOnMount, edition.id, broadcastPackage.id, playSequence, stopTicker]);

  const onOpeningEnded = () => {
    setSequencePhase('resting');
    const resting = restingRef.current;
    if (resting) {
      resting.loop = true;
      void resting.play().catch(() => undefined);
    }
  };

  const onClosingEnded = () => {
    stopTicker();
    setSequencePhase('complete');
    setElapsedSec(timeline.closingEnd);
    closingRef.current?.pause();
  };

  const poster = edition.broadcastPoster || SLAY_FORECAST_STUDIO_POSTER;
  const showPosterFallback = visualState === 'poster';

  return (
    <div
      className={[
        'lounge-tv-slay-forecast-broadcast lounge-tv-slay-forecast-sequence',
        compact ? 'lounge-tv-slay-forecast-broadcast--compact' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-player-state={visualState}
    >
      <div className="lounge-tv-slay-forecast-broadcast__frame">
        <div
          className={[
            'lounge-tv-slay-forecast-broadcast__stage',
            showPosterBlur ? 'lounge-tv-slay-forecast-broadcast__stage--poster-blur' : '',
            isPlaying ? 'lounge-tv-slay-forecast-broadcast__stage--playing' : '',
            visualState === 'ended' ? 'lounge-tv-slay-forecast-broadcast__stage--ended' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
        <div className="lounge-tv-slay-forecast-broadcast__canvas">
          {showPosterFallback ? (
            <img src={poster} alt="" className="lounge-tv-slay-forecast-broadcast__poster" draggable={false} />
          ) : null}

          <video
            ref={openingRef}
            className={`lounge-tv-slay-forecast-sequence__segment ${
              sequencePhase === 'opening' ? 'lounge-tv-slay-forecast-sequence__segment--active' : ''
            }`}
            src={broadcastPackage.openingAsset ?? undefined}
            poster={poster}
            playsInline
            muted={false}
            preload="metadata"
            onEnded={onOpeningEnded}
            style={{
              opacity: sequencePhase === 'opening' ? 1 : 0,
              transition: `opacity ${crossfadeMs}ms linear`,
            }}
          />
          <video
            ref={restingRef}
            className={`lounge-tv-slay-forecast-sequence__segment ${
              sequencePhase === 'resting' ? 'lounge-tv-slay-forecast-sequence__segment--active' : ''
            }`}
            src={broadcastPackage.restingAsset ?? undefined}
            poster={poster}
            playsInline
            muted
            loop
            preload="metadata"
            style={{
              opacity: sequencePhase === 'resting' ? 1 : 0,
              transition: `opacity ${crossfadeMs}ms linear`,
            }}
          />
          <video
            ref={closingRef}
            className={`lounge-tv-slay-forecast-sequence__segment ${
              sequencePhase === 'closing' || sequencePhase === 'complete'
                ? 'lounge-tv-slay-forecast-sequence__segment--active'
                : ''
            }`}
            src={broadcastPackage.closingAsset ?? undefined}
            poster={poster}
            playsInline
            muted={false}
            preload="metadata"
            onEnded={onClosingEnded}
            style={{
              opacity: sequencePhase === 'closing' || sequencePhase === 'complete' ? 1 : 0,
              transition: `opacity ${crossfadeMs}ms linear`,
            }}
          />

          <SlayForecastBrandBug />
        </div>

        <SlayForecastBroadcastOverlays
          beats={visibleBeats}
          phase={broadcastPhase}
          currentTime={elapsedSec}
          reducedMotion={prefersReducedMotion}
        />
        </div>

        {showAcrylicControls ? (
          <div className="lounge-tv-slay-forecast-broadcast__acrylic-layer">
            {showAcrylicPlay ? (
              <SlayForecastAcrylicControl
                mode="play"
                focusId={`${focusIdPrefix}-acrylic-play`}
                onPress={() => void playSequence()}
                ariaLabel="Play Slay Forecast broadcast"
              />
            ) : null}

            {showAcrylicReplay ? (
              <SlayForecastAcrylicControl
                mode="replay"
                focusId={`${focusIdPrefix}-acrylic-replay`}
                onPress={() => void playSequence()}
                ariaLabel="Replay Slay Forecast broadcast"
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {needsUserPlay && !showAcrylicPlay ? (
        <button
          type="button"
          className="lounge-tv-slay-forecast-broadcast__play-forecast-fallback"
          data-lounge-tv-focusable
          data-lounge-tv-focus-id={`${focusIdPrefix}-play-fallback`}
          onClick={() => void playSequence()}
          onFocusCapture={loungeTvFocusGlowIn}
          onBlurCapture={loungeTvFocusGlowOut}
        >
          PLAY FORECAST
        </button>
      ) : null}

      {process.env.NODE_ENV === 'development' ? (
        <p
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: '10px',
            color: LOUNGE_TV_TEXT_WHITE,
            opacity: 0.4,
            marginTop: '0.25rem',
          }}
        >
          SEQ · {visualState.toUpperCase()} · {elapsedSec.toFixed(1)}s
        </p>
      ) : null}
    </div>
  );
});
