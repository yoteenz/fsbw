import type { StudioServiceStub } from '../types';
import {
  CREATIVE_DNA_BENCHMARK_OUTPUT,
  CREATIVE_DNA_LOCKED_SPECIFICATIONS,
  CREATIVE_DNA_V1_0,
  CREATIVE_DNA_VERSION_HISTORY,
} from '../../../studio-os/product-photography';
import { getCreativeDnaGenerationPackageForUnit } from '../../../hooks/useAdminStudioPhotographyCreativeDnaState';

export type PhotographyCreativeDnaSnapshot = {
  version: string;
  lockStatus: string;
  approvedPromptVersion: string;
  displayBustVersion: string;
  benchmarkUnit: string;
  lockedSpecCount: number;
  futureVersionSlots: readonly string[];
  generationPackageReady: boolean;
};

export function getPhotographyCreativeDnaSnapshot(): PhotographyCreativeDnaSnapshot {
  const pkg = getCreativeDnaGenerationPackageForUnit(CREATIVE_DNA_BENCHMARK_OUTPUT.unitSlug);
  return {
    version: CREATIVE_DNA_V1_0.version,
    lockStatus: CREATIVE_DNA_V1_0.lockStatus,
    approvedPromptVersion: CREATIVE_DNA_V1_0.approvedPrompt.promptVersion,
    displayBustVersion: CREATIVE_DNA_V1_0.displayBust.version,
    benchmarkUnit: CREATIVE_DNA_BENCHMARK_OUTPUT.unit,
    lockedSpecCount: CREATIVE_DNA_LOCKED_SPECIFICATIONS.length,
    futureVersionSlots: CREATIVE_DNA_VERSION_HISTORY.map((v) => v.version),
    generationPackageReady: Boolean(pkg.approvedPromptBody && pkg.displayBustFrontSrc),
  };
}

export const photographyCreativeDnaStudioService: StudioServiceStub & {
  getSnapshot(): PhotographyCreativeDnaSnapshot;
} = {
  id: 'photography-creative-dna',
  label: 'PHOTOGRAPHY BIBLE · CREATIVE DNA',
  phase: 2,
  enabled: true,
  description:
    'CREATIVE DNA v1.0 — permanent Frontal Slayer product photography standard · approved prompt · Display Bust · benchmark · generation package',
  getSnapshot: getPhotographyCreativeDnaSnapshot,
};
