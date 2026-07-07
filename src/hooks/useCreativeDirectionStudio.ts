import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CreativeCommandResult, InspirationSourceType } from '../studio-os-core/creative-direction-studio/types';
import {
  addCreativeDirectionNote,
  addInspirationReference,
  bootstrapPage001CreativeDirection,
  createCreativeBranch,
  getCreativeDirectionProject,
  getDepartmentCreativeDirectionSnapshot,
  NDXBOOK_PAGE_001_PROJECT_ID,
  runCreativeCommand,
  setActiveBranch,
  syncFounderNotesToCreativeDirection,
  updateBranchBrief,
} from '../studio-os-core/creative-direction-studio';

export function useCreativeDirectionStudio(projectId: string = NDXBOOK_PAGE_001_PROJECT_ID) {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    bootstrapPage001CreativeDirection();
    syncFounderNotesToCreativeDirection(projectId);
  }, [projectId]);

  const project = useMemo(() => {
    void version;
    return getCreativeDirectionProject(projectId);
  }, [projectId, version]);

  const activeBranch = useMemo(() => {
    if (!project) return null;
    return project.branches.find((b) => b.id === project.activeBranchId) ?? null;
  }, [project]);

  const snapshot = useMemo(() => {
    void version;
    return getDepartmentCreativeDirectionSnapshot(projectId);
  }, [projectId, version]);

  const addReference = useCallback(
    (input: { title: string; sourceType: InspirationSourceType; url: string; caption?: string }) => {
      const ref = addInspirationReference(projectId, input);
      bump();
      return ref;
    },
    [bump, projectId]
  );

  const addNote = useCallback(
    (body: string, departmentOrigin?: string) => {
      const note = addCreativeDirectionNote(projectId, { body, departmentOrigin });
      bump();
      return note;
    },
    [bump, projectId]
  );

  const runCommand = useCallback(
    (command: string, currentDepartment?: string): CreativeCommandResult | null => {
      const result = runCreativeCommand(projectId, command, currentDepartment);
      bump();
      return result;
    },
    [bump, projectId]
  );

  const activateBranch = useCallback(
    (branchId: string) => {
      setActiveBranch(projectId, branchId);
      bump();
    },
    [bump, projectId]
  );

  const newBranch = useCallback(
    (name: string, preset = 'general') => {
      createCreativeBranch(projectId, name, preset);
      bump();
    },
    [bump, projectId]
  );

  const patchBrief = useCallback(
    (patch: Parameters<typeof updateBranchBrief>[1]) => {
      updateBranchBrief(projectId, patch);
      bump();
    },
    [bump, projectId]
  );

  return {
    project,
    activeBranch,
    snapshot,
    addReference,
    addNote,
    runCommand,
    activateBranch,
    newBranch,
    patchBrief,
    refresh: bump,
  };
}
