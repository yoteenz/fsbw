import { useCallback, useEffect, useMemo, useState } from 'react';
import { compileDepartmentGenerationPrompt } from '../studio-os-core/studio-builder/prompt-compiler';
import {
  getQueueItem,
  listQueueItems,
  markQueueRetry,
  updateQueueItemStatus,
  upsertQueueItem,
} from '../studio-os-core/studio-builder/queue-store';
import { registerStudioAsset } from '../studio-os-core/studio-builder/registry-store';
import { requireDepartmentPackage } from '../studio-os-core/department-package';
import { requestStudioBuilderGenerate } from '../services/studio/studioBuilder/api';

export function useStudioBuilderQueue(departmentId: string, projectId: string, workspaceId?: string) {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const items = useMemo(() => {
    void version;
    return listQueueItems(departmentId, projectId);
  }, [departmentId, projectId, version]);

  const generateProductionGroup = useCallback(
    async (productionGroupId: string) => {
      const pkg = requireDepartmentPackage(departmentId);
      const group = pkg.productionGroups.groups[productionGroupId];
      if (!group) return;

      const compiled = compileDepartmentGenerationPrompt({
        departmentId,
        productionGroupId,
        workspaceId,
        projectId,
      });

      const item = upsertQueueItem({
        departmentId,
        packageId: pkg.packageId,
        projectId,
        productionGroupId,
        displayName: group.displayName,
        heroAssetId: group.heroAssetId,
        status: 'queued',
        progressPct: 5,
        promptVersion: compiled.promptVersion,
        compiledPrompt: compiled.prompt,
      });

      updateQueueItemStatus(item.id, 'generating', { progressPct: 35 });
      bump();

      const result = await requestStudioBuilderGenerate({
        departmentId,
        packageId: pkg.packageId,
        projectId,
        productionGroupId,
        heroAssetId: group.heroAssetId,
        prompt: compiled.prompt,
        aspectRatio: compiled.aspectRatio,
        outputFormat: compiled.outputFormat as 'png' | 'webp',
      });

      if (!result.ok || !result.publicUrl) {
        updateQueueItemStatus(item.id, 'failed', {
          error: result.error ?? 'Generation failed',
          progressPct: 0,
        });
        bump();
        return;
      }

      updateQueueItemStatus(item.id, 'validating', {
        previewUrl: result.publicUrl,
        storagePath: result.storagePath,
        model: result.model,
        progressPct: 85,
      });
      bump();

      const manifestAsset = pkg.assetManifest.assets.find((a) => a.assetId === group.heroAssetId);
      registerStudioAsset({
        departmentId,
        packageId: pkg.packageId,
        projectId,
        assetId: group.heroAssetId,
        productionGroupId,
        category: manifestAsset?.category ?? 'environment',
        publicUrl: result.publicUrl,
        storagePath: result.storagePath ?? '',
        model: result.model ?? 'fal-ai/nano-banana-pro/edit',
        promptVersion: compiled.promptVersion,
        status: 'validated',
      });

      updateQueueItemStatus(item.id, 'complete', {
        previewUrl: result.publicUrl,
        storagePath: result.storagePath,
        model: result.model,
        progressPct: 100,
      });
      bump();
    },
    [bump, departmentId, projectId, workspaceId]
  );

  const retryItem = useCallback(
    async (itemId: string) => {
      const item = markQueueRetry(itemId);
      if (!item) return;
      bump();
      await generateProductionGroup(item.productionGroupId);
    },
    [bump, generateProductionGroup]
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key?.includes('studioOsGenerationQueue')) bump();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [bump]);

  return {
    items,
    generateProductionGroup,
    retryItem,
    getItem: (id: string) => getQueueItem(id),
    bump,
  };
}
