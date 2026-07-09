import {
  ensureStudioOsDesignDnaSubsystem,
  getSceneTemplateEngine,
  resolveDesignDnaSceneProfile,
} from '../genesis/studio-os-design-dna/engine';
import { getBrandRegistration } from './BrandRegistry';
import { DESIGN_DNA_VERSION_MAP, PLAYGROUND_LAYER_SLOTS } from './constants';
import { getSceneRegistration } from './SceneRegistry';
import type {
  DepartmentRegistration,
  ExperienceRuntimeInput,
  ResolvedExperienceRuntime,
  ResolvedLayerSlot,
} from './types';

const DEPARTMENT_REGISTRY: DepartmentRegistration[] = [
  {
    departmentSlug: 'executive',
    displayName: 'Executive',
    departmentId: 'headquarters',
  },
  {
    departmentSlug: 'headquarters',
    displayName: 'Headquarters',
    departmentId: 'headquarters',
  },
  {
    departmentSlug: 'executive-leadership',
    displayName: 'Executive Leadership',
    departmentId: 'executive-leadership',
  },
];

export function listDepartmentRegistrations(): DepartmentRegistration[] {
  return [...DEPARTMENT_REGISTRY];
}

export function getDepartmentRegistration(departmentSlug: string): DepartmentRegistration | undefined {
  return DEPARTMENT_REGISTRY.find((d) => d.departmentSlug === departmentSlug);
}

function resolveLayerSlots(
  templateLayers: ReturnType<typeof getSceneTemplateEngine>['layers']
): {
  activeLayers: ResolvedLayerSlot[];
  missingLayers: ResolvedLayerSlot[];
} {
  const activeLayers: ResolvedLayerSlot[] = [];
  const missingLayers: ResolvedLayerSlot[] = [];

  for (const slot of PLAYGROUND_LAYER_SLOTS) {
    const spec = templateLayers.find((l) => l.layerId === slot.templateLayerId);

    const resolved: ResolvedLayerSlot = {
      ...slot,
      present: Boolean(spec),
      zIndex: spec?.zIndex ?? -1,
      required: spec?.required ?? false,
      description: spec?.description ?? 'Layer not registered in scene template metadata.',
    };

    if (resolved.present) activeLayers.push(resolved);
    else missingLayers.push(resolved);
  }

  return { activeLayers, missingLayers };
}

/**
 * DNAResolver™ — wraps Design DNA scene profile resolution with brand/scene/template contract validation.
 */
export function resolveExperienceRuntime(input: ExperienceRuntimeInput): ResolvedExperienceRuntime {
  ensureStudioOsDesignDnaSubsystem();

  const warnings: string[] = [];
  const brand = getBrandRegistration(input.brandId);
  if (!brand) warnings.push(`Unknown brand "${input.brandId}".`);

  const scene = getSceneRegistration(input.sceneId);
  if (!scene) warnings.push(`Unknown scene "${input.sceneId}".`);

  const department = getDepartmentRegistration(input.departmentSlug);
  if (!department) warnings.push(`Unknown department slug "${input.departmentSlug}".`);

  const template = getSceneTemplateEngine();
  if (scene && template.templateId !== scene.templateId) {
    warnings.push(
      `Scene "${scene.sceneId}" expects template "${scene.templateId}" but store has "${template.templateId}".`
    );
  }
  if (input.templateId !== template.templateId) {
    warnings.push(
      `Requested template "${input.templateId}" does not match active template "${template.templateId}".`
    );
  }

  const semver = DESIGN_DNA_VERSION_MAP[input.designDnaVersion];
  if (!semver) {
    warnings.push(`Unknown designDNA version shorthand "${input.designDnaVersion}".`);
  } else if (brand && semver !== brand.designDnaVersion) {
    warnings.push(
      `designDNA ${input.designDnaVersion} (${semver}) does not match brand profile version ${brand.designDnaVersion}.`
    );
  }

  const departmentId = department?.departmentId ?? 'headquarters';
  const dnaProfile = resolveDesignDnaSceneProfile(departmentId);

  const { activeLayers, missingLayers } = resolveLayerSlots(template.layers);

  if (missingLayers.length > 0) {
    warnings.push(`${missingLayers.length} playground layer slot(s) missing from template metadata.`);
  }

  return {
    input,
    brand: brand ?? {
      brandId: input.brandId,
      displayName: input.brandId,
      designDnaStoreKey: 'studioOsDesignDna',
      designDnaVersion: semver ?? 'unknown',
      designDnaOfficialName: 'Unknown Brand DNA',
    },
    department: department ?? {
      departmentSlug: input.departmentSlug,
      displayName: input.departmentSlug,
      departmentId,
    },
    scene: scene ?? {
      sceneId: input.sceneId,
      displayName: input.sceneId,
      templateId: input.templateId,
      defaultDepartmentSlug: input.departmentSlug,
      description: 'Unregistered scene.',
    },
    template,
    dnaProfile,
    designDnaVersionResolved: semver ?? input.designDnaVersion,
    activeLayers,
    missingLayers,
    warnings,
  };
}

/** Thin wrapper — direct access to Design DNA scene profile for a department theme id */
export function resolveDesignDnaForDepartment(departmentId: string) {
  ensureStudioOsDesignDnaSubsystem();
  return resolveDesignDnaSceneProfile(departmentId);
}
