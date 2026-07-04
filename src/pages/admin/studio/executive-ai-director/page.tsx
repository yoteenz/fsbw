import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ExecutiveAiDirectorWorkspace } from '../../../../components/admin/studio/executive-ai-director/ExecutiveAiDirectorWorkspace';
import { EXECUTIVE_AI_DIRECTOR_SUBTITLE } from '../../../../utils/adminStudioExecutiveAiDirectorDemo';

export default function AdminStudioExecutiveAiDirectorPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="EXECUTIVE AI DIRECTOR"
      subtitle={EXECUTIVE_AI_DIRECTOR_SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/overview')}
      navGroupId="intelligence"
    >
      <ExecutiveAiDirectorWorkspace />
      <AdminStudioDisclaimerFooter>
        EXECUTIVE ADVISOR · WORKSPACE HISTORY + CONFIG · NO EXTERNAL TREND FABRICATION · AI NOT CONNECTED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
