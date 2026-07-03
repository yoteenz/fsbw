type AdminStudioFilterBarProps<T extends string> = {
  items: Array<{ id: T; label: string }>;
  activeId: T;
  onChange: (id: T) => void;
  accentHex?: string;
};

/** Horizontal filter/tab rail — replaces duplicated inline button rows. */
export function AdminStudioFilterBar<T extends string>({
  items,
  activeId,
  onChange,
  accentHex = '#EB1C24',
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
              color: isActive ? '#FFFFFF' : '#9A9A9A',
              background: isActive ? `${accentHex}40` : 'rgba(255,255,255,0.04)',
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
