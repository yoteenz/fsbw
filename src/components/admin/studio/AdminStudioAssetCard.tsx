import type { AdminStudioAsset } from '../../../utils/adminStudioAssetLibraryDemo';
import { getAdminStudioAssetCategoryLabel } from '../../../utils/adminStudioAssetLibraryDemo';

type AdminStudioAssetCardProps = {
  asset: AdminStudioAsset;
  isSelected: boolean;
  onClick: () => void;
};

/** Premium asset tile for Studio Asset Library grid. */
export function AdminStudioAssetCard({ asset, isSelected, onClick }: AdminStudioAssetCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left overflow-hidden transition-all active:scale-[0.99]"
      style={{
        background: isSelected ? 'rgba(235,28,36,0.12)' : 'rgba(255,255,255,0.04)',
        border: isSelected ? '1px solid #EB1C2455' : '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {asset.previewSrc ? (
        <div className="relative overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
          <img src={asset.previewSrc} alt="" className="w-full h-full object-cover opacity-80" />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(180deg, transparent 50%, ${asset.accentHex}66 100%)` }}
          />
        </div>
      ) : (
        <div
          className="flex items-center justify-center"
          style={{
            aspectRatio: '16 / 9',
            background: `linear-gradient(135deg, ${asset.accentHex}22, rgba(0,0,0,0.4))`,
          }}
        >
          <span
            className="text-[8px] font-futura uppercase px-2 py-1"
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
            color: isSelected ? '#EB1C24' : '#FFFFFF',
          }}
        >
          {asset.name}
        </p>
        <p
          className="text-[6px] font-futura uppercase truncate"
          style={{ fontWeight: 515, color: '#9A9A9A' }}
        >
          {getAdminStudioAssetCategoryLabel(asset.categoryId)}
        </p>
      </div>
    </button>
  );
}
