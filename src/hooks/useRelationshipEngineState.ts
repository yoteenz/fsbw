import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildRelationshipEngineSeed } from '../studio-os-core/relationship-engine/bootstrap';
import {
  bootstrapRelationshipEngineStore,
  readRelationshipEngineStore,
  selectRelationshipEngineRelationship,
  selectRelationshipEngineWorkspace,
} from '../studio-os-core/relationship-engine/store';
import type { RelationshipEngineWorkspaceId } from '../studio-os-core/relationship-engine/types';

function ensureSeeded(): void {
  bootstrapRelationshipEngineStore(buildRelationshipEngineSeed());
}

export function useRelationshipEngineState() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    ensureSeeded();
  }, []);

  const store = useMemo(() => {
    void version;
    ensureSeeded();
    return readRelationshipEngineStore();
  }, [version]);

  const selectedRelationship = useMemo(
    () => store.relationships.find((r) => r.id === store.selectedRelationshipId) ?? store.relationships[0] ?? null,
    [store.relationships, store.selectedRelationshipId]
  );

  const workspaceRelationships = useMemo(
    () => store.relationships.filter((r) => r.workspaceId === store.activeWorkspaceId),
    [store.relationships, store.activeWorkspaceId]
  );

  const relationshipHealth = useMemo(
    () => (selectedRelationship ? store.healthDetails[selectedRelationship.id] ?? null : null),
    [store.healthDetails, selectedRelationship]
  );

  const relationshipActions = useMemo(
    () => (selectedRelationship ? store.nextBestActions.filter((a) => a.relationshipId === selectedRelationship.id) : []),
    [store.nextBestActions, selectedRelationship]
  );

  const relationshipTimeline = useMemo(
    () => (selectedRelationship ? store.timelines.filter((t) => t.relationshipId === selectedRelationship.id) : []),
    [store.timelines, selectedRelationship]
  );

  const relationshipSignals = useMemo(
    () => (selectedRelationship ? store.intelligenceSignals.filter((s) => s.relationshipId === selectedRelationship.id) : []),
    [store.intelligenceSignals, selectedRelationship]
  );

  const relationshipLoyalty = useMemo(
    () => (selectedRelationship ? store.loyaltyIntel[selectedRelationship.id] ?? null : null),
    [store.loyaltyIntel, selectedRelationship]
  );

  const selectWorkspace = useCallback((id: RelationshipEngineWorkspaceId) => {
    selectRelationshipEngineWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  const selectRelationship = useCallback((id: string | null) => {
    selectRelationshipEngineRelationship(id);
    setVersion((v) => v + 1);
  }, []);

  return {
    store,
    selectedRelationship,
    workspaceRelationships,
    relationshipHealth,
    relationshipActions,
    relationshipTimeline,
    relationshipSignals,
    relationshipLoyalty,
    selectWorkspace,
    selectRelationship,
  };
}
