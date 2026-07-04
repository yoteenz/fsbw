import { useCallback, useMemo, useState } from 'react';
import {
  PHOTOGRAPHY_BIBLE_DEFAULT_UNITS,
  type PhotographyStatus,
  type SignatureUnitPhotographyRecord,
} from '../utils/adminStudioProductPhotographyBibleDemo';
import { prepareAndPersistDerivatives } from './useAdminStudioPhotographyDerivativesState';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';

type UnitPatchStore = Record<string, Partial<SignatureUnitPhotographyRecord>>;

function readPatches(): UnitPatchStore {
  return readStudioJson<UnitPatchStore>(ADMIN_STUDIO_STORAGE_KEYS.productPhotographyBible) ?? {};
}

function writePatches(store: UnitPatchStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.productPhotographyBible, store);
}

function mergeUnits(patches: UnitPatchStore): SignatureUnitPhotographyRecord[] {
  return PHOTOGRAPHY_BIBLE_DEFAULT_UNITS.map((d) => ({ ...d, ...(patches[d.slug] ?? {}) }));
}

export function listPhotographyBibleUnits(): SignatureUnitPhotographyRecord[] {
  return mergeUnits(readPatches());
}

export function getPhotographyBibleUnit(slug: string): SignatureUnitPhotographyRecord | undefined {
  return listPhotographyBibleUnits().find((u) => u.slug === slug);
}

export function useAdminStudioProductPhotographyBible() {
  const [patches, setPatches] = useState<UnitPatchStore>(() => readPatches());

  const units = useMemo(() => mergeUnits(patches), [patches]);

  const patchUnit = useCallback((slug: string, patch: Partial<SignatureUnitPhotographyRecord>) => {
    setPatches((prev) => {
      const next = { ...prev, [slug]: { ...(prev[slug] ?? {}), ...patch, lastUpdated: new Date().toISOString().slice(0, 10) } };
      writePatches(next);
      return next;
    });
  }, []);

  const approveUnit = useCallback(
    (slug: string) => {
      patchUnit(slug, { photographyStatus: 'approved' as PhotographyStatus, mediaKitStatus: 'partial' });
      prepareAndPersistDerivatives('signature-collection', slug);
    },
    [patchUnit]
  );

  return { units, patchUnit, approveUnit };
}
