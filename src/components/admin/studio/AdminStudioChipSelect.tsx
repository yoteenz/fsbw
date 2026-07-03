type AdminStudioChipSelectProps = {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (item: string) => void;
  accentHex?: string;
};

/** Multi-select chip rail for Studio forms. */
export function AdminStudioChipSelect({
  label,
  options,
  selected,
  onToggle,
  accentHex = '#EB1C24',
}: AdminStudioChipSelectProps) {
  return (
    <div>
      <p
        className="text-[8px] font-futura uppercase mb-2 tracking-wider"
        style={{ fontWeight: 515, color: '#9A9A9A' }}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isOn = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className="px-2 py-1 text-[7px] font-futura uppercase transition-all"
              style={{
                fontWeight: 515,
                color: isOn ? '#FFFFFF' : '#9A9A9A',
                background: isOn ? `${accentHex}44` : 'rgba(255,255,255,0.04)',
                border: isOn ? `1px solid ${accentHex}` : '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
