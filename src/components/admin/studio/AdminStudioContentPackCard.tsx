import type { AdminStudioContentPack } from '../../../utils/adminStudioContentPacksDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioContentPackCardProps = {
  pack: AdminStudioContentPack;
  onClick: () => void;
};

export function AdminStudioContentPackCard({ pack, onClick }: AdminStudioContentPackCardProps) {
  const statusColor =
    pack.status === 'PUBLISHED' ? '#16A34A' : pack.status === 'IN REVIEW' ? '#CA8A04' : ADMIN_STUDIO_THEME.textSecondary;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full text-left overflow-hidden transition-all duration-300 active:scale-[0.99] bg-white/80 border border-black/15 shadow-md"
      style={{ borderWidth: '1.3px' }}
    >
      <div className="flex gap-0">
        <div
          className="relative flex-shrink-0 overflow-hidden"
          style={{ width: '38%', aspectRatio: '1' }}
        >
          <img
            src={pack.thumbnailSrc}
            alt=""
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${pack.accentHex}22, transparent 60%)` }}
          />
        </div>
        <div className="flex-1 p-3 min-w-0 flex flex-col justify-between">
          <div>
            <p
              className="text-[10px] leading-tight mb-1 truncate"
              style={{
                fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                color: ADMIN_STUDIO_THEME.textPrimary,
              }}
            >
              {pack.title}
            </p>
            <p
              className="text-[7px] font-futura uppercase line-clamp-2"
              style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}
            >
              {pack.subtitle}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2 gap-2">
            <span
              className="text-[6px] font-futura uppercase px-1.5 py-0.5"
              style={{
                fontWeight: 515,
                color: statusColor,
                border: `1px solid ${statusColor}55`,
                background: `${statusColor}12`,
              }}
            >
              {pack.status}
            </span>
            <span
              className="text-[6px] font-futura uppercase"
              style={{ fontWeight: 515, color: pack.accentHex }}
            >
              15 CHANNELS →
            </span>
          </div>
        </div>
      </div>
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${pack.accentHex}, transparent)` }} />
    </button>
  );
}
