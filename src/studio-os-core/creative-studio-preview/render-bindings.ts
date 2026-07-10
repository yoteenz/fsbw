import type { CreativePreviewCompanyId } from './types';

/** Maps Experience Lab preview targets to Creative Direction Studio Scene Stack stations. */
export type CreativePreviewRenderBinding = {
  departmentId: string;
  stationId: string;
  stationLabel: string;
  /** Human-readable pipeline target for validation UI */
  pipelineTarget: string;
};

type BindingMap = Record<
  CreativePreviewCompanyId,
  Record<'a' | 'b' | 'c', CreativePreviewRenderBinding>
>;

/**
 * Experience Lab invokes the same World Compiler™ stations as Creative Direction Studio —
 * never placeholder layouts.
 */
export const CREATIVE_PREVIEW_RENDER_BINDINGS: BindingMap = {
  'studio-os': {
    a: {
      departmentId: 'studio-command-center',
      stationId: 'executive-atrium',
      stationLabel: 'Executive Atrium™',
      pipelineTarget: 'Executive Headquarters — production environment',
    },
    b: {
      departmentId: 'studio-command-center',
      stationId: 'threshold',
      stationLabel: 'Command Threshold™',
      pipelineTarget: 'Executive Headquarters — alternative arrival sequence',
    },
    c: {
      departmentId: 'studio-world-atlas',
      stationId: 'holographic-table',
      stationLabel: 'Studio World Atlas™',
      pipelineTarget: 'Knowledge observatory — experimental direction',
    },
  },
  'frontal-slayer': {
    a: {
      departmentId: 'creative-direction',
      stationId: 'arrival',
      stationLabel: 'Arrival Zone™',
      pipelineTarget: 'Luxury beauty flagship — concierge production',
    },
    b: {
      departmentId: 'creative-direction',
      stationId: 'mood-wall',
      stationLabel: 'Living Mood Wall™',
      pipelineTarget: 'Luxury beauty flagship — couture gallery alternative',
    },
    c: {
      departmentId: 'creative-direction',
      stationId: 'story-table',
      stationLabel: 'Story Table™',
      pipelineTarget: 'Luxury beauty flagship — experimental salon',
    },
  },
  ndx: {
    a: {
      departmentId: 'creative-direction',
      stationId: 'pipeline-board',
      stationLabel: 'Creative Pipeline™',
      pipelineTarget: 'Editorial media headquarters — live command',
    },
    b: {
      departmentId: 'creative-direction',
      stationId: 'reference-library',
      stationLabel: 'Reference Library™',
      pipelineTarget: 'Editorial media headquarters — archive alternative',
    },
    c: {
      departmentId: 'studio-warehouse',
      stationId: 'animation-archive',
      stationLabel: 'Animation Archive™',
      pipelineTarget: 'Editorial media headquarters — signal lab experimental',
    },
  },
};

export function resolveCreativePreviewRenderBinding(
  companyId: CreativePreviewCompanyId,
  conceptId: 'a' | 'b' | 'c'
): CreativePreviewRenderBinding {
  return CREATIVE_PREVIEW_RENDER_BINDINGS[companyId][conceptId];
}
