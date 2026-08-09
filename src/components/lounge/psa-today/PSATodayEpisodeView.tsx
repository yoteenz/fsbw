import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LoungeContentUnlock } from '../../../utils/slayTicketHistoryDisplay';
import { usePsaEpisodeEntitlement } from '../../../hooks/usePsaEpisodeEntitlement';
import { usePsaWatchSession } from '../../../hooks/usePsaWatchSession';
import type { PSATodayEpisode, PSATodayPlayerPhase, PSAEpisodeChapter } from './types';
import { LoungeTvBackButton } from '../LoungeTvUiPrimitives';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_FONT_BOOK, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_GRAY, LOUNGE_TV_TEXT_WHITE } from '../loungeTvTheme';
import { LoungeTvVideoPreview } from '../LoungeTvVideoPreview';
import { LoungeTvWatchLearnPlayer } from '../LoungeTvWatchLearnPlayer';
import { contentPackToTile } from '../loungeTvContent';
import { getContentPackById } from '../loungeTvContentPack';
import { PSAAccessPrompt } from './PSAAccessPrompt';
import { PSAAccessBlocked } from './PSAAccessBlocked';
import { PSAClassKit } from './PSAClassKit';
import { PSAReadyToStart } from './PSAReadyToStart';
import { PSAChapterNav } from './PSAChapterNav';
import { PSAEntitlementStatusStrip } from './PSAEntitlementStatusStrip';
import { PSATodayDebugInspector } from './PSATodayDebugInspector';
import {
  psaChapterIsAccessible,
  psaEpisodeContentIdForUnlock,
  psaEpisodeNeedsRedemption,
  psaEpisodePaidLessonAllowed,
  psaEpisodeUnlockCost,
} from './psaTodayAccess';
import { redeemPsaEpisode } from './psaTodayEntitlementApi';
import { deriveEntitlementStatus } from './psaTodayEntitlementLogic';
import {
  resumePositionSec,
  setPsaEpisodeChapter,
  updatePsaEpisodeProgress,
  getPsaEpisodeProgress,
  computePsaChapterProgress,
} from './psaTodayProgress';
import { trackPsaTodayEvent } from './psaTodayAnalytics';
import { defaultDurationSec } from '../loungeTvStreamingMeta';
import { qualificationThresholdSeconds, resolvePsaWatchPolicy } from './psaWatchPolicy';
import { getSlayTipsForPsaEpisode } from '../../../content/education';
import { PSARelatedSlayTips } from '../slay-tips/PSARelatedSlayTips';
import type { SlayTip } from '../../../content/education/types';
import { useEducationUnitContext } from '../../../hooks/useEducationUnitContext';
import { resolveChapterMedia } from '../../../content/education/signature-units';
import { writeContinuityUnitPreference } from '../../../content/education/signature-units';
import { PSAUnitContextStrip } from './PSAUnitContextStrip';

type PSATodayEpisodeViewProps = {
  episode: PSATodayEpisode;
  onBack: () => void;
  unlocks?: LoungeContentUnlock[];
  isUnlocked: (contentId: string) => boolean;
  onTicketsRefresh?: () => void;
  onOpenSlayTip?: (tip: SlayTip) => void;
};

