import { useState } from 'react';
import { useExecutiveOrganizationState } from '../../../../hooks/useExecutiveOrganizationState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ChiefOfStaffCoordinationPanel,
  CollaborationPanel,
  CompanyCulturePanel,
  DepartmentHeadquartersPanel,
  DepartmentPlaybooksPanel,
  ExecutiveHeadquartersPanel,
  ExecutiveMeetingsPanel,
  ExecutiveOrganizationHeader,
  ExecutivePersonalityPanel,
  ExecutiveRosterPanel,
  ExecutiveScorecardPanel,
  ExecutiveSuccessionPanel,
  OrganizationDashboardPanel,
  OrgGraphPanel,
  OrgHierarchyPanel,
  OrganizationalMemoryPanel,
  WorkerArchitecturePanel,
} from './ExecutiveOrganizationPanels';

type EoTab = 'organization' | 'executives' | 'departments' | 'culture' | 'meetings' | 'memory';

const TABS: { id: EoTab; label: string }[] = [
  { id: 'organization', label: 'ORGANIZATION' },
  { id: 'executives', label: 'EXECUTIVE HQ' },
  { id: 'departments', label: 'DEPARTMENTS' },
  { id: 'culture', label: 'CULTURE' },
  { id: 'meetings', label: 'MEETINGS' },
  { id: 'memory', label: 'MEMORY · SUCCESSION' },
];

export function ExecutiveOrganizationWorkspace() {
  const [tab, setTab] = useState<EoTab>('organization');
  const { store, selectedExecutive, selectedDepartment, selectExecutive, selectDepartment } = useExecutiveOrganizationState();

  const renderTab = () => {
    switch (tab) {
      case 'executives':
        return (
          <>
            <ExecutiveRosterPanel store={store} selectedExecutive={selectedExecutive} onSelectExecutive={selectExecutive} />
            <ExecutiveHeadquartersPanel selectedExecutive={selectedExecutive} />
            <ExecutivePersonalityPanel selectedExecutive={selectedExecutive} />
            <ExecutiveScorecardPanel selectedExecutive={selectedExecutive} />
            <CollaborationPanel store={store} />
          </>
        );
      case 'departments':
        return (
          <>
            <DepartmentHeadquartersPanel store={store} selectedDepartment={selectedDepartment} onSelectDepartment={selectDepartment} />
            <DepartmentPlaybooksPanel selectedDepartment={selectedDepartment} />
            <WorkerArchitecturePanel store={store} selectedDepartment={selectedDepartment} />
          </>
        );
      case 'culture':
        return (
          <>
            <CompanyCulturePanel store={store} />
            <ChiefOfStaffCoordinationPanel />
          </>
        );
      case 'meetings':
        return (
          <>
            <ExecutiveMeetingsPanel store={store} />
            <ChiefOfStaffCoordinationPanel />
          </>
        );
      case 'memory':
        return (
          <>
            <OrganizationalMemoryPanel store={store} />
            <ExecutiveSuccessionPanel store={store} />
            <OrgGraphPanel store={store} />
          </>
        );
      case 'organization':
      default:
        return (
          <>
            <OrganizationDashboardPanel store={store} />
            <OrgHierarchyPanel store={store} />
            <ChiefOfStaffCoordinationPanel />
            <ExecutiveRosterPanel store={store} selectedExecutive={selectedExecutive} onSelectExecutive={selectExecutive} />
            <ExecutiveHeadquartersPanel selectedExecutive={selectedExecutive} />
            <ExecutiveScorecardPanel selectedExecutive={selectedExecutive} />
            <DepartmentHeadquartersPanel store={store} selectedDepartment={selectedDepartment} onSelectDepartment={selectDepartment} />
            <CollaborationPanel store={store} />
            <WorkerArchitecturePanel store={store} selectedDepartment={selectedDepartment} />
            <ExecutiveMeetingsPanel store={store} />
            <OrganizationalMemoryPanel store={store} />
            <CompanyCulturePanel store={store} />
            <OrgGraphPanel store={store} />
            <ExecutiveSuccessionPanel store={store} />
          </>
        );
    }
  };

  return (
    <div className="executive-organization-root">
      <ExecutiveOrganizationHeader />

      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#0D9488' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#0D9488' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(13,148,136,0.06)' : 'white',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {renderTab()}
    </div>
  );
}
