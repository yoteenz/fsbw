import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ExperienceLabProgram } from './experience-lab-v2-program-registry';
import { defaultExperienceLabV2Program } from './experience-lab-v2-program-registry';
import {
  defaultIndustryPackId,
  listIndustryPackSelectorEntries,
} from './experience-lab-v2-industry-pack-registry';
import {
  defaultStudioWorldDepartmentId,
  type StudioWorldDepartmentId,
} from './experience-lab-v2-department-registry';
import {
  defaultEnvironmentId,
  listIndustryPackEnvironments,
  listStudioWorldEnvironments,
} from './experience-lab-v2-environment-registry';
import {
  buildGenerationPipelineBreadcrumb,
  GENERATION_PIPELINE_STORAGE_KEY,
  pipelineCanonicalDepartmentId,
  pipelineProgramActionsProfile,
  type GenerationPipelineState,
} from './experience-lab-v2-generation-pipeline';
import { EXPERIENCE_LAB_PROGRAM_STORAGE_KEY } from '../../../studio-os-core/canonical-studio-world/experience-lab-program';

type ProgramContextValue = {
  state: GenerationPipelineState;
  breadcrumb: ReturnType<typeof buildGenerationPipelineBreadcrumb>;
  canonicalDepartmentId: string;
  programActionsProfile: string;
  studioEnvironments: ReturnType<typeof listStudioWorldEnvironments>;
  industryEnvironments: ReturnType<typeof listIndustryPackEnvironments>;
  industryPacks: ReturnType<typeof listIndustryPackSelectorEntries>;
  setProgram: (programId: ExperienceLabProgram) => void;
  setStudioDepartment: (id: StudioWorldDepartmentId) => void;
  setIndustryPack: (id: string) => void;
  setEnvironment: (id: string) => void;
};

const ProgramContext = createContext<ProgramContextValue | null>(null);

function readPersistedPipeline(): Partial<GenerationPipelineState> | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GENERATION_PIPELINE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<GenerationPipelineState>;
  } catch {
    return null;
  }
}

function writePersistedPipeline(state: GenerationPipelineState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(GENERATION_PIPELINE_STORAGE_KEY, JSON.stringify(state));
}

type ProviderProps = {
  children: ReactNode;
  activeVariantLabel?: string | null;
  onPipelineDepthChange?: (scope: 'program' | 'department' | 'pack' | 'environment') => void;
};

/** ProgramContextProvider — owns generation pipeline state for Command Dock + shell. */
export function ProgramContextProvider({
  children,
  activeVariantLabel = null,
  onPipelineDepthChange,
}: ProviderProps) {
  const persisted = readPersistedPipeline();

  const [state, setState] = useState<GenerationPipelineState>(() => {
    const programId = persisted?.programId ?? defaultExperienceLabV2Program();
    const studioDepartmentId =
      programId === 'studio-world'
        ? persisted?.studioDepartmentId ?? defaultStudioWorldDepartmentId()
        : null;
    const industryPackId =
      programId === 'industry-packs'
        ? persisted?.industryPackId ?? defaultIndustryPackId()
        : null;
    const environments =
      programId === 'studio-world'
        ? listStudioWorldEnvironments(studioDepartmentId)
        : listIndustryPackEnvironments(industryPackId);
    const environmentId = persisted?.environmentId ?? defaultEnvironmentId(environments);
    return { programId, studioDepartmentId, industryPackId, environmentId };
  });

  useEffect(() => {
    writePersistedPipeline(state);
    try {
      localStorage.setItem(EXPERIENCE_LAB_PROGRAM_STORAGE_KEY, state.programId);
    } catch {
      /* ignore */
    }
  }, [state]);

  const setProgram = useCallback(
    (programId: ExperienceLabProgram) => {
      onPipelineDepthChange?.('program');
      setState(() => {
        const studioDepartmentId =
          programId === 'studio-world' ? defaultStudioWorldDepartmentId() : null;
        const industryPackId = programId === 'industry-packs' ? defaultIndustryPackId() : null;
        const environments =
          programId === 'studio-world'
            ? listStudioWorldEnvironments(studioDepartmentId)
            : listIndustryPackEnvironments(industryPackId);
        return {
          programId,
          studioDepartmentId,
          industryPackId,
          environmentId: defaultEnvironmentId(environments),
        };
      });
    },
    [onPipelineDepthChange]
  );

  const setStudioDepartment = useCallback(
    (studioDepartmentId: StudioWorldDepartmentId) => {
      onPipelineDepthChange?.('department');
      setState((prev) => {
        const environments = listStudioWorldEnvironments(studioDepartmentId);
        return {
          ...prev,
          studioDepartmentId,
          environmentId: defaultEnvironmentId(environments),
        };
      });
    },
    [onPipelineDepthChange]
  );

  const setIndustryPack = useCallback(
    (industryPackId: string) => {
      onPipelineDepthChange?.('pack');
      setState((prev) => {
        const environments = listIndustryPackEnvironments(industryPackId);
        return {
          ...prev,
          industryPackId,
          environmentId: defaultEnvironmentId(environments),
        };
      });
    },
    [onPipelineDepthChange]
  );

  const setEnvironment = useCallback(
    (environmentId: string) => {
      onPipelineDepthChange?.('environment');
      setState((prev) => ({ ...prev, environmentId }));
    },
    [onPipelineDepthChange]
  );

  const value = useMemo<ProgramContextValue>(() => {
    const studioEnvironments = listStudioWorldEnvironments(state.studioDepartmentId);
    const industryEnvironments = listIndustryPackEnvironments(state.industryPackId);
    return {
      state,
      breadcrumb: buildGenerationPipelineBreadcrumb({ state, variantLabel: activeVariantLabel }),
      canonicalDepartmentId: pipelineCanonicalDepartmentId(state),
      programActionsProfile: pipelineProgramActionsProfile(state),
      studioEnvironments,
      industryEnvironments,
      industryPacks: listIndustryPackSelectorEntries(),
      setProgram,
      setStudioDepartment,
      setIndustryPack,
      setEnvironment,
    };
  }, [state, activeVariantLabel, setProgram, setStudioDepartment, setIndustryPack, setEnvironment]);

  return <ProgramContext.Provider value={value}>{children}</ProgramContext.Provider>;
}

export function useProgramContext(): ProgramContextValue {
  const ctx = useContext(ProgramContext);
  if (!ctx) {
    throw new Error('useProgramContext must be used within ProgramContextProvider');
  }
  return ctx;
}

/** GenerationPipelineController — alias for program context hook (architecture sprint API). */
export function useGenerationPipelineController(): ProgramContextValue {
  return useProgramContext();
}
