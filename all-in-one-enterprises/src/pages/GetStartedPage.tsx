import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getVisibleQuestions, getVisibleSections, goalFromQueryParam } from '../intake/intakeConfig';
import { defaultIntakeAnswers, type IntakeAnswers } from '../intake/intakeTypes';
import { intakeRepository } from '../intake/intakeState';
import { generateRoadmap } from '../roadmap/roadmapEngine';
import { roadmapRepository } from '../repositories/roadmapRepository';
import { createLeadFromIntake } from '../demo/crmActions';
import { IntakeQuestionField, useIntakeValidation } from '../components/IntakeQuestionField';
import { aioPaths } from '../utils/paths';
import { invalidateNameCheckOnInputChange } from '../business-formation/businessNameRegistry/staleLogic';
import { getSmartIntakeStepMeta } from '../intake/smartIntakeMeta';
import { SmartIntakeShell } from '../components/smart-intake/SmartIntakeShell';
import { SmartIntakeWorkspaceHeader } from '../components/smart-intake/SmartIntakeWorkspaceHeader';
import { SmartIntakeNavigation } from '../components/smart-intake/SmartIntakeNavigation';
import { SmartIntakeBusinessStep } from '../components/smart-intake/SmartIntakeBusinessStep';
import { SmartIntakeReviewSummary } from '../components/smart-intake/SmartIntakeReviewSummary';
import type { JourneyStepItem } from '../components/smart-intake/SmartIntakeJourneyRail';
import type { SmartIntakeLayoutMode } from '../intake/smartIntakeLayoutMode';

type GetStartedPageProps = {
  layoutMode?: SmartIntakeLayoutMode;
};

export function GetStartedPage({ layoutMode = 'responsive' }: GetStartedPageProps) {
  const { t } = useTranslation('intake');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<IntakeAnswers>(() => intakeRepository.load());
  const [stepIndex, setStepIndex] = useState(0);
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { errors, validate } = useIntakeValidation();
  const mainRef = useRef<HTMLDivElement>(null);

  const setAnswersWithInvalidation = useCallback((updater: IntakeAnswers | ((prev: IntakeAnswers) => IntakeAnswers)) => {
    setAnswers((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const invalidated = invalidateNameCheckOnInputChange(next.business?.nameCheck, {
        businessNameRaw: next.business?.name,
        formationState: next.business?.formationState,
        entityStructure: next.business?.structure,
      });
      if (invalidated !== next.business?.nameCheck) {
        return { ...next, business: { ...next.business, nameCheck: invalidated } };
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const goalParam = goalFromQueryParam(searchParams.get('goal'));
    if (goalParam && !answers.goal) {
      setAnswers((a) => ({ ...a, goal: goalParam }));
    }
  }, [searchParams, answers.goal]);

  const serviceParam = searchParams.get('service');

  useEffect(() => {
    intakeRepository.save(answers);
  }, [answers]);

  const sections = useMemo(() => getVisibleSections(answers), [answers]);
  const totalSteps = sections.length;
  const currentSection = sections[stepIndex];
  const questions = currentSection ? getVisibleQuestions(currentSection, answers) : [];
  const stepMeta = currentSection ? getSmartIntakeStepMeta(currentSection) : null;
  const isLastStep = stepIndex >= totalSteps - 1;

  const journeySteps: JourneyStepItem[] = useMemo(
    () =>
      sections.map((section, index) => {
        const meta = getSmartIntakeStepMeta(section);
        let state: JourneyStepItem['state'] = 'future';
        if (index < stepIndex) state = 'complete';
        if (index === stepIndex) state = 'current';
        return {
          id: section.id,
          index,
          label: meta.journeyLabel.includes('.') ? t(meta.journeyLabel) : meta.journeyLabel,
          subtitle: meta.journeySubtitle.includes('.') ? t(meta.journeySubtitle) : meta.journeySubtitle,
          state,
        };
      }),
    [sections, stepIndex, t],
  );

  const goNext = useCallback(() => {
    if (!validate(questions, answers)) return;
    setSubmitting(true);
    if (stepIndex < totalSteps - 1) {
      setStepIndex((i) => i + 1);
      setJourneyOpen(false);
      mainRef.current?.focus();
      setSubmitting(false);
    } else {
      const roadmap = generateRoadmap(answers);
      roadmapRepository.save(roadmap);
      const serviceSlugs = roadmap.items.map((i) => i.serviceSlug).filter(Boolean) as string[];
      if (serviceParam && !serviceSlugs.includes(serviceParam)) serviceSlugs.unshift(serviceParam);
      createLeadFromIntake(answers, serviceSlugs);
      navigate(aioPaths.roadmapResults);
    }
  }, [answers, navigate, questions, stepIndex, totalSteps, validate, serviceParam]);

  const goBack = () => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
      setJourneyOpen(false);
      mainRef.current?.focus();
    }
  };

  const saveAndExit = () => {
    intakeRepository.save(answers);
    navigate(aioPaths.home);
  };

  if (!currentSection || !stepMeta) {
    return (
      <div className="si-shell">
        <div className="si-shell__frame si-shell__frame--centered">
          <p>
            Unable to load intake.{' '}
            <button type="button" onClick={() => { setAnswers(defaultIntakeAnswers()); setStepIndex(0); }}>
              Start over
            </button>
          </p>
        </div>
      </div>
    );
  }

  const workspaceTitle = stepMeta.workspaceTitle.includes('.') ? t(stepMeta.workspaceTitle) : stepMeta.workspaceTitle;
  const workspaceDesc = stepMeta.workspaceDescription.includes('.')
    ? t(stepMeta.workspaceDescription)
    : stepMeta.workspaceDescription;

  return (
    <SmartIntakeShell
      layoutMode={layoutMode}
      journeySteps={journeySteps}
      journeyOpen={journeyOpen}
      onOpenJourney={() => setJourneyOpen(true)}
      onCloseJourney={() => setJourneyOpen(false)}
      mainRef={mainRef}
      workspaceHeader={
        <SmartIntakeWorkspaceHeader
          title={workspaceTitle}
          description={workspaceDesc}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
        />
      }
      navigation={
        <SmartIntakeNavigation
          stepIndex={stepIndex}
          isLastStep={isLastStep}
          onBack={goBack}
          onSaveExit={saveAndExit}
          onContinue={goNext}
          formId="si-intake-form"
          submitting={submitting && isLastStep}
        />
      }
    >
      <form
        id="si-intake-form"
        className="si-form"
        onSubmit={(e) => {
          e.preventDefault();
          goNext();
        }}
      >
        {isLastStep && (
          <SmartIntakeReviewSummary answers={answers} sections={sections} onEditStep={setStepIndex} />
        )}

        {currentSection.id === 'business' ? (
          <SmartIntakeBusinessStep
            questions={questions}
            answers={answers}
            onChange={setAnswersWithInvalidation}
            errors={errors}
          />
        ) : (
          <div className="si-form__questions">
            {questions.map((q) => (
              <IntakeQuestionField
                key={q.id}
                question={q}
                answers={answers}
                onChange={setAnswersWithInvalidation}
                error={errors[q.field]}
                variant="smart"
              />
            ))}
          </div>
        )}
      </form>
    </SmartIntakeShell>
  );
}
