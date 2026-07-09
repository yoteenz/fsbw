import type { DdnaSceneProfile, DdnaSceneTemplate } from '../genesis/studio-os-design-dna/types';
import type { DdnaSceneLayerId } from '../genesis/studio-os-design-dna/constants';
import type { BrandRegistration } from './BrandRegistry';
import type { SceneRegistration } from './SceneRegistry';

export type ExperienceRuntimeInput = {
  brandId: string;
  departmentSlug: string;
  sceneId: string;
  templateId: string;
  designDnaVersion: string;
};

export type DepartmentRegistration = {
  departmentSlug: string;
  displayName: string;
  /** Design DNA department theme id */
  departmentId: string;
};

export type PlaygroundLayerSlot = {
  slotId: string;
  templateLayerId: DdnaSceneLayerId;
  label: string;
};

export type ResolvedLayerSlot = PlaygroundLayerSlot & {
  present: boolean;
  zIndex: number;
  required: boolean;
  description: string;
};

export type ResolvedExperienceRuntime = {
  input: ExperienceRuntimeInput;
  brand: BrandRegistration;
  department: DepartmentRegistration;
  scene: SceneRegistration;
  template: DdnaSceneTemplate;
  dnaProfile: DdnaSceneProfile;
  designDnaVersionResolved: string;
  activeLayers: ResolvedLayerSlot[];
  missingLayers: ResolvedLayerSlot[];
  warnings: string[];
};
