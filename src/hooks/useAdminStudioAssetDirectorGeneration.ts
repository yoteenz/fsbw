import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  buildGenerateRequest,
  resolveBlueprintForStudio,
  type StudioVariantTarget,
} from '../utils/adminStudioAssetGenerationPipeline';
import {
  readFileAsDataUrl,
  requestStudioAssetGeneration,
  requestStudioAssetReplace,
} from '../services/studio/assetGeneration/api';
import {
  queueLiveFactoryJob,
  syncFactoryVariantOutput,
  completeLiveFactoryJob,
  failLiveFactoryJob,
} from './useAdminStudioAssetFactoryState';
import { setGeneratedVersionRecord } from './useAdminStudioAssetDirectorState';
import { adminStudioAssetFactoryPath } from '../utils/adminStudioRoutes';

export function useAdminStudioAssetDirectorGeneration() {
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceTargetRef = useRef<StudioVariantTarget | null>(null);

  const dismissNotice = useCallback(() => setNotice(null), []);

  const runGenerate = useCallback(
    async (target: StudioVariantTarget, options?: { navigateToFactory?: boolean }) => {
      const bp = resolveBlueprintForStudio(target.studioId);
      if (!bp) {
        setNotice(`NO BLUEPRINT MAPPED FOR STUDIO · ${target.studioId}`);
        return;
      }

      const storageKey = `${target.studioId}:${target.variantId}`;
      setBusyKey(storageKey);
      setNotice(`GENERATING · ${target.variantName} · FACTORY PIPELINE STARTED`);

      setGeneratedVersionRecord(target.studioId, target.variantId, {
        previewSrc: target.previewSrc ?? '',
        generatedAt: new Date().toISOString(),
        variantName: target.variantName,
        source: 'factory',
        status: 'generating',
      });

      const jobId = queueLiveFactoryJob({
        blueprint: bp,
        studioId: target.studioId,
        variants: [{ variantId: target.variantId, variantName: target.variantName }],
        startTour: false,
      });

      syncFactoryVariantOutput(jobId, target.variantId, { status: 'generating' });

      const result = await requestStudioAssetGeneration(buildGenerateRequest(target, bp));

      if (!result.ok || !result.publicUrl) {
        const error = result.error ?? 'Generation failed';
        setGeneratedVersionRecord(target.studioId, target.variantId, {
          previewSrc: target.previewSrc ?? '',
          generatedAt: new Date().toISOString(),
          variantName: target.variantName,
          source: 'factory',
          jobId,
          status: 'failed',
          error,
        });
        syncFactoryVariantOutput(jobId, target.variantId, { status: 'failed', error });
        failLiveFactoryJob(jobId, error);
        setNotice(`GENERATION FAILED · ${target.variantName} · ${error}`);
        setBusyKey(null);
        setRefreshKey((v) => v + 1);
        return;
      }

      setGeneratedVersionRecord(target.studioId, target.variantId, {
        previewSrc: result.publicUrl,
        generatedAt: new Date().toISOString(),
        variantName: target.variantName,
        source: 'factory',
        jobId,
        status: 'complete',
      });
      syncFactoryVariantOutput(jobId, target.variantId, {
        status: 'complete',
        previewSrc: result.publicUrl,
      });
      completeLiveFactoryJob(jobId, `DELIVERED TO ASSET DIRECTOR · ${target.variantName}`);

      setNotice(`GENERATED · ${target.variantName} · CHECK VERSION TILE FOR NEW PREVIEW`);
      setBusyKey(null);
      setRefreshKey((v) => v + 1);

      if (options?.navigateToFactory === true) {
        navigate(adminStudioAssetFactoryPath());
      }
    },
    [navigate]
  );

  const runReplace = useCallback((target: StudioVariantTarget) => {
    replaceTargetRef.current = target;
    fileInputRef.current?.click();
  }, []);

  const onReplaceFile = useCallback(async (file: File | undefined) => {
    const target = replaceTargetRef.current;
    replaceTargetRef.current = null;
    if (!target || !file) return;

    const storageKey = `${target.studioId}:${target.variantId}`;
    setBusyKey(storageKey);
    setNotice(`REPLACING · ${target.variantName} · UPLOADING…`);

    try {
      const imageDataUrl = await readFileAsDataUrl(file);
      const result = await requestStudioAssetReplace({
        studioId: target.studioId,
        variantId: target.variantId,
        imageDataUrl,
      });

      if (!result.ok || !result.publicUrl) {
        setNotice(`REPLACE FAILED · ${result.error ?? 'Upload failed'}`);
        setBusyKey(null);
        return;
      }

      setGeneratedVersionRecord(target.studioId, target.variantId, {
        previewSrc: result.publicUrl,
        generatedAt: new Date().toISOString(),
        variantName: target.variantName,
        source: 'replace',
        status: 'complete',
      });
      setNotice(`REPLACED · ${target.variantName} · ASSET DIRECTOR UPDATED`);
      setRefreshKey((v) => v + 1);
    } catch (e) {
      setNotice(`REPLACE FAILED · ${e instanceof Error ? e.message : 'Upload failed'}`);
    } finally {
      setBusyKey(null);
    }
  }, []);

  return {
    notice,
    dismissNotice,
    busyKey,
    refreshKey,
    runGenerate,
    runReplace,
    fileInputRef,
    onReplaceFile,
  };
}
