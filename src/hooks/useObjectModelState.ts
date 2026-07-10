import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ensureObjectModelSubsystem,
  getObjectModelPlatformStats,
  listCanonicalObjectRegistry,
  listCanonicalObjectTypes,
  listCanonicalObjectRelationships,
  listCanonicalObjectHistory,
  validateObjectModelStore,
  CORE_OBJECT_RELATIONSHIP_TYPES,
  CANONICAL_OBJECT_TYPES,
  GENESIS_UPDATED_EVENT,
} from '../studio-os-core/genesis';

export function useObjectModelState() {
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureObjectModelSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => setTick((n) => n + 1);
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, []);

  const stats = useMemo(() => getObjectModelPlatformStats(), [tick]);
  const objects = useMemo(() => listCanonicalObjectRegistry(), [tick]);
  const objectTypes = useMemo(() => listCanonicalObjectTypes(), [tick]);
  const relationships = useMemo(() => listCanonicalObjectRelationships(), [tick]);
  const historicalArchive = useMemo(() => listCanonicalObjectHistory(), [tick]);
  const validation = useMemo(() => validateObjectModelStore(), [tick]);
  const coreRelationshipTypes = useMemo(() => [...CORE_OBJECT_RELATIONSHIP_TYPES], [tick]);
  const canonicalTypeIds = useMemo(() => [...CANONICAL_OBJECT_TYPES], [tick]);

  return {
    stats,
    objects,
    objectTypes,
    relationships,
    historicalArchive,
    validation,
    coreRelationshipTypes,
    canonicalTypeIds,
    refresh,
    tick,
  };
}
