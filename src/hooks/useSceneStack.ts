import { useCallback, useEffect, useMemo, useState } from 'react';
import { requireDepartmentPackage } from '../studio-os-core/department-package';
import {
  approveSceneStackLayer,
  compileSceneStackLayerPrompt,
  getSceneStackLayerRecord,
  getLockedReferenceUrlsForLayer,
  listGeneratableLayerIdsForStation,
  listSceneStackStations,
  nextSceneStackLayerVersion,
  resolveStackCompositeStatus,
  resolveStationLayerViews,
  saveSceneStackLayerRecord,
  getSceneStackStation,
  SCENE_STACK_LAYER_SHORT_LABELS,
  hydrateSceneStackFromBuilderRegistry,
  tryMountSceneStackLayerFromRegistry,
  SCENE_STACK_HYDRATED_EVENT,
  type SceneStackCompositeStatus,
  type SceneStackLayerId,
  type SceneStackLayerView,
} from '../studio-os-core/scene-stack';
import { registerStudioAsset } from '../studio-os-core/studio-builder/registry-store';
import { requestStudioBuilderGenerate } from '../services/studio/studioBuilder/api';

export type SceneStackPipelineProgress = {
  stationId: string;
  layersComplete: number;
  layersTotal: number;
  currentLayerId: SceneStackLayerId | null;
  currentLayerLabel: string | null;
  phase: 'idle' | 'queued' | 'generating';
};

