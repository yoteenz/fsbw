import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import { resolveWorkspaceDestinationPath } from '../../../../studio-os-core/campus-transitions/resolve-destination';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { STUDIO_PLATFORM_WORKSPACE_ID } from '../../../../studio-os-core/workspace/storage';

export type TravelToWorkspaceOptions = {
  missionControl?: boolean;
  registryById?: Set<string>;
};

export type CampusTransitionContextValue = {
  travelToWorkspace: (workspaceId: string, options?: TravelToWorkspaceOptions) => void;
  returnToCampus: () => void;
};

const CampusTransitionContext = createContext<CampusTransitionContextValue | null>(null);

type Props = { children: ReactNode };

export function CampusTransitionProvider({ children }: Props) {
  const navigate = useNavigate();
  const { enterWorkspace, workspaceId: currentWorkspaceId } = useWorkspace();

  const travelToWorkspace = useCallback(
    (targetWorkspaceId: string, options: TravelToWorkspaceOptions = {}) => {
      const destinationPath = resolveWorkspaceDestinationPath(targetWorkspaceId, {
        missionControl: options.missionControl,
        registryById: options.registryById,
      });

      if (targetWorkspaceId === currentWorkspaceId) {
        navigate(destinationPath);
        return;
      }

      enterWorkspace(targetWorkspaceId);
      navigate(destinationPath);
    },
    [currentWorkspaceId, enterWorkspace, navigate]
  );

  const returnToCampus = useCallback(() => {
    enterWorkspace(STUDIO_PLATFORM_WORKSPACE_ID);
    navigate(STUDIO_OS_ROUTES.entry);
  }, [enterWorkspace, navigate]);

  const value = useMemo<CampusTransitionContextValue>(
    () => ({
      travelToWorkspace,
      returnToCampus,
    }),
    [travelToWorkspace, returnToCampus]
  );

  return <CampusTransitionContext.Provider value={value}>{children}</CampusTransitionContext.Provider>;
}

export function useCampusTransition(): CampusTransitionContextValue {
  const ctx = useContext(CampusTransitionContext);
  if (!ctx) {
    throw new Error('useCampusTransition must be used within CampusTransitionProvider');
  }
  return ctx;
}
