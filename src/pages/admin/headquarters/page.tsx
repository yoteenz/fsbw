import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { STUDIO_ADMINISTRATION_ROUTES } from '../../../studio-os-core/application/routes';
import {
  canAccessStudioAdministration,
  getAssignedOrganizationWorkspaceId,
} from '../../../studio-os-core/application/portfolio-access';
import { useWorkspace } from '../../../studio-os-core/context/WorkspaceProvider';
import {
  readActiveWorkspaceIdFromStorage,
  STUDIO_PLATFORM_WORKSPACE_ID,
} from '../../../studio-os-core/workspace/storage';
import {
  resolveHeadquartersLaunchWorkspaceId,
  resolveOrganizationMissionControlPath,
} from '../../../studio-os-core/workspace/routes';

/**
 * Organization headquarters entry — launches assigned organization inside Studio OS.
 * Portfolio owners without a last-active org are sent to Studio Command Center.
 */
export default function AdminHeadquartersEntryPage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const { enterWorkspace } = useWorkspace();
  const assignedId = getAssignedOrganizationWorkspaceId();
  const lastActiveId = readActiveWorkspaceIdFromStorage();
  const resolvedOrgId = resolveHeadquartersLaunchWorkspaceId(assignedId, lastActiveId);
  const portfolioWithoutOrg =
    canAccessStudioAdministration() &&
    !assignedId &&
    (lastActiveId === STUDIO_PLATFORM_WORKSPACE_ID || !lastActiveId);
  const missionControlPath = resolveOrganizationMissionControlPath(resolvedOrgId);

  useEffect(() => {
    if (portfolioWithoutOrg) return;
    enterWorkspace(resolvedOrgId);
    navigate(missionControlPath, { replace: true });
  }, [portfolioWithoutOrg, resolvedOrgId, enterWorkspace, navigate, missionControlPath]);

  if (portfolioWithoutOrg) {
    return <Navigate to={STUDIO_ADMINISTRATION_ROUTES.commandCenter} replace />;
  }

  return null;
}
