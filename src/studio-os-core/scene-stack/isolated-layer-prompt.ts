import type { SceneStackLayerId } from './types';
import {
  getIsolatedLayerContract,
  ISOLATED_LAYER_CONTRACT_VERSION,
  isIsolatedObjectLayer,
  type IsolatedLayerGenerationMode,
} from './isolated-layer-contract';

const ISOLATED_NEGATIVE_BASE = [
  'full room',
  'interior',
  'environment',
  'architectural render',
  'showroom',
  'lobby',
  'office',
  'hallway',
  'ceiling',
  'floor',
  'wall',
  'walls',
  'window',
  'windows',
  'room lighting',
  'scene background',
  'complete composition',
  'photorealistic room',
  'cinematic interior',
  'wide shot',
  'full frame background',
  'entire scene',
  'environment shell',
  're-encoded shell',
  'baked composite',
  'dashboard UI',
  'text overlay',
  'people',
  'duplicate objects',
].join(' ');

export function buildIsolatedLayerPromptClauses(input: {
  layerId: SceneStackLayerId;
  displayName: string;
  stationName: string;
  objectDescription: string;
  isolationAttempt?: number;
}): { isolationClause: string; outputClause: string; negativeClause: string; generationMode: IsolatedLayerGenerationMode } {
  const contract = getIsolatedLayerContract(input.layerId);
  const attempt = input.isolationAttempt ?? 0;
  const strengthen =
    attempt > 0
      ? ' REGENERATION PASS — reject any room background. Deliver ONLY the cut-out object on fully transparent alpha. Zero architecture.'
      : '';

  const modeLabel =
    contract.generationMode === 'isolated-single-object'
      ? 'ISOLATED SINGLE OBJECT'
      : contract.generationMode === 'isolated-object-group'
        ? 'ISOLATED OBJECT GROUP'
        : 'ISOLATED OVERLAY';

  const isolationClause = [
    `SCENE STACK™ ${modeLabel} — ${input.displayName.toUpperCase()}.`,
    `STATION: ${input.stationName}.`,
    `GENERATE ONLY: ${input.objectDescription}.`,
    'TRANSPARENT BACKGROUND REQUIRED — alpha channel outside subject.',
    'NO room. NO walls. NO floor. NO ceiling. NO windows. NO architecture. NO environment. NO scene recreation.',
    'NO background. NO lighting environment. NO shadow plane unless minimal contact shadow under object.',
    'NO camera frame recreation. NO wide interior shot. NO photorealistic room.',
    'Lighting-neutral object presentation. Compositing-ready cut-out. Scene Stack will mount this plate.',
    strengthen,
  ]
    .filter(Boolean)
    .join(' ');

  const outputClause =
    contract.generationMode === 'full-scene-shell'
      ? 'OUTPUT: Full environment shell plate — architecture only. ONLY layer permitted as full-scene render.'
      : 'OUTPUT: Isolated PNG asset plate with transparent alpha outside subjects — NOT a scene, NOT a room photograph.';

  const negativeClause = `${ISOLATED_NEGATIVE_BASE} ${contract.forbiddenContent.join(' ')}`;

  return {
    isolationClause,
    outputClause,
    negativeClause,
    generationMode: contract.generationMode,
  };
}

export function resolveIsolatedOutputFormat(layerId: SceneStackLayerId, manifestDefault: 'png' | 'webp'): 'png' | 'webp' {
  if (isIsolatedObjectLayer(layerId)) return 'png';
  const contract = getIsolatedLayerContract(layerId);
  return contract.expectedAlpha ? 'png' : manifestDefault;
}

export function isolatedPromptContractVersion(): string {
  return `${ISOLATED_LAYER_CONTRACT_VERSION}`;
}
