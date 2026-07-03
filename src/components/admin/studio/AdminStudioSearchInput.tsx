type AdminStudioSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

/** Dark-stage search field — shared across library modules. */
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
      className="w-full bg-white/5 border border-white/15 text-white text-[9px] font-futura uppercase px-3 py-2.5 outline-none focus:border-white/40 placeholder:text-white/25 mb-3"
      style={{ fontWeight: 515 }}
    />
  );
}
