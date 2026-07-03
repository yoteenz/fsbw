import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioFilterBarProps<T extends string> = {
  items: Array<{ id: T; label: string }>;
  activeId: T;
  onChange: (id: T) => void;
  accentHex?: string;
};

export function AdminStudioFilterBar<T extends string>({
  items,
  activeId,
  onChange,
  accentHex = ADMIN_STUDIO_THEME.accent,
}: AdminStudioFilterBarProps<T>) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-2 mb-4 -mx-1 px-1" style={{ scrollbarWidth: 'thin' }}>
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className="flex-shrink-0 px-2 py-1 text-[7px] font-futura uppercase whitespace-nowrap"
            style={{
              fontWeight: 515,
              color: isActive ? ADMIN_STUDIO_THEME.textPrimary : ADMIN_STUDIO_THEME.textSecondary,
              background: isActive ? ADMIN_STUDIO_THEME.chipActiveBg : ADMIN_STUDIO_THEME.chipInactiveBg,
              borderBottom: isActive ? `2px solid ${accentHex}` : '2px solid transparent',
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
