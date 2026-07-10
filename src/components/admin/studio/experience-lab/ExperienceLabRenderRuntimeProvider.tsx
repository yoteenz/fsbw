import { useEffect } from 'react';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { CREATIVE_PREVIEW_RENDER_BINDINGS } from '../../../../studio-os-core/creative-studio-preview/render-bindings';
import { registerSceneStackDriver, type SceneStackDriver } from '../../../../studio-os-core/experience-lab-runtime';
import { useDepartmentVerticalSlice } from '../../../../hooks/useDepartmentVerticalSlice';
import { useSceneStack } from '../../../../hooks/useSceneStack';

const UNIQUE_DEPARTMENT_IDS = Array.from(
  new Set(
    Object.values(CREATIVE_PREVIEW_RENDER_BINDINGS).flatMap((concepts) =>
      Object.values(concepts).map((b) => b.departmentId)
    )
  )
);

function SceneStackDriverHost({
  departmentId,
  workspaceId,
}: {
  departmentId: string;
  workspaceId: string | undefined;
}) {
  const slice = useDepartmentVerticalSlice(departmentId);
  const stack = useSceneStack(departmentId, slice.project.projectId, workspaceId);

  useEffect(() => {
    const driver: SceneStackDriver = {
      departmentId,
      projectId: slice.project.projectId,
      ensureStation: stack.ensureStation,
      compileStation: stack.compileStation,
      regenerateLayer: stack.regenerateLayer,
      getLayerViews: stack.getLayerViews,
      getCompositeStatus: stack.getCompositeStatus,
      getStationPipelineProgress: stack.getStationPipelineProgress,
      getStationSceneGraph: stack.getStationSceneGraph,
      getStationCompileReport: stack.getStationCompileReport,
      isStationPipelineActive: stack.isStationPipelineActive,
      bump: stack.bump,
    };
    return registerSceneStackDriver(driver);
  }, [
    departmentId,
    slice.project.projectId,
    stack,
    stack.ensureStation,
    stack.compileStation,
    stack.regenerateLayer,
    stack.getLayerViews,
    stack.getCompositeStatus,
    stack.getStationPipelineProgress,
    stack.getStationSceneGraph,
    stack.getStationCompileReport,
    stack.isStationPipelineActive,
    stack.bump,
  ]);

  return null;
}

/**
 * Experience Lab runtime provider — owns scene stack drivers and heartbeat scope.
 * Mount at Experience Lab shell level; survives World Compiler unmounts.
 */
export function ExperienceLabRenderRuntimeProvider({ children }: { children: React.ReactNode }) {
  const { workspaceId } = useWorkspace();

  return (
    <>
      {UNIQUE_DEPARTMENT_IDS.map((departmentId) => (
        <SceneStackDriverHost key={departmentId} departmentId={departmentId} workspaceId={workspaceId} />
      ))}
      {children}
    </>
  );
}
