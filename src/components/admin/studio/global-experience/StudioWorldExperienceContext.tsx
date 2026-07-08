import { createContext, useContext } from 'react';
import type { StudioWorldExperienceEngine } from '../../../../studio-os-core/studio-world-experience';

export type StudioWorldExperienceContextValue = StudioWorldExperienceEngine;

const StudioWorldExperienceContext = createContext<StudioWorldExperienceContextValue | null>(null);

export function StudioWorldExperienceContextProvider({
  value,
  children,
}: {
  value: StudioWorldExperienceContextValue;
  children: React.ReactNode;
}) {
  return (
    <StudioWorldExperienceContext.Provider value={value}>{children}</StudioWorldExperienceContext.Provider>
  );
}

export function useStudioWorldExperience(): StudioWorldExperienceContextValue {
  const ctx = useContext(StudioWorldExperienceContext);
  if (!ctx) {
    throw new Error(
      'useStudioWorldExperience must be used within StudioWorldExperienceProvider (Global Experience System™)'
    );
  }
  return ctx;
}

export function useStudioWorldExperienceOptional(): StudioWorldExperienceContextValue | null {
  return useContext(StudioWorldExperienceContext);
}
