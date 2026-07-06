import type { DragEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioDistributionChannelCard } from '../../../../components/admin/studio/AdminStudioDistributionChannelCard';
import { AdminStudioDistributionPackCard } from '../../../../components/admin/studio/AdminStudioDistributionPackCard';
import {
  ExecutiveCollapsibleSection,
  ExecutiveFocusPanel,
  ExecutiveHeroCard,
  ExecutiveIconNav,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
  ExecutiveSecondaryGrid,
  ExecutiveVisualSummary,
  eiaActionBtn,
  eiaCaption,
} from '../../../../components/admin/studio/executive-ia';
import { useEnsureNdxbookWorkspaceFromBrandParam } from '../../../../hooks/useEnsureNdxbookWorkspace';
import { useAdminStudioDistributionNetwork } from '../../../../hooks/useAdminStudioDistributionNetworkState';
import { useWorkspace } from '../../../../studio-os-core/context/WorkspaceProvider';
import {
  useOrganizationContext,
  useStudioModuleNav,
} from '../../../../studio-os-core/organization-context';
import {
  DISTRIBUTION_CALENDAR_SLOTS,
  DISTRIBUTION_CALENDAR_VIEWS,
  DISTRIBUTION_FUTURE_CHANNELS,
  DISTRIBUTION_INHERITANCE_CHAIN,
  type DistributionCalendarSlotId,
  type DistributionCalendarView,
} from '../../../../utils/adminStudioDistributionNetworkDemo';
import {
  getDistributionCampaignDefaults,
  getDistributionNetworkAccent,
  getDistributionNetworkSubtitle,
} from '../../../../utils/adminStudioDistributionNetworkOrgDefaults';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

type DistributionView = 'overview' | 'channels' | 'calendar' | 'queue' | 'social';

