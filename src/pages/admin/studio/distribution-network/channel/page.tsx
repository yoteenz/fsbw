import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioTabBar } from '../../../../../components/admin/studio/AdminStudioTabBar';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioDistributionFieldGroups } from '../../../../../components/admin/studio/AdminStudioDistributionFieldGroups';
import { AdminStudioCreativeWidget } from '../../../../../components/admin/studio/AdminStudioCreativeWidget';
import { useAdminStudioDistributionNetwork } from '../../../../../hooks/useAdminStudioDistributionNetworkState';
import {
  DISTRIBUTION_CHANNEL_TABS,
  DISTRIBUTION_CHANNEL_PROFILE_GROUPS,
  DISTRIBUTION_CHANNEL_RULES_GROUPS,
  DISTRIBUTION_CHANNEL_SCHEDULING_GROUPS,
  type DistributionChannelTabId,
  type DistributionChannelFieldKey,
} from '../../../../../utils/adminStudioDistributionNetworkDemo';
import { useStudioModuleNav } from '../../../../../studio-os-core/organization-context';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';

export default function AdminStudioDistributionNetworkChannelPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const { toModule } = useStudioModuleNav();
  const distributionListPath = toModule('distribution-network');
  const [activeTab, setActiveTab] = useState<DistributionChannelTabId>('profile');
  const { selectedChannel, updateChannelField } = useAdminStudioDistributionNetwork(undefined, channelId);

  if (!channelId) return <Navigate to={distributionListPath} replace />;
  if (!selectedChannel) return <Navigate to={distributionListPath} replace />;

  const c = selectedChannel;
  const onUpdate = (key: DistributionChannelFieldKey, value: string) => updateChannelField(c.id, key, value);

  return (
    <AdminStudioStageShell
      title={c.name}
      subtitle={`CHANNEL · ${c.activation === 'ACTIVE' ? 'ACTIVE' : 'COMING SOON'}`}
      breadcrumbParentLabel="DISTRIBUTION NETWORK"
      breadcrumbParentPath={distributionListPath}
      onBack={() => navigate(distributionListPath)}
    >
      <div className="p-2.5 mb-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: `2px solid ${c.accentHex}` }}>
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{c.audience}</p>
        <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: c.accentHex }}>{c.status}</p>
      </div>

      <AdminStudioTabBar tabs={DISTRIBUTION_CHANNEL_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'profile' ? (
        <div className="mt-3"><AdminStudioDistributionFieldGroups groups={DISTRIBUTION_CHANNEL_PROFILE_GROUPS} record={c} onUpdate={onUpdate} accentHex={c.accentHex} /></div>
      ) : null}

      {activeTab === 'rules' ? (
        <div className="mt-3"><AdminStudioDistributionFieldGroups groups={DISTRIBUTION_CHANNEL_RULES_GROUPS} record={c} onUpdate={onUpdate} accentHex={c.accentHex} /></div>
      ) : null}

      {activeTab === 'scheduling' ? (
        <div className="mt-3">
          <div className="p-2.5 mb-3 border" style={{ background: ADMIN_STUDIO_THEME.selectedBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>SMART SCHEDULING — PREP ONLY · NO AUTO-PUBLISH</p>
          </div>
          <AdminStudioDistributionFieldGroups groups={DISTRIBUTION_CHANNEL_SCHEDULING_GROUPS} record={c} onUpdate={onUpdate} accentHex={c.accentHex} />
        </div>
      ) : null}

      {activeTab === 'health' ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <AdminStudioCreativeWidget label="LAST PUBLISH" value={c.lastPublish} accentHex={c.accentHex} />
          <AdminStudioCreativeWidget label="AVG PUBLISH" value={c.avgPublishTime} accentHex={c.accentHex} />
          <AdminStudioCreativeWidget label="SUCCESS RATE" value={c.successRate} accentHex={c.accentHex} />
          <AdminStudioCreativeWidget label="FAILED" value={c.failedDeliveries} accentHex={c.accentHex} />
          <AdminStudioCreativeWidget label="QUEUE" value={c.queueLength} accentHex={c.accentHex} />
          <AdminStudioCreativeWidget label="PENDING APPROVAL" value={c.pendingApprovals} accentHex={c.accentHex} />
        </div>
      ) : null}

      <AdminStudioDisclaimerFooter>CHANNEL CONNECTOR NOT CONNECTED · MANUAL PUBLISHING ONLY</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
