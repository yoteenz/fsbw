import type { AdminStudioContentPack } from '../../../utils/adminStudioContentPacksDemo';

type AdminStudioContentPackCardProps = {
  pack: AdminStudioContentPack;
  onClick: () => void;
};

/** Luxury content pack card — weekly multi-channel bundle. */
export function AdminStudioContentPackCard({ pack, onClick }: AdminStudioContentPackCardProps) {
  const statusColor =
    pack.status === 'PUBLISHED' ? '#4ADE80' : pack.status === 'IN REVIEW' ? '#FBBF24' : '#9A9A9A';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full text-left overflow-hidden transition-all duration-300 active:scale-[0.99]"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
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
            style={{ background: `linear-gradient(135deg, ${pack.accentHex}44, transparent 60%)` }}
          />
        </div>
        <div className="flex-1 p-3 min-w-0 flex flex-col justify-between">
          <div>
            <p
              className="text-[10px] leading-tight mb-1 truncate"
              style={{
                fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                color: '#FFFFFF',
              }}
            >
              {pack.title}
            </p>
            <p
              className="text-[7px] font-futura uppercase line-clamp-2"
              style={{ fontWeight: 515, color: '#9A9A9A', lineHeight: 1.45 }}
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
                background: `${statusColor}15`,
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
