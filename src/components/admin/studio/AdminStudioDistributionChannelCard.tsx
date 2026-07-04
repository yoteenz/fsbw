import type { DistributionChannel } from '../../../utils/adminStudioDistributionNetworkDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioDistributionChannelCardProps = {
  channel: DistributionChannel;
  onClick?: () => void;
  selected?: boolean;
};

export function AdminStudioDistributionChannelCard({ channel, onClick, selected }: AdminStudioDistributionChannelCardProps) {
  const Wrapper = onClick ? 'button' : 'div';
  const isFuture = channel.activation !== 'ACTIVE';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="w-full text-left p-2.5 border transition-transform active:scale-[0.98]"
      style={{
        background: selected ? ADMIN_STUDIO_THEME.selectedBg : ADMIN_STUDIO_THEME.panelBg,
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        borderLeft: `3px solid ${isFuture ? '#9CA3AF' : channel.accentHex}`,
        opacity: isFuture ? 0.85 : 1,
      }}
    >
      <div className="flex justify-between items-start gap-2">
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, lineHeight: 1.35 }}>
          {channel.name}
        </p>
        <span className="text-[5px] font-futura uppercase shrink-0" style={{ fontWeight: 515, color: isFuture ? '#9CA3AF' : '#16A34A' }}>
          {channel.activation === 'ACTIVE' ? 'ACTIVE' : 'SOON'}
        </span>
      </div>
      <p className="text-[5px] font-futura uppercase mt-1 line-clamp-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
        {channel.purpose}
      </p>
      <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: channel.accentHex }}>
        QUEUE {channel.queueLength} · SUCCESS {channel.successRate}
      </p>
    </Wrapper>
  );
}
