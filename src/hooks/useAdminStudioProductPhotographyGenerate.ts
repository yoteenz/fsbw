import { useCallback, useState } from 'react';
import { getAccessToken } from '../utils/api';
import type {
  ProductAssetFactoryJobRecord,
  ProductAssetFactoryLogRecord,
  ProductAssetRegistryRecord,
} from '../studio-os/product-photography/ProductAssetFactory';
import { persistProductAssetFactoryResult } from './useAdminStudioBrandAssetsProductAssetFactoryState';

export type ProductPhotographyGenerateAction = 'generate-variants' | 'replace-reference';

export type ProductPhotographyGenerateLogEntry = {
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error';
};

export type ProductPhotographyGenerateApiResult = {
  ok: boolean;
  action?: ProductPhotographyGenerateAction;
  unitSlug?: string;
  falModel?: string;
  generatedMasterUrl?: string;
  storagePath?: string;
  productReferenceImageSrc?: string;
  displayBustSrc?: string;
  assetFactory?: {
    ok: boolean;
    job?: ProductAssetFactoryJobRecord;
    registry?: ProductAssetRegistryRecord[];
    logs?: ProductAssetFactoryLogRecord[];
    error?: string;
  };
  logs?: ProductPhotographyGenerateLogEntry[];
  error?: string;
};

export async function runProductPhotographyGenerateApi(opts: {
  action: ProductPhotographyGenerateAction;
  unitSlug: string;
  productReferenceImageSrc?: string;
  runAssetFactory?: boolean;
}): Promise<ProductPhotographyGenerateApiResult> {
  const token = await getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch('/api/admin/product-photography-generate', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: opts.action,
      unitSlug: opts.unitSlug,
      productReferenceImageSrc: opts.productReferenceImageSrc,
      runAssetFactory: opts.runAssetFactory === true,
    }),
  });

  const data = (await res.json()) as ProductPhotographyGenerateApiResult;
  if (data.assetFactory?.job && data.assetFactory.logs) {
    persistProductAssetFactoryResult({
      job: data.assetFactory.job,
      registry: data.assetFactory.registry ?? [],
      logs: data.assetFactory.logs,
    });
  }

  return {
    ...data,
    ok: Boolean(data.ok),
    error: data.error ?? (res.ok ? undefined : `HTTP ${res.status}`),
  };
}

export function useAdminStudioProductPhotographyGenerate() {
  const [generatingSlug, setGeneratingSlug] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastLogs, setLastLogs] = useState<ProductPhotographyGenerateLogEntry[]>([]);

  const generate = useCallback(
    async (opts: {
      action: ProductPhotographyGenerateAction;
      unitSlug: string;
      productReferenceImageSrc?: string;
      runAssetFactory?: boolean;
    }) => {
      setGeneratingSlug(opts.unitSlug);
      setLastError(null);
      try {
        const result = await runProductPhotographyGenerateApi(opts);
        setLastLogs(result.logs ?? []);
        if (!result.ok) {
          setLastError(result.error ?? 'Generation failed');
        }
        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setLastError(msg);
        return { ok: false, error: msg };
      } finally {
        setGeneratingSlug(null);
      }
    },
    []
  );

  return { generatingSlug, lastError, lastLogs, generate };
}

/** POC guard — only SOFT WAVE is wired to Fal generation in this milestone. */
export const PRODUCT_PHOTOGRAPHY_GENERATE_POC_SLUG = 'soft-wave' as const;

export function isProductPhotographyGenerateEnabled(unitSlug: string): boolean {
  return unitSlug === PRODUCT_PHOTOGRAPHY_GENERATE_POC_SLUG;
}
