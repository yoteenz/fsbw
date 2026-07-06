import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { PerformanceMonitorWorkspace } from '../../../../components/admin/studio/performance-monitor/PerformanceMonitorWorkspace';

const SUBTITLE =
  'Performance Monitor™ — continuously measures speed, responsiveness, efficiency, and operational performance across Studio OS. Performance is a living metric — not an afterthought.';

export default function AdminStudioPerformanceMonitorPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="PERFORMANCE MONITOR™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/accessibility-auditor')}
      navGroupId="intelligence"
    >
      <PerformanceMonitorWorkspace />
      <AdminStudioDisclaimerFooter>
        PERFORMANCE MONITOR™ V1.0 · M159 · PERFORMANCE IS A FEATURE · NEVER SLOWER BECAUSE WE&apos;RE MORE CAPABLE
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
