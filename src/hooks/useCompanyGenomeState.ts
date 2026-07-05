import {useCallback, useMemo, useState} from 'react';
import { buildCompanyGenomeSeed } from '../studio-os-core/company-genome/bootstrap';
import {
  bootstrapCompanyGenomeStore,
  readCompanyGenomeStore,
  selectCompanyGenomeWorkspace,
  setGenomeZoomLevel,
} from '../studio-os-core/company-genome/store';
import type { CompanyGenomeWorkspaceId, GenomeZoomLevel } from '../studio-os-core/company-genome/types';

function ensureSeeded(): void {
  bootstrapCompanyGenomeStore(buildCompanyGenomeSeed());
}

export function useCompanyGenomeState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const store = useMemo(() => {
    void version;
    return readCompanyGenomeStore();
  }, [version]);

  const selectWorkspace = useCallback((id: CompanyGenomeWorkspaceId) => {
    selectCompanyGenomeWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  const setZoomLevel = useCallback((level: GenomeZoomLevel) => {
    setGenomeZoomLevel(level);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace, setZoomLevel };
}
