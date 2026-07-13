import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';
import { buildCanonicalDepartmentConstructionPlan } from '../../canonical-studio-world/canonical-department-construction-plan';
import { resolveStyleBible, buildStyleBiblePromptSection } from '../style-bible/registry';
import { buildCommandDockPromptSection } from '../command-dock/command-dock-system';
import { buildWorkbenchPromptSection, mapDepartmentToWorkbenchProfile } from '../workbench/workbench-system';
import { buildDesignTokenPromptSection } from '../design-tokens/export';
import { validateWorldCohesion } from '../validators/world-cohesion-validator';

export const EXPERIENCE_LAB_STYLE_GUARDIAN_VERSION = 'experience-lab-style-guardian.v1' as const;

export type ExperienceLabStyleInjection = {
  guardianVersion: typeof EXPERIENCE_LAB_STYLE_GUARDIAN_VERSION;
  departmentId: CanonicalMainDepartmentId;
  styleBibleVersion: string;
  styleBibleRevision: number;
  commandDockInjected: true;
  workbenchInjected: true;
  panelGeometryInjected: true;
  typographyPlaceholdersInjected: true;
  lightingPhilosophyInjected: true;
  materialPhilosophyInjected: true;
  navigationInjected: true;
  promptSections: string[];
  cohesionOk: boolean;
};

/**
 * Experience Lab is the guardian of the Style Bible.
 * Every canonical department inherits universal world language before department-specific architecture.
 */
export function injectStyleBibleForCanonicalDepartment(
  departmentId: CanonicalMainDepartmentId
): ExperienceLabStyleInjection {
  const bible = resolveStyleBible();
  const profile = mapDepartmentToWorkbenchProfile(departmentId);

  const promptSections = [
    buildStyleBiblePromptSection(),
    buildCommandDockPromptSection('desktop'),
    buildWorkbenchPromptSection(profile),
    buildDesignTokenPromptSection(),
  ];

  const built = buildCanonicalDepartmentConstructionPlan(departmentId, 'landscape');
  const cohesion = built.ok
    ? validateWorldCohesion({ plan: built.plan })
    : { ok: false as const, code: 'WORLD_STYLE_VIOLATION' as const, violations: [] };

  return {
    guardianVersion: EXPERIENCE_LAB_STYLE_GUARDIAN_VERSION,
    departmentId,
    styleBibleVersion: bible.authority.bibleVersion,
    styleBibleRevision: bible.authority.bibleRevision,
    commandDockInjected: true,
    workbenchInjected: true,
    panelGeometryInjected: true,
    typographyPlaceholdersInjected: true,
    lightingPhilosophyInjected: true,
    materialPhilosophyInjected: true,
    navigationInjected: true,
    promptSections,
    cohesionOk: cohesion.ok,
  };
}

export function assertExperienceLabGuardsStyleBible(): boolean {
  const injection = injectStyleBibleForCanonicalDepartment('experience-lab');
  return injection.cohesionOk && injection.promptSections.length >= 4;
}