export default function AdminStudioDistributionNetworkPage() {
  useEnsureNdxbookWorkspaceFromBrandParam();
  const navigate = useNavigate();
  const { getModuleSubtitle } = useWorkspace();
  const { organizationId } = useOrganizationContext();
  const { toModule, studioEntry, organizationName } = useStudioModuleNav();
  const isNdxbook = organizationId === 'ai-media';
  const accent = getDistributionNetworkAccent();
  const subtitle =
    getModuleSubtitle('distribution-network') ?? getDistributionNetworkSubtitle();
  const campaigns = getDistributionCampaignDefaults();
  const { packs, channels, packsBySlot, moveToSlot, addPack, draggedPackId, setDraggedPackId } =
    useAdminStudioDistributionNetwork();
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [calendarView, setCalendarView] = useState<DistributionCalendarView>('weekly');
  const [activeView, setActiveView] = useState<DistributionView>('queue');

  const activeChannels = channels.filter((c) => c.activation === 'ACTIVE');
  const comingSoonChannels = channels.filter((c) => c.activation !== 'ACTIVE');

  const handleAdd = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const id = addPack(trimmed);
    setNewTitle('');
    setAdding(false);
    navigate(toModule(`distribution-network/${id}`));
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (slot: DistributionCalendarSlotId) => (e: DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedPackId;
    if (id) {
      moveToSlot(id, slot);
      setDraggedPackId(null);
    }
  };

  const failedCount = packs.filter((p) => p.deliveryStatus === 'failed' || p.deliveryStatus === 'retry').length;
  const approvalCount = packs.filter((p) => p.approvalStatus === 'needs-review' || p.approvalStatus === 'pending').length;
  const publishedCount = packs.filter((p) => p.approvalStatus === 'published').length;
  const scheduledCount = packs.filter((p) => p.approvalStatus === 'scheduled').length;

  const navItems = [
    {
      id: 'overview',
      icon: '📊',
      title: 'OVERVIEW',
      subtitle: `${packs.length} PACKS · ${activeChannels.length} CHANNELS`,
      status: failedCount > 0 ? ('attention' as const) : ('active' as const),
      onSelect: () => setActiveView('overview'),
    },
    {
      id: 'channels',
      icon: '🚀',
      title: 'CHANNELS',
      subtitle: `${activeChannels.length}/${channels.length} ACTIVE`,
      status: 'active' as const,
      onSelect: () => setActiveView('channels'),
    },
    {
      id: 'calendar',
      icon: '📅',
      title: 'CALENDAR',
      subtitle: `${scheduledCount} SCHEDULED`,
      status: scheduledCount > 0 ? ('active' as const) : ('idle' as const),
      onSelect: () => setActiveView('calendar'),
    },
    {
      id: 'queue',
      icon: '📤',
      title: 'QUEUE',
      subtitle: `${approvalCount} NEED REVIEW`,
      status: approvalCount > 0 ? ('attention' as const) : ('idle' as const),
      onSelect: () => setActiveView('queue'),
    },
    {
      id: 'social',
      icon: '🔗',
      title: 'SOCIAL',
      subtitle: 'OAUTH CONNECTORS',
      status: 'idle' as const,
      onSelect: () => navigate(toModule('social-accounts')),
    },
  ];

  return (
    <AdminStudioStageShell
      title={isNdxbook ? 'NDXBOOK DISTRIBUTION' : 'DISTRIBUTION NETWORK'}
      subtitle={subtitle}
      breadcrumbParentLabel={organizationName}
      breadcrumbParentPath={studioEntry}
      onBack={() => navigate(studioEntry)}
    >
      <ExecutivePageShell>
        {isNdxbook ? (
          <div className="p-2 border flex flex-wrap gap-1" style={{ background: 'rgba(99,102,241,0.06)', borderColor: '#6366F1' }}>
            <button
              type="button"
              onClick={() => navigate(toModule('social-accounts'))}
              className="flex-1 py-1.5 text-[6px] font-futura uppercase border"
              style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
            >
              SOCIAL CONNECTORS →
            </button>
          </div>
        ) : null}

        <ExecutiveHeroCard
          eyebrow="CAMPAIGN STATUS · DISTRIBUTION DEPARTMENT"
          title={isNdxbook ? 'NDXBOOK PUBLISHING' : 'DISTRIBUTION NETWORK'}
          subtitle={
            isNdxbook
              ? 'OPEN A PACK → SOCIAL TAB → APPROVE → PUBLISH'
              : 'ONE MASTER PACK · EVERY DESTINATION · MANUAL PUBLISHING ONLY'
          }
          stats={[
            { label: 'IN QUEUE', value: String(packs.length) },
            { label: 'SCHEDULED', value: String(scheduledCount) },
            { label: 'PUBLISHED', value: String(publishedCount) },
            { label: 'NEEDS REVIEW', value: String(approvalCount) },
          ]}
        />

        <ExecutiveIconNav label="DISTRIBUTION DEPARTMENTS" items={navItems} activeId={activeView} />

        <ExecutiveVisualSummary title="PUBLISHING CALENDAR · DRAG PACKS TO RESCHEDULE">
          <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
            {DISTRIBUTION_CALENDAR_VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setCalendarView(v.id)}
                className="shrink-0 px-2 py-1 text-[6px] font-futura uppercase border"
                style={{
                  fontWeight: 515,
                  color: calendarView === v.id ? '#FFF' : ADMIN_STUDIO_THEME.textSecondary,
                  background: calendarView === v.id ? ADMIN_STUDIO_THEME.accent : 'rgba(255,255,255,0.7)',
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto -mx-1 px-1 pb-1" style={{ scrollbarWidth: 'thin' }}>
            <div className="flex gap-2 min-w-max">
              {DISTRIBUTION_CALENDAR_SLOTS.map((slot) => {
                const slotPacks = packsBySlot[slot.id] ?? [];
                return (
                  <div
                    key={slot.id}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop(slot.id)}
                    className="flex-shrink-0 w-[88px] min-h-[140px] p-1.5 border bg-white/60"
                    style={{
                      borderColor: ADMIN_STUDIO_THEME.panelBorder,
                      borderTop: slot.id === 'fri-pm' ? `2px solid ${ADMIN_STUDIO_THEME.accent}` : undefined,
                    }}
                  >
                    <p className="text-[6px] font-futura uppercase mb-1.5" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                      {slot.label}
                    </p>
                    <div className="space-y-1">
                      {slotPacks.map((pack) => (
                        <AdminStudioDistributionPackCard
                          key={pack.id}
                          pack={pack}
                          compact
                          draggable
                          onDragStart={() => setDraggedPackId(pack.id)}
                          onClick={() => navigate(toModule(`distribution-network/${pack.id}`))}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ExecutiveVisualSummary>

        {(activeView === 'queue' || activeView === 'overview') && (
          <ExecutiveFocusPanel
            title="TODAY'S DISTRIBUTION QUEUE"
            subtitle={`${packs.length} PACKS AWAITING ROUTING`}
            highlight={approvalCount > 0 ? `${approvalCount} PACKS NEED APPROVAL BEFORE SCHEDULE` : undefined}
          >
            <div className="space-y-2">
              {packs.slice(0, 6).map((pack) => (
                <AdminStudioDistributionPackCard
                  key={pack.id}
                  pack={pack}
                  draggable
                  onDragStart={() => setDraggedPackId(pack.id)}
                  onClick={() => navigate(toModule(`distribution-network/${pack.id}`))}
                />
              ))}
            </div>
            {packs.length > 6 ? (
              <p style={{ ...eiaCaption, marginTop: 8 }}>+ {packs.length - 6} MORE IN FULL QUEUE BELOW</p>
            ) : null}
            {adding ? (
              <div className="mt-4 space-y-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="APPROVED CONTENT PACK TITLE"
                  className="w-full bg-white border text-black text-[10px] font-futura uppercase px-3 py-2 outline-none"
                  style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.inputBorder }}
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setAdding(false)} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                    CANCEL
                  </button>
                  <button type="button" onClick={handleAdd} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: '#FFF', background: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                    ADD TO QUEUE
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="w-full mt-4 py-2.5 text-[7px] font-futura uppercase border border-dashed"
                style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: `${ADMIN_STUDIO_THEME.accent}66` }}
              >
                + ADD DISTRIBUTION PACK
              </button>
            )}
          </ExecutiveFocusPanel>
        )}

        {(activeView === 'channels' || activeView === 'overview') && (
          <ExecutiveSecondaryGrid title="ACTIVE CHANNELS">
            {activeChannels.map((ch) => (
              <AdminStudioDistributionChannelCard
                key={ch.id}
                channel={ch}
                onClick={() => navigate(toModule(`distribution-network/channel/${ch.id}`))}
              />
            ))}
          </ExecutiveSecondaryGrid>
        )}

        <ExecutiveSecondaryGrid title="DELIVERY SNAPSHOT" columns={4}>
          <ExecutiveSecondaryCard title="PUBLISHED">
            <p className="text-[14px]" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: '#16A34A' }}>{publishedCount}</p>
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="SCHEDULED">
            <p className="text-[14px]" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: '#2563EB' }}>{scheduledCount}</p>
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="FAILED" accent={ADMIN_STUDIO_THEME.accent}>
            <p className="text-[14px]" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.accent }}>{failedCount}</p>
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="CHANNEL UTIL">
            <p className="text-[14px]" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>78%</p>
          </ExecutiveSecondaryCard>
        </ExecutiveSecondaryGrid>

        <ExecutiveCollapsibleSection
          title="COMING SOON CHANNELS"
          subtitle={`${comingSoonChannels.length} CHANNELS · ARCHITECTURE READY`}
        >
          <div className="grid grid-cols-2 gap-2">
            {comingSoonChannels.map((ch) => (
              <AdminStudioDistributionChannelCard key={ch.id} channel={ch} onClick={() => navigate(toModule(`distribution-network/channel/${ch.id}`))} />
            ))}
          </div>
        </ExecutiveCollapsibleSection>

        <ExecutiveCollapsibleSection title="CAMPAIGN DISTRIBUTION" subtitle={`${campaigns.length} ACTIVE CAMPAIGNS`}>
          <div className="space-y-2">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-3 border"
                style={{
                  background: ADMIN_STUDIO_THEME.panelBg,
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                  borderLeft: `3px solid ${campaign.accentHex}`,
                }}
              >
                <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
                  {campaign.title}
                </p>
                <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {campaign.description}
                </p>
                <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: campaign.accentHex }}>
                  {campaign.timeline}
                </p>
              </div>
            ))}
          </div>
        </ExecutiveCollapsibleSection>

        <ExecutiveCollapsibleSection title="FULL DISTRIBUTION QUEUE" subtitle={`${packs.length} PACKS · TAP TO ROUTE & PUBLISH`}>
          <div className="space-y-2">
            {packs.map((pack) => (
              <AdminStudioDistributionPackCard
                key={pack.id}
                pack={pack}
                draggable
                onDragStart={() => setDraggedPackId(pack.id)}
                onClick={() => navigate(toModule(`distribution-network/${pack.id}`))}
              />
            ))}
          </div>
        </ExecutiveCollapsibleSection>

        <ExecutiveCollapsibleSection title="PRODUCTION INHERITANCE CHAIN" subtitle="CONTENT FLOW INTO DISTRIBUTION">
          <div className="flex flex-col items-center gap-0">
            {DISTRIBUTION_INHERITANCE_CHAIN.map((step, i) => (
              <div key={step} className="w-full flex flex-col items-center">
                {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
                <div
                  className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border"
                  style={{
                    fontWeight: 515,
                    color: step === 'DISTRIBUTION NETWORK' ? accent : ADMIN_STUDIO_THEME.textSecondary,
                    background: step === 'DISTRIBUTION NETWORK' ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
                    borderColor: ADMIN_STUDIO_THEME.panelBorder,
                  }}
                >
                  {step}
                </div>
              </div>
            ))}
          </div>
        </ExecutiveCollapsibleSection>

        <ExecutiveCollapsibleSection title="FUTURE CHANNELS" subtitle="PLUG IN WITHOUT REBUILD">
          <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.6 }}>
            {DISTRIBUTION_FUTURE_CHANNELS.join(' · ')}
          </p>
        </ExecutiveCollapsibleSection>

        <div className="flex gap-2">
          <button type="button" onClick={() => navigate(toModule('ai-production-engine'))} style={eiaActionBtn} className="flex-1">
            ← AI PRODUCTION
          </button>
          <button type="button" onClick={() => navigate(toModule('publishing-queue'))} style={eiaActionBtn} className="flex-1">
            PUBLISHING QUEUE →
          </button>
        </div>

        <AdminStudioDisclaimerFooter>OFFICIAL OAUTH SOCIAL CONNECTORS · ADMIN APPROVAL REQUIRED · NO AUTO-PUBLISH</AdminStudioDisclaimerFooter>
      </ExecutivePageShell>
    </AdminStudioStageShell>
  );
}
