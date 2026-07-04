import type { AssetDirectorCard, AssetDirectorStatus, AssetHealthIndicator } from '../../../utils/adminStudioAssetDirectorDemo';
import {
  ASSET_DIRECTOR_STATUS_LABELS,
  ASSET_HEALTH_LABELS,
} from '../../../utils/adminStudioAssetDirectorDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

const STATUS_COLORS: Record<AssetDirectorStatus, string> = {
  approved: '#16A34A',
  'needs-review': '#CA8A04',
  outdated: '#6B7280',
  'in-use': '#2563EB',
  archived: '#9CA3AF',
  draft: '#EB1C24',
};

type AdminStudioAssetDirectorCardProps = {
  asset: AssetDirectorCard;
  onClick?: () => void;
  compact?: boolean;
};

/** Premium visual asset card — preview, status, health, usage. */
export function AdminStudioAssetDirectorCard({ asset, onClick, compact }: AdminStudioAssetDirectorCardProps) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`group relative w-full text-left overflow-hidden transition-transform duration-300 ${onClick ? 'active:scale-[0.98]' : ''} bg-white/85 border shadow-md`}
      style={{
        aspectRatio: compact ? '1 / 1' : '4 / 5',
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        borderWidth: '1.3px',
      }}
    >
      <img
        src={asset.previewSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-300"
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, transparent 10%, rgba(255,255,255,0.88) 60%, #FFFFFF 100%)',
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: asset.accentHex }} />
      <div
        className="absolute top-2 left-2 px-1.5 py-0.5 text-[5px] font-futura uppercase z-10 bg-white/95"
        style={{ fontWeight: 515, border: `1px solid ${asset.accentHex}66`, color: asset.accentHex }}
      >
        {asset.category}
      </div>
      <div
        className="absolute top-2 right-2 px-1.5 py-0.5 text-[5px] font-futura uppercase z-10 bg-white/95"
        style={{
          fontWeight: 515,
          border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}`,
          color: STATUS_COLORS[asset.status],
        }}
      >
        {ASSET_DIRECTOR_STATUS_LABELS[asset.status]}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
        <p
          className={`${compact ? 'text-[9px]' : 'text-[11px]'} leading-tight mb-0.5`}
          style={{
            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
            color: ADMIN_STUDIO_THEME.textPrimary,
          }}
        >
          {asset.name}
        </p>
        {!compact ? (
          <>
            <p
              className="text-[5px] font-futura uppercase line-clamp-1"
              style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
            >
              USED BY: {asset.usedBy.join(' · ')}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-0.5">
              {asset.health.slice(0, 2).map((h: AssetHealthIndicator) => (
                <span
                  key={h}
                  className="px-1 py-0.5 text-[4px] font-futura uppercase"
                  style={{
                    fontWeight: 515,
                    color: h === 'ready-for-production' ? '#16A34A' : ADMIN_STUDIO_THEME.textSecondary,
                    background: 'rgba(255,255,255,0.9)',
                    border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}`,
                  }}
                >
                  {ASSET_HEALTH_LABELS[h]}
                </span>
              ))}
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-1">
              <p className="text-[4px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                v{asset.version.replace(/^v/, '')}
              </p>
              <p className="text-[4px] font-futura uppercase text-right" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {asset.lastUpdated}
              </p>
            </div>
          </>
        ) : null}
      </div>
    </Wrapper>
  );
}
