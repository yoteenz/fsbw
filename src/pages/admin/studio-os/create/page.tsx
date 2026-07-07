import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StudioPlatformLayout } from '../../../../components/admin/studio-os/StudioPlatformLayout';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useWorkspaceCreationEngine } from '../../../../hooks/useWorkspaceCreationEngine';
import { WorkspaceCreationWizard } from '../../../../components/admin/studio-os/workspace-creation/WorkspaceCreationWizard';
import { ProvisioningSequence } from '../../../../components/admin/studio-os/workspace-creation/ProvisioningSequence';
import type { WorkspaceCreationDraft } from '../../../../studio-os-core/workspace-creation/types';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioOsCreatePage() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialBlueprint = searchParams.get('blueprint') ?? undefined;
  const { blueprints, createWorkspace, finalizeWorkspace } = useWorkspaceCreationEngine();
  const [provisioning, setProvisioning] = useState(false);
  const [pendingName, setPendingName] = useState('');
  const [pendingId, setPendingId] = useState('');

  const handleLaunch = (draft: WorkspaceCreationDraft) => {
    const record = createWorkspace(draft);
    setPendingName(record.name);
    setPendingId(record.id);
    setProvisioning(true);
  };

  const handleProvisioningComplete = () => {
    finalizeWorkspace(pendingId);
    setProvisioning(false);
    navigate(STUDIO_OS_ROUTES.workspaceDashboard(pendingId));
  };

  return (
    <>
      <StudioPlatformLayout
        title="LAUNCH NEW COMPANY"
        subtitle="WORKSPACE CREATION ENGINE V1.0 · SELECT BLUEPRINT · PROVISION COMPLETE OPERATING SYSTEM"
        onBack={() => navigate(STUDIO_OS_ROUTES.entry)}
        hideNav
      >
        <p className="text-[7px] font-futura mb-3" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          WORKSPACE CREATION ENGINE V1.0 · SELECT BLUEPRINT · PROVISION COMPLETE OPERATING SYSTEM
        </p>
        <WorkspaceCreationWizard blueprints={blueprints} onLaunch={handleLaunch} initialBlueprintId={initialBlueprint} />
      </StudioPlatformLayout>
      <ProvisioningSequence open={provisioning} workspaceName={pendingName} onComplete={handleProvisioningComplete} />
    </>
  );
}
