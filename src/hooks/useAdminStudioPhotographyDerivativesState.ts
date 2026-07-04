import { useCallback, useMemo, useState } from 'react';
import {
  derivativeStoreKey,
  getDerivativesForUnit,
  mergeDerivativeStores,
  prepareDerivativesOnHeroApproval,
  type DerivativeEngineResult,
  type PhotographyProductLine,
} from '../studio-os/product-photography';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';

export type DerivativeStore = Record<string, DerivativeEngineResult>;

function readStore(): DerivativeStore {
  return readStudioJson<DerivativeStore>(ADMIN_STUDIO_STORAGE_KEYS.productPhotographyDerivatives) ?? {};
}

function writeStore(store: DerivativeStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.productPhotographyDerivatives, store);
}

export function listDerivativeEngineResults(): DerivativeEngineResult[] {
  return Object.values(readStore());
}

export function getDerivativeEngineResult(
  productLine: PhotographyProductLine,
  unitSlug: string
): DerivativeEngineResult | undefined {
  return readStore()[derivativeStoreKey(productLine, unitSlug)];
}

export function prepareAndPersistDerivatives(
  productLine: PhotographyProductLine,
  unitSlug: string
): DerivativeEngineResult {
  const result = prepareDerivativesOnHeroApproval({ productLine, unitSlug });
  const next = mergeDerivativeStores(readStore(), result);
  writeStore(next);
  return result;
}

export function useAdminStudioPhotographyDerivatives() {
  const [store, setStore] = useState<DerivativeStore>(() => readStore());

  const results = useMemo(() => Object.values(store), [store]);

  const prepareForUnit = useCallback((productLine: PhotographyProductLine, unitSlug: string) => {
    const result = prepareAndPersistDerivatives(productLine, unitSlug);
    setStore((prev) => mergeDerivativeStores(prev, result));
    return result;
  }, []);

  const getForUnit = useCallback(
    (productLine: PhotographyProductLine, unitSlug: string) =>
      getDerivativesForUnit(store, productLine, unitSlug),
    [store]
  );

  return { store, results, prepareForUnit, getForUnit };
}
