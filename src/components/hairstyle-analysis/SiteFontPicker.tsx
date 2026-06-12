import { SITE_FONT_OPTIONS, siteFontById } from '../../utils/siteFonts';

type SiteFontPickerProps = {
  valueId: string;
  onChange: (fontId: string) => void;
  previewText?: string;
  previewColor?: string;
  label?: string;
};

export default function SiteFontPicker({
  valueId,
  onChange,
  previewText = '98%',
  previewColor = '#EB1C24',
  label = 'Overall score font',
}: SiteFontPickerProps) {
  const selected = siteFontById(valueId) ?? SITE_FONT_OPTIONS[2];

  return (
    <div className="flex flex-col gap-2 border border-black/10 bg-white/80 p-3">
      <label className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.14em] text-[#808080]">
        {label}
        <select
          value={valueId}
          onChange={(e) => onChange(e.target.value)}
          className="border border-black bg-white px-2 py-2 text-black text-[11px] normal-case"
        >
          {SITE_FONT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div
        className="flex min-h-[72px] flex-col items-center justify-center gap-1 rounded border border-black/15 bg-white px-3 py-3"
        aria-live="polite"
      >
        <p
          style={{
            margin: 0,
            fontFamily: selected.fontFamily,
            color: previewColor,
            textTransform: selected.textTransform,
            fontSize: 'clamp(22px, 8cqw, 34px)',
            lineHeight: 1.1,
            textAlign: 'center',
          }}
        >
          {previewText}
        </p>
        <p className="text-[8px] uppercase tracking-[0.12em] text-[#808080]">{selected.label}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SITE_FONT_OPTIONS.map((option) => {
          const active = option.id === valueId;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`min-w-[52px] rounded border px-2 py-2 text-center transition-colors ${
                active ? 'border-[#eb1c24] bg-[#fff5f5]' : 'border-black/20 bg-white hover:border-black/40'
              }`}
              title={option.label}
              style={{
                fontFamily: option.fontFamily,
                color: previewColor,
                textTransform: option.textTransform,
                fontSize: '16px',
                lineHeight: 1,
              }}
            >
              98%
            </button>
          );
        })}
      </div>
    </div>
  );
}
