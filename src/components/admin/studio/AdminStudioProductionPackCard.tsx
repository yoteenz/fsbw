import type { ProductionContentPack } from '../../../utils/adminStudioProductionDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioProductionPackCardProps = {
  pack: ProductionContentPack;
  onClick: () => void;
  draggable?: boolean;
  onDragStart?: () => void;
};

export function AdminStudioProductionPackCard({ pack, onClick, draggable, onDragStart }: AdminStudioProductionPackCardProps) {
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={(e) => {
        e.stopPropagation();
        onDragStart?.();
      }}
      onClick={onClick}
      className="w-full text-left p-2.5 border transition-transform active:scale-[0.98] bg-white/90 cursor-grab active:cursor-grabbing"
      style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `3px solid ${pack.accentHex}` }}
    >
      <p className="text-[8px] font-futura uppercase line-clamp-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, lineHeight: 1.35 }}>
        {pack.title}
      </p>
      <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: pack.accentHex }}>
        {pack.showName || 'UNASSIGNED'}
      </p>
      <p className="text-[5px] font-futura uppercase mt-0.5" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {pack.analyticsAssetCompletion} ASSETS · UPD {pack.lastUpdated}
      </p>
    </button>
  );
}