export function PSATodayEpisodeView({
  episode,
  onBack,
  unlocks,
  isUnlocked: _isUnlocked,
  onTicketsRefresh,
  onOpenSlayTip,
}: PSATodayEpisodeViewProps) {
  const {
    entitlement,
    setEntitlement,
    loading: entitlementLoading,
    refresh: refreshEntitlement,
    canStartNewWatch,
    expired,
    watchesExhausted,
  } = usePsaEpisodeEntitlement(episode);

  const ticketCost = psaEpisodeUnlockCost(episode, unlocks);
  const watchPolicy = resolvePsaWatchPolicy(episode);
  const chapters = episode.chapters ?? [];
  const storedProgress = useMemo(() => getPsaEpisodeProgress(episode), [episode.id]);
  const initialChapterId = storedProgress.currentChapterId ?? chapters[0]?.id;
  const [phase, setPhase] = useState<PSATodayPlayerPhase>('camera-a-preview');
  const [activeChapterId, setActiveChapterId] = useState<string | undefined>(initialChapterId);
  const [redeemBusy, setRedeemBusy] = useState(false);
  const previewStartedRef = useRef(false);
  const paidSessionGraceRef = useRef(false);
  const rewatchReminderShownRef = useRef(false);
  const chapterStartedRef = useRef<string | undefined>(undefined);

  const { context: unitContext, selectFollowUnit, setGeneralMode } = useEducationUnitContext(
    episode,
    { ownedUnitIds: [] }
  );

  const activeChapter = useMemo(
    () => chapters.find((c) => c.id === activeChapterId),
    [chapters, activeChapterId]
  );

  const chapterProgress = useMemo(
    () => computePsaChapterProgress(episode, activeChapterId),
    [episode, activeChapterId]
  );

  const activeChapterMedia = useMemo(() => {
    if (!activeChapter) return null;
    return resolveChapterMedia({
      chapter: activeChapter,
      demonstrationUnitId: unitContext.demonstrationUnitId,
      learnerUnitId: unitContext.learnerUnitId,
      episodePosterUrl: episode.heroPosterUrl ?? episode.cameraB?.posterUrl,
    });
  }, [activeChapter, unitContext, episode]);

  const relatedSlayTips = useMemo(() => getSlayTipsForPsaEpisode(episode.id), [episode.id]);
  const showRelatedTips =
    Boolean(onOpenSlayTip) &&
    relatedSlayTips.length > 0 &&
    (phase === 'class-kit' || phase === 'ready-check' || phase === 'access-gate');

  const linkedPack = episode.linkedContentPackId
    ? getContentPackById(episode.linkedContentPackId)
    : undefined;
  const cameraBTile = linkedPack ? contentPackToTile(linkedPack) : null;

  const lessonDurationSeconds = useMemo(() => {
    if (episode.runtimeSeconds && episode.runtimeSeconds > 0) return episode.runtimeSeconds;
    if (linkedPack) return defaultDurationSec(linkedPack) ?? 0;
    return 0;
  }, [episode.runtimeSeconds, linkedPack]);

  const thresholdSec = qualificationThresholdSeconds(lessonDurationSeconds, watchPolicy.qualificationPercent);

  const paidLessonAllowed = psaEpisodePaidLessonAllowed(episode, entitlement, {
    graceSessionOpen: paidSessionGraceRef.current,
  });

  const needsRedemption = psaEpisodeNeedsRedemption(episode, entitlement);

  const watchSessionEnabled = phase === 'camera-b-lesson' && paidLessonAllowed && Boolean(entitlement);

  const { session, toast, handleSample } = usePsaWatchSession({
    episode,
    entitlement,
    enabled: watchSessionEnabled,
    lessonDurationSeconds,
    onEntitlementUpdate: (ent) => {
      setEntitlement(ent);
      if (deriveEntitlementStatus(ent) === 'expired') {
        trackPsaTodayEvent('psa_access_expired', { episodeId: episode.id, entitlementId: ent.id });
      }
    },
  });

  useEffect(() => {
    if (phase === 'camera-b-lesson' && session) {
      paidSessionGraceRef.current = true;
    }
  }, [phase, session]);

  const requiredToolCount = useMemo(
    () => episode.classKit?.tools.filter((t) => t.required).length ?? 0,
    [episode.classKit]
  );

  useEffect(() => {
    if (!previewStartedRef.current) {
      previewStartedRef.current = true;
      trackPsaTodayEvent('psa_preview_started', { episodeId: episode.id });
    }
  }, [episode.id]);

  const advanceFromPreview = useCallback(() => {
    trackPsaTodayEvent('psa_preview_completed', { episodeId: episode.id });
    setPhase('camera-a-transition');
    window.setTimeout(() => {
      setPhase('class-kit');
    }, 900);
  }, [episode.id]);

  const handleRedeem = useCallback(async () => {
    if (redeemBusy) return;
    const contentId = psaEpisodeContentIdForUnlock(episode);
    const isReredemption = Boolean(entitlement && (expired || watchesExhausted));
    if (isReredemption) {
      trackPsaTodayEvent('psa_episode_reredemption_started', {
        episodeId: episode.id,
        entitlementId: entitlement?.id,
      });
    }
    setRedeemBusy(true);
    try {
      const result = await redeemPsaEpisode({
        episodeId: episode.id,
        contentId,
        ticketCost,
        contentTitle: episode.title,
        includedWatches: watchPolicy.includedWatches,
        accessDurationYears: watchPolicy.accessDurationYears,
      });
      if ('error' in result) return;
      setEntitlement(result.entitlement);
      onTicketsRefresh?.();
      window.dispatchEvent(new Event('slayTicketsUpdated'));
      trackPsaTodayEvent(
        isReredemption ? 'psa_episode_reredemed' : 'psa_slay_ticket_redeemed',
        { episodeId: episode.id, entitlementId: result.entitlement.id }
      );
      if (!isReredemption && !result.alreadyActive) {
        trackPsaTodayEvent('psa_entitlement_created', {
          episodeId: episode.id,
          entitlementId: result.entitlement.id,
          watchesRemaining: result.entitlement.watchesRemaining,
        });
      }
      rewatchReminderShownRef.current = false;
      if (episode.requiresPreparationCheck) {
        setPhase('ready-check');
      } else {
        setPhase('camera-b-lesson');
        trackPsaTodayEvent('psa_camera_b_started', { episodeId: episode.id });
      }
    } finally {
      setRedeemBusy(false);
    }
  }, [
    redeemBusy,
    episode,
    entitlement,
    expired,
    watchesExhausted,
    ticketCost,
    watchPolicy,
    onTicketsRefresh,
    setEntitlement,
  ]);

  const proceedToPaidLesson = useCallback(() => {
    if (needsRedemption) {
      trackPsaTodayEvent('psa_slay_ticket_prompt_viewed', { episodeId: episode.id });
      setPhase('access-gate');
      return;
    }
    if (episode.requiresPreparationCheck) {
      setPhase('ready-check');
      return;
    }
    setPhase('camera-b-lesson');
    trackPsaTodayEvent('psa_camera_b_started', { episodeId: episode.id });
  }, [needsRedemption, episode.id, episode.requiresPreparationCheck]);

  const startLessonFromReady = useCallback(() => {
    if (needsRedemption) {
      trackPsaTodayEvent('psa_slay_ticket_prompt_viewed', { episodeId: episode.id });
      setPhase('access-gate');
      return;
    }
    rewatchReminderShownRef.current = true;
    setPhase('camera-b-lesson');
    trackPsaTodayEvent('psa_camera_b_started', { episodeId: episode.id });
  }, [needsRedemption, episode.id]);

  const showRewatchReminder = Boolean(
    entitlement &&
      entitlement.watchesUsed > 0 &&
      canStartNewWatch &&
      !rewatchReminderShownRef.current &&
      (entitlement.pendingWatchSeconds ?? 0) <= 0
  );

  const handleChapterSelect = useCallback(
    (chapter: PSAEpisodeChapter) => {
      if (!psaChapterIsAccessible(chapter, paidLessonAllowed)) return;
      setActiveChapterId(chapter.id);
      setPsaEpisodeChapter(episode.id, chapter.id);
      trackPsaTodayEvent('psa_chapter_started', {
        episodeId: episode.id,
        chapterId: chapter.id,
        selectedEducationUnitId: unitContext.learnerUnitId ?? undefined,
        demonstrationUnitId: unitContext.demonstrationUnitId ?? undefined,
        unitContextSource: unitContext.contextSource,
        generalMode: unitContext.generalMode,
      });
      if (chapter.type === 'class-kit') {
        setPhase('class-kit');
        return;
      }
      if (chapter.type === 'camera-b' || chapter.type === 'macro' || chapter.type === 'recap' || chapter.type === 'outro') {
        if (needsRedemption && !paidSessionGraceRef.current) {
          setPhase('access-gate');
          return;
        }
        setPhase('camera-b-lesson');
        if (chapter.startSeconds != null) {
          updatePsaEpisodeProgress(episode, chapter.startSeconds, {
            chapterId: chapter.id,
            durationSec: episode.runtimeSeconds,
          });
        }
      }
    },
    [paidLessonAllowed, episode, needsRedemption, unitContext]
  );

  useEffect(() => {
    if (phase !== 'camera-b-lesson' || !activeChapterId) return;
    if (chapterStartedRef.current === activeChapterId) return;
    chapterStartedRef.current = activeChapterId;
    if (activeChapterMedia?.source === 'unit-specific') {
      trackPsaTodayEvent('psa_unit_specific_insert_viewed', {
        episodeId: episode.id,
        chapterId: activeChapterId,
        selectedEducationUnitId: unitContext.learnerUnitId ?? undefined,
        demonstrationUnitId: unitContext.demonstrationUnitId ?? undefined,
        mediaSource: activeChapterMedia.source,
      });
    }
  }, [phase, activeChapterId, activeChapterMedia, episode.id, unitContext]);

  const blockedVariant = expired ? 'expired' : watchesExhausted ? 'watches-exhausted' : null;

  const cameraAPreview = episode.cameraA?.previewVideoUrl;
  const cameraAPoster = episode.cameraA?.posterUrl ?? episode.heroPosterUrl;

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(1, 2.5, 5),
        textTransform: 'uppercase',
      }}
    >
      <LoungeTvBackButton onClick={onBack} />

      <header>
        <p
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
            color: LOUNGE_TV_TEXT_GRAY,
          }}
        >
          {episode.subtitle ?? 'PSA TODAY'}
        </p>
        <h1
          style={{
            margin: `${loungeTvGlassCqw(0.4, 1, 2)} 0 0`,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1.6, 3.8, 7.5),
            color: LOUNGE_TV_TEXT_WHITE,
            lineHeight: 1.15,
          }}
        >
          {episode.title}
        </h1>
        <p
          style={{
            margin: `${loungeTvGlassCqw(0.5, 1.2, 2.4)} 0 0`,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
            color: LOUNGE_TV_TEXT_GRAY,
            lineHeight: 1.35,
          }}
        >
          {episode.shortDescription}
        </p>
        {entitlement && canStartNewWatch ? (
          <div style={{ marginTop: loungeTvGlassCqw(0.6, 1.5, 3) }}>
            <PSAEntitlementStatusStrip entitlement={entitlement} />
          </div>
        ) : null}
      </header>

      {(phase === 'camera-a-preview' ||
        phase === 'camera-a-transition' ||
        phase === 'access-gate') && (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', overflow: 'hidden' }}>
          <LoungeTvVideoPreview
            src={cameraAPreview}
            poster={cameraAPoster}
            active={phase === 'camera-a-preview'}
            loop={!cameraAPreview}
            muted
            ariaLabel={`Camera A preview: ${episode.title}`}
            onReady={() => {
              if (!cameraAPreview) return;
            }}
          />
          {!cameraAPreview && phase === 'camera-a-preview' ? (
            <PreviewControls onContinue={advanceFromPreview} />
          ) : null}
          {cameraAPreview && phase === 'camera-a-preview' ? (
            <PreviewControls onContinue={advanceFromPreview} label="CONTINUE" />
          ) : null}
          {phase === 'camera-a-transition' ? (
            <TransitionOverlay episodeTitle={episode.title} />
          ) : null}
          {phase === 'access-gate' && needsRedemption ? (
            <PSAAccessPrompt
              ticketCost={ticketCost}
              onRedeem={() => void handleRedeem()}
              onViewClassKit={() => setPhase('class-kit')}
              busy={redeemBusy}
            />
          ) : null}
        </div>
      )}

      {phase === 'class-kit' && episode.classKit ? (
        <PSAClassKit episodeId={episode.id} kit={episode.classKit} onContinue={proceedToPaidLesson} />
      ) : null}

      {showRelatedTips && onOpenSlayTip ? (
        <PSARelatedSlayTips
          episodeId={episode.id}
          tips={relatedSlayTips}
          onSelectTip={onOpenSlayTip}
        />
      ) : null}

      {phase === 'ready-check' ? (
        <PSAReadyToStart
          requiredCount={requiredToolCount}
          onReviewKit={() => setPhase('class-kit')}
          onStartLesson={startLessonFromReady}
          rewatchReminder={
            showRewatchReminder && entitlement
              ? {
                  watchesUsed: entitlement.watchesUsed,
                  watchesRemaining: entitlement.watchesRemaining,
                  totalWatches: entitlement.totalWatches,
                }
              : undefined
          }
        />
      ) : null}

      {phase === 'camera-b-lesson' ? (
        <>
          {blockedVariant && !paidSessionGraceRef.current ? (
            <PSAAccessBlocked
              variant={blockedVariant}
              ticketCost={ticketCost}
              onRedeem={() => void handleRedeem()}
              onViewClassKit={() => setPhase('class-kit')}
              onWatchPreview={() => setPhase('camera-a-preview')}
              busy={redeemBusy}
            />
          ) : (
            <>
              {episode.unitEducation?.supportsDynamicUnits ? (
                <PSAUnitContextStrip
                  context={unitContext}
                  supportsFollowThisUnit={episode.unitEducation.supportsFollowThisUnit}
                  onSelectUnit={(unitId) => {
                    selectFollowUnit(unitId);
                    if (unitId && episode.unitEducation?.continuityStage === 'untouched') {
                      writeContinuityUnitPreference(unitId);
                    }
                    trackPsaTodayEvent('psa_unit_context_selected', {
                      episodeId: episode.id,
                      selectedEducationUnitId: unitId ?? undefined,
                      unitContextSource: unitId ? 'selected' : 'general',
                      generalMode: !unitId,
                    });
                  }}
                  onGeneralMode={() => {
                    setGeneralMode(true);
                    selectFollowUnit(null);
                    trackPsaTodayEvent('psa_unit_context_changed', {
                      episodeId: episode.id,
                      unitContextSource: 'general',
                      generalMode: true,
                    });
                  }}
                  demonstrationUnitReason={episode.unitEducation?.demonstrationUnitReason}
                />
              ) : null}
              {chapters.length ? (
                <PSAChapterNav
                  chapters={chapters}
                  activeChapterId={activeChapterId}
                  accessGranted={paidLessonAllowed}
                  onSelect={handleChapterSelect}
                  chapterProgressPercent={chapterProgress.percent}
                  currentChapterLabel={chapterProgress.currentChapterLabel}
                />
              ) : null}
              {cameraBTile?.videoSrc ? (
                <LoungeTvWatchLearnPlayer
                  tile={cameraBTile}
                  playBlocked={false}
                  onPlaybackSample={watchSessionEnabled ? handleSample : undefined}
                />
              ) : (
                <CameraBPlaceholder poster={episode.cameraB?.posterUrl ?? cameraAPoster} />
              )}
              {toast ? (
                <p
                  style={{
                    margin: 0,
                    fontFamily: LOUNGE_TV_FONT_BOOK,
                    fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
                    color: LOUNGE_TV_TEXT_GRAY,
                    letterSpacing: '0.06em',
                  }}
                >
                  {toast}
                </p>
              ) : null}
            </>
          )}
        </>
      ) : null}

      {import.meta.env.DEV ? (
        <PSATodayDebugInspector
          episode={episode}
          phase={phase}
          entitlement={entitlement}
          entitlementLoading={entitlementLoading}
          ticketCost={ticketCost}
          activeChapterId={activeChapterId}
          contentId={psaEpisodeContentIdForUnlock(episode)}
          resumeSec={resumePositionSec(episode)}
          session={session}
          thresholdSec={thresholdSec}
          paidLessonActive={phase === 'camera-b-lesson'}
          onRefreshEntitlement={() => void refreshEntitlement()}
          unitContext={unitContext}
          chapterMediaSource={activeChapterMedia?.source}
        />
      ) : null}
    </div>
  );
}

