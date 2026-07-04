import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { DirectorModeWorkspace } from '../../../../components/admin/studio/director-mode/DirectorModeWorkspace';
import { DIRECTOR_MODE_SUBTITLE } from '../../../../utils/adminStudioDirectorModeDemo';

export default function AdminStudioDirectorModePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draftId');
  const packId = searchParams.get('packId');

  return (
    <AdminStudioStageShell
      title="DIRECTOR MODE"
      subtitle={DIRECTOR_MODE_SUBTITLE}
      breadcrumbParentLabel="PRODUCTION BUILDER"
      breadcrumbParentPath={packId ? `/admin/studio/content-packs/${packId}` : '/admin/studio/production-builder'}
      onBack={() => navigate(draftId ? `/admin/studio/production-builder${packId ? `?packId=${packId}` : ''}` : '/admin/studio/overview')}
      navGroupId="production"
      hideNavTabs
    >
      <DirectorModeWorkspace />
      <AdminStudioDisclaimerFooter>
        CINEMATIC REHEARSAL · PLACEHOLDER PREVIEWS · AI GENERATION NOT CONNECTED
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
