import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ConciergeApprovalFlowWorkspace } from '../../../../components/admin/studio/concierge-approval-flow/ConciergeApprovalFlowWorkspace';

const SUBTITLE =
  'Intelligent concierge review before founder decision — luxury editorial board preparing tomorrow\'s front page. Concierges review first · founders review last.';

export default function AdminStudioConciergeApprovalFlowPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="CONCIERGE APPROVAL FLOW"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/screening-room')}
      navGroupId="production"
    >
      <ConciergeApprovalFlowWorkspace />
      <AdminStudioDisclaimerFooter>
        CONCIERGE APPROVAL FLOW V1.0 · EDITORIAL BOARD · DEMO PLACEHOLDER · FOUNDER NEVER RECEIVES UNFINISHED WORK
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
