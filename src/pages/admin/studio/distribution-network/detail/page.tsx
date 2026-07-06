import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioTabBar } from '../../../../../components/admin/studio/AdminStudioTabBar';
import { AdminStudioSectionHeading } from '../../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioEditableField } from '../../../../../components/admin/studio/AdminStudioEditableField';
import { AdminStudioDistributionFieldGroups } from '../../../../../components/admin/studio/AdminStudioDistributionFieldGroups';
import { AdminStudioCreativeWidget } from '../../../../../components/admin/studio/AdminStudioCreativeWidget';
import { useEnsureNdxbookWorkspaceFromBrandParam } from '../../../../../hooks/useEnsureNdxbookWorkspace';
import { useAdminStudioDistributionNetwork } from '../../../../../hooks/useAdminStudioDistributionNetworkState';
import {
  useOrganizationContext,
  useStudioModuleNav,
} from '../../../../../studio-os-core/organization-context';
import {
  DISTRIBUTION_PACK_TABS,
  DISTRIBUTION_PACK_REQUIREMENTS_GROUPS,
  DISTRIBUTION_PACK_PREVIEW_FIELDS,
  DISTRIBUTION_ANALYTICS_METRICS,
  DISTRIBUTION_APPROVAL_STATUSES,
  DISTRIBUTION_DELIVERY_STATUSES,
  DISTRIBUTION_CALENDAR_SLOTS,
  inferRoutingForShow,
  type DistributionPackTabId,
  type DistributionPackFieldKey,
  type DistributionChannelId,
} from '../../../../../utils/adminStudioDistributionNetworkDemo';
import { AdminStudioDistributionSocialPublishPanel } from '../../../../../components/admin/studio/AdminStudioDistributionSocialPublishPanel';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';

