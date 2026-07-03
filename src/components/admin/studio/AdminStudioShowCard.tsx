import type { AdminStudioShow } from '../../../utils/adminStudioShowsDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioShowCardProps = {
  show: AdminStudioShow;
  onClick: () => void;
};

/** Premium program card — light frosted tile with thumbnail hero. */
export function AdminStudioShowCard({ show, onClick }: AdminStudioShowCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full text-left overflow-hidden transition-transform duration-300 active:scale-[0.98] bg-white/80 border border-black/15 shadow-md"
      style={{ aspectRatio: '3 / 4', borderWidth: '1.3px' }}
    >
      <img
        src={show.thumbnailSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 25%, rgba(255,255,255,0.92) 75%, #FFFFFF 100%)`,
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: show.accentHex }}
      />
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <p
          className="text-[11px] leading-tight mb-1"
          style={{
            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
            color: ADMIN_STUDIO_THEME.textPrimary,
          }}
        >
          {show.name}
        </p>
        <p
          className="text-[7px] font-futura uppercase line-clamp-2"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}
        >
          {show.publishingFrequency}
        </p>
        <p
          className="mt-1.5 text-[7px] font-futura uppercase"
          style={{ fontWeight: 515, color: show.accentHex }}
        >
          {show.host}
        </p>
      </div>
      <div
        className="absolute top-2 right-2 px-1.5 py-0.5 text-[6px] font-futura uppercase z-10 bg-white/90"
        style={{
          fontWeight: 515,
          border: `1px solid ${show.accentHex}66`,
          color: ADMIN_STUDIO_THEME.textPrimary,
        }}
      >
        RECURRING
      </div>
    </button>
  );
}
