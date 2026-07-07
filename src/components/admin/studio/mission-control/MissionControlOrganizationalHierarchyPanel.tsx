import { useNavigate } from 'react-router-dom';
import { useOrganizationalHierarchyState } from '../../../../hooks/useOrganizationalHierarchyState';
import { ORGANIZATIONAL_HIERARCHY_ACCENT } from '../../../../studio-os-core/organizational-hierarchy';
import { adminStudioOrganizationalHierarchyPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Organizational Hierarchy™ preview (M167). */
export function MissionControlOrganizationalHierarchyPanel() {
  const navigate = useNavigate();
  const { profile } = useOrganizationalHierarchyState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="ORGANIZATIONAL HIERARCHY™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>HIERARCHY MAPPING LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="ORGANIZATIONAL HIERARCHY™ · FUNCTION NOT CHART">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.hierarchyScore} size={52} label="OH" accent={ORGANIZATIONAL_HIERARCHY_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.nodesMapped} NODES · {profile.departmentsCount} DEPTS
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            {profile.matrixAssignments} matrix · {profile.linksMapped} links
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.insights[0]?.insight.slice(0, 100) ?? profile.dockHierarchyLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioOrganizationalHierarchyPath())} style={eiaActionBtn}>
        OPEN ORGANIZATIONAL HIERARCHY →
      </button>
    </ExecutiveSecondaryCard>
  );
}