export function useSceneStack(
  departmentId: string,
  projectId: string,
  workspaceId: string | undefined
) {
  const [version, setVersion] = useState(0);
  const [generatingKeys, setGeneratingKeys] = useState<Set<string>>(new Set());
  const [ensuringStations, setEnsuringStations] = useState<Set<string>>(new Set());
  const [pipelineLayer, setPipelineLayer] = useState<{
    stationId: string;
    layerId: SceneStackLayerId;
    phase: 'queued' | 'generating';
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const bump = useCallback(() => setVersion((v) => v + 1), []);
  const pkg = useMemo(() => requireDepartmentPackage(departmentId), [departmentId]);
  const stations = useMemo(() => listSceneStackStations(departmentId), [departmentId]);

  useEffect(() => {
    hydrateSceneStackFromBuilderRegistry(departmentId, projectId);
    void import('../services/studio/assetRegistry/pipelineSync')
      .then((m) => m.hydratePipelineRegistryFromSupabase(departmentId, projectId))
      .catch(() => {
        /* offline — local Scene Stack still mounts from registry */
      });
  }, [departmentId, projectId]);

  useEffect(() => {
    const onHydrated = () => bump();
    const onRegistrySynced = () => bump();
    window.addEventListener(SCENE_STACK_HYDRATED_EVENT, onHydrated);
    window.addEventListener('studio-os-pipeline-registry-synced', onRegistrySynced);
    return () => {
      window.removeEventListener(SCENE_STACK_HYDRATED_EVENT, onHydrated);
      window.removeEventListener('studio-os-pipeline-registry-synced', onRegistrySynced);
    };
  }, [bump]);

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
    (stationId: string): SceneStackCompositeStatus => {
      const base = resolveStackCompositeStatus(getLayerViews(stationId));
      if (ensuringStations.has(stationId) && base !== 'ready') return 'building';
      return base;
    },
    [ensuringStations, getLayerViews]
  );

  const isStationPipelineActive = useCallback(
    (stationId: string) => {
      if (ensuringStations.has(stationId)) return true;
      for (const key of generatingKeys) {
        if (key.startsWith(`${stationId}:`)) return true;
      }
      return false;
    },
    [ensuringStations, generatingKeys]
  );

  const getStationPipelineProgress = useCallback(
    (stationId: string): SceneStackPipelineProgress => {
      const station = getSceneStackStation(departmentId, stationId);
      const layerIds = station
        ? listGeneratableLayerIdsForStation(departmentId, stationId, station.layerPrompts)
        : [];
      const views = getLayerViews(stationId);
      const layersComplete = views.filter((l) => l.definition.generatable && l.publicUrl).length;
      const layersTotal = layerIds.length;

      let currentLayerId: SceneStackLayerId | null = null;
      let phase: SceneStackPipelineProgress['phase'] = 'idle';

      if (pipelineLayer?.stationId === stationId) {
        currentLayerId = pipelineLayer.layerId;
        phase = pipelineLayer.phase;
      } else if (ensuringStations.has(stationId)) {
        phase = 'queued';
        currentLayerId = layerIds.find((id) => !getSceneStackLayerRecord(departmentId, projectId, stationId, id)?.publicUrl) ?? null;
      } else {
        for (const key of generatingKeys) {
          if (key.startsWith(`${stationId}:`)) {
            currentLayerId = key.split(':')[1] as SceneStackLayerId;
            phase = 'generating';
            break;
          }
        }
      }

      return {
        stationId,
        layersComplete,
        layersTotal,
        currentLayerId,
        currentLayerLabel: currentLayerId ? SCENE_STACK_LAYER_SHORT_LABELS[currentLayerId] : null,
        phase,
      };
    },
    [departmentId, ensuringStations, generatingKeys, getLayerViews, pipelineLayer, projectId]
  );

  const generateLayer = useCallback(
    async (stationId: string, layerId: SceneStackLayerId, force = false): Promise<boolean> => {
      const key = genKey(stationId, layerId);
      if (generatingKeys.has(key)) return false;

      const existing = getSceneStackLayerRecord(departmentId, projectId, stationId, layerId);
      if (!force && existing?.status === 'approved' && existing.publicUrl) return true;

      if (!force && tryMountSceneStackLayerFromRegistry(departmentId, projectId, stationId, layerId)) {
        bump();
        return true;
      }

      setPipelineLayer({ stationId, layerId, phase: 'generating' });
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
        const station = getSceneStackStation(departmentId, stationId);
        const referenceImageUrls = station
          ? getLockedReferenceUrlsForLayer(
              departmentId,
              projectId,
              stationId,
              layerId,
              station.layerPrompts
            )
          : [];

        const compiled = compileSceneStackLayerPrompt({
          departmentId,
          stationId,
          layerId,
          workspaceId,
          referenceImageUrls: referenceImageUrls.length ? referenceImageUrls : undefined,
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
          forceGenerate: force || !existing?.publicUrl,
          referenceImageUrls: referenceImageUrls.length ? referenceImageUrls : undefined,
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
          stationId,
          layerId,
        });

        bump();
        return true;
      } finally {
        setGeneratingKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        setPipelineLayer((prev) =>
          prev?.stationId === stationId && prev.layerId === layerId ? null : prev
        );
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
      if (!station || ensuringStations.has(stationId)) return;

      const layerIds = listGeneratableLayerIdsForStation(
        departmentId,
        stationId,
        station.layerPrompts
      );

      setEnsuringStations((prev) => new Set(prev).add(stationId));
      const firstPending = layerIds.find(
        (layerId) => !getSceneStackLayerRecord(departmentId, projectId, stationId, layerId)?.publicUrl
      );
      if (firstPending) {
        setPipelineLayer({ stationId, layerId: firstPending, phase: 'queued' });
      }

      try {
        for (const layerId of layerIds) {
          const rec = getSceneStackLayerRecord(departmentId, projectId, stationId, layerId);
          if (!rec?.publicUrl) {
            setPipelineLayer({ stationId, layerId, phase: 'queued' });
            await generateLayer(stationId, layerId);
          }
        }
      } finally {
        setEnsuringStations((prev) => {
          const next = new Set(prev);
          next.delete(stationId);
          return next;
        });
        setPipelineLayer((prev) => (prev?.stationId === stationId ? null : prev));
      }
    },
    [departmentId, generateLayer, projectId, ensuringStations]
  );

  const readyStationCount = useMemo(
    () => stations.filter((s) => getCompositeStatus(s.stationId) === 'ready').length,
    [stations, getCompositeStatus]
  );

  const isAnyPipelineActive = useMemo(
    () => ensuringStations.size > 0 || generatingKeys.size > 0,
    [ensuringStations, generatingKeys]
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
    isStationPipelineActive,
    getStationPipelineProgress,
    isAnyPipelineActive,
    errors,
    bump,
  };
}
