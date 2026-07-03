import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioTabBarProps<T extends string> = {
  tabs: Array<{ id: T; label: string }>;
  activeTab: T;
  onTabChange: (tab: T) => void;
  accentHex?: string;
};

export function AdminStudioTabBar<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  accentHex = ADMIN_STUDIO_THEME.accent,
}: AdminStudioTabBarProps<T>) {
  return (
    <div
      className="flex gap-1 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin"
      style={{ scrollbarWidth: 'thin' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className="flex-shrink-0 px-2.5 py-1.5 text-[7px] font-futura uppercase transition-colors whitespace-nowrap"
            style={{
              fontWeight: 515,
              color: isActive ? ADMIN_STUDIO_THEME.textPrimary : ADMIN_STUDIO_THEME.textSecondary,
              background: isActive ? ADMIN_STUDIO_THEME.chipActiveBg : ADMIN_STUDIO_THEME.chipInactiveBg,
              borderBottom: isActive ? `2px solid ${accentHex}` : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
