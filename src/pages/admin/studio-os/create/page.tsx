import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';
import { STUDIO_OS_PLATFORM } from '../../../../studio-os-core/config/platform';
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
    <div className="min-h-screen relative uppercase" style={{ textTransform: 'uppercase' }}>
      <div className="fixed inset-0 -z-10" style={{ backgroundImage: `url('/assets/marble-half.png')`, backgroundSize: 'contain', backgroundRepeat: 'repeat' }} />
      <AdminHeader
        title="LAUNCH NEW COMPANY"
        showBack
        onBack={() => navigate(STUDIO_OS_ROUTES.entry)}
        breadcrumbParentLabel={STUDIO_OS_PLATFORM.name}
        breadcrumbParentPath={STUDIO_OS_ROUTES.entry}
      />
      <div className="pb-8 px-4 max-w-2xl mx-auto">
        <p className="text-[7px] font-futura mb-3" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          WORKSPACE CREATION ENGINE V1.0 · SELECT BLUEPRINT · PROVISION COMPLETE OPERATING SYSTEM
        </p>
        <WorkspaceCreationWizard blueprints={blueprints} onLaunch={handleLaunch} initialBlueprintId={initialBlueprint} />
      </div>
      <ProvisioningSequence open={provisioning} workspaceName={pendingName} onComplete={handleProvisioningComplete} />
    </div>
  );
}
