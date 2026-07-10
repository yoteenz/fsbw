import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ensureGenesisStore,
  getGenesisPlatformStats,
  listGenesisRegistry,
  listGenesisProposals,
  listGenesisAdrs,
  listPendingReviewSessions,
  listCompileManifests,
  listPipelineStages,
  listGenesisFrameworkModules,
  listCompileTargets,
  listGenesisObjectSchemaTypes,
  GENESIS_UPDATED_EVENT,
} from '../studio-os-core/genesis';

export function useGenesisState() {
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureGenesisStore();
  }, []);

  useEffect(() => {
    const onUpdate = () => setTick((n) => n + 1);
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, []);

  const stats = useMemo(() => getGenesisPlatformStats(), [tick]);
  const objects = useMemo(() => listGenesisRegistry(), [tick]);
  const proposals = useMemo(() => listGenesisProposals(), [tick]);
  const adrs = useMemo(() => listGenesisAdrs(), [tick]);
  const reviews = useMemo(() => listPendingReviewSessions(), [tick]);
  const compileManifests = useMemo(() => listCompileManifests(), [tick]);
  const pipelineStages = useMemo(() => listPipelineStages(), [tick]);
  const frameworkModules = useMemo(() => listGenesisFrameworkModules(), [tick]);
  const compileTargets = useMemo(() => listCompileTargets(), [tick]);
  const objectSchemaTypes = useMemo(() => listGenesisObjectSchemaTypes(), [tick]);

  return {
    stats,
    objects,
    proposals,
    adrs,
    reviews,
    compileManifests,
    pipelineStages,
    frameworkModules,
    compileTargets,
    objectSchemaTypes,
    refresh,
    tick,
  };
}
