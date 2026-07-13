import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ExperienceLabProgram } from '../studio-os-core/canonical-studio-world/experience-lab-program';
import {
  EXPERIENCE_LAB_PROGRAM_STORAGE_KEY,
  resolveDefaultExperienceLabProgram,
} from '../studio-os-core/canonical-studio-world/experience-lab-program';

export function useExperienceLabProgram() {
  const [program, setProgram] = useState<ExperienceLabProgram>(() => {
    try {
      const stored = localStorage.getItem(EXPERIENCE_LAB_PROGRAM_STORAGE_KEY);
      if (stored === 'studio-world' || stored === 'industry-packs') return stored;
    } catch {
      /* ignore */
    }
    return resolveDefaultExperienceLabProgram();
  });

  useEffect(() => {
    try {
      localStorage.setItem(EXPERIENCE_LAB_PROGRAM_STORAGE_KEY, program);
    } catch {
      /* ignore */
    }
  }, [program]);

  const selectProgram = useCallback((next: ExperienceLabProgram) => {
    setProgram(next);
  }, []);

  const isStudioWorldProgram = program === 'studio-world';
  const isIndustryPacksProgram = program === 'industry-packs';

  return useMemo(
    () => ({
      program,
      selectProgram,
      isStudioWorldProgram,
      isIndustryPacksProgram,
    }),
    [program, selectProgram, isStudioWorldProgram, isIndustryPacksProgram]
  );
}
