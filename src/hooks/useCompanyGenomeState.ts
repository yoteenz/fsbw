import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildCompanyGenomeSeed } from '../studio-os-core/company-genome/bootstrap';
import { bootstrapCompanyGenomeStore } from '../studio-os-core/company-genome/store';
import {
  consultBusinessCompanyGenome,
  ensureBusinessCompanyGenomeSeeded,
  getSelectedBusinessSystem,
  getVisualizationFlows,
} from '../studio-os-core/company-genome/engine';
import {
  readCompanyGenomeStore,
  selectCompanyGenomeWorkspace,
  setGenomeZoomLevel,
} from '../studio-os-core/company-genome/store';
import {
  readBusinessCompanyGenomeStore,
  selectBusinessSystem,
  setBusinessVisualization,
} from '../studio-os-core/company-genome/business-store';
import type { BusinessVisualizationId } from '../studio-os-core/company-genome/business-types';
import type { CompanyGenomeWorkspaceId, GenomeZoomLevel } from '../studio-os-core/company-genome/types';
import { BUSINESS_COMPANY_GENOME_UPDATED_EVENT } from '../studio-os-core/company-genome/business-constants';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_WORKSPACE_CHANGED } from '../studio-os-core/workspace/context-bridge';

export function useCompanyGenomeState() {
  const { workspaceId } = useWorkspace();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    bootstrapCompanyGenomeStore(buildCompanyGenomeSeed());
    ensureBusinessCompanyGenomeSeeded(workspaceId);
    setVersion((v) => v + 1);
  }, [workspaceId]);

  useEffect(() => {
    const refresh = () => setVersion((v) => v + 1);
    window.addEventListener(BUSINESS_COMPANY_GENOME_UPDATED_EVENT, refresh);
    window.addEventListener(STUDIO_OS_WORKSPACE_CHANGED, refresh);
    return () => {
      window.removeEventListener(BUSINESS_COMPANY_GENOME_UPDATED_EVENT, refresh);
      window.removeEventListener(STUDIO_OS_WORKSPACE_CHANGED, refresh);
    };
  }, []);

  const store = useMemo(() => {
    void version;
    return readCompanyGenomeStore();
  }, [version]);

  const businessStore = useMemo(() => {
    void version;
    return readBusinessCompanyGenomeStore(workspaceId);
  }, [version, workspaceId]);

  const businessConsult = useMemo(() => {
    void version;
    return consultBusinessCompanyGenome();
  }, [version, workspaceId]);

  const selectedBusinessSystem = useMemo(
    () => getSelectedBusinessSystem(businessStore),
    [businessStore]
  );

  const visualizationFlows = useMemo(
    () => getVisualizationFlows(businessStore, businessStore.activeVisualization),
    [businessStore]
  );

  const selectWorkspace = useCallback((id: CompanyGenomeWorkspaceId) => {
    selectCompanyGenomeWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  const setZoomLevel = useCallback((level: GenomeZoomLevel) => {
    setGenomeZoomLevel(level);
    setVersion((v) => v + 1);
  }, []);

  const setVisualization = useCallback((id: BusinessVisualizationId) => {
    setBusinessVisualization(id);
    setVersion((v) => v + 1);
  }, []);

  const selectSystem = useCallback((systemId: string | null) => {
    selectBusinessSystem(systemId);
    setVersion((v) => v + 1);
  }, []);

  return {
    store,
    businessStore,
    businessConsult,
    selectedBusinessSystem,
    visualizationFlows,
    selectWorkspace,
    setZoomLevel,
    setVisualization,
    selectSystem,
  };
}
