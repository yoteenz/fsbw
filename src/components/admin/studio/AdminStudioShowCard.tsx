import type { AdminStudioShow } from '../../../utils/adminStudioShowsDemo';

type AdminStudioShowCardProps = {
  show: AdminStudioShow;
  onClick: () => void;
};

/** Premium streaming program card for Studio SHOWS grid. */
export function AdminStudioShowCard({ show, onClick }: AdminStudioShowCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full text-left overflow-hidden transition-transform duration-300 active:scale-[0.98]"
      style={{
        aspectRatio: '3 / 4',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.6) 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <img
        src={show.thumbnailSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-85 transition-opacity duration-300"
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 30%, ${show.accentHex}88 85%, #0a0a0a 100%)`,
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
            color: '#FFFFFF',
          }}
        >
          {show.name}
        </p>
        <p
          className="text-[7px] font-futura uppercase line-clamp-2"
          style={{ fontWeight: 515, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}
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
        className="absolute top-2 right-2 px-1.5 py-0.5 text-[6px] font-futura uppercase z-10"
        style={{
          fontWeight: 515,
          background: 'rgba(0,0,0,0.55)',
          border: `1px solid ${show.accentHex}66`,
          color: '#FFFFFF',
        }}
      >
        RECURRING
      </div>
    </button>
  );
}
