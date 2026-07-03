import { studioServiceNotConnected, type StudioServiceStub, type StudioServiceResult } from '../types';
import {
  buildCreativeDirectorPackage,
  type CreativeDirectorSession,
} from './index';

export type CreativeDirectorAssembleInput = {
  session: CreativeDirectorSession;
};

export type CreativeDirectorAssembleOutput = ReturnType<typeof buildCreativeDirectorPackage>;

export const creativeDirectorStudioService: StudioServiceStub & {
  assemble(input: CreativeDirectorAssembleInput): Promise<StudioServiceResult<CreativeDirectorAssembleOutput>>;
  validateBeforeGeneration(
    input: CreativeDirectorAssembleInput
  ): Promise<StudioServiceResult<{ canGenerate: boolean; package: CreativeDirectorAssembleOutput }>>;
} = {
  id: 'creative-director',
  label: 'CREATIVE DIRECTOR',
  phase: 2,
  enabled: false,
  description:
    'INTERNAL DECISION ENGINE — BRAND · SHOW · CTA · PROMPT ASSEMBLY · QUALITY GATE — NO AI PROVIDER BYPASS',
  async assemble(input) {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Creative Director requires browser session context.');
    }
    return {
      ok: true,
      data: buildCreativeDirectorPackage(input.session),
    };
  },
  async validateBeforeGeneration(input) {
    if (typeof window === 'undefined') {
      return studioServiceNotConnected('Creative Director validation requires browser context.');
    }
    const pkg = buildCreativeDirectorPackage(input.session);
    return {
      ok: true,
      data: {
        canGenerate: pkg.qualityGate.canGenerate,
        package: pkg,
      },
    };
  },
};
