import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { OrganizationalHierarchyWorkspace } from '../../../../components/admin/studio/organizational-hierarchy/OrganizationalHierarchyWorkspace';

const SUBTITLE =
  'Organizational Hierarchy™ — maps how every person, department, team, and organization connects. Matrix organizations, holding companies, family businesses, franchises, multi-location companies, shared departments, and temporary project teams. How organizations actually function — not just an org chart.';

export default function AdminStudioOrganizationalHierarchyPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="ORGANIZATIONAL HIERARCHY™"
      subtitle={SUBTITLE}
      breadcrumbParentLabel="ADMIN"
      breadcrumbParentPath="/admin/dashboard"
      onBack={() => navigate('/admin/studio/role-intelligence')}
      navGroupId="intelligence"
    >
      <OrganizationalHierarchyWorkspace />
      <AdminStudioDisclaimerFooter>
        ORGANIZATIONAL HIERARCHY™ V1.0 · M167 · HOW ORGANIZATIONS ACTUALLY FUNCTION
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
