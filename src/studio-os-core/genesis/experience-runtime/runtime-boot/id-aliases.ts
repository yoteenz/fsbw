import { XER_DEFAULT_RUNTIME_CONTRACT } from './default-contract';

/** Map legacy registry ids → canonical public ids for lookup. */
const DEPARTMENT_ALIASES: Record<string, string> = {
  executive: 'executive',
  headquarters: 'executive',
  knowledge: 'knowledge',
  creative: 'creative',
  command: 'command',
  'command-center': 'command',
  ai: 'ai',
  operations: 'ai',
  'artificial-intelligence': 'ai',
};

const SCENE_ALIASES: Record<string, string> = {
  'executive-headquarters': 'executive-headquarters',
  'hq-master-demonstration-v1': 'executive-headquarters',
  'institute-of-knowledge': 'institute-of-knowledge',
  knowledge: 'institute-of-knowledge',
  'command-center': 'command-center',
  'content-engine': 'content-engine',
  creative: 'content-engine',
  'orb-room': 'orb-room',
  orb: 'orb-room',
};

const BRAND_ALIASES: Record<string, string> = {
  'studio-os': 'studio-os',
  'frontal-slayer': 'frontal-slayer',
  ndx: 'ndx',
};

export function normalizeBrandId(brandId?: string): string {
  if (!brandId) return XER_DEFAULT_RUNTIME_CONTRACT.brandId;
  return BRAND_ALIASES[brandId] ?? brandId;
}

export function normalizeDepartmentId(departmentId?: string): string {
  if (!departmentId) return XER_DEFAULT_RUNTIME_CONTRACT.departmentId;
  const canonical = departmentId.trim();
  return DEPARTMENT_ALIASES[canonical] ?? canonical;
}

export function toPublicDepartmentId(registryDepartmentId: string): string {
  return registryDepartmentId;
}

export function normalizeSceneId(sceneId?: string): string {
  if (!sceneId) return XER_DEFAULT_RUNTIME_CONTRACT.sceneId;
  const canonical = sceneId.trim();
  return SCENE_ALIASES[canonical] ?? canonical;
}

export function normalizeTemplateId(templateId?: string): string {
  return templateId?.trim() || XER_DEFAULT_RUNTIME_CONTRACT.templateId;
}
