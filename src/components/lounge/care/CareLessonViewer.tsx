import { useCallback, useEffect } from 'react';
import type { CareLesson } from '../../../content/education/types';
import { LoungeTvBackButton } from '../LoungeTvUiPrimitives';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import {
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { LoungeTvWatchLearnPlayer } from '../LoungeTvWatchLearnPlayer';
import { CARE_LOCKED_LABEL } from './careAccess';
import { markCareLessonCompleted, setCareWatchProgress, getCareProgress } from './careProgress';
import { trackCareEvent } from './careAnalytics';

type CareLessonViewerProps = {
  lesson: CareLesson;
  unlocked: boolean;
  onBack: () => void;
};

export function CareLessonViewer({ lesson, unlocked, onBack }: CareLessonViewerProps) {
  const saved = getCareProgress(lesson.id);

  useEffect(() => {
    trackCareEvent(unlocked ? 'care_guide_opened' : 'care_locked_lesson_viewed', {
      contentId: lesson.id,
      guideId: lesson.id,
    });
    if (unlocked && saved && saved.progressSeconds > 0 && !saved.completed) {
      trackCareEvent('care_lesson_resumed', { lessonId: lesson.id, guideId: lesson.id });
    }
  }, [lesson.id, unlocked, saved]);

  const tile = {
    id: lesson.id,
    title: lesson.title,
    videoSrc: lesson.videoUrl,
    ticketCost: 0,
    isFreePreview: false,
    description: lesson.shortDescription,
  };

  const handleProgress = useCallback(
    (currentTime: number, duration: number) => {
      if (!unlocked) return;
      const completed = duration > 0 && currentTime >= duration - 2;
      setCareWatchProgress(lesson.id, currentTime, {
        durationSeconds: duration,
        completed,
      });
      if (completed) {
        markCareLessonCompleted(lesson.id);
        trackCareEvent('care_guide_completed', { contentId: lesson.id, guideId: lesson.id });
      }
    },
    [lesson.id, unlocked]
  );

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(1.2, 3, 6),
        textTransform: 'uppercase',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <LoungeTvBackButton onClick={onBack} />

      <header>
        <p
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
            color: '#EB1C24',
            letterSpacing: '0.08em',
          }}
        >
          {lesson.subtitle ?? 'CARE'}
        </p>
        <h1
          style={{
            margin: `${loungeTvGlassCqw(0.4, 1, 2)} 0 0`,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1.5, 3.5, 7),
            color: LOUNGE_TV_TEXT_WHITE,
            lineHeight: 1.15,
          }}
        >
          {lesson.title}
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
          {lesson.shortDescription}
        </p>
      </header>

      {!unlocked ? (
        <div
          style={{
            padding: loungeTvGlassCqw(1.5, 4, 8),
            background: 'rgba(0,0,0,0.55)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.1, 2.5, 5),
              color: LOUNGE_TV_TEXT_WHITE,
            }}
          >
            {CARE_LOCKED_LABEL}
          </p>
          <p
            style={{
              margin: `${loungeTvGlassCqw(0.6, 1.5, 3)} 0 0`,
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
              color: LOUNGE_TV_TEXT_GRAY,
              lineHeight: 1.4,
            }}
          >
            CARE EDUCATION IS COMPLIMENTARY WITH QUALIFYING FRONTAL SLAYER HAIR PURCHASES ONCE YOUR ORDER IS
            DELIVERED.
          </p>
        </div>
      ) : lesson.videoUrl ? (
        <CareVideoShell lesson={lesson} tile={tile} onProgress={handleProgress} />
      ) : (
        <CareComingSoonPoster lesson={lesson} />
      )}
    </div>
  );
}

function CareVideoShell({
  lesson,
  tile,
  onProgress,
}: {
  lesson: CareLesson;
  tile: { id: string; title: string; videoSrc?: string; ticketCost: number };
  onProgress: (current: number, duration: number) => void;
}) {
  useEffect(() => {
    const interval = window.setInterval(() => {
      const video = document.querySelector<HTMLVideoElement>(`[data-care-lesson-video="${lesson.id}"]`);
      if (!video) return;
      onProgress(video.currentTime, video.duration || lesson.durationSeconds || 0);
    }, 4000);
    return () => window.clearInterval(interval);
  }, [lesson.id, lesson.durationSeconds, onProgress]);

  return (
    <div data-care-lesson-video={lesson.id}>
      <LoungeTvWatchLearnPlayer tile={tile} playBlocked={false} />
    </div>
  );
}

function CareComingSoonPoster({ lesson }: { lesson: CareLesson }) {
  const poster = lesson.posterUrl ?? lesson.thumbnailUrl;
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        background: '#0a0a0a',
        overflow: 'hidden',
      }}
    >
      {poster ? (
        <img src={poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }} />
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1.1, 2.5, 5),
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          CARE VIDEO COMING SOON
        </span>
      </div>
    </div>
  );
}
