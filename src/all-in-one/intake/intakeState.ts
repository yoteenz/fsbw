import { AIO_STORAGE_KEYS, readStorage, writeStorage } from '../storage/demoStorage';
import type { IntakeAnswers } from './intakeTypes';
import { defaultIntakeAnswers } from './intakeTypes';

export interface IntakeRepository {
  load(): IntakeAnswers;
  save(answers: IntakeAnswers): void;
  clear(): void;
}

export class LocalDemoIntakeRepository implements IntakeRepository {
  load(): IntakeAnswers {
    return readStorage(AIO_STORAGE_KEYS.intake, defaultIntakeAnswers());
  }

  save(answers: IntakeAnswers): void {
    writeStorage(AIO_STORAGE_KEYS.intake, answers);
  }

  clear(): void {
    writeStorage(AIO_STORAGE_KEYS.intake, defaultIntakeAnswers());
  }
}

export const intakeRepository = new LocalDemoIntakeRepository();
