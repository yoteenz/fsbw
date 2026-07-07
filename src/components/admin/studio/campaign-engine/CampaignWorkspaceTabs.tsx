import type { CampaignWorkspaceTab } from '../../../../studio-os-core/campaign-engine/types';
import { CAMPAIGN_WORKSPACE_TABS } from '../../../../studio-os-core/campaign-engine/constants';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

type Props = {
  activeTab: CampaignWorkspaceTab;
  onSelectTab: (tab: CampaignWorkspaceTab) => void;
};

export function CampaignWorkspaceTabs({ activeTab, onSelectTab }: Props) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
      {CAMPAIGN_WORKSPACE_TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelectTab(t.id)}
            className="whitespace-nowrap px-2 py-1.5 text-[8px] font-futura border"
          style={{
            fontWeight: 515,
            borderColor: activeTab === t.id ? '#D97706' : ADMIN_STUDIO_THEME.panelBorder,
            color: activeTab === t.id ? '#D97706' : ADMIN_STUDIO_THEME.textSecondary,
            background:
              activeTab === t.id
                ? 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,248,0.9))'
                : 'rgba(255,255,255,0.7)',
            boxShadow: activeTab === t.id ? '0 1px 0 rgba(255,255,255,0.9) inset' : 'none',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
