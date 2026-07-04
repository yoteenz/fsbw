import { useNavigate } from 'react-router-dom';
import { AdminHubTabBar } from '../../admin/AdminHubTabBar';
import {
  STUDIO_NAV_GROUPS,
  STUDIO_OVERVIEW_PATH,
  type StudioNavGroupId,
} from '../../../utils/adminStudioNavigation';

type AdminStudioNavTabsProps = {
  activeGroupId: StudioNavGroupId;
  linkToOverview?: boolean;
  onGroupChange?: (groupId: StudioNavGroupId) => void;
};

/** Grouped Studio navigation — same tab styling as Clients / Meetings / Marketing. */
export function AdminStudioNavTabs({
  activeGroupId,
  linkToOverview = true,
  onGroupChange,
}: AdminStudioNavTabsProps) {
  const navigate = useNavigate();

  const tabs = STUDIO_NAV_GROUPS.map((g) => ({ id: g.id, label: g.label }));

  const handleSelect = (groupId: StudioNavGroupId) => {
    if (onGroupChange) {
      onGroupChange(groupId);
      return;
    }
    if (linkToOverview) {
      navigate(`${STUDIO_OVERVIEW_PATH}?group=${groupId}`);
    }
  };

  const activeGroup = STUDIO_NAV_GROUPS.find((g) => g.id === activeGroupId);

  return (
    <div className="mb-2">
      <AdminHubTabBar tabs={tabs} activeTab={activeGroupId} onTabChange={handleSelect} fontSize="10px" />
      {activeGroup ? (
        <p
          className="px-5 text-center"
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '11px',
            color: '#808080',
            marginTop: '4px',
            marginBottom: '8px',
            lineHeight: 1.4,
          }}
        >
          {activeGroup.description}
        </p>
      ) : null}
    </div>
  );
}
