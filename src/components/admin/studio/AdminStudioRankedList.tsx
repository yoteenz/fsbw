import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioRankedListProps = {
  title: string;
  items: Array<{ title: string; metric: string; format?: string }>;
  accentHex?: string;
};

export function AdminStudioRankedList({ title, items, accentHex = ADMIN_STUDIO_THEME.accent }: AdminStudioRankedListProps) {
  return (
    <div
      className="p-3 border bg-white/60"
      style={{
        background: ADMIN_STUDIO_THEME.panelBg,
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
      }}
    >
      <p
        className="text-[8px] font-futura uppercase mb-2 tracking-wider"
        style={{ fontWeight: 515, color: accentHex }}
      >
        {title}
      </p>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="flex items-start gap-2">
            <span
              className="flex-shrink-0 w-4 text-[7px] font-futura"
              style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
            >
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p
                className="text-[8px] truncate"
                style={{
                  fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                  color: ADMIN_STUDIO_THEME.textPrimary,
                }}
              >
                {item.title}
              </p>
              <p
                className="text-[6px] font-futura uppercase"
                style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
              >
                {item.format ? `${item.format} · ` : ''}
                {item.metric}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
