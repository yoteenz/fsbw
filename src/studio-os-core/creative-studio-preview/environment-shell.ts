import { compileCreativeStudioPreview } from './compiler';
import { resolveEnvironmentSceneProfile } from './environment-scene-profiles';
import { resolveCreativePreviewRenderBinding } from './render-bindings';
import type { CreativePreviewCompanyId } from './types';
import { SCENE_STACK_LAYER_ORDER, type SceneStackLayerId } from '../scene-stack/types';
import { SCENE_STACK_PROMPT_VERSION, SCENE_ASSEMBLY_LAW_VERSION } from '../scene-stack/types';

/** Executable environment shell recipe — required by World Compiler load-shell. */
export type EnvironmentShellRecipe = {
  shellId: string;
  previewSessionId: string;
  companyId: CreativePreviewCompanyId;
  conceptId: 'a' | 'b' | 'c';
  departmentId: string;
  stationId: string;
  projectId: string;
  worldIdentity: string;
  aspectRatio: '9:16';
  camera: {
    verticalFovDeg: number;
    position: string;
    perspectiveNotes: string;
  };
  layerOrder: SceneStackLayerId[];
  mountingAnchors: Array<{ id: string; label: string; x: number; y: number; depth: number }>;
  renderTarget: { width: number; height: number; format: 'webp' | 'png' };
  environmentBounds: { widthUnits: number; heightUnits: number; depthUnits: number };
  dependencyRefs: {
    previewSpecHash: string;
    blueprintId: string;
    sceneProfileVariant: string;
    architectureArchetype: string;
  };
  shellPrompt: {
    primary: string;
    negative: string;
    heroAssetId: string;
    productionGroupId: string;
    promptVersion: string;
  };
  interiorArchitecture: string;
  materialSystem: string[];
  lightingLanguage: string;
};

export type ValidationEnvironmentShell = EnvironmentShellRecipe & {
  publicUrl: string;
  generatedAt: string;
  expiresAt: string;
  registryScope: 'ephemeral-validation';
  generationMethod: 'studio-builder' | 'preview-canvas';
  canonicalStatus: 'non_canonical';
};

function hashPreviewSpec(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return `psh-${Math.abs(h).toString(36)}`;
}

export function buildEnvironmentShellRecipe(input: {
  companyId: CreativePreviewCompanyId;
  conceptId: 'a' | 'b' | 'c';
  projectId: string;
  previewSessionId: string;
}): EnvironmentShellRecipe {
  const preview = compileCreativeStudioPreview(input.companyId);
  const concept =
    preview.concepts.find((c) => c.conceptId === input.conceptId) ?? preview.concepts[0]!;
  const spec = concept.specification;
  const binding = resolveCreativePreviewRenderBinding(input.companyId, input.conceptId);
  const scene = resolveEnvironmentSceneProfile(input.companyId, input.conceptId);

  const specDigest = hashPreviewSpec(
    JSON.stringify({
      companyId: input.companyId,
      conceptId: input.conceptId,
      spec,
      scene: scene.architecturalKeywords,
    })
  );

  const shellId = `xelab-shell-${input.companyId}-${input.conceptId}-${input.previewSessionId}`;

  const primary = [
    `EXPERIENCE LAB VALIDATION SHELL — ${binding.stationLabel}`,
    scene.industryTarget,
    spec.interiorArchitecture,
    spec.designPhilosophy,
    `Materials: ${spec.materialSystem.join(', ')}`,
    `Lighting: ${spec.lightingLanguage}`,
    `Atmosphere: ${scene.atmosphere}`,
    `Architecture keywords: ${scene.architecturalKeywords.join(' · ')}`,
    'LAYER PASS 01 ENVIRONMENT SHELL ONLY — architecture walls ceiling floor structure proportions.',
    'NO furniture NO hero objects NO lighting effects NO atmosphere NO people NO UI NO logos NO text.',
  ].join(' ');

  const negative =
    'dashboard UI cards sidebar SaaS wireframe floorplan schematic boxes placeholder rectangles logos text labels complete single scene full room one-shot render with furniture';

  return {
    shellId,
    previewSessionId: input.previewSessionId,
    companyId: input.companyId,
    conceptId: input.conceptId,
    departmentId: binding.departmentId,
    stationId: binding.stationId,
    projectId: input.projectId,
    worldIdentity: `${preview.companyLabel} · ${binding.pipelineTarget}`,
    aspectRatio: '9:16',
    camera: {
      verticalFovDeg: 52,
      position: 'center-axial-entry',
      perspectiveNotes: spec.spatialHierarchy,
    },
    layerOrder: [...SCENE_STACK_LAYER_ORDER],
    mountingAnchors: [
      { id: 'floor-anchor', label: 'Floor plane', x: 0.5, y: 0.88, depth: 0.1 },
      { id: 'focus-anchor', label: 'Hero focus', x: 0.5, y: 0.42, depth: 0.55 },
      { id: 'ceiling-anchor', label: 'Vault / canopy', x: 0.5, y: 0.12, depth: 0.9 },
    ],
    renderTarget: { width: 576, height: 1024, format: 'webp' },
    environmentBounds: { widthUnits: 24, heightUnits: 14, depthUnits: 32 },
    dependencyRefs: {
      previewSpecHash: specDigest,
      blueprintId: `xelab-blueprint-${input.companyId}-${input.conceptId}`,
      sceneProfileVariant: scene.variant,
      architectureArchetype: preview.architectureArchetype,
    },
    shellPrompt: {
      primary,
      negative,
      heroAssetId: `xelab-env-shell-${input.companyId}-${input.conceptId}`,
      productionGroupId: `xelab-validation-${binding.departmentId}-${binding.stationId}-environment-shell`,
      promptVersion: SCENE_STACK_PROMPT_VERSION,
    },
    interiorArchitecture: spec.interiorArchitecture,
    materialSystem: spec.materialSystem,
    lightingLanguage: spec.lightingLanguage,
  };
}

export function recipeToLayerRecord(
  recipe: EnvironmentShellRecipe,
  shell: Pick<ValidationEnvironmentShell, 'publicUrl' | 'generatedAt' | 'generationMethod'>
) {
  return {
    departmentId: recipe.departmentId,
    projectId: recipe.projectId,
    stationId: recipe.stationId,
    layerId: 'environment-shell' as const,
    version: 1,
    status: 'draft_ready' as const,
    publicUrl: shell.publicUrl,
    generatedAt: shell.generatedAt,
    promptVersion: recipe.shellPrompt.promptVersion,
    productionGroupId: recipe.shellPrompt.productionGroupId,
    heroAssetId: recipe.shellPrompt.heroAssetId,
    blueprintId: recipe.dependencyRefs.blueprintId,
    assemblyLawVersion: SCENE_ASSEMBLY_LAW_VERSION,
    qualityStatus: 'validated' as const,
    qualityIssues: [] as string[],
    canonicalStatus: 'non_canonical' as const,
  };
}
