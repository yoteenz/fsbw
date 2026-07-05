import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildCompanyMaturityEngineSeed } from '../studio-os-core/company-maturity-engine/bootstrap';
import {
  bootstrapCompanyMaturityEngineStore,
  readCompanyMaturityEngineStore,
  selectCompanyMaturityWorkspace,
} from '../studio-os-core/company-maturity-engine/store';
import type { CompanyMaturityWorkspaceId } from '../studio-os-core/company-maturity-engine/types';

function ensureSeeded(): void {
  bootstrapCompanyMaturityEngineStore(buildCompanyMaturityEngineSeed());
}

export function useCompanyMaturityEngineState() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    ensureSeeded();
  }, []);

  const store = useMemo(() => {
    void version;
    ensureSeeded();
    return readCompanyMaturityEngineStore();
  }, [version]);

  const selectWorkspace = useCallback((id: CompanyMaturityWorkspaceId) => {
    selectCompanyMaturityWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace };
}
