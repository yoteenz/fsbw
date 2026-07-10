import type { WorldCompileOptions } from '../scene-stack/world-compiler/compile-pipeline';
import type {
  SceneGraph,
  SceneStackCompositeStatus,
  SceneStackLayerId,
  SceneStackLayerView,
  WorldCompilationReport,
} from '../scene-stack';
import type { SceneStackPipelineProgress } from '../../hooks/useSceneStack';
import type { WorldCompileResult } from '../scene-stack/world-compiler/compile-pipeline';

/** Scene stack operations owned by Experience Lab — registered by the runtime provider. */
export type SceneStackDriver = {
  departmentId: string;
  projectId: string;
  ensureStation: (stationId: string, options?: WorldCompileOptions) => Promise<void>;
  compileStation: (stationId: string, options?: WorldCompileOptions) => Promise<WorldCompileResult>;
  regenerateLayer: (stationId: string, layerId: SceneStackLayerId) => Promise<boolean>;
  getLayerViews: (stationId: string) => SceneStackLayerView[];
  getCompositeStatus: (stationId: string) => SceneStackCompositeStatus;
  getStationPipelineProgress: (stationId: string) => SceneStackPipelineProgress;
  getStationSceneGraph: (stationId: string) => SceneGraph;
  getStationCompileReport: (stationId: string) => WorldCompilationReport | null;
  isStationPipelineActive: (stationId: string) => boolean;
  bump: () => void;
};

export function sceneStackDriverKey(departmentId: string, projectId: string): string {
  return `${departmentId}:${projectId}`;
}

const drivers = new Map<string, SceneStackDriver>();

export function registerSceneStackDriver(driver: SceneStackDriver): () => void {
  const key = sceneStackDriverKey(driver.departmentId, driver.projectId);
  drivers.set(key, driver);
  return () => {
    const current = drivers.get(key);
    if (current === driver) drivers.delete(key);
  };
}

export function getSceneStackDriver(departmentId: string, projectId: string): SceneStackDriver | null {
  return drivers.get(sceneStackDriverKey(departmentId, projectId)) ?? null;
}

export function listRegisteredSceneStackDrivers(): string[] {
  return Array.from(drivers.keys());
}
