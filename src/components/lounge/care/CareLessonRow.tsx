import type { CareLesson } from '../../../content/education/types';
import { CareLessonCard } from './CareLessonCard';
import { LoungeTvSectionTitle } from '../LoungeTvUiPrimitives';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { careProgressPercent } from './careProgress';
import { trackCareEvent } from './careAnalytics';

type CareLessonRowProps = {
  title: string;
  lessons: CareLesson[];
  onSelect: (lesson: CareLesson) => void;
  isUnlocked: (lessonId: string) => boolean;
  emptyLabel?: string;
};

export function CareLessonRow({
  title,
  lessons,
  onSelect,
  isUnlocked,
  emptyLabel,
}: CareLessonRowProps) {
  if (!lessons.length && emptyLabel) {
    return (
      <section style={{ marginBottom: loungeTvGlassCqw(2, 5, 10) }}>
        <LoungeTvSectionTitle title={title} />
        <p
          style={{
            margin: 0,
            fontFamily: '"Futura PT Book", Futura, sans-serif',
            fontSize: loungeTvGlassCqw(1.4, 3.2, 6.5),
            color: '#808080',
            textTransform: 'uppercase',
          }}
        >
          {emptyLabel}
        </p>
      </section>
    );
  }

  if (!lessons.length) return null;

  return (
    <section style={{ marginBottom: loungeTvGlassCqw(2, 5, 10) }}>
      <LoungeTvSectionTitle title={title} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: loungeTvGlassCqw(1.2, 3, 6),
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x proximity',
        }}
      >
        {lessons.map((lesson) => {
          const unlocked = isUnlocked(lesson.id);
          return (
            <CareLessonCard
              key={lesson.id}
              lesson={lesson}
              unlocked={unlocked}
              progressPercent={careProgressPercent(lesson)}
              onSelect={(l) => {
                if (!unlocked) {
                  trackCareEvent('care_locked_lesson_viewed', { lessonId: l.id });
                } else {
                  trackCareEvent('care_lesson_opened', { lessonId: l.id });
                }
                onSelect(l);
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
