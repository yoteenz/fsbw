type AdminStudioTabBarProps<T extends string> = {
  tabs: Array<{ id: T; label: string }>;
  activeTab: T;
  onTabChange: (tab: T) => void;
  accentHex?: string;
};

/** Horizontal scroll tab rail for content pack detail. */
export function AdminStudioTabBar<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  accentHex = '#EB1C24',
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
              color: isActive ? '#FFFFFF' : '#9A9A9A',
              background: isActive ? `${accentHex}33` : 'rgba(255,255,255,0.04)',
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
