import { useCallback, useMemo, useState } from 'react';
import { requireDepartmentPackage } from '../studio-os-core/department-package';
import {
  compileSceneGenesisPrompt,
  listSceneGenesisRecords,
  listSceneGenesisStations,
  saveSceneGenesisRecord,
  type SceneGenesisSceneStatus,
} from '../studio-os-core/scene-genesis';
import { registerStudioAsset } from '../studio-os-core/studio-builder/registry-store';
import { requestStudioBuilderGenerate } from '../services/studio/studioBuilder/api';

export function useSceneGenesis(
  departmentId: string,
  projectId: string,
  workspaceId: string | undefined
) {
  const [version, setVersion] = useState(0);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const pkg = useMemo(() => requireDepartmentPackage(departmentId), [departmentId]);
  const stations = useMemo(() => listSceneGenesisStations(departmentId), [departmentId]);

  const records = useMemo(() => {
    void version;
    return listSceneGenesisRecords(departmentId, projectId);
  }, [departmentId, projectId, version]);

  const recordByStation = useMemo(() => {
    const map = new Map(records.map((r) => [r.stationId, r]));
    return map;
  }, [records]);

  const getStatus = useCallback(
    (stationId: string): SceneGenesisSceneStatus => {
      if (generatingIds.has(stationId)) return 'generating';
      const rec = recordByStation.get(stationId);
      if (rec?.publicUrl) return 'ready';
      if (errors[stationId]) return 'failed';
      return 'idle';
    },
    [generatingIds, recordByStation, errors]
  );

  const getSceneUrl = useCallback(
    (stationId: string): string | null => recordByStation.get(stationId)?.publicUrl ?? null,
    [recordByStation]
  );

  const generateStation = useCallback(
    async (stationId: string): Promise<boolean> => {
      if (generatingIds.has(stationId)) return false;
      const existing = recordByStation.get(stationId);
      if (existing?.publicUrl) return true;

      setGeneratingIds((prev) => new Set(prev).add(stationId));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[stationId];
        return next;
      });

      try {
        const compiled = compileSceneGenesisPrompt({
          departmentId,
          stationId,
          workspaceId,
          projectId,
        });

        const result = await requestStudioBuilderGenerate({
          departmentId,
          packageId: pkg.packageId,
          projectId,
          productionGroupId: `scene-genesis-${stationId}`,
          heroAssetId: compiled.heroAssetId,
          prompt: compiled.prompt,
          aspectRatio: compiled.aspectRatio,
          outputFormat: compiled.outputFormat,
        });

        if (!result.ok || !result.publicUrl) {
          setErrors((prev) => ({
            ...prev,
            [stationId]: result.error ?? 'Scene generation failed',
          }));
          return false;
        }

        saveSceneGenesisRecord({
          departmentId,
          projectId,
          stationId,
          productionGroupId: compiled.productionGroupId,
          heroAssetId: compiled.heroAssetId,
          publicUrl: result.publicUrl,
          storagePath: result.storagePath,
          model: result.model,
          promptVersion: compiled.promptVersion,
        });

        registerStudioAsset({
          departmentId,
          projectId,
          packageId: pkg.packageId,
          assetId: `scene-genesis-${stationId}`,
          productionGroupId: compiled.productionGroupId,
          category: 'scene-genesis',
          publicUrl: result.publicUrl,
          storagePath: result.storagePath ?? '',
          model: result.model ?? 'fal-ai/nano-banana-pro/edit',
          promptVersion: compiled.promptVersion,
          status: 'validated',
        });

        bump();
        return true;
      } finally {
        setGeneratingIds((prev) => {
          const next = new Set(prev);
          next.delete(stationId);
          return next;
        });
      }
    },
    [bump, departmentId, generatingIds, pkg.packageId, projectId, recordByStation, workspaceId]
  );

  const ensureStation = useCallback(
    async (stationId: string) => {
      if (getStatus(stationId) === 'ready') return;
      await generateStation(stationId);
    },
    [generateStation, getStatus]
  );

  const readyCount = useMemo(
    () => stations.filter((s) => getStatus(s.stationId) === 'ready').length,
    [stations, getStatus]
  );

  return {
    stations,
    records,
    getSceneUrl,
    getStatus,
    generateStation,
    ensureStation,
    readyCount,
    totalCount: stations.length,
    errors,
    bump,
  };
}
