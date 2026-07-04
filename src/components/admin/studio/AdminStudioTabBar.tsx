import { AdminHubTabBar, type AdminHubTabItem } from '../../admin/AdminHubTabBar';

type AdminStudioTabBarProps<T extends string> = {
  tabs: Array<{ id: T; label: string }>;
  activeTab: T;
  onTabChange: (tab: T) => void;
  accentHex?: string;
};

/** In-module tabs — delegates to shared admin hub tab styling (no gray chips). */
export function AdminStudioTabBar<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  accentHex: _accentHex,
}: AdminStudioTabBarProps<T>) {
  void _accentHex;
  const hubTabs = tabs as AdminHubTabItem<T>[];
  return (
    <div className="mb-3">
      <AdminHubTabBar tabs={hubTabs} activeTab={activeTab} onTabChange={onTabChange} fontSize="10px" />
    </div>
  );
}
