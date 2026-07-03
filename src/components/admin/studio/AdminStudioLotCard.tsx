import type { StudioLotEntry } from '../../../utils/adminStudioStudioLotDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

const STATUS_LABELS: Record<StudioLotEntry['status'], string> = {
  active: 'ACTIVE',
  'in-development': 'IN DEV',
  archived: 'ARCHIVED',
  future: 'FUTURE',
};

type AdminStudioLotCardProps = {
  studio: StudioLotEntry;
  onClick: () => void;
};

/** Studio Lot directory card — virtual production campus tile. */
export function AdminStudioLotCard({ studio, onClick }: AdminStudioLotCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full text-left overflow-hidden transition-transform duration-300 active:scale-[0.98] bg-white/80 border border-black/15 shadow-md"
      style={{ aspectRatio: '4 / 5', borderWidth: '1.3px' }}
    >
      <img
        src={studio.artworkSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-300"
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 15%, rgba(255,255,255,0.82) 65%, #FFFFFF 100%)`,
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: studio.accentHex }} />
      <div
        className="absolute top-2 left-2 px-1.5 py-0.5 text-[6px] font-futura uppercase z-10 bg-white/95"
        style={{ fontWeight: 515, border: `1px solid ${studio.accentHex}88`, color: studio.accentHex }}
      >
        ON SET
      </div>
      <div
        className="absolute top-2 right-2 px-1.5 py-0.5 text-[6px] font-futura uppercase z-10 bg-white/90"
        style={{
          fontWeight: 515,
          border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}`,
          color: studio.status === 'active' ? '#16A34A' : ADMIN_STUDIO_THEME.textSecondary,
        }}
      >
        {STATUS_LABELS[studio.status]}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <p
          className="text-[11px] leading-tight mb-1"
          style={{
            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
            color: ADMIN_STUDIO_THEME.textPrimary,
          }}
        >
          {studio.studioName}
        </p>
        <p
          className="text-[7px] font-futura uppercase line-clamp-2"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}
        >
          {studio.purpose}
        </p>
        <p
          className="mt-1 text-[6px] font-futura uppercase line-clamp-1"
          style={{ fontWeight: 515, color: studio.accentHex }}
        >
          {studio.primaryShows}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-1">
          <p className="text-[5px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            ASSETS {studio.assetCount}
          </p>
          <p className="text-[5px] font-futura uppercase text-right" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            UPD {studio.lastUpdated}
          </p>
          <p className="text-[5px] font-futura uppercase col-span-2 line-clamp-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            {studio.lightingProfileSummary} · {studio.cameraPresetsSummary}
          </p>
        </div>
      </div>
    </button>
  );
}
