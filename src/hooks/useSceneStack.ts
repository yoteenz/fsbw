import { useCallback, useMemo, useState } from 'react';
import { requireDepartmentPackage } from '../studio-os-core/department-package';
import {
  approveSceneStackLayer,
  compileSceneStackLayerPrompt,
  getSceneStackLayerRecord,
  listGeneratableLayerIdsForStation,
  listSceneStackStations,
  nextSceneStackLayerVersion,
  resolveStackCompositeStatus,
  resolveStationLayerViews,
  saveSceneStackLayerRecord,
  getSceneStackStation,
  type SceneStackCompositeStatus,
  type SceneStackLayerId,
  type SceneStackLayerView,
} from '../studio-os-core/scene-stack';
import { registerStudioAsset } from '../studio-os-core/studio-builder/registry-store';
import { requestStudioBuilderGenerate } from '../services/studio/studioBuilder/api';

export function useSceneStack(
  departmentId: string,
  projectId: string,
  workspaceId: string | undefined
) {
  const [version, setVersion] = useState(0);
  const [generatingKeys, setGeneratingKeys] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const bump = useCallback(() => setVersion((v) => v + 1), []);
  const pkg = useMemo(() => requireDepartmentPackage(departmentId), [departmentId]);
  const stations = useMemo(() => listSceneStackStations(departmentId), [departmentId]);

  const genKey = (stationId: string, layerId: SceneStackLayerId) => `${stationId}:${layerId}`;

  const getLayerViews = useCallback(
    (stationId: string): SceneStackLayerView[] => {
      void version;
      const generating = new Set<SceneStackLayerId>();
      const failed = new Set<SceneStackLayerId>();
      for (const key of generatingKeys) {
        const [sid, lid] = key.split(':') as [string, SceneStackLayerId];
        if (sid === stationId) generating.add(lid);
      }
      for (const [key, msg] of Object.entries(errors)) {
        if (msg) {
          const [sid, lid] = key.split(':') as [string, SceneStackLayerId];
          if (sid === stationId) failed.add(lid);
        }
      }
      return resolveStationLayerViews(departmentId, projectId, stationId, generating, failed);
    },
    [departmentId, projectId, version, generatingKeys, errors]
  );

  const getCompositeStatus = useCallback(
    (stationId: string): SceneStackCompositeStatus =>
      resolveStackCompositeStatus(getLayerViews(stationId)),
    [getLayerViews]
  );

  const generateLayer = useCallback(
    async (stationId: string, layerId: SceneStackLayerId, force = false): Promise<boolean> => {
      const key = genKey(stationId, layerId);
      if (generatingKeys.has(key)) return false;

      const existing = getSceneStackLayerRecord(departmentId, projectId, stationId, layerId);
      if (!force && existing?.status === 'approved' && existing.publicUrl) return true;

      setGeneratingKeys((prev) => new Set(prev).add(key));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });

      const nextVersion = force
        ? nextSceneStackLayerVersion(departmentId, projectId, stationId, layerId)
        : existing?.publicUrl
          ? existing.version
          : nextSceneStackLayerVersion(departmentId, projectId, stationId, layerId);

      try {
        const compiled = compileSceneStackLayerPrompt({
          departmentId,
          stationId,
          layerId,
          workspaceId,
        });

        const result = await requestStudioBuilderGenerate({
          departmentId,
          packageId: pkg.packageId,
          projectId,
          productionGroupId: `scene-stack-${stationId}-${layerId}`,
          heroAssetId: compiled.heroAssetId,
          prompt: compiled.prompt,
          aspectRatio: compiled.aspectRatio,
          outputFormat: compiled.outputFormat,
        });

        if (!result.ok || !result.publicUrl) {
          setErrors((prev) => ({ ...prev, [key]: result.error ?? 'Layer generation failed' }));
          return false;
        }

        saveSceneStackLayerRecord({
          departmentId,
          projectId,
          stationId,
          layerId,
          version: nextVersion,
          status: 'approved',
          publicUrl: result.publicUrl,
          storagePath: result.storagePath,
          model: result.model,
          generatedAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
          promptVersion: compiled.promptVersion,
          productionGroupId: compiled.productionGroupId,
          heroAssetId: compiled.heroAssetId,
        });

        registerStudioAsset({
          departmentId,
          projectId,
          packageId: pkg.packageId,
          assetId: `scene-stack-${stationId}-${layerId}-v${nextVersion}`,
          productionGroupId: compiled.productionGroupId,
          category: 'scene-stack-layer',
          publicUrl: result.publicUrl,
          storagePath: result.storagePath ?? '',
          model: result.model ?? 'fal-ai/nano-banana-pro/edit',
          promptVersion: compiled.promptVersion,
          status: 'validated',
        });

        bump();
        return true;
      } finally {
        setGeneratingKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [bump, departmentId, generatingKeys, pkg.packageId, projectId, workspaceId]
  );

  const regenerateLayer = useCallback(
    async (stationId: string, layerId: SceneStackLayerId) => generateLayer(stationId, layerId, true),
    [generateLayer]
  );

  const ensureStation = useCallback(
    async (stationId: string) => {
      const station = getSceneStackStation(departmentId, stationId);
      if (!station) return;

      const layerIds = listGeneratableLayerIdsForStation(
        departmentId,
        stationId,
        station.layerPrompts
      );

      for (const layerId of layerIds) {
        const rec = getSceneStackLayerRecord(departmentId, projectId, stationId, layerId);
        if (!rec?.publicUrl) {
          await generateLayer(stationId, layerId);
        }
      }
    },
    [departmentId, generateLayer, projectId]
  );

  const readyStationCount = useMemo(
    () => stations.filter((s) => getCompositeStatus(s.stationId) === 'ready').length,
    [stations, getCompositeStatus]
  );

  return {
    stations,
    getLayerViews,
    getCompositeStatus,
    generateLayer,
    regenerateLayer,
    ensureStation,
    approveLayer: approveSceneStackLayer,
    readyStationCount,
    totalStationCount: stations.length,
    errors,
    bump,
  };
}
