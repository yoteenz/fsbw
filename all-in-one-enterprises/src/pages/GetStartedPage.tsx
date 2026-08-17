import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getVisibleQuestions, getVisibleSections, goalFromQueryParam } from '../intake/intakeConfig';
import { defaultIntakeAnswers, type IntakeAnswers } from '../intake/intakeTypes';
import { intakeRepository } from '../intake/intakeState';
import { generateRoadmap } from '../roadmap/roadmapEngine';
import { roadmapRepository } from '../repositories/roadmapRepository';
import { createLeadFromIntake } from '../demo/crmActions';
import { IntakeQuestionField, useIntakeValidation } from '../components/IntakeQuestionField';
import { AIOButton } from '../components/AIOButton';
import { aioPaths } from '../utils/paths';
import { invalidateNameCheckOnInputChange } from '../business-formation/businessNameRegistry/staleLogic';

export function GetStartedPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<IntakeAnswers>(() => intakeRepository.load());
  const [stepIndex, setStepIndex] = useState(0);
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

  const goNext = useCallback(() => {
    if (!validate(questions, answers)) return;
    if (stepIndex < totalSteps - 1) {
      setStepIndex((i) => i + 1);
      mainRef.current?.focus();
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
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  if (!currentSection) {
    return (
      <div className="aio-intake">
        <div className="aio-container">
          <p>Unable to load intake. <button type="button" onClick={() => { setAnswers(defaultIntakeAnswers()); setStepIndex(0); }}>Start over</button></p>
        </div>
      </div>
    );
  }

  const progress = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <div className="aio-intake">
      <div className="aio-intake__header">
        <div className="aio-container">
          <p className="aio-label aio-gold-text">Smart Intake</p>
          <h1 className="aio-display-md">{currentSection.title}</h1>
          {currentSection.description && <p className="aio-intake__subtitle">{currentSection.description}</p>}
          <div className="aio-intake__progress-wrap">
            <span className="aio-intake__step-label">
              Step {stepIndex + 1} of {totalSteps}
            </span>
            <div className="aio-intake__progress-track" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
              <div className="aio-intake__progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="aio-container aio-intake__body" ref={mainRef} tabIndex={-1}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goNext();
          }}
        >
          <div className="aio-intake__questions">
            {questions.map((q) => (
              <IntakeQuestionField
                key={q.id}
                question={q}
                answers={answers}
                onChange={setAnswersWithInvalidation}
                error={errors[q.field]}
              />
            ))}
          </div>

          <div className="aio-intake__actions">
            {stepIndex > 0 && (
              <AIOButton type="button" variant="outline-dark" onClick={goBack}>
                Back
              </AIOButton>
            )}
            <AIOButton type="submit" variant="gold">
              {stepIndex < totalSteps - 1 ? 'Continue' : 'Generate My Roadmap'}
            </AIOButton>
          </div>
        </form>
      </div>
    </div>
  );
}
