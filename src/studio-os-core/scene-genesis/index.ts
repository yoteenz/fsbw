/**
 * @deprecated Use `scene-stack` — Scene Genesis™ single-image approach superseded by Scene Stack™ layered architecture.
 */
export * from '../scene-stack/types';
export { listSceneStackStations as listSceneGenesisStations } from '../scene-stack/station-manifest';
export { getSceneStackStation as getSceneGenesisStation } from '../scene-stack/station-manifest';

export type SceneGenesisHotspotBounds = import('../scene-stack/types').SceneStackHotspotBounds;
export type SceneGenesisSceneStatus = 'idle' | 'generating' | 'ready' | 'failed';
