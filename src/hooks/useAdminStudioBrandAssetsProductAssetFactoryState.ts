import { useCallback, useMemo, useState } from 'react';
import { getAccessToken } from '../utils/api';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';
import type {
  ProductAssetFactoryAction,
  ProductAssetFactoryJobRecord,
  ProductAssetFactoryLogRecord,
  ProductAssetFactoryStage,
  ProductAssetRegistryRecord,
} from '../studio-os/product-photography/ProductAssetFactory';

export type ProductAssetFactoryStore = {
  jobs: ProductAssetFactoryJobRecord[];
  registry: ProductAssetRegistryRecord[];
  logs: ProductAssetFactoryLogRecord[];
};

function readStore(): ProductAssetFactoryStore {
  return (
    readStudioJson<ProductAssetFactoryStore>(ADMIN_STUDIO_STORAGE_KEYS.brandAssetsProductAssetFactory) ?? {
      jobs: [],
      registry: [],
      logs: [],
    }
  );
}

function writeStore(store: ProductAssetFactoryStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.brandAssetsProductAssetFactory, store);
}

export function getLatestProductAssetFactoryJob(unitSlug: string): ProductAssetFactoryJobRecord | undefined {
  return readStore()
    .jobs.filter((j) => j.unitSlug === unitSlug)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
}

export async function runProductAssetFactoryApi(opts: {
  action?: ProductAssetFactoryAction | 'run';
  unitSlug?: string;
  fromStage?: ProductAssetFactoryStage | string;
  productReferenceSrc?: string;
  generatedMasterHeroSrc?: string;
  heroApproved?: boolean;
  assetType?: string;
  transparentMasterUrl?: string;
}): Promise<{ ok: boolean; job?: ProductAssetFactoryJobRecord; registry?: ProductAssetRegistryRecord[]; logs?: ProductAssetFactoryLogRecord[]; error?: string }> {
  const token = await getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch('/api/admin/product-asset-factory-run', {
    method: 'POST',
    headers,
    body: JSON.stringify(opts),
  });
  const data = (await res.json()) as {
    ok?: boolean;
    job?: ProductAssetFactoryJobRecord;
    registry?: ProductAssetRegistryRecord[];
    logs?: ProductAssetFactoryLogRecord[];
    error?: string;
  };
  return {
    ok: Boolean(data.ok),
    job: data.job,
    registry: data.registry,
    logs: data.logs,
    error: data.error ?? (res.ok ? undefined : `HTTP ${res.status}`),
  };
}

export function persistProductAssetFactoryResult(result: {
  job: ProductAssetFactoryJobRecord;
  registry: ProductAssetRegistryRecord[];
  logs: ProductAssetFactoryLogRecord[];
}): ProductAssetFactoryStore {
  const prev = readStore();
  const registryById = new Map(prev.registry.map((r) => [r.id, r]));
  for (const r of result.registry) registryById.set(r.id, r);
  const next: ProductAssetFactoryStore = {
    jobs: [result.job, ...prev.jobs.filter((j) => j.id !== result.job.id)].slice(0, 20),
    registry: Array.from(registryById.values()),
    logs: [...result.logs, ...prev.logs].slice(0, 200),
  };
  writeStore(next);
  return next;
}

export function useAdminStudioBrandAssetsProductAssetFactory() {
  const [store, setStore] = useState<ProductAssetFactoryStore>(() => readStore());
  const [running, setRunning] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const latestJob = useMemo(
    () => store.jobs.find((j) => j.unitSlug === 'soft-wave'),
    [store.jobs]
  );

  const callApi = useCallback(
    async (opts: Parameters<typeof runProductAssetFactoryApi>[0]) => {
      setRunning(true);
      setLastError(null);
      try {
        const result = await runProductAssetFactoryApi(opts);
        if (result.job && result.logs) {
          const next = persistProductAssetFactoryResult({
            job: result.job,
            registry: result.registry ?? [],
            logs: result.logs,
          });
          setStore(next);
        }
        if (!result.ok) setLastError(result.error ?? 'Pipeline failed');
        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setLastError(msg);
        return { ok: false, error: msg };
      } finally {
        setRunning(false);
      }
    },
    []
  );

  const generateMasterHero = useCallback(
    (productReferenceSrc?: string) =>
      callApi({ action: 'generate-hero', unitSlug: 'soft-wave', productReferenceSrc }),
    [callApi]
  );

  const approveHeroAndRunDerivatives = useCallback(async () => {
    const approve = await callApi({
      action: 'approve-hero',
      unitSlug: 'soft-wave',
      generatedMasterHeroSrc: latestJob?.generatedMasterHeroUrl ?? latestJob?.masterHeroUrl,
    });
    if (!approve.ok || !approve.job) return approve;

    return callApi({
      action: 'run-derivatives',
      unitSlug: 'soft-wave',
      generatedMasterHeroSrc: approve.job.generatedMasterHeroUrl ?? approve.job.masterHeroUrl,
      heroApproved: true,
    });
  }, [callApi, latestJob?.generatedMasterHeroUrl, latestJob?.masterHeroUrl]);

  const retryFromFailed = useCallback(
    (fromStage: ProductAssetFactoryStage | string) =>
      callApi({
        action: 'retry',
        unitSlug: 'soft-wave',
        fromStage,
        generatedMasterHeroSrc: latestJob?.generatedMasterHeroUrl ?? latestJob?.masterHeroUrl,
        heroApproved: true,
      }),
    [callApi, latestJob?.generatedMasterHeroUrl, latestJob?.masterHeroUrl]
  );

  const publishJob = useCallback((jobId: string) => {
    setStore((prev) => {
      const next = {
        ...prev,
        jobs: prev.jobs.map((j) =>
          j.id === jobId ? { ...j, stage: 'published' as const, lastUpdated: new Date().toISOString() } : j
        ),
        registry: prev.registry.map((r) =>
          prev.jobs.find((j) => j.id === jobId)?.registryEntryIds.includes(r.id)
            ? { ...r, status: 'published' as const, lastUpdated: new Date().toISOString().slice(0, 10) }
            : r
        ),
      };
      writeStore(next);
      return next;
    });
  }, []);

  const approveRegistryAsset = useCallback((registryId: string) => {
    setStore((prev) => {
      const next = {
        ...prev,
        registry: prev.registry.map((r) =>
          r.id === registryId
            ? { ...r, status: 'approved' as const, lastUpdated: new Date().toISOString().slice(0, 10) }
            : r
        ),
      };
      writeStore(next);
      return next;
    });
  }, []);

  const regenerateDerivative = useCallback(
    (assetType: string) =>
      callApi({
        action: 'regenerate-derivative',
        unitSlug: 'soft-wave',
        assetType,
        transparentMasterUrl: latestJob?.transparentMasterUrl,
        generatedMasterHeroSrc: latestJob?.generatedMasterHeroUrl ?? latestJob?.masterHeroUrl,
        heroApproved: true,
      }),
    [callApi, latestJob?.transparentMasterUrl, latestJob?.generatedMasterHeroUrl, latestJob?.masterHeroUrl]
  );

  return {
    store,
    latestJob,
    running,
    lastError,
    generateMasterHero,
    approveHeroAndRunDerivatives,
    retryFromFailed,
    publishJob,
    approveRegistryAsset,
    regenerateDerivative,
  };
}