function PreviewControls({ onContinue, label = 'SKIP TO TRANSITION' }: { onContinue: () => void; label?: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: loungeTvGlassCqw(1, 2.5, 5),
        right: loungeTvGlassCqw(1, 2.5, 5),
        zIndex: 5,
      }}
    >
      <button type="button" data-lounge-tv-focusable onClick={onContinue} style={previewBtnStyle}>
        {label}
      </button>
    </div>
  );
}

function TransitionOverlay({ episodeTitle }: { episodeTitle: string }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        animation: 'lounge-tv-hero-crossfade 0.9s ease',
      }}
    >
      <span
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
          color: LOUNGE_TV_TEXT_WHITE,
          letterSpacing: '0.08em',
        }}
      >
        {episodeTitle}
      </span>
    </div>
  );
}

function CameraBPlaceholder({ poster }: { poster?: string }) {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#0a0a0a' }}>
      {poster ? (
        <img src={poster} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.45)',
        }}
      >
        <span
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1.1, 2.5, 5),
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.08em',
          }}
        >
          {import.meta.env.DEV ? 'CAMERA B SLOT READY' : 'LESSON COMING SOON'}
        </span>
      </div>
    </div>
  );
}

const previewBtnStyle: React.CSSProperties = {
  fontFamily: LOUNGE_TV_FONT_MEDIUM,
  fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
  letterSpacing: '0.06em',
  padding: `${loungeTvGlassCqw(0.6, 1.5, 3)} ${loungeTvGlassCqw(1, 2.5, 5)}`,
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.35)',
  color: LOUNGE_TV_TEXT_WHITE,
  cursor: 'pointer',
};
