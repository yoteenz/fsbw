import { useTranslation } from 'react-i18next';
import type { IntakeAnswers, IntakeQuestion } from '../../intake/intakeTypes';
import { IntakeQuestionField } from '../IntakeQuestionField';
import { SmartIntakeInsight, SmartIntakeSection } from './SmartIntakeSection';

type Props = {
  questions: IntakeQuestion[];
  answers: IntakeAnswers;
  onChange: (answers: IntakeAnswers) => void;
  errors: Record<string, string>;
};

/** Step 3 — grouped business modules matching approved design reference. */
export function SmartIntakeBusinessStep({ questions, answers, onChange, errors }: Props) {
  const { t } = useTranslation('intake');
  const byId = Object.fromEntries(questions.map((q) => [q.id, q]));

  const formation = byId.formation_state;
  const name = byId.business_name;
  const structure = byId.business_structure;
  const rest = questions.filter((q) => !['formation_state', 'business_name', 'business_structure'].includes(q.id));

  const showStructureInsight = answers.business?.structure === 'not_formed' || !answers.business?.structure;

  return (
    <>
      {formation && (
        <SmartIntakeSection label={t('business.formationLabel')} title={formation.question}>
          <IntakeQuestionField question={formation} answers={answers} onChange={onChange} error={errors[formation.field]} variant="smart" />
        </SmartIntakeSection>
      )}

      {name && (
        <SmartIntakeSection label={t('business.nameLabel')} title={t('business.nameTitle')}>
          <IntakeQuestionField question={name} answers={answers} onChange={onChange} error={errors[name.field]} variant="smart" />
        </SmartIntakeSection>
      )}

      {structure && (
        <SmartIntakeSection label={t('business.structureLabel')} title={structure.question}>
          <IntakeQuestionField question={structure} answers={answers} onChange={onChange} error={errors[structure.field]} variant="smart" />
          {showStructureInsight && (
            <>
              <SmartIntakeInsight>{t('insight.structureHelp')}</SmartIntakeInsight>
              <p className="si-section__hint">{t('business.notFormedHint')}</p>
            </>
          )}
          {!showStructureInsight && <SmartIntakeInsight>{t('insight.structure')}</SmartIntakeInsight>}
        </SmartIntakeSection>
      )}

      {rest.length > 0 && (
        <SmartIntakeSection label={t('business.fleetLabel')} title={t('business.fleetTitle')}>
          {rest.map((q) => (
            <IntakeQuestionField key={q.id} question={q} answers={answers} onChange={onChange} error={errors[q.field]} variant="smart" />
          ))}
        </SmartIntakeSection>
      )}
    </>
  );
}
