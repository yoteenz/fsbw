import { NavLink, useLocation } from 'react-router-dom';
import { CHARACTER_LAB_TABS, type CharacterLabTabId } from './characterLabConfig';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

type Props = {
  activeTabId?: CharacterLabTabId;
};

export function CharacterLabTabs({ activeTabId }: Props) {
  const { pathname } = useLocation();

  return (
    <nav
      className="character-lab__tabs flex gap-0 border-b mb-3"
      aria-label="Character Lab tabs"
      data-character-lab-tab-rail="true"
      style={{
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        minHeight: 36,
      }}
    >
      {CHARACTER_LAB_TABS.map((tab) => {
        const isActive =
          activeTabId === tab.id ||
          pathname === tab.route ||
          (tab.id === 'character' && pathname === '/admin/studio/character-lab');
        return (
          <NavLink
            key={tab.id}
            to={tab.route}
            end={tab.id === 'character'}
            className="character-lab__tab px-3 py-2 text-[8px] font-futura uppercase border-b-2 -mb-px transition-colors"
            style={{
              fontWeight: isActive ? 600 : 515,
              color: isActive ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
              borderBottomColor: isActive ? ADMIN_STUDIO_THEME.accent : 'transparent',
              background: isActive ? ADMIN_STUDIO_THEME.selectedBg : 'transparent',
            }}
            data-active={isActive ? 'true' : 'false'}
            data-tab-id={tab.id}
            data-derived={tab.isDerivedTarget ? 'true' : 'false'}
          >
            {tab.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
