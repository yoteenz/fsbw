import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { IntakeAnswers } from '../../intake/intakeTypes';
import type { IntakeSection } from '../../intake/intakeTypes';
import { GOAL_LABELS } from '../../intake/intakeTypes';

type Props = {
  answers: IntakeAnswers;
  sections: IntakeSection[];
  onEditStep: (index: number) => void;
};

export function SmartIntakeReviewSummary({ answers, sections, onEditStep }: Props) {
  const { t } = useTranslation('intake');

  const businessIdx = sections.findIndex((s) => s.id === 'business');
  const goalIdx = sections.findIndex((s) => s.id === 'goal');

  return (
    <div className="si-review">
      <p className="si-review__eyebrow">{t('review.eyebrow')}</p>
      <h2 className="si-review__title">{t('review.title')}</h2>
      <p className="si-review__lede">{t('review.lede')}</p>

      <div className="si-review__groups">
        {answers.goal && (
          <ReviewGroup
            title={t('review.goals')}
            onEdit={goalIdx >= 0 ? () => onEditStep(goalIdx) : undefined}
            editLabel={t('review.edit')}
          >
            <ReviewRow label={t('review.primaryGoal')} value={GOAL_LABELS[answers.goal]?.title ?? answers.goal} />
          </ReviewGroup>
        )}

        {(answers.business?.name || answers.business?.structure || answers.business?.formationState) && (
          <ReviewGroup
            title={t('review.business')}
            onEdit={businessIdx >= 0 ? () => onEditStep(businessIdx) : undefined}
            editLabel={t('review.edit')}
          >
            {answers.business?.name && <ReviewRow label={t('review.businessName')} value={answers.business.name} />}
            {answers.business?.structure && (
              <ReviewRow label={t('review.structure')} value={answers.business.structure.replace(/_/g, ' ')} />
            )}
            {answers.business?.formationState && (
              <ReviewRow label={t('review.formationState')} value={answers.business.formationState} />
            )}
            {answers.business?.nameCheck && answers.business.nameCheck.status === 'likely_available' && (
              <ReviewRow label={t('nameCheck.reviewSection')} value={t('nameCheck.likelyAvailable')} />
            )}
          </ReviewGroup>
        )}

        {answers.painPoints && answers.painPoints.length > 0 && (
          <ReviewGroup title={t('review.helpNeeded')}>
            <ReviewRow label={t('review.painPoints')} value={answers.painPoints.join(', ')} />
          </ReviewGroup>
        )}
      </div>
    </div>
  );
}

function ReviewGroup({
  title,
  children,
  onEdit,
  editLabel,
}: {
  title: string;
  children: ReactNode;
  onEdit?: () => void;
  editLabel?: string;
}) {
  return (
    <section className="si-review-group">
      <div className="si-review-group__head">
        <h3>{title}</h3>
        {onEdit && (
          <button type="button" className="si-review-group__edit" onClick={onEdit}>
            {editLabel}
          </button>
        )}
      </div>
      <dl className="si-review-group__rows">{children}</dl>
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="si-review-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
