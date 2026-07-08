import { useCallback, useEffect, useState } from 'react';
import {
  FOUNDRY_REGISTRY_UPDATED_EVENT,
  generateFoundryAsset,
  getFoundryAsset,
  queueFoundryAssetGeneration,
  type FoundryAsset,
} from '../studio/foundry';

type Options = {
  /** Queue server generation when asset is missing (non-blocking). */
  autoQueue?: boolean;
  /** Track which UI surface requested this asset. */
  usedBy?: string;
};

export function useFoundryAsset(slug: string, options: Options = {}) {
  const { autoQueue = false, usedBy } = options;
  const [asset, setAsset] = useState<FoundryAsset>(() => getFoundryAsset(slug, usedBy));

  const refresh = useCallback(() => {
    setAsset(getFoundryAsset(slug, usedBy));
  }, [slug, usedBy]);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener(FOUNDRY_REGISTRY_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(FOUNDRY_REGISTRY_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  useEffect(() => {
    if (!autoQueue) return;
    if (asset.status !== 'missing' && asset.status !== 'failed') return;

    queueFoundryAssetGeneration(slug);
    void generateFoundryAsset({ slug }).finally(refresh);
  }, [autoQueue, asset.status, slug, refresh]);

  const queueGeneration = useCallback(async () => {
    queueFoundryAssetGeneration(slug);
    refresh();
    await generateFoundryAsset({ slug });
    refresh();
  }, [slug, refresh]);

  return {
    asset,
    refresh,
    queueGeneration,
    isReady: asset.status === 'ready',
    isGenerating: asset.status === 'generating' || asset.status === 'queued',
    isMissing: asset.status === 'missing' || asset.status === 'failed',
  };
}
