import { defaultIntakeAnswers } from '../intake/intakeTypes';
import type { IntakeAnswers } from '../intake/intakeTypes';
import { getStore, saveIntake } from '../demo/demoActions';
import { resetDemoStore } from '../demo/demoStore';

export interface IntakeRepository {
  load(): IntakeAnswers;
  save(answers: IntakeAnswers): void;
  clear(): void;
}

export class LocalDemoIntakeRepository implements IntakeRepository {
  load(): IntakeAnswers {
    return getStore().intake ?? defaultIntakeAnswers();
  }

  save(answers: IntakeAnswers): void {
    saveIntake(answers);
  }

  clear(): void {
    resetDemoStore();
  }
}

export const intakeRepository = new LocalDemoIntakeRepository();
