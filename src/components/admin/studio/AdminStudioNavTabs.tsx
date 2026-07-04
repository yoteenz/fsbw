import { useNavigate } from 'react-router-dom';
import {
  STUDIO_NAV_GROUPS,
  STUDIO_OVERVIEW_PATH,
  type StudioNavGroupId,
} from '../../../utils/adminStudioNavigation';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioNavTabsProps = {
  activeGroupId: StudioNavGroupId;
  /** When true, tabs link to overview with ?group= filter. */
  linkToOverview?: boolean;
  onGroupChange?: (groupId: StudioNavGroupId) => void;
};

/** Grouped Studio navigation — OVERVIEW · CREATE · VISUALS · etc. */
export function AdminStudioNavTabs({
  activeGroupId,
  linkToOverview = true,
  onGroupChange,
}: AdminStudioNavTabsProps) {
  const navigate = useNavigate();

  const handleSelect = (groupId: StudioNavGroupId) => {
    if (onGroupChange) {
      onGroupChange(groupId);
      return;
    }
    if (linkToOverview) {
      navigate(`${STUDIO_OVERVIEW_PATH}?group=${groupId}`);
    }
  };

  return (
    <div className="mb-4">
      <div
        className="flex gap-1 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin"
        style={{ scrollbarWidth: 'thin' }}
      >
        {STUDIO_NAV_GROUPS.map((group) => {
          const isActive = group.id === activeGroupId;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => handleSelect(group.id)}
              className="flex-shrink-0 px-2.5 py-1.5 text-[7px] font-futura uppercase transition-colors whitespace-nowrap"
              style={{
                fontWeight: 515,
                color: isActive ? ADMIN_STUDIO_THEME.textPrimary : ADMIN_STUDIO_THEME.textSecondary,
                background: isActive ? ADMIN_STUDIO_THEME.chipActiveBg : ADMIN_STUDIO_THEME.chipInactiveBg,
                borderBottom: isActive ? `2px solid ${ADMIN_STUDIO_THEME.accent}` : '2px solid transparent',
              }}
            >
              {group.label}
            </button>
          );
        })}
      </div>
      <p
        className="text-[6px] font-futura uppercase mt-1"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}
      >
        {STUDIO_NAV_GROUPS.find((g) => g.id === activeGroupId)?.description}
      </p>
    </div>
  );
}
