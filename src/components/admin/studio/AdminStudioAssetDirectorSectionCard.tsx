import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioAssetDirectorSectionCardProps = {
  title: string;
  metric: string;
  description: string;
  accentHex: string;
  onClick: () => void;
};

/** Asset Director landing section tile — visual department navigation. */
export function AdminStudioAssetDirectorSectionCard({
  title,
  metric,
  description,
  accentHex,
  onClick,
}: AdminStudioAssetDirectorSectionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full text-left overflow-hidden transition-transform duration-300 active:scale-[0.98] border shadow-md"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.75) 100%)',
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        borderWidth: '1.3px',
        borderTop: `2px solid ${accentHex}`,
        minHeight: '88px',
      }}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-[10px] leading-tight flex-1"
            style={{
              fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
              color: ADMIN_STUDIO_THEME.textPrimary,
            }}
          >
            {title}
          </p>
          <span
            className="text-[11px] flex-shrink-0"
            style={{
              fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
              color: accentHex,
            }}
          >
            {metric}
          </span>
        </div>
        <p
          className="mt-1.5 text-[6px] font-futura uppercase line-clamp-2"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}
        >
          {description}
        </p>
      </div>
    </button>
  );
}
