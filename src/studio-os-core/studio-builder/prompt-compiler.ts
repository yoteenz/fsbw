import type { DepartmentPackage } from '../department-package';
import { requireDepartmentPackage } from '../department-package';
import { resolveCompanyGenomeSnapshot } from './genome-context';
import { resolveActiveProjectGenome } from '../project-genome';
import type { CompiledGenerationPrompt } from './types';
import { applyDirectorFeedbackToPrompt } from './director-feedback';

const PROMPT_VERSION = 'studio-builder.v1';

function injectGenomeSlots(
  template: string,
  genome: ReturnType<typeof resolveCompanyGenomeSnapshot>
): string {
  return template
    .replace(/\{\{genome\.materialLanguage\}\}/gi, genome.materialLanguage)
    .replace(/\{\{genome\.editorialDirection\}\}/gi, genome.editorialDirection)
    .replace(/\{\{genome\.lightingStyle\}\}/gi, genome.lightingStyle)
    .replace(/\{\{genome\.photographyDirection\}\}/gi, genome.photographyDirection)
    .replace(/\{\{genome\.brandDNA\}\}/gi, genome.brandDNA)
    .replace(/\{\{genome\.voice\}\}/gi, genome.voice)
    .replace(/\{\{genome\.values\}\}/gi, genome.values);
}

export function compileDepartmentGenerationPrompt(input: {
  departmentId: string;
  productionGroupId: string;
  workspaceId?: string;
  projectId?: string;
  directorFeedback?: string;
  approvedStageContext?: string;
}): CompiledGenerationPrompt {
  const pkg = requireDepartmentPackage(input.departmentId);
  const group = pkg.productionGroups.groups[input.productionGroupId];
  if (!group) {
    throw new Error(`Production group not found: ${input.productionGroupId}`);
  }

  const company = resolveCompanyGenomeSnapshot(input.workspaceId);
  const project = input.projectId
    ? resolveActiveProjectGenome(input.departmentId)
    : resolveActiveProjectGenome(input.departmentId);
  const directorsNotes = project.creativeDirectionNotes?.slice(0, 3).join(' · ') ?? '';
  const roomModifier =
    pkg.roomDna.promptModifiers[group.promptTemplate.roomDnaModifierKey] ?? '';

  const feeling = pkg.roomDna.defaultFeeling.join(', ');
  const forbidden = pkg.roomDna.forbiddenFeeling.join(', ');

  const primary = injectGenomeSlots(group.promptTemplate.primary, company);
  let prompt = [
    `${pkg.definition.displayName.toUpperCase()} — ${group.displayName.toUpperCase()}.`,
    `DEPARTMENT: ${pkg.definition.id} · PACKAGE: ${pkg.packageId}.`,
    `PROJECT: ${project.name} · ${project.vision}`,
    `ROOM DNA: ${feeling}. Avoid: ${forbidden}.`,
    roomModifier,
    primary,
    input.approvedStageContext ? `APPROVED CONTEXT: ${input.approvedStageContext}` : '',
    directorsNotes ? `DIRECTOR'S NOTES: ${directorsNotes}` : '',
    `Company ${company.companyName}: ${company.editorialDirection}.`,
    `North star: ${project.northStar}.`,
    `OUTPUT: ${group.generation.aspectRatio} · ${group.generation.outputFormat.toUpperCase()} · photoreal luxury · no UI chrome.`,
    `NEGATIVE: ${group.promptTemplate.negative}`,
  ]
    .filter(Boolean)
    .join(' ');

  if (input.directorFeedback?.trim()) {
    prompt = applyDirectorFeedbackToPrompt(prompt, input.directorFeedback);
  }

  return {
    prompt,
    negativePrompt: group.promptTemplate.negative,
    promptVersion: PROMPT_VERSION,
    modelPresetId: group.generation.modelPresetId,
    aspectRatio: group.generation.aspectRatio,
    outputFormat: group.generation.outputFormat,
    heroAssetId: group.heroAssetId,
    productionGroupId: input.productionGroupId,
    genomeSummary: `${company.companyName} · ${project.name}`,
  };
}

export function listProductionGroups(pkg: DepartmentPackage): Array<{
  id: string;
  displayName: string;
  heroAssetId: string;
}> {
  return Object.entries(pkg.productionGroups.groups).map(([id, g]) => ({
    id,
    displayName: g.displayName,
    heroAssetId: g.heroAssetId,
  }));
}