export default function AdminStudioDistributionNetworkPackPage() {
  const { distributionId } = useParams<{ distributionId: string }>();
  const navigate = useNavigate();
  useEnsureNdxbookWorkspaceFromBrandParam();
  const { organizationId } = useOrganizationContext();
  const { toModule } = useStudioModuleNav();
  const isNdxbook = organizationId === 'ai-media';
  const distributionListPath = toModule('distribution-network');
  const [activeTab, setActiveTab] = useState<DistributionPackTabId>('routing');
  const {
    selectedPack,
    channels,
    updatePackField,
    setApprovalStatus,
    setDeliveryStatus,
    toggleRoutingChannel,
    moveToSlot,
    updateChannelVersion,
  } = useAdminStudioDistributionNetwork(distributionId);

  if (!distributionId) return <Navigate to={distributionListPath} replace />;
  if (!selectedPack) return <Navigate to={distributionListPath} replace />;

  const p = selectedPack;
  const onUpdate = (key: DistributionPackFieldKey, value: string) => updatePackField(p.id, key, value);
  const suggested = inferRoutingForShow(p.showName);
  const activeChannels = channels.filter((c) => c.activation === 'ACTIVE');

  return (
    <AdminStudioStageShell
      title={p.title}
      subtitle={`${isNdxbook ? 'NDXBOOK · ' : 'DISTRIBUTION · '}${p.approvalStatus.replace('-', ' ').toUpperCase()}`}
      breadcrumbParentLabel={isNdxbook ? 'NDXBOOK DISTRIBUTION' : 'DISTRIBUTION NETWORK'}
      breadcrumbParentPath={distributionListPath}
      onBack={() => navigate(distributionListPath)}
    >
      <div className="p-2.5 mb-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: `2px solid ${p.accentHex}` }}>
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{p.showName} · {p.campaignName}</p>
        <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: p.validationPassed ? '#16A34A' : '#CA8A04' }}>
          VALIDATION {p.validationPassed ? 'PASSED' : 'INCOMPLETE'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <AdminStudioCreativeWidget label="APPROVAL" value={p.approvalStatus.replace('-', ' ').toUpperCase()} accentHex={p.accentHex} />
        <AdminStudioCreativeWidget label="DELIVERY" value={p.deliveryStatus.toUpperCase()} accentHex={p.accentHex} />
      </div>

      <AdminStudioTabBar tabs={DISTRIBUTION_PACK_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'routing' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>CONTENT ROUTING</AdminStudioSectionHeading>
          <p className="text-[6px] font-futura uppercase -mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            AUTO: {suggested.join(' → ').replace(/-/g, ' ').toUpperCase()}
          </p>
          <div className="flex flex-col items-center gap-0">
            {p.routingChannels.map((chId, i) => {
              const ch = channels.find((c) => c.id === chId);
              return (
                <div key={chId} className="w-full flex flex-col items-center">
                  {i > 0 ? <div className="text-[10px]" style={{ color: p.accentHex }}>↓</div> : null}
                  <div className="w-full px-3 py-1.5 border text-[7px] font-futura uppercase text-center" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${ch?.accentHex ?? p.accentHex}`, background: 'rgba(255,255,255,0.75)' }}>
                    {ch?.name ?? chId.replace(/-/g, ' ').toUpperCase()}
                  </div>
                </div>
              );
            })}
          </div>
          <AdminStudioSectionHeading>MANUAL OVERRIDE</AdminStudioSectionHeading>
          <div className="flex flex-wrap gap-1">
            {activeChannels.map((ch) => {
              const on = p.routingChannels.includes(ch.id);
              return (
                <button key={ch.id} type="button" onClick={() => toggleRoutingChannel(p.id, ch.id)} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ fontWeight: 515, color: on ? '#FFF' : ADMIN_STUDIO_THEME.textSecondary, background: on ? ch.accentHex : 'rgba(255,255,255,0.8)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                  {ch.name}
                </button>
              );
            })}
          </div>
          <AdminStudioEditableField label="ROUTING NOTES" value={p.routingOverride} onChange={(v) => onUpdate('routingOverride', v)} multiline accentHex={p.accentHex} />
        </div>
      ) : null}

      {activeTab === 'calendar' ? (
        <div className="mt-3 space-y-2">
          <AdminStudioEditableField label="SCHEDULED DATE" value={p.scheduledDate} onChange={(v) => onUpdate('scheduledDate', v)} accentHex={p.accentHex} />
          <AdminStudioEditableField label="SCHEDULED TIME" value={p.scheduledTime} onChange={(v) => onUpdate('scheduledTime', v)} accentHex={p.accentHex} />
          <AdminStudioSectionHeading>CALENDAR SLOT</AdminStudioSectionHeading>
          <div className="flex flex-wrap gap-1">
            {DISTRIBUTION_CALENDAR_SLOTS.map((slot) => (
              <button key={slot.id} type="button" onClick={() => moveToSlot(p.id, slot.id)} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ fontWeight: 515, color: p.calendarSlot === slot.id ? '#FFF' : ADMIN_STUDIO_THEME.textSecondary, background: p.calendarSlot === slot.id ? p.accentHex : 'rgba(255,255,255,0.8)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                {slot.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === 'requirements' ? (
        <div className="mt-3"><AdminStudioDistributionFieldGroups groups={DISTRIBUTION_PACK_REQUIREMENTS_GROUPS} record={p} onUpdate={onUpdate} accentHex={p.accentHex} /></div>
      ) : null}

      {activeTab === 'previews' ? (
        <div className="mt-3 space-y-2">
          {DISTRIBUTION_PACK_PREVIEW_FIELDS.map((field) => (
            <AdminStudioEditableField key={field.key} label={field.label} value={p[field.key]} onChange={(v) => onUpdate(field.key, v)} multiline accentHex={p.accentHex} />
          ))}
        </div>
      ) : null}

      {activeTab === 'versioning' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>CHANNEL-SPECIFIC VERSIONS</AdminStudioSectionHeading>
          <p className="text-[6px] font-futura uppercase -mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>ONE MASTER PACK · PER-CHANNEL ADAPTATIONS</p>
          {(['instagram', 'journal', 'email', 'lounge-tv'] as DistributionChannelId[]).map((chId) => {
            const ver = p.channelVersions[chId] ?? { caption: '', cta: '', thumbnail: '', metadata: '' };
            const ch = channels.find((c) => c.id === chId);
            return (
              <div key={chId} className="p-3 border space-y-2" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${ch?.accentHex ?? p.accentHex}` }}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{ch?.name ?? chId}</p>
                <AdminStudioEditableField label="CAPTION" value={ver.caption} onChange={(v) => updateChannelVersion(p.id, chId, 'caption', v)} accentHex={p.accentHex} multiline />
                <AdminStudioEditableField label="CTA" value={ver.cta} onChange={(v) => updateChannelVersion(p.id, chId, 'cta', v)} accentHex={p.accentHex} />
                <AdminStudioEditableField label="THUMBNAIL" value={ver.thumbnail} onChange={(v) => updateChannelVersion(p.id, chId, 'thumbnail', v)} accentHex={p.accentHex} />
                <AdminStudioEditableField label="METADATA" value={ver.metadata} onChange={(v) => updateChannelVersion(p.id, chId, 'metadata', v)} accentHex={p.accentHex} />
              </div>
            );
          })}
        </div>
      ) : null}

      {activeTab === 'approval' ? (
        <div className="mt-3 space-y-2">
          <AdminStudioSectionHeading>APPROVAL PIPELINE</AdminStudioSectionHeading>
          <div className="flex flex-wrap gap-1">
            {DISTRIBUTION_APPROVAL_STATUSES.map((st) => (
              <button key={st} type="button" onClick={() => setApprovalStatus(p.id, st)} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ fontWeight: 515, color: p.approvalStatus === st ? '#FFF' : ADMIN_STUDIO_THEME.textSecondary, background: p.approvalStatus === st ? p.accentHex : 'rgba(255,255,255,0.8)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                {st.replace('-', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === 'delivery' ? (
        <div className="mt-3 space-y-2">
          <AdminStudioSectionHeading>DELIVERY STATUS</AdminStudioSectionHeading>
          <div className="flex flex-wrap gap-1">
            {DISTRIBUTION_DELIVERY_STATUSES.map((st) => (
              <button key={st} type="button" onClick={() => setDeliveryStatus(p.id, st)} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ fontWeight: 515, color: p.deliveryStatus === st ? '#FFF' : ADMIN_STUDIO_THEME.textSecondary, background: p.deliveryStatus === st ? p.accentHex : 'rgba(255,255,255,0.8)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                {st.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="p-2.5 border mt-3" style={{ background: ADMIN_STUDIO_THEME.selectedBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>MANUAL PUBLISHING — CONNECTORS NOT CONNECTED</p>
          </div>
        </div>
      ) : null}

      {activeTab === 'analytics' ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {DISTRIBUTION_ANALYTICS_METRICS.map((m) => (
            <AdminStudioCreativeWidget key={m.key} label={m.label} value={p[m.key]} accentHex={p.accentHex} />
          ))}
          <AdminStudioCreativeWidget label="TOP CHANNEL" value="LOUNGE TV" accentHex={p.accentHex} className="col-span-2" />
        </div>
      ) : null}

      {activeTab === 'social-publish' ? (
        <AdminStudioDistributionSocialPublishPanel
          pack={p}
          packApproved={p.approvalStatus === 'approved'}
          onOpenSocialAccounts={() => navigate(toModule('social-accounts'))}
        />
      ) : null}

      <AdminStudioDisclaimerFooter>ONE MASTER CONTENT PACK · MULTI-CHANNEL ADAPTATION · APPROVED POSTS ONLY</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
