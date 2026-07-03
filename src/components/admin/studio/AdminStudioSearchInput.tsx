import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function AdminStudioSearchInput({
  value,
  onChange,
  placeholder = 'SEARCH...',
}: AdminStudioSearchInputProps) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white border text-black text-[9px] font-futura uppercase px-3 py-2.5 outline-none focus:border-black/40 placeholder:text-black/25 mb-3"
      style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.inputBorder, borderWidth: '1px' }}
    />
  );
}
