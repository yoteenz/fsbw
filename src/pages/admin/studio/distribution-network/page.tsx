import type { DragEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioDistributionChannelCard } from '../../../../components/admin/studio/AdminStudioDistributionChannelCard';
import { AdminStudioDistributionPackCard } from '../../../../components/admin/studio/AdminStudioDistributionPackCard';
import { AdminStudioCreativeWidget } from '../../../../components/admin/studio/AdminStudioCreativeWidget';
import { useAdminStudioDistributionNetwork } from '../../../../hooks/useAdminStudioDistributionNetworkState';
import {
  ADMIN_STUDIO_DISTRIBUTION_NETWORK_SUBTITLE,
  ADMIN_STUDIO_DISTRIBUTION_CAMPAIGNS,
  DISTRIBUTION_CALENDAR_SLOTS,
  DISTRIBUTION_CALENDAR_VIEWS,
  DISTRIBUTION_DASHBOARD_SECTIONS,
  DISTRIBUTION_FUTURE_CHANNELS,
  DISTRIBUTION_INHERITANCE_CHAIN,
  type DistributionCalendarSlotId,
  type DistributionCalendarView,
} from '../../../../utils/adminStudioDistributionNetworkDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioDistributionNetworkPage() {
  const navigate = useNavigate();
  const { packs, channels, packsBySlot, moveToSlot, addPack, draggedPackId, setDraggedPackId } = useAdminStudioDistributionNetwork();
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [calendarView, setCalendarView] = useState<DistributionCalendarView>('weekly');

  const activeChannels = channels.filter((c) => c.activation === 'ACTIVE');
  const comingSoonChannels = channels.filter((c) => c.activation !== 'ACTIVE');

  const handleAdd = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const id = addPack(trimmed);
    setNewTitle('');
    setAdding(false);
    navigate(`/admin/studio/distribution-network/${id}`);
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

  return (
    <AdminStudioStageShell
      title="DISTRIBUTION NETWORK"
      subtitle={ADMIN_STUDIO_DISTRIBUTION_NETWORK_SUBTITLE}
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          BROADCASTING DEPARTMENT — ONE MASTER PACK · EVERY DESTINATION · MANUAL PUBLISHING ONLY
        </p>
        <div className="flex flex-col items-center gap-0">
          {DISTRIBUTION_INHERITANCE_CHAIN.map((step, i) => (
            <div key={step} className="w-full flex flex-col items-center">
              {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
              <div
                className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border"
                style={{
                  fontWeight: 515,
                  color: step === 'DISTRIBUTION NETWORK' ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                  background: step === 'DISTRIBUTION NETWORK' ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdminStudioSectionHeading>DISTRIBUTION DASHBOARD</AdminStudioSectionHeading>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {DISTRIBUTION_DASHBOARD_SECTIONS.map((section) => {
          const metric =
            section.id === 'failed-deliveries' ? String(failedCount)
            : section.id === 'approval-queue' ? String(approvalCount)
            : section.id === 'channel-status' ? `${activeChannels.length}/${channels.length}`
            : section.metric;
          return (
            <div key={section.id} className="p-2.5 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{section.title}</p>
              <p className="text-[14px] leading-none mt-1" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>{metric}</p>
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>{section.description}</p>
            </div>
          );
        })}
      </div>

      <AdminStudioSectionHeading>CHANNEL LIBRARY — ACTIVE</AdminStudioSectionHeading>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {activeChannels.map((ch) => (
          <AdminStudioDistributionChannelCard key={ch.id} channel={ch} onClick={() => navigate(`/admin/studio/distribution-network/channel/${ch.id}`)} />
        ))}
      </div>

      <AdminStudioSectionHeading>COMING SOON</AdminStudioSectionHeading>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {comingSoonChannels.map((ch) => (
          <AdminStudioDistributionChannelCard key={ch.id} channel={ch} onClick={() => navigate(`/admin/studio/distribution-network/channel/${ch.id}`)} />
        ))}
      </div>

      <AdminStudioSectionHeading>PUBLISHING CALENDAR</AdminStudioSectionHeading>
      <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
        {DISTRIBUTION_CALENDAR_VIEWS.map((v) => (
          <button key={v.id} type="button" onClick={() => setCalendarView(v.id)} className="shrink-0 px-2 py-1 text-[6px] font-futura uppercase border" style={{ fontWeight: 515, color: calendarView === v.id ? '#FFF' : ADMIN_STUDIO_THEME.textSecondary, background: calendarView === v.id ? ADMIN_STUDIO_THEME.accent : 'rgba(255,255,255,0.7)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            {v.label}
          </button>
        ))}
      </div>
      <p className="text-[6px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {calendarView.toUpperCase()} VIEW · DRAG PACKS TO RESCHEDULE
      </p>
      <div className="overflow-x-auto -mx-1 px-1 pb-2 mb-4" style={{ scrollbarWidth: 'thin' }}>
        <div className="flex gap-2 min-w-max">
          {DISTRIBUTION_CALENDAR_SLOTS.map((slot) => {
            const slotPacks = packsBySlot[slot.id] ?? [];
            return (
              <div
                key={slot.id}
                onDragOver={handleDragOver}
                onDrop={handleDrop(slot.id)}
                className="flex-shrink-0 w-[88px] min-h-[160px] p-1.5 border bg-white/60"
                style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: slot.id === 'fri-pm' ? `2px solid ${ADMIN_STUDIO_THEME.accent}` : undefined }}
              >
                <p className="text-[6px] font-futura uppercase mb-1.5" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{slot.label}</p>
                <div className="space-y-1">
                  {slotPacks.map((pack) => (
                    <AdminStudioDistributionPackCard
                      key={pack.id}
                      pack={pack}
                      compact
                      draggable
                      onDragStart={() => setDraggedPackId(pack.id)}
                      onClick={() => navigate(`/admin/studio/distribution-network/${pack.id}`)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AdminStudioSectionHeading>CAMPAIGN DISTRIBUTION</AdminStudioSectionHeading>
      <div className="space-y-2 mb-4">
        {ADMIN_STUDIO_DISTRIBUTION_CAMPAIGNS.map((campaign) => (
          <div key={campaign.id} className="p-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `3px solid ${campaign.accentHex}` }}>
            <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{campaign.title}</p>
            <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{campaign.description}</p>
            <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: campaign.accentHex }}>{campaign.timeline}</p>
            {campaign.reusable ? (
              <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: '#16A34A' }}>REUSABLE CAMPAIGN</p>
            ) : null}
          </div>
        ))}
      </div>

      <AdminStudioSectionHeading>DISTRIBUTION QUEUE</AdminStudioSectionHeading>
      <p className="text-[7px] font-futura uppercase -mt-2 mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {packs.length} PACKS · TAP TO ROUTE & PUBLISH
      </p>
      <div className="space-y-2 mb-4">
        {packs.map((pack) => (
          <AdminStudioDistributionPackCard key={pack.id} pack={pack} draggable onDragStart={() => setDraggedPackId(pack.id)} onClick={() => navigate(`/admin/studio/distribution-network/${pack.id}`)} />
        ))}
      </div>

      <AdminStudioSectionHeading>FUTURE CHANNELS</AdminStudioSectionHeading>
      <div className="p-2.5 mb-4 border" style={{ background: 'rgba(255,255,255,0.5)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.6 }}>
          {DISTRIBUTION_FUTURE_CHANNELS.join(' · ')}
        </p>
        <p className="text-[5px] font-futura uppercase mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>ARCHITECTURE READY — PLUG IN WITHOUT REBUILD</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <AdminStudioCreativeWidget label="PUBLISHED" value={String(packs.filter((p) => p.approvalStatus === 'published').length)} accentHex="#16A34A" />
        <AdminStudioCreativeWidget label="SCHEDULED" value={String(packs.filter((p) => p.approvalStatus === 'scheduled').length)} accentHex="#2563EB" />
        <AdminStudioCreativeWidget label="FAILED" value={String(failedCount)} accentHex={ADMIN_STUDIO_THEME.accent} />
        <AdminStudioCreativeWidget label="CHANNEL UTIL" value="78%" accentHex={ADMIN_STUDIO_THEME.accent} />
      </div>

      {adding ? (
        <div className="mb-4 space-y-2">
          <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="APPROVED CONTENT PACK TITLE" className="w-full bg-white border text-black text-[10px] font-futura uppercase px-3 py-2 outline-none" style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.inputBorder }} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setAdding(false)} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>CANCEL</button>
            <button type="button" onClick={handleAdd} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: '#FFF', background: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>ADD TO QUEUE</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="w-full mb-4 py-2.5 text-[7px] font-futura uppercase border border-dashed" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: `${ADMIN_STUDIO_THEME.accent}66` }}>+ ADD DISTRIBUTION PACK</button>
      )}

      <div className="flex gap-2">
        <button type="button" onClick={() => navigate('/admin/studio/ai-production-engine')} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>← AI PRODUCTION</button>
        <button type="button" onClick={() => navigate('/admin/studio/publishing-queue')} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>PUBLISHING QUEUE →</button>
      </div>

      <button
        type="button"
        onClick={() => navigate('/admin/studio/social-accounts')}
        className="w-full mt-2 py-2 text-[7px] font-futura uppercase border"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
      >
        SOCIAL ACCOUNTS SETTINGS →
      </button>

      <AdminStudioDisclaimerFooter>OFFICIAL OAUTH SOCIAL CONNECTORS · ADMIN APPROVAL REQUIRED · NO AUTO-PUBLISH</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
