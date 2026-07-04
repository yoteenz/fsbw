import type { DistributionPack } from '../../../utils/adminStudioDistributionNetworkDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioDistributionPackCardProps = {
  pack: DistributionPack;
  onClick: () => void;
  draggable?: boolean;
  onDragStart?: () => void;
  compact?: boolean;
};

const APPROVAL_COLORS: Record<DistributionPack['approvalStatus'], string> = {
  ready: '#9CA3AF',
  pending: '#CA8A04',
  'needs-review': '#CA8A04',
  approved: '#16A34A',
  scheduled: '#2563EB',
  publishing: '#EB1C24',
  published: '#16A34A',
  archived: '#6B7280',
};

const DELIVERY_COLORS: Record<DistributionPack['deliveryStatus'], string> = {
  queued: '#9CA3AF',
  publishing: '#EB1C24',
  published: '#16A34A',
  failed: '#EB1C24',
  retry: '#CA8A04',
  cancelled: '#6B7280',
};

export function AdminStudioDistributionPackCard({ pack, onClick, draggable, onDragStart, compact }: AdminStudioDistributionPackCardProps) {
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={(e) => {
        e.stopPropagation();
        onDragStart?.();
      }}
      onClick={onClick}
      className={`w-full text-left border transition-transform active:scale-[0.98] bg-white/90 ${compact ? 'p-1.5' : 'p-2.5'} ${draggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `3px solid ${pack.accentHex}` }}
    >
      <p className={`font-futura uppercase line-clamp-2 ${compact ? 'text-[6px]' : 'text-[8px]'}`} style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, lineHeight: 1.35 }}>
        {pack.title}
      </p>
      {!compact ? (
        <>
          <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: APPROVAL_COLORS[pack.approvalStatus] }}>
            {pack.approvalStatus.replace('-', ' ').toUpperCase()}
          </p>
          <p className="text-[5px] font-futura uppercase mt-0.5" style={{ fontWeight: 515, color: DELIVERY_COLORS[pack.deliveryStatus] }}>
            {pack.deliveryStatus.toUpperCase()} · {pack.routingChannels.length} CHANNELS
          </p>
        </>
      ) : null}
    </button>
  );
}
