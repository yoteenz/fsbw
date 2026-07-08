import {
  listSceneStackStations,
  resolveStationLayerViews,
  SCENE_STACK_LAYER_ORDER,
  type SceneStackLayerId,
} from '../scene-stack';
import { AUDITOR_SCENE_STACK_LAYERS } from './laws';
import type { ArchitectureViolation } from './types';

const DEPARTMENTS_WITH_MANIFEST = ['creative-direction', 'studio-warehouse', 'studio-command-center'] as const;

function uid(): string {
  return `ss-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export type SceneStackAuditResult = {
  violations: ArchitectureViolation[];
  sceneReusePct: number;
  averageCompleteness: number;
};

export function auditSceneStacks(projectId = 'default'): SceneStackAuditResult {
  const violations: ArchitectureViolation[] = [];
  let totalLayers = 0;
  let approvedLayers = 0;
  let stationCount = 0;

  for (const departmentId of DEPARTMENTS_WITH_MANIFEST) {
    const stations = listSceneStackStations(departmentId);
    if (stations.length === 0) {
      violations.push({
        id: uid(),
        category: 'scene-stack-incomplete',
        severity: 'major',
        problem: `Department has no Scene Stack™ manifest: ${departmentId}`,
        reason: 'Every immersive room must declare stations and layer prompts in Scene Stack™',
        affectedRoutes: [`/admin/studio/department/${departmentId}`],
        detectedPatterns: ['missing scene stack manifest'],
      });
      continue;
    }

    for (const station of stations) {
      stationCount++;
      const views = resolveStationLayerViews(departmentId, projectId, station.stationId);
      const approved = new Set(
        views.filter((v) => v.status === 'approved').map((v) => v.layerId)
      );

      for (const layer of SCENE_STACK_LAYER_ORDER) {
        totalLayers++;
        if (approved.has(layer)) approvedLayers++;
      }

      for (const auditorLayer of AUDITOR_SCENE_STACK_LAYERS) {
        const required = [...auditorLayer.layerIds] as SceneStackLayerId[];
        const missing = required.filter((lid) => !approved.has(lid));
        if (missing.length === required.length) {
          violations.push({
            id: uid(),
            category: 'scene-stack-incomplete',
            severity: 'major',
            problem: `Missing ${auditorLayer.label} in ${station.displayName}`,
            reason: `Station ${station.stationId} lacks approved layers: ${missing.join(', ')}`,
            affectedRoutes: [`department:${departmentId}`, `station:${station.stationId}`],
            detectedPatterns: [`missing ${auditorLayer.auditorId}`],
          });
        }
      }
    }
  }

  const sceneReusePct =
    totalLayers > 0 ? Math.round((approvedLayers / totalLayers) * 100) : 0;
  const averageCompleteness = stationCount > 0 ? sceneReusePct : 0;

  return { violations, sceneReusePct, averageCompleteness };
}
