import { requireDepartmentPackage } from '../department-package';
import { resolveCompanyGenomeSnapshot } from '../studio-builder/genome-context';
import { resolveActiveProjectGenome } from '../project-genome';
import { getSceneGenesisStation, requireSceneGenesisManifest } from './station-manifest';
import type { CompiledSceneGenesisPrompt } from './types';
import { SCENE_GENESIS_PROMPT_VERSION } from './types';

export function compileSceneGenesisPrompt(input: {
  departmentId: string;
  stationId: string;
  workspaceId?: string;
  projectId?: string;
}): CompiledSceneGenesisPrompt {
  const pkg = requireDepartmentPackage(input.departmentId);
  const manifest = requireSceneGenesisManifest(input.departmentId);
  const station = getSceneGenesisStation(input.departmentId, input.stationId);
  if (!station) throw new Error(`Scene Genesis station not found: ${input.stationId}`);

  const group = pkg.productionGroups.groups[station.productionGroupId];
  const company = resolveCompanyGenomeSnapshot(input.workspaceId);
  const project = resolveActiveProjectGenome(input.departmentId);

  const feeling = pkg.roomDna.defaultFeeling.join(', ');
  const forbidden = pkg.roomDna.forbiddenFeeling.join(', ');
  const roomModifier = pkg.roomDna.promptModifiers[group?.promptTemplate.roomDnaModifierKey ?? 'environment'] ?? '';

  const prompt = [
    `GOLDEN BUILD™ SCENE GENESIS™ — ${station.displayName.toUpperCase()}.`,
    `DEPARTMENT: ${pkg.definition.displayName} · STATION: ${station.stationId}.`,
    `PROJECT: ${project.name} · ${project.vision}.`,
    `ROOM DNA: ${feeling}. Avoid: ${forbidden}.`,
    roomModifier,
    station.prompt.primary,
    `Company ${company.companyName}: ${company.editorialDirection}. Material: ${company.materialLanguage}. Lighting: ${company.lightingStyle}.`,
    `North star: ${project.northStar}. Tone: ${project.tone.join(', ')}.`,
    `OUTPUT: Mobile portrait ${manifest.aspectRatio} · photoreal luxury cinematic plate · full environment · no UI chrome · no text overlays.`,
    `NEGATIVE: ${station.prompt.negative}${group ? ` · ${group.promptTemplate.negative}` : ''}`,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    prompt,
    negativePrompt: station.prompt.negative,
    aspectRatio: manifest.aspectRatio,
    outputFormat: manifest.outputFormat,
    productionGroupId: station.productionGroupId,
    heroAssetId: station.heroAssetId,
    stationId: station.stationId,
    promptVersion: SCENE_GENESIS_PROMPT_VERSION,
  };
}
