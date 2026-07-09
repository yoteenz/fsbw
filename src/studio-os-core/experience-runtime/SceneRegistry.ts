export type SceneRegistration = {
  sceneId: string;
  displayName: string;
  templateId: string;
  defaultDepartmentSlug: string;
  description: string;
};

const SCENE_REGISTRY: SceneRegistration[] = [
  {
    sceneId: 'executive-headquarters',
    displayName: 'Executive Headquarters',
    templateId: 'hq-master-scene-v1',
    defaultDepartmentSlug: 'executive',
    description:
      'Flagship founder headquarters scene — assembled from Headquarters Master Scene Template™ metadata.',
  },
];

export function listSceneRegistrations(): SceneRegistration[] {
  return [...SCENE_REGISTRY];
}

export function getSceneRegistration(sceneId: string): SceneRegistration | undefined {
  return SCENE_REGISTRY.find((s) => s.sceneId === sceneId);
}

export function registerSceneRegistration(scene: SceneRegistration): void {
  const idx = SCENE_REGISTRY.findIndex((s) => s.sceneId === scene.sceneId);
  if (idx >= 0) SCENE_REGISTRY[idx] = scene;
  else SCENE_REGISTRY.push(scene);
}
