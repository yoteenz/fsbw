import type { ReactNode } from 'react';
import type { CareLesson } from '../../../content/education/types';
import { CareLessonCard } from './CareLessonCard';
import { LoungeTvSectionTitle } from '../LoungeTvUiPrimitives';
import { LoungeTvEmptyState } from '../LoungeTvEmptyState';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_TYPE } from '../loungeTvTypography';
import { LOUNGE_TV_FONT_BOOK, LOUNGE_TV_TEXT_GRAY } from '../loungeTvTheme';
import { careProgressPercent } from './careProgress';
import { trackCareEvent } from './careAnalytics';
import {
  resolveRailLayoutMode,
  type LoungeTvRailDisplayMode,
} from '../loungeTvAdaptiveRail';

type CareLessonRowProps = {
  title: string;
  lessons: CareLesson[];
  onSelect: (lesson: CareLesson) => void;
  isUnlocked: (lessonId: string) => boolean;
  emptyLabel?: string;
  subtitle?: string;
  action?: ReactNode;
  railId?: string;
  displayMode?: LoungeTvRailDisplayMode;
  suppressTitle?: boolean;
  /** When true, parent handles section spacing (Learn tab PSA dividers). */
  embeddedSection?: boolean;
};

export function CareLessonRow({
  title,
  lessons,
  onSelect,
  isUnlocked,
  emptyLabel,
  subtitle,
  action,
  railId = 'care-lessons',
  displayMode = 'auto',
  suppressTitle = false,
  embeddedSection = false,
}: CareLessonRowProps) {
  const sectionFooterGap = embeddedSection ? '0' : loungeTvGlassCqw(2.5, 6, 12);

  if (!lessons.length && emptyLabel) {
    return (
      <section
        data-lounge-tv-rail={railId}
        style={{ marginBottom: sectionFooterGap }}
      >
        {!suppressTitle && title ? (
          <>
            <LoungeTvSectionTitle title={title} action={action} />
            {subtitle ? (
              <p
                style={{
                  margin: `0 0 ${loungeTvGlassCqw(1, 2.5, 5)}`,
                  fontFamily: LOUNGE_TV_FONT_BOOK,
                  fontSize: LOUNGE_TV_TYPE.l3,
                  color: LOUNGE_TV_TEXT_GRAY,
                  textTransform: 'uppercase',
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </p>
            ) : null}
          </>
        ) : null}
        <LoungeTvEmptyState message={emptyLabel} />
      </section>
    );
  }

  if (!lessons.length) return null;

  const layoutMode = resolveRailLayoutMode(lessons.length, displayMode);
  const isFeature = layoutMode === 'feature';

  return (
    <section
      data-lounge-tv-rail={railId}
      data-lounge-tv-rail-layout={layoutMode}
      style={{ marginBottom: sectionFooterGap }}
    >
      {!suppressTitle && title ? (
        <>
          <LoungeTvSectionTitle title={title} action={action} />
          {subtitle ? (
            <p
              style={{
                margin: `0 0 ${loungeTvGlassCqw(1, 2.5, 5)}`,
                fontFamily: LOUNGE_TV_FONT_BOOK,
                fontSize: LOUNGE_TV_TYPE.l3,
                color: LOUNGE_TV_TEXT_GRAY,
                textTransform: 'uppercase',
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </>
      ) : null}
      <div
        data-lounge-tv-rail-scroll
        style={{
          display: 'flex',
          flexDirection: isFeature ? 'column' : 'row',
          alignItems: 'stretch',
          gap: loungeTvGlassCqw(isFeature ? 0 : 1.5, isFeature ? 0 : 3.5, isFeature ? 0 : 7),
          overflowX: isFeature ? 'visible' : 'auto',
          overflowY: 'visible',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: isFeature ? undefined : 'x proximity',
          paddingBottom: loungeTvGlassCqw(0.8, 2, 4),
        }}
      >
        {lessons.map((lesson) => {
          const unlocked = isUnlocked(lesson.id);
          return (
            <div
              key={lesson.id}
              data-lounge-tv-card-unit
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: isFeature ? '1 1 100%' : '0 0 auto',
                minWidth: isFeature ? undefined : 0,
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always',
              }}
            >
              <CareLessonCard
                lesson={lesson}
                unlocked={unlocked}
                progressPercent={careProgressPercent(lesson)}
                cardSize={layoutMode}
                onSelect={(l) => {
                  if (!unlocked) {
                    trackCareEvent('care_locked_lesson_viewed', { lessonId: l.id });
                  } else {
                    trackCareEvent('care_lesson_opened', { lessonId: l.id });
                  }
                  onSelect(l);
                }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
