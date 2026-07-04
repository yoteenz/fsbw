/**
 * Admin hub tab bar — matches Clients, Meetings, Marketing pages.
 * No chip/gray backgrounds; red underline on active tab only.
 */

export type AdminHubTabItem<T extends string = string> = {
  id: T;
  label: string;
};

type AdminHubTabBarProps<T extends string> = {
  tabs: readonly AdminHubTabItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  /** 10px (marketing/clients) or 11px (meetings). */
  fontSize?: '10px' | '11px';
  /** gap-[10px] for marketing; gap-[14px] for clients; gap-6 for meetings. */
  gapClassName?: string;
  className?: string;
};

export function AdminHubTabBar<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  fontSize = '10px',
  gapClassName = 'gap-[10px]',
  className = '',
}: AdminHubTabBarProps<T>) {
  return (
    <div
      className={`px-5 ${className}`.trim()}
      style={{
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <div
        className={`flex flex-nowrap items-center py-1 ${gapClassName}`}
        style={{
          width: 'max-content',
          minWidth: '100%',
          justifyContent: 'center',
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className="py-3 font-medium transition-colors flex-shrink-0"
              style={{
                fontFamily: '"Futura PT Medium"',
                fontSize,
                color: isActive ? '#EB1C24' : '#808080',
                border: 'none',
                paddingBottom: '4px',
                paddingLeft: '4px',
                paddingRight: '4px',
                background: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  borderBottom: isActive ? '1px solid #EB1C24' : '1px solid transparent',
                  paddingBottom: '4px',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
