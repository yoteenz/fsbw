import type { AdminStudioAsset } from '../../../utils/adminStudioAssetLibraryDemo';
import { getAdminStudioAssetCategoryLabel } from '../../../utils/adminStudioAssetLibraryDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioAssetCardProps = {
  asset: AdminStudioAsset;
  isSelected: boolean;
  onClick: () => void;
};

export function AdminStudioAssetCard({ asset, isSelected, onClick }: AdminStudioAssetCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left overflow-hidden transition-all active:scale-[0.99] bg-white/80 border shadow-sm"
      style={{
        background: isSelected ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.85)',
        border: isSelected ? `1px solid ${ADMIN_STUDIO_THEME.accent}55` : `1px solid ${ADMIN_STUDIO_THEME.panelBorder}`,
      }}
    >
      {asset.previewSrc ? (
        <div className="relative overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
          <img src={asset.previewSrc} alt="" className="w-full h-full object-cover opacity-90" />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(180deg, transparent 50%, ${asset.accentHex}33 100%)` }}
          />
        </div>
      ) : (
        <div
          className="flex items-center justify-center"
          style={{
            aspectRatio: '16 / 9',
            background: `linear-gradient(135deg, ${asset.accentHex}15, ${ADMIN_STUDIO_THEME.panelBg})`,
          }}
        >
          <span
            className="text-[8px] font-futura uppercase px-2 py-1 bg-white"
            style={{ fontWeight: 515, color: asset.accentHex, border: `1px solid ${asset.accentHex}55` }}
          >
            {asset.format}
          </span>
        </div>
      )}
      <div className="p-2">
        <p
          className="text-[8px] truncate mb-0.5"
          style={{
            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
            color: isSelected ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textPrimary,
          }}
        >
          {asset.name}
        </p>
        <p
          className="text-[6px] font-futura uppercase truncate"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
        >
          {getAdminStudioAssetCategoryLabel(asset.categoryId)}
        </p>
      </div>
    </button>
  );
}
