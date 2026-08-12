import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ForecastBroadcastPhase, ForecastEdition } from '../../../../content/slay-forecast';
import {
  buildBroadcastTimeline,
  getVisibleBeats,
  resolveBroadcastPhase,
  resolvePlayerVisualState,
  type PackageTimelineInput,
} from '../../../../content/slay-forecast';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../../loungeTvFocusHandlers';
import {
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';
import { SlayForecastAcrylicControl } from './SlayForecastAcrylicControl';
import { SlayForecastBroadcastCueDebug } from './SlayForecastBroadcastCueDebug';
import { SlayForecastBroadcastOverlays } from './SlayForecastBroadcastOverlays';
import { SlayForecastBrandBug } from './SlayForecastBrandBug';

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

export type SlayForecastBroadcastPlayerHandle = {
  replay: () => void;
  start: () => void;
};

type SlayForecastBroadcastPlayerProps = {
  edition: ForecastEdition;
  autoplayOnMount?: boolean;
  focusIdPrefix?: string;
  packageTimeline?: PackageTimelineInput;
  onPhaseChange?: (phase: ForecastBroadcastPhase) => void;
  onPlayerVisualStateChange?: (state: ReturnType<typeof resolvePlayerVisualState>) => void;
  compact?: boolean;
};

export const SlayForecastBroadcastPlayer = forwardRef<
  SlayForecastBroadcastPlayerHandle,
  SlayForecastBroadcastPlayerProps
>(function SlayForecastBroadcastPlayer(
  {
    edition,
    autoplayOnMount = true,
    focusIdPrefix = 'slay-forecast-broadcast',
    packageTimeline,
    onPhaseChange,
    onPlayerVisualStateChange,
    compact = false,
  },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [currentTime, setCurrentTime] = useState(0);
  const [phase, setPhase] = useState<ForecastBroadcastPhase>('idle');
  const [hasStarted, setHasStarted] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [needsUserPlay, setNeedsUserPlay] = useState(false);
  const editionKeyRef = useRef(edition.id);

  const timeline = useMemo(
    () => buildBroadcastTimeline(edition, packageTimeline),
    [edition, packageTimeline],
  );

  const isDeveloping = edition.status === 'developing' || edition.status === 'upcoming';
  const hasVideo = Boolean(edition.broadcastVideo?.trim()) && !isDeveloping;

  const cues = useMemo(
    () => ({
      opening: timeline.openingEnd,
      hold: timeline.openingEnd,
      clear: timeline.clearStart,
      closing: timeline.closingStart,
      end: timeline.closingEnd,
    }),
    [timeline],
  );

  const visibleBeats = useMemo(
    () => getVisibleBeats(currentTime, phase, timeline),
    [currentTime, phase, timeline],
  );

  const visualState = resolvePlayerVisualState(hasStarted, phase);
  const showDeveloping = isDeveloping;
  const showPosterBlur = visualState === 'poster' || visualState === 'ended';
  const isPlaying = visualState.startsWith('playing_');
  const showVideo = hasVideo && (isPlaying || visualState === 'ended');
  const showAcrylicPlay = visualState === 'poster' && !isDeveloping;
  const showAcrylicReplay =
    (visualState === 'ended' || videoFailed || (prefersReducedMotion && hasStarted)) &&
    !isDeveloping;
  const showAcrylicControls = showAcrylicPlay || showAcrylicReplay;

  const resetPlayer = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    setCurrentTime(0);
    setPhase('idle');
    setHasStarted(false);
    setNeedsUserPlay(false);
    setVideoFailed(false);
  }, []);

  useEffect(() => {
    if (editionKeyRef.current !== edition.id) {
      editionKeyRef.current = edition.id;
      resetPlayer();
    }
  }, [edition.id, resetPlayer]);

  const updateFromTime = useCallback(
    (time: number) => {
      setCurrentTime(time);
      const next = resolveBroadcastPhase(time, timeline);
      setPhase((prev) => {
        if (prev !== next) onPhaseChange?.(next);
        return next;
      });
    },
    [onPhaseChange, timeline],
  );

  const startPlayback = useCallback(async () => {
    if (isDeveloping) return;

    if (prefersReducedMotion || !hasVideo || videoFailed) {
      setHasStarted(true);
      updateFromTime(timeline.closingEnd);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    video.loop = false;
    video.muted = false;
    video.playsInline = true;
    video.currentTime = 0;

    try {
      await video.play();
      setHasStarted(true);
      setNeedsUserPlay(false);
    } catch {
      setNeedsUserPlay(true);
    }
  }, [hasVideo, isDeveloping, prefersReducedMotion, timeline.closingEnd, updateFromTime, videoFailed]);

  const handleReplay = useCallback(() => {
    resetPlayer();
    void startPlayback();
  }, [resetPlayer, startPlayback]);

  useImperativeHandle(
    ref,
    () => ({
      replay: handleReplay,
      start: () => void startPlayback(),
    }),
    [handleReplay, startPlayback],
  );

  useEffect(() => {
    if (!autoplayOnMount || isDeveloping) return;
    void startPlayback();
  }, [autoplayOnMount, edition.id, isDeveloping, startPlayback]);

  useEffect(() => {
    onPlayerVisualStateChange?.(visualState);
  }, [onPlayerVisualStateChange, visualState]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;

    const onTimeUpdate = () => updateFromTime(video.currentTime);
    const onEnded = () => {
      video.pause();
      updateFromTime(timeline.closingEnd);
    };
    const onError = () => {
      setVideoFailed(true);
      setHasStarted(true);
      updateFromTime(timeline.closingEnd);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
      video.pause();
    };
  }, [hasVideo, timeline.closingEnd, updateFromTime]);

  const showPosterImage = !showVideo;

  return (
    <div
      className={[
        'lounge-tv-slay-forecast-broadcast',
        compact ? 'lounge-tv-slay-forecast-broadcast--compact' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-edition-id={edition.id}
      data-player-state={visualState}
      aria-label={`Slay Forecast broadcast for ${edition.displayPeriod}`}
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
        {showDeveloping ? (
          <div className="lounge-tv-slay-forecast-broadcast__developing">
            <div className="lounge-tv-slay-forecast-broadcast__canvas">
              <img
                src={edition.broadcastPoster}
                alt=""
                className="lounge-tv-slay-forecast-broadcast__poster"
                draggable={false}
              />
              <SlayForecastBrandBug />
            </div>
            <div className="lounge-tv-slay-forecast-broadcast__developing-copy">
              <p
                style={{
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: LOUNGE_TV_TYPE.l3,
                  color: LOUNGE_TV_TEXT_WHITE,
                  letterSpacing: '0.08em',
                  margin: 0,
                }}
              >
                {edition.status === 'upcoming' ? 'NEXT OUTLOOK' : 'FORECAST DEVELOPING'}
              </p>
              <p
                style={{
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: LOUNGE_TV_TYPE.l4,
                  color: LOUNGE_TV_TEXT_GRAY,
                  letterSpacing: '0.06em',
                  margin: '0.35em 0 0',
                }}
              >
                {edition.displayPeriod} · SIGNALS FORMING
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="lounge-tv-slay-forecast-broadcast__canvas">
              <img
                src={edition.broadcastPoster}
                alt=""
                className={`lounge-tv-slay-forecast-broadcast__poster ${
                  showPosterImage ? '' : 'lounge-tv-slay-forecast-broadcast__poster--hidden'
                }`.trim()}
                draggable={false}
              />
              {hasVideo ? (
                <video
                  ref={videoRef}
                  className={`lounge-tv-slay-forecast-broadcast__video ${
                    showVideo ? '' : 'lounge-tv-slay-forecast-broadcast__video--hidden'
                  }`.trim()}
                  src={edition.broadcastVideo}
                  poster={edition.broadcastPoster}
                  playsInline
                  preload="metadata"
                  disablePictureInPicture
                  disableRemotePlayback
                  tabIndex={-1}
                  aria-hidden
                />
              ) : null}
              <SlayForecastBrandBug visible={!showDeveloping} />
            </div>
            <SlayForecastBroadcastOverlays
              beats={visibleBeats}
              phase={phase}
              currentTime={currentTime}
              reducedMotion={prefersReducedMotion}
            />
          </>
        )}
        </div>

        {showAcrylicControls ? (
          <div className="lounge-tv-slay-forecast-broadcast__acrylic-layer">
            {showAcrylicPlay ? (
              <SlayForecastAcrylicControl
                mode="play"
                focusId={`${focusIdPrefix}-acrylic-play`}
                onPress={() => void startPlayback()}
                ariaLabel="Play Slay Forecast broadcast"
              />
            ) : null}

            {showAcrylicReplay ? (
              <SlayForecastAcrylicControl
                mode="replay"
                focusId={`${focusIdPrefix}-acrylic-replay`}
                onPress={handleReplay}
                ariaLabel="Replay Slay Forecast broadcast"
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {needsUserPlay && !isDeveloping && !showAcrylicPlay ? (
        <button
          type="button"
          className="lounge-tv-slay-forecast-broadcast__play-forecast-fallback"
          data-lounge-tv-focusable
          data-lounge-tv-focus-id={`${focusIdPrefix}-play-fallback`}
          onClick={() => void startPlayback()}
          onFocusCapture={loungeTvFocusGlowIn}
          onBlurCapture={loungeTvFocusGlowOut}
        >
          PLAY FORECAST
        </button>
      ) : null}

      <SlayForecastBroadcastCueDebug currentTime={currentTime} phase={phase} cues={cues} />
    </div>
  );
});
