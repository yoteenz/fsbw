type AdminStudioMetricTileProps = {
  label: string;
  value: string;
  accentHex?: string;
};

/** Luxury metric card for Studio Analytics. */
export function AdminStudioMetricTile({ label, value, accentHex = '#EB1C24' }: AdminStudioMetricTileProps) {
  return (
    <div
      className="p-3"
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderLeft: `2px solid ${accentHex}`,
      }}
    >
      <p
        className="text-[7px] font-futura uppercase mb-1 tracking-wider"
        style={{ fontWeight: 515, color: '#9A9A9A' }}
      >
        {label}
      </p>
      <p
        className="text-[14px] leading-none"
        style={{
          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
          color: '#FFFFFF',
        }}
      >
        {value}
      </p>
    </div>
  );
}
